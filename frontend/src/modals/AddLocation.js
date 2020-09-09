import React, { Component } from "react";
import "../css/Global.css";
import { Alert, Button, Col, Form, Container } from "react-bootstrap";
import { connect } from "react-redux";
import { LocationActions } from "../_actions/locationAction";

export default class AddLocation extends Component {
    state = {
        name: "",
        address: "",
        showAlert: false,
    };

    addLocation = e => {
        let obj = {
            location: this.state.name,
            address: this.state.address
        };
        this.props.dispatch(LocationActions.createLocation(obj));
    }

    componentWillReceiveProps = newProps => {
        if ( newProps.addError || newProps.addSuccess || newProps.addLoading ) {
            this.setState({ showAlert: true });
        }
        
        if (newProps.addSuccess) {
            setTimeout(() => {
                this.props.onLocationAdded(14); // Location table
            }, 600);
        }
    }

    handleChange = event => {
        const { name, value } = event.target;
	    this.setState({ [name]: value || "" });
    }

    render = () => {
        const { addError, addSuccess } = this.props;
        const handleHide = () => this.setState({ showAlert: false });
        const alertObj = addError
            ? { variant: "danger", title: "Adding a location failed!" }
            : addSuccess
                ? { variant: "success", title: "Adding a location succeeded" }
                : { variant: "warning", title: "Loading..." };
       
        return (
            <Container className="form-container">
                <Alert
                    show={this.state.showAlert}
                    className="fixed-top"
                    variant={alertObj.variant}
                    dismissible
                    onClose={handleHide}>
                    {alertObj.title}
                </Alert>
                <Form>
                    <Form.Row className="inner-row">
                        <p className="form-title">Create New Location</p>
                    </Form.Row>
                    <Form.Row>
                        <Form.Group as={Col}>
                            <Form.Label className="label">
                                Location Name
                            </Form.Label>
                            <Form.Control
                                name="name"
                                placeholder="Location Name"
                                type="text"
                                required
                                value={this.state.name}
                                autoFocus
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label className="label">
                                Location Address
                            </Form.Label>
                            <Form.Control
                                name="address"
                                required
                                placeholder="Location Address"
                                type="text"
                                value={this.state.address}
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                    </Form.Row>
                    <Form.Row className="inner-row">
                        <Button
                            className="btn"
                            variant="primary"
                            size="large"
                            onClick={this.addLocation}>
                            Add Location
                        </Button>
                    </Form.Row>
                </Form>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    addError: state.locations.error,
    addSuccess: state.locations.location,
    addLoading: state.locations.creating,
});

const AddLocationForm = connect(mapStateToProps)(AddLocation);
export { AddLocationForm as AddLocation };
