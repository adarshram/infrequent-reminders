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
    }
    if (pendingCountError) {
      console.log(pendingCountError);
      setPendingCount(0);
    }
  }, [pendingCountResponse, pendingCountError]);

  const reloadPendingCount = () => {
    if (pendingCountLoading === false) {
      pendingCountCaller.get();
    }
  };
  return [pendingCount, reloadPendingCount];
};

export default usePendingCount;
