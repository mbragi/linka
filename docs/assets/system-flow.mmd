sequenceDiagram
    participant U as User
    participant C as Channel<br/>(WhatsApp/Web/Farcaster)
    participant AI as AI Agent<br/>(GPT-4o-mini)
    participant API as Backend API
    participant DB as MongoDB
    participant BC as Base Smart Contracts

    U->>C: "I want to buy from vendor X"
    C->>AI: Forward message with context
    
    AI->>AI: Analyze intent<br/>(create_escrow)
    
    AI->>API: POST /api/escrow/create
    API->>DB: Create transaction record
    
    API->>BC: createEscrow()
    BC-->>API: Escrow ID returned
    
    API-->>AI: Escrow created successfully
    AI->>AI: Format response
    
    AI-->>C: "Escrow created!<br/>Transaction ID: 0x123..."
    C-->>U: Display confirmation
    
    Note over U,BC: User funds escrow
    
    U->>C: "Check transaction status"
    C->>AI: Forward request
    AI->>API: GET /api/transactions/:id
    API->>BC: getEscrow(escrowId)
    BC-->>API: Escrow details
    API->>DB: Fetch transaction metadata
    API-->>AI: Complete transaction info
    AI-->>C: "Transaction is funded and pending"
    C-->>U: Display status
    
    Note over U,BC: Seller completes work
    
    U->>C: "Release payment"
    C->>AI: Process release request
    AI->>API: POST /api/escrow/:id/release
    API->>BC: releasePayment()
    BC->>RR: updateReputation(seller, +)
    BC-->>API: Payment released
    API->>DB: Update transaction status
    API-->>AI: Payment released
    AI-->>C: "Payment released to seller!"
    C-->>U: Confirmation message

    style AI fill:#10B981
    style BC fill:#1B1B1E,color:#DFF5FF

