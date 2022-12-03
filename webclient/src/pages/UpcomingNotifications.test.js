import { render, screen, fireEvent } from '@testing-library/react';
import UpcomingNotifications from './UpcomingNotifications';

import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { UserContext } from '../models/UserContext';
import useTodaysNotifications from '../hooks/useTodaysNotifications';
import useServerCall from '../hooks/useServerCall';

import { useNavigate, useParams } from 'react-router-dom';

const wait = async () => {
	new Promise(function (resolve) {
		setTimeout(resolve, 100);
	});
};

jest.mock('../hooks/useTodaysNotifications', () => jest.fn());
jest.mock('../hooks/useServerCall', () => jest.fn());

jest.mock('react-router-dom', () => {
	return {
		useNavigate: jest.fn(),
		useParams: jest.fn(),
	};
});

test('Renders No Upcoming Notifications', () => {
	useNavigate.mockReturnValue(() => {});
	useParams.mockReturnValue({ id: false });
	useServerCall.mockReturnValue([{}, { data: [] }, false, false]);
	useTodaysNotifications.mockReturnValue([
		[dummyNotification, dummyNotification, dummyNotification],
		false,
		false,
		(v) => console.log(v),
	]);
	render(
		<UserContext.Provider value={{ user: { uid: '123123' } }}>
			<UpcomingNotifications />}
		</UserContext.Provider>,
	);

	expect(
		screen.queryByText('No upcoming Notifications Found', { exact: false }),
	).toBeInTheDocument();
});
test('Renders Upcoming Notifications', () => {
	useNavigate.mockReturnValue(() => {});
	useParams.mockReturnValue({ id: false });
	useServerCall.mockReturnValue([
		{},
		{ data: [dummyNotification, dummyNotification, dummyNotification] },
		false,
		false,
	]);
	useTodaysNotifications.mockReturnValue([[], false, false, (v) => console.log(v)]);
	render(
		<UserContext.Provider value={{ user: { uid: '123123' } }}>
			<UpcomingNotifications />}
		</UserContext.Provider>,
	);

	let allMatches = screen.queryAllByText(dummyNotification.subject, { exact: false });
	expect(allMatches[0]).toBeInTheDocument();
});
test('Renders Todays Notifications', () => {
	useNavigate.mockReturnValue(() => {});
	useParams.mockReturnValue({ id: false });
	useServerCall.mockReturnValue([{}, { data: [] }, false, false]);
	let upcomingNotification = {
		...dummyNotification,
		subject: 'Upcoming sdfsdfs',
	};
	useTodaysNotifications.mockReturnValue([
		[upcomingNotification, upcomingNotification, upcomingNotification],
		false,
		false,
		(v) => console.log(v),
	]);
	render(
		<UserContext.Provider value={{ user: { uid: '123123' } }}>
			<UpcomingNotifications />}
		</UserContext.Provider>,
	);
	let allMatches = screen.queryAllByText(upcomingNotification.subject, { exact: false });
	expect(allMatches[0]).toBeInTheDocument();
});

const dummyNotification = {
	id: '581',
	user_id: '83zkNxe3BtSpXsFgxrDgw49ktWj2',
	subject: 'Pending Reminder1',
	description: 'PEnding1',
	frequency_type: 'w',
	frequency: 1,
	is_active: true,
	notification_date: '2022-12-01T18:30:00.000Z',
	created_at: '2022-08-16T18:30:00.000Z',
	updated_at: '2022-08-16T18:30:00.000Z',
	meta_notifications: {
		id: 191,
		user_id: '83zkNxe3BtSpXsFgxrDgw49ktWj2',
		cron_snoozed: 4,
		user_snoozed: 0,
		done_count: 0,
		updated_at: '2022-08-16T18:30:00.000Z',
	},
};
