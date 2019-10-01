const { TestHelper } = require('@openzeppelin/cli');
const { Contracts, ZWeb3 } = require('@openzeppelin/upgrades');

ZWeb3.initialize(web3.currentProvider);

const GGCToken = Contracts.getFromLocal('GGCToken');
const ERC20 = Contracts.getFromLocal('ERC20');
// const ERC20 = Contracts.getFromNodeModules('openzeppelin-contracts-ethereum-package', 'ERC20');

require('chai').should();

contract('GGCToken', function (accounts) {
  const OWNER = accounts[0];
  const ALICE = accounts[1];
  const BOB = accounts[2];
  const DARYN = "0x358578491A46C6631225Dc5dE0a0A67123F1c116";
  const BINANCE = accounts[4];
  const BINANCE_USER1 = accounts[7];
  const BINANCE_USER2 = accounts[8];
  const BINANCE_USER3 = accounts[9];

  let GGCTokenProxy;
  beforeEach(async function () {
    this.project = await TestHelper();    
  });

  

  it("Test: Name and Symbol should be GoldGramCoin and GGC", async function () {
    GGCTokenProxy = await this.project.createProxy(GGCToken, {
      initMethod: 'initialize',
      initArgs: ["0x46dB4F4A6C2a83a26Ba47203c1197EaEB566152f",
      "GoldGramCoin",
      "GGC",
      "18",
      "0x358578491A46C6631225Dc5dE0a0A67123F1c116",
      "200000000000000"]
    });

    const name = await GGCTokenProxy.methods.name().call();
    assert.equal("GoldGramCoin", name, "Name should be GoldGramCoin");

    const symbol = await GGCTokenProxy.methods.symbol().call();
    assert.equal("GGC", symbol, "Symbol should be GGC");
  });
  it("Test: Total supply should be 0", async function () {
    const actual = await GGCTokenProxy.methods.totalSupply().call();
    assert.equal(Number(actual), 0, "Total supply should be 0");
  });
  it("Test: Owner balance should be 0", async function () {
    const actual = await GGCTokenProxy.methods.balanceOf(OWNER).call();
    assert.equal(Number(actual), 0, "Owner balance should be 0");
  });
  it("Test: Owner should be able to change owner", async function () {
    let is_owner_minter = await GGCTokenProxy.methods.isMinter(OWNER).call();
    assert.equal(is_owner_minter, true, "Owner should be account OWNER");

    await GGCTokenProxy.methods.addMinter(ALICE).send({from: OWNER });
    await GGCTokenProxy.methods.renounceMinter().send({from: OWNER });

    const is_alice_minter = await GGCTokenProxy.methods.isMinter(ALICE).call();
    assert.equal(is_alice_minter, true, "Owner should be account ALICE");

    is_owner_minter = await GGCTokenProxy.methods.isMinter(OWNER).call();
    assert.equal(is_owner_minter, false, "OWNER is no longer owner");
  });
  it("Test: Should have balance of 100", async function () {
    await GGCTokenProxy.methods.addMinter(OWNER).send({from: ALICE });
    await GGCTokenProxy.methods.renounceMinter().send({from: ALICE });
    
    await GGCTokenProxy.methods.mint(OWNER, 100).send({from: OWNER });

    const totalSupply = await GGCTokenProxy.methods.totalSupply().call();
    assert.equal(100, Number(totalSupply), "Total supply should be 100");
  });
  it("Test: Should not be able to mint tokens unless owner", async function () {
    try {
      let alice = await GGCTokenProxy.methods.balanceOf(ALICE).call();
      assert.equal(0, Number(alice), "Balance should be 0");

      await GGCTokenProxy.methods.mint(OWNER, 100, {from: ALICE }).call();
    }
    catch (error) {
      assert(error, "Sender not authorized to mint.");
    }
  });
  it("Test: Owner should be able to mint tokens", async function () {
    await GGCTokenProxy.methods.mint(OWNER, 100).call();
    const totalSupply = await GGCTokenProxy.methods.totalSupply().call();
    assert.equal(100, Number(totalSupply), "Total supply should be 100");

    owner = await GGCTokenProxy.methods.balanceOf(OWNER).call();
    assert.equal(100, Number(owner), "Balance should be 100");
  });
  it("Test: Should be able to tally same tokens", async function () {
    await GGCTokenProxy.methods.mint(OWNER, 100).send({from:OWNER});

    const totalSupply = await GGCTokenProxy.methods.totalSupply().call();
    assert.equal(200, Number(totalSupply), "Total supply should be 200");

    owner = await GGCTokenProxy.methods.balanceOf(OWNER).call();
    assert.equal(200, Number(owner), "Owner balance should be 200"); 
  });
  it("Test: Should be able to burn owner tokens", async function () {     
    await GGCTokenProxy.methods.burn(50).send({from:OWNER});
    totalSupply = await GGCTokenProxy.methods.totalSupply().call();
    assert.equal(Number(totalSupply), 150, "Total supply should be 150");

    owner = await GGCTokenProxy.methods.balanceOf(OWNER).call();
    assert.equal(Number(owner), 150, "Owner balance should be 150");
  });
  
  it("Test: Should be able to set allowance", async function(){
    await GGCTokenProxy.methods.approve(ALICE, 50).send({from:OWNER});
    let alice_allowance = await GGCTokenProxy.methods.allowance(OWNER, ALICE).call();
    assert.equal(Number(alice_allowance), 50, "ALICE allowance should be 50 : " + String(alice_allowance));
  });
  it("Test: Should be able to spend on behalf of the GGC holder", async function(){
    await GGCTokenProxy.methods.setFee(0).send({from:OWNER});
    await GGCTokenProxy.methods.transferFrom(OWNER, BOB, 20).send({from:ALICE});
    let bob_balance = await GGCTokenProxy.methods.balanceOf(BOB).call();
    assert.equal(Number(bob_balance), 20, "BOB Balance should be 20");

    let alice_allowance = await GGCTokenProxy.methods.allowance(OWNER, ALICE).call();
    assert.equal(Number(alice_allowance), 30, "ALICE allowance should be 30");

    let owner_balance = await GGCTokenProxy.methods.balanceOf(OWNER).call();
    assert.equal(Number(owner_balance), 130, "OWNER Balance should be 130");
  });

  let catchPauseRevert = require("./exceptions.js").catchPauseRevert;
  it("Test: Should be able to suspend GGC transfer", async function(){
    await GGCTokenProxy.methods.pause().send({from:OWNER});
    await catchPauseRevert(GGCTokenProxy.methods.transfer(ALICE, 20).send({from:OWNER}));      

    let owner_balance = await GGCTokenProxy.methods.balanceOf(OWNER).call();
    assert.equal(Number(owner_balance), 130, "OWNER Balance should be 130, no change after transfer call.");

    let alice_balance = await GGCTokenProxy.methods.balanceOf(ALICE).call();
    assert.equal(Number(alice_balance), 0, "ALICE Balance should be 0, no change after transfer call.");

    await GGCTokenProxy.methods.unpause().send({from:OWNER});

    await GGCTokenProxy.methods.transfer(ALICE, 30).send({from:OWNER});

    owner_balance = await GGCTokenProxy.methods.balanceOf(OWNER).call();
    assert.equal(Number(owner_balance), 100, "OWNER Balance should be 100");

    alice_balance = await GGCTokenProxy.methods.balanceOf(ALICE).call();
    assert.equal(Number(alice_balance), 30, "ALICE Balance should be 30");
  });

  let catchPauserRoleRevert = require("./exceptions.js").catchPauserRoleRevert;
  
  it("Test: Should be able to add pauser, pause, and unpause transaction", async function(){
    // OWNER added ALICE as pauser
    await GGCTokenProxy.methods.addPauser(ALICE).send({from:OWNER});

    // Alice disables all transfer transactions
    await GGCTokenProxy.methods.pause().send({from:ALICE}); 

    // OWNER tries to send 20 GGC to BOB, this will lead to error
    await catchPauseRevert(GGCTokenProxy.methods.transfer(BOB, 20).send({from:OWNER})); 

    //checks balance after transfer call, balance didn't change
    let owner_balance = await GGCTokenProxy.methods.balanceOf(OWNER).call();
    assert.equal(Number(owner_balance), 100, "OWNER Balance should be 100, no change after transfer call.");

    //checks balance after transfer call, balance didn't change
    let bob_balance = await GGCTokenProxy.methods.balanceOf(BOB).call();
    assert.equal(Number(bob_balance), 20, "BOB Balance should be 20, no change after transfer call.");

    await GGCTokenProxy.methods.unpause().send({from:ALICE});

    //OWNER tries to transfer again
    await GGCTokenProxy.methods.transfer(BOB, 30).send({from:OWNER});

    //Checks the balance of OWNER after the GGC transfer
    owner_balance = await GGCTokenProxy.methods.balanceOf(OWNER).call();
    assert.equal(Number(owner_balance), 70, "OWNER Balance should be 70");

    //Checks the balance of BOB after the GGC transfer
    bob_balance = await GGCTokenProxy.methods.balanceOf(BOB).call();
    assert.equal(Number(bob_balance), 50, "BOB Balance should be 50");
  }); 

  it("Test: Should be able to remove pauser, unpause and not allow ex-pauser to do transaction", async function(){

    // Alice renounce her pauser role. Contract is no longer on pause.
    await GGCTokenProxy.methods.renouncePauser().send({from:ALICE});

    // OWNER will try again to send 20 GGC to BOB, this will lead to error
    await GGCTokenProxy.methods.transfer(BOB, 5).send({from:OWNER}); 

    // Check balance after the transfer call
    owner_balance = await GGCTokenProxy.methods.balanceOf(OWNER).call();
    assert.equal(Number(owner_balance), 65, "OWNER Balance should be 70");

    // Check balance after the transfer call
    bob_balance = await GGCTokenProxy.methods.balanceOf(BOB).call();
    assert.equal(Number(bob_balance), 55, "BOB Balance should be 0");
  });
  it("Test: Should be able to assign receiver", async function(){
       
    await GGCTokenProxy.methods.setFeeReceiver(DARYN).send({from:OWNER});

    let fee_receiver = await GGCTokenProxy.methods.getFeeReceiver().call();
    assert.equal(fee_receiver, DARYN, "Receiver should be DARYN");
  });

  it("Test: Should be able to set fee and feeDecimals", async function(){
     
    //Put double quotes to resolve 16 digits issue on json.
    await GGCTokenProxy.methods.setFee(web3.utils.toWei("0.0002")).send({from:OWNER});

    let fee = await GGCTokenProxy.methods.getFee().call();
    assert.equal(Number(fee), web3.utils.toWei("0.0002"), "Fee should be 200000000000000");
  });
 
  it("Test: Full transfer fee exemption", async function(){
    await GGCTokenProxy.methods.mint(OWNER,  "100000000000000000000").send({from: OWNER});
    
    await GGCTokenProxy.methods.exempt(BINANCE, 0).send({from: OWNER});
    await GGCTokenProxy.methods.transfer(BINANCE, "3000000000000000000").send({from: OWNER});

    await GGCTokenProxy.methods.transfer(BINANCE_USER1, "1000000000000000000").send({from: BINANCE});

    let buser1_balance = await GGCTokenProxy.methods.balanceOf(BINANCE_USER1).call();
    assert.equal(Number(buser1_balance), 1000000000000000000, "BINANCEUSER1 balance should be 1 ether");
  });

  it("Test: Must be able to unexempt an account", async function(){
    await GGCTokenProxy.methods.unExempt(BINANCE).send({from: OWNER});
    await GGCTokenProxy.methods.transfer(BINANCE_USER2, "1000000000000000000").send({from: BINANCE});
    let buser2_balance = await GGCTokenProxy.methods.balanceOf(BINANCE_USER2).call();
    assert.equal(Number(buser2_balance), web3.utils.toWei("0.9998"), "BINANCEUSER2 balance should be 200000000000000 wei");
  });

  it("Test: Must be able to exempt an account with custom fee", async function(){
    await GGCTokenProxy.methods.exempt(BINANCE, web3.utils.toWei("0.0001")).send({from: OWNER});
    await GGCTokenProxy.methods.transfer(BINANCE_USER3, web3.utils.toWei("1")).send({from: BINANCE});
    let buser3_balance = await GGCTokenProxy.methods.balanceOf(BINANCE_USER3).call();
    assert.equal(Number(buser3_balance), web3.utils.toWei("0.9999"), "BINANCEUSER3 balance should be 100000000000000 wei");
  });
  it("Test: Must Handle Insane amount of balance", async function () {
    let bool = true;

    setTimeout(() => {
      bool = false;
    }, 10000)

    do {
      await GGCTokenProxy.methods.mint(OWNER, 100).send({from:OWNER});
    } while (bool);

    let ownerBal = Number(await GGCTokenProxy.methods.balanceOf(OWNER).call());
    ownerBal = ownerBal / 2;

    try {
      await GGCTokenProxy.methods.transfer(ALICE, ownerBal).send({from:OWNER});
    } catch (err) {
      console.log(err);
    }
  });



  // it('should create a proxy for the Ethereum Package', async function () {
  //   const proxy = await this.project.createProxy(ERC20, { contractName: 'StandaloneERC20', packageName: '@openzeppelin/contracts-ethereum-package' });
  //   const result = await proxy.methods.totalSupply().call();
  //   result.should.eq('0');
  // })
});