mod snippet;

use worker::{Context, Env, Method, Request, Response, Result, event};

#[event(fetch)]
async fn fetch(mut request: Request, env: Env, _context: Context) -> Result<Response> {
    let path = request.path();
    let method = request.method();
    let response = match (method, path.as_str()) {
        (Method::Get, "/health") => Response::ok("ok"),
        (Method::Post, "/api/snippets") => snippet::create(&mut request, &env).await,
        (Method::Get, path) if path.starts_with("/api/snippets/") => {
            snippet::get(path.trim_start_matches("/api/snippets/"), &env).await
        }
        (Method::Options, path) if path.starts_with("/api/") => {
            Ok(Response::empty()?.with_status(204))
        }
        _ => Response::error("not found", 404),
    }?;

    with_cors(response)
}

fn with_cors(mut response: Response) -> Result<Response> {
    response
        .headers_mut()
        .set("access-control-allow-origin", "*")?;
    response
        .headers_mut()
        .set("access-control-allow-methods", "GET, POST, OPTIONS")?;
    response
        .headers_mut()
        .set("access-control-allow-headers", "content-type")?;
    Ok(response)
}
