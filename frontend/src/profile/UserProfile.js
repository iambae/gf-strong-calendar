import React from "react";
import {
    Alert,
    InputGroup,
    Container,
    Button,
    Row,
    Col,
    Form,
    FormLabel,
    Card,
    FormControl,
} from "react-bootstrap";
import DetailCard from "./DetailCard";
import { validate } from "../forms/InputParser.js";
import "./UserProfile.css";
import _ from "lodash";
import "../css/Global.css";
import { UserProfileActions } from "../_actions/userProfileAction";
import { connect } from "react-redux";

class UserProfile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loggedInUser: this.props.userAuth, // initial user until we pull full user info from the DB
            originalUser: null,
            editedUser: null, //_.cloneDeep(this.props.user.data),
            oldPassword: "",
            newPassword: "",
            repeatPassword: "",
            theme: "",
            color: "",
        };
    }

	componentDidMount = () => {
	    this.props.dispatch(
	        UserProfileActions.getUserInfo(this.state.loggedInUser.data.user_id)
	    );
	}

	componentWillReceiveProps = newProps => {
	    const showToast = newProps.loading || newProps.error || newProps.success;
	    this.setState({ showAlert: showToast });

	    if (newProps.user)
	        this.setState(
	            () => ({
	                originalUser: newProps.user,
	                editedUser: _.cloneDeep(newProps.user),
	            }),
	            () => this.computeProfileImage()
	        );
	}

	computeProfileImage = () => {
	    const themes = [
	        "base",
	        "daisygarden",
	        "seascape",
	        "summerwarmth",
	        "bythepool",
	        "frogideas",
	    ];
	    const colors = [2, 3, 4];
	    let email = this.state.originalUser["email"];
	    let hash = 0,
	        i,
	        chr;
	    if (email.length === 0) this.setState({ theme: 0, color: 0 });
	    for (i = 0; i < email.length; i++) {
	        chr = email.charCodeAt(i);
	        hash = (hash << 5) - hash + chr;
	        hash |= 0;
	    }

	    const userTheme = themes[Math.abs(hash) % themes.length];
	    const userColor = colors[Math.abs(hash) % colors.length];

	    this.setState({ theme: userTheme, color: userColor });
	}

	handleProfileChange = event => {
	    const { name, value } = event.target;
	    let temp = _.cloneDeep(this.state.editedUser);

	    const valid = validate(event.target.dataset.parse, event.target.value);
	    temp[name] = valid ? value : this.state.originalUser[name];

	    this.setState({ editedUser: temp });
	}

	onProfileUpdateSubmit = event => {
	    event.preventDefault();
	    this.props.dispatch(
	        UserProfileActions.updateUserInfo(
	            this.state.editedUser.user_account_ID,
	            this.state.editedUser
	        )
	    );
	}

	handlePasswordChange = event => {
	    this.setState({
	        [event.target.id]: event.target.value,
	    });
	}

	validatePassword = event => {
	    if (event.target.id !== "repeatPassword") return;
	    if (this.state.newPassword !== event.target.value) {
	        event.target.setCustomValidity("Passwords Don't Match");
	    } else {
	        event.target.setCustomValidity("");
	    }
	}

	onPasswordChangeSubmit = event => {
	    event.preventDefault();
	    const info = {
	        old_password: this.state.oldPassword,
	        password: this.state.newPassword,
	    };
	    this.props.dispatch(
	        UserProfileActions.resetPassword(
	            this.state.editedUser.user_account_ID,
	            info
	        )
	    );
	}

	renderUserCard = () => {
	    return (
	        <Card className="user-card" id="user-profile-card">
	            <div>
	                <Card.Body>
	                    <Card.Title id="welcome-user">Welcome</Card.Title>
	                    <Card.Img
	                        img-responsive="true"
	                        variant="top"
	                        src={`http://tinygraphs.com/labs/squares/random/?theme=${
	                            this.state.theme
	                        }&numcolors=${this.state.color}`}
	                    />
	                    <Card.Title>
	                        {this.state.originalUser["first_name"] +
								" " +
								this.state.originalUser["middle_name"] +
								" " +
								this.state.originalUser["last_name"]}
	                    </Card.Title>
	                    <hr
	                        style={{
	                            margin: "15px",
	                            borderTop: "1px solid #363636",
	                        }}
	                    />
	                    <InputGroup className="input-group">
	                        <Col>
	                            <label className="label-role-number mb-8">
									Email:
	                            </label>
	                            <InputGroup.Append className="mb-4">
	                                <InputGroup.Text id="basic-addon2">
	                                    {this.state.originalUser["email"]}
	                                </InputGroup.Text>
	                            </InputGroup.Append>
	                        </Col>
	                    </InputGroup>
	                </Card.Body>
	            </div>
	        </Card>
	    );
	}

	editUserForm = () => {
	    return (
	        <form
	            id="profile-form"
	            className="card-input-rows"
	            onSubmit={this.onProfileUpdateSubmit}>
	            <Row className="content-row">
	                <Form.Group className="input-section">
	                    <FormLabel className="form-label">
							Email Address
	                    </FormLabel>
	                    <FormControl
	                        value={this.state.editedUser.email}
	                        name="email"
	                        placeholder="Email"
	                        className="form-control"
	                        data-parse="email"
	                        type="email"
	                        onChange={this.handleProfileChange}
	                        message="Please enter a valid email address"
	                    />
	                </Form.Group>
	            </Row>
	            <Row className="content-row">
	                <Form.Group className="input-section">
	                    <FormLabel className="form-label">
							Contact Number
	                    </FormLabel>
	                    <input
	                        id="contact"
	                        name="contact_number"
	                        type="text"
	                        className="form-control"
	                        placeholder="Contact Number"
	                        data-parse="contact"
	                        value={this.state.editedUser.contact_number}
	                        onChange={this.handleProfileChange}
	                        message="Please enter valid phone number"
	                    />
	                </Form.Group>
	            </Row>
	            <Row className="content-row">
	                <Form.Group className="input-section">
	                    <FormLabel className="form-label">First Name</FormLabel>
	                    <FormControl
	                        id="firstName"
	                        name="first_name"
	                        type="text"
	                        className="form-control"
	                        placeholder="First Name"
	                        data-parse="name"
	                        value={this.state.editedUser.first_name}
	                        onChange={this.handleProfileChange}
	                        message="Please enter a valid name"
	                    />
	                </Form.Group>
	            </Row>
	            <Row className="content-row">
	                <Form.Group className="input-section">
	                    <FormLabel className="form-label">
							Middle Name
	                    </FormLabel>
	                    <FormControl
	                        id="middleName"
	                        name="middle_name"
	                        type="text"
	                        className="form-control"
	                        placeholder="Middle Name"
	                        data-parse="name"
	                        value={this.state.editedUser.middle_name}
	                        onChange={this.handleProfileChange}
	                        message="Please enter valid name"
	                    />
	                </Form.Group>
	            </Row>
	            <Row className="content-row">
	                <Form.Group className="input-section">
	                    <FormLabel className="form-label">Last Name</FormLabel>
	                    <input
	                        id="lastName"
	                        name="last_name"
	                        type="text"
	                        className="form-control"
	                        placeholder="Last Name"
	                        data-parse="name"
	                        value={this.state.editedUser.last_name}
	                        onChange={this.handleProfileChange}
	                        message="Please enter valid name"
	                    />
	                </Form.Group>
	            </Row>
	            <div className="clearfix" />
	            <div className="detail-card-footer">
	                <Button className="btn profile-btn" size="lg" type="submit">
						Update Profile
	                </Button>
	            </div>
	        </form>
	    );
	}

	passwordForm = () => {
	    return (
	        <form onSubmit={this.onPasswordChangeSubmit}>
	            <Row className="content-row">
	                <Form.Group className="input-section">
	                    <FormLabel className="form-label">
							Current Password
	                    </FormLabel>
	                    <input
	                        required
	                        id="oldPassword"
	                        name="oldPassword"
	                        type="password"
	                        className="form-control"
	                        placeholder="Enter Current Password"
	                        data-parse="password"
	                        value={this.state.oldPassword}
	                        onChange={this.handlePasswordChange}
	                    />
	                </Form.Group>
	            </Row>
	            <Row className="content-row">
	                <Form.Group className="input-section">
	                    <FormLabel className="form-label">
							New Password
	                    </FormLabel>
	                    <input
	                        required
	                        id="newPassword"
	                        name="newPassword"
	                        type="password"
	                        className="form-control"
	                        placeholder="Enter New Password"
	                        data-parse="password"
	                        value={this.state.newPassword}
	                        onChange={this.handlePasswordChange}
	                    />
	                </Form.Group>
	            </Row>
	            <Row className="content-row">
	                <Form.Group className="input-section">
	                    <FormLabel className="form-label">
							Repeat Password
	                    </FormLabel>
	                    <input
	                        required
	                        id="repeatPassword"
	                        name="repeatPassword"
	                        type="password"
	                        className="form-control"
	                        placeholder="Repeat New Password"
	                        data-parse="password"
	                        value={this.state.repeatPassword}
	                        onKeyUp={this.validatePassword}
	                        onChange={this.handlePasswordChange}
	                    />
	                </Form.Group>
	            </Row>
	            <div className="clearfix" />
	            <div className="detail-card-footer">
	                <Button className="btn profile-btn" size="lg" type="submit">
						Update Password
	                </Button>
	            </div>
	        </form>
	    );
	}

	render() {
	    const { error, loading, success } = this.props;
	    const handleHide = () => this.setState({ showAlert: false });
	    const alertObj = error
	        ? { variant: "danger", title: "Failed to update user information!" }
	        : loading
	            ? { variant: "warning", title: "Loading..." }
	            : success
	                ? {
	                    variant: "success",
	                    title: "User information was successfully updated!",
			  }
	                : null;

	    let alert = null;
	    if (alertObj && this.state.showAlert) {
	        alert = (
	            <Alert
	                show={this.state.showAlert}
	                className="fixed-top"
	                variant={alertObj.variant}
	                dismissible
	                onClose={handleHide}>
	                {alertObj.title}
	            </Alert>
	        );
	    }

	    if (!this.state.originalUser) return alert;

	    return (
	        <div className="main-content container-fluid">
	            {alert}
	            <Container fluid>
	                <Row className="content-row">
	                    <Col xs={12} sm={12} md={12} lg={4} className="columns">
	                        {this.renderUserCard()}
	                    </Col>
	                    <Col
	                        xs={12}
	                        sm={12}
	                        md={12}
	                        lg={4}
	                        className="columns right-column">
	                        <DetailCard
	                            title="Profile"
	                            content={this.editUserForm()}
	                        />
	                    </Col>
	                    <Col
	                        xs={12}
	                        sm={12}
	                        md={12}
	                        lg={4}
	                        className="columns right-column">
	                        <DetailCard
	                            title="Change password"
	                            content={this.passwordForm()}
	                        />
	                    </Col>
	                </Row>
	            </Container>
	        </div>
	    );
	}
}

const mapStateToProps = state => ({
    loading: state.userProfiles.loading,
    success: state.userProfiles.success,
    error: state.userProfiles.error,
    user: state.userProfiles.user,
});

const UserProfileForm = connect(mapStateToProps)(UserProfile);
export { UserProfileForm as UserProfile };
