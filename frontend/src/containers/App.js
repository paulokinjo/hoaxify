import { Route, Switch } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import React from 'react';
import TopBar from '../components/TopBar.js';
import UserPage from '../pages/UserPage';
import UserSignupPage from '../pages/UserSignupPage';

const App = () => {
  return (
    <div>
      <TopBar />
      <div className="container">
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={UserSignupPage} />
          <Route path="/:username" component={UserPage} />
        </Switch>
      </div>
    </div>
  );
};

export default App;
