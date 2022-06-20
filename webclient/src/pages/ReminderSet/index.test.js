import { render, screen, fireEvent } from '@testing-library/react';
import ReminderSet from './index';
import CreateEdit from '../../components/ReminderSet/CreateEdit';
jest.mock('react-router-dom', () => ({
	useParams: () => {
		return {
			type: 'create',
		};
	},
}));

test('shows create', () => {
	render(<ReminderSet />);
	let subject = screen.queryAllByText('Create');
	expect(subject[0]).toBeInTheDocument();
});
