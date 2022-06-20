import { render, screen, fireEvent } from '@testing-library/react';
import ShowSchedule from './ShowSchedule';

test('shows subject', () => {
	render(
		<ShowSchedule
			schedule={{
				subject: 'Hello Test',
				notification_date: '2020-01-02',
				description: 'Description of hello test',
			}}
		/>,
	);
	const subject = screen.getByText('Hello Test');
	expect(subject).toBeInTheDocument();
});
test('Shows snooze button', () => {
	render(
		<ShowSchedule
			schedule={{
				subject: 'Hello Test',
				notification_date: '2020-01-02',
				description: 'Description of hello test',
				is_pending: 1,
			}}
		/>,
	);
	const expandButton = screen.getByTestId('EditIcon');
	//expect(expandButton).toBeInTheDocument();
	fireEvent.click(expandButton);
	const snoozeButton = screen.getByTestId('SnoozeIcon');
	expect(snoozeButton).toBeInTheDocument();
	//const doneButton = screen.getByTestId('DoneIcon');
	//expect(doneButton).toBeInTheDocument();
});
test('Click snooze button', () => {
	const handleClick = jest.fn();

	render(
		<ShowSchedule
			schedule={{
				subject: 'Hello Test',
				notification_date: '2020-01-02',
				description: 'Description of hello test',
				is_pending: 1,
			}}
			snoozeOrCompleteHandler={handleClick}
		/>,
	);
	const expandButton = screen.getByTestId('EditIcon');
	//expect(expandButton).toBeInTheDocument();
	fireEvent.click(expandButton);
	const snoozeButton = screen.getByTestId('SnoozeIcon');
	expect(snoozeButton).toBeInTheDocument();
	fireEvent.click(snoozeButton);
	expect(handleClick).toHaveBeenCalledTimes(1);
});
test('Shows Done button', () => {
	render(
		<ShowSchedule
			schedule={{
				subject: 'Hello Test',
				notification_date: '2020-01-02',
				description: 'Description of hello test',
				is_pending: 0,
			}}
		/>,
	);
	const expandButton = screen.getByTestId('EditIcon');
	//expect(expandButton).toBeInTheDocument();
	fireEvent.click(expandButton);
	const snoozeButton = screen.getByTestId('DoneIcon');
	expect(snoozeButton).toBeInTheDocument();
});
test('Shows Delete button', () => {
	render(
		<ShowSchedule
			schedule={{
				subject: 'Hello Test',
				notification_date: '2020-01-02',
				description: 'Description of hello test',
				is_pending: 0,
			}}
		/>,
	);
	const expandButton = screen.getByTestId('EditIcon');
	//expect(expandButton).toBeInTheDocument();
	fireEvent.click(expandButton);
	const deleteButton = screen.getByTestId('DeleteIcon');
	expect(deleteButton).toBeInTheDocument();
	//click delete and expect confirm to open
	//fireEvent.click(expandButton);
});
test('Shows Delete Alert', () => {
	render(
		<ShowSchedule
			schedule={{
				subject: 'Hello Test',
				notification_date: '2020-01-02',
				description: 'Description of hello test',
				is_pending: 0,
			}}
		/>,
	);
	const expandButton = screen.getByTestId('EditIcon');
	//expect(expandButton).toBeInTheDocument();
	fireEvent.click(expandButton);
	const deleteButton = screen.getByTestId('DeleteIcon');
	//click delete and expect confirm to open
	fireEvent.click(deleteButton);
	const confirmDeleteButton = screen.getByRole('confirm-delete');
	expect(confirmDeleteButton).toBeInTheDocument();
});
test('Calls Delete and hides dialog', () => {
	const deleteHandler = jest.fn();
	render(
		<ShowSchedule
			schedule={{
				subject: 'Hello Test',
				notification_date: '2020-01-02',
				description: 'Description of hello test',
				is_pending: 0,
			}}
			deleteHandler={deleteHandler}
		/>,
	);
	const expandButton = screen.getByTestId('EditIcon');
	//expect(expandButton).toBeInTheDocument();
	fireEvent.click(expandButton);
	const deleteButton = screen.getByTestId('DeleteIcon');
	//click delete and expect confirm to open
	fireEvent.click(deleteButton);
	const confirmDeleteButton = screen.getByRole('confirm-delete');
	fireEvent.click(confirmDeleteButton);
	expect(deleteHandler).toHaveBeenCalledTimes(1);
	expect(screen.queryByText('Are you sure you want to Delete?')).toBeNull();
});
test('Calls Cancel and hides dialog', () => {
	const deleteHandler = jest.fn();
	render(
		<ShowSchedule
			schedule={{
				subject: 'Hello Test',
				notification_date: '2020-01-02',
				description: 'Description of hello test',
				is_pending: 0,
			}}
			deleteHandler={deleteHandler}
		/>,
	);
	const expandButton = screen.getByTestId('EditIcon');
	//expect(expandButton).toBeInTheDocument();
	fireEvent.click(expandButton);
	const deleteButton = screen.getByTestId('DeleteIcon');
	//click delete and expect confirm to open
	fireEvent.click(deleteButton);
	const cancelConfirmButton = screen.getByRole('cancel-confirm');
	fireEvent.click(cancelConfirmButton);
	expect(screen.queryByText('Are you sure you want to Delete?')).toBeNull();
});
