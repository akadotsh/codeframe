mod route;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    println!("Code Frame API listening on http://localhost:8080");

    axum::serve(listener, route::create_router()).await
}
