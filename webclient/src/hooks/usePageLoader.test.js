import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import usePageLoader from './usePageLoader';

import { getAuth } from 'firebase/auth';
const DummyModule = () => {
	const [userObject, loading] = usePageLoader();
	return (
		<>{userObject && <input data-testid="user-id" defaultValue={userObject.uid} readOnly />}</>
	);
};
jest.mock('firebase/auth', () => {
	return {
		getAuth: jest.fn(),
	};
});

const tearDown = () => {
	jest.resetAllMocks();
};

test('Loads user and profileObject', async () => {
	getAuth.mockImplementation(() => {
		return {
			onAuthStateChanged: (v) => {
				v(signedInUserObject);
			},
		};
	});
	act(() => {
		render(<DummyModule />);
	});
	expect(screen.getByTestId('user-id')).toBeInTheDocument();
});

const signedInUserObject = {
	uid: '83zkNxe3BtSpXsFgxrDgw49ktWj2',
	email: 'adarshram@gmail.com',
	emailVerified: true,
	displayName: 'Adarshram Anantharaman',
	isAnonymous: false,
	photoURL:
		'https://lh3.googleusercontent.com/a-/AOh14GjsSEcCj22Y8kIxLIXEPI9FxBd7ZNHLhKf1sFdbKgQ=s96-c',
	providerData: [
		{
			providerId: 'google.com',
			uid: '106664399917476484357',
			displayName: 'Adarshram Anantharaman',
			email: 'adarshram@gmail.com',
			phoneNumber: null,
			photoURL:
				'https://lh3.googleusercontent.com/a/ALm5wu1eFeiZ7FqRTHG-5iMnlo-kOXXks7joH8Uotp8yP6I=s96-c',
		},
	],
	stsTokenManager: {
		refreshToken: 'refreshToken',
		accessToken: 'accessToken',
		expirationTime: 1667913587085,
	},
	createdAt: '1641814019638',
	lastLoginAt: '1667719230638',
	apiKey: 'apiKey',
	appName: '[DEFAULT]',
};
