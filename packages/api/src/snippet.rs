use serde::{Deserialize, Serialize, de::DeserializeOwned};
use uuid::Uuid;
use wasm_bindgen::JsValue;
use worker::{Env, Fetch, Headers, Method, Request, RequestInit, Response, Result};

const MAX_CODE_BYTES: usize = 100_000;
const MAX_TITLE_CHARS: usize = 200;
const SNIPPET_TTL_SECONDS: u64 = 60 * 60 * 24 * 90;

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct Snippet {
    id: String,
    code: String,
    title: String,
    language: String,
    mode: String,
    syntax_theme: String,
    aspect_ratio: String,
    image_format: String,
    frame_width: u16,
    font_size: u8,
    padding: u8,
    radius: u8,
    palette_index: u8,
    line_numbers: bool,
    title_bar: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct CreateSnippet {
    code: String,
    #[serde(default = "default_title")]
    title: String,
    #[serde(default = "default_language")]
    language: String,
    #[serde(default = "default_mode")]
    mode: String,
    #[serde(default = "default_syntax_theme")]
    syntax_theme: String,
    #[serde(default = "default_aspect_ratio")]
    aspect_ratio: String,
    #[serde(default = "default_image_format")]
    image_format: String,
    #[serde(default = "default_frame_width")]
    frame_width: u16,
    #[serde(default = "default_font_size")]
    font_size: u8,
    #[serde(default = "default_padding")]
    padding: u8,
    #[serde(default = "default_radius")]
    radius: u8,
    #[serde(default)]
    palette_index: u8,
    #[serde(default = "enabled")]
    line_numbers: bool,
    #[serde(default = "enabled")]
    title_bar: bool,
}

#[derive(Serialize)]
struct CreatedSnippet {
    download_url: String,
}

#[derive(Serialize)]
struct ApiError {
    error: String,
}

#[derive(Deserialize)]
struct UpstashResponse<T> {
    result: T,
}

struct Store {
    public_web_url: String,
    token: String,
    url: String,
}

pub async fn create(request: &mut Request, env: &Env) -> Result<Response> {
    let input = match request.json::<CreateSnippet>().await {
        Ok(input) => input,
        Err(_) => return api_error(422, "request body must be valid JSON"),
    };
    if let Err(error) = input.validate() {
        return api_error(422, error);
    }

    match Store::new(env)?.create(input).await {
        Ok(created) => Ok(Response::from_json(&created)?.with_status(201)),
        Err(error) => api_error(503, error),
    }
}

pub async fn get(id: &str, env: &Env) -> Result<Response> {
    match Store::new(env)?.get(id).await {
        Ok(Some(snippet)) => Response::from_json(&snippet),
        Ok(None) => api_error(404, "snippet not found"),
        Err(error) => api_error(503, error),
    }
}

impl Store {
    fn new(env: &Env) -> Result<Self> {
        Ok(Self {
            public_web_url: env.var("APP_URL")?.to_string().trim_end_matches('/').into(),
            token: env.secret("UPSTASH_REDIS_REST_TOKEN")?.to_string(),
            url: env
                .secret("UPSTASH_REDIS_REST_URL")?
                .to_string()
                .trim_end_matches('/')
                .into(),
        })
    }

    async fn create(
        &self,
        input: CreateSnippet,
    ) -> std::result::Result<CreatedSnippet, &'static str> {
        let mut snippet = Snippet {
            id: String::new(),
            code: input.code,
            title: input.title,
            language: input.language,
            mode: input.mode,
            syntax_theme: input.syntax_theme,
            aspect_ratio: input.aspect_ratio,
            image_format: input.image_format,
            frame_width: input.frame_width,
            font_size: input.font_size,
            padding: input.padding,
            radius: input.radius,
            palette_index: input.palette_index,
            line_numbers: input.line_numbers,
            title_bar: input.title_bar,
        };

        for _ in 0..3 {
            snippet.id = short_id();
            let value = serde_json::to_string(&snippet).map_err(|_| storage_error())?;
            let ttl = SNIPPET_TTL_SECONDS.to_string();
            let key = storage_key(&snippet.id);
            let result: Option<String> = self
                .command(&["SET", &key, &value, "EX", &ttl, "NX"])
                .await?;
            if result.as_deref() == Some("OK") {
                return Ok(CreatedSnippet {
                    download_url: format!("{}/download/{}", self.public_web_url, snippet.id),
                });
            }
        }

        Err(storage_error())
    }

    async fn get(&self, id: &str) -> std::result::Result<Option<Snippet>, &'static str> {
        if id.len() != 16 || !id.bytes().all(|byte| byte.is_ascii_hexdigit()) {
            return Ok(None);
        }
        let key = storage_key(id);
        let value: Option<String> = self.command(&["GET", &key]).await?;
        value
            .map(|value| serde_json::from_str(&value).map_err(|_| storage_error()))
            .transpose()
    }

    async fn command<T>(&self, command: &[&str]) -> std::result::Result<T, &'static str>
    where
        T: DeserializeOwned,
    {
        let headers = Headers::new();
        headers
            .set("authorization", &format!("Bearer {}", self.token))
            .map_err(|_| storage_error())?;
        headers
            .set("content-type", "application/json")
            .map_err(|_| storage_error())?;
        let body = serde_json::to_string(command).map_err(|_| storage_error())?;
        let mut init = RequestInit::new();
        init.with_method(Method::Post)
            .with_headers(headers)
            .with_body(Some(JsValue::from_str(&body)));
        let request = Request::new_with_init(&self.url, &init).map_err(|_| storage_error())?;
        let mut response = Fetch::Request(request)
            .send()
            .await
            .map_err(|_| storage_error())?;
        if !(200..300).contains(&response.status_code()) {
            return Err(storage_error());
        }
        response
            .json::<UpstashResponse<T>>()
            .await
            .map(|body| body.result)
            .map_err(|_| storage_error())
    }
}

