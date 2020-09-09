import React, { Component } from "react";
import { NavDropdown } from "react-bootstrap";
import "../dropdown/Dropdown.css";
import "../css/Global.css";
import "./SupportPersonnel.css";

const Item = NavDropdown.Item;

class ReportDropdown extends Component {
	onDropClick = type => {
	    this.props.handleShow(type);
	}

	render() {
	    const module = this.props.module;
	    return (
	        <NavDropdown
	            title={module}
	            id="basic-nav-dropdown"
	            className="header">
	            <Item
	                className="item"
	                onClick={this.onDropClick.bind(this, "tableReport")}>
					Create new Patient {module}
	            </Item>
	            <NavDropdown.Divider />
	            <Item
	                className="item"
	                onClick={this.onDropClick.bind(this, "summaryReport")}>
					Create new Summary {module}
	            </Item>
	        </NavDropdown>
	    );
	}
}

export default ReportDropdown;
