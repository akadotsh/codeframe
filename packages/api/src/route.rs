use axum::{
    Router,
    http::{Method, header},
    routing::{get, post},
};
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};

use crate::{
    image::{ImageRenderer, render_image},
    snippet::{SnippetStore, create_snippet, get_snippet},
};

pub fn create_router(store: SnippetStore, renderer: ImageRenderer) -> Router {
    Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/api/snippets", post(create_snippet))
        .route("/api/snippets/{id}", get(get_snippet))
        .with_state(store)
        .merge(
            Router::new()
                .route("/api/images", post(render_image))
                .with_state(renderer),
        )
        .layer(
            CorsLayer::new()
                .allow_methods([Method::GET, Method::POST])
                .allow_headers([header::CONTENT_TYPE])
                .allow_origin(Any),
        )
        .layer(TraceLayer::new_for_http())
}

#[cfg(test)]
mod tests {
    use axum::{
        Router,
        body::{Body, to_bytes},
        http::{Request, StatusCode, header},
    };
    use serde_json::{Value, json};
    use tower::ServiceExt;

    use super::create_router;
    use crate::{image::ImageRenderer, snippet::SnippetStore};

    fn app() -> Router {
        create_router(SnippetStore::memory(), ImageRenderer::for_test())
    }

    #[tokio::test]
    async fn health_check_is_available() {
        let response = app()
            .oneshot(Request::get("/health").body(Body::empty()).unwrap())
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn snippets_can_be_created_and_retrieved() {
        let app = app();
        let response = app
            .clone()
            .oneshot(
                Request::post("/api/snippets")
                    .header(header::CONTENT_TYPE, "application/json")
                    .body(Body::from(
                        json!({
                            "code": "fn main() {}",
                            "language": "Rust",
                            "title": "main.rs"
                        })
                        .to_string(),
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::CREATED);
        let body: Value =
            serde_json::from_slice(&to_bytes(response.into_body(), usize::MAX).await.unwrap())
                .unwrap();
        let id = body["id"].as_str().unwrap();
        assert_eq!(body["url"], format!("http://localhost:5173/s/{id}"));

        let response = app
            .oneshot(
                Request::get(format!("/api/snippets/{id}"))
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn empty_code_is_rejected() {
        let response = app()
            .oneshot(
                Request::post("/api/snippets")
                    .header(header::CONTENT_TYPE, "application/json")
                    .body(Body::from(json!({ "code": "" }).to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);
    }

    #[tokio::test]
    async fn image_requests_are_validated_before_rendering() {
        let response = app()
            .oneshot(
                Request::post("/api/images")
                    .header(header::CONTENT_TYPE, "application/json")
                    .body(Body::from(json!({ "code": "" }).to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);
    }
}
