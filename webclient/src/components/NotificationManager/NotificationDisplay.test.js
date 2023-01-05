import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import NotificationDisplay from './NotificationDisplay';
const wait = async () => {
	new Promise(function (resolve) {
		setTimeout(resolve, 100);
	});
};
const mockServerCall = () => {
	const getAsync = jest.fn();
	useServerCall.mockReturnValue([
		{
			getAsync: getAsync,
		},
		false,
		false,
	]);
	getAsync.mockResolvedValue({
		data: true,
	});
};
test('test enable disable cancel button appearance', async () => {
	const onSaveFunction = jest.fn();

	render(
		<NotificationDisplay
			deviceList={mockedDeviceList}
			currentDevice={'123'}
			onSave={onSaveFunction}
		/>,
	);
	let allDeviceBoxes = screen.getAllByTestId('device-switch');
	let oldValue = allDeviceBoxes[0].checked;
	let cancelButton = screen.queryByRole('button', { name: /Cancel/i });
	expect(cancelButton).not.toBeInTheDocument();

	act(() => {
		fireEvent.click(allDeviceBoxes[0]);
	});
	cancelButton = screen.queryByRole('button', { name: /Cancel/i });
	expect(cancelButton).toBeInTheDocument();

	expect(allDeviceBoxes[1].checked === oldValue).toBe(false);
	//wait for a couple of seconds
});
test('test value reset', async () => {
	render(<NotificationDisplay deviceList={mockedDeviceList} currentDevice={'123'} />);
	let allDeviceTextBoxes = screen.getAllByRole('textbox', { name: /Device/i });

	let oldValue = allDeviceTextBoxes[1].value;
	act(() => {
		fireEvent.change(allDeviceTextBoxes[1], { target: { value: 'Hello1' } });
	});
	expect(allDeviceTextBoxes[1].value === oldValue).toBe(false);
	let cancelButton = screen.getByRole('button', { name: /Cancel/i });
	act(() => {
		fireEvent.click(cancelButton);
	});
	expect(allDeviceTextBoxes[1].value === oldValue).toBe(true);
});
const getSaveButton = (screen) => {
	return screen.getByRole('button', { name: /Save/i });
};
test('test value save', async () => {
	const onSaveFunction = jest.fn();
	render(
		<NotificationDisplay
			deviceList={mockedDeviceList}
			currentDevice={'123'}
			onSave={onSaveFunction}
		/>,
	);
	let allDeviceTextBoxes = screen.getAllByRole('textbox', { name: /Device/i });

	let oldValue = allDeviceTextBoxes[1].value;
	act(() => {
		fireEvent.change(allDeviceTextBoxes[1], { target: { value: 'Hello1' } });
	});
	expect(allDeviceTextBoxes[1].value === oldValue).toBe(false);
	let saveButton = getSaveButton(screen);
	act(() => {
		fireEvent.click(saveButton);
	});

	expect(onSaveFunction).toBeCalled();
});

const mockedDeviceList = [
	{
		name: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
		enabled: true,
		vapidKey:
			'ekcV9eoppsrD4xxaXho4_Z:APA91bFdIPPPMQzFkGzmdHDqSZMKUBWiV7ek7PJoT0WGpesy1u_5B9Y2ekclOTdmDhgTbUNUoG7tS477O-5Im-YqLvgRQpWgvCXew8gP74yNY4KRVQMvFz0l-0rrIIfhgirbtJ8seQDv',
	},
	{
		enabled: false,
		name: 'i will name',
		vapidKey:
			'd2I4IfjgamTPUKQ6TlHKoh:APA91bHl25K4DavKEfranjM0xIRUugb6vt7A2HMqSufinD4INXSIbNeWwTK5b6gZkEg7dAHHPWQ0zxHgZ4a8g3auQQC7lIPfLChQ5ejuWacAHcuP3XA0qkDYYJCEqJM799Iv_-Kc8sTj',
	},
	{
		enabled: true,
		vapidKey:
			'd6yWfc4c1kCNF3bqwwyQOo:APA91bGgWPTkEpT5BH7-GpwLzHSh9jeP5aKhnp4tMvEZxofw8DUR8xJ64SwnAs7Z4Ljgj9I4j7qEEkcbIgslKSVocxI0jfi1q3fAtRfChZAFwoFRUhG096PuEm-fA7VKRZhcANyTvFXY',
		name: 'Unknown',
	},
	{
		enabled: false,
		vapidKey:
			'd6yWfc4c1kCNF3bqwwyQOo:APA91bFeSQbVit6A2RotZDfcpFTtzwZOKc-qGVZEb9Rx8EA_Mt_QKiHlBpVvt7ZLsGO_qNloQZgKFgWvE31IKtrO-VOm0CpGBHrtE4UcuRyLoReKdL4kQy4u4YOq_QJ_DQ9HW9HqZJVn',
		name: 'Mozilla/5.0 (Linux; Android 13; Pixel 4a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
	},
	{
		name: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
		enabled: true,
		vapidKey:
			'ebfbSX1ybAhpEwjLf483e7:APA91bGnE-rbZ6Ff5sn1dWrNinP79Zm7F6C5fAskAZCSrT4FtgxZTgLMO-14WLVG5CJQYyPvxZoy-u3lRRf98SONH-1AbrbKtl4pKlbPpJpB2YxSUkTN8AF-194fFlaeqrF8YBAZoiuc',
	},
	{
		name: 'Mozilla/5.0 (Linux; Android 13; Pixel 4a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36',
		vapidKey:
			'e_Md-Cn1XAhkvArxm9hx5K:APA91bEcdvSmpVjmBzn6GD0HfH8rcSUAMtOxcde1lQTiJbtrW6EfvWvaZSff57VEDlQFEqANZFsolADy0JLv8HTuvMeuiCVP1GbrkvjQZSG9DSO3r2rDjy2Hw1HdJYL6yhTxTfJPyTvU',
		enabled: true,
	},
	{
		name: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
		enabled: true,
		vapidKey:
			'cBNG0afIer0tpE1fuQonB4:APA91bG-0gsSaVSsXfqaFwE6-wcuE6wSWVH7HRgV0AkmUGr2oQewxgRecg_h-kNdy9HfbhQD8wOr5WTWajz9r1Ysn5B-TC_TBRfTQDfkUTVOBT9cJaNg3MA27q-ygT97Eu3ey89g1FsU',
	},
	{
		vapidKey:
			'dciUOXXdRviz-9WizhBGHZ:APA91bEwATnkv4zBpmu9bZSdJ-l7aMK1qiZfbQ8HaZGX4AiYaMxJQksCqXHad7BElY4v1e8bGVrYJCTO18HrDOr6SvVeF0sJnKc8wkBaq5-GMSrCZMX2GzbfflUXIMBv9aTTjopuzdlw',
		name: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
		enabled: false,
	},
];
