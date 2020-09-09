import React from "react";
import "./DetailCard.css";
import { Card } from "react-bootstrap";
import "../css/Global.css";

class DetailCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

	onProfileUpdateSubmit = event => {
	    event.preventDefault();
	}

	onPasswordSubmit = event => {
	    event.preventDefault();
	}

	render() {
	    return (
	        <Card className="detail-card">
	            <div className="card">
	                <div className="detail-card-header">
	                    <Card.Header>
	                        <span id="title">{this.props.title}</span>
	                    </Card.Header>
	                </div>
	                <div className="content">{this.props.content}</div>
	            </div>
	        </Card>
	    );
	}
}

export default DetailCard;
