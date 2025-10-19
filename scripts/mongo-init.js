// MongoDB initialization script for Linka
db = db.getSiblingDB('linka');

// Create collections
db.createCollection('users');
db.createCollection('wallets');
db.createCollection('vendors');
db.createCollection('bookings');
db.createCollection('chat_messages');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "wallet_address": 1 }, { unique: true });

db.wallets.createIndex({ "user_id": 1 });
db.wallets.createIndex({ "address": 1 }, { unique: true });

db.vendors.createIndex({ "category": 1 });
db.vendors.createIndex({ "location": 1 });
db.vendors.createIndex({ "name": "text", "description": "text" });

db.bookings.createIndex({ "user_id": 1 });
db.bookings.createIndex({ "vendor_id": 1 });
db.bookings.createIndex({ "scheduled_time": 1 });

db.chat_messages.createIndex({ "user_id": 1 });
db.chat_messages.createIndex({ "timestamp": 1 });

// Insert sample vendor data
db.vendors.insertMany([
  {
    _id: ObjectId(),
    name: "Jane's Tailoring",
    category: "fashion",
    location: "Lekki, Lagos",
    description: "Professional tailoring services for men and women",
    contact_info: {
      phone: "+2348012345678",
      email: "jane@tailoring.com"
    },
    availability: ["09:00", "10:00", "11:00", "14:00", "15:00"],
    rating: 4.8,
    created_at: new Date()
  },
  {
    _id: ObjectId(),
    name: "Mike's Barber Shop",
    category: "grooming",
    location: "Victoria Island, Lagos",
    description: "Modern barber shop with professional styling",
    contact_info: {
      phone: "+2348012345679",
      email: "mike@barber.com"
    },
    availability: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"],
    rating: 4.6,
    created_at: new Date()
  },
  {
    _id: ObjectId(),
    name: "Sarah's Beauty Studio",
    category: "beauty",
    location: "Ikoyi, Lagos",
    description: "Full-service beauty salon and spa",
    contact_info: {
      phone: "+2348012345680",
      email: "sarah@beauty.com"
    },
    availability: ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"],
    rating: 4.9,
    created_at: new Date()
  }
]);

print("Linka database initialized successfully!");
