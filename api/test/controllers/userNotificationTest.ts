import { expect } from 'chai';
import 'mocha';
import { createConnection } from 'typeorm';
import { getTime } from 'date-fns';
import { Request, Response } from 'express';
import * as userNotifications from '../../src/controllers/userNotifications';
import { format } from 'date-fns';

before(async () => {
	await createConnection();
});
describe('user notification retrieve function tests', () => {
	let mockRequest = {
		body: {
			month: '2022-08',
		},
	} as Request;
	let jsonResponse;
	const mockedResponse = {
		// mock props, methods you use
		setHeader: () => {},
		locals: {
			user: {
				uid: '83zkNxe3BtSpXsFgxrDgw49ktWj2',
			},
		},
		json: (v) => {
			jsonResponse = v;
		},
	} as unknown as Response;

	it('get reminder set list', async () => {
		let fullResults = await userNotifications.list(mockRequest, mockedResponse);
		let firstDate = jsonResponse.data.results[2].notification_date;
		let monthOfRequest = format(firstDate, 'yyyy-MM');
		let newRequest = {
			...mockRequest,
			body: {
				...mockRequest.body,
				month: monthOfRequest,
			},
		} as Request;
		jsonResponse = null;
		await userNotifications.listNotificationsForMonth(newRequest, mockedResponse);
		expect(jsonResponse.data[0].notifications * 1)
			.to.be.a('number')
			.above(0);

		newRequest = {
			...mockRequest,
			body: {
				...mockRequest.body,
				date: firstDate,
			},
		} as Request;
		jsonResponse = null;
		await userNotifications.listNotificationsForDate(newRequest, mockedResponse);
		expect(jsonResponse.data.total * 1)
			.to.be.a('number')
			.above(0);
	});
});
