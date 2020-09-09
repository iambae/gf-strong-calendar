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

        const colorStyle = {
            background: this.props.content.color
        };
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
                            <b>Type Code: </b>
                            {this.props.content.typeCode}
                        </h3>
                        <h3>
                            <b>Description: </b>
                            {this.props.content.description}
                        </h3>
                        <h3>
                            <b>Category: </b>
                            {this.props.content.category}
                        </h3>
                        <h3 style={colorStyle}>
                            <b>Color: </b>
                            {this.props.content.color}
                        </h3>
                    </div>
                    <Button
                        className="btn profile-btn"
                        color="#00afec"
                        size="lg"
                        onClick={() =>
                            this.props.handleEditShow("typeEdit", this.props.content)
                        }>
                        Update Therapy Type
                    </Button>
                </div>
            </Card>
        );
    }
}

export default LocationView;
