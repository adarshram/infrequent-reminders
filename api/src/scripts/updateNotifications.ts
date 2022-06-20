import { createConnection, getRepository, getManager } from 'typeorm';
import { format, differenceInCalendarDays, subDays } from 'date-fns';

import { UserNotifications } from '../entity/UserNotifications';
import { getMessagingObject } from '../utils/firebase';

export const updateWeeklyNotifications = async (): Promise<any> => {
	let connection = await createConnection();
	const userNotificationsRepository = await connection.getRepository(UserNotifications);
	let today = new Date();
	let lastWeek = subDays(today, 7);

	let notifications = await userNotificationsRepository
		.createQueryBuilder('up')
		.where('up.notification_date >= :startDate', { startDate: lastWeek })
		.where('up.notification_date <= :endDate', { endDate: today })
		.getMany();

	let updatedNotifications = notifications.map(async (notification) => {
		let { frequency_type, frequency, notification_date } = notification;
		let difference = differenceInCalendarDays(today, notification_date);
		//We have due notifications
		if (difference > 1) {
			notification.notification_date = lastWeek;
			console.log(notification.notification_date);
			await userNotificationsRepository.save(notification);
		}
	});
	await connection.close();
	return updatedNotifications;
};

export const sendTestNotifications = async () => {
	return;
	let token =
		'ePXJ_xfJS4qzn6UX9Kig43:APA91bEzEZroPXGYik7zQuqT9DcdN7cPLy2WeEskMSH2ECWIpBKzhiyDrjO8nw0LpfVpn7vpBJ6DDKksjwquBz6rF_GSJ51jSRwNSsgxA5EyQb_12kyMBxLUSUycTlecmQSpfjsHH1nt';
	let registrationTokens = [token];
	//console.log(registrationTokens);

	const topic = 'tester';

	const message = {
		data: {
			score: '850',
			time: '2:45',
		},
		topic: topic,
	};

	try {
		let messsagingObject = await getMessagingObject();

		let sendResults = await messsagingObject.send(message);
		console.log(sendResults);
		return;

		let results = await messsagingObject.subscribeToTopic(registrationTokens, topic);

		console.log(results);
	} catch (err) {
		console.log(err);
	}

	/*getMessaging().subscribeToTopic(registrationTokens, topic)
  .then((response) => {
    // See the MessagingTopicManagementResponse reference documentation
    // for the contents of response.
    console.log('Successfully subscribed to topic:', response);
  })
  .catch((error) => {
    console.log('Error subscribing to topic:', error);
  });*/
};
