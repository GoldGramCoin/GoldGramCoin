const Token = artifacts.require("GGCToken");

const BigInt = require("big-integer");
const Web3 = require('web3');
const web3 = new Web3('ws://127.0.0.1:7545');

contract("GGCToken", function(accounts) {
  const OWNER = accounts[0];
  const ALICE = accounts[1];
  const BOB = accounts[2];

  let tokenInstance;
  let vaultInstance;

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
      const actual = await tokenInstance.balanceOf(OWNER);
      assert.equal(Number(actual), 0, "Owner balance should be 0");
    });
  });

  describe.skip("Owner / Ownable tests", () => {
    it("should set owner to account OWNER", async function () {
      const owner = await tokenInstance._owner();
      assert.equal(owner, OWNER, "Owner should be account OWNER");
    });

    it("Owner should be able to change owner", async function () {
      const owner = await tokenInstance._owner();
      assert.equal(owner, OWNER, "Owner should be account OWNER");

      await tokenInstance.changeOwner(ALICE);
      const new_owner = await tokenInstance._owner();

      assert.equal(new_owner, ALICE, "Owner should be account ALICE");
    });
  });

  describe("Balance", () => {
    it("should have balance of", async function () {
      await tokenInstance.mint(100,web3.utils.fromAscii("TestSerial"));
      
      const totalSupply = await tokenInstance.totalSupply();
      assert.equal(100, Number(totalSupply), "Total supply should be 100");

      await tokenInstance.transfer(ALICE, 50);
      const aliceBalance = await tokenInstance.balanceOf(ALICE);
      assert.equal(50, Number(aliceBalance), "Balance should be 50");

      const ownerBalance = await tokenInstance.balanceOf(OWNER);
      assert.equal(50, Number(ownerBalance), "Balance should be 50");
    });
  });

  describe("Transfer tests", () => {
    it("should be able to transfer", async function () {
      await tokenInstance.mint(100,web3.utils.fromAscii("TestSerial"));

      let ownerBalance = await tokenInstance.balanceOf(OWNER);
      assert.equal(Number(ownerBalance), 100, "Balance should be 100");

      const totalSupply = await tokenInstance.totalSupply();
      assert.equal(Number(totalSupply), 100, "Total supply should be 100");

      await tokenInstance.transfer(ALICE, 50);
      
      const aliceBalance = await tokenInstance.balanceOf(ALICE);
      assert.equal(Number(aliceBalance), 50, "Balance should be 50");

      ownerBalance = await tokenInstance.balanceOf(OWNER);
      assert.equal(Number(ownerBalance), 50, "Balance should be 50");
    });

    it("should be able to transfer more than 1 Serial", async function () {
      await tokenInstance.mint(10,web3.utils.fromAscii("TestSerial1"));
      await tokenInstance.mint(10,web3.utils.fromAscii("TestSerial2"));

      let ownerBalance = await tokenInstance.balanceOf(OWNER);
      assert.equal(Number(ownerBalance), 20, "Balance should be 20");

      let totalSupply = await tokenInstance.totalSupply();
      assert.equal(Number(totalSupply), 20, "Total supply should be 20");

      try {
        await tokenInstance.transfer(ALICE, 15);
      } catch(err) {
        console.log(err);
      }

      ownerBalance = await tokenInstance.balanceOf(OWNER);
      assert.equal(Number(ownerBalance), 5, "OWNER Balance should be 5");
      
      ownerBalance = await tokenInstance.balanceOf(ALICE);
      assert.equal(Number(ownerBalance), 15, "ALICE Balance should be 5");
    });

    it("should be able to transfer more than 2 Serial", async function () {
      await tokenInstance.mint(10,web3.utils.fromAscii("TestSerial1"));
      await tokenInstance.mint(10,web3.utils.fromAscii("TestSerial2"));
      await tokenInstance.mint(10,web3.utils.fromAscii("TestSerial3"));

      let ownerBalance = await tokenInstance.balanceOf(OWNER);
      assert.equal(Number(ownerBalance), 30, "Balance should be 30");

      let totalSupply = await tokenInstance.totalSupply();
      assert.equal(Number(totalSupply), 30, "Total supply should be 30");

      try {
        await tokenInstance.transfer(ALICE, 25);
      } catch(err) {
        console.log(err);
      }

      ownerBalance = await tokenInstance.balanceOf(OWNER);
      assert.equal(Number(ownerBalance), 5, "OWNER Balance should be 5");      
      ownerBalance = await tokenInstance.balanceOf(ALICE);
      assert.equal(Number(ownerBalance), 25, "ALICE Balance should be 5");
    });
  });

  describe("Mint and burn tests", () => {
    it("owner should be able to mint tokens", async function () {
      await tokenInstance.mint(100, web3.utils.fromAscii("TestSerial"));
      const totalSupply = await tokenInstance.totalSupply();
      assert.equal(Number(totalSupply), 100, "Total supply should be 100");

      owner = await tokenInstance.balanceOf(OWNER);
      assert.equal(Number(owner), 100, "Balance should be 100");

      let stockCount = await tokenInstance.getStockCount();
      assert.equal(Number(stockCount), 1, "Stock count should be 1");

      const count = await tokenInstance.getStockCount();
      assert.equal(Number(count), 1, "Stock count should be 1");
    });

    //not valid any more
    it.skip("should be able to compile same tokens", async function () {
      await tokenInstance.mint(100, web3.utils.fromAscii("TestSerial"));
      await tokenInstance.mint(100, web3.utils.fromAscii("TestSerial"));
      const totalSupply = await tokenInstance.totalSupply();
      assert.equal(200, Number(totalSupply), "Total supply should be 200");

      owner = await tokenInstance.balanceOf(OWNER);
      assert.equal(200, Number(owner), "Balance should be 200");

      owner = await vaultInstance._inventory(0);
      assert.equal(200, Number(owner.amount), "First Serial should have 200");
    });

    it("should not be able to mint tokens unless owner", async function () {
      try {
        let alice = await tokenInstance.balanceOf(ALICE);
        assert.equal(0, Number(alice), "Balance should be 0");

        await tokenInstance.mint(100, web3.utils.fromAscii("TestSerial"), {from: ALICE });
      }
      catch (error) {
        assert(error, "Sender not authorized.");
      }
    });

    it("should be able to burn tokens", async function () {
      let owner = await tokenInstance.balanceOf(OWNER);
      assert.equal(0, Number(owner), "Balance should be 0");

      await tokenInstance.mint(100, web3.utils.fromAscii("TestSerial"));
      let totalSupply = await tokenInstance.totalSupply();
      assert.equal(Number(totalSupply), 100, "Total supply should be 100");

      owner = await tokenInstance.balanceOf(OWNER);
      assert.equal(Number(owner), 100, "Balance should be 100");

      await tokenInstance.burn(web3.utils.fromAscii("TestSerial"));
      totalSupply = await tokenInstance.totalSupply();
      assert.equal(Number(totalSupply), 0, "Total supply should be 0");

      owner = await tokenInstance.balanceOf(OWNER);
      assert.equal(Number(owner), 0, "Balance should be 0");
    });

    it("should burn and reorder tokens", async function () {
      let owner = await tokenInstance.balanceOf(OWNER);
      assert.equal(0, Number(owner), "Balance should be 0");

      await tokenInstance.mint(100, web3.utils.fromAscii("TestSerial100"));
      await tokenInstance.mint(200, web3.utils.fromAscii("TestSerial200"));
      await tokenInstance.mint(300, web3.utils.fromAscii("TestSerial300"));

      let totalSupply = await tokenInstance.totalSupply();
      assert.equal(Number(totalSupply), 600, "Total supply should be 600");

      owner = await tokenInstance.balanceOf(OWNER);
      assert.equal(Number(owner), 600, "Balance should be 600");

      let stockCount = await tokenInstance.getStockCount();
      assert.equal(Number(stockCount), 2, "Stock count should be 2");

      await tokenInstance.burn(web3.utils.fromAscii("TestSerial200"));
      totalSupply = await tokenInstance.totalSupply();
      assert.equal(Number(totalSupply), 400, "Total supply should be 0");

      owner = await tokenInstance.balanceOf(OWNER);
      assert.equal(Number(owner), 400, "Balance should be 400");

      stockCount = await tokenInstance.getStockCount();
      assert.equal(Number(stockCount), 2, "Stock count should be 2");
    });
  });

  describe("Stock tests", () => {
    it("should get serial at index 1", async function () {
      await tokenInstance.mint(100, web3.utils.fromAscii("TestSerial"));
      await tokenInstance.mint(100, web3.utils.fromAscii("TestSerial2"));

      const serial = await tokenInstance.getSerialAtIndex(1);
      console.log(serial);
      assert.equal(serial, web3.utils.fromAscii("TestSerial2"), "Serial should be TestSerial2");
    });
  });

  describe("Requiring attention", () => {
    it.skip("Must Handle Insane amount of balance", async function () {
      let bool = true;
      setTimeout(() => {
        bool = false;
      }, 10000)
      do {
        await tokenInstance.mint(100, web3.utils.fromAscii("TestSerial"));
      } while(bool);
      let ownerBal =  Number(await tokenInstance.balanceOf(OWNER));
      ownerBal = ownerBal / 2;
      try {
        await tokenInstance.transfer(ALICE, ownerBal);
      } catch(err) {
        console.log(err);
      }      
    });

    it("Must Handle Insane amount of serials", async function () {
      for (i = 1; i < 200; i++) {
        await tokenInstance.mint(1, web3.utils.fromAscii("TestSerial" + i));
        let owner = await tokenInstance.balanceOf(OWNER);

        assert.equal(Number(owner), i, "Balance incorrect");
      }  
    });
  });
});