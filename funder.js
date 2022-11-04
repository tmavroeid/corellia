#! /usr/bin/env node
const { program } = require('commander')
require('dotenv').config()
const logger = require('./common/logger')
const puppeteer = require('puppeteer')
const Web3 = require('web3')
const web3 = process.env.ALCHEMY_API_KEY ? 
             new Web3(`https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`) :
             new Web3('https://rpc-mumbai.matic.today')

const addresses = process.env.ADDRESSES.split(',').map(item => item.trim())
const fundedAddress = web3.utils.toChecksumAddress(process.env.FUNDED_ADDRESS)
const fundedAddressPrivateKey = process.env.FUNDED_ADDRESS_PRIVATE_KEY
const email = process.env.ALCHEMY_EMAIL
const pass = process.env.ALCHEMY_PASSWORD

const info = (msg) => logger.log('info', `${msg}`)
const error = (message, stacktrace = undefined) => logger.log('error', `${message}`, stacktrace)

async function getMatic () {
  try {
    const browser = await puppeteer.launch({
      headless: false,
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
      page.waitForNavigation(),
      ]);
    await page.type('#root > div.alchemy-app > div.alchemy-app-content-container > div:nth-child(2) > div.row > div > span > div:nth-child(1) > div.col-md-9.col-sm-12 > input', fundedAddress)
    const element = await page.waitForSelector('#root > div.alchemy-app > div.alchemy-app-content-container > div:nth-child(2) > div.row > div > span > div:nth-child(1) > div.col-md-3.col-sm-12 > button')
    await element.evaluate(sendMatic => sendMatic.click())
    const success = await page.type('#root > div.basket > div > div > h3')
    const failure = await page.type('#root > div.alchemy-app > div.alchemy-app-content-container > div.alchemy-faucet-title-component.container > div.faucet-banner-container.show > div')
    browser.close()
    if (failure){
      throw new Error('No Funding Took Place')
    }else{
      return true
    }
  } catch (err) {
    return err
  }
}

function delay (ms) {
  info(`DELAY ${ms} millisecs`)
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getBalance (fundedAddress) {
  return web3.eth.getBalance(fundedAddress)
    .then((balance) => {
      return web3.utils.fromWei(String(balance))
    })
    .catch((error) => {
      return error
    })
}

function retryGetBalance (fundedAddress, balanceBefore, retriesLeft = 10) {
  return web3.eth.getBalance(fundedAddress)
    .then((balance) => {
      if (retriesLeft === 1) {
        info('MAXIMUM RETRIES EXCEEDED')
        return new Error(`MAXIMUM RETRIES EXCEEDED FOR GET BALANCE FOR ${fundedAddress}`)
      }
      else if(balanceBefore>=web3.utils.fromWei(String(balance))){
        info(`RETRYING GET BALANCE FOR ${fundedAddress}`)
        return delay(10000).then(() => { return retryGetBalance(fundedAddress, balanceBefore, retriesLeft - 1) })
      }else{
        return web3.utils.fromWei(String(balance))
      }
    })
    .catch((error) => {
      if (retriesLeft === 1) {
        info('MAXIMUM RETRIES EXCEEDED')
        return Promise.reject(error)
      }
      info(`RETRYING GET BALANCE FOR ${fundedAddress}`)
      return delay(10000).then(() => { return retryGetBalance(fundedAddress, balanceBefore, retriesLeft - 1) })
    })
}


async function distributeMatic (fundedAmount = 2) {
  const receipts = []
  const gasPrice = await web3.eth.getGasPrice()
  const valueToDistribute = fundedAmount/adresses.length
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
}

async function main () {
  try {
    let balanceBefore = await getBalance(fundedAddress)
    info(`BALANCE BEFORE IS ${balanceBefore}`)
    await getMatic()
    let balanceAfter = await retryGetBalance(fundedAddress, balanceBefore)
    info(`BALANCE AFTER IS ${balanceAfter}`)
    let receipts = []
    let fundedAmount = balanceAfter-balanceBefore
    if ( fundedAmount === 2) {
      receipts = await distributeMatic(balanceAfter)
    } else {
      throw new Error('Balance is not updated')
    }
    receipts = await distributeMatic(fundedAmount)
    Array.isArray(receipts) ? info(receipts) : info('NO FUNDING TOOK PLACE')
  } catch (err) {
    error('MATIC FUNDER', err)
  }
}

main()
