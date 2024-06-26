import { useMutation } from '@apollo/client';
import { graphql } from 'gql.tada';
import { useAuth } from '../auth';
import { flushSync } from 'react-dom';
import { useNavigate } from '@tanstack/react-router';
import Form from '../styles/Form.js';
import { useState } from 'react';

import { SigninFormWrapper } from '../styles/SigninForm.js';

const LOGIN = graphql(`
	mutation Login($credentials: LoginInput!) {
		login(credentials: $credentials) {
			value
			isAuthenticated
		}
	}
`);

const SigninForm: React.FC = () => {
	const [loginMutation, { loading, error }] = useMutation(LOGIN);
	const navigate = useNavigate();
	const { login, isContextAuthenticated } = useAuth();

	const [formData, setFormData] = useState({
		input: '',
		password: '',
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const { data } = await loginMutation({
				variables: {
					credentials: formData,
				},
			});

			login(data?.login?.value);

			if (data?.login?.isAuthenticated) {
				navigate({ to: '/home' });
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<SigninFormWrapper>
			<Form onSubmit={handleLogin}>
				<label htmlFor='usernameOrEmail'>
					Username or Email:
					<input
						type='text'
						id='input'
						name='input'
						value={formData.input}
						onChange={handleInputChange}
						autoComplete='on'
					/>
				</label>
				<label htmlFor='password'>
					Password:
					<input
						type='password'
						id='password'
						name='password'
						value={formData.password}
						onChange={handleInputChange}
						autoComplete='on'
					/>
				</label>

				<button type='submit' disabled={loading}>
					{loading ? 'Logging in...' : 'Login'}
				</button>
			</Form>
			{error ? (
				<p>{error.message}</p>
			) : (
				<p>
					{' '}
					<br />
				</p>
			)}
			<p>No Account Yet?</p>
			<button
				onClick={() => {
					navigate({ to: '/signup' });
				}}
			>
				Sign Up
			</button>
		</SigninFormWrapper>
	);
};

export default SigninForm;
