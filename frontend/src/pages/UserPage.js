import * as apiCalls from '../api/apiCalls';

import ProfileCard from '../components/ProfileCard';
import React from 'react';
import * as apiCalls from '../api/apiCalls';
import ProfileCard from '../components/ProfileCard';

class UserPage extends React.Component {
  state = {
    user: undefined,
    userNotFound: false,
    isLoadingUser: false,
  };

  componentDidMount() {
    this.loadUser();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.username !== this.props.match.params.username) {
      this.loadUser();
    }
  }

  loadUser = () => {
    const username = this.props.match.params.username;
    if (!username) return;

    this.setState({ userNotFound: false, isLoadingUser: true });

    const call = apiCalls.getUser(username);
    call
      ?.then((response) => {
        this.setState({ user: response.data, isLoadingUser: false });
      })
      .catch((error) => {
        this.setState({ userNotFound: true, isLoadingUser: false });
      });
  };

  render() {
    let pageContent;
    if (this.state.isLoadingUser) {
      pageContent = (
        <div className="d-flex">
          <div className="spinner-border text-black-50 m-auto">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      );
    } else if (this.state.userNotFound) {
      pageContent = (
        <div className="alert alert-danger text-center">
          <div className="alert-heading">
            <i className="fas fa-exclamation-triangle fa-3x"></i>
          </div>
          <h5>User not found</h5>
        </div>
      );
    } else {
      pageContent = this.state.user && <ProfileCard user={this.state.user} />;
    }

    return <div data-testid="userpage">{pageContent}</div>;
  }
}

UserPage.defaultProps = {
  match: {
    params: {},
  },
};
export default UserPage;
