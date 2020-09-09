import React from "react";
import "../css/Table.css";
import { Card, Button } from "react-bootstrap";

class UserView extends React.Component {
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
        const PatientRecords = this.props.content.PatientRecords;
        if (this.props.content.userType === "patient") {
            return (
                <Card className="detail-card">
                    <div className="card" id="user-view">
                        <div className="detail-card-header">
                            <Card.Header>
                                <span id="title">{this.props.title}</span>
                            </Card.Header>
                        </div>
                        <div className="content">
                            <h3>
                                <b>Name: </b>
                                {this.props.content.firstName}{" "}
                                {this.props.content.middleName}{" "}
                                {this.props.content.lastName}
                            </h3>
                            <h3>
                                <b>Date of Birth: </b>
                                {this.props.content.dateOfBirth}
                            </h3>
                            <h3>
                                <b>User Type: </b>
                                {this.props.content.userType}
                            </h3>
                            <h3>
                                <b>Email: </b>
                                {this.props.content.email}
                            </h3>
                            <h3>
                                <b>Contact Number: </b>
                                {this.props.content.contactNumber}
                            </h3>
                            <h3>
                                <b>Patient Number: </b>
                                {this.props.content.patientNumber}
                            </h3>
                            <h3>
                                <b>Most Recent Patient Program: </b>
                                {
                                    PatientRecords[0].program
                                }
                            </h3>
                            <h3>
                                <b>Most Recent Patient Category: </b>
                                {
                                    PatientRecords[0].category
                                }
                            </h3>
                            <h3>
                                <b>Most Recent Diagnosis: </b>
                                {
                                    PatientRecords[0].diagnosis
                                }
                            </h3>
                            <h3>
                                <b>Most Recent Admission Date: </b>
                                {
                                    PatientRecords[0].admissionDate
                                }
                            </h3>
                            <h3>
                                <b>Most Recent Discharge Date: </b>
                                {
                                    PatientRecords[0].dischargeDate
                                }
                            </h3>
                        </div>
                        <Button
                            className="btn profile-btn"
                            color="#00afec"
                            size="lg"
                            onClick={() =>
                                this.props.handleEditShow("patientEdit", this.props.content)
                            }>
							Update User
                        </Button>
                    </div>
                </Card>
            );
        }
        else if (this.props.content.userType === "therapist") {
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
                                <b>Name: </b>
                                {this.props.content.firstName}{" "}
                                {this.props.content.middleName}{" "}
                                {this.props.content.lastName}
                            </h3>
                            <h3>
                                <b>Date of Birth: </b>
                                {this.props.content.dateOfBirth}
                            </h3>
                            <h3>
                                <b>User Type: </b>
                                {this.props.content.userType}
                            </h3>
                            <h3>
                                <b>Email: </b>
                                {this.props.content.email}
                            </h3>
                            <h3>
                                <b>Contact Number: </b>
                                {this.props.content.contactNumber}
                            </h3>
                            <h3>
                                <b>Therapist Code: </b>
                                {this.props.content.code}
                            </h3>
                            <h3>
                                <b>Therapy Type: </b>
                                {this.props.content.types
                                    .map(m => m.label)
                                    .join(" ")}
                            </h3>
                        </div>
                        <Button
                            className="btn profile-btn"
                            color="#00afec"
                            size="lg"
                            onClick={() =>
                                this.props.handleEditShow("therapistEdit", this.props.content)
                            }>
                            Update User
                        </Button>
                    </div>
                </Card>
            );
        }
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
                            <b>Name: </b>
                            {this.props.content.firstName}{" "}
                            {this.props.content.middleName}{" "}
                            {this.props.content.lastName}
                        </h3>
                        <h3>
                            <b>Date of Birth: </b>
                            {this.props.content.dateOfBirth}
                        </h3>
                        <h3>
                            <b>User Type: </b>
                            {this.props.content.userType}
                        </h3>
                        <h3>
                            <b>Email: </b>
                            {this.props.content.email}
                        </h3>
                        <h3>
                            <b>Contact Number: </b>
                            {this.props.content.contactNumber}
                        </h3>
                    </div>
                    <Button
                        className="btn profile-btn"
                        color="#00afec"
                        size="lg"
                        onClick={() =>
                            this.props.handleEditShow("clerkEdit", this.props.content)
                        }>
                        Update User
                    </Button>
                </div>
            </Card>
        );
    }
}

export default UserView;
