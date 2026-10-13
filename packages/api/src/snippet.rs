use std::{collections::HashMap, sync::Arc};

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use uuid::Uuid;

const MAX_CODE_BYTES: usize = 100_000;
const MAX_TITLE_CHARS: usize = 200;

#[derive(Clone, Default)]
pub struct SnippetStore(Arc<RwLock<HashMap<Uuid, Snippet>>>);

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct Snippet {
    id: Uuid,
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
pub(crate) struct ApiError {
    error: &'static str,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (StatusCode::UNPROCESSABLE_ENTITY, Json(self)).into_response()
    }
}

pub async fn create_snippet(
    State(store): State<SnippetStore>,
    Json(input): Json<CreateSnippet>,
) -> Result<impl IntoResponse, ApiError> {
    input.validate()?;

    let snippet = Snippet {
        id: Uuid::new_v4(),
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

    store.0.write().await.insert(snippet.id, snippet.clone());
    Ok((StatusCode::CREATED, Json(snippet)))
}

pub async fn get_snippet(
    State(store): State<SnippetStore>,
    Path(id): Path<Uuid>,
) -> Result<Json<Snippet>, StatusCode> {
    store
        .0
        .read()
        .await
        .get(&id)
        .cloned()
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

impl CreateSnippet {
    fn validate(&self) -> Result<(), ApiError> {
        if self.code.trim().is_empty() {
            return Err(ApiError {
                error: "code must not be empty",
            });
        }
        if self.code.len() > MAX_CODE_BYTES {
            return Err(ApiError {
                error: "code must not exceed 100000 bytes",
            });
        }
        if self.title.chars().count() > MAX_TITLE_CHARS {
            return Err(ApiError {
                error: "title must not exceed 200 characters",
            });
        }
        if self.language.trim().is_empty() || self.language.chars().count() > 100 {
            return Err(ApiError {
                error: "language must contain 1 to 100 characters",
            });
        }
        if self.syntax_theme.trim().is_empty() || self.syntax_theme.chars().count() > 100 {
            return Err(ApiError {
                error: "syntaxTheme must contain 1 to 100 characters",
            });
        }
        if !["window", "terminal"].contains(&self.mode.as_str()) {
            return Err(ApiError {
                error: "mode must be window or terminal",
            });
        }
        if !["auto", "1:1", "4:3", "16:9"].contains(&self.aspect_ratio.as_str()) {
            return Err(ApiError {
                error: "aspectRatio must be auto, 1:1, 4:3, or 16:9",
            });
        }
        if !["png", "webp", "jpeg"].contains(&self.image_format.as_str()) {
            return Err(ApiError {
                error: "imageFormat must be png, webp, or jpeg",
            });
        }
        if !(720..=1600).contains(&self.frame_width)
            || !(13..=22).contains(&self.font_size)
            || !(24..=96).contains(&self.padding)
            || self.radius > 36
            || self.palette_index > 11
        {
            return Err(ApiError {
                error: "frame styling is outside the supported range",
            });
        }

        Ok(())
    }
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
