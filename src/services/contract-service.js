import ListingsRegistryContract from "../contracts/ListingsRegistry.json"
import ListingContract from "../contracts/Listing.json"
import PurchaseRegistryContract from "../contracts/PurchaseRegistry.json"
import PurchaseContract from "../contracts/Purchase.json"
import UserRegistryContract from "../contracts/UserRegistry.json"
import HDWalletProvider from 'truffle-hdwallet-provider';
import bs58 from "bs58"
import Web3 from "web3"

var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
window.currentProvider = new HDWalletProvider(mnemonic, "http://localhost:8545");

class ContractService {
  constructor() {
    this.web3 = new Web3(window.currentProvider);

    const contracts = {
      listingsRegistryContract: ListingsRegistryContract,
      listingContract: ListingContract,
      purchaseRegistryContract: PurchaseRegistryContract,
      purchaseContract: PurchaseContract,
      userRegistryContract: UserRegistryContract,
    }

    for (let name in contracts) {
      this[name] = contracts[name]
    }
  }

  getBytes32FromIpfsHash(ipfsListing) {
    return (
      "0x" +
      bs58
        .decode(ipfsListing)
        .slice(2)
        .toString("hex")
    )
  }

  getIpfsHashFromBytes32(bytes32Hex) {
    const hashHex = "1220" + bytes32Hex.slice(2)
    const hashBytes = Buffer.from(hashHex, "hex")
    const hashStr = bs58.encode(hashBytes)
    return hashStr
  }

  async currentAccount() {
    const accounts = await this.web3.eth.getAccounts()
    return accounts[0]
  }

  async currentAccountBalance() {
    const address = await this.currentAccount();
    const balance = await this.web3.eth.getBalance(address);
    return balance / 1e18;
  }

  getBlock(blockHash) {
    return new Promise((resolve, reject) => {
      this.web3.eth.getBlock(blockHash, (error, data) => {
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      })
    })
  }

  getTransaction(transactionHash) {
    return new Promise((resolve, reject) => {
      this.web3.eth.getTransaction(transactionHash, (error, data) => {
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      })
    })
  }

  async submitListing(ipfsListing, ethPrice, units) {
    try {
      const net = await this.web3.eth.net.getId()
      const account = await this.currentAccount()
      const instance = await this.deployed(ListingsRegistryContract)
      console.log('instance', instance);
      const weiToGive = this.web3.utils.toWei(String(ethPrice), "ether")
      return instance.methods
        .create(ipfsListing, weiToGive, units)
        .send({ from: account, gas: 4476768 })
    } catch (error) {
      console.error("Error submitting to the Ethereum blockchain: " + error)
      throw error
    }
  }

  async deployed(contract, addrs) {
    const net = await this.web3.eth.net.getId()
    let storedAddress = contract.networks[net] && contract.networks[net].address
    addrs = addrs || storedAddress || null

    console.log("addrs", addrs);
    return new this.web3.eth.Contract(contract.abi, addrs)
  }

  async getBytecode(contract) {
    let net = await this.web3.eth.net.getId()
    let bytecode = contract.bytecode
    let withLibraryAddresses = bytecode.replace(/__[^_]+_+/g, (matchedStr) => {
      let libraryName = matchedStr.replace(/_/g, '')
      let library = this.libraries[libraryName]
      let libraryAddress = library.networks[net] && library.networks[net].address
      let withoutPrefix = libraryAddress.slice(2)
      return withoutPrefix
    })
    return withLibraryAddresses
  }

  async deploy(contract, args, options) {
    let bytecode = await this.getBytecode(contract)
    let deployed = await this.deployed(contract)
    let txReceipt = await new Promise((resolve, reject) => {
      deployed
        .deploy({
          data: bytecode,
          arguments: args
        })
        .send(options)
        .on("receipt", receipt => {
          resolve(receipt)
        })
        .on("error", err => reject(err))
    })
    return txReceipt
  }

  async getAllListingIds() {
    const range = (start, count) =>
      Array.apply(0, Array(count)).map((element, index) => index + start)

    let instance
    try {
      instance = await this.deployed(ListingsRegistryContract)
    } catch (error) {
      console.log(`Contract not deployed`)
      throw error
    }

    console.log('instance', instance);

    let listingsLength
    try {
      listingsLength = await instance.methods.listingsLength().call()
    } catch (error) {
      console.log(error)
      console.log(`Can't get number of listings.`)
      throw error
    }

    return range(0, Number(listingsLength))
  }

