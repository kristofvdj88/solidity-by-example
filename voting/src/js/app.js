const { logger } = require(".helpers/logger.js");

App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",

  /**
   * Initializes the client app
   * @returns the initialized client app
   */
  init: async function () {
    await App.initWeb3();
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
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  /**
   * Initialized the app contract(s)
   */
  initContract: function () {
    $.getJSON("Ballot.json", function (ballot) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Ballot = TruffleContract(ballot);
      // Connect provider to interact with contract
      App.contracts.Ballot.setProvider(App.web3Provider);

      return App.render();
    });
  },

  /**
   * Renders the contract(s) state in the UI
   */
  render: async function () {
    try {
      logger.group("render");

      App.loading();

      const instance = await App.contracts.Ballot.deployed();
      const chair = await instance.chairPerson();
      const proposals = await instance.proposals();
      const winningProposals = await instance.winningProposals();
      const winnerNames = await instance.winnerNames();

      logger.message("chair", chair);
      logger.message("proposals", proposals);
      logger.message("winningProposals", winningProposals);
      logger.message("winnerNames", winnerNames);

      $("#chair").val(chair);

      var proposalsSelect = $("#proposals-select");
      candidatesResults.empty();
      for (var i = 0; i <= proposals.length; i++) {
        var id = i;
        var name = proposals[i][0];
        var voteCount = proposals[i][1];

        // Render proposal result
        var proposalTemplate =
          "<tr><th>" +
          id +
          "</th><td>" +
          name +
          "</td><td>" +
          voteCount +
          "</td></tr>";
        proposalsResults.append(proposalTemplate);

        // Render proposal ballot option
        var proposalOption =
          "<option value='" + id + "' >" + name + "</ option>";
        proposalsSelect.append(proposalOption);
      }

      $("#current-winner-proposal").html(winnerNames);

      App.loading(false);
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      logger.groupEnd();
    }
  },

  /**
   * Event to trigger the giveRightToVote contract transaction
   */
  giveRightToVote: async function () {
    try {
      logger.group("giveRightToVote");

      App.loading();

      const instance = await App.contracts.Ballot.deployed();
      const address = App.getInputValue("grant-voting-right-address");

      await instance.giveRightToVote(address, { from: App.account });

      App.loading(false);
      await App.render();
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      logger.groupEnd();
    }
  },

  /**
   * Event to trigger the delegate contract transaction
   */
  delegate: async function () {
    try {
      App.logger.group("delegate");

      loading();

      const instance = await App.contracts.Ballot.deployed();
      const address = App.getInputValue("delegate-address");

      await instance.delegate(address, { from: App.account });

      App.loading(false);
      await App.render();
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      logger.groupEnd();
    }
  },

  /**
   * Event to trigger the vote contract transaction
   */
  vote: async function () {
    try {
      App.logger.group("vote");

      loading();

      const instance = await App.contracts.Ballot.deployed();
      const proposalId = App.getInputValue("proposals-select");

      await instance.vote(proposalId, { from: App.account });

      App.loading(false);
      await App.render();
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      logger.groupEnd();
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
   * Gets an HTML input control value from the DOM
   * @param {*} id of the input control you're targetting
   * @returns
   */
  getInputValue: function (id) {
    const value = $(`#${id}`).val();
    logger.message(id, value);
    return value;
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
