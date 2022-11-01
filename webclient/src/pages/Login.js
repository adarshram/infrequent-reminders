import React, { useState, useContext } from 'react';
import { Button, Grid } from '@mui/material';
import useFbaseAuthUser from '../hooks/useFbaseAuthUser';
import Signup from '../components/Login/Signup';
import Signin from '../components/Login/Signin';
import FullPageLoader from '../components/Loaders/FullPageLoader';
import { UserContext } from '../models/UserContext';

import { Navigate } from 'react-router-dom';

export default function Login() {
	const userObject = useContext(UserContext);
	const [{ googleSignin, emailPassword }, authErrors] = useFbaseAuthUser(userObject.user);
	const [signUp, showSignup] = useState(false);
	const [signIn, showSignin] = useState(false);
	const initializing = userObject.user === null;
	if (initializing) {
		return 'Please Wait';
	}
	const minHeight = !signUp && !signIn ? '100vh' : '';
	const notLoggedIn = userObject.user === false;
	if (notLoggedIn) {
		return (
			<>
				<Grid
					container
					direction="column"
					justifyContent="space-evenly"
					alignItems="center"
					style={{ minHeight: minHeight }}
				>
					<Grid
						item
						xs={12}
						sx={{
							textAlign: 'center',
						}}
					>
						<Button
							onClick={() => {
								showSignup(false);
								showSignin(false);
								googleSignin();
							}}
						>
							Login With Google
						</Button>

						<Button
							onClick={() => {
								showSignin(false);
								showSignup(true);
							}}
						>
							Create Account
						</Button>
						<Button
							onClick={() => {
								showSignup(false);
								showSignin(true);
							}}
						>
							Login With Email Password
						</Button>
					</Grid>
					<Grid
						item
						xs={4}
						sx={{
							textAlign: 'center',
							justifyContent: 'center',
						}}
					></Grid>
				</Grid>

				{signUp && (
					<Signup
						signupMethod={emailPassword.signup}
						errors={authErrors.length ? authErrors : false}
					/>
				)}
				{signIn && (
					<Signin
						signinMethod={emailPassword.signin}
						errors={authErrors.length ? authErrors : false}
					/>
				)}
			</>
		);
	}

	if (userObject.user) {
		return <Navigate to="/list" />;
	}
	return <FullPageLoader />;
}
