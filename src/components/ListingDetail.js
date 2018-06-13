import React, { Component } from 'react';
import Bridge from '../services/bridge';
import Slider from './Slider';
import { Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, NavLink, Button } from 'reactstrap';

class ListingDetail extends Component {
    constructor({ match }) {
        super();
        this.state = {
            listingData: {},
            listingForm: {},
            id: match.params.id,
        }

        this.buyListing = this.buyListing.bind(this);
    }
    async componentDidMount() {
        var listingForm = await Bridge.contractService.getListing(this.state.id);
        var listingData = await Bridge.ipfsService.GetFile(listingForm.ipfsHash);
        this.setState({listingData: listingData.data, listingForm});
    }

    async buyListing() {
        var listingForm = await Bridge.contractService.getListing(this.state.id);
        var purchase = await Bridge.listings.buy(listingForm.address, 1, listingForm.price);
    }

    render() {
        const {
            index, address, lister, ipfsHash, unitsAvailable
        } = this.state.listingForm;

        const {
            category, description, location, name, pictures, price
        } = this.state.listingData;

        return (
            <div className="listing-detail">
                <Card key={index}>
                    <CardBody>
                        <Button className="buy-btn" onClick={this.buyListing}>BUY</Button>
                        <CardSubtitle className="price">{price} ETH</CardSubtitle>
                        <CardTitle>{category}</CardTitle>
                        <CardText>{description}</CardText>
                    </CardBody>
                    <Slider pictures={pictures ? pictures : [] }></Slider>
                </Card>
            </div>
        )
    }
}

export default ListingDetail;