impl CreateSnippet {
    fn validate(&self) -> std::result::Result<(), &'static str> {
        if self.code.trim().is_empty() {
            return Err("code must not be empty");
        }
        if self.code.len() > MAX_CODE_BYTES {
            return Err("code must not exceed 100000 bytes");
        }
        if self.title.chars().count() > MAX_TITLE_CHARS {
            return Err("title must not exceed 200 characters");
        }
        if self.language.trim().is_empty() || self.language.chars().count() > 100 {
            return Err("language must contain 1 to 100 characters");
        }
        if self.syntax_theme.trim().is_empty() || self.syntax_theme.chars().count() > 100 {
            return Err("syntaxTheme must contain 1 to 100 characters");
        }
        if !["window", "terminal"].contains(&self.mode.as_str()) {
            return Err("mode must be window or terminal");
        }
        if !["auto", "1:1", "4:3", "16:9"].contains(&self.aspect_ratio.as_str()) {
            return Err("aspectRatio must be auto, 1:1, 4:3, or 16:9");
        }
        if !["png", "webp", "jpeg"].contains(&self.image_format.as_str()) {
            return Err("imageFormat must be png, webp, or jpeg");
        }
        if !(720..=1600).contains(&self.frame_width)
            || !(13..=22).contains(&self.font_size)
            || !(24..=96).contains(&self.padding)
            || self.radius > 36
            || self.palette_index > 11
        {
            return Err("frame styling is outside the supported range");
        }
        Ok(())
    }
}

fn api_error(status: u16, error: &str) -> Result<Response> {
    Ok(Response::from_json(&ApiError {
        error: error.into(),
    })?
    .with_status(status))
}

fn storage_error() -> &'static str {
    "snippet storage is temporarily unavailable"
}

fn short_id() -> String {
    Uuid::new_v4().simple().to_string()[..16].to_owned()
}

fn storage_key(id: &str) -> String {
    format!("snippet:{id}")
}

fn default_title() -> String {
    "untitled.txt".into()
}

fn default_language() -> String {
    "Plaintext".into()
}

fn default_mode() -> String {
    "window".into()
}

fn default_syntax_theme() -> String {
    "github-dark-default".into()
}

fn default_aspect_ratio() -> String {
    "auto".into()
}

fn default_image_format() -> String {
    "png".into()
}

fn default_frame_width() -> u16 {
    1200
}

fn default_font_size() -> u8 {
    16
}

fn default_padding() -> u8 {
    64
}

fn default_radius() -> u8 {
    22
}

fn enabled() -> bool {
    true
}

#[cfg(test)]
mod tests {
    use super::CreateSnippet;

    #[test]
    fn image_format_defaults_to_png() {
        let snippet: CreateSnippet =
            serde_json::from_str(r#"{"code":"let ready = true;}"}"#).unwrap();

        assert_eq!(snippet.image_format, "png");
    }

    #[test]
    fn empty_code_is_rejected() {
        let snippet: CreateSnippet = serde_json::from_str(r#"{"code":""}"#).unwrap();

        assert_eq!(snippet.validate(), Err("code must not be empty"));
    }
}
