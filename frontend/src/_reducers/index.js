import { combineReducers } from "redux";
import { authentication } from "./authentication.reducer";
import { patients } from "./patient.reducer";
import { reports } from "./report.reducer";
import { therapists } from "./therapist.reducer";
import { appointments } from "./appointment.reducer";
import { clerks } from "./clerk.reducer";
import { types } from "./type.reducer";
import { locations } from "./location.reducer";
import { records } from "./patient.record.reducer";
import { userProfiles } from "./userProfile.reducer";

// This will combine all the reducers. This is how we access them from the state
const rootReducer = combineReducers({
    authentication,
    patients,
    therapists,
    reports,
    appointments,
    clerks,
    types,
    locations,
    records,
    userProfiles
});

export default rootReducer;