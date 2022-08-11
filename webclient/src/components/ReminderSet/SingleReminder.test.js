import { render, screen, fireEvent, act } from '@testing-library/react';
import SingleReminder from './SingleReminder';
const setupDefault = async ({ onChange, isFirst, reminder, handleRemove }) => {
	render(
		<SingleReminder
			reminder={{
				id: 123,
				subject: 'Enter Subject',
				description: 'Short Description',
				notification_date: new Date(),
				days_after: 2,
			}}
			isFirst={isFirst ? isFirst : false}
			onChange={onChange ?? jest.fn()}
			handleRemove={handleRemove ?? jest.fn()}
		/>,
	);
};

test('renders the first box', () => {
	const onChange = jest.fn();
	render(
		<SingleReminder
			reminder={{
				id: 123,
				subject: 'Enter Subject',
				description: 'Short Description',
				notification_date: new Date(),
				days_after: 2,
				is_active: true,
			}}
			isFirst={true}
			onChange={onChange}
		/>,
	);
	let subject = screen.getByRole('textbox', { name: /Subject/ });
	expect(subject).toBeInTheDocument();

	fireEvent.change(subject, { target: { value: '12345' } });
	expect(onChange).toHaveBeenCalled();

	subject = screen.queryAllByText(/Enter First Recurring date/i);
	expect(subject[0]).toBeInTheDocument();

	subject = screen.queryAllByText(/Remind After/i);
	expect(subject).toHaveLength(0);
	const removeButton = screen.getByTestId('RemoveCircleIcon');
	expect(removeButton).toBeInTheDocument();
});

test('renders the non first box', () => {
	const onChange = jest.fn();
	const handleRemove = jest.fn();
	render(
		<SingleReminder
			reminder={{
				unique_id: new Date().getTime(),
				subject: 'Enter Subject',
				description: 'Short Description',
				notification_date: new Date(),
				days_after: 2,
				is_active: true,
			}}
			isFirst={false}
			onChange={onChange}
			handleRemove={handleRemove}
		/>,
	);
	let subject = screen.getByRole('textbox', { name: /Subject/ });
	expect(subject).toBeInTheDocument();

	subject = screen.queryAllByText(/Enter First Recurring date/i);
	expect(subject).toHaveLength(0); // expect 0 elements

	subject = screen.queryAllByText(/Remind After/i);
	expect(subject).toHaveLength(1);
	const removeButton = screen.getByTestId('RemoveCircleIcon');
	expect(removeButton).toBeInTheDocument();
	fireEvent.click(removeButton);
	expect(handleRemove).toBeCalled();
});

test('renders_strike_through and calls onChange', () => {
	const onChange = jest.fn();
	const handleRemove = jest.fn();
	const toggleComplete = jest.fn();

	let reminderData = {
		unique_id: new Date().getTime(),
		subject: 'Enter Subject',
		description: 'Short Description',
		notification_date: new Date(),
		days_after: 2,
		complete: true,
	};
	render(
		<SingleReminder
			reminder={reminderData}
			isFirst={false}
			onChange={onChange}
			handleRemove={handleRemove}
			toggleComplete={toggleComplete}
		/>,
	);
	let subject = screen.queryByRole('textbox', { name: /Subject/ });
	expect(subject).not.toBeInTheDocument();

	subject = screen.queryByLabelText(reminderData.subject);
	act(() => {
		fireEvent.click(subject);
	});
	expect(toggleComplete).toBeCalledWith(false);
});
