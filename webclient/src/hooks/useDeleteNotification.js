//import { reminderSetListFilled } from '../models/mocks/reminderSet';
import useServerCall from './useServerCall';
//import { calendarMockDataDetails } from '../components/Schedules/calendarMockData';
const useDeleteNotification = (parameters) => {
	const [listCall, , , ,] = useServerCall('/user/notifications/delete');
	return [listCall];
};

export default useDeleteNotification;
