import React, { Component } from "react";
import { Nav, NavDropdown } from "react-bootstrap";
import "./Dropdown.css";

const Item = NavDropdown.Item;

class Dropdown extends Component {
	onDropClickAdd = () => {
	    this.props.handleAddShow("add" + this.props.module);
	}

	onDropClickAllUsers = () => {
	    this.props.handleShow("usersall");
	}

	onDropClickAllLocations = () => {
	    this.props.handleShow("locationsall");
	}

	onDropClickAllTypes = () => {
	    this.props.handleShow("typesall");
	}

	onDropClickEdit = () => {
	    this.props.handleEditShow(this.props.module.toLowerCase() + "Edit");
	}

	renderDropdown = () => {
	    const module = this.props.module;
	    if (module === "Users") {
	        return (
	            <NavDropdown
	            title = "Tables"
	            id = "basic-nav-dropdown"
	            className = "header" >
	                {
	                    <Item
	                        className="item"
	                        onClick={this.onDropClickAllUsers}>
							Users
	            </Item>
	                }
	                < NavDropdown.Divider />
	                <Item
	                    className="item"
	                    onClick={this.onDropClickAllTypes}>
						Therapy Types
	            </Item>
	                < NavDropdown.Divider />
	                <Item
	                    className="item"
	                    onClick={this.onDropClickAllLocations}>
						Locations
	            </Item>
	        </NavDropdown>
	        );
	    }
	    else {
	        return (
	            <Nav.Link
	                id="basic-nav-dropdown"
	                className="header"
	                onClick={this.onDropClickAdd}>
	                Add New {module}
	            </Nav.Link>
	        );
	    }
	}

	render() {
	    const module = this.props.module;
	    return <div>{this.renderDropdown()}</div>;
	}
}

export default Dropdown;
