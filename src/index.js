const Web3 = require('web3');

async function main() {
    // Set up web3 object, connected to the local development network
    const web3 = new Web3('http://localhost:7545');

    // Set up a web3 contract, representing our deployed Counter instance
    const address = '0x0afA62E858B10Df8576A95819Fa75c963Aa57acE';
    const abi = require('../build/contracts/Counter.json').abi;

    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(abi, address);
    await contract.methods.increase(20).send({ from: accounts[0], gas: 50000, gasPrice: 1e6 });
    // Call the value() function of the deployed Counter contract
    const value = await contract.methods.value().call();
    console.log(value);
}

main();