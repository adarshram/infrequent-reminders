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
		refreshToken:
			'AOEOulZR5Itzn0mAM_uiDd9O_8Zx5JGfvOIS3JW7G2aQq8PDZfImUAtdHKydnjGuklNRr9QifcGgoNYhrXHkz2t-EWp3z9alQNcRIGx_wPimsy7LAEmJk9HCsMzpwXusNcqFs4u-nMCnJ20kU41rajtwioFKxUuWOjLNSgHdi8TJudQqpEjIgmr9v7RFT1KG_bnREJHGnJCav3RftUu8xjyQCBDLO0fIMKaM6rAKWgRyd-x6y4QHhedc16u3sEvuRp-YzCfJcHYmiTuPa2fjURNoDCkQ1B8IhP2gKYhDmprQOYx0PD_4m_XuFBC16Oo9w1UfYAST3eOmeYGwyLCO15Mfx1BQKtAq2O_sFH5_g9Q25A-n0peSBJE6CR0jKEBGvpyEEA4ngA90oW5-7vnPvyoxUQHFhy18poGzT0Bjk5X2K5OFUePyOkQn0Oj06sjXVO6efXkVZNJ9',
		accessToken:
			'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ3YjE5MTI0MGZjZmYzMDdkYzQ3NTg1OWEyYmUzNzgzZGMxYWY4OWYiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQWRhcnNocmFtIEFuYW50aGFyYW1hbiIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQU9oMTRHanNTRWNDajIyWThrSXhMSVhFUEk5RnhCZDdaTkhMaEtmMXNGZGJLZ1E9czk2LWMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vaW5mcmVxdWVudC1zY2hlZHVsZXIiLCJhdWQiOiJpbmZyZXF1ZW50LXNjaGVkdWxlciIsImF1dGhfdGltZSI6MTY0NDIzNTU1OCwidXNlcl9pZCI6IjgzemtOeGUzQnRTcFhzRmd4ckRndzQ5a3RXajIiLCJzdWIiOiI4M3prTnhlM0J0U3BYc0ZneHJEZ3c0OWt0V2oyIiwiaWF0IjoxNjY3OTA5OTg2LCJleHAiOjE2Njc5MTM1ODYsImVtYWlsIjoiYWRhcnNocmFtQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTA2NjY0Mzk5OTE3NDc2NDg0MzU3Il0sImVtYWlsIjpbImFkYXJzaHJhbUBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJnb29nbGUuY29tIn19.JEI0xF_2JzEoMl5BxhiE-svvuKQM_XPPvBAQlsJWbPJtZKmDeI7ewU6YMnB5D8A0nxOxQkeFPxDt5CeM6Fj7x6B-Dr6tFGDG32rWi013d65F3LNhvsTHdefpR0vL1IodoIUWFNzAW7uOuQnruJK2ictgrpkOlwx8I2eEKMQD73bFcaQXCpmufU-mHG4yWVa0GdOe5Y2K5Ol4ZCUToxPj9W-91K1rWAEHi7EadTjbXq776czlVku08RauUv6YqkHLe0UdRevZhdIU_LrAdLs68M1N7t0OZs8Z4tXw3zTsONtpJByTaLUmhWwyYHUJForMzFSta1SGV3ttlxuBrkRTyg',
		expirationTime: 1667913587085,
	},
	createdAt: '1641814019638',
	lastLoginAt: '1667719230638',
	apiKey: 'AIzaSyAC4cEsmqRUTSNF1VBAiQdsNNNcs4HeWqo',
	appName: '[DEFAULT]',
};
