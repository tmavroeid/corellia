require('dotenv').config()
const logger = require('./common/logger')
const puppeteer = require('puppeteer')
const Web3 = require('web3')
const ethers = require('ethers')
const web3 = new Web3(`https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`)
const addresses = process.env.ADDRESSES.split(',').map(item => item.trim())
const fundedAddress = web3.utils.toChecksumAddress(process.env.FUNDED_ADDRESS)
const fundedAddressPrivateKey = process.env.FUNDED_ADDRESS_PRIVATE_KEY
const email = process.env.ALCHEMY_EMAIL
const pass = process.env.ALCHEMY_PASSWORD
const info = (msg) => logger.log('info', `${msg}`)
const error = (message, stacktrace = undefined) => logger.log('error', `${message}`, stacktrace)

const scrape = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false })
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
        return true
      }
    }, '1000')
  } catch (err) {
    return err
  }
}

const distributeTestnetMatic = async () => {
  const receipts = []
  for (const address of addresses) {
    const transaction = {
      from: fundedAddress,
      to: web3.utils.toChecksumAddress(address),
      data: '0x',
      value: ethers.utils.parseEther('1'),
      gasLimit: ethers.utils.hexlify(21000),
      gasPrice: ethers.utils.hexlify(parseInt(await web3.eth.getGasPrice()))
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
    await scrape()
    const receipts = await distributeTestnetMatic()
    info(receipts)
  } catch (err) {
    error('MATIC FUNDER', err)
    console.log('skata')
    console.log(err)
  }
}

main()
