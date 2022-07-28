require('dotenv').config()
const logger = require('./common/logger')
const puppeteer = require('puppeteer')
const Web3 = require('web3')
const web3 = new Web3(`https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`)

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
      page.waitForNavigation(),
      page.click('#gatsby-focus-wrapper > div > div.css-zkbqul > div.css-r17iry > div > div.css-1c73mnp > form > button')
    ])
    await page.type('#root > div.alchemy-app > div.alchemy-app-content-container > div:nth-child(2) > div.row > div > span > div:nth-child(1) > div.col-md-9.col-sm-12 > input', fundedAddress)
    const element = await page.waitForSelector('#root > div.alchemy-app > div.alchemy-app-content-container > div:nth-child(2) > div.row > div > span > div:nth-child(1) > div.col-md-3.col-sm-12 > button')
    await element.evaluate(sendMatic => sendMatic.click())
    browser.close()
  } catch (err) {
    return err
  }
}

function delay (ms) {
  info(`DELAY ${ms} millisecs`)
  return new Promise(resolve => setTimeout(resolve, ms))
}

function retryGetBalance (fundedAddress, retriesLeft = 10) {
  return web3.eth.getBalance(fundedAddress)
    .then((balance) => {
      if (web3.utils.fromWei(String(balance)) > 5) {
        return web3.utils.fromWei(String(balance))
      } else {
        throw new Error('Balance is not updated')
      }
    })
    .catch((error) => {
      if (retriesLeft === 1) {
        info('MAXIMUM RETRIES EXCEEDED')
        return Promise.reject(error)
      }

      info(`RETRYING GET BALANCE FOR ${fundedAddress}`)
      return delay(10000).then(() => { return retryGetBalance(fundedAddress, retriesLeft - 1) })
    })
}

async function distributeMatic () {
  const receipts = []
  const gasPrice = await web3.eth.getGasPrice()
  return retryGetBalance(fundedAddress)
    .then(async (balance) => {
      for (const address of addresses) {
        const transaction = {
          from: fundedAddress,
          to: web3.utils.toChecksumAddress(address),
          data: '0x',
          value: web3.utils.toWei('1'),
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
    })
    .catch((err) => {
      return err
    })
}

async function main () {
  try {
    await getMatic()
    const receipts = await distributeMatic()
    Array.isArray(receipts) ? info(receipts) : info('NO FUNDING TOOK PLACE')
  } catch (err) {
    error('MATIC FUNDER', err)
  }
}

main()
