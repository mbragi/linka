import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Linka contracts...");

  // Get the contract factories
  const EscrowManager = await ethers.getContractFactory("EscrowManager");
  const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
  const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
  const DisputeResolution = await ethers.getContractFactory("DisputeResolution");

  // Deploy contracts
  console.log("Deploying EscrowManager...");
  const escrowManager = await EscrowManager.deploy();
  await escrowManager.waitForDeployment();
  const escrowManagerAddress = await escrowManager.getAddress();
  console.log("EscrowManager deployed to:", escrowManagerAddress);

  console.log("Deploying PaymentProcessor...");
  const paymentProcessor = await PaymentProcessor.deploy(escrowManagerAddress);
  await paymentProcessor.waitForDeployment();
  const paymentProcessorAddress = await paymentProcessor.getAddress();
  console.log("PaymentProcessor deployed to:", paymentProcessorAddress);

  console.log("Deploying ReputationRegistry...");
  const reputationRegistry = await ReputationRegistry.deploy();
  await reputationRegistry.waitForDeployment();
  const reputationRegistryAddress = await reputationRegistry.getAddress();
  console.log("ReputationRegistry deployed to:", reputationRegistryAddress);

  console.log("Deploying DisputeResolution...");
  const disputeResolution = await DisputeResolution.deploy();
  await disputeResolution.waitForDeployment();
  const disputeResolutionAddress = await disputeResolution.getAddress();
  console.log("DisputeResolution deployed to:", disputeResolutionAddress);

  // Set contract addresses
  console.log("Setting contract addresses...");
  await escrowManager.setContracts(
    paymentProcessorAddress,
    reputationRegistryAddress,
    disputeResolutionAddress
  );
  await disputeResolution.setEscrowManager(escrowManagerAddress);

  console.log("Deployment completed!");
  console.log("\nContract Addresses:");
  console.log("EscrowManager:", escrowManagerAddress);
  console.log("PaymentProcessor:", paymentProcessorAddress);
  console.log("ReputationRegistry:", reputationRegistryAddress);
  console.log("DisputeResolution:", disputeResolutionAddress);

  // Save addresses to file
  const addresses = {
    EscrowManager: escrowManagerAddress,
    PaymentProcessor: paymentProcessorAddress,
    ReputationRegistry: reputationRegistryAddress,
    DisputeResolution: disputeResolutionAddress,
  };

  const fs = require("fs");
  fs.writeFileSync(
    "./deployed-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\nAddresses saved to deployed-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
