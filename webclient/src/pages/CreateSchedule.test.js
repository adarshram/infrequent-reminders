import { render, screen, fireEvent } from '@testing-library/react';
import CreateSchedule from './CreateSchedule';
import useServerCall from '../hooks/useServerCall';
import { fakeReminderList } from '../models/mocks/schedules';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { useNavigate, useParams } from 'react-router-dom'; // version 5.2.0
import { useContext } from 'react';
jest.mock('react-router-dom', () => ({
	useNavigate: () => {},
}));

jest.mock('../hooks/useServerCall', () => () => [
	{
		post: () => {
			return Promise.resolve([]);
		},
	},
	[],
	false,
]);
jest.mock('react-router-dom', () => {
	return {
		useNavigate: jest.fn(),
		useParams: jest.fn(),
	};
});
jest.mock('react', () => {
	return {
		useContext: jest.fn(),
	};
});

/*jest.mock('../hooks/useServerCall', ()=> {
      default: () => [
					{
						post: () => {
							return Promise.resolve(fakeList);
						},
					},
					fakeList,
					false,
				];
   });*/
test('renders create', () => {
	useParams.mockReturnValue([]);
	useContext.mockReturnValue({
		user: {
			uid: 123,
		},
	});
	render(<CreateSchedule />);
	screen.debug();
});
