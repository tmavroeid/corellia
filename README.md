# funmb
A CLI tool for funding an address with Matic Testnet Tokens using the Alchemy faucet.
![release passing](https://github.com/tmavroeid/funmb/actions/workflows/release.yml/badge.svg)
![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/tmavroeid/funmb)


##### Table of Contents 
* [Installation](#installation)
* [Build](#build)
* [Introduction](#introduction)
* [Prerequisites](#prerequisites)  
* [Usage](#usage)

## <a name="installation">Installation</a>

Install the package with yarn or npm:

```bash
yarn install
npm install
```

## <a name="build">Build</a>

Build the package with yarn or npm:

```bash
yarn build
npm build
```

## <a name="introduction">Introduction</a>
This project contains a script which by scraping the mumbai faucet of Alchemy gets 5 Matic and then distributes 1 Matic to the 4 addresses used in staging and production and keeps 1 Matic in the FUNDED_ADDRESS for future use.


## <a name="prerequisites">Prerequisites</a>

Please make sure to initialize an **.env** file following the environmental variables in **.env.template**. 

- An account should be created in [Alchemy](https://www.alchemy.com) in order to use it in the faucet and get 5 Matic/day instead of 1 Matic/day. The funding from the faucet can take place once every 24 hours.


## Usage

To initiate the daily funding: 
```
npm run funding
```

## <a name="license">License</a>

This library is released under MIT.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/tmavroeid)