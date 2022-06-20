import { render, screen, fireEvent } from '@testing-library/react';
import SingleReminder from './SingleReminder';
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
});

test('renders the non first box', () => {
	const onChange = jest.fn();
	render(
		<SingleReminder
			reminder={{
				unique_id: new Date().getTime(),
				subject: 'Enter Subject',
				description: 'Short Description',
				notification_date: new Date(),
				days_after: 2,
			}}
			isFirst={false}
			onChange={onChange}
		/>,
	);
	let subject = screen.getByRole('textbox', { name: /Subject/ });
	expect(subject).toBeInTheDocument();

	subject = screen.queryAllByText(/Enter First Recurring date/i);
	expect(subject).toHaveLength(0); // expect 0 elements

	subject = screen.queryAllByText(/Remind After/i);
	expect(subject).toHaveLength(1);
});
