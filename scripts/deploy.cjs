const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying VotingSystem contract to Sepolia testnet...\n");

  // Get the ContractFactory and Signers here.
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with the account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance < hre.ethers.parseEther("0.01")) {
    console.log("⚠️  Warning: Low balance. Get more Sepolia ETH from faucet if deployment fails.");
  }

  // Deploy the VotingSystem contract
  console.log("\n⏳ Deploying VotingSystem contract...");
  const VotingSystem = await hre.ethers.getContractFactory("VotingSystem");
  const votingSystem = await VotingSystem.deploy();

  await votingSystem.waitForDeployment();

  const contractAddress = await votingSystem.getAddress();
  console.log("✅ VotingSystem deployed to:", contractAddress);

  // Wait for a few block confirmations
  console.log("⏳ Waiting for block confirmations...");
  await votingSystem.deploymentTransaction().wait(5);

  // Verify the contract on Etherscan (optional)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (error) {
      console.log("⚠️  Error verifying contract:", error.message);
      console.log("   You can verify manually later on Etherscan");
    }
  }

  // Output deployment information
  console.log("\n" + "=".repeat(50));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(50));
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Deployer Address:", deployer.address);
  console.log("🌐 Network: Sepolia Testnet");
  console.log("🔗 Block Explorer:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("=".repeat(50));
  
  console.log("\n📋 NEXT STEPS:");
  console.log("1. Copy the contract address above");
  console.log("2. Update CONTRACT_ADDRESS in src/contexts/ContractProvider.tsx");
  console.log("3. Restart the development server");
  console.log("4. Test the application with MetaMask");
  console.log("5. Register voters and create proposals");
  
  console.log("\n🔧 ADMIN FUNCTIONS (You are the admin):");
  console.log("- registerVoter(address) - Register new voters");
  console.log("- createProposal(...) - Create voting proposals");
  console.log("- addAdmin(address) - Add more admins");
  console.log("- endProposal(id) - End proposals early");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
