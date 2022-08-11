import useServerCall from './useServerCall';
const useReminderDeleteList = () => {
  const [deleteCall, , , ,] = useServerCall('/user/reminderSet/deleteSet/');
  return [deleteCall];
};

export default useReminderDeleteList;
