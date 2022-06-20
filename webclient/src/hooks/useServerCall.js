import Axios from 'axios';
import { useState, useEffect } from 'react';
const useServerCall = (endPoint) => {
  const [response, setResponse] = useState(false);
  const [data, setData] = useState(false);
  const [errors, setErrors] = useState(false);
  const [loading, setLoading] = useState(false);

  const post = async (parameters) => {
    setLoading(true);
    setResponse(false);
    setErrors(false);
    setData(false);

    try {
      let res = await Axios.post(endPoint, parameters);
      setResponse(res.data ? res.data : []);
      setLoading(false);
      return res.data;
    } catch (e) {
      setErrors(e.message ? e.message : 'Error Occured');
    }
    setLoading(false);
    return false;
  };

  const postAsync = async (parameters) => {
    try {
      let res = await Axios.post(endPoint, parameters);
      return res.data ? res.data : [];
    } catch (e) {
      throw e;
    }
    return false;
  };

  const get = async (appendEndPoint) => {
    setLoading(true);
    setResponse(false);
    setErrors(false);
    setData(false);
    try {
      let url = appendEndPoint ? `${endPoint}${appendEndPoint}` : endPoint;

      let res = await Axios.get(url);
      setResponse(res.data ? res.data : []);
      setLoading(false);

      return res.data;
    } catch (e) {
      setErrors(e.message ? e.message : 'Error Occured');
    }
    setLoading(false);
    return false;
  };
  const getAsync = async (appendEndPoint) => {
    try {
      let url = appendEndPoint ? `${endPoint}${appendEndPoint}` : endPoint;

      let res = await Axios.get(url);
      return res.data ? res.data : [];
      return res.data;
    } catch (e) {
      throw e;
    }
    return false;
  };

  useEffect(() => {
    if (response) {
      setData(response);
    }
  }, [response]);

  const [caller] = useState({ get: get, post: post, postAsync: postAsync, getAsync: getAsync });

  return [caller, data, errors, loading];
};

export default useServerCall;
