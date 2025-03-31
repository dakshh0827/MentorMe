// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MentorTipJar {
    // Mapping to store total tips for each mentor
    mapping(address => uint256) public mentorTips;

    // Event to log a tip transaction
    event TipSent(address indexed mentor, address indexed tipper, uint256 amount);

    // Payable function to tip a mentor
    function tipMentor(address mentor) public payable {
        require(msg.value > 0, "Tip must be greater than zero");
        mentorTips[mentor] += msg.value;
        emit TipSent(mentor, msg.sender, msg.value);
    }

    // Function to view total tips for a mentor (in wei)
    function getTotalTips(address mentor) public view returns (uint256) {
        return mentorTips[mentor];
    }
}
