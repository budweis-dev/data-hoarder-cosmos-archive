
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to Sepolia testnet...");
  console.log("Network:", hre.network.name);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance < hre.ethers.parseEther("0.01")) {
    console.warn("⚠️  Warning: Low balance. You might need more ETH for deployment.");
  }

  console.log("\n📦 Deploying DataHoarderArena...");
  const DataHoarderArena = await hre.ethers.getContractFactory("DataHoarderArena");
  const dataHoarderArena = await DataHoarderArena.deploy();
  await dataHoarderArena.waitForDeployment();
  const dataHoarderAddress = await dataHoarderArena.getAddress();
  console.log("✅ DataHoarderArena deployed to:", dataHoarderAddress);

  console.log("\n📦 Deploying ForumVoting...");
  const ForumVoting = await hre.ethers.getContractFactory("ForumVoting");
  const forumVoting = await ForumVoting.deploy();
  await forumVoting.waitForDeployment();
  const forumVotingAddress = await forumVoting.getAddress();
  console.log("✅ ForumVoting deployed to:", forumVotingAddress);

  console.log("\n🔗 Linking contracts...");
  try {
    const linkTx = await forumVoting.setDataHoarderArena(dataHoarderAddress);
    await linkTx.wait();
    console.log("✅ ForumVoting linked to DataHoarderArena");
  } catch (error) {
    console.log("⚠️  Contract linking failed (might be already set):", error.message);
  }

  // Save comprehensive deployment info
  const deploymentInfo = {
    network: "sepolia",
    chainId: 11155111,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    gasUsed: {
      dataHoarderArena: "estimated",
      forumVoting: "estimated"
    },
    contracts: {
      DataHoarderArena: {
        address: dataHoarderAddress,
        verified: false
      },
      ForumVoting: {
        address: forumVotingAddress,
        verified: false
      }
    },
    transactions: {
      dataHoarderArena: dataHoarderArena.deploymentTransaction()?.hash,
      forumVoting: forumVoting.deploymentTransaction()?.hash
    }
  };

  // Save for web3 config update
  const addresses = {
    DataHoarderArena: dataHoarderAddress,
    ForumVoting: forumVotingAddress,
    network: "sepolia",
    chainId: 11155111,
  };

  fs.writeFileSync("contract-addresses.json", JSON.stringify(addresses, null, 2));
  fs.writeFileSync("deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n📄 Contract addresses saved to contract-addresses.json");
  console.log("📊 Deployment info saved to deployment-info.json");

  // Verify contracts on Etherscan if API key is provided
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\n⏳ Waiting for block confirmations...");
    await dataHoarderArena.deploymentTransaction()?.wait(6);
    await forumVoting.deploymentTransaction()?.wait(6);

    console.log("\n🔍 Verifying contracts on Etherscan...");
    
    try {
      console.log("Verifying DataHoarderArena...");
      await hre.run("verify:verify", {
        address: dataHoarderAddress,
        constructorArguments: [],
      });
      deploymentInfo.contracts.DataHoarderArena.verified = true;
      console.log("✅ DataHoarderArena verified");
    } catch (error) {
      console.log("❌ DataHoarderArena verification failed:", error.message);
    }

    try {
      console.log("Verifying ForumVoting...");
      await hre.run("verify:verify", {
        address: forumVotingAddress,
        constructorArguments: [],
      });
      deploymentInfo.contracts.ForumVoting.verified = true;
      console.log("✅ ForumVoting verified");
    } catch (error) {
      console.log("❌ ForumVoting verification failed:", error.message);
    }

    // Update deployment info with verification status
    fs.writeFileSync("deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
  } else {
    console.log("\n⚠️  Etherscan API key not provided, skipping verification");
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Summary:");
  console.log("- DataHoarderArena:", dataHoarderAddress);
  console.log("- ForumVoting:", forumVotingAddress);
  console.log("- Network: Sepolia Testnet");
  console.log("- Deployer:", deployer.address);
  
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\n🔗 View on Etherscan:");
    console.log(`- DataHoarderArena: https://sepolia.etherscan.io/address/${dataHoarderAddress}`);
    console.log(`- ForumVoting: https://sepolia.etherscan.io/address/${forumVotingAddress}`);
  }

  console.log("\n📝 Next steps:");
  console.log("1. Update your frontend with the new contract addresses");
  console.log("2. Test contract interactions on Sepolia testnet");
  console.log("3. Consider implementing additional features");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Deployment failed:");
    console.error(error);
    process.exit(1);
  });
