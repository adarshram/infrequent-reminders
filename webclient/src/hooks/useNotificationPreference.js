import { useState, useEffect } from 'react';
import useServerCall from './useServerCall';
import { getMessaging, getToken } from 'firebase/messaging';

const useNotificationPreference = (fBaseUser) => {
  ///useState

  const [token, setToken] = useState(
    localStorage.getItem('vapidToken') ? localStorage.getItem('vapidToken') : false,
  );
  const [showNotification, showNotificationData, showNotificationError, showNotificationLoading] =
    useServerCall('/user/notificationPreference/show');
  const [saveNotification, , , saveLoading] = useServerCall('/user/notificationPreference/save');
  const [deleteNotification, , , deleteLoading] = useServerCall(
    '/user/notificationPreference/delete',
  );
  const [errors, setErrors] = useState([]);

  const [currentStatus, setCurrentStatus] = useState(false);

  useEffect(() => {
    if (showNotificationData && showNotificationData.data) {
      setCurrentStatus(true);
    }
    if (!showNotificationData) {
      setCurrentStatus(false);
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

  const getCurrentToken = async () => {
    let currentToken = token;
    if (!currentToken) {
      currentToken = await generateToken();
      if (!currentToken) {
        return false;
      }
      localStorage.setItem('vapidToken', currentToken);
      setToken(currentToken);
    }
    return currentToken;
  };

  const save = async () => {
    //Already Enabled
    setErrors([]);
    if (currentStatus) {
      return;
    }
    if (!fBaseUser) {
      setErrors((prev) => [...prev, 'User Not Signed In']);
      return;
    }
    let currentToken = await getCurrentToken();
    if (!currentToken) {
      setErrors((prev) => [
        ...prev,
        'Notification Blocked. Please clear your browser permissions to enable it',
      ]);
      return;
    }
    try {
      let results = await saveNotification.post({ vapidKey: currentToken });
      if (results && results.data) {
        setCurrentStatus(true);
      }
      localStorage.setItem('vapidToken', currentToken);
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
        localStorage.removeItem('vapidToken');
        setCurrentStatus(false);
      }
    } catch (err) {
      setCurrentStatus(true);
    }
  };
  const isLoading = saveLoading || showNotificationLoading || deleteLoading;
  return [currentStatus, save, remove, isLoading, errors];
};

export default useNotificationPreference;
