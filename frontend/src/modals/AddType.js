import React, { Component } from "react";
import "../css/Global.css";
import { Alert, Button, Col, Form, Container } from "react-bootstrap";
import { connect } from "react-redux";
import { TypeActions } from "../_actions/typeAction";
import { CirclePicker } from "react-color";

export default class AddType extends Component {
    state = {
        code: "",
        description: "",
        category: "",
        colour: "",

        showAlert: false,
        missingColour: true,
    };

    addType = e => {
        if (!this.state.colour) {
            this.setState({showAlert: true, missingColour: true});
            return;
        }

        let obj = {
            type_code: this.state.code,
            description: this.state.description,
            category: this.state.category,
            color: this.state.colour
        };
        this.props.dispatch(TypeActions.createType(obj));
    }

    componentWillReceiveProps = newProps => {
        if ( newProps.addError || newProps.addSuccess || newProps.addLoading ) {
            this.setState({ showAlert: true });
        }
        
        if (newProps.addSuccess) {
            setTimeout(() => {
                this.props.onTypeAdded(15); // Therapy Type table
            }, 600);
        }
    }

    handleChange = event => {
        const { name, value } = event.target;
        this.setState({ [name]: value || "" });
    }

    handleChangeComplete = color => {
        this.setState({ colour: color.hex, missingColour: false });
    }
    
    render = () => {
        const { addError, addSuccess, addLoading } = this.props;
        const handleHide = () => this.setState({ showAlert: false });
        const alertObj = this.state.missingColour ? { variant: "warning", title: "Information is missing, please make sure you select a colour" }
            : addError
                ? { variant: "danger", title: "Adding a therapy type failed!" }
                : addSuccess
                    ? { variant: "success", title: "Adding a therapy type succeeded" }
                    : addLoading ? 
                        { variant: "warning", title: "Loading..." } :
                        null;
       
        return (
            <Container className="form-container">
                {alertObj && <Alert
                    show={this.state.showAlert}
                    className="fixed-top"
                    variant={alertObj.variant}
                    dismissible
                    onClose={handleHide}>
                    {alertObj.title}
                </Alert> }
                <Form>
                    <Form.Row className="inner-row">
                        <p className="form-title">Create New Therapy Type</p>
                    </Form.Row>
                    <Form.Row>
                        <Form.Group as={Col}>
                            <Form.Label className="label">
                                Type Code
                            </Form.Label>
                            <Form.Control
                                name="code"
                                placeholder="Type Code"
                                type="text"
                                required
                                value={this.state.code}
                                autoFocus
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label className="label">
                                Description
                            </Form.Label>
                            <Form.Control
                                name="description"
                                required
                                placeholder="Description"
                                type="text"
                                value={this.state.description}
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                    </Form.Row>
                    <Form.Row>
                        <Form.Group as={Col}>
                            <Form.Label className="label">
                                Category
                            </Form.Label>
                            <Form.Control
                                name="category"
                                placeholder="Category"
                                type="text"
                                required
                                value={this.state.category}
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                        <Form.Group as={Col}>
                            <Form.Label className="label">
                                Colour
                            </Form.Label>
                            <CirclePicker
                                required
                                color={ this.state.colour }
                                onChangeComplete={ this.handleChangeComplete }
                            />
                        </Form.Group>
                    </Form.Row>
                    <Form.Row className="inner-row">
                        <Button
                            className="btn"
                            variant="primary"
                            size="large"
                            onClick={this.addType}>
                            Add Therapy Type
                        </Button>
                    </Form.Row>
                </Form>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    addError: state.types.error,
    addSuccess: state.types.type,
    addLoading: state.types.creating,
});

const AddTypeForm = connect(mapStateToProps)(AddType);
export { AddTypeForm as AddType };
