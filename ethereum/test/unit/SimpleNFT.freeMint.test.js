const { expect } = require("chai")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { AddressZero } = require("@ethersproject/constants")

const mintPrice = ethers.utils.parseEther("0.12")
const name = "SimpleNFT"
const symbol = "SNFT"
const baseURI = "ipsf://one-ipfs-uri/"

/**
 * Here I just test bulk minting... using 3 different methods
 *
 * * Mint one by one
 * * Mint amount for each wallet, one wallet at a time
 * * Mint all for all in one call
 */
describe("SimpleNFT contract Freemint", function () {
    let simpleNFT, maxSupply, addresses, amounts, owner, withdrawer, addr1, addr2, addr3, addr4

    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploySimpleNFT() {
        const [owner, withdrawer, addr1, addr2, addr3, addr4] = await ethers.getSigners()
        const SimpleNFT = await ethers.getContractFactory("SimpleNFT")
        const simpleNFT = await SimpleNFT.deploy(name, symbol, baseURI, withdrawer.address, 1000)
        const maxSupply = await simpleNFT.maxSupply()

        return { simpleNFT, owner, withdrawer, maxSupply, addr1, addr2, addr3, addr4 }
    }

    before("Any test SimpleNFT", async () => {
        ;({ simpleNFT, owner, withdrawer, maxSupply, addr1, addr2, addr3, addr4 } =
            await loadFixture(deploySimpleNFT))
    })

    describe("Minting", function () {
        before("Any test SimpleNFT, turn sales on", async () => {
            let isSaleActive = await simpleNFT.isSaleActive()
            if (!isSaleActive) await simpleNFT.toggleSale()

            // Prepare minting list
            addresses = [addr1.address, addr2.address, addr3.address, addr4.address]
            amounts = [30, 60, 10, 70]
        })

        it("Mint one by one", async function () {
            let balanceBefore = await owner.getBalance()
            console.log("Balance before:", ethers.utils.formatEther(balanceBefore))

            for (i = 0; i < addresses.length; i++) {
                let addr = addresses[i]
                let amount = amounts[i]

                expect(await simpleNFT.balanceOf(addr)).to.equal(0)
                console.log("Minting", amount, "to", addr)

                for (j = 0; j < amount; j++) {
                    await simpleNFT.freeMintOne(addr)
                    expect(await simpleNFT.balanceOf(addr)).to.equal(j + 1)
                }
            }

            let balanceEnd = await owner.getBalance()
            console.log("Balance end:", ethers.utils.formatEther(balanceEnd))
            console.log("Total gas:", ethers.utils.formatEther(balanceBefore.sub(balanceEnd)))
        })

        it("Mint one wallet at a time, all nfts to one wallet", async function () {
            let balanceBefore = await owner.getBalance()
            console.log("Balance before:", ethers.utils.formatEther(balanceBefore))

            for (i = 0; i < addresses.length; i++) {
                let addr = addresses[i]
                let amount = amounts[i]

                // Viene del test anterior
                expect(await simpleNFT.balanceOf(addr)).to.equal(amount)
                console.log("Minting", amount, "to", addr)

                await simpleNFT.freeMint(addr, amount)
                // Ahora tiene le doble
                expect(await simpleNFT.balanceOf(addr)).to.equal(2 * amount)
            }

            let balanceEnd = await owner.getBalance()
            console.log("Balance end:", ethers.utils.formatEther(balanceEnd))
            console.log("Total gas:", ethers.utils.formatEther(balanceBefore.sub(balanceEnd)))
        })

        it("Mint bulk...send both arrays", async function () {
            let balanceBefore = await owner.getBalance()
            console.log("Balance before:", ethers.utils.formatEther(balanceBefore))

            for (i = 0; i < addresses.length; i++) {
                let addr = addresses[i]
                let amount = amounts[i]

                // Viene del test anterior
                expect(await simpleNFT.balanceOf(addr)).to.equal(2 * amount)
            }

            await simpleNFT.freeBulkMint(addresses, amounts)

            for (i = 0; i < addresses.length; i++) {
                let addr = addresses[i]
                let amount = amounts[i]

                // Ahora tiene el triple
                expect(await simpleNFT.balanceOf(addr)).to.equal(3 * amount)
            }

            let balanceEnd = await owner.getBalance()
            console.log("Balance end:", ethers.utils.formatEther(balanceEnd))
            console.log("Total gas:", ethers.utils.formatEther(balanceBefore.sub(balanceEnd)))
        })
    })
})
