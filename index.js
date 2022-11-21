#! /usr/bin/env node
const { program } = require('commander')
const { setupCredentials, getCredentials, getBalanceFromCLI, funding, distribute } = require('./funder.js')
const conf = new (require('conf'))()

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
  .description('Get testnet Matic balance for address.')
  .action(getBalanceFromCLI)

program
  .command('funding')
  .requiredOption('-address, --address <value>', 'The address to be funded.')
  .description('Fund address with testnet Matic.')
  .action(funding)

program
  .command('distribute')
  .requiredOption('-amount, --amount <value>', 'The amount to be distributed.')
  .requiredOption('-address, --address <value>', 'The address to distribute the testnet Matic.')
  .requiredOption('-privatekey, --privatekey <value>', 'The private key of the address distributing the testnet Matic.')
  .requiredOption('-addresses, --addresses <value or values>', 'The addresses to receive the testnet Matic (separated with commas).')
  .description('Distribute testnet MATIC equally between some addresses.')
  .action(distribute)

program.parse()