  async getListingByAddess(address) {
    let instance
    try {
      instance = await this.deployed(ListingsRegistryContract)
    } catch (error) {
      console.log(`Contract not deployed`)
      throw error
    }

    let result
    try {
      console.log('address', address);
      result = await instance.methods.getListingByAddress(address).call()
      console.log('result', result);
      
    } catch (error) {
      throw error
    }

    return {
        address: result[0],
        lister: result[1],
        ipfsHash: result[2],
        price: this.web3.utils.fromWei(result[3], "ether"),
        unitsAvailable: result[4]
    }
  }

  async getAllMyListingIds() {
    const range = (start, count) =>
      Array.apply(0, Array(count)).map((element, index) => index + start)

    let instance
    try {
      instance = await this.deployed(PurchaseRegistryContract)
    } catch (error) {
      console.log(`Contract not deployed`)
      throw error
    }
    
    let address = await this.currentAccount();
    let listingsLength
    try {
      listingsLength = await instance.methods.getPurchaseLength(address).call();
    } catch (error) {
      console.log(error)
      console.log(`Can't get number of listings.`)
      throw error
    }
    return range(0, Number(listingsLength))
  }

  async getAllMyListing(id) {
    let instance
    try {
      instance = await this.deployed(PurchaseRegistryContract)
    } catch (error) {
      console.log(`Contract not deployed`)
      throw error
    }
    
    let address = await this.currentAccount();
    let listingsLength
    try {
      listingsLength = await instance.methods.getPurchase(address, id).call();
    } catch (error) {
      console.log(error)
      console.log(`Can't get number of listings.`)
      throw error
    }
    return listingsLength
  }

  async getListing(listingId) {
    const instance = await this.deployed(ListingsRegistryContract)

    let listing
    try {
      listing = await instance.methods.getListing(listingId).call()
    } catch (error) {
      throw new Error(`Error fetching listingId: ${listingId}`)
    }

    const listingObject = {
      index: listingId,
      address: listing[0],
      lister: listing[1],
      ipfsHash: listing[2],
      price: this.web3.utils.fromWei(listing[3], "ether"),
      unitsAvailable: listing[4]
    }
    return listingObject
  }

  async waitTransactionFinished(
    transactionHash,
    pollIntervalMilliseconds = 1000
  ) {
    console.log("Waiting for transaction")
    console.log(transactionHash)
    const blockNumber = await new Promise((resolve, reject) => {
      if (!transactionHash) {
        reject(`Invalid transactionHash passed: ${transactionHash}`)
        return
      }
      var txCheckTimer
      let txCheckTimerCallback = () => {
        this.web3.eth.getTransaction(transactionHash, (error, transaction) => {
          if (transaction.blockNumber != null) {
            console.log(`Transaction mined at block ${transaction.blockNumber}`)

            clearInterval(txCheckTimer)
            setTimeout(() => resolve(transaction.blockNumber), 2000)
          }
        })
      }

      txCheckTimer = setInterval(txCheckTimerCallback, pollIntervalMilliseconds)
    })
    return blockNumber
  }

  async contractFn(contractDefinition, address, functionName, args = [], options = {}) {
    const opts = Object.assign(options, {}) 
    opts.from = opts.from || (await this.currentAccount())
    console.log('opts.from', opts.from)
    opts.gas = options.gas || 4712388
    const contract = await this.deployed(contractDefinition)
    contract.options.address = address

    console.log('functionName', contractDefinition, functionName)
    console.log('contract', contract)
    const method = contract.methods[functionName].apply(contract, args)
    if (method._method.constant) {
      return await method.call(opts)
    }
    var transaction = await new Promise((resolve, reject) => {
      method
        .send(opts)
        .on("receipt", receipt => {
          resolve(receipt)
        })
        .on("error", err => reject(err))
    })

    transaction.tx = transaction.transactionHash
    if (transaction.tx !== undefined) {
      transaction.whenFinished = async () => {
        await this.waitTransactionFinished(transaction.tx)
      }
    }
    return transaction
  }

  async addPurchaseToRegistry(id) {
    let instance
    try {
      instance = await this.deployed(PurchaseRegistryContract)
    } catch (error) {
      console.log(`Contract not deployed`)
      throw error
    }
    
    let address = await this.currentAccount();
    let listingsLength
    try {
      console.log('addresses', address, id);
      listingsLength = await instance.methods.add(address, id).call();
    } catch (error) {
      console.log(error)
      console.log(`Can't get number of listings.`)
      throw error
    }
    return listingsLength
  }
}

export default ContractService