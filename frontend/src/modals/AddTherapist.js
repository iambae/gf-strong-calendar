import React, { Component } from "react";
import "../css/Global.css";
import "./AddTherapist.css";
import { validate } from "../forms/InputParser.js";
import { Button, Col, Form, Container } from "react-bootstrap";
import { connect } from "react-redux";
import { TherapistActions } from "../_actions/therapistAction";
import changeCase from "../_helpers/changeToSnakeCase";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { TypeActions } from "../_actions/typeAction";
import { Alert } from "react-bootstrap";
import moment from "moment";

const customStyles = {
	control: (base, state) => ({
		...base,
		zIndex: "29",
		flexGrow: "2",
		margin: "13px 10px 20px 10px !important",
		borderRadius: "4px",
		boxShadow:
			"0 1px 3px rgba(50, 50, 93, 0.15), 1px 0 3px 0 rgba(0, 0, 0, 0.1) !important",
		border: "0 !important",
		transition: "box-shadow 0.15s ease",
		fontFamily:
			"'Segoe UI', 'Open Sans', 'Helvetica Neue', sans-serif !important",
		fontSize: "1.1em",
	}),
};

class AddTherapist extends Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			firstName: "",
			middleName: "",
			lastName: "",
			email: "",
			contactNumber: "",
			code: "", // Therapy Code
			types: [],
			dateOfBirth: new Date(), // yyyy-mm-dd
			showAlert: false,
			typeOptions: [],
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

	addTherapist = e => {
		e.preventDefault();
		const temp = this.state;
		const therapist = changeCase(temp);
		// deal with types
		const array = [];
		therapist.types.forEach(element => {
			array.push(element.value);
		});
		therapist.types = array;
		this.props.dispatch(TherapistActions.createTherapist(therapist));
	}

	componentDidMount() {
		this.props.dispatch(TypeActions.getAllTypes());
	}

	componentWillReceiveProps = newProps => {
		if (
			newProps.addTherapistError ||
			newProps.getTypesError ||
			newProps.addSuccess ||
			newProps.addLoading
		) {
			this.setState({ showAlert: true });
		}

		if (newProps.types) {
			this.setState({
				typeOptions: newProps.types,
			});
		}

		if (newProps.addSuccess) {
			setTimeout(() => {
				this.props.onTherapistAdded(0);
			}, 600);
		}
	}

	handleSelectChange = value => {
		const val = this.state.types;
		val.push(value);
		this.setState({ types: val });
	}

	handleDateChange = ({ dob }) => {
		this.setState({ dateOfBirth: dob });
	}

	handleDateSelect = dob => {
		this.handleDateChange({ dob });
	}

	render() {
		const { addTherapistError, addSuccess } = this.props;
		const handleHide = () => this.setState({ showAlert: false });
		const alertObj = addTherapistError
			? { variant: "danger", title: "Adding a therapist failed!" }
			: addSuccess
				? { variant: "success", title: "Adding a therapist succeeded" }
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
				<Form onSubmit={this.addTherapist}>
					<Form.Row className="inner-row">
						<p className="form-title">Create New Therapist</p>
					</Form.Row>
					<Form.Row className="inner-row">
						<Form.Group as={Col}>
							<Form.Label className="label">
								First Name
	                        </Form.Label>
							<Form.Control
								name="firstName"
								placeholder="First Name"
								type="input"
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
								type="input"
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
								type="input"
								pattern="[A-Za-z]+"
								value={this.state.lastName}
								onChange={this.handleChange}
							/>
						</Form.Group>
					</Form.Row>
					<Form.Row className="inner-row">
						<Form.Group as={Col}>
							<Form.Label className="label">
								Contact Number
	                        </Form.Label>
							<Form.Control
								required
								id="contactNumber"
								name="contactNumber"
								type="text"
								data-parse="contact"
								placeholder="Contact Number"
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
						<Form.Group as={Col}>
							<Form.Label className="label">
								Therapist Code
	                        </Form.Label>
							<Form.Control
								maxLength="10"
								name="code"
								required
								pattner="^[a-z0-9]+$"
								value={this.state.code}
								placeholder=" Therapist Code"
								onChange={this.handleChange}
							/>
						</Form.Group>
						<Form.Group as={Col} />
						<Form.Group as={Col} style={{ marginTop: "25px" }}>
							<Form.Label className="label">
								Therapy Type
	                        </Form.Label>
							<Select
								className="select select-field"
								styles={customStyles}
								placeholder="Types"
								name="types"
								required
								value={this.state.types}
								options={this.state.typeOptions}
								isMulti={true}
								isSearchable={true}
								onChange={selected =>
									this.setState({ types: selected })
								}
								theme={theme => ({
									...theme,
									colors: {
										...theme.colors,
										primary25: "silver",
										primary: "silver",
									},
								})}
							/>
						</Form.Group>
					</Form.Row>
					<Form.Row className="inner-row">
						<Button
							className="btn"
							variant="primary"
							size="large"
							type="submit">
							Add Therapist
	                    </Button>
					</Form.Row>
				</Form>
			</Container>
		);
	}
}

const mapStateToProps = state => ({
	therapists: state.therapists,
	addTherapistError: state.therapists.error,
	addSuccess: state.therapists.therapist,
	addLoading: state.therapists.creating,
	getTypesError: state.types.error,
	types: state.types.items,
	typeLoading: state.types.loading,
});

const AddTherapistForm = connect(mapStateToProps)(AddTherapist);
export { AddTherapistForm as AddTherapist };
