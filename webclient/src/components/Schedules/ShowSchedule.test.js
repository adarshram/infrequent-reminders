import { render, screen, fireEvent } from '@testing-library/react';
import ShowSchedule from './ShowSchedule';
import { act } from 'react-dom/test-utils';

test('shows subject and expands', async () => {
	const setCurrentSchedule = jest.fn();

	render(
		<ShowSchedule
			schedule={{
				id: 123,
				subject: 'Hello Test',
				notification_date: '2020-01-02',
				description: 'Description of hello test',
			}}
			setCurrentSchedule={setCurrentSchedule}
			currentSchedule={{ id: 123 }}
		/>,
	);
	const subject = screen.getByText('Hello Test');
	expect(subject).toBeInTheDocument();
	const doneButton = screen.getByTestId('DoneIcon');
	expect(doneButton).toBeInTheDocument();
});

test('shows calls expand', async () => {
	const setCurrentSchedule = jest.fn();

	render(
		<ShowSchedule
			schedule={{
				subject: 'Hello Test',
				notification_date: '2020-01-02',
				description: 'Description of hello test',
			}}
			setCurrentSchedule={setCurrentSchedule}
			currentSchedule={{}}
		/>,
	);
	const subject = screen.getByText('Hello Test');
	expect(subject).toBeInTheDocument();
	const expandButton = screen.getByRole('button', { Name: 'Hello Test' });
	act(() => {
		fireEvent.click(expandButton);
	});
	expect(setCurrentSchedule).toBeCalled();
});
test.skip('Shows snooze button and done', () => {
	const doneHandler = jest.fn();
	render(
		<ShowSchedule
			schedule={{
				subject: 'Hello Test',
				notification_date: '2020-01-02',
				description: 'Description of hello test',
				is_pending: 1,
			}}
			doneHandler={doneHandler}
		/>,
	);
	const expandButton = screen.getByRole('button', { Name: 'Hello Test' });
	fireEvent.click(expandButton);
	const snoozeButton = screen.getByTestId('SnoozeIcon');
	expect(snoozeButton).toBeInTheDocument();
	const doneButton = screen.getByTestId('DoneIcon');
	expect(doneButton).toBeInTheDocument();
	fireEvent.click(doneButton);
	expect(doneHandler).toBeCalled();
});
test.skip('Click snooze button', () => {
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
	const expandButton = screen.getByRole('button', { Name: 'Hello Test' });
	//expect(expandButton).toBeInTheDocument();
	fireEvent.click(expandButton);
	const snoozeButton = screen.getByTestId('SnoozeIcon');
	expect(snoozeButton).toBeInTheDocument();
	fireEvent.click(snoozeButton);
	expect(handleClick).toHaveBeenCalledTimes(1);
});
test.skip('Shows Done button', () => {
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
	const expandButton = screen.getByRole('button', { Name: 'Hello Test' });
	//expect(expandButton).toBeInTheDocument();
	fireEvent.click(expandButton);
	const snoozeButton = screen.getByTestId('DoneIcon');
	expect(snoozeButton).toBeInTheDocument();
});
test.skip('Shows Delete button', () => {
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
	const expandButton = screen.getByRole('button', { Name: 'Hello Test' });
	//expect(expandButton).toBeInTheDocument();
	fireEvent.click(expandButton);
	const deleteButton = screen.getByTestId('DeleteIcon');
	expect(deleteButton).toBeInTheDocument();
	//click delete and expect confirm to open
	//fireEvent.click(expandButton);
});
test.skip('Shows Delete Alert', () => {
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
	const expandButton = screen.getByRole('button', { Name: 'Hello Test' });
	//expect(expandButton).toBeInTheDocument();
	fireEvent.click(expandButton);
	const deleteButton = screen.getByTestId('DeleteIcon');
	//click delete and expect confirm to open
	fireEvent.click(deleteButton);
	const confirmDeleteButton = screen.getByRole('confirm-delete');
	expect(confirmDeleteButton).toBeInTheDocument();
});
test.skip('Calls Delete and hides dialog', () => {
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
	const expandButton = screen.getByRole('button', { Name: 'Hello Test' });
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
test.skip('Calls Cancel and hides dialog', () => {
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
	const expandButton = screen.getByRole('button', { Name: 'Hello Test' });
	//expect(expandButton).toBeInTheDocument();
	fireEvent.click(expandButton);
	const deleteButton = screen.getByTestId('DeleteIcon');
	//click delete and expect confirm to open
	fireEvent.click(deleteButton);
	const cancelConfirmButton = screen.getByRole('cancel-confirm');
	fireEvent.click(cancelConfirmButton);
	expect(screen.queryByText('Are you sure you want to Delete?')).toBeNull();
});
