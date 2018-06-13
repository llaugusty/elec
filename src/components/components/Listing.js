import React, { Component } from 'react';
import Bridge from '../services/bridge';
import { Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, NavLink } from 'reactstrap';

class Listing extends Component {
    constructor() {
        super();

        this.state = {
            listing: {},
            listingData: {}
        }
    }

    async componentDidMount() {
        var arr = await Bridge.contractService.getAllListingIds();

        var listings: number[] = await Promise.all(arr.map(async (item): Promise<number> => {
            var a = await Bridge.contractService.getListing(item);
            return await Bridge.ipfsService.GetFile(a.ipfsHash);
        }));

        this.setState({listings});
    }

    render() {
        const { listings } = this.state;
        console.log('listing', listings);
        return (
            <div className="listings">
                {listings && listings.map((item, index) => 
                    <Card key={index}>
                        <CardImg src={item.data.pictures[0]}/>
                        <CardBody>
                            <CardTitle>{item.data.category}</CardTitle>
                            <CardText>{item.data.description}</CardText>
                            <NavLink href={`/listings/${index}`}>More details</NavLink>
                        </CardBody>
                    </Card>
                )}
            </div>
        )
    }
}

export default Listing;