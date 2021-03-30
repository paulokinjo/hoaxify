import { fireEvent, render, waitFor } from '@testing-library/react';

import App from './App';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import React from 'react';
import axios from 'axios';
import configureStore from '../redux/configureStore';

const setup = (path) => {
  const store = configureStore(false);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </Provider>
  );
};

const changeEvent = (content) => {
  return {
    target: {
      value: content,
    },
  };
};

beforeEach(() => {
  localStorage.clear();
  delete axios.defaults.headers.common['Authorization'];
});

describe('App', () => {
  it('display homepage when url is /', () => {
    const { queryByTestId } = setup('/');

    expect(queryByTestId('homepage')).toBeInTheDocument();
  });

  it('displays LoginPage when url is /login', () => {
    const { container } = setup('/login');
    const header = container.querySelector('h1');
    expect(header).toHaveTextContent('Login');
  });

  it('displays only LoginPage when url is /login', () => {
    const { queryByTestId } = setup('/login');

    expect(queryByTestId('homepage')).not.toBeInTheDocument();
  });

  it('displays UserSignup when url is /signup', () => {
    const { container } = setup('/signup');
    const header = container.querySelector('h1');
    expect(header).toHaveTextContent('Sign Up');
  });

  it('display userpage when url is other than /, /login or /signup', () => {
    const { queryByTestId } = setup('/user1');

    expect(queryByTestId('userpage')).toBeInTheDocument();
  });

  it('displays topBar when url is /', () => {
    const { container } = setup('/');
    const navigation = container.querySelector('nav');
    expect(navigation).toBeInTheDocument();
  });

  it('displays topBar when url is /login', () => {
    const { container } = setup('/login');
    const navigation = container.querySelector('nav');
    expect(navigation).toBeInTheDocument();
  });

  it('displays topBar when url is /signup', () => {
    const { container } = setup('/signup');
    const navigation = container.querySelector('nav');
    expect(navigation).toBeInTheDocument();
  });

  it('displays topBar when url is /user1', () => {
    const { container } = setup('/user1');
    const navigation = container.querySelector('nav');
    expect(navigation).toBeInTheDocument();
  });

  it('shows the UserSignupPage when clicking signup', () => {
    const { queryByText, container } = setup('/');
    const signupLink = queryByText('Sign Up');
    fireEvent.click(signupLink);
    const header = container.querySelector('h1');
    expect(header).toHaveTextContent('Sign Up');
  });

  it('shows the LoginPage when clicking login', () => {
    const { queryByText, container } = setup('/');
    const loginLink = queryByText('Login');
    fireEvent.click(loginLink);
    const header = container.querySelector('h1');
    expect(header).toHaveTextContent('Login');
  });

  it('shows the HomePage when clicking logo', () => {
    const { queryByTestId, container } = setup('/login');
    const logo = container.querySelector('img');
    fireEvent.click(logo);
    expect(queryByTestId('homepage')).toBeInTheDocument();
  });

  it('displays My Profile on TopBar after login success', async () => {
    const { queryByPlaceholderText, container, queryByText } = setup('/login');
    const usernameInput = queryByPlaceholderText('Your username');
    fireEvent.change(usernameInput, changeEvent('user1'));

    const passwordInput = queryByPlaceholderText('Your password');
    fireEvent.change(passwordInput, changeEvent('P4ssword'));
    const button = container.querySelector('button');

    axios.post = jest.fn().mockResolvedValue({
      data: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png',
      },
    });

    fireEvent.click(button);

    await waitFor(() => expect(queryByText('My Profile')).toBeInTheDocument());
  });

  it('displays My Profile on Topbar after signup success', async () => {
    const { queryByPlaceholderText, container, queryByText } = setup('/signup');

    const displayNameInput = queryByPlaceholderText('Your display name');
    const usernameInput = queryByPlaceholderText('Your username');
    const passwordInput = queryByPlaceholderText('Your password');
    const passwordRepeateInput = queryByPlaceholderText('Repeat your password');

    fireEvent.change(displayNameInput, changeEvent('display1'));
    fireEvent.change(usernameInput, changeEvent('user1'));
    fireEvent.change(passwordInput, changeEvent('P4ssword'));
    fireEvent.change(passwordRepeateInput, changeEvent('P4ssword'));

    const button = container.querySelector('button');
    axios.post = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          message: 'User saved',
        },
      })
      .mockResolvedValueOnce({
        data: {
          id: 1,
          username: 'user1',
          displayName: 'display1',
          image: 'profile1',
        },
      });
    fireEvent.click(button);

    await waitFor(() => expect(queryByText('My Profile')).toBeInTheDocument());
  });

  it('saves logged in user data to localStorage after login success', async () => {
    const { queryByPlaceholderText, container, queryByText } = setup('/login');
    const usernameInput = queryByPlaceholderText('Your username');
    fireEvent.change(usernameInput, changeEvent('user1'));
    const passwordInput = queryByPlaceholderText('Your password');
    fireEvent.change(passwordInput, changeEvent('P4ssword'));

    const button = container.querySelector('button');
    axios.post = jest.fn().mockResolvedValue({
      data: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png',
      },
    });

    fireEvent.click(button);

    await waitFor(() => queryByText('My Profile'));

    const dataInStorage = JSON.parse(localStorage.getItem('hoax-auth'));
    expect(dataInStorage).toEqual({
      id: 1,
      username: 'user1',
      displayName: 'display1',
      image: 'profile1.png',
      password: 'P4ssword',
      isLoggedIn: true,
    });
  });

  it('displays logged in topBar when storage has logged in user data', () => {
    localStorage.setItem(
      'hoax-auth',
      JSON.stringify({
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png',
        password: 'P4ssword',
        isLoggedIn: true,
      })
    );

    const { queryByText } = setup('/');
    const myProfileLink = queryByText('My Profile');
    expect(myProfileLink).toBeInTheDocument();
  });

  it('sets axios authorization with base64 encoded user credentials after login success', async () => {
    const { queryByPlaceholderText, container, queryByText } = setup('/login');
    const usernameInput = queryByPlaceholderText('Your username');
    fireEvent.change(usernameInput, changeEvent('user1'));
    const passwordInput = queryByPlaceholderText('Your password');
    fireEvent.change(passwordInput, changeEvent('P4ssword'));

    const button = container.querySelector('button');
    axios.post = jest.fn().mockResolvedValue({
      data: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png',
      },
    });

    fireEvent.click(button);

    await waitFor(() => queryByText('My Profile'));

    const axiosAuthorization = axios.defaults.headers.common['Authorization'];
    const encoded = btoa('user1:P4ssword');
    const expectedAuthorization = `Basic ${encoded}`;
    expect(axiosAuthorization).toBe(expectedAuthorization);
  });

  it('sets axios authorization with base64 encoded user credentials when storage has logged in user', async () => {
    localStorage.setItem(
      'hoax-auth',
      JSON.stringify({
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png',
        password: 'P4ssword',
        isLoggedIn: true,
      })
    );

    setup('/');
    const axiosAuthorization = axios.defaults.headers.common['Authorization'];
    const encoded = btoa('user1:P4ssword');
    const expectedAuthorization = `Basic ${encoded}`;
    expect(axiosAuthorization).toBe(expectedAuthorization);
  });

  it('removes axios authorization header when user logout', async () => {
    localStorage.setItem(
      'hoax-auth',
      JSON.stringify({
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png',
        password: 'P4ssword',
        isLoggedIn: true,
      })
    );

    const { queryByText } = setup('/');
    fireEvent.click(queryByText('Logout'));

    const axiosAuthorization = axios.defaults.headers.common['Authorization'];

    expect(axiosAuthorization).toBeFalsy();
  });
});