import { render, screen, fireEvent } from '@testing-library/react';
import CalendarList from './CalendarList';
import { calendarMockData, calendarMockDataDetails } from './calendarMockData';
import useCalendarTasksForMonth from '../../hooks/useCalendarTasksForMonth';
import useCalendarTasksForDay from '../../hooks/useCalendarTasksForDay';
import { act } from 'react-dom/test-utils';
import { format } from 'date-fns';
const wait = async () => {
	new Promise(function (resolve) {
		setTimeout(resolve, 100);
	});
};
jest.mock('../../hooks/useCalendarTasksForMonth', () => jest.fn());
jest.mock('../../hooks/useCalendarTasksForDay', () => jest.fn());

test('shows calendar with dots and clicks on a dot and renders the list for that day', () => {
	useCalendarTasksForMonth.mockReturnValue([calendarMockData, false, false]);
	//useCalendarTasksForDay.mockReturnValue([[], false, false]);
	useCalendarTasksForDay.mockImplementation((params) => {
		if (params && params.date) {
			const currentConvertedDate = format(new Date(params.date), 'MM/dd/yyyy');
			const doesHaveTasks = calendarMockData.find((compareDate) => {
				const compareConvertedDate = format(new Date(compareDate.notification_date), 'MM/dd/yyyy');
				if (compareConvertedDate === currentConvertedDate) {
					return true;
				}
				return false;
			});
			if (doesHaveTasks) {
				return [calendarMockDataDetails, false, false];
			}
		}
		return [[], false, false];
	});

	render(<CalendarList />);
	let subject;
	const clickDateButton = (date) => {
		//format will be Jul 7, 2022
		let dateString = format(date, 'LLL d, yyyy');
		let dateButton = screen.getByRole('button', { name: dateString });
		fireEvent.click(dateButton);
	};

	//make sure the dot is visible
	let isoString = format(new Date(calendarMockData[0].notification_date), 'yyyy-MM-dd');
	let testIdString = `badge-${isoString}`;
	subject = screen.getByTestId(testIdString);
	expect(subject).toBeInTheDocument();

	clickDateButton(new Date(calendarMockData[0].notification_date));
	expect(screen.getByText(calendarMockDataDetails[0].subject)).toBeInTheDocument();

	clickDateButton(new Date());
	expect(screen.queryByText(calendarMockDataDetails[0].subject)).not.toBeInTheDocument();
});
