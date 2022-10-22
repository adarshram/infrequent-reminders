import { render, screen, fireEvent } from '@testing-library/react';
import UserProfile from './UserProfile';
import useProfileData from '../hooks/useProfileData';
import * as notificationDevices from '../hooks/notificationDevices';
import * as fbMessaging from 'firebase/messaging';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { UserContext } from '../models/UserContext';
import CalendarList from '../components/Schedules/CalendarList';
import { PendingReminderContext } from '../models/PendingReminderContext';
const wait = async () => {
	new Promise(function (resolve) {
		setTimeout(resolve, 100);
	});
};
jest.mock('firebase/messaging', () => {
	return {
		getMessaging: jest.fn(),
		getToken: jest.fn(),
	};
});
jest.mock('../hooks/useProfileData', () => () => [
	{
		id: 7,
		fireBaseRefId: 'TKsk1wPNQpSYattL8OhIYE5fI123',
		first_name: 'Adarshram',
		last_name: 'developer',
		email: 'adarsh.developer@gmail.com',
		created_at: '2022-02-05T18:30:00.000Z',
		updated_at: '2022-02-05T18:30:00.000Z',
	},
	false,
	[],
	(v) => {
		console.log(v);
	},
]);

test('Shows user profile', async () => {
	//{ getMessaging, getToken }
	jest.spyOn(fbMessaging, 'getMessaging').mockReturnValue(true);
	jest
		.spyOn(fbMessaging, 'getToken')
		.mockResolvedValue(
			'ekcV9eoppsrD4xxaXho4_Z:APA91bFdIPPPMQzFkGzmdHDqSZMKUBWiV7ek7PJoT0WGpesy1u_5B9Y2ekclOTdmDhgTbUNUoG7tS477O-5Im-YqLvgRQpWgvCXew8gP74yNY4KRVQMvFz0l-0rrIIfhgirbtJ8seQDv',
		);
	jest.spyOn(notificationDevices, 'useNotificationDeviceList').mockImplementation(() => [
		[
			{
				vapidKey:
					'ekcV9eoppsrD4xxaXho4_Z:APA91bFdIPPPMQzFkGzmdHDqSZMKUBWiV7ek7PJoT0WGpesy1u_5B9Y2ekclOTdmDhgTbUNUoG7tS477O-5Im-YqLvgRQpWgvCXew8gP74yNY4KRVQMvFz0l-0rrIIfhgirbtJ8seQDv',
				enabled: true,
				name: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
			},
			{
				enabled: true,
				vapidKey:
					'cLb8Ddk0LJzjJlltuDgYwe:APA91bF-Z7RQoJJOS1W9FVxvS3FVk8ZSul6pUmNqqk3INfUvB-73qjz-OYAszW6GIu5BoRQbscMgkye0ak6IUSW-dekmgx0jt2Ci5Ewm2lYmd73_8lMcJJqYEdPL4_s8WfRgE8bWT0u7',
				name: 'Unknown Device',
			},
			{
				name: 'Unknown Device',
				enabled: true,
				vapidKey:
					'd2I4IfjgamTPUKQ6TlHKoh:APA91bHl25K4DavKEfranjM0xIRUugb6vt7A2HMqSufinD4INXSIbNeWwTK5b6gZkEg7dAHHPWQ0zxHgZ4a8g3auQQC7lIPfLChQ5ejuWacAHcuP3XA0qkDYYJCEqJM799Iv_-Kc8sTj',
			},
		],
		'ekcV9eoppsrD4xxaXho4_Z:APA91bFdIPPPMQzFkGzmdHDqSZMKUBWiV7ek7PJoT0WGpesy1u_5B9Y2ekclOTdmDhgTbUNUoG7tS477O-5Im-YqLvgRQpWgvCXew8gP74yNY4KRVQMvFz0l-0rrIIfhgirbtJ8seQDv',
		true,
		[],
		(v) => jest.fn(),
	]);
	await act(async () => {
		render(
			<UserContext.Provider value={{ user: { uid: 'TKsk1wPNQpSYattL8OhIYE5fI123' } }}>
				<UserProfile />
			</UserContext.Provider>,
		);
	});
	await wait();
	let notificationList = screen.queryAllByLabelText('Notifications for', { exact: false });
	expect(notificationList[0].value).toEqual('on');
});
