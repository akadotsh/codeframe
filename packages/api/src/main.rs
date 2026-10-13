mod route;
mod snippet;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    let store = snippet::SnippetStore::from_env()?;
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    println!("Code Frame API listening on http://localhost:8080");

    axum::serve(listener, route::create_router(store)).await?;
    Ok(())
}
