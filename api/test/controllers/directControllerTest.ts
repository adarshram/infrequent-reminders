import { expect } from 'chai';
import 'mocha';
import { createConnection } from 'typeorm';
import { getTime } from 'date-fns';
import { Request, Response } from 'express';
import * as reminderSet from '../../src/controllers/reminderSet';
before(async () => {
	await createConnection();
});
describe('save new reminder set', () => {
	const mockRequest = {
		body: {
			firstName: 'J',
			lastName: 'Doe',
			email: 'jdoe@abc123.com',
			password: 'Abcd1234',
			passwordConfirm: 'Abcd1234',
			company: 'ABC Inc.',
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
		let res = await reminderSet.getReminderSetList(mockRequest, mockedResponse);
		expect(jsonResponse.data.data[0].id).to.be.a('number');
		expect(jsonResponse.success).to.be.equal(true);
	});
});
