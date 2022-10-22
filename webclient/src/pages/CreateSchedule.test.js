import { render, screen, fireEvent } from '@testing-library/react';
import CreateSchedule from './CreateSchedule';
import useServerCall from '../hooks/useServerCall';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { UserContext } from '../models/UserContext';

import { useNavigate, useParams } from 'react-router-dom';

const wait = async () => {
	new Promise(function (resolve) {
		setTimeout(resolve, 100);
	});
};

jest.mock('react-router-dom', () => {
	return {
		useNavigate: jest.fn(),
		useParams: jest.fn(),
	};
});

test('Does not change the date automatically once set by the user', () => {
	useNavigate.mockReturnValue(() => {});
	useParams.mockReturnValue({ id: false });
	render(
		<UserContext.Provider value={{ user: { uid: '123123' } }}>
			<CreateSchedule />}
		</UserContext.Provider>,
	);
	screen.debug();
});
