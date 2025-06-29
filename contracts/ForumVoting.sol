
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ForumVoting {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        string category;
        address creator;
        uint256 votesFor;
        uint256 votesAgainst;
        bool isActive;
        uint256 timestamp;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public proposalCount;

    event ProposalCreated(uint256 indexed proposalId, address indexed creator, string title);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);

    function createProposal(
        string memory title,
        string memory description,
        string memory category
    ) public returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");

        uint256 proposalId = proposalCount++;

        proposals[proposalId] = Proposal({
            id: proposalId,
            title: title,
            description: description,
            category: category,
            creator: msg.sender,
            votesFor: 0,
            votesAgainst: 0,
            isActive: true,
            timestamp: block.timestamp
        });

        emit ProposalCreated(proposalId, msg.sender, title);
        return proposalId;
    }

    function vote(uint256 proposalId, bool support) public {
        require(proposalId < proposalCount, "Proposal does not exist");
        require(proposals[proposalId].isActive, "Proposal is not active");
        require(!hasVoted[proposalId][msg.sender], "Already voted on this proposal");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposals[proposalId].votesFor++;
        } else {
            proposals[proposalId].votesAgainst++;
        }

        emit VoteCast(proposalId, msg.sender, support);
    }

    function getProposal(uint256 proposalId) public view returns (Proposal memory) {
        require(proposalId < proposalCount, "Proposal does not exist");
        return proposals[proposalId];
    }

    function getAllProposals() public view returns (Proposal[] memory) {
        Proposal[] memory allProposals = new Proposal[](proposalCount);
        for (uint256 i = 0; i < proposalCount; i++) {
            allProposals[i] = proposals[i];
        }
        return allProposals;
    }

    function closeProposal(uint256 proposalId) public {
        require(proposalId < proposalCount, "Proposal does not exist");
        require(proposals[proposalId].creator == msg.sender, "Only creator can close proposal");
        require(proposals[proposalId].isActive, "Proposal already closed");

        proposals[proposalId].isActive = false;
    }
}
