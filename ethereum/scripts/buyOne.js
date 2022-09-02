require("dotenv").config()
const { ethers } = require("hardhat")

const contract = require("../artifacts/contracts/SimpleNFT.sol/SimpleNFT.json")
const contractInterface = contract.abi

mintPrice = ethers.utils.parseEther("0.12")

async function main() {
    const [owner, addr1] = await ethers.getSigners()
    const simpleNFT = new ethers.Contract(
        process.env.NFT_CONTRACT_ADDRESS,
        contractInterface,
        owner
    )

    simpleNFT
        .connect(addr1)
        .saleOne({ value: mintPrice })
        .then((transaction) => console.log(transaction))
        .catch((e) => console.log("something went wrong", e))
}

main()
