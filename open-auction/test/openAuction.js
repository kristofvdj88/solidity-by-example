var OpenAuction = artifacts.require("./OpenAuction.sol");

contract("OpenAuction", function (accounts) {
    const owner = accounts[0];
    const alice = accounts[1];
    const bob = accounts[2];

    // TODO:
    // - Test HighestBidIncreased event trigger 1 time and 0 times
    // - Test beneficiary to be correct
    // - Test withdraw function for pending return to valid and invalid addresses
    // - Test auctionEnd should revert because not yet passed end time
    // - Test auctionEnd should revert because already ended
    // - Test auctionEnd should not revert + AuctionEnded event + beneficiary to receive highestBid
});
