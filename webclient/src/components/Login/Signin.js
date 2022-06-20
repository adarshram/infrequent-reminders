import React, { useState } from 'react';

import { Button, TextField, Box, Grid, Typography, Paper } from '@mui/material';
export default function Signin({ signinMethod }) {
	const [formValues, setFormValues] = useState({
		email: '',
		password: '',
	});
	const handleSubmit = async (event) => {
		event.preventDefault();
		let signedUp = await signinMethod(formValues.email, formValues.password);
		console.log(signedUp);
	};
	const handleChange = (e) => {
		setFormValues({
			...formValues,
			[e.target.name]: e.target.value,
		});
	};
	const { email, password } = formValues;

	return (
		<Grid container direction="row" justifyContent="center">
			<Grid
				item
				xs={4}
				sx={{
					textAlign: 'center',
					justifyContent: 'center',
				}}
			>
				<Paper
					elevation={3}
					sx={{
						mt: 3,
						padding: 3,
					}}
				>
					<Typography component="h1" variant="h5">
						Signin
					</Typography>
					<Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<TextField
									fullWidth
									id="email"
									label="User Name"
									name="email"
									value={email}
									onChange={handleChange}
									required
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									fullWidth
									id="password"
									label="Password"
									name="password"
									value={password}
									type="password"
									onChange={handleChange}
									required
								/>
							</Grid>
						</Grid>
						<Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
							Save
						</Button>
					</Box>
				</Paper>
			</Grid>
		</Grid>
	);
}
