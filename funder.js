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
      page.waitForNavigation(),
      page.click('#gatsby-focus-wrapper > div > div.css-zkbqul > div.css-r17iry > div > div.css-1c73mnp > form > button')
    ])
    await page.type('#root > div.alchemy-app > div.alchemy-app-content-container > div:nth-child(2) > div.row > div > span > div:nth-child(1) > div.col-md-9.col-sm-12 > input', fundedAddress)
    const element = await page.waitForSelector('#root > div.alchemy-app > div.alchemy-app-content-container > div:nth-child(2) > div.row > div > span > div:nth-child(1) > div.col-md-3.col-sm-12 > button')
    await element.evaluate(sendMatic => sendMatic.click())
    setTimeout(async () => {
      if (await page.$('#root > div.alchemy-app > div.alchemy-app-content-container > div.alchemy-faucet-title-component.container > div.faucet-banner-container.show > div') !== null) {
        throw new Error('Too soon for funding.')
      } else {
        info(`Funding of ${fundedAddress} completed successfully`)
        await page.waitForSelector('#root > div.basket > div > div > h3')
        return distributeMatic()
      }
    }, '3000')
  } catch (err) {
    return err
  }
}

async function distributeMatic () {
  const receipts = []
  const gasPrice = await web3.eth.getGasPrice()
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
}

async function main () {
  try {
    const receipts = await getMatic()
    Array.isArray(receipts) ? info(receipts) : info('NO FUNDING TOOK PLACE')
  } catch (err) {
    error('MATIC FUNDER', err)
  }
}

main()
