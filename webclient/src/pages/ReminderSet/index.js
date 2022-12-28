import React, { useState, useEffect, useContext } from 'react';

import { useParams } from 'react-router-dom'; // version 5.2.0
import useServerCall from '../../hooks/useServerCall';
import useGetReminderSetById from '../../hooks/useGetReminderSetById';

import CreateEdit from '../../components/ReminderSet/CreateEdit';
import ListSet from '../../components/ReminderSet/ListSet';
import { UserContext } from '../../models/UserContext';
import { useNavigate } from 'react-router-dom'; // version 5.2.0

export default function ReminderSet(props) {
	let navigate = useNavigate();
	const { type } = props;
	const params = useParams();
	const [moduleType, setModuleType] = useState(null);
	const [saveNotification, , ,] = useServerCall(`/user/reminderSet/save`);

	const [successMessage, setSuccessMessage] = useState(false);
	const [reminderData, setReminderData] = useState(null);
	const userObject = useContext(UserContext);
	const user_id = userObject.user.uid;
	const shouldLoadReminders = moduleType === 'edit' && user_id && params?.id;
	const [reminderSetData, ,] = useGetReminderSetById(shouldLoadReminders ? params.id : null);

	const [errors, setErrors] = useState([]);

	const onSave = async ({ formValues, reminders }) => {
		setErrors([]);
		setSuccessMessage(false);
		try {
			let results = await saveNotification.postAsync({
				formValues,
				reminders,
			});
			if (results) {
				setSuccessMessage(`Successfully Saved Set ${formValues.subject}`);
				setTimeout(() => {
					setSuccessMessage(false);
					navigate('/set/list');
				}, 1000);

				return;
			}
		} catch (e) {
			setSuccessMessage(false);
			if (e?.message) {
				setErrors((previous) => {
					let newState = [...previous, e.message];
					return newState;
				});
				return;
			}
		}

		setErrors((previous) => {
			let newState = [...previous, 'Unknown Error'];
			return newState;
		});
	};
	const onCancel = () => {
		navigate('/set/list');
	};

	useEffect(() => {
		if (params.type === 'create') {
			setModuleType(params.type);
		}
		if (params.type === 'edit' && params.id) {
			setModuleType(params.type);
		}
		if (params.type === 'list') {
			setModuleType(params.type);
		}
	}, [type, params]);

	useEffect(() => {
		if (shouldLoadReminders) {
			if (reminderSetData) {
				console.log(reminderSetData);
				setReminderData(reminderSetData);
			}
		}
		if (!params.id || reminderSetData === false) {
			setReminderData({});
		}
	}, [reminderSetData, params.id, shouldLoadReminders]);

	const isLoading = moduleType === null || !user_id;
	if (isLoading) {
		return 'Loading';
	}
	if (moduleType === 'list') {
		return <ListSet />;
	}
	if (reminderData && (moduleType === 'create' || moduleType === 'edit')) {
		return (
			<CreateEdit
				onSave={onSave}
				onCancel={onCancel}
				successMessage={successMessage}
				saveErrors={errors}
				reminderData={reminderData}
				data-testid="mytest"
			/>
		);
	}
	return '';
}
