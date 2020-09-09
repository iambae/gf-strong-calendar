import React, { Component } from "react";
import "../css/Global.css";
import "./AddTherapist.css";
import { validate } from "../forms/InputParser.js";
import { Button, Col, Form, Container } from "react-bootstrap";
import { connect } from "react-redux";
import { ClerkActions } from "../_actions/clerkAction";
import changeCase from "../_helpers/changeToSnakeCase";
import { Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import moment from "moment";

export default class AddClerk extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            firstName: "",
            middleName: "",
            lastName: "",
            email: "",
            contactNumber: "",
            dateOfBirth: new Date(), // yyyy-mm-dd
            showAlert: false,
        };
    }

	handleChange = event => {
	    const { name, value } = event.target;
	    if (name === "contactNumber" && value) {
	        const valid = validate(event.target.dataset.parse, value);
	        valid
	            ? this.setState({ [name]: value })
	            : this.setState(prevState => {
	                return { [name]: prevState.contactNumber };
				  });
	    } else {
	        this.setState({ [name]: value });
	    }
	}

	addClerk = e => {
	    e.preventDefault();
	    const temp = this.state;
	    const clerk = changeCase(temp);
	    this.props.dispatch(ClerkActions.createClerk(clerk));
	}

	handleSelectChange = value => {
	    const val = this.state.types;
	    val.push(value);
	    this.setState({ types: val });
	}

	handleDateChangeDOB = ({ dob }) => {
	    this.setState({ dateOfBirth: dob });
	}

	handleDateSelect = dob => {
	    this.handleDateChangeDOB({ dob });
	}

	componentWillReceiveProps = newProps => {
	    if (
	        newProps.addClerkError ||
			newProps.addSuccess ||
			newProps.addLoading
	    ) {
	        this.setState({ showAlert: true });
	    }

	    if (newProps.addSuccess) {
	        setTimeout(() => {
	            this.props.onClerkAdded(0);
	        }, 600);
	    }
	}

	render() {
	    const { addClerkError, addSuccess } = this.props;
	    const handleHide = () => this.setState({ showAlert: false });
	    const alertObj = addClerkError
	        ? { variant: "danger", title: "Adding a clerk failed!" }
	        : addSuccess
	            ? { variant: "success", title: "Adding a clerk succeeded" }
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
	            <Form onSubmit={this.addClerk}>
	                <Form.Row className="inner-row">
	                    <p className="form-title">Create New Clerk</p>
	                </Form.Row>
	                <Form.Row>
	                    <Form.Group as={Col}>
	                        <Form.Label className="label">
								First Name
	                        </Form.Label>
	                        <Form.Control
	                            name="firstName"
	                            placeholder="First Name"
	                            type="text"
	                            pattern="[A-Za-z]+"
	                            required
	                            value={this.state.firstName}
	                            autoFocus
	                            onChange={this.handleChange}
	                        />
	                    </Form.Group>
	                    <Form.Group as={Col}>
	                        <Form.Label className="label">
								Middle Name
	                        </Form.Label>
	                        <Form.Control
	                            name="middleName"
	                            placeholder="Middle Name"
	                            type="text"
	                            pattern="[A-Za-z]+"
	                            value={this.state.middleName}
	                            onChange={this.handleChange}
	                        />
	                    </Form.Group>
	                    <Form.Group as={Col}>
	                        <Form.Label className="label">Last Name</Form.Label>
	                        <Form.Control
	                            name="lastName"
	                            placeholder="Last Name"
	                            required
	                            type="text"
	                            pattern="[A-Za-z]+"
	                            value={this.state.lastName}
	                            onChange={this.handleChange}
	                        />
	                    </Form.Group>
	                </Form.Row>
	                <Form.Row>
	                    <Form.Group as={Col}>
	                        <Form.Label className="label">
								Contact Number
	                        </Form.Label>
	                        <Form.Control
	                            required
	                            id="contactNumber"
	                            name="contactNumber"
	                            type="text"
	                            placeholder="Contact Number"
	                            data-parse="contact"
	                            value={this.state.contactNumber}
	                            onChange={this.handleChange}
	                        />
	                    </Form.Group>
	                    <Form.Group as={Col}>
	                        <Form.Label className="label">Email</Form.Label>
	                        <Form.Control
	                            required
	                            name="email"
	                            placeholder="Email"
	                            type="email"
	                            value={this.state.email}
	                            onChange={this.handleChange}
	                        />
	                    </Form.Group>
	                    <Form.Group as={Col}>
	                        <Form.Label className="label">
								Date of Birth
	                        </Form.Label>
	                        <DatePicker
	                            name="dateOfBirth"
	                            className="datepicker"
	                            selected={new Date(moment(this.state.dateOfBirth).format())}
	                            dateFormat="yyyy-MM-dd"
	                            max="9999-12-31"
	                            onChange={this.handleDateSelect}
	                            peekNextMonth
	                            showMonthDropdown
	                            showYearDropdown
	                            dropdownMode="select"
	                            todayButton={"Today"}
	                        />
	                    </Form.Group>
	                </Form.Row>
	                <Form.Row className="inner-row">
	                    <Button
	                        className="btn"
	                        variant="primary"
	                        size="large"
	                        type="submit">
							Add Clerk
	                    </Button>
	                </Form.Row>
	            </Form>
	        </Container>
	    );
	}
}

const mapStateToProps = state => ({
    clerks: state.clerks,
    addClerkError: state.clerks.error,
    addSuccess: state.clerks.clerk,
    addLoading: state.clerks.creating,
});

const AddClerkForm = connect(mapStateToProps)(AddClerk);
export { AddClerkForm as AddClerk };
