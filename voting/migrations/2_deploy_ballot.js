var Ballot = artifacts.require("./Ballot.sol");

module.exports = function (deployer) {
  deployer.deploy(Ballot, [
    "0x50726f706f73616c310000000000000000000000000000000000000000000000",
    "0x50726f706f73616c320000000000000000000000000000000000000000000000",
  ]);
  // See https://web3-type-converter.onbrn.com/ for string to byte32 conversion
};
