use axum::{
    routing::get,
    Router,
};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/health", get(health_check));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .unwrap();
    
    println!("Wallet Core service running on :3001");
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> &'static str {
    "Wallet Core service is running"
}
