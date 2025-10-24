// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/ILinkaProtocol.sol";

contract PaymentProcessor is ReentrancyGuard, Ownable {
    struct FeeDistribution {
        uint256 protocolFee;
        uint256 referrerFee;
        address referrer;
    }
    
    mapping(address => uint256) public protocolFees;
    mapping(address => uint256) public referrerFees;
    mapping(address => bool) public supportedTokens;
    
    address public escrowManager;
    address public treasury;
    uint256 public constant PROTOCOL_FEE_PERCENT = 200; // 2%
    uint256 public constant REFERRER_FEE_PERCENT = 50;  // 0.5%
    
    event PaymentProcessed(
        address indexed token,
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 protocolFee,
        uint256 referrerFee
    );
    
    event TokenSupported(address indexed token, bool supported);
    
    constructor(address _treasury) Ownable(msg.sender) {
        treasury = _treasury;
        supportedTokens[address(0)] = true; // ETH
    }

    function setEscrowManager(address _escrowManager) external onlyOwner {
        escrowManager = _escrowManager;
    }

    function setSupportedToken(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        emit TokenSupported(token, supported);
    }

    function processPayment(
        address token,
        address from,
        address to,
        uint256 amount,
        address referrer
    ) external nonReentrant returns (FeeDistribution memory) {
        require(msg.sender == escrowManager, "Only escrow manager");
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        FeeDistribution memory fees = calculateFees(amount, referrer);
        
        if (token == address(0)) {
            // ETH payment
            require(address(this).balance >= amount, "Insufficient ETH balance");
            
            // Transfer to recipient
            (bool success, ) = to.call{value: amount - fees.protocolFee - fees.referrerFee}("");
            require(success, "ETH transfer failed");
            
            // Collect protocol fee
            if (fees.protocolFee > 0) {
                protocolFees[treasury] += fees.protocolFee;
            }
            
            // Collect referrer fee
            if (fees.referrerFee > 0 && referrer != address(0)) {
                referrerFees[referrer] += fees.referrerFee;
            }
        } else {
            // ERC20 payment
            IERC20(token).transferFrom(from, address(this), amount);
            
            // Transfer to recipient
            IERC20(token).transfer(to, amount - fees.protocolFee - fees.referrerFee);
            
            // Collect protocol fee
            if (fees.protocolFee > 0) {
                protocolFees[treasury] += fees.protocolFee;
            }
            
            // Collect referrer fee
            if (fees.referrerFee > 0 && referrer != address(0)) {
                referrerFees[referrer] += fees.referrerFee;
            }
        }
        
        emit PaymentProcessed(token, from, to, amount, fees.protocolFee, fees.referrerFee);
        
        return fees;
    }

    function calculateFees(uint256 amount, address referrer) 
        public 
        pure 
        returns (FeeDistribution memory) 
    {
        uint256 protocolFee = (amount * PROTOCOL_FEE_PERCENT) / 10000;
        uint256 referrerFee = 0;
        
        if (referrer != address(0)) {
            referrerFee = (amount * REFERRER_FEE_PERCENT) / 10000;
        }
        
        return FeeDistribution({
            protocolFee: protocolFee,
            referrerFee: referrerFee,
            referrer: referrer
        });
    }

    function withdrawProtocolFees(address token) external onlyOwner {
        uint256 amount = protocolFees[treasury];
        require(amount > 0, "No fees to withdraw");
        
        protocolFees[treasury] = 0;
        
        if (token == address(0)) {
            (bool success, ) = treasury.call{value: amount}("");
            require(success, "ETH withdrawal failed");
        } else {
            IERC20(token).transfer(treasury, amount);
        }
    }

    function withdrawReferrerFees(address token, address referrer) external {
        uint256 amount = referrerFees[referrer];
        require(amount > 0, "No fees to withdraw");
        require(msg.sender == referrer || msg.sender == owner(), "Not authorized");
        
        referrerFees[referrer] = 0;
        
        if (token == address(0)) {
            (bool success, ) = referrer.call{value: amount}("");
            require(success, "ETH withdrawal failed");
        } else {
            IERC20(token).transfer(referrer, amount);
        }
    }

    function getFees(address token, address account) external view returns (uint256) {
        if (token == address(0)) {
            return protocolFees[account] + referrerFees[account];
        } else {
            return protocolFees[account] + referrerFees[account];
        }
    }

    receive() external payable {}
}
