require('dotenv').config();
const PrivateKeyProvider = require('truffle-privatekey-provider');
const privateKeyProvider = new PrivateKeyProvider(process.env.PRIVATE_KEY, 'https://mainnet.infura.io/v3/' + process.env.INFURA_PROJECT_ID);

module.exports = {
  networks: {
    development: {
      protocol: 'http',
      host: 'localhost',
      port: 8545,
      gas: 5000000,
      gasPrice: 5e9,
      networkId: '*',
    },
    kovan: {
      provider: () =>  new PrivateKeyProvider(process.env.PRIVATE_KEY, 'https://kovan.infura.io/v3/' + process.env.INFURA_PROJECT_ID),
      network_id: 42,       // Ropsten's id
      gas: 5500000,        // Ropsten has a lower block limit than mainnet
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    live: {
      network_id: 1, // Mainnet network id
      provider: () =>  new PrivateKeyProvider(process.env.PRIVATE_KEY, 'https://mainnet.infura.io/v3/' + process.env.INFURA_PROJECT_ID),
      gas: 5000000,
      nonce: 244,
      gasPrice: 20e9
    }, 
  },
};
