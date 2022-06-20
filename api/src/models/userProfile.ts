import { getRepository, getManager } from 'typeorm';

import { UserProfile } from '../entity/UserProfile';
import { getMessagingObject, addToCollection, getFireStoreDbObject } from '../utils/firebase';

export const getUserProfileWithId = async (id: string) => {
	const userProfileRepository = await getRepository(UserProfile);
	let userProfile = await userProfileRepository
		.createQueryBuilder('up')
		.where('up.fireBaseRefId = :fireBaseRefId', { fireBaseRefId: id })
		.getOne();

	return userProfile;
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

export const deleteVapidKeyForUser = async (fireBaseRefId: string, vapidKey: string) => {
	const vapidKeyData = await getVapidKeysForUser(fireBaseRefId);

	if (!vapidKeyData) {
		console.log('yo yo');
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
	let res = await addToCollection(
		'UserVapidKeys',
		{
			vapidKeys: updatedVapidKeys,
		},
		vapidKeyData.id,
	);
	return res;
};
