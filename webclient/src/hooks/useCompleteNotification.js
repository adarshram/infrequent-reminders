//import { reminderSetListFilled } from '../models/mocks/reminderSet';
import useServerCall from './useServerCall';
//import { calendarMockDataDetails } from '../components/Schedules/calendarMockData';
const useCompleteNotification = () => {
	const [listCall, , , ,] = useServerCall('/user/notifications/complete/');
	return [listCall];
};

export default useCompleteNotification;
