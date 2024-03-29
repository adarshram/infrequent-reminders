import { useState, useEffect } from 'react';
import useServerCall from './useServerCall';
import useFetchBrowserData from './useFetchBrowserData';

export const useNotificationDeviceList = () => {
	const [deviceList, setDeviceList] = useState([]);
	const [currentDeviceToken, browserData] = useFetchBrowserData();
	const [loaded, setLoaded] = useState(false);

	const [hasNotificationEnabled, setHasNotificationEnabled] = useState(false);
	const [listCall, notificationListResponse, ,] = useServerCall('/user/notificationDevices/list');
	useEffect(() => {
		if (listCall) {
			listCall.get();
		}
	}, [listCall]);

	useEffect(() => {
		setDeviceList([]);

		let hasDevices =
			notificationListResponse &&
			notificationListResponse.data &&
			notificationListResponse.data.devices;
		if (hasDevices) {
			setDeviceList(notificationListResponse.data.devices);
		}
	}, [notificationListResponse]);

	useEffect(() => {
		let hasEnabled = false;

		if (deviceList && deviceList.length) {
			deviceList.map((currentDevice) => {
				if (currentDevice.enabled) {
					hasEnabled = true;
				}
				return currentDevice;
			});
		}
		setHasNotificationEnabled(hasEnabled);
	}, [deviceList]);

	useEffect(() => {
		let hasDeviceList = deviceList && deviceList.length;
		let newDevice;
		if (currentDeviceToken) {
			newDevice = { vapidKey: currentDeviceToken, name: browserData.name, enabled: false };
		}
		if (hasDeviceList && newDevice?.vapidKey) {
			let foundIndex = deviceList.findIndex((current) => {
				return current.vapidKey === currentDeviceToken;
			});
			let notFound = foundIndex === -1;
			if (notFound) {
				let newDeviceList = [...deviceList, newDevice];
				setDeviceList(newDeviceList);
			}
		}
		if (!hasDeviceList && newDevice?.vapidKey) {
			setDeviceList([newDevice]);
		}
	}, [deviceList, browserData, currentDeviceToken]);

	const refreshCall = async () => {
		setLoaded(true);
		listCall.get();
	};

	const notificationErrors = [];
	return [
		deviceList ? deviceList : [],
		currentDeviceToken,
		hasNotificationEnabled,
		notificationErrors,
		refreshCall,
		loaded,
	];
};
export const useEditNotificationForUser = () => {
	//use server call here
	const [saveCall, , ,] = useServerCall('/user/notificationDevices/saveDevices');

	const enableDisable = async (updatedDevices) => {
		let res = await saveCall.postAsync({ deviceList: updatedDevices });
		return res;
	};
	return [enableDisable];
};
