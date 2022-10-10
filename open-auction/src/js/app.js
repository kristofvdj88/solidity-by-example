// TODO:
//  - Auction details:
//    - Display beneficiary address
//    - Display countdown to auctionEndTime
//    - Display highestBidder
//    - Display highestBid
//  - Auction functionalities:
//    - bid() => numeric input + btn
//    - withdraw() => btn
//    - auctionEnd() => btn
//  - Auction event watchers:
//    - HighestBidIncreased
//    - AuctionEnded

App = {
    web3Provider: null,
    contracts: {},

    init: async function () {
        return await App.initWeb3();
    },

    initWeb3: async function () {
        /*
         * Replace me...
         */

        return App.initContract();
    },

    initContract: function () {
        /*
         * Replace me...
         */

        return App.bindEvents();
    },

    bindEvents: function () {
        $(document).on("click", ".btn-adopt", App.handleAdopt);
    },
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
