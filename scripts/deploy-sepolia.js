
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying contracts to Sepolia...");

  // Deploy DataHoarderArena
  const DataHoarderArena = await hre.ethers.getContractFactory("DataHoarderArena");
  const dataHoarderArena = await DataHoarderArena.deploy();
  await dataHoarderArena.waitForDeployment();

  // Deploy ForumVoting
  const ForumVoting = await hre.ethers.getContractFactory("ForumVoting");
  const forumVoting = await ForumVoting.deploy();
  await forumVoting.waitForDeployment();

  const dataHoarderAddress = await dataHoarderArena.getAddress();
  const forumVotingAddress = await forumVoting.getAddress();

  console.log("DataHoarderArena deployed to:", dataHoarderAddress);
  console.log("ForumVoting deployed to:", forumVotingAddress);

  // Save addresses to contract-addresses.json
  const addresses = {
    DataHoarderArena: dataHoarderAddress,
    ForumVoting: forumVotingAddress,
    network: "sepolia",
    chainId: 11155111,
  };

  fs.writeFileSync("contract-addresses.json", JSON.stringify(addresses, null, 2));
  console.log("Contract addresses saved to contract-addresses.json");

  // Verify contracts on Etherscan if API key is provided
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await dataHoarderArena.deploymentTransaction().wait(6);
    await forumVoting.deploymentTransaction().wait(6);

    try {
      console.log("Verifying DataHoarderArena...");
      await hre.run("verify:verify", {
        address: dataHoarderAddress,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("DataHoarderArena verification failed:", error.message);
    }

    try {
      console.log("Verifying ForumVoting...");
      await hre.run("verify:verify", {
        address: forumVotingAddress,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("ForumVoting verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
