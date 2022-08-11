import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState, useEffect, useContext } from 'react';
import CreateUpdateForm from './CreateUpdateForm';
import { act } from 'react-dom/test-utils';
import { format, add } from 'date-fns';
const wait = async () => {
	new Promise(function (resolve) {
		setTimeout(resolve, 100);
	});
};

const Dummy = ({ initialFormValues }) => {
	const [formValues, setFormValues] = useState(initialFormValues);

	return (
		<CreateUpdateForm
			formValues={formValues}
			errors={[]}
			messages={[]}
			setFormValues={setFormValues}
		/>
	);
};
test('show create form', async () => {
	const initialFormValues = {
		subject: '',
		description: '',
		frequency: 1,
		id: false,
		notification_date: format(add(new Date(), { weeks: 1 }), 'MM/dd/yyyy'),
		frequency_type: 'w',
		is_active: true,
	};
	await act(async () => {
		await render(<Dummy initialFormValues={initialFormValues} />);
	});
	let subject;
	let dateField = screen.getByLabelText('Enter First Recurring date');
	expect(dateField.value).toBe(initialFormValues.notification_date);

	subject = screen.getByTestId('frequency_type');
	await act(async () => {
		fireEvent.change(subject, { target: { value: 'm' } });
		await wait();
	});
	let expectedDate = add(new Date(), { months: 1 });
	expect(dateField.value).toBe(format(expectedDate, 'MM/dd/yyyy'));

	subject = screen.getByTestId('frequency_type');
	await act(async () => {
		fireEvent.change(subject, { target: { value: 'd' } });
		await wait();
	});
	expectedDate = add(new Date(), { days: 1 });

	subject = screen.getByLabelText('Enter First Recurring date');
	expect(subject.value).toBe(format(expectedDate, 'MM/dd/yyyy'));

	/*act(() => {
		fireEvent.change(subject, { target: { value: 'm' } });
	});
	console.log(subject.value);
	subject = screen.getByLabelText('Enter First Recurring date');
	console.log(subject.value);

	/*
	//let expectedInitialValue = format(add(new Date(), { weeks: 1 }), 'MM/dd/yyyy');
	*/
});
