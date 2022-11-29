import { getRepository, getManager, MoreThanOrEqual } from 'typeorm';

import { UserProfile } from '../entity/UserProfile';
import { UserNotificationPreference } from '../entity/UserNotificationPreference';
import { getMessagingObject, addToCollection, getFireStoreDbObject } from '../utils/firebase';

export const getUserProfileWithId = async (id: string) => {
	const userProfileRepository = await getRepository(UserProfile);
	let userProfile = await userProfileRepository
		.createQueryBuilder('up')
		.where('up.fireBaseRefId = :fireBaseRefId', { fireBaseRefId: id })
		.getOne();

	return userProfile;
};

export const getUsersWithNotificationPreference = async (): Promise<
	UserNotificationPreference[]
> => {
	let user_notification_preferences = await getRepository(UserNotificationPreference).find({
		where: { user_id: MoreThanOrEqual(1) },
	});
	return user_notification_preferences;
};
export const getNotificationPreferenceForUser = async (
	user_id: string,
): Promise<UserNotificationPreference> => {
	let user_notification_preference = await getRepository(UserNotificationPreference).findOne({
		where: { user_id: user_id },
	});
	return user_notification_preference;
};

const saveVapidKeyToDb = async (user_id: string, vapidKey: string[]) => {
	await deleteNotificationPreferenceForUser(user_id);
	let user_notification_preference = new UserNotificationPreference();
	user_notification_preference.user_id = user_id as string;
	user_notification_preference.vapidkeys = JSON.stringify(vapidKey);
	user_notification_preference.email = '';
	user_notification_preference.created_at = new Date();
	user_notification_preference.updated_at = new Date();
	await getRepository(UserNotificationPreference).save(user_notification_preference);
};

const deleteNotificationPreferenceForUser = async (user_id: string) => {
	let user_notification_preference = await getNotificationPreferenceForUser(user_id);
	if (user_notification_preference) {
		let deleted = await getRepository(UserNotificationPreference).remove(
			user_notification_preference,
		);
		return true;
	}
	return false;
};

export const saveVapidKeyForUser = async (fireBaseRefId: string, vapidKey: string) => {
	let updatedVapidKeys = [vapidKey];
	const vapidKeyData = await getVapidKeysForUser(fireBaseRefId);

	if (vapidKeyData) {
		let hasVapidKey = false;
		if (vapidKeyData.vapidKeys.indexOf(vapidKey) > -1) {
			hasVapidKey = true;
		}
		if (hasVapidKey) {
			return true;
		}
		updatedVapidKeys = [...vapidKeyData.vapidKeys, vapidKey];
	}

	let res = await addToCollection(
		'UserVapidKeys',
		{
			created_at: new Date().getDate(),
			fireBaseRefId: fireBaseRefId,
			vapidKeys: updatedVapidKeys,
		},
		vapidKeyData ? vapidKeyData.id : false,
	);
	await saveVapidKeyToDb(fireBaseRefId, updatedVapidKeys);
	return true;
};

export const searchVapidKeyForUser = async (fireBaseRefId: string, vapidKey: string) => {
	const vapidKeyData = await getVapidKeysForUser(fireBaseRefId);
	if (!vapidKeyData) {
		return false;
	}
	let hasVapidKey = false;

	if (vapidKeyData.vapidKeys.indexOf(vapidKey) > -1) {
		hasVapidKey = true;
	}

	if (hasVapidKey) {
		return true;
	}
	return false;
};

export const getVapidKeysForUser = async (fireBaseRefId: string) => {
	const db = getFireStoreDbObject();
	const vapidKeyObject = db.collection('UserVapidKeys');
	const snapshot = await vapidKeyObject.where('fireBaseRefId', '==', fireBaseRefId).get();
	if (snapshot.empty) {
		return false;
	}
	interface VKeys {
		id: string;
		vapidKeys: Array<any>;
	}

	let vapidKey: VKeys;
	snapshot.forEach((doc) => {
		let data = doc.data();

		vapidKey = {
			vapidKeys: data.vapidKeys,
			id: doc.id,
			...data,
		};
	});
	return vapidKey;
};

export const deleteVapidKeyDocument = async (id: string) => {
	const db = getFireStoreDbObject();
	const vapidKeyObject = db.collection('UserVapidKeys');
	const docToDelete = await vapidKeyObject.doc(id).get();
	await docToDelete.ref.delete();
};

export const deleteVapidKeyForUser = async (fireBaseRefId: string, vapidKey: string) => {
	const vapidKeyData = await getVapidKeysForUser(fireBaseRefId);

	if (!vapidKeyData) {
		return false;
	}

	let hasVapidKey = false;
	if (vapidKeyData.vapidKeys.indexOf(vapidKey) > -1) {
		hasVapidKey = true;
	}

	if (!hasVapidKey) {
		return true;
	}
	const updatedVapidKeys = vapidKeyData.vapidKeys.filter((currentKey) => {
		const hasMatched = currentKey == vapidKey;
		return !hasMatched;
	});

	let hasNoVapidKeys = updatedVapidKeys.length == 0;
	if (hasNoVapidKeys) {
		await deleteVapidKeyDocument(vapidKeyData.id);
		await deleteNotificationPreferenceForUser(fireBaseRefId);
		return true;
	}

	let res = await addToCollection(
		'UserVapidKeys',
		{
			vapidKeys: updatedVapidKeys,
		},
		vapidKeyData.id,
	);
	return res;
};

export const sendNotificationToVapidKey = async (vapidKey, notification) => {
	let messsagingObject = await getMessagingObject();
	let { id, user_id, subject, notification_date } = notification;
	let notificationMessage = `Your reminder ${subject} is due today`;
	let success = false;
	let errors = [];
	const message = {
		notification: {
			title: 'You have a Notification',
			body: notificationMessage,
		},
		webpush: {
			fcm_options: {
				link: `http://localhost:3006/create/${id}`,
			},
		},
		token: vapidKey,
	};
	try {
		let sendResults = await messsagingObject.send(message);
		success = true;
		return { success: success, errors: errors };
	} catch (err) {
		const isTokenUnregistered =
			err.errorInfo && err.errorInfo.code === 'messaging/registration-token-not-registered';
		if (isTokenUnregistered) {
			let res = await deleteVapidKeyForUser(user_id, vapidKey);
			if (res) {
				console.log(`Deleted Vapid Key ${vapidKey}`);
				success = false;
				errors = ['Token Not Registered'];
				return { success: success, errors: errors };
			}
		}

		const isTokenInvalid = err.errorInfo && err.errorInfo.code === 'messaging/invalid-argument';
		if (isTokenInvalid) {
			success = false;
			errors = ['Invalid Token'];
			return { success: success, errors: errors };
		}
		success = false;
		errors = [err?.errorInfo?.message ?? 'Unknown Error'];
		return { success: success, errors: errors };
	}
};

export const createUserInDbFromFireBase = async (fbAuthUser) => {
	let userProfile = new UserProfile();
	userProfile.first_name = fbAuthUser.displayName ?? '';
	userProfile.last_name = fbAuthUser.displayName ?? '';
	userProfile.email = fbAuthUser.email;
	userProfile.fireBaseRefId = fbAuthUser.uid;
	userProfile.created_at = new Date();
	userProfile.updated_at = new Date();
	const userProfileRepository = await getRepository(UserProfile);
	const result = await userProfileRepository.save(userProfile);
	return result;
};
