/*import React, { useState, useEffect } from 'react';
import {
	List,
	ListItem,
	Divider,
	ListItemText,
	Typography,
	IconButton,
	ListItemIcon,
	Box,
	Paper,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	DialogContentText,
} from '@mui/material';
//import { getCollectionById, searchCollection, updateCollection } from '../api/fireBaseUtility';
import DbUser from '../models/db/user';

export default function FirestoreModule() {
	let userInstance = new DbUser();
	userInstance.add({
		first_name: 'Adarsh1',
		last_name: 'Ram1',
		id: 1709,
	});

	getCollectionById('cities', 'SFO').then((data) => {
		console.log(data);
	});
	searchCollection('cities', 'name', '==', 'San Francisco').then((data) => {
		console.log(data);
	});
	updateCollection('cities', { dummy: 'sdfsdf' }, 'SFO').then((data) => {
		console.log(data);
	});

	return 'i come here';
}
*/
