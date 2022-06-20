import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import CreateEdit from './CreateEdit';
import useServerCall from '../../hooks/useServerCall';
const setupDefault = async () => {
	await act(async () => {
		render(<CreateEdit />);
	});
};

const tearDown = () => {
	jest.resetAllMocks();
};

jest.mock('../../hooks/useServerCall', () => {
	return jest.fn();
});
const wait = async () => {
	new Promise(function (resolve) {
		setTimeout(resolve, 100);
	});
};

test.skip('shows header subject and description', async () => {
	await setupDefault();

	let subject = screen.getByText('Create Reminder Set');
	expect(subject).toBeInTheDocument();

	subject = screen.getByRole('textbox', { name: 'Set Name' });
	expect(subject).toBeInTheDocument();
	subject = screen.getByRole('textbox', { name: 'Set Description' });
	expect(subject).toBeInTheDocument();
	subject = screen.queryAllByText(/Create Reminder Set/i);
	expect(subject[0]).toBeInTheDocument();
});

test.skip('test reminder data show', async () => {
	const onSave = jest.fn();
	let reminderData = {
		id: 123,
		subject: 'Test Me subject',
		description: 'Test Me description',
		reminders: [
			{
				unique_id: new Date().getTime(),
				subject: 'Enter Sub1ject',
				description: 'Short Desc1ription',
				notification_date: new Date(),
				days_after: 2,
			},
			{
				unique_id: new Date().getTime(),
				subject: 'Enter Sub2ject',
				description: 'Short Des2cription',
				notification_date: new Date(),
				days_after: 2,
			},
		],
	};
	await act(async () => {
		render(<CreateEdit reminderData={reminderData} />);
	});
	let subject = screen.getByRole('textbox', { name: 'Set Name' });
	expect(subject.value.includes('Test Me subject')).toBe(true);

	subject = screen.getByRole('textbox', { name: 'Set Description' });

	expect(subject.value.includes('Test Me description')).toBe(true);

	subject = screen.getAllByRole('textbox', { name: 'Subject' });
	expect(subject[0].value.includes('Enter Sub1ject')).toBe(true);

	subject = screen.queryAllByText(/Edit Reminder Set/i);
	expect(subject[0]).toBeInTheDocument();

	tearDown();
});

test.skip('click add reminder set', async () => {
	await setupDefault();

	let addNewButton = screen.getByRole('button', { name: /Add New/i });
	fireEvent.click(addNewButton);

	const removeButton = screen.getByTestId('RemoveCircleIcon');
	expect(removeButton).toBeInTheDocument();

	subject = screen.getByRole('button', { name: /save/i });
	expect(subject).toBeInTheDocument();
	tearDown();
});

test.skip('check save validation fail', async () => {
	await setupDefault();
	let subject = screen.queryByRole('button', { name: /save/i });
	expect(subject).not.toBeInTheDocument();

	let addNewButton = screen.getByRole('button', { name: /Add New/i });
	fireEvent.click(addNewButton);

	subject = screen.getByRole('button', { name: /save/i });
	expect(subject).toBeInTheDocument();
	//Click 10 times
	[...Array(10).keys()].map((v) => {
		fireEvent.click(addNewButton);
	});

	let saveButton = screen.queryByRole('button', { name: /save/i });
	expect(saveButton).not.toBeInTheDocument();

	const removeButtons = screen.getAllByTestId('RemoveCircleIcon');
	removeButtons.map((removeButton, k) => {
		if (k < 5) {
			fireEvent.click(removeButton);
		}
	});

	//Try saving now
	saveButton = screen.queryByRole('button', { name: /save/i });
	fireEvent.click(saveButton);

	subject = screen.getByRole('textbox', { name: /Name/i });
	fireEvent.change(subject, { target: { value: '12345' } });

	//saving without description
	subject = screen.getAllByRole('alert');
	expect(subject[0]).toBeInTheDocument();

	tearDown();
});

test.skip('test save and success message', async () => {
	const onSave = jest.fn();
	await act(async () => {
		render(<CreateEdit onSave={onSave} successMessage={`Successfully Saved Set`} />);
		let addNewButton = await screen.getByRole('button', { name: /Add New/i });
		//Click 5 times
		[...Array(5).keys()].map((v) => {
			fireEvent.click(addNewButton);
		});

		//add name and description
		let subject = screen.getByRole('textbox', { name: /Name/i });
		fireEvent.change(subject, { target: { value: '12345' } });

		subject = screen.getByRole('textbox', { name: /description/i });
		fireEvent.change(subject, { target: { value: '12345' } });

		const saveButton = screen.getByRole('button', { name: /save/i });
		fireEvent.click(saveButton);
	});
	expect(onSave).toBeCalled();
	subject = screen.queryAllByText(/Successfully Saved Set/i);
	expect(subject[0]).toBeInTheDocument();
	tearDown();
});

test.skip('test save errors', async () => {
	const onSave = jest.fn();
	await act(async () => {
		render(<CreateEdit onSave={onSave} saveErrors={['Heello this iz error']} />);

		let addNewButton = await screen.getByRole('button', { name: /Add New/i });
		//Click 5 times
		[...Array(5).keys()].map((v) => {
			fireEvent.click(addNewButton);
		});

		//add name and description

		let subject = screen.getByRole('textbox', { name: /Name/i });
		fireEvent.change(subject, { target: { value: '12345' } });

		subject = screen.getByRole('textbox', { name: /description/i });
		fireEvent.change(subject, { target: { value: '12345' } });

		subject = screen.queryAllByText(/Heello this iz error/i);
		expect(subject[0]).toBeInTheDocument();
	});

	tearDown();
});
test('test single reminder deletion', async () => {
	const onSave = jest.fn();
	let reminderData = {
		id: 123,
		subject: 'Test Me subject',
		description: 'Test Me description',
		reminders: [
			{
				id: 1231,
				unique_id: new Date().getTime(),
				subject: 'Enter Sub1ject',
				description: 'Short Desc1ription',
				notification_date: new Date(),
				days_after: 2,
			},
			{
				id: 12312,
				unique_id: new Date().getTime(),
				subject: 'Enter Sub2ject',
				description: 'Short Des2cription',
				notification_date: new Date(),
				days_after: 2,
			},
		],
	};
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
	await act(async () => {
		render(<CreateEdit reminderData={reminderData} />);
	});

	let removeButton = screen.getAllByTestId('RemoveCircleIcon');
	expect(removeButton).toHaveLength(2);

	await act(async () => {
		act(() => {
			fireEvent.click(removeButton[1]);
		});
	});
	let confirmDialogTitle = 'Confirm Deletion';

	subject = screen.queryByText(confirmDialogTitle);
	expect(subject).toBeInTheDocument();

	subject = screen.getByRole('button', { name: 'Confirm' });
	expect(subject).toBeInTheDocument();

	await act(async () => {
		fireEvent.click(subject);
		await wait();
	});
	subject = screen.queryByRole('button', { name: 'Confirm' });
	expect(subject).not.toBeInTheDocument();

	removeButton = screen.getAllByTestId('RemoveCircleIcon');
	expect(removeButton).toHaveLength(1);

	tearDown();
});
