import { useState, useEffect } from 'react';
import useServerCall from './useServerCall';

const useGetReminderSetById = (id) => {
	const [data, setData] = useState(false);
	const [errors, setErrors] = useState([]);
	const [loading] = useState(false);
	const [listCall, , , ,] = useServerCall('/user/reminderSet/get/');
	useEffect(() => {
		let mounted = true;
		if (id) {
			const getResults = async () => {
				var results = await listCall.getAsync(id);
				if (mounted) {
					if (results.success) {
						setData(results.data);
					}

					if (!results.success) {
						setData(false);
						setErrors([results.message ? results.message : 'Unable to fetch Set List']);
					}
				}
			};
			getResults();
		}
		return () => {
			mounted = false;
		};
	}, [id, listCall]);

	return [data, loading, errors];
};

export default useGetReminderSetById;
