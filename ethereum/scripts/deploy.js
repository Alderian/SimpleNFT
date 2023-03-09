require("dotenv").config()
const { ethers, network } = require("hardhat")

const baseURI = process.env.NFT_API_URI

const name = "SimpleNFT"
const token = "SNFT"
const maxSupply = ethers.BigNumber.from(5)

async function main() {
    const [owner] = await ethers.getSigners()

    console.log("Owner:", owner.address)
    console.log("Balance:", ethers.utils.formatEther(await owner.getBalance()))

    const SimpleNFT = await ethers.getContractFactory("SimpleNFT")
    const simpleNFT = await SimpleNFT.deploy(name, token, baseURI, owner.address, maxSupply)

    console.log("SimpleNFT deployed:", simpleNFT.address)
    console.log(
        "Balance after deploy:",
        ethers.utils.parseUnits(await owner.getBalance(), "ethers")
    )
    console.log("current network: " + network.name)
    console.log("current chain id: " + network.config.chainId)

    console.log(
        "To verify contract run: ",
        `npx hardhat verify --network "${network.name}" ${simpleNFT.address} "${name}" "${token}" "${baseURI}" "${owner.address}" ${maxSupply}`
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
