import { expect } from "chai";
import { ethers } from "hardhat";
import { EscrowManager, PaymentProcessor, ReputationRegistry, DisputeResolution } from "../typechain-types";

describe("Linka Protocol", function () {
  let escrowManager: EscrowManager;
  let paymentProcessor: PaymentProcessor;
  let reputationRegistry: ReputationRegistry;
  let disputeResolution: DisputeResolution;
  
  let owner: any;
  let buyer: any;
  let seller: any;
  let arbitrator: any;

  beforeEach(async function () {
    [owner, buyer, seller, arbitrator] = await ethers.getSigners();

    // Deploy contracts
    const EscrowManager = await ethers.getContractFactory("EscrowManager");
    escrowManager = await EscrowManager.deploy();
    await escrowManager.waitForDeployment();

    const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
    paymentProcessor = await PaymentProcessor.deploy(await escrowManager.getAddress());
    await paymentProcessor.waitForDeployment();

    const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
    reputationRegistry = await ReputationRegistry.deploy();
    await reputationRegistry.waitForDeployment();

    const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
    disputeResolution = await DisputeResolution.deploy();
    await disputeResolution.waitForDeployment();

    // Set contract addresses
    await escrowManager.setContracts(
      await paymentProcessor.getAddress(),
      await reputationRegistry.getAddress(),
      await disputeResolution.getAddress()
    );
    await disputeResolution.setEscrowManager(await escrowManager.getAddress());
  });

  describe("ReputationRegistry", function () {
    it("Should register a user", async function () {
      await reputationRegistry.registerUser(
        buyer.address,
        "buyer@example.com",
        12345
      );

      const reputation = await reputationRegistry.getReputation(buyer.address);
      expect(reputation.email).to.equal("buyer@example.com");
      expect(reputation.farcasterFid).to.equal(12345);
      expect(reputation.score).to.equal(500); // BASE_SCORE
    });

    it("Should update reputation after successful transaction", async function () {
      await reputationRegistry.registerUser(
        seller.address,
        "seller@example.com",
        0
      );

      await reputationRegistry.updateReputation(seller.address, true, ethers.parseEther("1"));

      const reputation = await reputationRegistry.getReputation(seller.address);
      expect(reputation.score).to.equal(510); // BASE_SCORE + SCORE_INCREMENT
      expect(reputation.completedTransactions).to.equal(1);
    });
  });

  describe("EscrowManager", function () {
    beforeEach(async function () {
      // Register users
      await reputationRegistry.registerUser(
        buyer.address,
        "buyer@example.com",
        12345
      );
      await reputationRegistry.registerUser(
        seller.address,
        "seller@example.com",
        67890
      );
    });

    it("Should create an escrow", async function () {
      const amount = ethers.parseEther("1");
      const platformFee = (amount * 250n) / 10000n; // 2.5%
      const escrowAmount = amount - platformFee;

      const tx = await escrowManager.createEscrow(
        seller.address,
        "Test escrow",
        ethers.id("test-metadata"),
        []
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(log => {
        try {
          const parsed = escrowManager.interface.parseLog(log);
          return parsed?.name === "EscrowCreated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
    });

    it("Should fund an escrow", async function () {
      const amount = ethers.parseEther("1");
      const platformFee = (amount * 250n) / 10000n;
      const escrowAmount = amount - platformFee;

      await escrowManager.createEscrow(
        seller.address,
        "Test escrow",
        ethers.id("test-metadata"),
        []
      );

      const escrowId = 1;
      await escrowManager.connect(buyer).fundEscrow(escrowId, { value: amount });

      const escrow = await escrowManager.getEscrow(escrowId);
      expect(escrow.status).to.equal(1); // EscrowStatus.Funded
    });
  });

  describe("DisputeResolution", function () {
    it("Should register an arbitrator", async function () {
      const stake = ethers.parseEther("1");
      
      await disputeResolution.connect(arbitrator).registerArbitrator({ value: stake });

      const arbitratorData = await disputeResolution.arbitrators(arbitrator.address);
      expect(arbitratorData.active).to.be.true;
      expect(arbitratorData.stake).to.equal(stake);
    });
  });
});
