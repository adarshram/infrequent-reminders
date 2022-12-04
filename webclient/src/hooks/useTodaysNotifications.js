import { useState, useEffect } from 'react';
import useServerCall from './useServerCall';
//const [todaysNotifications,loading,errors,fetchNotifications] =useTodaysNotifications(true);

const useTodaysNotifications = (loadOnstart) => {
  const [data, setData] = useState(null);
  const [refresh, setRefresh] = useState(loadOnstart ? true : false);
  const [errors, setErrors] = useState([]);
  const [listCall, , , loading] = useServerCall('/user/notifications/today');
  useEffect(() => {
    let mounted = true;
    if (refresh) {
      const getResults = async () => {
        try {
          setData(false);
          var results = await listCall.getAsync();
          if (mounted) {
            if (results.success) {
              setData(results.data);
            }

            if (!results.success) {
              setData(false);
              setErrors([results.message ? results.message : 'Unable to fetch Profile']);
            }
          }
        } catch (e) {
          setData(false);
          setErrors([e.message ? e.message : 'Unable to fetch Profile']);
        }
        setRefresh(false);
      };
      getResults();
    }
    return () => {
      mounted = false;
    };
  }, [refresh, listCall]);
  const refetch = () => {
    setRefresh(true);
  };

  return [data, loading, errors, refetch];
};

export default useTodaysNotifications;
