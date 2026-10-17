use std::{env, path::PathBuf, sync::Arc, time::Duration};

use axum::{
    Json,
    body::Body,
    extract::State,
    http::{HeaderValue, StatusCode, header},
    response::Response,
};
use base64::{Engine, engine::general_purpose::URL_SAFE_NO_PAD};
use headless_chrome::{Browser, LaunchOptionsBuilder};
use tokio::{sync::Semaphore, task, time};

use crate::snippet::{ApiError, CreateSnippet};

#[derive(Clone)]
pub struct ImageRenderer {
    chrome_path: Option<PathBuf>,
    page_url: String,
    sandbox: bool,
    slots: Arc<Semaphore>,
}

impl ImageRenderer {
    pub fn from_env() -> Self {
        Self {
            chrome_path: env::var_os("CHROME_BIN").map(PathBuf::from),
            page_url: env::var("RENDER_PAGE_URL")
                .unwrap_or_else(|_| "http://localhost:5173/render".into()),
            sandbox: env::var_os("CHROME_NO_SANDBOX").is_none(),
            slots: Arc::new(Semaphore::new(2)),
        }
    }

    #[cfg(test)]
    pub fn for_test() -> Self {
        Self {
            chrome_path: None,
            page_url: "http://localhost:5173/render".into(),
            sandbox: true,
            slots: Arc::new(Semaphore::new(1)),
        }
    }

    async fn render(&self, request: &CreateSnippet) -> Result<Vec<u8>, ApiError> {
        let _slot = self
            .slots
            .acquire()
            .await
            .map_err(|_| ApiError::rendering())?;
        let state = serde_json::to_vec(request).map_err(|_| ApiError::rendering())?;
        let url = format!("{}#{}", self.page_url, URL_SAFE_NO_PAD.encode(state));
        let chrome_path = self.chrome_path.clone();
        let sandbox = self.sandbox;

        let rendered = time::timeout(
            Duration::from_secs(20),
            task::spawn_blocking(move || render_in_browser(url, chrome_path, sandbox)),
        )
        .await
        .map_err(|_| ApiError::rendering())?
        .map_err(|_| ApiError::rendering())?;

        rendered.map_err(|error| {
            eprintln!("Image rendering failed: {error}");
            ApiError::rendering()
        })
    }
}

pub async fn render_image(
    State(renderer): State<ImageRenderer>,
    Json(request): Json<CreateSnippet>,
) -> Result<Response, ApiError> {
    request.validate()?;
    let content_type = match request.image_format() {
        "png" => "image/png",
        "webp" => "image/webp",
        "jpeg" => "image/jpeg",
        _ => return Err(ApiError::invalid("unsupported imageFormat")),
    };
    let extension = if request.image_format() == "jpeg" {
        "jpg"
    } else {
        request.image_format()
    };
    let filename = filename(request.title(), extension);
    let image = renderer.render(&request).await?;

    let mut response = Response::new(Body::from(image));
    *response.status_mut() = StatusCode::OK;
    response
        .headers_mut()
        .insert(header::CONTENT_TYPE, HeaderValue::from_static(content_type));
    response.headers_mut().insert(
        header::CONTENT_DISPOSITION,
        HeaderValue::from_str(&format!("inline; filename=\"{filename}\""))
            .map_err(|_| ApiError::rendering())?,
    );
    response
        .headers_mut()
        .insert(header::CACHE_CONTROL, HeaderValue::from_static("no-store"));
    Ok(response)
}

fn render_in_browser(
    url: String,
    chrome_path: Option<PathBuf>,
    sandbox: bool,
) -> Result<Vec<u8>, String> {
    // shortcut: launch one browser per request, pool Chrome when render traffic warrants it.
    let options = LaunchOptionsBuilder::default()
        .headless(true)
        .path(chrome_path)
        .sandbox(sandbox)
        .build()
        .map_err(|error| error.to_string())?;
    let browser = Browser::new(options).map_err(|error| error.to_string())?;
    let tab = browser.new_tab().map_err(|error| error.to_string())?;
    tab.navigate_to(&url).map_err(|error| error.to_string())?;
    let image = tab
        .wait_for_element("#rendered-image[data-render-ready='true']")
        .map_err(|error| error.to_string())?;
    let result = image
        .call_js_fn(
            r#"async function () {
                const response = await fetch(this.src)
                const bytes = new Uint8Array(await response.arrayBuffer())
                let binary = ''
                for (let offset = 0; offset < bytes.length; offset += 32768) {
                    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768))
                }
                return btoa(binary)
            }"#,
            vec![],
            true,
        )
        .map_err(|error| error.to_string())?;
    let encoded = result
        .value
        .and_then(|value| value.as_str().map(str::to_owned))
        .ok_or_else(|| "render page returned no image".to_owned())?;
    base64::engine::general_purpose::STANDARD
        .decode(encoded)
        .map_err(|error| error.to_string())
}

fn filename(title: &str, extension: &str) -> String {
    let stem = title.rsplit_once('.').map_or(title, |(stem, _)| stem);
    let safe: String = stem
        .chars()
        .filter(|character| character.is_ascii_alphanumeric() || ['-', '_'].contains(character))
        .take(80)
        .collect();
    format!(
        "{}.{}",
        if safe.is_empty() { "code-frame" } else { &safe },
        extension
    )
}
