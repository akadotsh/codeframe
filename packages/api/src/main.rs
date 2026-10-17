mod route;
mod snippet;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    let store = snippet::SnippetStore::from_env()?;
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".into());
    let api_url = std::env::var("API_URL").unwrap_or_else(|_| format!("http://localhost:{port}"));
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}")).await?;
    println!("Code Frame API listening on {api_url} (port {port})");

    axum::serve(listener, route::create_router(store)).await?;
    Ok(())
}
