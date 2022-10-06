/// HELPERS
var ethers = require("ethers");
var crypto = require("crypto");

function generateRandomAddress() {
  var id = crypto.randomBytes(32).toString("hex");
  var privateKey = "0x" + id;
  console.log("SAVE BUT DO NOT SHARE THIS:", privateKey);

  var wallet = new ethers.Wallet(privateKey);
  console.log("Address: " + wallet.addres);

  return wallet.address;
}

/// TESTS
var Ballot = artifacts.require("./Ballot.sol");
const truffleAssert = require("truffle-assertions");

contract("Ballot", function (accounts) {
  const owner = accounts[0];
  const alice = accounts[1];
  const bob = accounts[2];

  it("ungranted address has 0 voting right", async function () {
    const instance = await Ballot.deployed();

    const voter = await instance.voters(generateRandomAddress());
    assert.equal(voter.weight, 0);
  });

  it("ungranted address can not be a delegating address", async function () {
    const instance = await Ballot.deployed();

    await truffleAssert.reverts(
      instance.delegate(alice, {
        from: bob,
      })
    );
  });

  it("granted address has one voting right", async function () {
    const instance = await Ballot.deployed();
    await instance.giveRightToVote([alice]);

    const voter = await instance.voters(alice);
    assert.equal(voter.weight, 1);
  });

  it("ungranted address can not be a delegator address", async function () {
    const instance = await Ballot.deployed();

    await truffleAssert.reverts(
      instance.delegate(bob, {
        from: alice,
      })
    );
  });

  it("granted delegator address has 2 voting rights and granted delegated address has waved voting rights", async function () {
    const instance = await Ballot.deployed();

    await instance.giveRightToVote([bob]);
    await instance.delegate(bob, {
      from: alice,
    });

    const delegated = await instance.voters(alice);
    assert.equal(delegated.voted, true);

    const delegator = await instance.voters(bob);
    assert.equal(delegator.weight, 2);
  });

  //TODO: Voting tests, Proposal tests
});
