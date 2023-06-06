import { getMessagingObject } from './firebase';
import { getCredentialsByKey } from '../models/SystemCredentials';
import { UserNotifications } from '../entity/UserNotifications';

const getUpcomingUrl = async () => {
	const baseUrlData = await getCredentialsByKey('base_url');
	let baseUrl = baseUrlData ? baseUrlData.settings_value : 'http://localhost:3006/';
	return `${baseUrl}/upcoming`;
};
export const sendNotificationToMobileDevice = async (
	deviceKey: string,
	notification: UserNotifications,
) => {
	let messsagingObject = await getMessagingObject();
	const message = {
		data: {
			snooze: 'true',
			done: 'true',
			title: notification.subject,
			body: notification.description,
			notificationId: notification.id,
		},
		notification: {},
	};

	const notification_options = {
		priority: 'high',
		timeToLive: 60 * 60 * 24,
	};
	let success = false;
	let errors = { unregistered: '', code: '' };
	try {
		let sendResults = await messsagingObject.sendToDevice(deviceKey, message, notification_options);
		console.log(sendResults);
		success = true;
		return { success, errors };
	} catch (err) {
		console.log(err);
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
export const sendNotificationMessageToVapidKey = async (vapidKey, notificationMessage) => {
	let messsagingObject = await getMessagingObject();
	let upcomingUrl = await getUpcomingUrl();
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
				link: upcomingUrl,
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
		console.log(err);
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
export const sendNotificationEmail = async (
	email: string,
	notificationMessage: string,
	notificationBody?: string,
) => {
	let nodemailer = require('nodemailer');
	let subject = notificationMessage;
	let body = notificationBody ? notificationBody : notificationMessage;
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
		subject: subject,
		html: body,
	};

	try {
		let emailInfo = await transporter.sendMail(mailOptions);
		console.log(emailInfo);
		success = true;
		errors = [];
	} catch (err) {
		success = false;
		errors = [err.message ? err.message : 'Email Not Sent'];
		errors.push(`Unable to send email to ${email}`);
		console.log(errors);
	}

	return { success, errors };
};
