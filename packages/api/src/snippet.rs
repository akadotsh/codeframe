#[cfg(test)]
use std::{collections::HashMap, sync::Arc};
use std::{env, io};

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::{Deserialize, Serialize, de::DeserializeOwned};
#[cfg(test)]
use tokio::sync::RwLock;
use uuid::Uuid;

const MAX_CODE_BYTES: usize = 100_000;
const MAX_TITLE_CHARS: usize = 200;
const SNIPPET_TTL_SECONDS: u64 = 60 * 60 * 24 * 90;

#[derive(Clone)]
pub struct SnippetStore {
    backend: Backend,
    public_web_url: String,
}

#[derive(Clone)]
enum Backend {
    Upstash(Upstash),
    #[cfg(test)]
    Memory(Arc<RwLock<HashMap<String, Snippet>>>),
}

#[derive(Clone)]
struct Upstash {
    client: reqwest::Client,
    token: String,
    url: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct Snippet {
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

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CreateSnippet {
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

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct CreatedSnippet {
    #[serde(rename = "download_url")]
    download_url: String,
}

#[derive(Debug, Serialize)]
pub(crate) struct ApiError {
    #[serde(skip)]
    status: StatusCode,
    error: String,
}

#[derive(Deserialize)]
struct UpstashResponse<T> {
    result: T,
}

impl SnippetStore {
    pub fn from_env() -> Result<Self, io::Error> {
        let url = required_env("UPSTASH_REDIS_REST_URL")?;
        let token = required_env("UPSTASH_REDIS_REST_TOKEN")?;
        let public_web_url = env::var("PUBLIC_WEB_URL")
            .unwrap_or_else(|_| "http://localhost:5173".into())
            .trim_end_matches('/')
            .to_owned();

        Ok(Self {
            backend: Backend::Upstash(Upstash {
                client: reqwest::Client::new(),
                token,
                url: url.trim_end_matches('/').to_owned(),
            }),
            public_web_url,
        })
    }

    #[cfg(test)]
    pub fn memory() -> Self {
        Self {
            backend: Backend::Memory(Arc::default()),
            public_web_url: "http://localhost:5173".into(),
        }
    }

    async fn create(&self, input: CreateSnippet) -> Result<CreatedSnippet, ApiError> {
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

            if self.put(&snippet).await? {
                return Ok(CreatedSnippet {
                    download_url: format!("{}/download/{}", self.public_web_url, snippet.id),
                });
            }
        }

        Err(ApiError::unavailable())
    }

    async fn get(&self, id: &str) -> Result<Option<Snippet>, ApiError> {
        if id.len() != 16 || !id.bytes().all(|byte| byte.is_ascii_hexdigit()) {
            return Ok(None);
        }

        match &self.backend {
            Backend::Upstash(upstash) => {
                let key = storage_key(id);
                let value: Option<String> = upstash.command(&["GET", &key]).await?;
                value
                    .map(|value| serde_json::from_str(&value).map_err(|_| ApiError::unavailable()))
                    .transpose()
            }
            #[cfg(test)]
            Backend::Memory(snippets) => Ok(snippets.read().await.get(id).cloned()),
        }
    }

    async fn put(&self, snippet: &Snippet) -> Result<bool, ApiError> {
        match &self.backend {
            Backend::Upstash(upstash) => {
                let value = serde_json::to_string(snippet).map_err(|_| ApiError::unavailable())?;
                let ttl = SNIPPET_TTL_SECONDS.to_string();
                let key = storage_key(&snippet.id);
                let result: Option<String> = upstash
                    .command(&["SET", &key, &value, "EX", &ttl, "NX"])
                    .await?;
                Ok(result.as_deref() == Some("OK"))
            }
            #[cfg(test)]
            Backend::Memory(snippets) => {
                let mut snippets = snippets.write().await;
                if snippets.contains_key(&snippet.id) {
                    return Ok(false);
                }
                snippets.insert(snippet.id.clone(), snippet.clone());
                Ok(true)
            }
        }
    }
}

impl Upstash {
    async fn command<T>(&self, command: &[&str]) -> Result<T, ApiError>
    where
        T: DeserializeOwned,
    {
        let response = self
            .client
            .post(&self.url)
            .bearer_auth(&self.token)
            .json(&command)
            .send()
            .await
            .and_then(reqwest::Response::error_for_status)
            .map_err(|error| {
                eprintln!("Upstash request failed: {error}");
                ApiError::unavailable()
            })?;

        response
            .json::<UpstashResponse<T>>()
            .await
            .map(|body| body.result)
            .map_err(|error| {
                eprintln!("Invalid Upstash response: {error}");
                ApiError::unavailable()
            })
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (self.status, Json(self)).into_response()
    }
}

impl ApiError {
    pub(crate) fn invalid(error: &'static str) -> Self {
        Self {
            status: StatusCode::UNPROCESSABLE_ENTITY,
            error: error.into(),
        }
    }

    fn unavailable() -> Self {
        Self {
            status: StatusCode::SERVICE_UNAVAILABLE,
            error: "snippet storage is temporarily unavailable".into(),
        }
    }
}

pub async fn create_snippet(
    State(store): State<SnippetStore>,
    Json(input): Json<CreateSnippet>,
) -> Result<impl IntoResponse, ApiError> {
    input.validate()?;
    Ok((StatusCode::CREATED, Json(store.create(input).await?)))
}

pub async fn get_snippet(
    State(store): State<SnippetStore>,
    Path(id): Path<String>,
) -> Result<Json<Snippet>, ApiError> {
    store.get(&id).await?.map(Json).ok_or_else(|| ApiError {
        status: StatusCode::NOT_FOUND,
        error: "snippet not found".into(),
    })
}

impl CreateSnippet {
    pub(crate) fn validate(&self) -> Result<(), ApiError> {
        if self.code.trim().is_empty() {
            return Err(ApiError::invalid("code must not be empty"));
        }
        if self.code.len() > MAX_CODE_BYTES {
            return Err(ApiError::invalid("code must not exceed 100000 bytes"));
        }
        if self.title.chars().count() > MAX_TITLE_CHARS {
            return Err(ApiError::invalid("title must not exceed 200 characters"));
        }
        if self.language.trim().is_empty() || self.language.chars().count() > 100 {
            return Err(ApiError::invalid(
                "language must contain 1 to 100 characters",
            ));
        }
        if self.syntax_theme.trim().is_empty() || self.syntax_theme.chars().count() > 100 {
            return Err(ApiError::invalid(
                "syntaxTheme must contain 1 to 100 characters",
            ));
        }
        if !["window", "terminal"].contains(&self.mode.as_str()) {
            return Err(ApiError::invalid("mode must be window or terminal"));
        }
        if !["auto", "1:1", "4:3", "16:9"].contains(&self.aspect_ratio.as_str()) {
            return Err(ApiError::invalid(
                "aspectRatio must be auto, 1:1, 4:3, or 16:9",
            ));
        }
        if !["png", "webp", "jpeg"].contains(&self.image_format.as_str()) {
            return Err(ApiError::invalid("imageFormat must be png, webp, or jpeg"));
        }
        if !(720..=1600).contains(&self.frame_width)
            || !(13..=22).contains(&self.font_size)
            || !(24..=96).contains(&self.padding)
            || self.radius > 36
            || self.palette_index > 11
        {
            return Err(ApiError::invalid(
                "frame styling is outside the supported range",
            ));
        }

        Ok(())
    }
}

fn required_env(name: &str) -> Result<String, io::Error> {
    env::var(name).map_err(|_| {
        io::Error::new(
            io::ErrorKind::InvalidInput,
            format!("{name} must be configured"),
        )
    })
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
            serde_json::from_str(r#"{"code":"let ready = true;"}"#).unwrap();

        assert_eq!(snippet.image_format, "png");
    }
}
