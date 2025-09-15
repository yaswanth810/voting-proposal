// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VotingSystem {
    address public admin;
    uint256 public proposalCounter;
    
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        bool active;
        address creator;
        string category;
    }
    
    struct Vote {
        bool hasVoted;
        bool voteChoice; // true for yes, false for no
        uint256 timestamp;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => bool) public registeredVoters;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(address => bool) public admins;
    
    uint256[] public activeProposals;
    
    event VoterRegistered(address indexed voter);
    event VoterUnregistered(address indexed voter);
    event ProposalCreated(uint256 indexed proposalId, string title, address indexed creator);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool voteChoice);
    event ProposalEnded(uint256 indexed proposalId);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyRegisteredVoter() {
        require(registeredVoters[msg.sender], "Only registered voters can vote");
        _;
    }
    
    modifier validProposal(uint256 _proposalId) {
        require(_proposalId > 0 && _proposalId <= proposalCounter, "Invalid proposal ID");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        admins[msg.sender] = true;
        proposalCounter = 0;
    }
    
    function addAdmin(address _admin) external onlyAdmin {
        require(_admin != address(0), "Invalid admin address");
        require(!admins[_admin], "Address is already an admin");
        admins[_admin] = true;
        emit AdminAdded(_admin);
    }
    
    function removeAdmin(address _admin) external onlyAdmin {
        require(_admin != admin, "Cannot remove main admin");
        require(admins[_admin], "Address is not an admin");
        admins[_admin] = false;
        emit AdminRemoved(_admin);
    }
    
    function registerVoter(address _voter) external onlyAdmin {
        require(_voter != address(0), "Invalid voter address");
        require(!registeredVoters[_voter], "Voter already registered");
        registeredVoters[_voter] = true;
        emit VoterRegistered(_voter);
    }
    
    function registerVoters(address[] calldata _voters) external onlyAdmin {
        for (uint256 i = 0; i < _voters.length; i++) {
            if (_voters[i] != address(0) && !registeredVoters[_voters[i]]) {
                registeredVoters[_voters[i]] = true;
                emit VoterRegistered(_voters[i]);
            }
        }
    }
    
    function unregisterVoter(address _voter) external onlyAdmin {
        require(registeredVoters[_voter], "Voter not registered");
        registeredVoters[_voter] = false;
        emit VoterUnregistered(_voter);
    }
    
    function createProposal(
        string calldata _title,
        string calldata _description,
        uint256 _durationInMinutes,
        string calldata _category
    ) external onlyAdmin returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_durationInMinutes > 0, "Duration must be greater than 0");
        
        proposalCounter++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + (_durationInMinutes * 60);
        
        proposals[proposalCounter] = Proposal({
            id: proposalCounter,
            title: _title,
            description: _description,
            startTime: startTime,
            endTime: endTime,
            yesVotes: 0,
            noVotes: 0,
            active: true,
            creator: msg.sender,
            category: _category
        });
        
        activeProposals.push(proposalCounter);
        
        emit ProposalCreated(proposalCounter, _title, msg.sender);
        return proposalCounter;
    }
    
    function vote(uint256 _proposalId, bool _voteChoice) external onlyRegisteredVoter validProposal(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.active, "Proposal is not active");
        require(block.timestamp >= proposal.startTime, "Voting has not started yet");
        require(block.timestamp <= proposal.endTime, "Voting period has ended");
        require(!votes[_proposalId][msg.sender].hasVoted, "You have already voted on this proposal");
        
        votes[_proposalId][msg.sender] = Vote({
            hasVoted: true,
            voteChoice: _voteChoice,
            timestamp: block.timestamp
        });
        
        if (_voteChoice) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }
        
        emit VoteCast(_proposalId, msg.sender, _voteChoice);
    }
    
    function endProposal(uint256 _proposalId) external onlyAdmin validProposal(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.active, "Proposal is already ended");
        
        proposal.active = false;
        
        // Remove from active proposals array
        for (uint256 i = 0; i < activeProposals.length; i++) {
            if (activeProposals[i] == _proposalId) {
                activeProposals[i] = activeProposals[activeProposals.length - 1];
                activeProposals.pop();
                break;
            }
        }
        
        emit ProposalEnded(_proposalId);
    }
    
    function getProposal(uint256 _proposalId) external view validProposal(_proposalId) returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 yesVotes,
        uint256 noVotes,
        bool active,
        address creator,
        string memory category
    ) {
        Proposal memory proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.active,
            proposal.creator,
            proposal.category
        );
    }
    
    function getVoteCount(uint256 _proposalId) external view validProposal(_proposalId) returns (uint256 yesVotes, uint256 noVotes) {
        Proposal memory proposal = proposals[_proposalId];
        return (proposal.yesVotes, proposal.noVotes);
    }
    
    function hasVoted(uint256 _proposalId, address _voter) external view validProposal(_proposalId) returns (bool) {
        return votes[_proposalId][_voter].hasVoted;
    }
    
    function getVote(uint256 _proposalId, address _voter) external view validProposal(_proposalId) returns (bool voted, bool choice, uint256 timestamp) {
        Vote memory userVote = votes[_proposalId][_voter];
        return (userVote.hasVoted, userVote.voteChoice, userVote.timestamp);
    }
    
    function isRegisteredVoter(address _voter) external view returns (bool) {
        return registeredVoters[_voter];
    }
    
    function isAdmin(address _address) external view returns (bool) {
        return admins[_address] || _address == admin;
    }
    
    function getActiveProposals() external view returns (uint256[] memory) {
        return activeProposals;
    }
    
    function getAllProposals() external view returns (uint256[] memory) {
        uint256[] memory allProposals = new uint256[](proposalCounter);
        for (uint256 i = 1; i <= proposalCounter; i++) {
            allProposals[i - 1] = i;
        }
        return allProposals;
    }
    
    function getProposalStatus(uint256 _proposalId) external view validProposal(_proposalId) returns (string memory) {
        Proposal memory proposal = proposals[_proposalId];
        
        if (!proposal.active) {
            return "ended";
        }
        
        if (block.timestamp < proposal.startTime) {
            return "pending";
        }
        
        if (block.timestamp > proposal.endTime) {
            return "expired";
        }
        
        return "active";
    }
    
    function getTotalVoters() external pure returns (uint256) {
        // Note: This is a simplified implementation
        // In a real scenario, you'd need to track registered voters count
        return 0; // Placeholder
    }
    
    function getProposalResults(uint256 _proposalId) external view validProposal(_proposalId) returns (
        uint256 totalVotes,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 yesPercentage,
        uint256 noPercentage
    ) {
        Proposal memory proposal = proposals[_proposalId];
        totalVotes = proposal.yesVotes + proposal.noVotes;
        
        if (totalVotes == 0) {
            return (0, 0, 0, 0, 0);
        }
        
        yesPercentage = (proposal.yesVotes * 100) / totalVotes;
        noPercentage = (proposal.noVotes * 100) / totalVotes;
        
        return (totalVotes, proposal.yesVotes, proposal.noVotes, yesPercentage, noPercentage);
    }
}
