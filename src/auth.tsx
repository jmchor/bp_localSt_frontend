/* eslint-disable react-refresh/only-export-components */
import { graphql } from 'gql.tada';
import { createContext, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { User } from './types/user';
import { flushSync } from 'react-dom';

export const CURRENT_USER = graphql(`
	query CurrentUser {
		currentUser {
			username
			email
			imageUrl
			_id
		}
	}
`);

export interface AuthContext {
	isLoggedIn: boolean;
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	isLoading: boolean;
	withNav: boolean;
	setWithNav: React.Dispatch<React.SetStateAction<boolean>>;

	token: null;
	isContextAuthenticated: false;
	login: () => {};
	logout: () => {};
}

const AuthContext = createContext<AuthContext | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>({} as User);
	const [withNav, setWithNav] = useState<boolean>(true);
	const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const isContextAuthenticated = !!token;

	const { data, loading } = useQuery(CURRENT_USER, {
		context: {
			headers: {
				authorization: token || '',
			},
		},
	});

	useEffect(() => {
		if (data && data.currentUser) {
			setUser(data.currentUser);
			setIsLoggedIn(true);
		}
	}, [data]);

	const login = (newToken: string) => {
		setToken(newToken);
		localStorage.setItem('token', newToken);
	};

	const logout = () => {
		setToken(null);
		localStorage.removeItem('token');
		setIsLoggedIn(false);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				setUser,
				isLoggedIn,
				setIsLoggedIn,

				withNav,
				setWithNav,

				isContextAuthenticated,
				login,
				logout,
				token,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
