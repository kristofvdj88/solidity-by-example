# Solidity by Example 1 - Voting

Following the Solidity Example tutorials found in the [Official Solidity Documentation](https://docs.soliditylang.org/en/v0.8.17/solidity-by-example.html), we have our first example of a [Voting contract](https://docs.soliditylang.org/en/v0.8.17/solidity-by-example.html#voting). Take a look at the documentation, where you'll find the basic (unimproved) version of the contract.

> Possible Improvements:
> Currently, many transactions are needed to assign the rights to vote to all participants. Moreover, if two or more proposals have the same number of votes, winningProposal() is not able to register a tie. Can you think of a way to fix these issues?

### Prerequisites:

- IDE
- [NPM](https://www.npmjs.com/)
- [Truffle](https://trufflesuite.com/truffle/)
- [Ganache](https://trufflesuite.com/ganache/)

In this repository you'll find my solution to the improvements that were proposed. In addition to that you'll also find a client with some basic UI to perform the various contract transactions and display its states and finally you'll also find some unit tests.
