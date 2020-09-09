'use strict';

const nodemailer = require('nodemailer');
const smtp = require('./config')['smtp'];
module.exports = {
    sendEmail: async function (receiver, type, emailOptions) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: smtp.user,
                pass: smtp.password
            }
        });

        let newUserOptions = {
            subject: 'Welcome to VCH GF Strong Rehabilitation Centre',

            text: `Hi ${emailOptions.name},
            Welcome to VCH GF Strong Rehabilitation Centre.
            The password for your account is: ${emailOptions.password}
            You're receiving this e-mail because an account was created for you at the VCH GF Strong Rehabilitation Centre.`,

            html: `<h4> Hi ${emailOptions.name}, </h4>
            <p> Welcome to VCH GF Strong Rehabilitation Centre. </p>
            <p>Please contact VCH GF Strong Rehabilitation Centre for more details.</p>
            <p>The password for your account is: <b>${emailOptions.password}</b></p>
            <p>You're receiving this e-mail because an account was created for you at the VCH GF Strong Rehabilitation Centre.</p>`
        };

        let newAppointmentOptions = {
            subject: 'New Appointment Scheduled',

            text: `Hi ${emailOptions.name}
            A new appointment has been scheduled for you.
            Date and Time: ${emailOptions.start_time} - ${emailOptions.end_time}
            Please confirm your appointment by calling VCH GF Strong Rehabilitation Centre.`,

            html: `<h4> Hi ${emailOptions.name} </h4>
            <p>A new appointment has been scheduled for you.</p>
            <p><b>Date and Time</b>: ${emailOptions.start_time} - ${emailOptions.end_time}</p>
            <p>Please confirm your appointment by calling VCH GF Strong Rehabilitation Centre.</p>`
        };

        let appointmentUpdateOptions = {
            subject: 'Appointment Update',

            text: `Hi ${emailOptions.name},
            You are receiving this email because one of your appointments has been rescheduled.
            Your appointment at ${emailOptions.old_start_time} has been moved to
            Date and Time: ${emailOptions.start_time} - ${emailOptions.end_time},
            Location: ${emailOptions.location}
            Please confirm your appointment by calling VCH GF Strong Rehabilitation Centre`,

            html: `<h4> Hi ${emailOptions.name} </h4>,
            <p>You are receiving this email because one of your appointments has been rescheduled.</p>
            <p>Your appointment at ${emailOptions.old_start_time} has been moved to
            Date and Time: ${emailOptions.start_time} - ${emailOptions.end_time} at ${emailOptions.location}</p>
            <p>Please confirm your appointment by calling VCH GF Strong Rehabilitation Centre.</p>`
        };

        let appointmentCancelledOptions = {
            subject: 'Appointment Update',

            text: `Hi ${emailOptions.name},
            You are receiving this email because one of your appointments has been cancelled.
            Your appointment at ${emailOptions.old_start_time} has been cancelled due to unforeseen circumastances.
            We are extremely sorry for the inconvenience. Someone from VCH GF Strong will contact you soon to talk about alternative therapy options.`,

            html: `<h4>Hi ${emailOptions.name}, </h4>
            <p>You are receiving this email because one of your appointments has been cancelled.
            Your appointment at ${emailOptions.old_start_time} has been cancelled due to unforeseen circumastances. </p>
            <p>We are extremely sorry for the inconvenience. Someone from VCH GF Strong will contact you soon to talk about alternative therapy options.</p>`
        };

        let mailOptions = {
            from: smtp.user,
            to: receiver,
        };

        if (type == 'appointment_schedule') {
            mailOptions['subject'] = newAppointmentOptions.subject;
            mailOptions['text'] = newAppointmentOptions.text;
            mailOptions['html'] = newAppointmentOptions.html;
        } else if (type == 'appointment_update'){
            mailOptions['subject'] = appointmentUpdateOptions.subject;
            mailOptions['text'] = appointmentUpdateOptions.text;
            mailOptions['html'] = appointmentUpdateOptions.html;
        } else if (type == 'appointment_cancel'){
            mailOptions['subject'] = appointmentCancelledOptions.subject;
            mailOptions['text'] = appointmentCancelledOptions.text;
            mailOptions['html'] = appointmentCancelledOptions.html;
        } else if (type == 'new_user') {
            mailOptions['subject'] = newUserOptions.subject;
            mailOptions['text'] = newUserOptions.text;
            mailOptions['html'] = newUserOptions.html;
        }
        const info = transporter.sendMail(mailOptions);

        return info;
    }
};
