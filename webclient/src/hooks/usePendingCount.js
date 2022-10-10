import { useState, useEffect } from 'react';
import useServerCall from './useServerCall';
const usePendingCount = () => {
  const [pendingCount, setPendingCount] = useState(null);
  const [pendingCountCaller, pendingCountResponse, pendingCountError, pendingCountLoading] =
    useServerCall('/user/notifications/pending/count');

  useEffect(() => {
    if (pendingCountResponse) {
      setPendingCount(false);
      if (pendingCountResponse?.data && pendingCountResponse.data > 0) {
        setPendingCount(pendingCountResponse.data);
      }
      if (pendingCountResponse.data === 0) {
        setPendingCount(0);
      }
    }
    if (pendingCountError) {
      let userNotSignedIn = pendingCountError.indexOf('Token') > -1;
      if (userNotSignedIn) {
        return;
      }
      setPendingCount(0);
    }
  }, [pendingCountResponse, pendingCountError]);

  useEffect(() => {
    if (pendingCount === null) {
      pendingCountCaller.get();
    }
  }, [pendingCountCaller, pendingCount]);

  const reloadPendingCount = () => {
    if (pendingCountLoading === false) {
      pendingCountCaller.get();
    }
  };
  return [pendingCount, reloadPendingCount];
};

export default usePendingCount;
