const { expect } = require("chai")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { AddressZero } = require("@ethersproject/constants")

const mintPrice = ethers.utils.parseEther("0.12")
const name = "SimpleNFT"
const symbol = "SNFT"
const baseURI = "ipsf://one-ipfs-uri/"

describe("SimpleNFT contract", function () {
    let simpleNFT, owner, withdrawer, maxSupply, addr1, addr2, addr3

    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploySimpleNFT() {
        const [owner, withdrawer, addr1, addr2, addr3] = await ethers.getSigners()
        const SimpleNFT = await ethers.getContractFactory("SimpleNFT")
        const simpleNFT = await SimpleNFT.deploy(name, symbol, baseURI, withdrawer.address)
        const maxSupply = await simpleNFT.maxSupply()

        return { simpleNFT, owner, withdrawer, maxSupply, addr1, addr2, addr3 }
    }

    before("Any test SimpleNFT", async () => {
        ;({ simpleNFT, owner, withdrawer, maxSupply, addr1, addr2, addr3 } = await loadFixture(
            deploySimpleNFT
        ))
    })

    describe("Deployment", function () {
        it("Deployment should assign default values", async function () {
            expect(await simpleNFT.name()).to.equal(name)
            expect(await simpleNFT.symbol()).to.equal(symbol)
            expect(await simpleNFT.totalSupply()).to.equal(0)
            expect(await simpleNFT.availableSupply()).to.equal(maxSupply)
            expect(await simpleNFT.price()).to.equal(mintPrice)
            expect(await simpleNFT.isSaleActive()).to.equal(false)
        })
    })

    describe("Minting disabled", function () {
        it("Should not mint if not active", async function () {
            await expect(
                simpleNFT.connect(addr1).saleOne({ value: mintPrice })
            ).to.be.revertedWithCustomError(simpleNFT, "SaleNotActive")
        })
    })

    describe("Minting", function () {
        before("Any test SimpleNFT, turn sales on", async () => {
            let isSaleActive = await simpleNFT.isSaleActive()
            if (!isSaleActive) await simpleNFT.toggleSale()
        })

        it("Should sale first one", async function () {
            expect(await simpleNFT.balanceOf(addr1.address)).to.equal(0)

            let mintTrx = await simpleNFT.connect(addr1).saleOne({ value: mintPrice })

            expect(await simpleNFT.balanceOf(addr1.address)).to.equal(1)

            expect(await simpleNFT.totalSupply()).to.equal(1)
            expect(await simpleNFT.availableSupply()).to.equal(maxSupply - 1)

            await expect(mintTrx)
                .to.emit(simpleNFT, "Transfer")
                .withArgs(AddressZero, addr1.address, 1)
        })

        it("Should not sale more than one", async function () {
            // Got one from previous test
            expect(await simpleNFT.balanceOf(addr1.address)).to.equal(1)

            // Try to buy anotherone
            await expect(simpleNFT.connect(addr1).saleOne({ value: mintPrice }))
                .to.be.revertedWithCustomError(simpleNFT, "MaximumPerWallet")
                .withArgs(1)
        })

        it("Should revert if not enough gas payed", async function () {
            // Got one from previous test
            expect(await simpleNFT.balanceOf(addr2.address)).to.equal(0)

            // Try to buy with less gas
            const mintPrice1 = ethers.utils.parseEther("0.01")

            await expect(
                simpleNFT.connect(addr2).saleOne({ value: mintPrice1 })
            ).to.be.revertedWithCustomError(simpleNFT, "InvalidEthAmount")
        })
    })

    describe("Withdrawal", function () {
        before("Fill contract with money", async () => {
            let isSaleActive = await simpleNFT.isSaleActive()
            if (!isSaleActive) await simpleNFT.toggleSale()
            await simpleNFT.connect(addr2).saleOne({ value: mintPrice })
            await simpleNFT.connect(addr3).saleOne({ value: mintPrice })
        })

        it("Should withdraw with withdrawal address", async function () {
            const startBalance = await ethers.provider.getBalance(withdrawer.address)
            const totalSupply = await simpleNFT.totalSupply()
            const finalBalance = startBalance.add(mintPrice.mul(totalSupply))

            await simpleNFT.connect(owner).withdrawAll()

            expect(await ethers.provider.getBalance(withdrawer.address)).to.eq(finalBalance)
        })

        it("should not withdraw empty balance", async function () {
            await expect(simpleNFT.connect(owner).withdrawAll()).to.be.revertedWithCustomError(
                simpleNFT,
                "NoBalanceAvailable"
            )
        })
    })

    describe("Change mint price", function () {
        const mintPrice1 = ethers.utils.parseEther("0.01")

        it("Should check only owner can change mint price", async function () {
            await expect(simpleNFT.connect(addr1).setMintPrice(mintPrice1)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            )
        })

        it("Should change mint price", async function () {
            await simpleNFT.connect(owner).setMintPrice(mintPrice1)
            expect(await simpleNFT.price()).to.eq(mintPrice1)
        })
    })

    describe("Max supply and max mint", function () {
        it("Should check only owner can change max per wallet", async function () {
            await expect(simpleNFT.connect(addr1).setMaxPerWallet(5)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            )
        })

        it("Should change max mint per wallet", async function () {
            await simpleNFT.connect(owner).setMaxPerWallet(5)
            expect(await simpleNFT.maxPerWallet()).to.eq(5)
        })

        it("Should check only owner can change max supply", async function () {
            await expect(simpleNFT.connect(addr1).setMaxSupply(10)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            )
        })

        it("Should change max supplt", async function () {
            await simpleNFT.connect(owner).setMaxSupply(10)
            expect(await simpleNFT.maxSupply()).to.eq(10)
        })

        it("should verify max supply when selling all", async function () {
            let isSaleActive = await simpleNFT.isSaleActive()
            if (!isSaleActive) await simpleNFT.toggleSale()

            // Check total supply (this depends on all testes before)
            expect(await simpleNFT.totalSupply()).to.equal(3)

            // Wallet 1 already have 1 minted
            await simpleNFT.connect(addr1).saleOne({ value: mintPrice })
            await simpleNFT.connect(addr1).saleOne({ value: mintPrice })
            await simpleNFT.connect(addr1).saleOne({ value: mintPrice })
            await simpleNFT.connect(addr1).saleOne({ value: mintPrice })

            await expect(
                simpleNFT.connect(addr1).saleOne({ value: mintPrice })
            ).to.be.revertedWithCustomError(simpleNFT, "MaximumPerWallet")

            // Wallet 2, 3 already have 1 minted, but if we mint 3 more, it will fail
            await simpleNFT.connect(addr2).saleOne({ value: mintPrice })
            await simpleNFT.connect(addr2).saleOne({ value: mintPrice })
            await simpleNFT.connect(addr2).saleOne({ value: mintPrice })

            expect(await simpleNFT.totalSupply()).to.equal(10)

            await expect(
                simpleNFT.connect(addr2).saleOne({ value: mintPrice })
            ).to.be.revertedWithCustomError(simpleNFT, "ExceedSupplyLimit")
        })
    })

    describe("Token baseURI resolution", function () {
        it("Should resolve configured baseURI", async function () {
            expect(await simpleNFT.tokenURI(1)).to.equal(baseURI + "1")
        })
    })
})
