
const fs = require("fs");
const path = require("path");

function updateWeb3Config() {
  try {
    // Read contract addresses
    const addressesPath = path.join(__dirname, "..", "contract-addresses.json");
    if (!fs.existsSync(addressesPath)) {
      console.error("contract-addresses.json not found!");
      process.exit(1);
    }

    const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
    
    // Read existing web3 config
    const configPath = path.join(__dirname, "..", "src", "config", "web3.ts");
    let configContent = fs.readFileSync(configPath, "utf8");

    // Update contract addresses
    configContent = configContent.replace(
      /DATA_HOARDER_ARENA:\s*['"`][^'"`]*['"`]/,
      `DATA_HOARDER_ARENA: '${addresses.DataHoarderArena}'`
    );
    
    configContent = configContent.replace(
      /FORUM_VOTING:\s*['"`][^'"`]*['"`]/,
      `FORUM_VOTING: '${addresses.ForumVoting}'`
    );

    // Write updated config
    fs.writeFileSync(configPath, configContent);
    console.log("Web3 config updated with new contract addresses");
    
  } catch (error) {
    console.error("Error updating web3 config:", error);
    process.exit(1);
  }
}

updateWeb3Config();
