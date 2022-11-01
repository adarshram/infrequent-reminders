import React, { useState } from 'react';
import { Button, TextField, Box, Grid, Typography, Paper, Alert } from '@mui/material';
export default function Signup({ signupMethod, errors }) {
	const [formValues, setFormValues] = useState({
		first_name: '',
		last_name: '',
		email: '',
		password: '',
	});
	const handleSubmit = async (event) => {
		event.preventDefault();
		await signupMethod(formValues.email, formValues.password);
	};
	const handleChange = (e) => {
		setFormValues({
			...formValues,
			[e.target.name]: e.target.value,
		});
	};

	const { email, first_name, last_name, password } = formValues;
	return (
		<Grid container direction="row" justifyContent="center">
			<Grid
				item
				xs={12}
				md={6}
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
						Signup
					</Typography>
					<Box
						component="form"
						noValidate
						onSubmit={handleSubmit}
						sx={{ mt: 3, textAlign: 'center' }}
					>
						{errors &&
							errors.map((err, key) => {
								return (
									<Alert key={key} severity="error">
										{err}
									</Alert>
								);
							})}
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<TextField
									required
									fullWidth
									id="first_name"
									label="User First Name"
									name="first_name"
									value={first_name}
									onChange={handleChange}
									autoFocus
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									required
									fullWidth
									id="last_name"
									label="User Last Name"
									name="last_name"
									value={last_name}
									onChange={handleChange}
								/>
							</Grid>
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
