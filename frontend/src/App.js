import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import logo from "./css/logo.png";
import "./App.css";
import { Login } from "./login/Login";
import { Dashboard } from "./dashboard/Dashboard";
import { Router, Route, BrowserRouter } from "react-router-dom";
import { history } from "./_helpers/history";
import { PrivateRoute } from "./_components/PrivateRoute";

class App extends Component {
    constructor(props) {
        super(props);

        history.listen((location, action) => {
            // clear alert on location change
            //this.props.dispatch(alertActions.clear());
        });
    }
    render() {
        return (
            <BrowserRouter>
                <div>
                    <Container className="logo-container">
                        <Row>
                            <div className="logo-img">
                                <a href="/dashboard">
                                    <img
                                        src={logo}
                                        id="logo"
                                        alt="GF Strong Logo"
                                    />
                                </a>
                            </div>
                            <Col id="logo-text">
                                <p className="webName" align="left">
									GF Strong Rehabilitation Centre
                                </p>
                            </Col>
                        </Row>
                    </Container>
                    <Router history={history}>
                        <div className="content">
                            <Route exact path="/" component={Login} />
                            <Route path="/login" component={Login} />
                            <PrivateRoute
                                exact
                                path="/dashboard"
                                component={Dashboard}
                            />
                        </div>
                    </Router>
                </div>
            </BrowserRouter>
        );
    }
}

export default App;
