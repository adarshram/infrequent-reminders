import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from './Dashboard';
import useServerCall from '../hooks/useServerCall';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { UserContext } from '../models/UserContext';
import CalendarList from '../components/Schedules/CalendarList';
jest.mock('../components/Schedules/CalendarList', () => () => {
	return <div data-testid="calender-list"></div>;
});
test('Shows Calendar Once Logged in ', () => {
	render(
		<UserContext.Provider value={{ user: { uid: '123123' } }}>
			<Dashboard />}
		</UserContext.Provider>,
	);
	expect(screen.getByTestId('calender-list')).toBeInTheDocument();
});
