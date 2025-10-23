// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./interfaces/ILinkaProtocol.sol";

contract EscrowManager is ReentrancyGuard, Ownable, Pausable, ILinkaProtocol {
    uint256 public constant PLATFORM_FEE_PERCENT = 250; // 2.5%
    uint256 public constant DISPUTE_TIMEOUT = 7 days;
    uint256 public constant ESCROW_TIMEOUT = 30 days;
    
    uint256 public nextEscrowId = 1;
    uint256 public totalVolume;
    uint256 public totalFees;
    
    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => Milestone[]) public milestones;
    mapping(uint256 => Dispute) public disputes;
    mapping(address => uint256) public userEscrowCount;
    
    address public paymentProcessor;
    address public reputationRegistry;
    address public disputeResolution;
    
    modifier onlyEscrowParty(uint256 escrowId) {
        Escrow memory escrow = escrows[escrowId];
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "Not authorized"
        );
        _;
    }
    
    modifier onlyValidEscrow(uint256 escrowId) {
        require(escrowId > 0 && escrowId < nextEscrowId, "Invalid escrow");
        _;
    }

    constructor() {
        _transferOwnership(msg.sender);
    }

    function setContracts(
        address _paymentProcessor,
        address _reputationRegistry,
        address _disputeResolution
    ) external onlyOwner {
        paymentProcessor = _paymentProcessor;
        reputationRegistry = _reputationRegistry;
        disputeResolution = _disputeResolution;
    }

    function createEscrow(
        address seller,
        string memory description,
        bytes32 metadataHash,
        Milestone[] memory _milestones
    ) external payable whenNotPaused returns (uint256) {
        require(seller != address(0), "Invalid seller");
        require(seller != msg.sender, "Cannot escrow with self");
        require(msg.value > 0, "Amount must be greater than 0");
        
        uint256 platformFee = (msg.value * PLATFORM_FEE_PERCENT) / 10000;
        uint256 escrowAmount = msg.value - platformFee;
        
        uint256 escrowId = nextEscrowId++;
        
        escrows[escrowId] = Escrow({
            id: escrowId,
            buyer: msg.sender,
            seller: seller,
            amount: escrowAmount,
            platformFee: platformFee,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + ESCROW_TIMEOUT,
            status: EscrowStatus.Pending,
            description: description,
            metadataHash: metadataHash
        });
        
        // Add milestones if provided
        if (_milestones.length > 0) {
            uint256 totalMilestoneAmount = 0;
            for (uint256 i = 0; i < _milestones.length; i++) {
                milestones[escrowId].push(_milestones[i]);
                totalMilestoneAmount += _milestones[i].amount;
            }
            require(totalMilestoneAmount == escrowAmount, "Milestone amounts must equal escrow amount");
        }
        
        userEscrowCount[msg.sender]++;
        userEscrowCount[seller]++;
        totalVolume += msg.value;
        totalFees += platformFee;
        
        emit EscrowCreated(escrowId, msg.sender, seller, escrowAmount);
        
        return escrowId;
    }

    function fundEscrow(uint256 escrowId) 
        external 
        payable 
        onlyValidEscrow(escrowId)
        whenNotPaused 
    {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Pending, "Escrow not pending");
        require(msg.sender == escrow.buyer, "Only buyer can fund");
        require(msg.value == escrow.amount + escrow.platformFee, "Incorrect amount");
        
        escrow.status = EscrowStatus.Funded;
        
        emit EscrowFunded(escrowId, msg.value);
    }

    function releasePayment(uint256 escrowId, uint256 milestoneIndex) 
        external 
        onlyValidEscrow(escrowId)
        onlyEscrowParty(escrowId)
        nonReentrant
    {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Funded, "Escrow not funded");
        require(block.timestamp <= escrow.expiresAt, "Escrow expired");
        
        uint256 releaseAmount;
        
        if (milestones[escrowId].length > 0) {
            require(milestoneIndex < milestones[escrowId].length, "Invalid milestone");
            Milestone storage milestone = milestones[escrowId][milestoneIndex];
            require(!milestone.completed, "Milestone already completed");
            
            milestone.completed = true;
            milestone.completedAt = block.timestamp;
            releaseAmount = milestone.amount;
        } else {
            require(msg.sender == escrow.buyer, "Only buyer can release full payment");
            releaseAmount = escrow.amount;
            escrow.status = EscrowStatus.Completed;
        }
        
        // Transfer to seller
        (bool success, ) = escrow.seller.call{value: releaseAmount}("");
        require(success, "Transfer failed");
        
        emit EscrowCompleted(escrowId, releaseAmount);
        
        // Update reputation
        if (reputationRegistry != address(0)) {
            IReputationRegistry(reputationRegistry).updateReputation(
                escrow.seller,
                true,
                releaseAmount
            );
        }
    }

    function fileDispute(uint256 escrowId, string memory reason) 
        external 
        onlyValidEscrow(escrowId)
        onlyEscrowParty(escrowId)
    {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Funded, "Escrow not funded");
        require(disputes[escrowId].createdAt == 0, "Dispute already filed");
        
        disputes[escrowId] = Dispute({
            escrowId: escrowId,
            initiator: msg.sender,
            reason: reason,
            createdAt: block.timestamp,
            status: DisputeStatus.Pending,
            arbitrator: address(0)
        });
        
        escrow.status = EscrowStatus.Disputed;
        
        emit EscrowDisputed(escrowId, msg.sender, reason);
    }

    function resolveDispute(uint256 escrowId, bool buyerWins) 
        external 
        onlyValidEscrow(escrowId)
    {
        require(msg.sender == disputeResolution, "Only dispute resolution contract");
        
        Escrow storage escrow = escrows[escrowId];
        Dispute storage dispute = disputes[escrowId];
        
        require(escrow.status == EscrowStatus.Disputed, "No active dispute");
        require(dispute.status == DisputeStatus.Pending, "Dispute already resolved");
        
        dispute.status = DisputeStatus.Resolved;
        dispute.arbitrator = msg.sender;
        
        address winner = buyerWins ? escrow.buyer : escrow.seller;
        address loser = buyerWins ? escrow.seller : escrow.buyer;
        
        // Transfer funds to winner
        (bool success, ) = winner.call{value: escrow.amount}("");
        require(success, "Transfer failed");
        
        escrow.status = EscrowStatus.Completed;
        
        emit DisputeResolved(escrowId, msg.sender, buyerWins);
        
        // Update reputation
        if (reputationRegistry != address(0)) {
            IReputationRegistry(reputationRegistry).updateReputation(winner, true, escrow.amount);
            IReputationRegistry(reputationRegistry).updateReputation(loser, false, escrow.amount);
        }
    }

    function cancelEscrow(uint256 escrowId) 
        external 
        onlyValidEscrow(escrowId)
        onlyEscrowParty(escrowId)
    {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Pending, "Cannot cancel funded escrow");
        
        escrow.status = EscrowStatus.Cancelled;
        
        // Refund buyer
        (bool success, ) = escrow.buyer.call{value: escrow.amount + escrow.platformFee}("");
        require(success, "Refund failed");
    }

    function expireEscrow(uint256 escrowId) 
        external 
        onlyValidEscrow(escrowId)
    {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Funded, "Escrow not funded");
        require(block.timestamp > escrow.expiresAt, "Escrow not expired");
        
        escrow.status = EscrowStatus.Expired;
        
        // Refund buyer
        (bool success, ) = escrow.buyer.call{value: escrow.amount}("");
        require(success, "Refund failed");
    }

    function getEscrow(uint256 escrowId) external view returns (Escrow memory) {
        return escrows[escrowId];
    }

    function getMilestones(uint256 escrowId) external view returns (Milestone[] memory) {
        return milestones[escrowId];
    }

    function getDispute(uint256 escrowId) external view returns (Dispute memory) {
        return disputes[escrowId];
    }

    function withdrawFees() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "No fees to withdraw");
        
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}

interface IReputationRegistry {
    function updateReputation(address user, bool success, uint256 amount) external;
}
