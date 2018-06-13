import fetch from "cross-fetch"
import ContractService from './contract-service'
import IpfsService from './ipfs-service'
import Listings from '../resources/listings'
import Purchases from '../resources/purchases'

var resources = {
    listings: Listings,
    purchases: Purchases,
  }

class Bridge {
    constructor() {
        this.contractService = new ContractService()
        this.ipfsService = new IpfsService();

        for (let resourceName in resources) {
            let Resource = resources[resourceName]
            this[resourceName] = new Resource({
              contractService: this.contractService,
              ipfsService: this.ipfsService
            })
          }
    }
}

export default new Bridge()