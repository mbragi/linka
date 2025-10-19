use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::mpsc;
use anyhow::Result;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MCPRequest {
    pub method: String,
    pub params: HashMap<String, serde_json::Value>,
    pub id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MCPResponse {
    pub result: Option<serde_json::Value>,
    pub error: Option<MCPError>,
    pub id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MCPError {
    pub code: i32,
    pub message: String,
    pub data: Option<serde_json::Value>,
}

pub trait MCPClient {
    async fn connect(&mut self) -> Result<()>;
    async fn send_request(&self, request: MCPRequest) -> Result<MCPResponse>;
    async fn disconnect(&mut self) -> Result<()>;
}

pub struct BreadMCPClient {
    server_url: String,
    connection: Option<mpsc::UnboundedSender<MCPRequest>>,
}

impl BreadMCPClient {
    pub fn new(server_url: String) -> Self {
        Self {
            server_url,
            connection: None,
        }
    }

    pub async fn create_account(&self, user_data: HashMap<String, serde_json::Value>) -> Result<MCPResponse> {
        let request = MCPRequest {
            method: "create_account".to_string(),
            params: user_data,
            id: uuid::Uuid::new_v4().to_string(),
        };
        self.send_request(request).await
    }

    pub async fn get_quote(&self, amount: f64, currency: &str) -> Result<MCPResponse> {
        let mut params = HashMap::new();
        params.insert("amount".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(amount).unwrap()));
        params.insert("currency".to_string(), serde_json::Value::String(currency.to_string()));

        let request = MCPRequest {
            method: "get_quote".to_string(),
            params,
            id: uuid::Uuid::new_v4().to_string(),
        };
        self.send_request(request).await
    }

    pub async fn fund_wallet(&self, wallet_address: &str, amount: f64) -> Result<MCPResponse> {
        let mut params = HashMap::new();
        params.insert("wallet_address".to_string(), serde_json::Value::String(wallet_address.to_string()));
        params.insert("amount".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(amount).unwrap()));

        let request = MCPRequest {
            method: "fund_wallet".to_string(),
            params,
            id: uuid::Uuid::new_v4().to_string(),
        };
        self.send_request(request).await
    }

    pub async fn withdraw_funds(&self, wallet_address: &str, amount: f64, bank_details: HashMap<String, serde_json::Value>) -> Result<MCPResponse> {
        let mut params = HashMap::new();
        params.insert("wallet_address".to_string(), serde_json::Value::String(wallet_address.to_string()));
        params.insert("amount".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(amount).unwrap()));
        params.extend(bank_details);

        let request = MCPRequest {
            method: "withdraw_funds".to_string(),
            params,
            id: uuid::Uuid::new_v4().to_string(),
        };
        self.send_request(request).await
    }
}

impl MCPClient for BreadMCPClient {
    async fn connect(&mut self) -> Result<()> {
        // TODO: Implement actual MCP connection logic
        // This would establish WebSocket or HTTP connection to Bread MCP server
        Ok(())
    }

    async fn send_request(&self, request: MCPRequest) -> Result<MCPResponse> {
        // TODO: Implement actual request sending
        // For now, return a mock response
        Ok(MCPResponse {
            result: Some(serde_json::Value::String("mock_response".to_string())),
            error: None,
            id: request.id,
        })
    }

    async fn disconnect(&mut self) -> Result<()> {
        self.connection = None;
        Ok(())
    }
}

pub struct WaSenderMCPClient {
    server_url: String,
    connection: Option<mpsc::UnboundedSender<MCPRequest>>,
}

impl WaSenderMCPClient {
    pub fn new(server_url: String) -> Self {
        Self {
            server_url,
            connection: None,
        }
    }

    pub async fn send_message(&self, phone_number: &str, message: &str) -> Result<MCPResponse> {
        let mut params = HashMap::new();
        params.insert("phone_number".to_string(), serde_json::Value::String(phone_number.to_string()));
        params.insert("message".to_string(), serde_json::Value::String(message.to_string()));

        let request = MCPRequest {
            method: "send_message".to_string(),
            params,
            id: uuid::Uuid::new_v4().to_string(),
        };
        self.send_request(request).await
    }

    pub async fn get_chat_status(&self, chat_id: &str) -> Result<MCPResponse> {
        let mut params = HashMap::new();
        params.insert("chat_id".to_string(), serde_json::Value::String(chat_id.to_string()));

        let request = MCPRequest {
            method: "get_chat_status".to_string(),
            params,
            id: uuid::Uuid::new_v4().to_string(),
        };
        self.send_request(request).await
    }
}

impl MCPClient for WaSenderMCPClient {
    async fn connect(&mut self) -> Result<()> {
        // TODO: Implement actual MCP connection logic
        Ok(())
    }

    async fn send_request(&self, request: MCPRequest) -> Result<MCPResponse> {
        // TODO: Implement actual request sending
        Ok(MCPResponse {
            result: Some(serde_json::Value::String("mock_response".to_string())),
            error: None,
            id: request.id,
        })
    }

    async fn disconnect(&mut self) -> Result<()> {
        self.connection = None;
        Ok(())
    }
}
