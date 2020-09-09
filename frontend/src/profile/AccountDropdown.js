import React, { Component } from "react";
import { NavDropdown } from "react-bootstrap";
import "../dropdown/Dropdown.css";

const Item = NavDropdown.Item;

class AccountDropdown extends Component {
	onDropClick = type => {
	    this.props.handleShow(type);
	}

	render() {
	    return (
	        <NavDropdown
	            title="Account"
	            id="basic-nav-dropdown"
	            className="header">
	            {this.props.showProfile && <Item
	                className="item"
	                onClick={this.onDropClick.bind(this, "userProfile")}>
					User Profile
	            </Item>}
	            <NavDropdown.Divider />
	            <Item
	                className="item"
	                onClick={this.onDropClick.bind(this, "logout")}>
					Logout
	            </Item>
	        </NavDropdown>
	    );
	}
}

export default AccountDropdown;
