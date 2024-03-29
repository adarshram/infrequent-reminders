import { useState, useEffect } from 'react';
import useServerCall from './useServerCall';
const useProfileData = () => {
  const [data, setData] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const [errors, setErrors] = useState([]);
  const [listCall, , , loading] = useServerCall('/user/profile');
  useEffect(() => {
    let mounted = true;

    if (refresh) {
      const getResults = async () => {
        try {
          setData(null);
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

  return [data, loading, errors, setRefresh];
};

export default useProfileData;
