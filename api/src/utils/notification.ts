import { getMessagingObject } from './firebase';

export const sendNotificationMessageToVapidKey = async (vapidKey, notificationMessage) => {
	let messsagingObject = await getMessagingObject();

	const message = {
		data: {
			notificationMessage: notificationMessage,
		},
		notification: {
			title: 'You have a Notification',
			body: notificationMessage,
		},
		webpush: {
			fcm_options: {
				link: `http://localhost:3006/upcoming`,
			},
		},
		token: vapidKey,
	};
	let success = false;
	let errors = { unregistered: '', code: '' };
	try {
		let sendResults = await messsagingObject.send(message);
		success = true;
		return { success, errors };
	} catch (err) {
		const isTokenUnregistered =
			err.errorInfo && err.errorInfo.code === 'messaging/registration-token-not-registered';
		if (isTokenUnregistered) {
			errors.unregistered = 'Unregistered Token';
		}
		success = false;
		errors.code = err.errorInfo && err.errorInfo.code ? err.errorInfo.code : 'Unknown error';
	}
	return { success, errors };
};
export const sendNotificationEmail = async (email: string, notificationMessage: string) => {
	let nodemailer = require('nodemailer');
	let subject = notificationMessage;
	let body = notificationMessage;
	let transporter = nodemailer.createTransport({
		host: 'smtp.sendgrid.net',
		port: 465,
		secure: true,
		auth: {
			user: 'apikey',
			pass: process.env.SENDGRIDPASSWORD ?? '',
		},
	});
	let success = false;
	let errors = [];
	let mailOptions = {
		from: 'adarsh.developer@gmail.com',
		to: email,
		subject: notificationMessage,
		text: notificationMessage,
	};

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			success = false;
			errors.push(error);
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
			success = true;
			error = [];
		}
	});

	return { success, errors };
};
