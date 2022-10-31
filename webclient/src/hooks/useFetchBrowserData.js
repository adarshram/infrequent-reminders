import { useState, useEffect } from 'react';
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
export default useFetchBrowserData;
