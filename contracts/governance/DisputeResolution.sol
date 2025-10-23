// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/ILinkaProtocol.sol";

contract DisputeResolution is Ownable, ReentrancyGuard {
    struct Arbitrator {
        address arbitrator;
        uint256 stake;
        bool active;
        uint256 totalCases;
        uint256 successfulCases;
        uint256 lastActive;
    }
    
    struct DisputeCase {
        uint256 escrowId;
        address initiator;
        address arbitrator;
        string reason;
        string evidence;
        uint256 createdAt;
        uint256 deadline;
        DisputeStatus status;
        bool buyerWins;
        uint256 arbitratorFee;
    }
    
    uint256 public constant ARBITRATOR_STAKE = 1 ether;
    uint256 public constant ARBITRATOR_FEE = 0.1 ether;
    uint256 public constant DISPUTE_TIMEOUT = 7 days;
    uint256 public constant ARBITRATION_TIMEOUT = 3 days;
    
    mapping(address => Arbitrator) public arbitrators;
    mapping(uint256 => DisputeCase) public disputes;
    mapping(address => uint256[]) public arbitratorCases;
    
    address public escrowManager;
    uint256 public totalDisputes;
    uint256 public totalArbitrators;
    
    event ArbitratorRegistered(address indexed arbitrator, uint256 stake);
    event ArbitratorDeactivated(address indexed arbitrator);
    event DisputeAssigned(uint256 indexed escrowId, address indexed arbitrator);
    event DisputeResolved(uint256 indexed escrowId, address indexed arbitrator, bool buyerWins);
    event ArbitratorStakeSlashed(address indexed arbitrator, uint256 amount);
    
    modifier onlyArbitrator() {
        require(arbitrators[msg.sender].active, "Not an active arbitrator");
        _;
    }
    
    modifier onlyEscrowManager() {
        require(msg.sender == escrowManager, "Only escrow manager");
        _;
    }

    constructor() {
        _transferOwnership(msg.sender);
    }

    function setEscrowManager(address _escrowManager) external onlyOwner {
        escrowManager = _escrowManager;
    }

    function registerArbitrator() external payable {
        require(msg.value >= ARBITRATOR_STAKE, "Insufficient stake");
        require(!arbitrators[msg.sender].active, "Already registered");
        
        arbitrators[msg.sender] = Arbitrator({
            arbitrator: msg.sender,
            stake: msg.value,
            active: true,
            totalCases: 0,
            successfulCases: 0,
            lastActive: block.timestamp
        });
        
        totalArbitrators++;
        
        emit ArbitratorRegistered(msg.sender, msg.value);
    }

    function deactivateArbitrator() external onlyArbitrator {
        Arbitrator storage arbitrator = arbitrators[msg.sender];
        arbitrator.active = false;
        
        // Return stake
        (bool success, ) = msg.sender.call{value: arbitrator.stake}("");
        require(success, "Stake return failed");
        
        arbitrator.stake = 0;
        
        emit ArbitratorDeactivated(msg.sender);
    }

    function assignDispute(
        uint256 escrowId,
        address initiator,
        string memory reason,
        string memory evidence
    ) external onlyEscrowManager returns (address) {
        require(disputes[escrowId].createdAt == 0, "Dispute already exists");
        
        // Find available arbitrator
        address arbitrator = _findAvailableArbitrator();
        require(arbitrator != address(0), "No available arbitrators");
        
        disputes[escrowId] = DisputeCase({
            escrowId: escrowId,
            initiator: initiator,
            arbitrator: arbitrator,
            reason: reason,
            evidence: evidence,
            createdAt: block.timestamp,
            deadline: block.timestamp + ARBITRATION_TIMEOUT,
            status: DisputeStatus.UnderReview,
            buyerWins: false,
            arbitratorFee: ARBITRATOR_FEE
        });
        
        arbitratorCases[arbitrator].push(escrowId);
        arbitrators[arbitrator].totalCases++;
        arbitrators[arbitrator].lastActive = block.timestamp;
        totalDisputes++;
        
        emit DisputeAssigned(escrowId, arbitrator);
        
        return arbitrator;
    }

    function resolveDispute(uint256 escrowId, bool buyerWins, string memory reasoning) 
        external 
        onlyArbitrator 
        nonReentrant 
    {
        DisputeCase storage dispute = disputes[escrowId];
        require(dispute.arbitrator == msg.sender, "Not assigned arbitrator");
        require(dispute.status == DisputeStatus.UnderReview, "Not under review");
        require(block.timestamp <= dispute.deadline, "Arbitration timeout");
        
        dispute.status = DisputeStatus.Resolved;
        dispute.buyerWins = buyerWins;
        
        // Update arbitrator stats
        arbitrators[msg.sender].successfulCases++;
        
        // Pay arbitrator fee
        (bool success, ) = msg.sender.call{value: dispute.arbitratorFee}("");
        require(success, "Arbitrator fee payment failed");
        
        // Call escrow manager to resolve
        IEscrowManager(escrowManager).resolveDispute(escrowId, buyerWins);
        
        emit DisputeResolved(escrowId, msg.sender, buyerWins);
    }

    function slashArbitrator(address arbitrator, uint256 amount) external onlyOwner {
        Arbitrator storage arb = arbitrators[arbitrator];
        require(arb.active, "Arbitrator not active");
        require(amount <= arb.stake, "Amount exceeds stake");
        
        arb.stake -= amount;
        
        if (arb.stake == 0) {
            arb.active = false;
        }
        
        emit ArbitratorStakeSlashed(arbitrator, amount);
    }

    function _findAvailableArbitrator() internal view returns (address) {
        // Simple round-robin selection
        // In production, this could be more sophisticated (reputation-based, load balancing, etc.)
        uint256 currentBlock = block.number;
        uint256 arbitratorIndex = currentBlock % totalArbitrators;
        
        uint256 count = 0;
        for (uint256 i = 0; i < totalArbitrators; i++) {
            address arbitrator = address(uint160(arbitratorIndex + i));
            if (arbitrators[arbitrator].active) {
                count++;
                if (count > arbitratorIndex) {
                    return arbitrator;
                }
            }
        }
        
        return address(0);
    }

    function getArbitratorStats(address arbitrator) external view returns (
        uint256 totalCases,
        uint256 successfulCases,
        uint256 successRate,
        bool active
    ) {
        Arbitrator memory arb = arbitrators[arbitrator];
        totalCases = arb.totalCases;
        successfulCases = arb.successfulCases;
        successRate = arb.totalCases > 0 ? (arb.successfulCases * 100) / arb.totalCases : 0;
        active = arb.active;
    }

    function getDispute(uint256 escrowId) external view returns (DisputeCase memory) {
        return disputes[escrowId];
    }

    function getArbitratorCases(address arbitrator) external view returns (uint256[] memory) {
        return arbitratorCases[arbitrator];
    }

    function isArbitratorActive(address arbitrator) external view returns (bool) {
        return arbitrators[arbitrator].active;
    }

    receive() external payable {}
}

interface IEscrowManager {
    function resolveDispute(uint256 escrowId, bool buyerWins) external;
}
