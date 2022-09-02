# A Simple NFT project

Simple NFT, Sell using ETH gas... with Max suply, authorized withdrawal wallet, configurable baseURI and price

# What you need

* Node v16.17, NPM 8.18.0
    * We provide .nvmrc with node version for convenience (https://github.com/nvm-sh)
* An Alchemy account
* A ngrok account
* gpETH in Goerli network wallet
* Configure .env file using .env.sample as base
    * Never commit you .env with keys!!
# Alchemy

Create an Alchemy account, create a project and grab key and url and set .env

```
DEV_API_URL = https://eth-goerli.g.alchemy.com/v2/olD5...
DEV_API_KEY = olD5...
```

# Configure a Develop (not for production) wallet

Create a wallet using metamask or whatever) and grab private and public key... DONT USE THIS ACCOUT FOR YOUR REAL MONEY

Set .env variables

```
PRIVATE_KEY = 5924...
PUBLIC_KEY = 0x7C5...
```

You will need goETH in your wallet... use these faucets

* https://goerli-faucet.pk910.de/
* https://goerlifaucet.com/

# Compile and deploy contracts

in ```ethereum``` directory, run:

```
npm install
npx hardhat compile
node ./scripts/deploy.js
```

Use the resulting contract address to configure .env variable

```
NFT_CONTRACT_ADDRESS = 0xFF1...
```

You can also run tests to ensure its running

```
npx hardhat test
```

# Verify contracts on etherscan

You need an etherscan api key and set in in your .env ETHERSCAN_API_KEY

When you deployed early, the script just post how to verify, the command looks like this:

```
npx hardhat verify --network goerli DEPLOYED_CONTRACT_ADDRESS "SimpleNFT", "SNFT" "A_BACKEND_API_URI" "A_WITHDRAWAL_0x_ADDRESS"
```

# Build and run backend api

in ```web``` directory, run:

```
npm install
npm run dev
```

Map it to the internet so you can see the images of your NFT using https://ngrok.com/ (follow instructions for installing and running)

```
./ngrok http 3000
```

put you public gnrok url in .env NFT_API_URI

# Buy a NFT

Now you can mint an NFT using the mint function, we provided a script to make it easier.

in ```ethereum``` directory, run:

```
node ./scripts/buyOne.js
```

You can see all in https://goerli.etherscan.io/ 

# How to see mintes NFT in OpenSea testnets

Go to https://testnets.opensea.io/

Sign the transaction to login with you wallet in goErli network

go to ```https://testnets.opensea.io/assets/<your_contract_address>/<token_id>```

where <your_contract_address> is the address of the contract you deployed and <token_id> should be the item count, if you mint 1, id=1

If you dont see the image of metadata, you will need to hit the Refresh metadata icon

