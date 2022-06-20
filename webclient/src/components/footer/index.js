import React from 'react';
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@mui/material';
import { Add as AddIcon, List as ListIcon } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom'; // version 5.2.0

export default function Footer({ match }) {
	let navigate = useNavigate();

	const moveTo = (link) => {
		navigate(link);
	};

	return (
		<SpeedDial
			ariaLabel="SpeedDial basic example"
			sx={{ position: 'absolute', bottom: 16, right: 16 }}
			icon={<SpeedDialIcon />}
		>
			<SpeedDialAction
				key={'Add'}
				icon={<AddIcon />}
				tooltipTitle={'Add'}
				onClick={() => moveTo('/create')}
			/>
			<SpeedDialAction
				key={'List'}
				icon={<ListIcon />}
				tooltipTitle={'List'}
				onClick={() => moveTo('/list')}
			/>
		</SpeedDial>
	);
}
