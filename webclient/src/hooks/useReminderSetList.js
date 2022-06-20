import Axios from 'axios';
import { useState, useEffect } from 'react';
import { reminderSetListFilled } from '../models/mocks/reminderSet';
import useServerCall from './useServerCall';
const useReminderSetList = (parameters) => {
  const [data, setData] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listCall, , , ,] = useServerCall('/user/reminderSet/list');
  useEffect(() => {
    let mounted = true;
    if (parameters !== null) {
      const getResults = async () => {
        var results = await listCall.getAsync();
        if (mounted) {
          if (results.success) {
            setData(results.data);
          }
          if (!results.success) {
            setData(false);
            setErrors([results.message ? results.message : 'Unable to fetch Set List']);
          }
        }
      };
      getResults();
    }
    return () => {
      mounted = false;
    };
  }, [parameters]);

  return [data, loading, errors];
};

export default useReminderSetList;
