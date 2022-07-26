# matic-funder
Matic funding script from Alchemy faucet.

##### Table of Contents  
- [Introduction](#introduction)
- [Prerequisites](#prerequisites)  
- [Usage](#usage)

## Introduction
This project contains a script which by scraping the mumbai faucet of Alchemy gets 5 Matic and then distributes 1 Matic to the 4 addresses used in staging and production and keeps 1 Matic in the FUNDED_ADDRESS for future use.


## Prerequisites

Please make sure:
1) Install the project's dependencies with the following command:

```
npm install
```

2) To initialize a **.env** file following the environmental variables in **.env.template**. 

- An account should be created in [Alchemy](https://www.alchemy.com) in order to use it in the faucet and get 5 Matic/day instead of 1 Matic/day. The funding from the faucet can take place once every 24 hours.
- An account should be created in Infura in order to get an API Key and use a node for the purpose of interacting with the Polygon PoS.


## Usage

To initiate the daily funding: 
```
npm run funding
```