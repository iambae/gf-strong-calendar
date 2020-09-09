import React from "react";
import { Alert, Button, Col, Form, Container } from "react-bootstrap";
import "../css/Global.css";
import AreYouSure from "../modals/AreYouSure";
import _ from "lodash";
import { connect } from "react-redux";
import { TypeActions } from "../_actions/typeAction";
import { CirclePicker } from "react-color";

class EditTypeForm extends React.Component {
    state = {
        code: "",
        description: "",
        category: "",
        colour: "",

        showAlert: false,
        archiveClicked: false
    };

    updateType = e => {
        let obj = {
            type_code: this.state.code, 
            description: this.state.description, 
            category: this.state.category,
            color: this.state.colour,
            type_id: this.props.selected.typeId
        };
        this.props.dispatch(TypeActions.updateType(obj));
    }

    componentWillReceiveProps = newProps => {
        if ( newProps.updateError || newProps.updateSuccess || newProps.updateLoading ) {
            this.setState({ showAlert: true });
        }
        
        if (newProps.updateSuccess) {
            setTimeout(() => {
                this.props.onTypeUpdated(15); // Therapy Type table
            }, 600);
        }
    }

    componentDidMount = () => {
        this.setState(({
            code: this.props.selected.typeCode,
            description: this.props.selected.description,
            category: this.props.selected.category,
            colour: this.props.selected.color
        }));
    }

    handleChange = event => {
        const { name, value } = event.target;
        this.setState({ [name]: value || "" });
    }

    handleChangeComplete = color => {
        this.setState({ colour: color.hex });
    }
    
    archive = () => {
        this.props.dispatch(TypeActions.archiveType(this.props.selected.typeId));
    }

    render = () => {
        const { updateError, updateSuccess, updateLoading } = this.props;
        const handleHide = () => this.setState({ showAlert: false });
        const alertObj = updateError
            ? { variant: "danger", title: "Updating a therapy type failed!" }
            : updateSuccess
                ? { variant: "success", title: "Updating a therapy type succeeded" }
                : updateLoading ? { variant: "warning", title: "Loading..." } : null;
       
        return (
            <Container className="form-container">
                { this.state.archiveClicked &&
                    <AreYouSure
                        onHide={ () => {this.setState(() => ({ archiveClicked: false }));} }
                        onConfirm={this.archive}
                        modalBody={<h5>Please confirm to archive this therapy type</h5>}
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
                        <p className="form-title">Update A Therapy Type</p>
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
                                color={ this.state.colour }
                                onChangeComplete={ this.handleChangeComplete }
                            />
                        </Form.Group>
                    </Form.Row>
                    <Form.Row className="inner-row">
                        <Button
                            className="btn"
                            variant="danger"
                            size="large"
                            onClick={ () => {this.setState(() => ({ archiveClicked: true }));} }>
                            Archive Therapy Type
                        </Button>
                        <Button
                            className="btn"
                            variant="primary"
                            size="large"
                            onClick={this.updateType}>
                            Update Therapy Type
                        </Button>
                    </Form.Row>
                </Form>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    updateError: state.types.error,
    updateSuccess: state.types.updatedType,
    updateLoading: state.types.updating,
});

const EditTypeFormConnected = connect(mapStateToProps)(EditTypeForm);
export { EditTypeFormConnected as EditTypeForm };
