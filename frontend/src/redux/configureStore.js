import * as apiCalls from '../api/apiCalls';

import { applyMiddleware, createStore } from 'redux';

import authReducer from './authReducer';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

const configureStore = (addLogger = true) => {
  let localStorageData = localStorage.getItem('hoax-auth');
  let presistedState = {
    id: 0,
    username: '',
    displayName: '',
    image: '',
    password: '',
    isLoggedIn: false,
  };

  if (localStorageData) {
    try {
      presistedState = JSON.parse(localStorageData);
      apiCalls.setAuthorizationHeader(presistedState);
    } catch (error) {}
  }

  const middleware = addLogger
    ? applyMiddleware(thunk, logger)
    : applyMiddleware(thunk);
  const store = createStore(authReducer, presistedState, middleware);

  store.subscribe(() => {
    localStorage.setItem('hoax-auth', JSON.stringify(store.getState()));
    apiCalls.setAuthorizationHeader(store.getState());
  });

  return store;
};

export default configureStore;
