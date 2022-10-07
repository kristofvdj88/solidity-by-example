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
      Log.group("render");

      App.loading();

      // Load account data
      if (window.ethereum) {
        const acc = await ethereum.enable();
        App.account = acc[0];
        Log.message(App.account);
        $("#account-address").html("Your Account: " + App.account);
      }

      const instance = await App.contracts.Ballot.deployed();

      // Chair
      const chair = await instance.chairperson();
      Log.message(chair);
      if (App.account == chair) $(".chair-only").addClass("visible");
      else $(".chair-only").addClass("invisible");
      $("#chair").val(chair);

      // Proposals
      var proposals = [];
      const proposalCount = await instance.getProposalCount();
      for (let i = 0; i < proposalCount; i++)
        proposals.push(await instance.proposals(i));
      Log.table(proposals);

      var proposalResults = $("#proposal-results").find("tbody");
      proposalResults.empty();
      var proposalsSelect = $("#proposals-select");
      proposalsSelect.empty();
      for (var i = 0; i < proposals.length; i++) {
        var id = i;
        var name = web3.toAscii(proposals[i][0]);
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
        proposalResults.append(proposalTemplate);

        // Render proposal ballot option
        var proposalOption =
          "<option value='" + id + "' >" + name + "</ option>";
        proposalsSelect.append(proposalOption);
      }

      // Winner(s)
      const winningProposals = await instance.winningProposals();
      Log.table(winningProposals);

      const winnerNames = await instance.winnerNames();
      Log.table(winnerNames);
      $("#current-winner-proposal").empty();
      for (let i = 0; i < winnerNames.length; i++)
        $("#current-winner-proposal").append(
          "<p>" + web3.toAscii(winnerNames[i]) + "</p>"
        );

      $("#grant-voting-right-address-container").empty();
      $("#grant-voting-right-address-container").append(
        '<input type="text" class="form-control grant-voting-right-address" />'
      );

      App.loading(false);
    } catch (e) {
      Log.error(e);
    } finally {
      Log.groupEnd();
      App.loading(false);
    }
  },

  /**
   * Event to trigger the giveRightToVote contract transaction
   */
  giveRightToVote: async function () {
    try {
      Log.group("giveRightToVote");

      App.loading();

      const instance = await App.contracts.Ballot.deployed();
      const addresses = App.getInputValues("grant-voting-right-address");

      await instance.giveRightToVote(addresses, { from: App.account });

      App.loading(false);
      await App.render();
    } catch (e) {
      Log.error(e);
    } finally {
      Log.groupEnd();
      App.loading(false);
    }
  },

  /**
   * Event to trigger the delegate contract transaction
   */
  delegate: async function () {
    try {
      Log.group("delegate");

      App.loading();

      const instance = await App.contracts.Ballot.deployed();
      const address = App.getInputValue("delegate-address");

      await instance.delegate(address, { from: App.account });

      App.loading(false);
      await App.render();
    } catch (e) {
      Log.error(e);
    } finally {
      Log.groupEnd();
      App.loading(false);
    }
  },

  /**
   * Event to trigger the vote contract transaction
   */
  vote: async function () {
    try {
      Log.group("vote");

      App.loading();

      const instance = await App.contracts.Ballot.deployed();
      const proposalId = App.getInputValue("proposals-select");

      await instance.vote(proposalId, { from: App.account });

      App.loading(false);
      await App.render();
    } catch (e) {
      Log.error(e);
    } finally {
      Log.groupEnd();
      App.loading(false);
    }
  },

  /**
   * Event that gets triggered when the chair user clicks the add button to add
   * an additional address to grant voting rights to
   */
  addGrantVotingRightAddress: function () {
    $("#grant-voting-right-address-container").append(
      '<input type="text" class="form-control grant-voting-right-address" />'
    );
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
