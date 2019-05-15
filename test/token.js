const Token = artifacts.require("GGCToken");
const BigInt = require("big-integer");

contract("GGCToken", function(accounts) {
  const OWNER = accounts[0];
  const ALICE = accounts[1];
  const BOB = accounts[2];

  let tokenInstance;

  beforeEach(async function () {
    tokenInstance = await Token.new();
  });

  describe("ERC20 tests", () => {
    it("should test ERC20 public properties", async function () {
      const name = await tokenInstance.name();
      assert.equal("GGC Token", name, "Name should be GGC Token");

      const symbol = await tokenInstance.symbol();
      assert.equal("GGC", symbol, "Symbol should be GGC");
    });

    it("total supply should be 0", async function () {
      const actual = await tokenInstance.totalSupply();
      assert.equal(Number(actual), 0, "Total supply should be 0");
    });

    it("owner balance should be 0", async function () {
      const actual = await tokenInstance.accInfo(OWNER);
      assert.equal(Number(actual.balance), 0, "Owner balance should be 0");
    });

    it("should get balance of owner", async function () {
      const actual = await tokenInstance.balanceOf(OWNER);
      assert.equal(Number(actual), 0, "Owner balance should be 0");
    });

    it("owner should be verified", async function () {
      const actual = await tokenInstance.accInfo(OWNER);
      assert.equal(actual.isVerified, true, "Owner should be verified");
    });
  });

  describe("Owner / Ownable tests", () => {
    it("should set owner to account 0", async function () {
      const owner = await tokenInstance._owner();
      assert.equal(owner, OWNER, "Owner should be account 0");
    });

    it("Owner should be able to change owner", async function () {
      const owner = await tokenInstance._owner();
      assert.equal(owner, OWNER, "Owner should be account 0");

      await tokenInstance.changeOwner(ALICE);
      const new_owner = await tokenInstance._owner();

      assert.equal(new_owner, ALICE, "Owner should be account 1");
    });
  });

  //not implemented
  describe("Balance", () => {
    it("should have balance of", async function () {
      await tokenInstance.buy(100, OWNER, {from: OWNER });
      
      const totalSupply = await tokenInstance.totalSupply();
      assert.equal(100, Number(totalSupply), "Total supply should be 100");

      await tokenInstance.transfer(ALICE, 50);
      const aliceBalance = await tokenInstance.balanceOf(ALICE);
      assert.equal(50, Number(aliceBalance), "Balance should be 50");

      const ownerBalance = await tokenInstance.balanceOf(OWNER);
      assert.equal(50, Number(ownerBalance), "Balance should be 50");

      await tokenInstance.transferFrom(ALICE, BOB, 25, { from: BOB });
      const bobBalance = await tokenInstance.balanceOf(BOB);

      assert.equal(0, Number(bobBalance), "Balance should still be zero");
    });
  });

  describe("Verify tests", () => {
    it("should be verified", async function () {
      const actual = await tokenInstance.accInfo(OWNER);
      assert.equal(actual.isVerified, true, "Owner should be verified");
    });

    it("should not be verified", async function () {
      const actual = await tokenInstance.accInfo(ALICE);
      assert.equal(actual.isVerified, false, "Alice should be verified");
    });

    it("should not be verified", async function () {
      const actual = await tokenInstance.accInfo(ALICE);
      assert.equal(actual.isVerified, false, "Alice should be verified");
    });

    it("should allow owner to verify address", async function () {
      await tokenInstance.verify(ALICE);

      const actual = await tokenInstance.accInfo(ALICE);
      assert.equal(actual.isVerified, true, "Alice should be verified");
    });
  });

  describe("Transfer tests", () => {
    it("It should be able to transfer tokens to verfied", async function () {
      await tokenInstance.verify(ALICE);
      let alice = await tokenInstance.accInfo(ALICE);

      assert.isTrue(alice.isVerified);

      await tokenInstance.buy(100, OWNER);

      let ownerBalance = await tokenInstance.balanceOf(OWNER);
      assert.equal(Number(ownerBalance), 100, "Balance should be 100");

      const totalSupply = await tokenInstance.totalSupply();
      assert.equal(Number(totalSupply), 100, "Total supply should be 100");

      await tokenInstance.transfer(ALICE, 50, { from: OWNER});
      
      const aliceBalance = await tokenInstance.balanceOf(ALICE);
      assert.equal(Number(aliceBalance), 50, "Balance should be 50");

      ownerBalance = await tokenInstance.balanceOf(OWNER);
      assert.equal(Number(ownerBalance), 50, "Balance should be 50");
    });

    it.skip("It should not be able to transfer tokens to unverfied", async function () {
      await tokenInstance.buy(100, OWNER, {from: OWNER });
      const totalSupply = await tokenInstance.totalSupply();
      assert.equal(100, Number(totalSupply), "Total supply should be 100");

      const alice = await tokenInstance.accInfo(ALICE);
      assert.false(alice.isVerified);

      await tokenInstance.transfer(ALICE, 50, { from: BOB});
      alice = await tokenInstance.accInfo(ALICE);
      assert.equal(0, Number(alice.balance), "Balance should be 50");

      const owner = await tokenInstance.balanceOf(OWNER);
      assert.equal(100, Number(owner.balance), "Balance should be 100");
    });
  });

  describe("Approval tests", () => {
    it("It should not be able to transfer tokens", async function () {

    });
  });

  describe("Buy and sell tests", () => {
    it("owner should be able to buy tokens", async function () {
      let owner = await tokenInstance.accInfo(OWNER);
      assert.equal(0, Number(owner.balance), "Balance should be 0");

      await tokenInstance.buy(100, OWNER, {from: OWNER});
      const totalSupply = await tokenInstance.totalSupply();
      assert.equal(100, Number(totalSupply), "Total supply should be 100");

      owner = await tokenInstance.accInfo(OWNER);
      assert.equal(100, Number(owner.balance), "Balance should be 100");
    });

    it("should not be able to buy tokens unless owner", async function () {
      try {
        let alice = await tokenInstance.accInfo(ALICE);
        assert.equal(0, Number(alice.balance), "Balance should be 0");

        await tokenInstance.buy(100, OWNER, {from: ALICE});
      }
      catch (error) {
        assert(error, "Sender not authorized.");
      }
    });

    it("should be not able to buy tokens unless verified", async function () {
      let owner = await tokenInstance.accInfo(OWNER);
      assert.equal(0, Number(owner.balance), "Balance should be 0");

      await tokenInstance.buy(100, OWNER, {from: OWNER});
      const totalSupply = await tokenInstance.totalSupply();
      assert.equal(100, Number(totalSupply), "Total supply should be 100");

      owner = await tokenInstance.accInfo(OWNER);
      assert.equal(100, Number(owner.balance), "Balance should be 100");
    });

    it("should be able to sell tokens", async function () {
      let owner = await tokenInstance.accInfo(OWNER);
      assert.equal(0, Number(owner.balance), "Balance should be 0");

      await tokenInstance.buy(100, OWNER, {from: OWNER});
      let totalSupply = await tokenInstance.totalSupply();
      assert.equal(100, Number(totalSupply), "Total supply should be 100");

      owner = await tokenInstance.accInfo(OWNER);
      assert.equal(100, Number(owner.balance), "Balance should be 100");

      await tokenInstance.sell(50, OWNER, {from: OWNER});
      totalSupply = await tokenInstance.totalSupply();
      assert.equal(50, Number(totalSupply), "Total supply should be 50");

      owner = await tokenInstance.accInfo(OWNER);
      assert.equal(50, Number(owner.balance), "Balance should be 50");
    });
  });

  describe.skip("Other tests", () => {
    it("Should not allow ETH to be received", async function () {

    });
  });

  describe("Requiring attention", () => {
    it("Allows user to buy more than total supply", async function () {
      let owner = await tokenInstance.accInfo(OWNER);
      assert.equal(0, Number(owner.balance), "Balance should be 0");

      await tokenInstance.buy(100, OWNER, {from: OWNER});
      const totalSupply = await tokenInstance.totalSupply();
      assert.equal(100, Number(totalSupply), "Total supply should be 100");

      await tokenInstance.verify(ALICE);

      await tokenInstance.buy(200, ALICE, {from: OWNER});

      const alice = await tokenInstance.accInfo(ALICE);
      assert.equal(0, Number(alice.balance), "Balance should still be 0");
    });


    it.skip("Create an overflow error on buy", async function () {
      let owner = await tokenInstance.accInfo(OWNER);
      assert.equal(0, Number(owner.balance), "Balance should be 0");

      const max = BigInt(2).pow(256).subtract(1);
      //console.log(max.toString());

      await tokenInstance.buy(max.toString(), OWNER, {from: OWNER});
      totalSupply = await tokenInstance.totalSupply();

      console.log(Number(totalSupply));
    });
  });
});