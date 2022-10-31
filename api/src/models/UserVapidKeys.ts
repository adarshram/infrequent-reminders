import { getMessagingObject, addToCollection, getFireStoreDbObject } from '../utils/firebase';
export const deleteForUser = async (fireBaseRefId: string) => {
	const vapidKeyObject = getVapidKeyObject();
	const snapshot = await vapidKeyObject.where('fireBaseRefId', '==', fireBaseRefId).get();

	snapshot.forEach(async (doc) => {
		let data = doc.data();
		await doc.ref.delete();
	});

	return true;
};
export const convertAllKeysToDevices = async () => {
	const vapidKeyObject = getVapidKeyObject();
	const snapshot = await vapidKeyObject.get();
	let results = [];
	snapshot.forEach(async (doc) => {
		let data = doc.data();
		let id = doc.id;
		let convertedData = convertDocToDevice(data);
		let res = await addToCollection(
			'UserVapidKeys',
			{
				created_at: new Date().getDate(),
				fireBaseRefId: data.fireBaseRefId,
				vapidKeys: convertedData.vapidKeys,
				devices: convertedData.devices,
			},
			doc.id,
		);
	});
};

const convertDocToDevice = (data) => {
	let devices = data?.devices ? data.devices : [];
	if (data.vapidKeys) {
		devices = data.vapidKeys.map((vapidKey) => {
			return {
				vapidKey,
				name: 'Unknown Device',
			};
		});
	}
	data.devices = devices;
	return data;
};
export const getKeysForUser = async (fireBaseRefId: string) => {
	const vapidKeyObject = getVapidKeyObject();
	const snapshot = await vapidKeyObject.where('fireBaseRefId', '==', fireBaseRefId).get();
	if (snapshot.empty) {
		return false;
	}
	let results = [];
	snapshot.forEach(async (doc) => {
		let data = doc.data();
		let fullData = {
			id: doc.id,
			...data,
		};
		results.push(fullData);
	});
	return results;
};
export const saveKey = async (fireBaseRefId: string, vapidKey: string, deviceName: string) => {};

export const deleteDeviceForUser = async (fireBaseRefId: string, vapidKey: string) => {
	const userKeys = await getKeysForUser(fireBaseRefId);
	if (!userKeys) {
		return false;
	}
	let vapidKeyData = userKeys[0];
	let existingDevices = userKeys[0]['devices'];
	let updatedDevices = existingDevices.filter((current) => {
		let isCurrentDevice = current.vapidKey === vapidKey;
		return !isCurrentDevice;
	});
	let existingVapidKeys = userKeys[0]['vapidKeys'];
	let updatedVapidKeys = existingVapidKeys.filter((current) => {
		let isCurrentDevice = current === vapidKey;
		return !isCurrentDevice;
	});
	let res = await addToCollection(
		'UserVapidKeys',
		{
			created_at: new Date().getDate(),
			fireBaseRefId: vapidKeyData.fireBaseRefId,
			vapidKeys: updatedVapidKeys,
			devices: updatedDevices,
		},
		vapidKeyData.id,
	);
	return true;
};

export const saveDevicePreference = async (
	fireBaseRefId: string,
	deviceId: string,
	deviceName: string,
	switchValue: boolean,
) => {
	const vapidKeyObject = getVapidKeyObject();
	const userKeys = await getKeysForUser(fireBaseRefId);
	let currentDevice = {
		vapidKey: deviceId,
		name: deviceName,
		enabled: switchValue ? true : false,
	};
	if (!userKeys) {
		let res = await addToCollection(
			'UserVapidKeys',
			{
				created_at: new Date().getDate(),
				fireBaseRefId: fireBaseRefId,
				vapidKeys: [deviceId],
				devices: [currentDevice],
			},
			false,
		);
		return true;
	}
	if (userKeys) {
		let existingDevices = userKeys[0]['devices'];
		let finishedUpdate = false;

		let updatedDevices = existingDevices.map((current) => {
			let isCurrentDevice = current.vapidKey === deviceId;
			if (isCurrentDevice) {
				current.enabled = switchValue;
				current.name = deviceName;
				finishedUpdate = true;
			}
			return current;
		});
		if (!finishedUpdate) {
			updatedDevices = existingDevices.push(currentDevice);
		}
		let vapidKeyData = userKeys[0];
		let res = await addToCollection(
			'UserVapidKeys',
			{
				created_at: new Date().getDate(),
				fireBaseRefId: vapidKeyData.fireBaseRefId,
				vapidKeys: vapidKeyData.vapidKeys,
				devices: vapidKeyData.devices,
			},
			vapidKeyData.id,
		);
		return true;
	}
};

const getVapidKeyObject = () => {
	const db = getFireStoreDbObject();
	const vapidKeyObject = db.collection('UserVapidKeys');
	return vapidKeyObject;
};
