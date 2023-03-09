/** @type import('hardhat/config').HardhatUserConfig */
require("dotenv").config()
require("@nomiclabs/hardhat-ethers")
require("@nomiclabs/hardhat-etherscan")
require("@nomicfoundation/hardhat-toolbox")
require("hardhat-gas-reporter")
require("solidity-coverage")

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""
const GOERLI_RPC_URL =
    process.env.GOERLI_RPC_URL || "https://eth-goerli.g.alchemy.com/v2/your-api-key"
const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
const MNEMONIC = process.env.MNEMONIC || ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""

module.exports = {
    solidity: {
        version: "0.8.9",
        settings: {
            optimizer: {
                enabled: false,
                runs: 200,
            },
        },
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            // gasPrice: 130000000000,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: {
                mnemonic: MNEMONIC,
            },
            blockConfirmations: 6,
            chainId: 5,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
    mocha: {
        timeout: 200000, // 200 seconds max for running tests
    },
}
