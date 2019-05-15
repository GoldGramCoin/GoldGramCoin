# Pre flight check list

We recommend following the Glacier Protocol https://glacierprotocol.org/docs/overview/

## Purchase Hardware wallet
Purchase a ledger wallet nano s from https://shop.ledger.com/products/ledger-nano-s and verify the security seal when delivered.

## Back up the mnemonic seed
When starting the ledger for the first time, you will be presented a set of 12 to 15 words.  Eg: `tragic near rocket across biology shop push dragon jazz detail differ say`.  Write down on the paper card these words in a private location. 

## Add 1 ETH to account 0
Send 1 ETH to the account 0 of the ledger.

## Signing the contract
Use MyEtherWallet https://vintage.myetherwallet.com/#contracts to deploy the contract.  Confirm you are on MainNet. Use the contract byte code commited to GitHub in `/contracts` folder.  Select "use ledger" on MyEtherWallet and select account 0.   Set the gas limit to 4,000,000.

## Verifiy the contract has been deployed
Use the contract address that MyEtherWallet has returned to verify the contract has been deployed correct via `https://etherscan.io` (MainNet)

## Create minter and burner hot wallet
Use MyEtherWallet https://vintage.myetherwallet.com/#generate-wallet, create two new addresses for minter and burner.  These private keys will need to be secured in your application as they will allow minting and burning of your tokens.

## Adding minter and burner
From MyEtherWallet https://vintage.myetherwallet.com/#contracts use the "Interact with a contact" feature to add a minter and burner address.  The transaction will be signed via the account 0 of the ledger as it is the contract owner. This will require a small amount of gas.

## Futher
Further see 'Glacier Protocol' https://glacierprotocol.org
