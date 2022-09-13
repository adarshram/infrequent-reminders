import { createConnection, getRepository, getManager } from 'typeorm';

import { format, differenceInCalendarDays, subDays } from 'date-fns';
import { NotificationObject } from '../models/UserNotifications';
import {
	saveVapidKeyForUser,
	deleteVapidKeyForUser,
	getUsersWithNotificationPreference,
	getVapidKeysForUser,
	getUserProfileWithId,
	getNotificationPreferenceForUser,
} from '../models/UserProfile';
import { calculateSnoozeDate, calculateNextNotification } from '../utils/dateManipulators';
import { getMessagingObject } from '../utils/firebase';
import MetaNotificationsClass from '../models/MetaNotifications';
import { getPendingNotifications } from '../models/UserNotifications';

export const runDailyCron = async () => {
	let users = await getUsersWithNotificationPreference();
	let sendLog = [];
	let notificationSendLog = await Promise.all(
		users.map(async (user) => {
			let notificationSent = await handleVapidKeyNotificationForUser(user);
			if (notificationSent) {
				return {
					user_id: user.user_id,
					notification_sent: notificationSent,
				};
			}
			if (!notificationSent) {
				notificationSent = await handleEmailNotificationForUser(user.user_id);
				return {
					user_id: user.user_id,
					notification_sent: notificationSent,
				};
			}
			return {
				user_id: user.user_id,
				notification_sent: false,
			};
		}),
	);
	console.log(notificationSendLog);
	return notificationSendLog;
};

const handleVapidKeyNotificationForUser = async (user): Promise<boolean> => {
	let pending = await getPendingNotifications(user.user_id);
	if (pending.length === 0) {
		return true;
	}

	let vapidKeyData = await getVapidKeysForUser(user.user_id);
	let notificationSubject = `You have ${pending.length} Reminders overdue`;
	if (pending.length == 1) {
		notificationSubject = `Your Reminder ${pending[0].subject} is overdue`;
	}
	if (vapidKeyData) {
		let successFulKeys = await Promise.all(
			vapidKeyData.vapidKeys

				.map(async (vapidKey) => {
					let { success, errors } = await sendNotificationMessageToVapidKey(
						vapidKey,
						notificationSubject,
					);
					if (success) {
						return true;
					}
					if (!success) {
						if (typeof errors !== 'boolean' && errors.unregistered && errors.unregistered != '') {
							let res = await deleteVapidKeyForUser(user.user_id, vapidKey);
						}
					}
					return false;
				})
				.filter((v) => v),
		);
		if (successFulKeys.length > 0) {
			return true;
		}
	}
	return false;
};
export const sendNotificationMessageToVapidKey = async (vapidKey, notificationMessage) => {
	let messsagingObject = await getMessagingObject();

	const message = {
		data: {
			notificationMessage: 'Hello',
		},
		notification: {
			title: 'You have a Notification',
			body: notificationMessage,
		},
		webpush: {
			fcm_options: {
				link: `http://localhost:3006/pending`,
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

export const handleEmailNotificationForUser = async (user_id: string): Promise<boolean> => {
	let pending = await getPendingNotifications(user_id);
	if (pending.length === 0) {
		return true;
	}

	let sendEmail = '';
	let notificationPreference = await getNotificationPreferenceForUser(user_id);
	sendEmail =
		notificationPreference.email && notificationPreference.email != ''
			? notificationPreference.email
			: '';
	if (sendEmail === '') {
		let userProfile = await getUserProfileWithId(user_id);
		if (!userProfile.email) {
			return false;
		}
		sendEmail = userProfile.email;
	}

	let notificationSubject = `You have ${pending.length} Reminders overdue`;
	if (pending.length == 1) {
		notificationSubject = `Your Reminder ${pending[0].subject} is overdue`;
	}
	let { success, errors } = await sendNotificationEmail(sendEmail, notificationSubject);
	return success;
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
