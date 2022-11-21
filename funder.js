#! /usr/bin/env node
const conf = new (require('conf'))()
const chalk = require('chalk')
require('dotenv').config()
const puppeteer = require('puppeteer')
const Web3 = require('web3')
const log = console.log
const info = (msg) => log(chalk.green.bold(`${msg}`))
const working = (msg) => log(chalk.yellow.bold(`${msg}`))
const error = (message) => log(chalk.red.bold(`${message}`))

const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
}

async function props (obj) {
  const result = {}
  for await (const [key, value] of Object.entries(obj)) {
    result[key] = await value
  }
  return result
}

function setupCredentials ({ email, pass, apikey }) {
  let userCreds = conf.get('user-creds')
  if (!userCreds) {
    userCreds = {}
  }
  if (validateEmail(email)) {
    userCreds.email = email
  } else {
    error('Email is not valid!')
    return false
  }
  userCreds.pass = pass
  if (typeof apikey !== 'undefined') {
    userCreds.apikey = apikey
  }
  conf.set('user-creds', userCreds)
  log(
    chalk.green.bold('User credentials are stored!')
  )
}

function getCredentials () {
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
}

async function getMatic (email, pass, fundedAddress) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox'
      ]
    })
    const page = await browser.newPage()

    await page.goto('https://auth.alchemyapi.io/?redirectUrl=https%3A%2F%2Fmumbaifaucet.com')
    await page.type('#gatsby-focus-wrapper > div > div.css-zkbqul > div.css-r17iry > div > div.css-1c73mnp > form > label.css-1ca7lze > input', email)
    await page.type('#gatsby-focus-wrapper > div > div.css-zkbqul > div.css-r17iry > div > div.css-1c73mnp > form > label.css-2wrca4 > input', pass)
    await Promise.all([
      page.click('#gatsby-focus-wrapper > div > div.css-zkbqul > div.css-r17iry > div > div.css-1c73mnp > form > button'),
      page.waitForNavigation()
    ])
    await page.type('#root > div.alchemy-app > div.alchemy-app-content-container > div:nth-child(2) > div.row > div > span > div:nth-child(1) > div.col-md-9.col-sm-12 > input', fundedAddress)
    const element = await page.waitForSelector('#root > div.alchemy-app > div.alchemy-app-content-container > div:nth-child(2) > div.row > div > span > div:nth-child(1) > div.col-md-3.col-sm-12 > button')
    await element.evaluate(sendMatic => sendMatic.click())
    const success = await page.type('#root > div.basket > div > div > h3')
    const failure = await page.type('#root > div.alchemy-app > div.alchemy-app-content-container > div.alchemy-faucet-title-component.container > div.faucet-banner-container.show > div')
    browser.close()
    if (failure) {
      error('No Funding Took Place')
      throw new Error('No Funding Took Place')
    } else {
      browser.close()
      return true
    }
  } catch (err) {
    return err
  }
}

function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getBalance (fundedAddress, apikey) {
  const web3 = typeof apikey === 'undefined'
    ? new Web3('https://rpc-mumbai.matic.today')
    : new Web3(`https://polygon-mumbai.g.alchemy.com/v2/${apikey}`)
  return web3.eth.getBalance(fundedAddress)
    .then((balance) => {
      return web3.utils.fromWei(String(balance))
    })
    .catch((error) => {
      return error
    })
}

function retryGetBalance (fundedAddress, balanceBefore, apikey, retriesLeft) {
  const web3 = typeof apikey === 'undefined'
    ? new Web3('https://rpc-mumbai.matic.today')
    : new Web3(`https://polygon-mumbai.g.alchemy.com/v2/${apikey}`)
  return web3.eth.getBalance(fundedAddress)
    .then((balance) => {
      if (retriesLeft === 1) {
        return Promise.reject('MAXIMUM RETRIES EXCEEDED')
      } else if (balanceBefore >= web3.utils.fromWei(String(balance))) {
        working(`BALANCE IS NOT UPDATED YET. ${retriesLeft} RETRIES LEFT TO GET UPDATED BALANCE FOR ${fundedAddress}`)
        return delay(10000).then(() => {
          return retryGetBalance(fundedAddress, balanceBefore, apikey, retriesLeft - 1)
        })
      } else {
        return web3.utils.fromWei(String(balance))
      }
    })
}

async function distributeMatic (fundedAddress, fundedAddressPrivateKey, fundedAmount, addresses, apikey) {
  try {
    const web3 = typeof apikey === 'undefined'
      ? new Web3('https://rpc-mumbai.matic.today')
      : new Web3(`https://polygon-mumbai.g.alchemy.com/v2/${apikey}`)
    const valueToDistribute = fundedAmount / addresses.length
    addresses = addresses.split(',').map(item => item.trim())
    const receipts = []
    const gasPrice = await web3.eth.getGasPrice()
    for (const address of addresses) {
      const transaction = {
        from: fundedAddress,
        to: web3.utils.toChecksumAddress(address),
        data: '0x',
        value: web3.utils.toWei(String(valueToDistribute)),
        gasLimit: web3.utils.toHex('21000'),
        gasPrice: web3.utils.toHex((gasPrice))
      }
      const signedTx = await web3.eth.accounts.signTransaction(
        transaction,
        fundedAddressPrivateKey
      )
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
      receipts.push(receipt.transactionHash)
    }
    return receipts
  } catch (err) {
    return err
  }
}

async function funding ({ address }) {
  const userCreds = conf.get('user-creds')
  return getBalance(address, userCreds.apikey)
    .then((balanceBefore) => {
      info(`BALANCE BEFORE FUNDING IS ${balanceBefore}`)
      return props({ retrieveMatic: getMatic(userCreds.email, userCreds.pass, address), balanceBefore })
    })
    .then(({ retrieveMatic, balanceBefore }) => {
      return props({ balanceAfter: retryGetBalance(address, balanceBefore, userCreds.apikey, 5), balanceBefore })
    })
    .then(({ balanceAfter, balanceBefore }) => {
      info(`BALANCE AFTER FUNDING IS ${balanceAfter}`)
      const fundedAmount = balanceAfter - balanceBefore
      if (fundedAmount > 0) {
        info('Balance is updated.')
      } else {
        throw new Error('Balance is not updated')
      }
      return true
    })
    .catch((err) => {
      error(`FUNDING FAILED: ${err}`)
      log(chalk.magenta.bold('ALCHEMY MUMBAI FAUCET CAN ONLY BE USED ONCE DAILY.'))
      process.exit()
    })
}

async function getBalanceFromCLI ({ address }) {
  const userCreds = conf.get('user-creds')
  return getBalance(address, userCreds.apikey)
    .then((balance) => {
      info(`BALANCE IS ${balance} testnet Matic`)
    })
    .catch((err) => {
      error(`GET BALANCE FAILED: ${err}`)
      process.exit()
    })
}

async function distribute ({ amount, address, privatekey, addresses }) {
  const userCreds = conf.get('user-creds')
  distributeMatic(address, privatekey, amount, addresses, userCreds.apikey)
    .then((receipts) => {
      Array.isArray(receipts) ? info(`Transaction hashes for distribution: ${receipts}`) : info('NO TRANSFER OF TESTNET MATIC TOOK PLACE')
      return true
    })
    .catch((err) => {
      error(`DISTRIBUTE FAILED: ${err}`)
      process.exit()
    })
}

module.exports = {
  setupCredentials,
  getCredentials,
  getBalanceFromCLI,
  funding,
  distribute
}
