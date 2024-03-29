import { useState, useEffect } from 'react';
import useServerCall from './useServerCall';
const useCalendarTasksForDay = (parameters) => {
  const [data, setData] = useState(false);
  const [errors, setErrors] = useState([]);
  const [listCall, , , loading] = useServerCall('/user/notifications/listByDate');
  useEffect(() => {
    let mounted = true;
    setData([]);
    if (parameters !== null && parameters?.date) {
      const getResults = async () => {
        var results = await listCall.postAsync(parameters);
        if (mounted) {
          if (results.success) {
            setData(results.data.results);
          }

          if (!results.success) {
            setData(false);
            setErrors([results.message ? results.message : 'Unable to fetch day List']);
          }
        }
      };
      getResults();
    }
    return () => {
      mounted = false;
    };
  }, [parameters, listCall]);

  return [data, loading, errors];
};

export default useCalendarTasksForDay;
