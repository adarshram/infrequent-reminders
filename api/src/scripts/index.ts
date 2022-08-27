/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */

import { createConnection, getRepository, getManager } from 'typeorm';

import { runDailyCron } from './dailyUpdates';
import { getMessagingObject } from '../utils/firebase';
export const runCronTs = async () => {
	await createConnection();
	await getMessagingObject();
	await runDailyCron();
};

export const runCron = (event, context) => {
	const message = event.data ? Buffer.from(event.data, 'base64').toString() : 'Hello, World';
	console.log(message);
	console.log('Hello Bruh');
	runCronTs();
};
