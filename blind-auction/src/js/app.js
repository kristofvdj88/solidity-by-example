App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  constants: {
    MIN_AUCTION_DURATION: null,
  },

  /**
   * Initializes the client app
   * @returns the initialized client app
   */
  init: async function () {
    return await App.initWeb3();
  },

  /**
   * Initialized the client app web3 provider
   * @returns the initialized client app
   */
  initWeb3: async function () {
    if (typeof web3 !== "undefined") {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
      web3.eth.defaultAccount = web3.eth.accounts[0];
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
      web3 = new Web3(App.web3Provider);
      web3.eth.defaultAccount = web3.eth.accounts[0];
    }
    return App.initContract();
  },

  /**
   * Initialized the app contract(s)
   */
  initContract: async function () {
    const openAuction = await $.getJSON("OpenAuction.json");

    // Instantiate a new truffle contract from the artifact
    App.contracts.OpenAuction = TruffleContract(openAuction);
    // Connect provider to interact with contract
    App.contracts.OpenAuction.setProvider(App.web3Provider);

    await App.getContractConstants();
    await App.render();
    await App.listenForEvents();
    await App.startTimer();
  },

  getContractConstants: async function () {
    try {
      Log.group("getContractConstants");
      App.loading();

      const instance = await App.contracts.OpenAuction.deployed();
      App.constants.MIN_AUCTION_DURATION = await instance.MIN_AUCTION_DURATION();
    } catch (e) {
      Log.error(e);
    } finally {
      Log.groupEnd();
      App.loading(false);
    }
  },

  startTimer: async function () {
    try {
      Log.group("startTimer");
      App.loading();

      const instance = await App.contracts.OpenAuction.deployed();

      // Set the date we're counting down to
      const unix_timestamp = await instance.auctionEndTime();
      const countDownDate = new Date(unix_timestamp * 1000).getTime();

      // Update the count down every 1 second
      var x = setInterval(function () {
        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        $("#countdown").html(days + "d " + hours + "h " + minutes + "m " + seconds + "s ");

        // If the count down is finished, write some text
        if (distance < 0) {
          clearInterval(x);
          $("#countdown").html("Auction ended");
          $("#btn-end-auction").prop("disabled", false);
          $("#btn-bid").prop("disabled", true);
        }
      }, 1000);
    } catch (e) {
      Log.error(e);
    } finally {
      Log.groupEnd();
      App.loading(false);
    }
  },

  /**
   * Renders the contract(s) state in the UI
   */
  render: async function () {
    try {
      Log.group("render");
      App.loading();

      // Load account data
      if (window.ethereum) {
        const acc = await ethereum.enable();
        App.account = acc[0];
        Log.message(App.account);
        $("#account-address").html(`Connected Account: <strong>${App.account}</strong>`);
      }

      const instance = await App.contracts.OpenAuction.deployed();

      // Beneficiary
      const beneficiary = await instance.beneficiary();
      $("#beneficiary").val(beneficiary);

      // Highest bidder and bid
      const highestBidder = await instance.highestBidder();
      const highestBid = (await instance.highestBid()) / 1000000000000000000;
      $("#highest-bidder").val(highestBidder);
      $("#highest-bid").val(highestBid);
      $("#lbl-highest-bidder").html("Highest bidder:");
      $("#lbl-highest-bid").html("Highest bid:");

      $("#btn-bid").prop("disabled", false);
      $("#btn-start-new-auction").prop("disabled", true);
      $("#error-box").hide();
    } catch (e) {
      Log.error(e);
    } finally {
      Log.groupEnd();
      App.loading(false);
    }
  },

  listenForEvents: function () {
    App.contracts.OpenAuction.deployed()
      .then(contractInstance => {
        const highestBidIncreasedEvent = contractInstance.HighestBidIncreased(null, { fromBlock: 0 }, (err, res) => {
          if (err) {
            Log.error(e);
          }
        });
        highestBidIncreasedEvent.watch(function (error, result) {
          Log.group("highestBidIncreasedEvent");
          App.loading();

          if (error) {
            return Log.error(e);
          }
          if (!error) {
            const highestBid = result.args.amount;
            const highestBidder = result.args.bidder;
            $("#highest-bidder").val(highestBidder);
            $("#highest-bid").val(highestBid / 1000000000000000000);

            App.render();
          }

          Log.groupEnd();
          App.loading(false);
        });

        const auctionEndedEvent = contractInstance.AuctionEnded(null, { fromBlock: 0 }, (err, res) => {
          if (err) {
            Log.error(e);
          }
        });
        auctionEndedEvent.watch(function (error, result) {
          Log.group("auctionEndedEvent");
          App.loading();

          if (error) {
            return Log.error(e);
          }
          if (!error) {
            const highestBid = result.args.amount;
            const highestBidder = result.args.winner;
            $("#highest-bidder").val(highestBidder);
            $("#highest-bid").val(highestBid / 1000000000000000000);

            $("#lbl-highest-bidder").html("Winner:");
            $("#lbl-highest-bid").html("Winning bid:");

            $("#btn-end-auction").prop("disabled", true);
            $("#btn-start-new-auction").prop("disabled", false);
          }

          Log.groupEnd();
          App.loading(false);
        });

        const auctionStartedEvent = contractInstance.AuctionStarted(null, { fromBlock: 0 }, (err, res) => {
          if (err) {
            Log.error(e);
          }
        });
        auctionStartedEvent.watch(function (error, result) {
          Log.group("auctionStartedEvent");
          App.loading();

          if (error) {
            return Log.error(e);
          }
          if (!error) {
            App.render();
            App.startTimer();
          }

          Log.groupEnd();
          App.loading(false);
        });
      })
      .catch(e => {
        Log.error(e);
      });
  },

  /**
   * Attempts to place a bid in the auction
   */
  bid: async function () {
    try {
      Log.group("bid");
      App.loading();

      const instance = await App.contracts.OpenAuction.deployed();
      const amount = $("#bid-amount").val() * 1000000000000000000;

      await instance.bid({ from: App.account, value: amount });
    } catch (e) {
      Log.error(e);
    } finally {
      Log.groupEnd();
      App.loading(false);
    }
  },

  /**
   * Attempts to place a withdrawal of overbid funds from the auction
   */
  withdraw: async function () {
    try {
      Log.group("withdraw");
      App.loading();

      const instance = await App.contracts.OpenAuction.deployed();

      await instance.withdraw({ from: App.Account });
    } catch (e) {
      Log.error(e);
    } finally {
      Log.groupEnd();
      App.loading(false);
    }
  },

  /**
   * Attempts to close the auction
   */
  endAuction: async function () {
    try {
      Log.group("endAuction");
      App.loading();

      const instance = await App.contracts.OpenAuction.deployed();

      await instance.auctionEnd();
    } catch (e) {
      Log.error(e);
    } finally {
      Log.groupEnd();
      App.loading(false);
    }
  },

  /**
   * Attempts to start a new auction
   */
  startNewAuction: async function () {
    try {
      Log.group("startNewAuction");
      App.loading();

      const instance = await App.contracts.OpenAuction.deployed();
      const beneficiary = $("#new-beneficiary").val();
      const endDate = new Date($("#new-end-date").val()).getTime();
      const now = new Date().getTime();
      const secondsToEndDate = Math.ceil((endDate - now) / 1000);

      if (secondsToEndDate <= 0) {
        $("#error-box").show();
        $("#error-box").html("End date must be in the future");
      } else if (secondsToEndDate < App.constants.MIN_AUCTION_DURATION) {
        $("#error-box").show();
        $("#error-box").html(`Auction must have a minimum duration of ${Math.ceil(App.constants.MIN_AUCTION_DURATION / 60)} minutes`);
      } else {
        $("#error-box").hide();
        $("#error-box").html("");
      }

      await instance.auctionStartNew(secondsToEndDate, beneficiary);
    } catch (e) {
      Log.error(e);
    } finally {
      Log.groupEnd();
      App.loading(false);
    }
  },

  /**
   * Shows or hides the loader
   * @param {*} loading boolean to control the loader visibility
   */
  loading: function (loading = true) {
    var loader = $("#loader");
    var content = $("#content");

    if (loading) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  },

  /**
   * Gets an HTML input control value from the DOM by id
   * @param {*} id of the input control you're targetting
   * @returns the string value of the input
   */
  getInputValue: function (id) {
    const value = $(`#${id}`).val();
    Log.message(value);
    return value;
  },

  /**
   * Gets an HTML input control value from the DOM by class
   * @param {*} className of the input control you're targetting
   * @returns an array of the string values of the inputs
   */
  getInputValues: function (className) {
    var values = [];

    $(`.${className}`).each(function () {
      values.push($(this).val());
    });
    return values;
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
