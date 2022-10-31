import { render, screen, fireEvent } from '@testing-library/react';
import * as notificationDevices from './notificationDevices';
import * as fbMessaging from 'firebase/messaging';
import { act } from 'react-dom/test-utils';
import useServerCall from './useServerCall';
import useFetchBrowserData from './useFetchBrowserData';

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
jest.mock('./useServerCall', () => jest.fn());
jest.mock('./useFetchBrowserData', () => jest.fn());

jest.mock('./notificationDevices', () => {
	const actualFunctions = jest.requireActual('./notificationDevices');
	return {
		...actualFunctions,
		useFetchBrowserData: jest.fn(),
	};
});

test('Shows device not in profile', async () => {
	useFetchBrowserData.mockReturnValue(['123123123123', 'browser name', true]);

	useServerCall.mockReturnValue([
		{
			get: () => {},
		},
		{ data: { devices: [{ vapidKey: '123', name: 'Preexisting' }] } },
		false,
		false,
	]);
	const DummyModule = () => {
		const [
			deviceList,
			currentDevice,
			hasNotificationEnabled,
			notificationErrors,
			refreshNotificationList,
		] = notificationDevices.useNotificationDeviceList();

		return (
			<>
				{deviceList &&
					deviceList.map((currentDevice, key) => (
						<div key={key} data-testid={currentDevice.vapidKey}>
							{currentDevice.name}
						</div>
					))}
			</>
		);
	};
	act(() => {
		render(<DummyModule />);
	});

	expect(screen.getByTestId('123')).toBeInTheDocument();
	expect(screen.getByTestId('123123123123')).toBeInTheDocument();
});
