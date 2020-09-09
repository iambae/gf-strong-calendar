import React, { Component } from "react";


class Home extends Component {
    render() {
        return (
            <div>
                <h1>Home</h1>
                <p>
                    Hi! This is the Home page for the GF Strong Calendaring Application.
                    This page will give you updates on the application till the time the
                    application is able to speak for itself. As you can guess, the development has just started.
                    Enjoy navigating!
                </p>
                <br />
                <h2>Release Notes</h2>
                <p>March 15, 2019</p>
                <ul>
                    <li>
                        Login - The login page is currently non-functional. Once we implement the backend, we will send you (yes YOU!) the login credentials.
                    </li>
                    <li>
                        Dashboard - While the login is non-functional, you will direct access to the admin-module.
                        The dashboard features a printable calendar, filter, modals for adding new user and appointment records, and the ability to edit the
                        profile of the logged in user. We are still working on connecting the endpoints to the frontend and so you will not be able to send any API requests.
                    </li>
                </ul>

                <p>March 19, 2019</p>
                <ul>
                    <li>
                        Edit records - We created the form to edit the patient and therapist information. 
                    </li>
                    <li>
                        Dashboard -  Ability to look at all patients and therapists in a table format
                    </li>
                    <li>
                        Filters -  Refactored the filters for a better UI experience.
                    </li>
                    <li>
                        Reporting - Created a dummy structure for the reporting module. 
                    </li>
                </ul>
                <p>March 24, 2019</p>
                <ul>
                    <li>
                        Add patient - You are now able to create patient records. (We are still working on creating alerts for success/error messages after requests)
                    </li>
                    <li>
                        Dashboard - Changed the look and feel of the dashboard.
                    </li>
                    <li>
                        Known issues: We are still working on integrating the backend to the frontend. You will not be able to add therapist/ appointments to the 
                        database yet. Our calendar printing is a bit off, we will fix it asap.
                    </li>
                </ul>
            </div>
        );
    }
}
export default Home;