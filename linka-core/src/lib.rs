use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: String,
    pub display_name: Option<String>,
    pub wallet_address: String,
    pub preferred_channel: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Wallet {
    pub address: String,
    pub user_id: String,
    pub balance: f64,
    pub currency: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vendor {
    pub id: String,
    pub name: String,
    pub category: String,
    pub location: String,
    pub description: String,
    pub contact_info: HashMap<String, String>,
    pub availability: Vec<String>,
    pub rating: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Booking {
    pub id: String,
    pub user_id: String,
    pub vendor_id: String,
    pub scheduled_time: chrono::DateTime<chrono::Utc>,
    pub status: String,
    pub amount: f64,
    pub currency: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub id: String,
    pub user_id: String,
    pub channel: String,
    pub content: String,
    pub intent: Option<String>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

pub mod wallet_agent;
pub mod vendor_agent;
pub mod calendar_agent;
pub mod user_agent;
pub mod payment_agent;
