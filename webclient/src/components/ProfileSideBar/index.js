import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { PersonRounded } from '@mui/icons-material';

export default function ProfileSideBar() {
	const pages = [
		{
			name: 'Profile',
			path: 'userProfile',
			icon: PersonRounded,
		},
		{
			name: 'Notifications',
			path: 'notificationManager',
			icon: PersonRounded,
		},
	];
	return (
		<List component="div">
			{pages.map((page) => (
				<ListItem key={page.name} button component={NavLink} to={`/${page.path}`} divider>
					<ListItemIcon>
						<page.icon color="primary" />
					</ListItemIcon>
					<ListItemText primary={page.name} />
				</ListItem>
			))}
		</List>
	);
}
