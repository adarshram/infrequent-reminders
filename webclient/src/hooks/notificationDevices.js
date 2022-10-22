import { useState, useEffect } from 'react';
import useServerCall from './useServerCall';
import { getMessaging, getToken } from 'firebase/messaging';
const generateToken = async () => {
	const messaging = getMessaging();
	try {
		let currentToken = await getToken(messaging, {
			vapidKey:
				'BNFi-j9_4uWYLavwcucIyUFO2-Fu5NLFIeVKC3EwE89wL2pUZLfvnWnE9Rl09hT9MFAxc_ROdIihscngX9Bvk9w',
		});
		return currentToken;
	} catch (err) {
		console.log(err);
	}
	return false;
};
const detectBrowser = () => {
	let userAgent = navigator.userAgent;
	/*let browserName;

  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = 'chrome';
  } else if (userAgent.match(/firefox|fxios/i)) {
    browserName = 'firefox';
  } else if (userAgent.match(/safari/i)) {
    browserName = 'safari';
  } else if (userAgent.match(/opr\//i)) {
    browserName = 'opera';
  } else if (userAgent.match(/edg/i)) {
    browserName = 'edge';
  } else {
    browserName = 'No browser detection';
  }*/
	return userAgent;
};

const useFetchBrowserData = () => {
	const [token, setToken] = useState(false);
	const [browserData, setBrowserData] = useState({});
	const [dataLoaded, setDataLoaded] = useState(false);

	useEffect(() => {
		if (!dataLoaded) {
			const loadToken = async () => {
				let currentToken = await generateToken();
				setToken(currentToken ? currentToken : false);
			};
			const loadBrowserDetails = async () => {
				let browserName = detectBrowser();
				await loadToken();
				setBrowserData({
					name: browserName,
				});
				setDataLoaded(true);
			};

			loadBrowserDetails();
		}
	}, [dataLoaded]);

	return [token, browserData, dataLoaded];
};
export const useNotificationDeviceList = () => {
	const [deviceList, setDeviceList] = useState([]);
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
	const refreshCall = async () => {
		listCall.get();
	};
	const [currentDeviceToken, ,] = useFetchBrowserData();
	const notificationErrors = [];
	return [
		deviceList ? deviceList : [],
		currentDeviceToken,
		hasNotificationEnabled,
		notificationErrors,
		refreshCall,
	];
};
export const useEditNotificationForUser = () => {
	//use server call here
	const [saveCall, , ,] = useServerCall('/user/notificationDevices/saveDevice');
	const [currentDeviceToken, browserData] = useFetchBrowserData();

	const enableDisable = async (deviceId, switchStatus, deviceName) => {
		let isCurrentDevice = currentDeviceToken === deviceId;
		deviceName = isCurrentDevice ? browserData.name : deviceName;
		let res = saveCall.postAsync({
			deviceId: deviceId,
			switchStatus: switchStatus,
			deviceName: deviceName,
		});
		return res;
	};
	return [enableDisable];
};
