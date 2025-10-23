// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/ILinkaProtocol.sol";

contract ReputationRegistry is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    struct ReputationData {
        uint256 score;
        uint256 totalTransactions;
        uint256 completedTransactions;
        uint256 disputes;
        uint256 totalVolume;
        uint256 lastUpdated;
        string email;
        uint256 farcasterFid;
    }
    
    Counters.Counter private _tokenIdCounter;
    
    mapping(address => ReputationData) public reputations;
    mapping(string => address) public emailToAddress;
    mapping(uint256 => address) public fidToAddress;
    
    uint256 public constant MAX_SCORE = 1000;
    uint256 public constant BASE_SCORE = 500;
    uint256 public constant SCORE_INCREMENT = 10;
    uint256 public constant SCORE_DECREMENT = 20;
    
    event ReputationUpdated(
        address indexed user,
        uint256 newScore,
        uint256 totalTransactions,
        uint256 totalVolume
    );
    
    event UserRegistered(address indexed user, string email, uint256 farcasterFid);
    
    constructor() ERC721("LinkaReputation", "LREP") {
        _transferOwnership(msg.sender);
    }

    function registerUser(
        address user,
        string memory email,
        uint256 farcasterFid
    ) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(bytes(email).length > 0, "Email required");
        require(emailToAddress[email] == address(0), "Email already registered");
        
        if (farcasterFid > 0) {
            require(fidToAddress[farcasterFid] == address(0), "FID already registered");
            fidToAddress[farcasterFid] = user;
        }
        
        emailToAddress[email] = user;
        
        reputations[user] = ReputationData({
            score: BASE_SCORE,
            totalTransactions: 0,
            completedTransactions: 0,
            disputes: 0,
            totalVolume: 0,
            lastUpdated: block.timestamp,
            email: email,
            farcasterFid: farcasterFid
        });
        
        // Mint reputation NFT
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(user, tokenId);
        _setTokenURI(tokenId, _generateTokenURI(user));
        
        emit UserRegistered(user, email, farcasterFid);
    }

    function updateReputation(
        address user,
        bool success,
        uint256 amount
    ) external {
        require(msg.sender == owner(), "Only owner can update reputation");
        require(user != address(0), "Invalid user address");
        
        ReputationData storage rep = reputations[user];
        require(rep.lastUpdated > 0, "User not registered");
        
        rep.totalTransactions++;
        rep.totalVolume += amount;
        
        if (success) {
            rep.completedTransactions++;
            rep.score = _min(MAX_SCORE, rep.score + SCORE_INCREMENT);
        } else {
            rep.disputes++;
            rep.score = rep.score > SCORE_DECREMENT ? rep.score - SCORE_DECREMENT : 0;
        }
        
        rep.lastUpdated = block.timestamp;
        
        emit ReputationUpdated(user, rep.score, rep.totalTransactions, rep.totalVolume);
    }

    function linkFarcasterFid(address user, uint256 farcasterFid) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(farcasterFid > 0, "Invalid FID");
        require(fidToAddress[farcasterFid] == address(0), "FID already linked");
        
        ReputationData storage rep = reputations[user];
        require(rep.lastUpdated > 0, "User not registered");
        
        rep.farcasterFid = farcasterFid;
        fidToAddress[farcasterFid] = user;
    }

    function getUserByEmail(string memory email) external view returns (address) {
        return emailToAddress[email];
    }

    function getUserByFid(uint256 farcasterFid) external view returns (address) {
        return fidToAddress[farcasterFid];
    }

    function getReputation(address user) external view returns (ReputationData memory) {
        return reputations[user];
    }

    function getReputationScore(address user) external view returns (uint256) {
        return reputations[user].score;
    }

    function isUserRegistered(address user) external view returns (bool) {
        return reputations[user].lastUpdated > 0;
    }

    function getReputationTier(address user) external view returns (string memory) {
        uint256 score = reputations[user].score;
        
        if (score >= 900) return "Legendary";
        if (score >= 800) return "Elite";
        if (score >= 700) return "Expert";
        if (score >= 600) return "Professional";
        if (score >= 500) return "Verified";
        if (score >= 300) return "Basic";
        return "New";
    }

    function _generateTokenURI(address user) internal view returns (string memory) {
        ReputationData memory rep = reputations[user];
        string memory tier = this.getReputationTier(user);
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(abi.encodePacked(
                '{"name":"Linka Reputation #', _toString(rep.totalTransactions), '",',
                '"description":"Reputation NFT for ', rep.email, '",',
                '"attributes":[',
                '{"trait_type":"Score","value":', _toString(rep.score), '},',
                '{"trait_type":"Tier","value":"', tier, '"},',
                '{"trait_type":"Transactions","value":', _toString(rep.completedTransactions), '},',
                '{"trait_type":"Volume","value":', _toString(rep.totalVolume), '}',
                ']}'
            ))
        ));
    }

    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        
        string memory result = new string(4 * ((data.length + 2) / 3));
        
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            
            for {
                let i := 0
            } lt(i, mload(data)) {
                i := add(i, 3)
            } {
                let input := and(mload(add(data, add(32, i))), 0xffffff)
                
                let out := mload(add(tablePtr, and(shr(250, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(244, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(238, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(232, input), 0x3F))), 0xFF))
                out := shl(224, out)
                
                mstore(resultPtr, out)
                
                resultPtr := add(resultPtr, 4)
            }
            
            switch mod(mload(data), 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }
        }
        
        return result;
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
