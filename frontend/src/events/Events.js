import moment from "moment";

const separator = ": ";

export default [
    {
        id: "0",
        start: moment("2019-03-26").set({h: 8, m: 15}).toDate(),
        end: moment("2019-03-26").set({h: 10, m: 30}).toDate(),
        // Do not use start and end below to test during weekends 
        //start: moment().toDate(),
        //end: moment().toDate(),
        therapyType: "PT",
        patient: ["Patient 1", "Patient 2"],
        therapist: ["Therapist 1"],
        location: "Room X",
        get title() {
            return this.therapyType + separator + this.patient;
        }
    },
    {
        id: "1",
        start: moment("2019-03-26").set({h: 12, m: 0}).toDate(),
        end: moment("2019-03-26").set({h: 13, m: 0}).toDate(),
        // Do not use start and end below to test during weekends 
        //start: moment().set({h: 12, m: 0}).toDate(),
        //end: moment().set({h: 13, m: 0}).toDate(),
        therapyType: "ST",
        patient: ["Patient 2"],
        therapist: ["Therapist 3"],
        location: "Room Y",
        get title() {
            return this.therapyType + separator + this.patient;
        }
    },
    {
        id: "2",
        start: moment("2019-03-25").set({h: 15, m: 0}).toDate(),
        end: moment("2019-03-25").set({h: 17, m: 0}).toDate(),
        // Do not use start and end below to test during weekends 
        //start: moment().set({h: 15, m: 0}).subtract(1, "day").toDate(),
        //end: moment().set({h: 17, m: 0}).subtract(1, "day").toDate(),
        therapyType: "OT",
        patient: ["Patient 3"],
        therapist: ["Therapist 2", "Therapist 3"],
        location: "Room Z",
        get title() {
            return this.therapyType + separator + this.patient;
        }
    }
];
