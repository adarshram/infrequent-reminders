import _ from 'lodash';
export const getScheduleList = async () => {
	let list = localStorage.getItem('scheduleList');
	let returnValue = [];
	if (list) {
		returnValue = JSON.parse(list);
	}
	return returnValue;
};

export const saveNotificationList = async (values) => {
	let scheduleList = await getScheduleList();
	if (!scheduleList) {
		scheduleList = [];
	}
	let id = 1;
	if (scheduleList.length) {
		let lastElement = _.last(scheduleList);
		console.log(lastElement.id);
		id = lastElement.id;
	}
	let insertValues = {
		id: ++id,
		...values,
	};
	scheduleList.push(insertValues);
	localStorage.setItem('scheduleList', JSON.stringify(scheduleList));
	return id;
};

export const deleteSchedule = async (id) => {
	let scheduleList = await getScheduleList();
	if (!scheduleList) {
		scheduleList = [];
	}
	let newScheduleList = scheduleList.filter((value) => value.id !== id);
	localStorage.setItem('scheduleList', JSON.stringify(newScheduleList));
	return newScheduleList;
};

export const saveLocalReferenceId = (referenceId) => {
	localStorage.setItem('localReferenceId', referenceId);
};

export const getLocalReferenceId = () => {
	return localStorage.getItem('localReferenceId');
};
