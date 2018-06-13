import React, { Component } from 'react';
import Bridge from '../services/bridge';
import { Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, NavLink } from 'reactstrap';
import { Alert } from 'reactstrap';

const ColorMapper = ["primary", "secondary", "success", "danger", "warning", "info"];
const TextMapper = ["AWAITING PAYMENT", "SHIPPING PENDING", "BUYER PENDING", "SELLER PENDING", "IN DISPUTE", "REVIEW PERIOD"];
class MyListing extends Component {

    constructor() {
        super();

        this.state = {
            listing: {},
            listingData: {},
            staeg: 0,
            purchases: []
        }

        this.loadListing = this.loadListing.bind(this)
    }

    async getPurchaseAddress(addr, i) {
        try {
          const purchAddr = await Bridge.listings.purchaseAddressByIndex(addr, i)
    
          return this.loadPurchase(purchAddr)
        } catch(error) {
          console.error(`Error fetching purchase address at: ${i}`)
        }
      }

    async getListingIds() {
        try {
          const ids = await Bridge.listings.allIds()
    
          return await Promise.all(ids.map(this.loadListing))
        } catch(error) {
          console.error('Error fetching listing ids')
        }
      }

      async loadListing(id) {
        try {
            console.log('iddd', id);
          const listing = await Bridge.listings.getByIndex(id)
            console.log('getPurchasesLength', listing)
          return this.getPurchasesLength(listing.address)
        } catch(error) {
            console.log('error', error)
          console.error(`Error fetching contract or IPFS info for listingId: ${id}`)
        }
      }

      async getPurchasesLength(addr) {
        try {
            console.log('addr', addr)
          const len = await Bridge.listings.purchasesLength(addr)
          console.log('len', len)
          if (!len) {
            return len
          }
    
          return await Promise.all([...Array(len).keys()].map(i => this.getPurchaseAddress(addr, i)))
        } catch(error) {
          console.error(`Error fetching purchases length for listing: ${addr}`)
        }
      }

    async componentDidMount() {
        // console.log('Bridge', Bridge);
        // var ids = await Bridge.contractService.getAllMyListingIds();
        // console.log('ids', ids)
        // var listings: number[] = await Promise.all(ids.map(async (item): Promise<number> => {
        //     var result = await Bridge.contractService.getAllMyListing(item);
        //     var listing = await Bridge.contractService.getListingByAddess(result[0]);
        //     var data =  await Bridge.ipfsService.GetFile(listing.ipfsHash);

        //     data.data.stage = result[1];
        //     return data
        // }));
        // this.setState({listings});
    }

    async loadPurchase(addr) {
        try {
          const purchase = await Bridge.purchases.get(addr)
          
          if (purchase.buyerAddress === this.props.web3Account) {
            const purchases = [...this.state.purchases, purchase]
    
            this.setState({ purchases })
          }
    
          return purchase
        } catch(error) {
          console.error(`Error fetching purchase: ${addr}`, error)
        }
      }

      async componentWillMount() {
        await this.getListingIds()
      }

    render() {
        const { listings, purchases } = this.state;

        console.log('purchases', purchases);

        return (
            <div className="my-listing">
                {listings && listings.map((item, index) => 
                    <Card key={index}>
                        <Alert color={ColorMapper[item.data.stage]}>
                        {TextMapper[item.data.stage]}
                        </Alert>
                        <CardImg src={item.data.pictures[0]}/>
                        <CardBody>
                            <CardTitle>{item.data.category}</CardTitle>
                            <CardText>{item.data.description}</CardText>
                        </CardBody>
                    </Card>
                )}
            </div>
        )
    }
}

export default MyListing;