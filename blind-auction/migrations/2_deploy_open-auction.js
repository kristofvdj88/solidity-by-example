var OpenAuction = artifacts.require("./OpenAuction.sol");

module.exports = function (deployer) {
  deployer.deploy(OpenAuction, 300, "0xe099206c6a40F43fCf6C9b7870671Fc6581c7ceB");
};
