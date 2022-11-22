# corellia

[![Github license](https://img.shields.io/github/license/tmavroeid/corellia)](https://img.shields.io/github/license/tmavroeid/corellia)
[![GitHub Release](https://img.shields.io/github/release/tmavroeid/corellia.svg?style=flat)](https://github.com/tmavroeid/corellia/releases)

A CLI tool to perform the following operations with testnet Matic:
- fund an address with testnet Matic,
- get balance of testnet Matic,
- distribute an amount of testnet Matic equally to a number of addresses
- send testnet Matic to an address.


##### Table of Contents 
* [Installation](#installation)
* [Introduction](#introduction)
* [Prerequisites](#prerequisites)  
* [Install Tool](#install_tool)
* [Usage](#usage)
* [License](#license)



## <a name="installation">Installation</a>

Install the package with npm:

```bash
npm install
```

## <a name="introduction">Introduction</a>
This project scrapes the mumbai faucet of Alchemy in order to get 2 testnet Matic.


## <a name="prerequisites">Prerequisites</a>

Please make sure to setup the tool with an Alchemy email and password. For this purpose, an account should be created in [Alchemy](https://www.alchemy.com) in order to use it in the faucet and get 2 Matic/day instead of 1 Matic/day. The funding from the faucet can take place once every 24 hours.


## Install Tool

To install the corellia CLI localy: 
```
npm install corellia
```
## Usage

```
corellia [options] [command]

Options:
  -h, --help                 display help for command

Commands:
  set-credentials [options]  Setup user credentials for Alchemy: api-key (optional), email, password and address.
  get-credentials            Get user credentials for Alchemy.
  get-balance [options]      Get testnet Matic balance for address.
  funding [options]          Fund address with testnet Matic.
  distribute [options]       Distribute testnet MATIC equally between some addresses.
  help [command]             display help for command
```

Get Balance:

`corellia get-balance -address 0x1385C6709022a02434333ECCe688b9390ee71306`

Distribute:

In order to distribute an amount of testnet Matic equally between a number of addresses:

`corellia distribute -amount 10 -address 0x54324eda3Fbe99F09872Cd75E59481De714EA222 -privatekey 02bbf09b20e49406d99f4d3507fae0e6fb4fbdb0d2d120g2b000a7a46q1a6419 -addresses 0x80a0A464cF065af842afBc2243a3899d98E4332a,0xd80A1209E123444bDf3D7EeDfb4da822F12B4dD6`

Funding:

In order to fund an address with testnet Matic:

`corellia funding -address 0x1385C6709022a02434333ECCe688b9390ee71306`


## <a name="license">License</a>

This library is released under MIT.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/tmavroeid)