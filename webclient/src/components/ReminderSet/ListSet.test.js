import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import ListSet from './ListSet';
import useReminderSetList from '../../hooks/useReminderSetList';
import useServerCall from '../../hooks/useServerCall';

import { useNavigate } from 'react-router-dom';
import { reminderSetListFilled } from '../../models/mocks/reminderSet';
const wait = async () => {
	new Promise(function (resolve) {
		setTimeout(resolve, 100);
	});
};
const setupDefault = async () => {
	await act(async () => {
		render(<ListSet />);
	});
};

const tearDown = () => {
	jest.resetAllMocks();
};
jest.mock('../../hooks/useReminderSetList', () => jest.fn());
jest.mock('../../hooks/useServerCall', () => jest.fn());

jest.mock('react-router-dom', () => {
	return {
		useNavigate: jest.fn(),
	};
});

test('shows header and no results', async () => {
	let reminderListData = reminderSetListFilled();
	useReminderSetList.mockReturnValue([
		{
			total: 0,
			list: [],
		},
		false,
		false,
	]);
	useNavigate.mockReturnValue(() => {});
	await setupDefault();

	let subject = screen.getByText('Reminder Sets');
	expect(subject).toBeInTheDocument();

	subject = screen.getByText('No Reminder Sets');
	expect(subject).toBeInTheDocument();
	subject = screen.getByRole('button', { Name: 'Create New Set' });
	expect(subject).toBeInTheDocument();
});
test('shows results', async () => {
	let reminderListData = reminderSetListFilled();
	useReminderSetList.mockReturnValue([reminderListData, false, false]);
	let navigateFunction = jest.fn();
	useNavigate.mockReturnValue((a) => console.log(a));
	await act(async () => {
		render(<ListSet />);
		await wait();
	});
	let subject = screen.getByText(reminderListData['data'][0].subject, { exact: false });
	expect(subject).toBeInTheDocument();

	subject = screen.getByText(reminderListData['data'][1].description, { exact: false });
	expect(subject).toBeInTheDocument();

	subject = screen.getByText(reminderListData['data'][2].subject, { exact: false });
	expect(subject).toBeInTheDocument();
});
test('delete show confirm ', async () => {
	let reminderListData = reminderSetListFilled();
	useReminderSetList.mockReturnValue([reminderListData, false, false]);
	let getAsync = jest.fn();
	getAsync.mockResolvedValue({
		success: true,
	});

	useServerCall.mockReturnValue([{ getAsync: getAsync }, false, false, false]);
	let navigateFunction = jest.fn();
	useNavigate.mockReturnValue(navigateFunction);
	await act(async () => {
		render(<ListSet />);
		await wait();
	});

	let deleteIconTest = `delete-${reminderListData['data'][0].id}`;
	let subject = screen.getByTestId(deleteIconTest);
	await act(async () => {
		fireEvent.click(subject);
	});
	subject = screen.getByText('Confirm Deletion', { exact: false });
	expect(subject).toBeInTheDocument();

	let confirmButton = screen.getByRole('button', { name: 'Confirm' });
	await act(async () => {
		fireEvent.click(confirmButton);
		await wait();
	});
	expect(getAsync).toBeCalled();

	subject = screen.queryByText('Confirm Deletion', { exact: false });
	expect(subject).not.toBeInTheDocument();

	subject = screen.getByTestId(deleteIconTest);
	await act(async () => {
		fireEvent.click(subject);
	});
	subject = screen.getByText('Confirm Deletion', { exact: false });
	expect(subject).toBeInTheDocument();

	confirmButton = screen.getByRole('button', { name: 'Confirm' });
	getAsync.mockRejectedValue({
		response: {
			data: {
				message: 'Sorry bro',
			},
		},
	});
	await act(async () => {
		fireEvent.click(confirmButton);
		await wait();
	});
	expect(getAsync).toBeCalled();

	subject = screen.queryByText('Confirm Deletion', { exact: false });
	expect(subject).not.toBeInTheDocument();
	subject = screen.queryByText('Sorry', { exact: false });
	expect(subject).toBeInTheDocument();
});
test('shows results and one set detail', async () => {
	let reminderListData = reminderSetListFilled();
	useReminderSetList.mockReturnValue([reminderListData, false, false]);
	let navigateFunction = jest.fn();
	useNavigate.mockReturnValue(navigateFunction);
	await act(async () => {
		render(<ListSet />);
		await wait();
	});
	let editIconText = `edit-${reminderListData['data'][0].id}`;
	let subject = screen.getByTestId(editIconText);
	await act(async () => {
		fireEvent.click(subject);
	});
	expect(navigateFunction).toHaveBeenCalledWith(`/set/edit/${reminderListData['data'][0].id}`);
});
