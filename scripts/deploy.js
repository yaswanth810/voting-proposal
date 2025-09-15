import hre from "hardhat";

async function main() {
  console.log("Deploying VotingSystem contract to Sepolia testnet...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy the VotingSystem contract
  const VotingSystem = await hre.ethers.getContractFactory("VotingSystem");
  const votingSystem = await VotingSystem.deploy();

  await votingSystem.waitForDeployment();

  const contractAddress = await votingSystem.getAddress();
  console.log("VotingSystem deployed to:", contractAddress);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await votingSystem.deploymentTransaction().wait(5);

  // Verify the contract on Etherscan (optional)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan!");
    } catch (error) {
      console.log("Error verifying contract:", error.message);
    }
  }

  // Output deployment information
  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer Address:", deployer.address);
  console.log("Network: Sepolia Testnet");
  console.log("Block Explorer:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("\nNext steps:");
  console.log("1. Update CONTRACT_ADDRESS in src/contexts/ContractProvider.tsx");
  console.log("2. Test the application with MetaMask");
  console.log("3. Register voters and create proposals");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
