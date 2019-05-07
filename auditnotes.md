# Overview

The code has been taking from GitLabs at commit `33be9abde2715bb87cd9662c2eab54a0fd57ce21`

## Implement best practices
- No unit testing
- No safe math
- No ownable contract
- No ERC20 interface
- Include ERC20 functions
- No fallback function
- Defend against address 0

## Approach

- Verify the contracts compile under `0.5.0`
- http://repo.quantumcrowd.io/smartcontract/ggc-sc/blob/master/ggctoken.sol#L1

```
lucascullen@ubuntu:~/Projects/ggc-sc$ truffle compile

Compiling your contracts...
===========================
> Compiling ./contracts/GGCToken(Updated).sol
> Compiling ./contracts/ggctoken.sol
> Artifacts written to /home/lucascullen/Projects/ggc-sc/build/contracts
> Compiled successfully using:
   - solc: 0.5.0+commit.1d4f565a.Emscripten.clang
```

- Write unit tests in the `unit-test` branch

## Audit Notes
The token is not ERC20 compliant, and will not be able to be listed on exchanges.   The following functions have been added.

* approve
* transferFrom
* allowance

### No fall back function
Its assumed this contract will not cointain ETH.  Therefor, a default fallback function should be added to pervent any accidental transfer of ETH.

(Fixed)

### LN 159-161 Kill function
While its good community pracitice to include a sucide function, I would remove this function so it cannot be accidently called and reduces complexity.

(Removed)

### LN 25-28 onlyBy modifer
It seems the intent of this modifer is only allow the owner to perform functions.  It migh be better to use the OpenZepplin `ownable.sol` contract.

## LN 134-138 No balance check
This method is internal, however, a developer could accidently call this method without checking users balance.

Recommend that the balance check function from LN 120 to LN 135.

### LN 52 Unnecessary Complication
http://repo.quantumcrowd.io/smartcontract/ggc-sc/blob/master/ggctoken.sol#L52

The total balance of zero is set in a complicated way and unnecessary.  `totalSupply = 0 * 10 ** uint256(decimals);`

```
    it("Total supply should be 0", async function () {
      const actual = await tokenInstance.totalSupply();
      assert.equal(actual.valueOf(), 0, "Total supply should be 0");
    });

    it("Owner balance should be 0", async function () {
      const actual = await tokenInstance.balanceOf(OWNER);
      assert.equal(actual.valueOf(), 0, "Balance should be 0");
    });
```
Fixed

### LN 103-109 User can buy more than total supply
The operator (owner) could allow the user to buy more tokens than is in supply.
```
    it("Allows user to buy more than total supply", async function () {
      let owner = await tokenInstance.accInfo(OWNER);
      assert.equal(0, Number(owner.balance), "Balance should be 0");

      await tokenInstance.mint(100);
      const totalSupply = await tokenInstance.totalSupply();
      assert.equal(100, Number(totalSupply), "Total supply should be 100");

      await tokenInstance.buy(200, ALICE);

      const alice = await tokenInstance.accInfo(200);
      assert.equal(0, Number(alice.balance), "Balance should still be 0");
    });
```

Seems to be the method to mint.


### LN 107 always returns true
Given the above it might be better to return a false condition if the sale is invalid, or remove the true.

### Emit on burn and mint
Block explorers such as etherscan.io listen for events to update the users balance.  With the current code, etherscan.io would not update the balance on a burn or mint event.

### LN 159 Potential over flow
A very larege valuen 2^256 could be passed in to create an over flow error.

### No balanceOf function
Not having a balanceOf function means the token will not be ERC20 compliant.  A wrapper function could be added to fix this.

```
function balanceOf(address who) external view returns (uint256) {
    return accInfo[who].balance;
}
```

Added.

### Defend against address(0)
White and black list allows the owner to add `address(0)`

Fixed.

### LN 72, 73, 74, 75 103,  No reasons on requires
Its good practice to return a reason to the user on a require.

Fixed.

### LN 3-5 Interface defined but not used.
If this interface isn't being used, then I would recommend removing it from the code.

### White list / black list logic error
THe logic didnt make sense.  Not being in a white list doesnt mean being in a black list. This has been refactored to `isVerified`

## LN 106 Mint event logic error
Calling the mint event should be the buyer not the sender.

### Testing ERC20 properties
Comprehensive unit testing has been added for all of the functions.

## Testing
Mnemonic: business shield nasty emotion ticket palm tray language betray wealth blood scrub

run `ganache-cli -m business shield nasty emotion ticket palm tray language betray wealth blood scrub`

Owner: `0x5d2235ee8828e9fb24293d8061e6f7e84d044138` `0x20a4748b6dc15c7106f487a11f358d6418be838c762bbef10095d92fdad3a6f9`

The contract has been deployed on Ropsten network https://ropsten.etherscan.io/address/0xcb74b2172ac8f515d5876aafa7b7a4cd07395208