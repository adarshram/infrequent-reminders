import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import CreateEdit from './CreateEdit';
import LoopReminder from './LoopReminder';
import { Button } from '@mui/material';
const tearDown = () => {
	jest.resetAllMocks();
};

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

const getFakeReminders = () => {
	return [
		{
			unique_id: new Date().getTime(),
			subject: 'Enter Sub1ject',
			description: 'Short Desc1ription',
			notification_date: new Date(),
			days_after: 2,
			is_active: true,
			id: 1234,
		},
		{
			unique_id: new Date().getTime(),
			subject: 'Enter Sub2ject',
			description: 'Short Des2cription',
			notification_date: new Date(),
			days_after: 2,
			is_active: true,
			id: 1235,
		},
	];
};

const getFakeRemindersForToggle = () => {
	return [
		{
			unique_id: new Date().getTime(),
			subject: 'Enter Sub1ject',
			description: 'Short Desc1ription',
			notification_date: new Date(),
			days_after: 2,
			is_active: false,
			id: 1234,
			complete: true,
		},
		{
			unique_id: new Date().getTime(),
			subject: 'Enter Sub2ject',
			description: 'Short Des2cription',
			notification_date: new Date(),
			days_after: 2,
			is_active: false,
			id: 1235,
			complete: true,
		},
		{
			unique_id: new Date().getTime(),
			subject: 'Enter Sub2ject',
			description: 'Short Des2cription',
			notification_date: new Date(),
			days_after: 2,
			is_active: true,
			id: 1236,
		},
		{
			unique_id: new Date().getTime(),
			subject: 'Enter Sub2ject',
			description: 'Short Des2cription',
			notification_date: new Date(),
			days_after: 2,
			is_active: true,
		},
	];
};

test('click Add New and add stuff', async () => {
	await act(async () => {
		render(<LoopReminder />);
	});
	let subject = screen.getByRole('button', { name: 'Add New' });
	expect(subject).toBeInTheDocument();
	act(() => {
		fireEvent.click(subject);
	});
	act(() => {
		fireEvent.click(subject);
	});
	let textBoxes = screen.queryAllByRole('textbox');
	act(() => {
		fireEvent.change(textBoxes[0], { target: { value: '123' } });
	});
	textBoxes = screen.queryAllByRole('textbox');
	console.log(textBoxes[0].value);
});
