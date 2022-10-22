import { render, screen, fireEvent } from '@testing-library/react';
import CreateSchedule from './CreateSchedule';
import useServerCall from '../hooks/useServerCall';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { UserContext } from '../models/UserContext';
import CreateUpdateForm from '../components/Schedules/CreateUpdateForm';
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
jest.mock('../components/Schedules/CreateUpdateForm', () => jest.fn());
const Dummy = () => {
	return <div data-testid="createupdateForm"></div>;
};
test('Renders create update form', () => {
	useNavigate.mockReturnValue(() => {});
	useParams.mockReturnValue({ id: false });
	CreateUpdateForm.mockImplementation(Dummy);
	render(
		<UserContext.Provider value={{ user: { uid: '123123' } }}>
			<CreateSchedule />}
		</UserContext.Provider>,
	);

	expect(screen.getByTestId('createupdateForm')).toBeInTheDocument();
});
