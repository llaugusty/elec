class ResourceBase {
  constructor({ contractService, ipfsService }) {
    this.contractService = contractService
    this.ipfsService = ipfsService
  }

  async contractFn(address, functionName, args = [], options = {}) {
    return await this.contractService.contractFn(
      this.contractDefinition,
      address,
      functionName,
      args,
      options
    )
  }
}

export default ResourceBase
