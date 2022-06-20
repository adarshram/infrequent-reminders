import { getAuthenticatedUser } from './utils/firebase';
import { errorResponse } from './responses';
import { Request, Response } from 'express';

const splitBearerToken = (authorizationHeaders: string) => {
	if (!authorizationHeaders) {
		return false;
	}

	const bearer = authorizationHeaders.split(' ');
	let bearerToken = '';
	if (bearer.length) {
		bearerToken = bearer[1];
	}
	return bearerToken;
};

export const authRoute = async function (req: Request, res: Response, next: Function) {
	let idToken = splitBearerToken(req.headers.authorization);
	if (!idToken) {
		return errorResponse(res, 'No Token');
	}
	res.locals.user = false;
	try {
		let authenticatedResults = await getAuthenticatedUser(idToken);
		res.locals.user = authenticatedResults;
		next();
	} catch (e) {
		return errorResponse(res, 'Unauthorized User');
	}
	return true;
};
