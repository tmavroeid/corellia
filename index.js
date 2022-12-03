#! /usr/bin/env node
const { program } = require('commander')
const { setupCredentials, getCredentials, getBalanceFromCLI, funding, distribute } = require(__dirname+'/funder.js')

program
  .command('set-credentials')
  .requiredOption('-email, --email <value>', 'The email for the Alchemy account.')
  .requiredOption('-pass, --pass <value>', 'The pass for the Alchemy account.')
  .option('-apikey, --apikey <value>', 'The API key for the Alchemy account.')
  .description('Setup user credentials for Alchemy: api-key (optional), email, password and address.')
  .action(setupCredentials)

program
  .command('get-credentials')
  .description('Get user credentials for Alchemy.')
  .action(getCredentials)

program
  .command('get-balance')
  .requiredOption('-address, --address <value>', 'The address to get balance for.')
  .requiredOption('-network, --network <value>', 'The network to use. [mumbai, goerli]')
  .description('Get testnet tokens balance for address.')
  .action(getBalanceFromCLI)

program
  .command('funding')
  .requiredOption('-address, --address <value>', 'The address to be funded.')
  .requiredOption('-network, --network <value>', 'The network to use. [mumbai, goerli]')
  .description('Fund address with testnet tokens.')
  .action(funding)

program
  .command('distribute')
  .requiredOption('-amount, --amount <value>', 'The amount to be distributed.')
  .requiredOption('-address, --address <value>', 'The address to distribute the testnet tokens.')
  .requiredOption('-privatekey, --privatekey <value>', 'The private key of the address distributing the testnet tokens.')
  .requiredOption('-addresses, --addresses <value or values>', 'The addresses to receive the testnet tokens (separated with commas).')
  .requiredOption('-network, --network <value>', 'The network to use. [mumbai, goerli]')
  .description('Distribute testnet tokens equally between some addresses.')
  .action(distribute)

program.parse()
