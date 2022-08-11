import React, { useState, useEffect, useContext } from 'react';

import { useParams } from 'react-router-dom'; // version 5.2.0
import useServerCall from '../../hooks/useServerCall';
import CreateEdit from '../../components/ReminderSet/CreateEdit';
import ListSet from '../../components/ReminderSet/ListSet';
import { UserContext } from '../../models/UserContext';

export default function ReminderSet(props) {
	const { type } = props;
	const params = useParams();
	const [moduleType, setModuleType] = useState(null);
	const [saveNotification, , ,] = useServerCall(`/user/reminderSet/save`);
	const [getReminderSet, , ,] = useServerCall(`/user/reminderSet/get/`);
	const [successMessage, setSuccessMessage] = useState(false);
	const [reminderData, setReminderData] = useState({});
	const userObject = useContext(UserContext);
	const user_id = userObject.user.uid;

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
				setTimeout(100, () => {
					setSuccessMessage(false);
				});
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
		if (user_id && !params.id) {
			setReminderData({});
		}
		if (params.id && user_id) {
			const fetchData = async () => {
				setErrors([]);
				try {
					let results = await getReminderSet.getAsync(params.id);

					if (results.data) {
						setReminderData(results.data);
					}
				} catch (e) {
					if (e?.message) {
						setErrors((previous) => {
							let newState = [...previous, e.message];
							return newState;
						});
						return;
					}
				}
			};
			fetchData();
		}
	}, [params.id, user_id, getReminderSet]);

	const isLoading = moduleType === null;
	if (isLoading) {
		return 'Loading';
	}
	if (moduleType === 'list') {
		return <ListSet />;
	}
	if (moduleType === 'create' || moduleType === 'edit') {
		return (
			<CreateEdit
				onSave={onSave}
				successMessage={successMessage}
				saveErrors={errors}
				reminderData={reminderData}
				data-testid="mytest"
			/>
		);
	}
	return '';
}
