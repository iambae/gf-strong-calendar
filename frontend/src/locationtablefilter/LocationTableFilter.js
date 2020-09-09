import React from "react";
import { Row, Col, ButtonToolbar, ToggleButton, ToggleButtonGroup, 
	Navbar, Nav, NavItem, Button, NavDropdown,} from "react-bootstrap";
import "../css/Table.css";

//this.handleMainFilter(module);
class LocationTableFilter extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            filterSearchPlaceholder: "",
            value: "",
        };
        this.handleChange = this.handleChange.bind(this);
    }

	handleSelectFilter = selected => {
	    this.props.setSecondaryFilter(selected);
	    this.setState(() => ({ filterSearchPlaceholder: selected }));
	}

	handleChange(event) {
	    this.setState({ value: event.target.value });
	}

	handleFilterValue = value => {
	    this.props.handleSecondaryFilter(value);
	}

	handleFilterReset = () => {
	    this.props.resetFilters();
	    this.setState(() => ({ filterSearchPlaceholder: "", value: "" }));
	}

	render() {
	    return (
	        <div id="filters" className="filters">
	            <Navbar className="filterbar" bg="light" expand="lg">
	                <Navbar.Toggle aria-controls="basic-navbar-nav" />
	                <Navbar.Collapse id="basic-navbar-nav">
	                    <Nav>
	                        <NavDropdown
	                            title="Search By"
	                            className="search-by"
	                            id="filter-nav-dropdown"
	                            onSelect={selected =>
	                                this.handleSelectFilter(selected)
	                            }>
	                            <NavDropdown.Item eventKey="location">
									Location Name
	                            </NavDropdown.Item>
	                            <NavDropdown.Item eventKey="address">
									Address
	                            </NavDropdown.Item>
	                        </NavDropdown>
	                    </Nav>
	                    <Nav>
	                        <NavItem className="filter-selection">
								{this.state.filterSearchPlaceholder
									.replace("location", "location Name")}
	                        </NavItem>
	                    </Nav>
	                    <input
	                        type="text"
	                        value={this.state.value}
	                        onChange={this.handleChange}
	                    />
	                </Navbar.Collapse>
	                <Button
	                    style={{ backgroundColor: "lightgrey" }}
	                    variant="outline-dark"
	                    onClick={() =>
	                        this.props.handleSecondaryFilter(this.state.value)
	                    }>
						Search
	                </Button>
	                <Button
	                    style={{ backgroundColor: "lightgrey" }}
	                    variant="outline-dark"
	                    onClick={() => this.handleFilterReset()}>
						Reset
	                </Button>
	            </Navbar>
				<Row className="tabler-filter-button-row">
					<Col />
					<ButtonToolbar>
						<ToggleButtonGroup
							type="radio"
							name="options"
							defaultValue={1}>
							<ToggleButton
								variant="secondary"
								value={1}
								onClick={() =>
									this.props.handleArchived("active")
								}>
								View Active
	                        </ToggleButton>
							<ToggleButton
								variant="secondary"
								value={2}
								onClick={() =>
									this.props.handleArchived("archived")
								}>
								View Archived
	                        </ToggleButton>
						</ToggleButtonGroup>
					</ButtonToolbar>
				</Row>
	            <Row />
	        </div>
	    );
	}
}

export default LocationTableFilter;
