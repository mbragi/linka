// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ILinkaProtocol {
    struct Escrow {
        uint256 id;
        address buyer;
        address seller;
        uint256 amount;
        uint256 platformFee;
        uint256 createdAt;
        uint256 expiresAt;
        EscrowStatus status;
        string description;
        bytes32 metadataHash;
    }

    enum EscrowStatus {
        Pending,
        Funded,
        Completed,
        Disputed,
        Cancelled,
        Expired
    }

    struct Milestone {
        uint256 amount;
        string description;
        bool completed;
        uint256 completedAt;
    }

    struct Dispute {
        uint256 escrowId;
        address initiator;
        string reason;
        uint256 createdAt;
        DisputeStatus status;
        address arbitrator;
    }

    enum DisputeStatus {
        Pending,
        UnderReview,
        Resolved,
        Rejected
    }

    event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, uint256 amount);
    event EscrowFunded(uint256 indexed escrowId, uint256 amount);
    event EscrowCompleted(uint256 indexed escrowId, uint256 amountReleased);
    event EscrowDisputed(uint256 indexed escrowId, address indexed initiator, string reason);
    event DisputeResolved(uint256 indexed escrowId, address indexed arbitrator, bool buyerWins);
    event ReputationUpdated(address indexed user, uint256 newScore, uint256 totalTransactions);
}
