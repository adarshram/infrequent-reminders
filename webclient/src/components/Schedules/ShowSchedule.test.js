import { render, screen, fireEvent } from '@testing-library/react';
import ShowSchedule from './ShowSchedule';
import { act } from 'react-dom/test-utils';
import React, { useState, useEffect, useContext } from 'react';
const wait = async () => {
	new Promise(function (resolve) {
		setTimeout(resolve, 100);
	});
};
const doneHandler = jest.fn();
1;
const snoozeOrCompleteHandler = jest.fn();
const deleteHandler = jest.fn();
const Dummy = ({ is_pending }) => {
	const [currentSchedule, setCurrentSchedule] = useState({ id: 112 });
	return (
		<ShowSchedule
			schedule={{
				id: 123,
				subject: 'Hello Test',
				notification_date: '2020-01-02',
				description: 'Description of hello test',
				is_pending: is_pending ?? 0,
			}}
			setCurrentSchedule={setCurrentSchedule}
			currentSchedule={currentSchedule}
			snoozeOrCompleteHandler={snoozeOrCompleteHandler}
			deleteHandler={deleteHandler}
			doneHandler={doneHandler}
		/>
	);
};
test('shows_snooze button and done', () => {
	render(<Dummy is_pending={1} />);
	const expandButton = screen.getByRole('button', { name: /Hello Test/i });
	fireEvent.click(expandButton);
	const snoozeButton = screen.getByTestId('SnoozeIcon');
	expect(snoozeButton).toBeInTheDocument();
	const doneButton = screen.getByTestId('DoneIcon');
	expect(doneButton).toBeInTheDocument();
	fireEvent.click(doneButton);
	expect(doneHandler).toBeCalled();
});
test('click_snooze button', () => {
	render(<Dummy is_pending={1} />);
	const expandButton = screen.getByRole('button', { name: /Hello Test/i });
	//expect(expandButton).toBeInTheDocument();
	fireEvent.click(expandButton);
	const snoozeButton = screen.getByTestId('SnoozeIcon');
	expect(snoozeButton).toBeInTheDocument();
	fireEvent.click(snoozeButton);
	expect(snoozeOrCompleteHandler).toHaveBeenCalledTimes(1);
});
test('calls_delete and no snooze', async () => {
	render(<Dummy />);
	const expandButton = screen.getByRole('button', { name: /Hello Test/i });
	//expect(expandButton).toBeInTheDocument();

	await act(async () => {
		fireEvent.click(expandButton);
		await wait();
	});
	const deleteButton = screen.getByTestId('DeleteIcon');
	//click delete and expect confirm to open
	fireEvent.click(deleteButton);
	const confirmDeleteButton = screen.getByRole('confirm-delete');
	fireEvent.click(confirmDeleteButton);
	expect(deleteHandler).toHaveBeenCalledTimes(1);
	expect(screen.queryByText('Are you sure you want to Delete?')).toBeNull();

	const snoozeButton = screen.queryAllByTestId('SnoozeIcon');
	expect(snoozeButton.length).toBe(0);
});
test('calls_cancel and hides dialog', () => {
	render(<Dummy />);
	const expandButton = screen.getByRole('button', { name: /Hello Test/i });
	fireEvent.click(expandButton);
	const deleteButton = screen.getByTestId('DeleteIcon');
	//click delete and expect confirm to open
	fireEvent.click(deleteButton);
	const cancelConfirmButton = screen.getByRole('cancel-confirm');
	fireEvent.click(cancelConfirmButton);
	expect(screen.queryByText('Are you sure you want to Delete?')).toBeNull();
});
