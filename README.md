# Mobius Governance
This governance platform is a fork of Compound Finance's Governor Bravo contracts. To adapt for veMOBI, we call the balanceOfAt() function rather than getPriorVotes(). The initiation has also been removed because this is the first instance of governance for Mobius whereas Governor Bravo was the second governing platform for Compound.

TODO: update the admin of the proxy to itself

## How to use
rename `.env.example` to .env and enter your own seed phrase
`yarn` to install all the dependencies
`yarn hardhat compile --network celo` to compile the contracts
`yarn hardhat deploy --network celo` to deploy the governance
`yarn hardhat run scripts/submitProposal.ts --network celo` to submit a proposal
