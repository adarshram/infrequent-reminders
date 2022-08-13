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
    } catch (err) {
      setErrors(err.response?.data ? err.response.data.message : err.message);
    }
    setLoading(false);
    return false;
  };

  const postAsync = async (parameters) => {
    try {
      setLoading(true);
      let res = await Axios.post(endPoint, parameters);
      setLoading(false);
      return res.data ? res.data : [];
    } catch (e) {
      setLoading(false);
      throw e;
    }
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
    } catch (err) {
      setErrors(err.response?.data ? err.response.data.message : err.message);
    }
    setLoading(false);
    return false;
  };
  const getAsync = async (appendEndPoint) => {
    try {
      let url = appendEndPoint ? `${endPoint}${appendEndPoint}` : endPoint;
      setLoading(true);
      let res = await Axios.get(url);
      setLoading(false);
      return res.data ? res.data : [];
    } catch (err) {
      setLoading(false);
      throw err;
    }
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
