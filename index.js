#! /usr/bin/env node
const { program } = require('commander')
const conf = new (require('conf'))()
const { setup, funding, distribute } = require('./funder.js')
const chalk = require('chalk')
const log = console.log

program
  .command('set-credentials')
  .requiredOption('-email, --email <value>', 'The email for the Alchemy account.')
  .requiredOption('-pass, --pass <value>', 'The pass for the Alchemy account.')
  .option('-apikey, --apikey <value>', 'The API key for the Alchemy account.')
  .description('Setup user credentials for Alchemy: api-key (optional), email, password and address.')
  .action(setup)

program
  .command('get-credentials')
  .description('Get user credentials for Alchemy.')
  .action(() => {
    const userCreds = conf.get('user-creds')
    if (userCreds.api) {
      log(
        chalk.yellow.bold(`User credentials are: ${userCreds.email}, ${userCreds.pass} and ${userCreds.api}`)
      )
    } else {
      log(
        chalk.yellow.bold(`User credentials are: ${userCreds.email} and ${userCreds.pass}`)
      )
    }
  })

program
  .command('funding')
  .requiredOption('-address, --address <value>', 'The address to be funded.')
  .description('Fund address with testnet MATIC.')
  .action(funding)

program
  .command('distribute')
  .requiredOption('-amount, --amount <value>', 'The address to be funded.')
  .requiredOption('-address, --address <value>', 'The address to be funded.')
  .requiredOption('-privatekey, --privatekey <value>', 'The address to be funded.')
  .requiredOption('-addresses, --addresses <value>', 'The address to be funded.')
  .description('Distribute testnet MATIC equally between some addresses.')
  .action(distribute)

program.parse()
