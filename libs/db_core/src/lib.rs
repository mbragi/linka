use anyhow::Result;
use mongodb::{Client, Database};

pub struct DbClient {
    client: Client,
}

impl DbClient {
    pub async fn new(uri: &str) -> Result<Self> {
        let client = Client::with_uri_str(uri).await?;
        Ok(Self { client })
    }

    pub fn database(&self, name: &str) -> Database {
        self.client.database(name)
    }
}
