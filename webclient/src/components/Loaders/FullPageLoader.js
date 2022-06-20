import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import DateRangeIcon from '@mui/icons-material/DateRange';
export default function FullPageLoader({ setUserObject }) {
	return (
		<Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
			<DateRangeIcon sx={{ fontSize: 150 }} />
		</Backdrop>
	);
}
