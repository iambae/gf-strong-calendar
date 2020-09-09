import React, { Component } from "react";
import { Button, Form, Alert } from "react-bootstrap";
import { connect } from "react-redux";
import { AuthActions } from "../_actions/authAction";
import { history } from "../_helpers/history";
import "./Login.css";

class Login extends Component {
    constructor(props) {
        super(props);

        // reset login
        this.props.dispatch(AuthActions.logout());

        this.state = {
            email: "",
            password: "",
            forgot: false,
            isValid: false,
            showAlert: false
        };
    }

    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value,
        });
    }

    handleSubmit = event => {
        event.preventDefault();
        this.setState({
	        [event.target.id]: event.target.value,
	    });
        
        // dispatch to Redux store if form is valid
        if (this.validateForm) {
            this.props.dispatch(
                AuthActions.login(this.state.email, this.state.password)
            );
        }
    }

    componentDidMount = () => {
        if (this.props.loggedIn) 
            history.push({
                pathname: "/dashboard",
                state: { user: this.props.user, loggedIn: true }
            });
    }

    componentWillReceiveProps = newProps => {
        const showToast = newProps.loading || newProps.error;
        this.setState({ showAlert: showToast });

        if (newProps.loggedIn)
            history.push({
                pathname: "/dashboard",
                state: { user: this.props.user, loggedIn: true }
            });
    };

    handleForgotClick = event => {
        this.setState(prevState => {
            return {
                email: "",
                password: "",
                forgot: !prevState.forgot,
                isValid: false,
            };
        });
    }

    validateForm = () => {
        let emailRegex = /^[a-z0-9!#$%&"*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&"*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
        let validEmailFormat = emailRegex.test(this.state.email);
        let validEmailLength = this.state.email.length > 0;
        let validEmail = validEmailFormat && validEmailLength;

        if (this.state.forgot) return validEmail;
        return validEmail && this.state.password.length > 0;
    }

    // TODO: send password reset link to email when submit button is clicked
    // handle with NodeJS using Nodemailer and JWT
    sendResetEmail = () => {}

    renderForgotForm() {
        return (
            <Form onSubmit={this.sendResetEmail}>
                <h3 className="login-message">
                    We will send a password reset confirmation link to your
                    email.
                </h3>
                <br />
                <Form.Group controlId="email" size="large">
                    <Form.Label className="label email">
                        Email Address
                    </Form.Label>
                    <Form.Control
                        className="form-control"
                        placeholder="Email"
                        autoFocus
                        type="email"
                        value={this.state.email}
                        onChange={this.handleChange}
                    />
                </Form.Group>
                <Button
                    className="btn"
                    size="large"
                    disabled={!this.validateForm()}
                    variant="info"
                    type="submit"
                    block>
                    Send reset link
                </Button>
                <Button
                    className="btn"
                    size="large"
                    onClick={this.handleForgotClick}
                    variant="secondary"
                    type="submit"
                    block>
                    Back to Login
                </Button>
            </Form>
        );
    }

    renderLoginForm() {
        const {loading, error} = this.props;
        const handleHide = () => this.setState({ showAlert: false });
        const alertObj = error
            ? { variant: "danger", title: "Login failed!" }
            : loading ?
                { variant: "warning", title: "Loading..." } :
                null;
        let alert = null;
        if (alertObj) {
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

        return (
            <React.Fragment>
                {alert}
                <div className="login-window">
                    <Form onSubmit={this.handleSubmit}>
                        <h1 className="login-message">Welcome Back</h1>
                        <br />
                        <Form.Group controlId="email" size="large">
                            <Form.Label className="label email">
                            Email Address
                            </Form.Label>
                            <Form.Control
                                className="form-control"
                                placeholder="Email"
                                autoFocus
                                type="email"
                                value={this.state.email}
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="password" size="large">
                            <Form.Label className="label password">
                            Password
                            </Form.Label>
                            <Form.Control
                                className="form-control"
                                placeholder="Password"
                                type="password"
                                value={this.state.password}
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                        <Button
                            className="btn"
                            variant="info"
                            size="large"
                            disabled={!this.validateForm()}
                            type="submit"
                            block>
                        Sign In
                        </Button>
                        <Button
                            className="btn"
                            variant="danger"
                            size="large"
                            onClick={this.handleForgotClick}
                            block>
                        Forgot Password?
                        </Button>
                    </Form>
                </div>
            </React.Fragment>
        );
    }

    render() {
        return (
            <div className="login-window">
                {this.state.forgot
                    ? this.renderForgotForm()
                    : this.renderLoginForm()}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    loading: state.authentication.loggingIn,
    loggedIn: state.authentication.loggedIn,
    user: state.authentication.user,
    error: state.authentication.error
});
const connectedLogin = connect(mapStateToProps)(Login);
export { connectedLogin as Login };
