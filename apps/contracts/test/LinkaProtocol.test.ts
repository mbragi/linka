import { expect } from "chai";
import { ethers } from "hardhat";
import { EscrowManager, PaymentProcessor, ReputationRegistry, DisputeResolution, MockERC20 } from "../typechain-types";

describe("Linka Protocol", function () {
  let escrowManager: EscrowManager;
  let paymentProcessor: PaymentProcessor;
  let reputationRegistry: ReputationRegistry;
  let disputeResolution: DisputeResolution;
  let mockERC20: MockERC20;
  
  let owner: any;
  let buyer: any;
  let seller: any;
  let arbitrator: any;

  const initialReputation = 500;
  const escrowAmount = ethers.parseEther("1");
  const paymentAmount = ethers.parseEther("0.5");

  beforeEach(async function () {
    [owner, buyer, seller, arbitrator] = await ethers.getSigners();

    // Deploy Mock ERC20
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20Factory.deploy("Mock Token", "MTK", ethers.parseEther("1000"));
    await mockERC20.waitForDeployment();

    // Deploy ReputationRegistry
    const ReputationRegistryFactory = await ethers.getContractFactory("ReputationRegistry");
    reputationRegistry = await ReputationRegistryFactory.deploy();
    await reputationRegistry.waitForDeployment();

    // Deploy PaymentProcessor
    const PaymentProcessorFactory = await ethers.getContractFactory("PaymentProcessor");
    paymentProcessor = await PaymentProcessorFactory.deploy(owner.address);
    await paymentProcessor.waitForDeployment();

    // Deploy EscrowManager
    const EscrowManagerFactory = await ethers.getContractFactory("EscrowManager");
    escrowManager = await EscrowManagerFactory.deploy();
    await escrowManager.waitForDeployment();

    // Deploy DisputeResolution
    const DisputeResolutionFactory = await ethers.getContractFactory("DisputeResolution");
    disputeResolution = await DisputeResolutionFactory.deploy();
    await disputeResolution.waitForDeployment();

    // Set contract addresses
    await escrowManager.setContracts(
      await paymentProcessor.getAddress(),
      await reputationRegistry.getAddress(),
      await disputeResolution.getAddress()
    );
    await disputeResolution.setEscrowManager(await escrowManager.getAddress());
    await paymentProcessor.setEscrowManager(await escrowManager.getAddress());
  });

  describe("ReputationRegistry", function () {
    it("Should register a user", async function () {
      await reputationRegistry.registerUser(
        buyer.address,
        "buyer@example.com",
        false
      );

      const reputation = await reputationRegistry.getReputationData(buyer.address);
      expect(reputation.email).to.equal("buyer@example.com");
      expect(reputation.isVendor).to.equal(false);
      expect(reputation.score).to.equal(500); // Starting reputation
    });

    it("Should update reputation after successful transaction", async function () {
      await reputationRegistry.registerUser(
        seller.address,
        "seller@example.com",
        true
      );

      await reputationRegistry.updateReputation(seller.address, 600);

      const reputation = await reputationRegistry.getReputation(seller.address);
      expect(reputation).to.equal(600);
    });
  });

  describe("EscrowManager", function () {
    beforeEach(async function () {
      // Register users
      await reputationRegistry.registerUser(
        buyer.address,
        "buyer@example.com",
        false
      );
      await reputationRegistry.registerUser(
        seller.address,
        "seller@example.com",
        true
      );
    });

    it("Should create an escrow", async function () {
      const description = "Test escrow";
      const metadataHash = ethers.id("test-metadata");
      const milestones: any[] = []; // Empty milestones array

      const tx = await escrowManager.connect(buyer).createEscrow(
        seller.address,
        description,
        metadataHash,
        milestones,
        { value: escrowAmount }
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
      const description = "Test escrow";
      const metadataHash = ethers.id("test-metadata");
      const milestones: any[] = [];

      const tx = await escrowManager.connect(buyer).createEscrow(
        seller.address,
        description,
        metadataHash,
        milestones,
        { value: escrowAmount }
      );
      const receipt = await tx.wait();
      
      // Get the escrow ID from the event
      const event = receipt?.logs.find(log => {
        try {
          const parsed = escrowManager.interface.parseLog(log);
          return parsed?.name === "EscrowCreated";
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = escrowManager.interface.parseLog(event);
        const escrowId = parsed?.args[0]; // First argument is escrowId
        
        // Fund the escrow
        await expect(escrowManager.connect(buyer).fundEscrow(escrowId, { value: escrowAmount }))
          .to.emit(escrowManager, "EscrowFunded")
          .withArgs(escrowId, escrowAmount);
      }
    });
  });

  describe("PaymentProcessor", function () {
    it("Should calculate fees correctly", async function () {
      const amount = ethers.parseEther("1");
      const fees = await paymentProcessor.calculateFees(amount, ethers.ZeroAddress);
      
      expect(fees.protocolFee).to.be.greaterThan(0);
      expect(fees.referrerFee).to.equal(0);
      expect(fees.referrer).to.equal(ethers.ZeroAddress);
    });

    it("Should support ETH token", async function () {
      const isSupported = await paymentProcessor.supportedTokens(ethers.ZeroAddress);
      expect(isSupported).to.be.true;
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

    it("Should get arbitrator stats", async function () {
      const stake = ethers.parseEther("1");
      
      await disputeResolution.connect(arbitrator).registerArbitrator({ value: stake });

      const stats = await disputeResolution.getArbitratorStats(arbitrator.address);
      expect(stats.totalCases).to.equal(0);
      expect(stats.successfulCases).to.equal(0);
      expect(stats.successRate).to.equal(0);
      expect(stats.active).to.be.true;
    });
  });
});