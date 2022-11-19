import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import NotificationPrompter from '../NotificationPrompter';
import { useNotificationDeviceList } from '../../hooks/notificationDevices';
jest.mock('../../hooks/notificationDevices', () => {
	return { useNotificationDeviceList: jest.fn() };
});

test('current device disabled', async () => {
	let currentDevice = mockedCurrentDevice;
	//disable current device
	let deviceList = mockedDeviceList.map((current) => {
		if (current.vapidKey === currentDevice) {
			current.enabled = false;
		}
		return current;
	});
	let refreshNotificationList = () => {};
	let notificationsLoaded = true;
	useNotificationDeviceList.mockReturnValue([
		deviceList,
		currentDevice,
		,
		,
		refreshNotificationList,
		notificationsLoaded,
	]);
	await act(async () => {
		render(<NotificationPrompter />);
	});
	expect(
		screen.queryByText('Notifications for current device not enabled', { exact: false }),
	).toBeInTheDocument();
	expect(
		screen.queryByText('Notifications will fall back to email', { exact: false }),
	).not.toBeInTheDocument();
});
test('no devices', async () => {
	let currentDevice = mockedCurrentDevice;
	//disable current device
	let deviceList = [];
	let refreshNotificationList = () => {};
	let notificationsLoaded = true;
	useNotificationDeviceList.mockReturnValue([
		deviceList,
		currentDevice,
		,
		,
		refreshNotificationList,
		notificationsLoaded,
	]);
	await act(async () => {
		render(<NotificationPrompter />);
	});
	expect(
		screen.queryByText('Notifications for current device not enabled', { exact: false }),
	).not.toBeInTheDocument();
	expect(
		screen.queryByText('Notifications will fall back to email', { exact: false }),
	).toBeInTheDocument();
});
test('current device enabled', async () => {
	let currentDevice = mockedCurrentDevice;
	//disable current device
	let deviceList = mockedDeviceList.map((current) => {
		if (current.vapidKey === currentDevice) {
			current.enabled = true;
		}
		return current;
	});
	let refreshNotificationList = () => {};
	let notificationsLoaded = true;
	useNotificationDeviceList.mockReturnValue([
		deviceList,
		currentDevice,
		,
		,
		refreshNotificationList,
		notificationsLoaded,
	]);
	await act(async () => {
		render(<NotificationPrompter />);
	});
	expect(
		screen.queryByText('Notifications for current device not enabled', { exact: false }),
	).not.toBeInTheDocument();
	expect(
		screen.queryByText('Notifications will fall back to email', { exact: false }),
	).not.toBeInTheDocument();
});

const mockedDeviceList = [
	{
		name: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
		vapidKey:
			'ekcV9eoppsrD4xxaXho4_Z:APA91bFdIPPPMQzFkGzmdHDqSZMKUBWiV7ek7PJoT0WGpesy1u_5B9Y2ekclOTdmDhgTbUNUoG7tS477O-5Im-YqLvgRQpWgvCXew8gP74yNY4KRVQMvFz0l-0rrIIfhgirbtJ8seQDv',
		enabled: true,
	},
	{
		enabled: false,
		name: 'Unknown Device',
		vapidKey:
			'd2I4IfjgamTPUKQ6TlHKoh:APA91bHl25K4DavKEfranjM0xIRUugb6vt7A2HMqSufinD4INXSIbNeWwTK5b6gZkEg7dAHHPWQ0zxHgZ4a8g3auQQC7lIPfLChQ5ejuWacAHcuP3XA0qkDYYJCEqJM799Iv_-Kc8sTj',
	},
	{
		vapidKey:
			'd6yWfc4c1kCNF3bqwwyQOo:APA91bGgWPTkEpT5BH7-GpwLzHSh9jeP5aKhnp4tMvEZxofw8DUR8xJ64SwnAs7Z4Ljgj9I4j7qEEkcbIgslKSVocxI0jfi1q3fAtRfChZAFwoFRUhG096PuEm-fA7VKRZhcANyTvFXY',
		name: 'Unknown',
		enabled: true,
	},
];
const mockedCurrentDevice =
	'ekcV9eoppsrD4xxaXho4_Z:APA91bFdIPPPMQzFkGzmdHDqSZMKUBWiV7ek7PJoT0WGpesy1u_5B9Y2ekclOTdmDhgTbUNUoG7tS477O-5Im-YqLvgRQpWgvCXew8gP74yNY4KRVQMvFz0l-0rrIIfhgirbtJ8seQDv';
