import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useFbaseAuthUser from '../hooks/useFbaseAuthUser';
import { Navigate } from 'react-router-dom';

export default function AuthModule({ setUserObject }) {
	const [fBaseUser, dbUser, googleSignin] = useFbaseAuthUser();
	useEffect(() => {
		const loggedIn = fBaseUser && dbUser;
		if (loggedIn) {
			setUserObject(dbUser);
		}
	}, [fBaseUser, dbUser]);

	const loggedInHasNoProfile = fBaseUser && dbUser === false;
	if (loggedInHasNoProfile) {
		return <Navigate to="/userProfile" />;
	}

	const notLoggedIn = fBaseUser === false && dbUser === false;
	if (notLoggedIn) {
		return <Navigate to="/userProfile" />;
	}

	return null;
}
