import { render, screen, fireEvent } from '@testing-library/react';
import ListSchedules from './ListSchedules';
import useServerCall from '../hooks/useServerCall';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';

jest.mock('react-router-dom', () => ({
	useNavigate: () => {},
}));
let fakeList = {
	success: true,
	data: {
		total: '5',
		results: [
			{
				id: '18',
				user_id: '83zkNxe3BtSpXsFgxrDgw49ktWj2',
				subject: 'Clean Teeth',
				description: '21th January 2022',
				frequency_type: 'm',
				frequency: 6,
				notification_date: '2022-09-09T18:30:00.000Z',
				created_at: '2022-01-24T18:30:00.000Z',
				updated_at: '2022-02-18T18:30:00.000Z',
				is_pending: false,
			},
			{
				id: '29',
				user_id: '83zkNxe3BtSpXsFgxrDgw49ktWj2',
				subject: 'Mutual Fund Axis bank',
				description: 'pay my mutual fund ',
				frequency_type: 'm',
				frequency: 1,
				notification_date: '2022-04-15T18:30:00.000Z',
				created_at: '2022-02-12T18:30:00.000Z',
				updated_at: '2022-02-12T18:30:00.000Z',
				is_pending: true,
			},
			{
				id: '21',
				user_id: '83zkNxe3BtSpXsFgxrDgw49ktWj2',
				subject: 'Bathe Sparky',
				description: 'Bath sparky',
				frequency_type: 'w',
				frequency: 2,
				notification_date: '2022-03-17T18:30:00.000Z',
				created_at: '2022-02-10T18:30:00.000Z',
				updated_at: '2022-02-10T18:30:00.000Z',
				is_pending: true,
			},
			{
				id: '28',
				user_id: '83zkNxe3BtSpXsFgxrDgw49ktWj2',
				subject: 'Clean Fridge',
				description: '',
				frequency_type: 'w',
				frequency: 2,
				notification_date: '2022-03-19T18:30:00.000Z',
				created_at: '2022-02-12T18:30:00.000Z',
				updated_at: '2022-02-18T18:30:00.000Z',
				is_pending: true,
			},
			{
				id: '30',
				user_id: '83zkNxe3BtSpXsFgxrDgw49ktWj2',
				subject: 'Hair Cut',
				description: 'From Uday',
				frequency_type: 'm',
				frequency: 1,
				notification_date: '2022-04-21T18:30:00.000Z',
				created_at: '2022-03-15T18:30:0 0.000Z',
				updated_at: '2022-03-15T18:30:00.000Z',
				is_pending: false,
			},
		],
	},
};

jest.mock('../hooks/useServerCall', () => () => [
	{
		post: () => {
			return Promise.resolve(fakeList);
		},
	},
	fakeList,
	false,
]);

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

test('Shows Confirm Delete', () => {
	render(<ListSchedules />);

	const expandButton = screen.getByTestId('EditIcon');
	expect(expandButton).toBeInTheDocument();
});
