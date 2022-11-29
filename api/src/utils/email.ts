export const sendSimpleEmail = async (email: string, subject: string, body: string) => {
	let nodemailer = require('nodemailer');
	let transporter = nodemailer.createTransport({
		host: 'smtp.sendgrid.net',
		port: 465,
		secure: true,
		auth: {
			user: 'apikey',
			pass: process.env.SENDGRIDPASSWORD ?? '',
		},
	});
	let success = false;
	let errors = [];
	let mailOptions = {
		from: 'adarsh.developer@gmail.com',
		to: email,
		subject: subject,
		text: body,
	};
	let response = '';
	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			success = false;
			errors.push(error);
		} else {
			success = true;
			response = info.response;
			error = [];
		}
	});

	return { success, errors, response };
};
