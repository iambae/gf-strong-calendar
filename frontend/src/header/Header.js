import React, { Component } from "react";
import Navbar from "react-bootstrap/Navbar";

class Header extends Component {
    render() {
        return (
            <div>
                <Navbar bg="light" expand="lg">
                    <Navbar.Brand href="/dashboard">Home</Navbar.Brand>
                </Navbar>
            </div>
        );
    }
}
export default Header;