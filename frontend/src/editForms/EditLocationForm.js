import React from "react";
import { Alert, Button, Col, Form, Container } from "react-bootstrap";
import "../css/Global.css";
import AreYouSure from "../modals/AreYouSure";
import { connect } from "react-redux";
import { LocationActions } from "../_actions/locationAction";

class EditLocationForm extends React.Component {
    state = {
        name: "",
        address: "",
        showAlert: false,
        archiveClicked: false
    };

    updateLocation = e => {
        this.props.dispatch(LocationActions.updateLocation({
            location: this.state.name,
            address: this.state.address,
            location_id: this.props.selected.locationId
        }));
    }

    componentWillReceiveProps = newProps => {
        if ( newProps.updateError || newProps.updateSuccess || newProps.updateLoading ) {
            this.setState({ showAlert: true });
        }
        
        if (newProps.updateSuccess) {
            setTimeout(() => {
                this.props.onLocationUpdated(14); // Location table
            }, 600);
        }
    }

    archive = () => {
        this.props.dispatch(LocationActions.archiveLocation(this.props.selected.locationId));
    }

    componentDidMount = () => {
        this.setState(({
            name: this.props.selected.location,
            address: this.props.selected.address,
        }));
    }

    handleChange = event => {
        const { name, value } = event.target;
	    this.setState({ [name]: value || "" });
    }

    render = () => {
        const { updateError, updateSuccess, updateLoading } = this.props;
        const handleHide = () => this.setState({ showAlert: false });
        const alertObj = updateError
            ? { variant: "danger", title: "Updating a location failed!" }
            : updateSuccess
                ? { variant: "success", title: "Updating a location succeeded" }
                : updateLoading ? 
                    { variant: "warning", title: "Loading..." } : null;
       
        return (
            <Container className="form-container">
                { this.state.archiveClicked &&
                    <AreYouSure
                        onHide={ () => {this.setState(() => ({ archiveClicked: false }));} }
                        onConfirm={this.archive}
                        modalBody={<h5>Please confirm to archive this location</h5>}
                    />
                }
                { alertObj && <Alert
                    show={this.state.showAlert}
                    className="fixed-top"
                    variant={alertObj.variant}
                    dismissible
                    onClose={handleHide}>
                    {alertObj.title}
                </Alert> }
                <Form>
                    <Form.Row className="inner-row">
                        <p className="form-title">Update A Location</p>
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
                            variant="danger"
                            size="large"
                            onClick={ () => {this.setState(() => ({ archiveClicked: true }));} }>                            Archive Location
                        </Button>
                        <Button
                            className="btn"
                            variant="primary"
                            size="large"
                            onClick={this.updateLocation}>
                            Update Location
                        </Button>
                    </Form.Row>
                </Form>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    updateError: state.locations.error,
    updateSuccess: state.locations.updatedLocation,
    updateLoading: state.locations.updating,
});

const EditLocationFormConnected = connect(mapStateToProps)(EditLocationForm);
export { EditLocationFormConnected as EditLocationForm };
