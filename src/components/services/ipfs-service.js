const fetch = require("cross-fetch")
const FormData = require("form-data")

const IPFS_GATE_WAY = 'http://localhost:8080'
const IPFS_API = 'http://localhost:5002'


class IpfsService {
    constructor() {
      this.gateway = IPFS_GATE_WAY
      this.api = IPFS_API
    }
  
    async UploadFile(jsonData) {
      try {
        var formData = new FormData()
        formData.append("file", this.content(jsonData))
  
        var rawRes = await fetch(`${this.api}/api/v0/add`, {
          method: "POST",
          body: formData
        })
        var res = await rawRes.json()
  
        return res.Hash
      } catch (e) {
        throw e
        throw new Error("Failure to submit file to IPFS", e)
      }
    }
  
    content(data) {
      if (typeof Blob === "undefined") {
        return new Buffer(JSON.stringify(data))
      } else {
        return new Blob([JSON.stringify(data)])
      }
    }
  
    async GetFile(ipfsHashStr) {
      const response = await fetch(this.gatewayUrlForHash(ipfsHashStr))
      var ipfsData = await response.json()
      return ipfsData
    }
  
    gatewayUrlForHash(ipfsHashStr) {
      return `${this.gateway}/ipfs/${ipfsHashStr}`
    }
  }
  
  export default IpfsService