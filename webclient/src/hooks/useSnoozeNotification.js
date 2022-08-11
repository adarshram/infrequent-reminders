//import { reminderSetListFilled } from '../models/mocks/reminderSet';
import useServerCall from './useServerCall';
//import { calendarMockDataDetails } from '../components/Schedules/calendarMockData';
const useSnoozeNotification = () => {
	const [listCall, , , ,] = useServerCall('/user/notifications/snooze/');
	return [listCall];
};

export default useSnoozeNotification;
