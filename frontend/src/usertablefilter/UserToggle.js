import React from "react";
import { ToggleButton, ToggleButtonGroup, ButtonToolbar } from "react-bootstrap";
import "../css/Table.css";

//this.handleMainFilter(module);
class UserToggle extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            value: (this.props.module === "patient" ? 2 : 1),
            previous: this.props.module,
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(newValue) {
        this.setState({ value: newValue });
        if (newValue === 1) {
            this.props.handleMainFilter('all');
        } else if (newValue === 2) {
            this.props.handleMainFilter('patient');
        } else if (newValue === 3) {
            this.props.handleMainFilter('therapist');
        } else if (newValue === 4) {
            this.props.handleMainFilter('clerk');
        }
    }

    render() {
        if (this.props.module !== this.state.previous) {
            this.setState({ previous: this.props.module });
            if (this.props.module === "patient") {
                this.handleChange(2);
            } else if (this.props.module === "therapist") {
                this.handleChange(3);
            } else if (this.props.module === "clerk") {
                this.handleChange(4);
            }
        }
        return (
            <ButtonToolbar>
                <ToggleButtonGroup type="radio" name="usertype options" value={this.state.value} onChange={() => this.handleChange(this.state.value)}>
                    <ToggleButton variant="secondary" value={1} onClick={() => this.handleChange(1)}>All</ToggleButton>
                    <ToggleButton variant="secondary" value={2} onClick={() => this.handleChange(2)}>Patients</ToggleButton>
                    <ToggleButton variant="secondary" value={3} onClick={() => this.handleChange(3)}>Therapists</ToggleButton>
                    <ToggleButton variant="secondary" value={4} onClick={() => this.handleChange(4)}>Clerks</ToggleButton>
                </ToggleButtonGroup>
            </ButtonToolbar>
        );
    }
}

export default UserToggle;
