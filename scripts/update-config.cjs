const fs = require("fs");
const path = require("path");

function updateWeb3Config() {
  try {
    console.log("🔧 Updating web3 configuration...");
    
    // Read contract addresses
    const addressesPath = path.join(__dirname, "..", "contract-addresses.json");
    if (!fs.existsSync(addressesPath)) {
      console.error("❌ contract-addresses.json not found!");
      console.log("Make sure contracts are deployed first");
      process.exit(1);
    }

    const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
    console.log("📄 Contract addresses loaded:");
    console.log("- DataHoarderArena:", addresses.DataHoarderArena);
    console.log("- ForumVoting:", addresses.ForumVoting);
    
    // Read existing web3 config
    const configPath = path.join(__dirname, "..", "src", "config", "web3.ts");
    if (!fs.existsSync(configPath)) {
      console.error("❌ web3.ts config file not found!");
      process.exit(1);
    }

    let configContent = fs.readFileSync(configPath, "utf8");

    // Update contract addresses with more robust regex
    const dataHoarderRegex = /DATA_HOARDER_ARENA:\s*['"`][^'"`]*['"`]/;
    const forumVotingRegex = /FORUM_VOTING:\s*['"`][^'"`]*['"`]/;

    if (dataHoarderRegex.test(configContent)) {
      configContent = configContent.replace(
        dataHoarderRegex,
        `DATA_HOARDER_ARENA: '${addresses.DataHoarderArena}'`
      );
      console.log("✅ Updated DataHoarderArena address");
    } else {
      console.warn("⚠️  DataHoarderArena address pattern not found in config");
    }
    
    if (forumVotingRegex.test(configContent)) {
      configContent = configContent.replace(
        forumVotingRegex,
        `FORUM_VOTING: '${addresses.ForumVoting}'`
      );
      console.log("✅ Updated ForumVoting address");
    } else {
      console.warn("⚠️  ForumVoting address pattern not found in config");
    }

    // Update RPC URL if needed (remove placeholder)
    if (configContent.includes('YOUR_INFURA_API_KEY')) {
      const infuraKey = process.env.INFURA_API_KEY;
      if (infuraKey) {
        configContent = configContent.replace(
          'YOUR_INFURA_API_KEY',
          infuraKey
        );
        console.log("✅ Updated Infura API key");
      } else {
        console.warn("⚠️  INFURA_API_KEY not set, keeping placeholder");
      }
    }

    // Write updated config
    fs.writeFileSync(configPath, configContent);
    console.log("✅ Web3 config updated successfully");
    
    // Create backup of old config
    const backupPath = configPath + '.backup.' + Date.now();
    const configDir = path.dirname(configPath);
    const backupFiles = fs.readdirSync(configDir).filter(f => f.includes('web3.ts.backup'));
    
    // Keep only last 3 backups
    if (backupFiles.length >= 3) {
      const oldestBackup = backupFiles.sort()[0];
      fs.unlinkSync(path.join(configDir, oldestBackup));
    }
    
    console.log("💾 Configuration backup created");
    
  } catch (error) {
    console.error("❌ Error updating web3 config:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  updateWeb3Config();
}

module.exports = { updateWeb3Config };
