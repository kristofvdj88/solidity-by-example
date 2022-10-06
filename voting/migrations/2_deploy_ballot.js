var Ballot = artifacts.require("./Ballot.sol");

module.exports = function (deployer) {
  deployer.deploy(Ballot, [
    "0xe1a70031c2ccacd935ea5e97b32f2e387d03f054cad7d1b044a5a07c735c358d",
    "0xe1a70045c2ccacd935ea5e97b32f2e387d03f054cad7d1b044a5a07c735c358d",
  ]);
};
