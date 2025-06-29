
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  // List of accounts to fund (add your MetaMask account address here)
  const accountsToFund = [
    "0xe07d7d379577F93524EBEF891e7b6E5A2A2C9BC4", // Your MetaMask account
    // Add more accounts as needed
  ];

  console.log("Funding accounts with ETH...");

  for (const account of accountsToFund) {
    try {
      const tx = await deployer.sendTransaction({
        to: account,
        value: hre.ethers.parseEther("100.0") // Send 100 ETH
      });
      await tx.wait();
      console.log(`Funded ${account} with 100 ETH`);
    } catch (error) {
      console.log(`Failed to fund ${account}:`, error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
