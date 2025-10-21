use anyhow::Result;

pub struct WitClient {
    api_token: String,
}

impl WitClient {
    pub fn new(api_token: String) -> Self {
        Self { api_token }
    }

    pub async fn classify_intent(&self, message: &str) -> Result<String> {
        Ok("unknown".to_string())
    }
}
