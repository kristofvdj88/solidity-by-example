var OpenAuction = artifacts.require("./OpenAuction.sol");

module.exports = function (deployer) {
  deployer.deploy(
    OpenAuction,
    1000,
    "0xc370892745D17347bf0ee88aDB84C939bB78d9DA"
  ); // TODO: fill in constructor args
  // See https://web3-type-converter.onbrn.com/ for string to byte32 conversion
};
