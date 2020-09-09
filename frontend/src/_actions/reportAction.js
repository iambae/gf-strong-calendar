import { GET_SUCCESS, GET_REQUEST, GET_FAILURE} from "../_constants/record.constants";
import { ReportService } from "../_services/report.service";
export const ReportActions = {
    generateSummaryReport,
    generatePatientReports
};

function generatePatientReports(patientID, startDate, endDate) {
    return dispatch => {
        dispatch(request({ }));
        ReportService.generateSupportPersonnelReport(patientID)
            .then(
                supportPersonnel => {
                    ReportService.generatePatientTherapyReport(patientID, startDate, endDate)
                        .then(
                            patientTherapy => {
                                ReportService.generateTherapyIntensityReport(patientID)
                                    .then(
                                        patientIntensity => {
                                            let report = {
                                                support_personnel: supportPersonnel,
                                                patient_therapy: patientTherapy,
                                                patient_intensity: patientIntensity
                                            };
                                            dispatch(success(report));
                                        },
                                        error => {
                                            dispatch(failure(error.toString()));
                                        });
                            },
                            error => {
                                dispatch(failure(error.toString()));
                            }
                        );
                },
                error => {
                    dispatch(failure(error.toString()));
                }
            );
    };
    // TODO: Check these
    function request(report) { return {type: GET_REQUEST, report}; }
    function success(report) { return {type: GET_SUCCESS, report}; }
    function failure(error) { return {type: GET_FAILURE, error}; }
}

// function generateSupportPersonnelReport(patientID) {
//     return dispatch => {
//         dispatch(request({ }));
//         ReportService.generateSupportPersonnelReport(patientID)
//             .then(
//                 report => {
//                     dispatch(success(report));
//                 },
//                 error => {
//                     dispatch(failure(error.toString()));
//                     // TODO: maybe add alertAction to dispatch
//                 }
//             );
//     };
//     // TODO: Check these
//     function request(report) { return {type: GET_REQUEST, report}; }
//     function success(report) { return {type: GET_SUCCESS, report}; }
//     function failure(error) { return {type: GET_FAILURE, error}; }
// }

// function generatePatientTherapyReport(patientID, startDate, endDate) {
//     return dispatch => {
//         dispatch(request({ }));
//         ReportService.generatePatientTherapyReport(patientID, startDate, endDate)
//             .then(
//                 report => {
//                     dispatch(success(report));
//                 },
//                 error => {
//                     dispatch(failure(error.toString()));
//                     // TODO: maybe add alertAction to dispatch
//                 }
//             );
//     };
//     // TODO: Check these
//     function request(report) { return {type: GET_REQUEST, report}; }
//     function success(report) { return {type: GET_SUCCESS, report}; }
//     function failure(error) { return {type: GET_FAILURE, error}; }
// }

// function generateTherapyIntensityReport(patientID) {
//     return dispatch => {
//         dispatch(request({ }));
//         ReportService.generateTherapyIntensityReport(patientID)
//             .then(
//                 report => {
//                     dispatch(success(report));
//                 },
//                 error => {
//                     dispatch(failure(error.toString()));
//                     // TODO: maybe add alertAction to dispatch
//                 }
//             );
//     };
//     // TODO: Check these
//     function request(report) { return {type: GET_REQUEST, report}; }
//     function success(report) { return {type: GET_SUCCESS, report}; }
//     function failure(error) { return {type: GET_FAILURE, error}; }
// }

function generateSummaryReport(startDate, endDate) {
    return dispatch => {
        dispatch(request({ }));
        ReportService.generateSummaryReport(1, startDate, endDate)
            .then(
                categoryOne => {
                    ReportService.generateSummaryReport(2, startDate, endDate)
                        .then(
                            categoryTwo => {
                                ReportService.generateSummaryReport(3, startDate, endDate)
                                    .then(
                                        categoryThree => {
                                            let report = {categories: [categoryOne, categoryTwo, categoryThree]};
                                            dispatch(success(report));
                                        },
                                        error => {
                                            dispatch(failure(error.toString()));
                                        });
                            },
                            error => {
                                dispatch(failure(error.toString()));
                            }
                        );
                },
                error => {
                    dispatch(failure(error.toString()));
                }
            );
    };
    // TODO: Check these
    function request(report) { return {type: GET_REQUEST, report}; }
    function success(report) { return {type: GET_SUCCESS, report}; }
    function failure(error) { return {type: GET_FAILURE, error}; }
}
