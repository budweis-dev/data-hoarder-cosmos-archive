
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DataHoarderArena {
    struct Player {
        string username;
        uint256 totalXP;
        uint16 level;
        uint64 storageUsed;
        uint32 downloadSpeed;
        bool isRegistered;
        uint256 registrationTime;
        uint256 lastActiveTime;
        mapping(string => uint256) categoryXP;
    }

    struct FileData {
        string fileName;
        string fileHash;
        uint256 fileSize;
        string category;
        address uploader;
        uint256 timestamp;
        bool isVerified;
        uint256 downloadCount;
    }

    struct Achievement {
        string name;
        string description;
        string category;
        uint256 xpReward;
        bool isActive;
    }

    mapping(address => Player) public players;
    mapping(address => FileData[]) public playerFiles;
    mapping(address => mapping(uint256 => bool)) public playerAchievements;
    mapping(string => bool) public usernamesTaken;
    address[] public playerAddresses;
    Achievement[] public achievements;

    // Events
    event PlayerRegistered(address indexed player, string username, uint256 timestamp);
    event PlayerUpdated(address indexed player, string field, uint256 value);
    event FileUploaded(address indexed player, string fileName, uint256 xpGained, string category);
    event XPAdded(address indexed player, uint256 amount, string category);
    event LevelUp(address indexed player, uint16 newLevel);
    event AchievementUnlocked(address indexed player, uint256 achievementId);
    event FileVerified(address indexed player, uint256 fileIndex, address verifier);

    // Modifiers
    modifier onlyRegistered() {
        require(players[msg.sender].isRegistered, "Player not registered");
        _;
    }

    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }

    constructor() {
        _initializeAchievements();
    }

    function registerPlayer(string memory username) public {
        require(!players[msg.sender].isRegistered, "Player already registered");
        require(bytes(username).length > 0 && bytes(username).length <= 50, "Invalid username length");
        require(!usernamesTaken[username], "Username already taken");

        players[msg.sender].username = username;
        players[msg.sender].totalXP = 0;
        players[msg.sender].level = 1;
        players[msg.sender].storageUsed = 0;
        players[msg.sender].downloadSpeed = 100;
        players[msg.sender].isRegistered = true;
        players[msg.sender].registrationTime = block.timestamp;
        players[msg.sender].lastActiveTime = block.timestamp;

        usernamesTaken[username] = true;
        playerAddresses.push(msg.sender);
        
        emit PlayerRegistered(msg.sender, username, block.timestamp);
    }

    function getPlayer(address playerAddr) public view validAddress(playerAddr) returns (
        string memory username,
        uint256 totalXP,
        uint16 level,
        uint64 storageUsed,
        uint32 downloadSpeed
    ) {
        require(players[playerAddr].isRegistered, "Player not registered");
        Player storage player = players[playerAddr];
        return (
            player.username,
            player.totalXP,
            player.level,
            player.storageUsed,
            player.downloadSpeed
        );
    }

    function getPlayerStats(address playerAddr) public view validAddress(playerAddr) returns (
        uint256 registrationTime,
        uint256 lastActiveTime,
        uint256 filesUploaded,
        uint256 totalDownloads
    ) {
        require(players[playerAddr].isRegistered, "Player not registered");
        Player storage player = players[playerAddr];
        
        uint256 totalDownloads = 0;
        FileData[] storage files = playerFiles[playerAddr];
        for (uint i = 0; i < files.length; i++) {
            totalDownloads += files[i].downloadCount;
        }
        
        return (
            player.registrationTime,
            player.lastActiveTime,
            files.length,
            totalDownloads
        );
    }

    function getCategoryXP(address playerAddr, string memory category) public view returns (uint256) {
        require(players[playerAddr].isRegistered, "Player not registered");
        return players[playerAddr].categoryXP[category];
    }

    function uploadFile(
        string memory fileName,
        string memory fileHash,
        uint256 fileSize,
        string memory category
    ) public onlyRegistered {
        require(bytes(fileName).length > 0, "File name cannot be empty");
        require(bytes(fileHash).length > 0, "File hash cannot be empty");
        require(fileSize > 0, "File size must be greater than 0");
        require(bytes(category).length > 0, "Category cannot be empty");

        FileData memory newFile = FileData({
            fileName: fileName,
            fileHash: fileHash,
            fileSize: fileSize,
            category: category,
            uploader: msg.sender,
            timestamp: block.timestamp,
            isVerified: false,
            downloadCount: 0
        });

        playerFiles[msg.sender].push(newFile);

        // Calculate XP based on file size (1 MB = 10 XP, minimum 1 XP)
        uint256 xpGained = (fileSize / (1024 * 1024)) * 10;
        if (xpGained == 0) xpGained = 1;

        // Bonus XP for rare categories
        if (keccak256(abi.encodePacked(category)) == keccak256(abi.encodePacked("rare")) ||
            keccak256(abi.encodePacked(category)) == keccak256(abi.encodePacked("historical"))) {
            xpGained = xpGained * 2;
        }

        addXP(msg.sender, xpGained, category);
        _updateLastActive(msg.sender);
        
        emit FileUploaded(msg.sender, fileName, xpGained, category);
        _checkAchievements(msg.sender);
    }

    function verifyFile(address uploader, uint256 fileIndex) public onlyRegistered {
        require(uploader != msg.sender, "Cannot verify own files");
        require(fileIndex < playerFiles[uploader].length, "File does not exist");
        require(!playerFiles[uploader][fileIndex].isVerified, "File already verified");

        playerFiles[uploader][fileIndex].isVerified = true;
        
        // Reward both verifier and uploader
        addXP(msg.sender, 5, "verification");
        addXP(uploader, 10, playerFiles[uploader][fileIndex].category);
        
        emit FileVerified(uploader, fileIndex, msg.sender);
    }

    function downloadFile(address uploader, uint256 fileIndex) public onlyRegistered {
        require(fileIndex < playerFiles[uploader].length, "File does not exist");
        
        playerFiles[uploader][fileIndex].downloadCount++;
        addXP(uploader, 1, "sharing");
        addXP(msg.sender, 1, "learning");
        
        _updateLastActive(msg.sender);
    }

    function addXP(address player, uint256 amount, string memory category) public {
        require(players[player].isRegistered, "Player not registered");
        require(amount > 0, "XP amount must be greater than 0");

        uint16 oldLevel = players[player].level;
        
        players[player].totalXP += amount;
        players[player].categoryXP[category] += amount;
        players[player].storageUsed += uint64(amount * 1024); // Simulate storage usage

        // Level up logic: every 100 XP = 1 level
        uint16 newLevel = uint16(players[player].totalXP / 100) + 1;
        if (newLevel > players[player].level) {
            players[player].level = newLevel;
            players[player].downloadSpeed += 10; // Increase download speed with level
            emit LevelUp(player, newLevel);
        }

        emit XPAdded(player, amount, category);
    }

    function getLeaderboard(uint256 limit) public view returns (address[] memory, uint256[] memory) {
        uint256 playerCount = playerAddresses.length;
        if (limit > playerCount) limit = playerCount;

        address[] memory topPlayers = new address[](limit);
        uint256[] memory topScores = new uint256[](limit);

        // Simple sorting algorithm
        for (uint256 i = 0; i < limit; i++) {
            uint256 maxXP = 0;
            address maxPlayer = address(0);

            for (uint256 j = 0; j < playerCount; j++) {
                address currentPlayer = playerAddresses[j];
                if (players[currentPlayer].totalXP > maxXP) {
                    bool alreadyInTop = false;
                    for (uint256 k = 0; k < i; k++) {
                        if (topPlayers[k] == currentPlayer) {
                            alreadyInTop = true;
                            break;
                        }
                    }
                    if (!alreadyInTop) {
                        maxXP = players[currentPlayer].totalXP;
                        maxPlayer = currentPlayer;
                    }
                }
            }

            if (maxPlayer != address(0)) {
                topPlayers[i] = maxPlayer;
                topScores[i] = maxXP;
            }
        }

        return (topPlayers, topScores);
    }

    function getCategoryLeaderboard(string memory category, uint256 limit) public view returns (address[] memory, uint256[] memory) {
        uint256 playerCount = playerAddresses.length;
        if (limit > playerCount) limit = playerCount;

        address[] memory topPlayers = new address[](limit);
        uint256[] memory topScores = new uint256[](limit);

        for (uint256 i = 0; i < limit; i++) {
            uint256 maxXP = 0;
            address maxPlayer = address(0);

            for (uint256 j = 0; j < playerCount; j++) {
                address currentPlayer = playerAddresses[j];
                uint256 categoryXP = players[currentPlayer].categoryXP[category];
                if (categoryXP > maxXP) {
                    bool alreadyInTop = false;
                    for (uint256 k = 0; k < i; k++) {
                        if (topPlayers[k] == currentPlayer) {
                            alreadyInTop = true;
                            break;
                        }
                    }
                    if (!alreadyInTop) {
                        maxXP = categoryXP;
                        maxPlayer = currentPlayer;
                    }
                }
            }

            if (maxPlayer != address(0)) {
                topPlayers[i] = maxPlayer;
                topScores[i] = maxXP;
            }
        }

        return (topPlayers, topScores);
    }

    function getPlayerFiles(address player) public view returns (FileData[] memory) {
        return playerFiles[player];
    }

    function getPlayerAchievements(address player) public view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < achievements.length; i++) {
            if (playerAchievements[player][i]) {
                count++;
            }
        }
        
        uint256[] memory playerAchievementIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < achievements.length; i++) {
            if (playerAchievements[player][i]) {
                playerAchievementIds[index] = i;
                index++;
            }
        }
        
        return playerAchievementIds;
    }

    function getTotalPlayers() public view returns (uint256) {
        return playerAddresses.length;
    }

    function getContractStats() public view returns (
        uint256 totalPlayers,
        uint256 totalFiles,
        uint256 totalXPDistributed
    ) {
        uint256 totalFiles = 0;
        uint256 totalXP = 0;
        
        for (uint256 i = 0; i < playerAddresses.length; i++) {
            address player = playerAddresses[i];
            totalFiles += playerFiles[player].length;
            totalXP += players[player].totalXP;
        }
        
        return (playerAddresses.length, totalFiles, totalXP);
    }

    // Internal functions
    function _updateLastActive(address player) internal {
        players[player].lastActiveTime = block.timestamp;
    }

    function _initializeAchievements() internal {
        achievements.push(Achievement("First Upload", "Upload your first file", "upload", 50, true));
        achievements.push(Achievement("Data Collector", "Upload 10 files", "upload", 100, true));
        achievements.push(Achievement("Knowledge Seeker", "Download 50 files", "download", 75, true));
        achievements.push(Achievement("Verifier", "Verify 25 files", "verification", 150, true));
        achievements.push(Achievement("Level Master", "Reach level 10", "level", 200, true));
        achievements.push(Achievement("Category Expert", "Earn 1000 XP in a single category", "category", 300, true));
    }

    function _checkAchievements(address player) internal {
        // Check various achievement conditions
        uint256 fileCount = playerFiles[player].length;
        uint16 level = players[player].level;
        
        // First Upload
        if (fileCount == 1 && !playerAchievements[player][0]) {
            playerAchievements[player][0] = true;
            addXP(player, achievements[0].xpReward, achievements[0].category);
            emit AchievementUnlocked(player, 0);
        }
        
        // Data Collector (10 files)
        if (fileCount >= 10 && !playerAchievements[player][1]) {
            playerAchievements[player][1] = true;
            addXP(player, achievements[1].xpReward, achievements[1].category);
            emit AchievementUnlocked(player, 1);
        }
        
        // Level Master (level 10)
        if (level >= 10 && !playerAchievements[player][4]) {
            playerAchievements[player][4] = true;
            addXP(player, achievements[4].xpReward, achievements[4].category);
            emit AchievementUnlocked(player, 4);
        }
    }
}
