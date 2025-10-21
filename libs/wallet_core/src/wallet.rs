use anyhow::Result;

pub struct Wallet {
    pub address: String,
}

impl Wallet {
    pub fn new() -> Result<Self> {
        Ok(Self {
            address: "0x0000000000000000000000000000000000000000".to_string(),
        })
    }
}
