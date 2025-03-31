// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MentorRewards is ERC20, Ownable {
    // Track completed sessions per mentor
    mapping(address => uint256) public completedSessions;

    // Reward amount per session (in tokens)
    uint256 public rewardPerSession = 5 * 10**18; // 5 tokens with 18 decimals

    // Event for tracking rewards
    event MentorRewarded(address indexed mentor, uint256 amount, uint256 totalSessions);

    constructor() ERC20("MentorRewards", "MTR") Ownable(msg.sender) {
        // Mint initial supply to the contract creator (10,000 tokens)
        _mint(msg.sender, 10000 * 10**18);
    }

    // Function to reward a mentor after session completion
    function rewardMentor(address mentor) public onlyOwner {
        completedSessions[mentor] += 1;
        _transfer(owner(), mentor, rewardPerSession);

        emit MentorRewarded(mentor, rewardPerSession, completedSessions[mentor]);
    }

    // Function to check a mentor's completed sessions and rewards
    function getMentorStats(address mentor) public view returns (uint256 sessions, uint256 rewards) {
        sessions = completedSessions[mentor];
        rewards = sessions * rewardPerSession;
        return (sessions, rewards);
    }
}
