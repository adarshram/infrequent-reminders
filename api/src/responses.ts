import { Request, Response } from 'express';
export const errorResponse = (res: Response, message: string | Array<string>) => {
	res.status(400);
	res.json({
		error: true,
		message: message,
	});
};

export const successResponse = (res: Response, data: any) => {
	res.json({
		success: true,
		data: data,
	});
};
