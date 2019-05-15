const Token = artifacts.require("Repository");

contract("Repository", function(accounts) {
  const OWNER = accounts[0];
  const ALICE = accounts[1];
  const BOB = accounts[2];

  let tokenInstance;

  beforeEach(async function () {
    tokenInstance = await Token.new();
  });

  describe.only("Repository tests", () => {
    it("should add stock", async function () {
      await tokenInstance.add(100, "0x01");
      const actual = await tokenInstance._inventory(0);
      assert.equal(Number(actual[0]), 100, "Stock not correct");
    });

    it("should sum total stock", async function () {
      await tokenInstance.add(200, "0x02");
      const actual = await tokenInstance.totalStock();
      assert.equal(Number(actual), 200, "Total stock not correct");
    });
  });
});