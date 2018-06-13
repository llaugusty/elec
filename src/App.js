import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Bridge from './services/bridge';
import Listing from './components/Listing';
import MyListing from './components/MyListing';
import ListingDetail from './components/ListingDetail';
import CreateListing from './components/CreateListing';

import {
  HashRouter as Router,
  Route,
  Link,
  Switch,
  Redirect,
} from 'react-router-dom'
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem } from 'reactstrap';
import { Icon } from 'react-icons-kit'
import { home } from 'react-icons-kit/icomoon/home'
import {Eth} from 'react-cryptocoins';

class App extends Component {
  constructor() {
    super();
    
    this.state = {
      listingIds: []
    }
  }

  async componentDidMount() {
    var address = await Bridge.contractService.currentAccount();
    var balance = await Bridge.contractService.currentAccountBalance();
    this.setState({address, balance});
  }

  render() {
    const {address, balance} = this.state;

    return (
      <div className="App">
        <Navbar color="light" light expand="md">
          <NavbarBrand href="/"><Icon className="home-icon" size={25} icon={home} /></NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="/#/my-list">My listings</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/#/create-list">Creating Listing</NavLink>
              </NavItem>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Profile
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem>
                    Address: {address}
                  </DropdownItem>
                  <DropdownItem>
                  <Eth /><span style={{marginLeft: "10px"}}>Balance: {balance}</span>
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem>
                    Profile
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        </Navbar>
        <Router>
          <div className="app-content">
            <div className="container">
              <Route exact path="/" component={Listing} />
              <Route exact path="/listings/:id" component={ListingDetail} />
              <Route exact path="/my-list" component={MyListing} />
              <Route exact path="/create-list" component={CreateListing} />
            </div>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
