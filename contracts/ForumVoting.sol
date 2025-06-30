
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
        uint256 endTime;
        mapping(address => bool) hasVoted;
        mapping(address => bool) voteChoice;
        string[] tags;
        uint256 requiredLevel;
    }

    struct Comment {
        address author;
        string content;
        uint256 timestamp;
        uint256 upvotes;
        uint256 downvotes;
        bool isHidden;
        mapping(address => int8) userVotes; // -1 downvote, 0 no vote, 1 upvote
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => Comment[]) public proposalComments;
    mapping(address => bool) public hasVoted;
    mapping(address => uint256[]) public userProposals;
    mapping(string => uint256[]) public categoryProposals;
    uint256 public proposalCount;
    
    address public dataHoarderArena;
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId, 
        address indexed creator, 
        string title, 
        string category,
        uint256 endTime
    );
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalClosed(uint256 indexed proposalId, bool passed);
    event CommentAdded(uint256 indexed proposalId, address indexed author, uint256 commentIndex);
    event CommentVoted(uint256 indexed proposalId, uint256 commentIndex, address indexed voter, int8 vote);

    modifier onlyActiveProposal(uint256 proposalId) {
        require(proposalId < proposalCount, "Proposal does not exist");
        require(proposals[proposalId].isActive, "Proposal is not active");
        require(block.timestamp < proposals[proposalId].endTime, "Proposal has ended");
        _;
    }

    modifier onlyRegisteredPlayer() {
        if (dataHoarderArena != address(0)) {
            // Check if user is registered in DataHoarderArena
            (bool success, bytes memory data) = dataHoarderArena.staticcall(
                abi.encodeWithSignature("players(address)", msg.sender)
            );
            require(success, "Failed to check player registration");
            require(data.length > 0, "Player not registered");
        }
        _;
    }

    constructor() {
        // dataHoarderArena can be set later via setDataHoarderArena function
    }

    function setDataHoarderArena(address _dataHoarderArena) public {
        require(dataHoarderArena == address(0), "DataHoarderArena already set");
        require(_dataHoarderArena != address(0), "Invalid address");
        dataHoarderArena = _dataHoarderArena;
    }

    function createProposal(
        string memory title,
        string memory description,
        string memory category,
        uint256 duration, // in seconds
        string[] memory tags,
        uint256 requiredLevel
    ) public onlyRegisteredPlayer returns (uint256) {
        require(bytes(title).length > 0 && bytes(title).length <= 200, "Invalid title length");
        require(bytes(description).length > 0 && bytes(description).length <= 2000, "Invalid description length");
        require(bytes(category).length > 0, "Category cannot be empty");
        require(duration >= 1 hours && duration <= 30 days, "Invalid duration");
        require(tags.length <= 10, "Too many tags");

        uint256 proposalId = proposalCount++;
        uint256 endTime = block.timestamp + duration;

        proposals[proposalId].id = proposalId;
        proposals[proposalId].title = title;
        proposals[proposalId].description = description;
        proposals[proposalId].category = category;
        proposals[proposalId].creator = msg.sender;
        proposals[proposalId].votesFor = 0;
        proposals[proposalId].votesAgainst = 0;
        proposals[proposalId].isActive = true;
        proposals[proposalId].timestamp = block.timestamp;
        proposals[proposalId].endTime = endTime;
        proposals[proposalId].tags = tags;
        proposals[proposalId].requiredLevel = requiredLevel;

        userProposals[msg.sender].push(proposalId);
        categoryProposals[category].push(proposalId);

        emit ProposalCreated(proposalId, msg.sender, title, category, endTime);
        return proposalId;
    }

    function vote(uint256 proposalId, bool support) public onlyActiveProposal(proposalId) onlyRegisteredPlayer {
        require(!proposals[proposalId].hasVoted[msg.sender], "Already voted on this proposal");

        // Check if user meets level requirement
        if (dataHoarderArena != address(0) && proposals[proposalId].requiredLevel > 0) {
            (bool success, bytes memory data) = dataHoarderArena.staticcall(
                abi.encodeWithSignature("getPlayer(address)", msg.sender)
            );
            if (success && data.length > 0) {
                (, , uint16 level, ,) = abi.decode(data, (string, uint256, uint16, uint64, uint32));
                require(level >= proposals[proposalId].requiredLevel, "Insufficient level to vote");
            }
        }

        proposals[proposalId].hasVoted[msg.sender] = true;
        proposals[proposalId].voteChoice[msg.sender] = support;

        if (support) {
            proposals[proposalId].votesFor++;
        } else {
            proposals[proposalId].votesAgainst++;
        }

        emit VoteCast(proposalId, msg.sender, support);
    }

    function addComment(uint256 proposalId, string memory content) public onlyRegisteredPlayer {
        require(proposalId < proposalCount, "Proposal does not exist");
        require(bytes(content).length > 0 && bytes(content).length <= 1000, "Invalid comment length");

        Comment storage newComment = proposalComments[proposalId].push();
        newComment.author = msg.sender;
        newComment.content = content;
        newComment.timestamp = block.timestamp;
        newComment.upvotes = 0;
        newComment.downvotes = 0;
        newComment.isHidden = false;

        emit CommentAdded(proposalId, msg.sender, proposalComments[proposalId].length - 1);
    }

    function voteOnComment(uint256 proposalId, uint256 commentIndex, int8 vote) public onlyRegisteredPlayer {
        require(proposalId < proposalCount, "Proposal does not exist");
        require(commentIndex < proposalComments[proposalId].length, "Comment does not exist");
        require(vote >= -1 && vote <= 1, "Invalid vote value");

        Comment storage comment = proposalComments[proposalId][commentIndex];
        int8 previousVote = comment.userVotes[msg.sender];

        // Remove previous vote
        if (previousVote == 1) {
            comment.upvotes--;
        } else if (previousVote == -1) {
            comment.downvotes--;
        }

        // Add new vote
        comment.userVotes[msg.sender] = vote;
        if (vote == 1) {
            comment.upvotes++;
        } else if (vote == -1) {
            comment.downvotes++;
        }

        emit CommentVoted(proposalId, commentIndex, msg.sender, vote);
    }

    function closeProposal(uint256 proposalId) public {
        require(proposalId < proposalCount, "Proposal does not exist");
        require(
            proposals[proposalId].creator == msg.sender || 
            block.timestamp >= proposals[proposalId].endTime,
            "Not authorized to close proposal"
        );
        require(proposals[proposalId].isActive, "Proposal already closed");

        proposals[proposalId].isActive = false;
        bool passed = proposals[proposalId].votesFor > proposals[proposalId].votesAgainst;
        
        emit ProposalClosed(proposalId, passed);
    }

    function getProposal(uint256 proposalId) public view returns (
        uint256 id,
        string memory title,
        string memory description,
        string memory category,
        address creator,
        uint256 votesFor,
        uint256 votesAgainst,
        bool isActive,
        uint256 timestamp,
        uint256 endTime,
        string[] memory tags,
        uint256 requiredLevel
    ) {
        require(proposalId < proposalCount, "Proposal does not exist");
        Proposal storage proposal = proposals[proposalId];
        
        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.category,
            proposal.creator,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.isActive,
            proposal.timestamp,
            proposal.endTime,
            proposal.tags,
            proposal.requiredLevel
        );
    }

    function getAllProposals() public view returns (
        uint256[] memory ids,
        string[] memory titles,
        string[] memory categories,
        address[] memory creators,
        uint256[] memory votesFor,
        uint256[] memory votesAgainst,
        bool[] memory isActive,
        uint256[] memory timestamps
    ) {
        ids = new uint256[](proposalCount);
        titles = new string[](proposalCount);
        categories = new string[](proposalCount);
        creators = new address[](proposalCount);
        votesFor = new uint256[](proposalCount);
        votesAgainst = new uint256[](proposalCount);
        isActive = new bool[](proposalCount);
        timestamps = new uint256[](proposalCount);

        for (uint256 i = 0; i < proposalCount; i++) {
            Proposal storage proposal = proposals[i];
            ids[i] = proposal.id;
            titles[i] = proposal.title;
            categories[i] = proposal.category;
            creators[i] = proposal.creator;
            votesFor[i] = proposal.votesFor;
            votesAgainst[i] = proposal.votesAgainst;
            isActive[i] = proposal.isActive && block.timestamp < proposal.endTime;
            timestamps[i] = proposal.timestamp;
        }
    }

    function getProposalsByCategory(string memory category) public view returns (uint256[] memory) {
        return categoryProposals[category];
    }

    function getUserProposals(address user) public view returns (uint256[] memory) {
        return userProposals[user];
    }

    function getProposalComments(uint256 proposalId) public view returns (
        address[] memory authors,
        string[] memory contents,
        uint256[] memory timestamps,
        uint256[] memory upvotes,
        uint256[] memory downvotes,
        bool[] memory isHidden
    ) {
        require(proposalId < proposalCount, "Proposal does not exist");
        
        uint256 commentCount = proposalComments[proposalId].length;
        authors = new address[](commentCount);
        contents = new string[](commentCount);
        timestamps = new uint256[](commentCount);
        upvotes = new uint256[](commentCount);
        downvotes = new uint256[](commentCount);
        isHidden = new bool[](commentCount);

        for (uint256 i = 0; i < commentCount; i++) {
            Comment storage comment = proposalComments[proposalId][i];
            authors[i] = comment.author;
            contents[i] = comment.content;
            timestamps[i] = comment.timestamp;
            upvotes[i] = comment.upvotes;
            downvotes[i] = comment.downvotes;
            isHidden[i] = comment.isHidden;
        }
    }

    function hasUserVoted(uint256 proposalId, address user) public view returns (bool) {
        require(proposalId < proposalCount, "Proposal does not exist");
        return proposals[proposalId].hasVoted[user];
    }

    function getUserVote(uint256 proposalId, address user) public view returns (bool) {
        require(proposalId < proposalCount, "Proposal does not exist");
        require(proposals[proposalId].hasVoted[user], "User has not voted");
        return proposals[proposalId].voteChoice[user];
    }
}
