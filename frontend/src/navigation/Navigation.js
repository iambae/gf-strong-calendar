import React from "react";
import Dropdown from "../dropdown/Dropdown";
import { Col, Navbar, Nav } from "react-bootstrap";
import "./Navigation.css";
import ReportDropdown from "../reports/ReportDropdown";
import AccountDropdown from "../profile/AccountDropdown";

class Navigation extends React.Component {
	renderLeftModules = () => {
		const module_styles = [
			{
				icon: "fas fa-user fa-lg",
				title: "Patient",
			},
			{
				icon: "fas fa-user-md fa-lg",
				title: "Therapist",
			},
			{
				icon: "fas fa-user-cog fa-lg",
				title: "Clerk",
			},
			{
				icon: "fas fa-calendar-check fa-lg",
				title: "Appointment",
			},
			{
				icon: "fas fa-table fa-lg",
				title: "Users",
			},
			{
				icon: "fas fa-book fa-lg",
				title: "Report",
			},
		];

		const modules = module_styles.map((module, key) => {
			return (
				this.props.userPermissions.includes(
					module.title.toLowerCase()
				) && (
					<div key={key} className="module">
						<i className={module.icon} />
						{this.renderModules(module, key)}
					</div>
				)
			);
		});

		return modules;
	}

	renderModules = (module, key) => {
		if (module.title === "Report") {
			return (
				<ReportDropdown
					module={module.title}
					handleShow={this.props.handleShow}
				/>
			);
		} else if (module.title === "Users") {
			return (
				<Dropdown
					module={module.title}
					handleShow={this.props.handleShow}
				/>
			);
		} else if (module.title === "Clerk") {
			return (
				<Dropdown
					module={module.title}
					handleAddShow={this.props.handleAddShow}
					handleEditShow={this.props.handleEditShow}
				/>
			);
		} else {
			return (
				<Dropdown
					module={module.title}
					handleShow={this.props.handleShow}
					handleAddShow={this.props.handleAddShow}
					handleEditShow={this.props.handleEditShow}
				/>
			);
		}
	}

	renderRightModules = () => {
		const module_styles = [
			{
				icon: "far fa-calendar-alt fa-lg",
				title: "Calendar",
			},
			{
				icon: "fas fa-address-card fa-lg",
				title: "Account",
			},
		];

		const modules = module_styles.map((module, index) => {
			return (
				<div key={index} className="module">
					<i className={module.icon} />
					<Nav style={{ marginRight: "20px" }}>
						{module.title === "Account" ? (
							<AccountDropdown
								showProfile={this.props.userPermissions.includes(
									"profile"
								)}
								handleShow={this.props.handleShow}
							/>
						) : (
								<Nav.Link
									onClick={() => this.props.handleToggle(index)}>
									{module.title}
								</Nav.Link>
							)}
					</Nav>
				</div>
			);
		});

		return modules;
	}

	render() {
		return (
			<Col>
				<Navbar className="navbar" variant="light" expand="lg">
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="mr-auto">
							{this.renderLeftModules()}
							{this.renderRightModules()}
						</Nav>
					</Navbar.Collapse>
				</Navbar>
			</Col>
		);
	}
}

export default Navigation;
