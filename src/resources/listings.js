import ResourceBase from "./_resource-base"

class Listings extends ResourceBase {
  constructor({ contractService, ipfsService }) {
    super({ contractService, ipfsService })
    this.contractDefinition = this.contractService.listingContract
  }

  async allIds() {
    return await this.contractService.getAllListingIds()
  }

  async get(address) {
    const contractData = await this.contractFn(address, "data")
    let ipfsHash = this.contractService.getIpfsHashFromBytes32(contractData[1])
    const ipfsData = await this.ipfsService.GetFile(ipfsHash)

    let listing = {
      address: address,
      ipfsHash: ipfsHash,
      sellerAddress: contractData[0],
      priceWei: contractData[2].toString(),
      price: this.contractService.web3.utils.fromWei(contractData[2], "ether"),
      unitsAvailable: contractData[3],
      created: contractData[4],
      expiration: contractData[5],
      name: ipfsData.data.name,
      category: ipfsData.data.category,
      description: ipfsData.data.description,
      location: ipfsData.data.location,
      pictures: ipfsData.data.pictures
    }

    return listing
  }

  async getByIndex(listingIndex) {
    const contractData = await this.contractService.getListing(listingIndex)
    console.log('contractData', contractData)
    const ipfsData = await this.ipfsService.GetFile(contractData.ipfsHash)
    console.log('ipfsData', ipfsData)
    const listing = {
      name: ipfsData.data.name,
      category: ipfsData.data.category,
      description: ipfsData.data.description,
      location: ipfsData.data.location,
      pictures: ipfsData.data.pictures,

      address: contractData.address,
      index: contractData.index,
      ipfsHash: contractData.ipfsHash,
      sellerAddress: contractData.lister,
      price: Number(contractData.price),
      unitsAvailable: Number(contractData.unitsAvailable)
    }

    return listing
  }

  async create(data) {
    const ipfsHash = await this.ipfsService.UploadFile({data})

    const units = 1
    let transactionReceipt = await this.contractService.submitListing(ipfsHash, data.price, units);
    return transactionReceipt
  }

  async buy(address, unitsToBuy, ethToPay) {
    console.log('asdasd', address, unitsToBuy, ethToPay)
    const value = this.contractService.web3.utils.toWei(String(ethToPay), "ether")
    return await this.contractFn(address, "buyListing", [], {value:value, gas: 750000})
  }

  async close(address) {
    return await this.contractFn(address, "close")
  }

  async purchasesLength(address) {
    console.log('purchase length', address)
    return Number(await this.contractFn(address, "purchasesLength"))
  }

  async purchaseAddressByIndex(address, index) {
    return await this.contractFn(address, "getPurchase", [index])
  }
}

export default Listings