# Mobius Governance
This governance platform is a fork of Compound Finance's Governor Bravo contracts. This comprises of all the smart contracts that make up the DAO, plus several script for submitting, and moving proposals through the steps until execution. 

## Alterations 
To adapt for veMOBI, we call the balanceOfAt() function rather than getPriorVotes(). The initiation has also been removed because this is the first instance of governance for Mobius whereas Governor Bravo was the second governing platform for Compound. Some slight alteration have been made to the initialization as a result of this being our first governance instance and Governor Bravo being Compound's second.

## How governance work
Mobius governance works by allowing veMOBI token holders to submit and vote on proposals, which can alter smart contracts that are under the control of the Mobius governance contract. The basic building block of this governance platform is proposals. Proposals can be submitted by anyone who has at least the minimum threshold of votes. After a delay period, the proposal can be voted on by all the veMOBI holders. The voting power for a proposal is proportional to the amount of veMOBI at the time the proposal was submitted. veMOBI holders can vote on the proposal at any point during the voting period. After the voting period, if the proposal has more `for` votes than the quorum and more `for` votes than `against` votes, the proposal can be queued in the timelock by anyone. After the timelock period has expired, anyone can tell the timelock to execute the transaction.

## How to use

### Initial setup
1. Run the command `yarn` to install all dependencies.
2. Rename `.env.example` to `.env` and enter your own seed phrase.
3. In the file `hardhat.config.ts`, specify which accounts to use by changing the value for deployer.

### Deploying the contracts
All the deployments are done in the `deploy/001_init.ts` file.
1. Run the command `yarn hardhat deploy --network celo` to compile and deploy the governance contracts.

### Submitting a proposal
Proposals can be submitted directly using the script `scripts/submitProposal.ts`. Submitters must meet the proposal threshold of votes in order to submit a proposal. Proposals need to be carefully constructed to ensure they do what is intended and don't revert. There are five things that need to be filled out as part of a proposal (description, value, signature, data, target). The file currently contains an example proposal. 
1. Run the command `yarn hardhat run scripts/submitProposal.ts --network celo`


### Forwarding a proposal
Once a proposal has passed, it must be forwarded through the timelock before it is executed. The two steps are queing the proposal and executing the proposal. You must s
1. Specify the proposal number by changing the first argument to either the `governance.queue()` function or the `governance.execute()`, which specifies the proposal id. This should match what is shown on the interface.
1. Run the command `yarn hardhat run scripts/queueProposal.ts --network celo` to move the proposal into the timelock after the proposal has passed.
2. Run the command `yarn hardhat run scripts/executeProposal.ts --network celo` to execute the proposal from the timelock after it has stayed there for the required amount of time.
