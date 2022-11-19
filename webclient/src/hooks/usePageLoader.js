import Axios from 'axios';
import { useState, useEffect } from 'react';

import { getAuth } from 'firebase/auth';

const usePageLoader = () => {
  const [userData, setUserData] = useState(null);
  const auth = getAuth();
  const loading = userData === null;
  useEffect(() => {
    const stateChangedSubscription = auth.onAuthStateChanged(function (user) {
      if (user) {
        Axios.defaults.headers.common['Authorization'] = user.accessToken
          ? `Bearer ${user.accessToken}`
          : ``;
      }
      setUserData(user ? user : false);
    });
    return () => {
      if (stateChangedSubscription) {
        stateChangedSubscription();
      }
    };
  }, [auth]);

  return [userData, loading];
};

export default usePageLoader;
