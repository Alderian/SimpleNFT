require("dotenv").config()
const { ethers } = require("hardhat")

const contract = require("../artifacts/contracts/SimpleNFT.sol/SimpleNFT.json")
const contractInterface = contract.abi

const mintPrice = ethers.utils.parseEther("0.12")
const gasLimit = 30000000

async function main() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners()
    const simpleNFT = new ethers.Contract(
        process.env.NFT_CONTRACT_ADDRESS,
        contractInterface,
        owner
    )

    // First turn sale on !
    let isSaleActive = await simpleNFT.isSaleActive()
    if (!isSaleActive) {
        console.log("Turning sale on!")
        await simpleNFT.toggleSale()
    } else {
        console.log("The sale is on!")
    }

    console.log("Addr1:", addr1.address)
    console.log("Balance:", (await addr1.getBalance()).toString())

    await simpleNFT
        .connect(addr1)
        .saleOne({ value: mintPrice, gasLimit: gasLimit })
        .then((transaction) => console.log(transaction))
        .catch((e) => console.log("something went wrong", e))

    console.log("Balance after buy:", (await addr1.getBalance()).toString())

    console.log("------------------------------------")
    console.log("Addr2:", addr2.address)
    console.log("Balance:", (await addr2.getBalance()).toString())

    await simpleNFT
        .connect(addr2)
        .saleOne({ value: mintPrice, gasLimit: gasLimit })
        .then((transaction) => console.log(transaction))
        .catch((e) => console.log("something went wrong", e))

    console.log("Balance after buy:", (await addr2.getBalance()).toString())

    console.log("------------------------------------")
    console.log("Addr3:", addr3.address)
    console.log("Balance:", (await addr3.getBalance()).toString())

    await simpleNFT
        .connect(addr3)
        .saleOne({ value: mintPrice, gasLimit: gasLimit })
        .then((transaction) => console.log(transaction))
        .catch((e) => console.log("something went wrong", e))

    console.log("Balance after buy:", (await addr3.getBalance()).toString())
}

main()
