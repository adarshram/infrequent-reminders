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

const useNotificationPreferences = (fBaseUser) => {
  ///useState

  const [token, browserData, browserDataLoaded] = useFetchBrowserData();
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [showNotification, showNotificationData, showNotificationError, showNotificationLoading] =
    useServerCall('/user/notificationPreference/show');
  const [saveNotification, , , saveLoading] = useServerCall('/user/notificationPreference/save');
  const [deleteNotification, , , deleteLoading] = useServerCall(
    '/user/notificationPreference/delete',
  );
  const [errors, setErrors] = useState([]);

  const [currentStatus, setCurrentStatus] = useState(false);

  useEffect(() => {
    setCurrentStatus(false);
    if (showNotificationData && showNotificationData.data) {
      setCurrentStatus(true);
    }
    if (!showNotificationData) {
    }
  }, [showNotificationData]);

  useEffect(() => {
    if (
      token &&
      showNotificationLoading === false &&
      showNotificationError === false &&
      showNotificationData === false
    ) {
      showNotification.post({ vapidKey: token });
    }
  }, [
    token,
    showNotification,
    showNotificationLoading,
    showNotificationError,
    showNotificationData,
  ]);

  const save = async () => {
    setErrors([]);
    //Already Enabled
    if (currentStatus) {
      return;
    }
    if (!fBaseUser) {
      setErrors((prev) => [...prev, 'User Not Signed In']);
      return;
    }

    let currentToken = token;
    if (!currentToken) {
      setErrors((prev) => [
        ...prev,
        'Notification Blocked. Please clear your browser permissions to enable it',
      ]);
      return;
    }
    try {
      let results = await saveNotification.post({
        vapidKey: currentToken,
        browserData: browserData,
      });
      if (results && results.data) {
        setCurrentStatus(true);
      }
    } catch (err) {
      console.log('something went wrong');
      setErrors((prev) => [...prev, 'Unknown Error']);
      setCurrentStatus(false);
    }
  };

  const remove = async () => {
    //Already Disabled

    if (!currentStatus) {
      return;
    }

    try {
      let results = await deleteNotification.post({ vapidKey: token });
      if (results && results.data) {
        setCurrentStatus(false);
      }
    } catch (err) {
      setCurrentStatus(true);
    }
  };
  const isLoading = saveLoading || showNotificationLoading || deleteLoading;
  return [currentStatus, save, remove, isLoading, errors];
};

export default useNotificationPreferences;
