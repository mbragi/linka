// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ILinkaProtocol.sol";

contract ReputationRegistry is Ownable, ILinkaProtocol {
    struct ReputationData {
        uint256 score;
        uint256 totalTransactions;
        uint256 completedTransactions;
        uint256 disputes;
        uint256 totalVolume;
        uint256 lastUpdated;
        string email;
        bool isVendor;
    }
    
    mapping(address => ReputationData) public reputations;
    mapping(string => address) public emailToAddress;
    
    uint256 public nextTokenId = 1;
    
    event ReputationUpdated(address indexed user, uint256 newReputation);
    event UserRegistered(address indexed user, string email, bool isVendor);

    constructor() Ownable(msg.sender) {}

    function registerUser(address user, string calldata email, bool vendorStatus) external onlyOwner {
        require(reputations[user].lastUpdated == 0, "User already registered");
        
        reputations[user] = ReputationData({
            score: 500, // Starting reputation
            totalTransactions: 0,
            completedTransactions: 0,
            disputes: 0,
            totalVolume: 0,
            lastUpdated: block.timestamp,
            email: email,
            isVendor: vendorStatus
        });
        
        emailToAddress[email] = user;
        emit UserRegistered(user, email, vendorStatus);
    }

    function updateReputation(address user, uint256 newReputation) external onlyOwner {
        require(reputations[user].lastUpdated > 0, "User not registered");
        require(newReputation >= 0 && newReputation <= 1000, "Invalid reputation score");
        
        reputations[user].score = newReputation;
        reputations[user].lastUpdated = block.timestamp;
        
        emit ReputationUpdated(user, newReputation);
    }

    function updateTransactionStats(
        address user,
        uint256 totalTransactions,
        uint256 completedTransactions,
        uint256 disputes,
        uint256 totalVolume
    ) external onlyOwner {
        require(reputations[user].lastUpdated > 0, "User not registered");
        
        reputations[user].totalTransactions = totalTransactions;
        reputations[user].completedTransactions = completedTransactions;
        reputations[user].disputes = disputes;
        reputations[user].totalVolume = totalVolume;
        reputations[user].lastUpdated = block.timestamp;
    }

    function getReputation(address user) external view returns (uint256) {
        return reputations[user].score;
    }

    function getReputationData(address user) external view returns (ReputationData memory) {
        return reputations[user];
    }

    function getUserByEmail(string calldata email) external view returns (address) {
        return emailToAddress[email];
    }

    function isUserRegistered(address user) external view returns (bool) {
        return reputations[user].lastUpdated > 0;
    }

    function isVendor(address user) external view returns (bool) {
        return reputations[user].isVendor;
    }
}