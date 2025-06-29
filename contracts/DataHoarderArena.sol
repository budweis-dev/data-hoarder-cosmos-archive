
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
    }

    struct FileData {
        string fileName;
        string fileHash;
        uint256 fileSize;
        string category;
        address uploader;
        uint256 timestamp;
    }

    mapping(address => Player) public players;
    mapping(address => FileData[]) public playerFiles;
    address[] public playerAddresses;

    event PlayerRegistered(address indexed player, string username);
    event FileUploaded(address indexed player, string fileName, uint256 xpGained);
    event XPAdded(address indexed player, uint256 amount, string category);

    function registerPlayer(string memory username) public {
        require(!players[msg.sender].isRegistered, "Player already registered");
        require(bytes(username).length > 0, "Username cannot be empty");

        players[msg.sender] = Player({
            username: username,
            totalXP: 0,
            level: 1,
            storageUsed: 0,
            downloadSpeed: 100,
            isRegistered: true
        });

        playerAddresses.push(msg.sender);
        emit PlayerRegistered(msg.sender, username);
    }

    function getPlayer(address playerAddr) public view returns (Player memory) {
        require(players[playerAddr].isRegistered, "Player not registered");
        return players[playerAddr];
    }

    function uploadFile(
        string memory fileName,
        string memory fileHash,
        uint256 fileSize,
        string memory category
    ) public {
        require(players[msg.sender].isRegistered, "Player not registered");

        FileData memory newFile = FileData({
            fileName: fileName,
            fileHash: fileHash,
            fileSize: fileSize,
            category: category,
            uploader: msg.sender,
            timestamp: block.timestamp
        });

        playerFiles[msg.sender].push(newFile);

        // Calculate XP based on file size (1 MB = 10 XP)
        uint256 xpGained = (fileSize / (1024 * 1024)) * 10;
        if (xpGained == 0) xpGained = 1; // Minimum 1 XP

        addXP(msg.sender, xpGained, category);
        emit FileUploaded(msg.sender, fileName, xpGained);
    }

    function addXP(address player, uint256 amount, string memory category) public {
        require(players[player].isRegistered, "Player not registered");

        players[player].totalXP += amount;
        players[player].storageUsed += uint64(amount * 1024); // Simulate storage usage

        // Level up logic: every 100 XP = 1 level
        uint16 newLevel = uint16(players[player].totalXP / 100) + 1;
        if (newLevel > players[player].level) {
            players[player].level = newLevel;
            players[player].downloadSpeed += 10; // Increase download speed with level
        }

        emit XPAdded(player, amount, category);
    }

    function getLeaderboard(uint256 limit) public view returns (address[] memory, uint256[] memory) {
        uint256 playerCount = playerAddresses.length;
        if (limit > playerCount) limit = playerCount;

        address[] memory topPlayers = new address[](limit);
        uint256[] memory topScores = new uint256[](limit);

        // Simple sorting (not gas-efficient for large arrays, but good for demo)
        for (uint256 i = 0; i < limit; i++) {
            uint256 maxXP = 0;
            address maxPlayer = address(0);
            uint256 maxIndex = 0;

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
                        maxIndex = j;
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

    function getTotalPlayers() public view returns (uint256) {
        return playerAddresses.length;
    }
}
