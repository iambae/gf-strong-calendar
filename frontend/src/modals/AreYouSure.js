import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Col, Row } from "react-bootstrap";
import "./AreYouSure.css";
import "../css/Global.css";

class AreYouSure extends Component {
	state = {
	    show: true,
	}

	handleClose = () => {
	    this.setState(() => ({
	        show: false,
	    }));

	    this.props.onHide(); // cancel operation
	}

	handleConfirm = () => {
	    this.setState({
	        show: false,
	    });
	    this.props.onConfirm();
	}

	render() {
	    return (
	        <Modal centered show={this.state.show} onHide={this.handleClose}>
	            <Modal.Header closeButton>
	                <Modal.Title>Are you sure?</Modal.Title>
	            </Modal.Header>
	            <Modal.Body>
	                <Row>
	                    <Col> {this.props.modalBody} </Col>
	                </Row>
	                <Row className="inner-row-btn">
	                    <div className="inner-row-col">
	                        <Button
	                            className="btn"
	                            variant="secondary"
	                            size="large"
	                            onClick={this.handleClose}>
								Cancel
	                        </Button>
	                    </div>
	                    <div className="inner-row-col">
	                        <Button
	                            className="btn"
	                            variant="danger"
	                            size="large"
	                            onClick={this.handleConfirm}>
								Confirm
	                        </Button>
	                    </div>
	                </Row>
	            </Modal.Body>
	        </Modal>
	    );
	}
}
export default AreYouSure;
