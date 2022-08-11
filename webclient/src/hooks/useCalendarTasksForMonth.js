import { useState, useEffect } from 'react';

import useServerCall from './useServerCall';
//import { calendarMockData } from '../components/Schedules/calendarMockData';
const useCalendarTasksForMonth = (parameters) => {
  const [data, setData] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading] = useState(false);
  const [listCall, , , ,] = useServerCall('/user/notifications/fullMonth');
  useEffect(() => {
    let mounted = true;
    if (parameters !== null && parameters?.month) {
      const getResults = async () => {
        var results = await listCall.postAsync(parameters);
        if (mounted) {
          if (results.success) {
            setData(results.data);
          }

          if (!results.success) {
            setData(false);
            setErrors([results.message ? results.message : 'Unable to fetch Month List']);
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

export default useCalendarTasksForMonth;
