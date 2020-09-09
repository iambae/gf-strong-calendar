import React from "react";
import "../css/Table.css";
import { Card, Button } from "react-bootstrap";

class LocationView extends React.Component {
    render() {
        if (this.props.content === null) {
            return (
                <Card className="detail-card">
                    <div className="card">
                        <div className="detail-card-header">
                            <Card.Header>
                                <span id="title">{this.props.title}</span>
                            </Card.Header>
                        </div>
                    </div>
                </Card>
            );
        }
        const LocationRecords = this.props.content.LocationRecords;
        return (
            <Card className="detail-card">
                <div className="card">
                    <div className="detail-card-header">
                        <Card.Header>
                            <span id="title">{this.props.title}</span>
                        </Card.Header>
                    </div>
                    <div className="content">
                        <h3>
                            <b>Location Name: </b>
                            {this.props.content.location}
                        </h3>
                        <h3>
                            <b>Address: </b>
                            {this.props.content.address}
                        </h3>
                    </div>
                    <Button
                        className="btn profile-btn"
                        color="#00afec"
                        size="lg"
                        onClick={() =>
                            this.props.handleEditShow("locationEdit", this.props.content)
                        }>
                        Update Location
                    </Button>
                </div>
            </Card>
        );
    }
}

export default LocationView;
