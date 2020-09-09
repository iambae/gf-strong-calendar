import React, { Component } from "react";
import { Form, Button } from "react-bootstrap";
import { Link, Route } from "react-router-dom";

export default class ResetPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
        };
    }

    render() {
        return (
            <div className="login-window">

            </div>
        );
    }
}