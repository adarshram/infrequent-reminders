import React from 'react';
import { TextField, Grid } from '@mui/material';

export default function TitleDescription({ formValues, setFormValues }) {
	const handleChange = (e) => {
		let newFormValues = {
			...formValues,
			[e.target.name]: e.target.value,
		};
		setFormValues(newFormValues);
	};

	return (
		<>
			<Grid item xs={12}>
				<TextField
					required
					fullWidth
					id="subject"
					label="Set Name"
					name="subject"
					value={formValues.subject}
					onChange={handleChange}
					key={`reminder-subject`}
				/>
			</Grid>
			<Grid item xs={12}>
				<TextField
					fullWidth
					id="content"
					label="Set Description"
					name="description"
					multiline
					rows={5}
					value={formValues.description}
					onChange={handleChange}
					key={`reminder-content`}
				/>
			</Grid>
		</>
	);
}
