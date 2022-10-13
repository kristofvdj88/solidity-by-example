const { expectRevert, expectEvent, time } = require("@openzeppelin/test-helpers");

var OpenAuction = artifacts.require("./OpenAuction.sol");

contract("OpenAuction", function (accounts) {
    let auction;

    const owner = accounts[0];
    const beneficiary = accounts[1];
    const alice = accounts[2];
    const bob = accounts[3];
    const carmen = accounts[4];

    const SECONDS_IN_A_DAY = 86400;

    describe("Start auction", function () {
        before(async () => {
            auction = await OpenAuction.new(SECONDS_IN_A_DAY, beneficiary, { from: owner });
        });

        it("beneficiary should be correct", async function () {
            assert.equal(beneficiary, await auction.beneficiary());
        });

        it("should trigger HighestBidIncreased event", async function () {
            const amount = web3.utils.toWei("2", "ether");
            const tx = await auction.bid({ from: alice, value: amount });

            expectEvent(tx, "HighestBidIncreased", { bidder: alice, amount });
        });

        it("should revert, bid too low", async function () {
            const amount = web3.utils.toWei("1", "ether");
            await expectRevert.unspecified(auction.bid({ from: bob, value: amount }));
        });
    });

    describe("Withdrawal", function () {
        before(async () => {
            auction = await OpenAuction.new(SECONDS_IN_A_DAY, beneficiary, { from: owner });
        });

        it("withdraw should be correct amount", async function () {
            const lowerBid = web3.utils.toWei("2", "ether");
            await auction.bid({ from: alice, value: lowerBid });

            const higherBid = web3.utils.toWei("3", "ether");
            await auction.bid({ from: bob, value: higherBid });

            const initialBalance = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(alice)));

            const withdrawal = await auction.withdraw({ from: alice });
            assert.equal(withdrawal.receipt.status, true, "Withdraw unsuccessfull!");

            const finalBalance = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(alice)));
            const result = (finalBalance - initialBalance).toFixed(0);
            assert.equal(result, 2, "Withdraw amount incorrect!");
        });

        it("withdraw should be 0", async function () {
            const initialBalance = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(carmen)));

            const withdrawal = await auction.withdraw({ from: carmen });
            assert.equal(withdrawal.receipt.status, true, "Withdraw unsuccessfull!");

            const finalBalance = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(carmen)));
            const result = (finalBalance - initialBalance).toFixed(0);

            assert.equal(result, 0, "Withdraw amount incorrect!");
        });
    });

    describe("End auction", function () {
        before(async () => {
            auction = await OpenAuction.new(SECONDS_IN_A_DAY, beneficiary, { from: owner });
        });

        it("should revert, auction not ended yet", async function () {
            await expectRevert.unspecified(auction.auctionEnd());
        });

        it("should trigger AuctionEnded event and send highest bid to beneficiary", async function () {
            const amount = web3.utils.toWei("2", "ether");
            const tx = await auction.bid({ from: alice, value: amount });
            expectEvent(tx, "HighestBidIncreased", { bidder: alice, amount });

            const initialBalance = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(beneficiary)));

            await time.increase(SECONDS_IN_A_DAY * 2);

            const endTx = await auction.auctionEnd();
            expectEvent(endTx, "AuctionEnded", { winner: alice, amount });

            const finalBalance = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(beneficiary)));
            const result = (finalBalance - initialBalance).toFixed(0);

            assert.equal(result, 2, "Beneficiary highest bid amount incorrect!");
        });

        it("should revert, auction already ended", async function () {
            await expectRevert.unspecified(auction.auctionEnd());
        });
    });
});
