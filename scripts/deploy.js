
const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Deploy DataHoarderArena
  const DataHoarderArena = await hre.ethers.getContractFactory("DataHoarderArena");
  const dataHoarderArena = await DataHoarderArena.deploy();
  await dataHoarderArena.waitForDeployment();

  // Deploy ForumVoting
  const ForumVoting = await hre.ethers.getContractFactory("ForumVoting");
  const forumVoting = await ForumVoting.deploy();
  await forumVoting.waitForDeployment();

  console.log("DataHoarderArena deployed to:", await dataHoarderArena.getAddress());
  console.log("ForumVoting deployed to:", await forumVoting.getAddress());

  // Save addresses to a file for easy access
  const fs = require("fs");
  const addresses = {
    DataHoarderArena: await dataHoarderArena.getAddress(),
    ForumVoting: await forumVoting.getAddress(),
  };

  fs.writeFileSync("contract-addresses.json", JSON.stringify(addresses, null, 2));
  console.log("Contract addresses saved to contract-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
