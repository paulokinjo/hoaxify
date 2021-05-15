import * as apiCalls from '../api/apiCalls';

import { fireEvent, render, waitFor } from '@testing-library/react';

import { Provider } from 'react-redux';
import React from 'react';
import UserPage from './UserPage';
import axios from 'axios';
import configureStore from '../redux/configureStore';

const mockSuccessGetUser = {
  data: {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png',
  },
};

const mockSuccessUpdateUser = {
  data: {
    ...mockSuccessGetUser.data,
    displayName: 'display1-update',
    image: 'profile1-update.png',
  },
};

const match = {
  params: {
    username: 'user1',
  },
};

beforeEach(() => {
  localStorage.clear();
  delete axios.defaults.headers.common['Authorization'];
});

const setup = (props) => {
  const store = configureStore(false);
  return render(
    <Provider store={store}>
      <UserPage {...props} />
    </Provider>
  );
};

const setUserOneLoggedInStorage = () => {
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
};

const mockFailGetUser = {
  response: {
    data: {
      message: 'User not found',
    },
  },
};

const mockFailUpdateUser = {
  response: {
    data: {},
  },
};

describe('UserPage', () => {
  describe('Layout', () => {
    it('has root page div', () => {
      const { queryByTestId } = setup();
      const userPageDiv = queryByTestId('userpage');
      expect(userPageDiv).toBeInTheDocument();
    });

    it('displays the displayName@username when user data loaded', async () => {
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      const { findByText } = setup({ match });
      const text = await findByText('display1@user1');
      expect(text).toBeInTheDocument();
    });

    it('displays not found alert when user not found', async () => {
      apiCalls.getUser = jest.fn().mockRejectedValue(mockFailGetUser);
      const { findByText } = setup({ match });
      const alert = await findByText('User not found');
      expect(alert).toBeInTheDocument();
    });

    it('displays spinner while loading user data', () => {
      const mockDelayedResponse = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(mockSuccessGetUser);
          }, 300);
        });
      });

      apiCalls.getUser = mockDelayedResponse;
      const { queryByText } = setup({ match });
      const spinner = queryByText('Loading...');
      expect(spinner).toBeInTheDocument();
    });

    it('displays the edit button when loggedInUser matches to user in url', async () => {
      setUserOneLoggedInStorage();
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      const { queryByText } = setup({ match });
      await waitFor(() => queryByText('display1@user1'));
      const editButton = queryByText('Edit');
      expect(editButton).toBeInTheDocument();
    });
  });

  describe('Lifecycle', () => {
    it('calls getUser when it is rendered', () => {
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      setup({ match });
      expect(apiCalls.getUser).toHaveBeenCalledTimes(1);
    });

    it('calls getUser for user1 when it is rendered with user1 in match', () => {
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      setup({ match });
      expect(apiCalls.getUser).toHaveBeenCalledWith('user1');
    });
  });

  describe('ProfileCard Interactions', () => {
    const mockDelayedUpdateSuccess = () => {
      return jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(mockSuccessGetUser);
          }, 300);
        });
      });
    };

    const setupForEdit = async () => {
      setUserOneLoggedInStorage();
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      const rendered = setup({ match });
      await waitFor(() => fireEvent.click(rendered.queryByText('Edit')));
      return rendered;
    };

    it('displays edit layout when cl icking edit button', async () => {
      const { queryByText } = await setupForEdit();
      expect(queryByText('Save')).toBeInTheDocument();
    });

    it('returns back to none edit mode after clicking cancel', async () => {
      const { queryByText } = await setupForEdit();

      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);

      expect(queryByText('Edit')).toBeInTheDocument();
    });

    it('calls update user api when clicking save', async () => {
      const { queryByText } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);

      expect(apiCalls.updateUser).toHaveBeenCalledTimes(1);
    });

    it('calls updateUser api with user id', async () => {
      const { queryByText } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);

      const userId = apiCalls.updateUser.mock.calls[0][0];

      expect(userId).toBe(1);
    });

    it('calls updateUser api with request body having changed displayName', async () => {
      const { queryByText, container } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const displayInput = container.querySelector('input');
      fireEvent.change(displayInput, { target: { value: 'display1-update' } });

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);

      const requestBody = apiCalls.updateUser.mock.calls[0][1];

      expect(requestBody.displayName).toBe('display1-update');
    });

    it('returns to non edit mode after successful updateUser api call', async () => {
      const { queryByText } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => expect(queryByText('Edit')).toBeInTheDocument());
    });

    it('returns to original displayName after its changed in edit mode but cancelled', async () => {
      const { queryByText, container } = await setupForEdit();
      const displayInput = container.querySelector('input');
      fireEvent.change(displayInput, { target: { value: 'display1-update' } });

      await waitFor(() => fireEvent.click(queryByText('Cancel')));

      await waitFor(() =>
        expect(queryByText('display1@user1')).toBeInTheDocument()
      );
    });

    it('returns to last updated displayName when display name is changed for another time but cancelled', async () => {
      const { queryByText, container } = await setupForEdit();
      let displayInput = container.querySelector('input');
      fireEvent.change(displayInput, { target: { value: 'display1-update' } });
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => fireEvent.click(queryByText('Edit')));

      displayInput = container.querySelector('input');
      fireEvent.change(displayInput, {
        target: { value: 'display1-update-second-time' },
      });

      await waitFor(() => fireEvent.click(queryByText('Cancel')));

      const lastSavedData = container.querySelector('h4');

      expect(lastSavedData).toHaveTextContent('display1-update@user1');
    });

    it('displays spinner when there is updateUser api call', async () => {
      const { queryByText } = await setupForEdit();
      apiCalls.updateUser = mockDelayedUpdateSuccess();

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);

      const spinner = queryByText('Loading...');
      expect(spinner).toBeInTheDocument();
    });

    it('disables save button when there is updateUser api call', async () => {
      const { queryByText } = await setupForEdit();
      apiCalls.updateUser = mockDelayedUpdateSuccess();

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);

      expect(saveButton).toBeDisabled();
    });

    it('disables cancel button when there is updateUser api call', async () => {
      const { queryByText } = await setupForEdit();
      apiCalls.updateUser = mockDelayedUpdateSuccess();

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);

      const cancelButton = queryByText('Cancel');

      expect(cancelButton).toBeDisabled();
    });

    it('enables save button after updateUser api call success', async () => {
      const { queryByText, container } = await setupForEdit();
      let displayInput = container.querySelector('input');
      fireEvent.change(displayInput, { target: { value: 'display1-update' } });
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => fireEvent.click(queryByText('Edit')));

      const saveButtonAfterSecondEdit = queryByText('Save');
      expect(saveButtonAfterSecondEdit).not.toBeDisabled();
    });

    it('enables save button after updateUser api call fails', async () => {
      const { queryByText, container } = await setupForEdit();
      let displayInput = container.querySelector('input');
      fireEvent.change(displayInput, { target: { value: 'display1-update' } });
      apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => expect(saveButton).not.toBeDisabled());
    });

    it('displays the selected image in edit mode', async () => {
      const { container } = await setupForEdit();

      const inputs = container.querySelectorAll('input');
      const uploadInput = inputs[1];

      const file = new File(['dummy content'], 'example.png', {
        type: 'image/png',
      });

      fireEvent.change(uploadInput, { target: { files: [file] } });

      const image = container.querySelector('img');
      await waitFor(() => expect(image.src).toContain('data:image/png;base64'));
    });

    it('returns back to the original image even the new image is added to upload box but cancelled', async () => {
      const { findByText, container } = await setupForEdit();

      const inputs = container.querySelectorAll('input');
      const uploadInput = inputs[1];

      const file = new File(['dummy content'], 'example.png', {
        type: 'image/png',
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitFor(() => container.querySelector('img'));

      const cancelButton = await findByText('Cancel');
      fireEvent.click(cancelButton);

      const image = container.querySelector('img');
      expect(image.src).toContain('/images/profile/profile1.png');
    });

    it('does not throw error after file not selected', async () => {
      const { container } = await setupForEdit();
      const inputs = container.querySelectorAll('input');
      const uploadInput = inputs[1];
      expect(() =>
        fireEvent.change(uploadInput, { target: { files: [] } })
      ).not.toThrow();
    });

    it('calls updateUser api with request body having new image without data:image/png;base64', async () => {
      const { findByText, container } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const inputs = container.querySelectorAll('input');
      const uploadInput = inputs[1];

      const file = new File(['dummy content'], 'example.png', {
        type: 'image/png',
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      await waitFor(() => container.querySelector('img'));

      const saveButton = await findByText('Save');
      fireEvent.click(saveButton);

      const requestBody = apiCalls.updateUser.mock.calls[0][1];

      expect(requestBody.image).not.toContain('data:image/png;base64');
    });

    it('returns to last updated image when image is change for another time but cancelled', async () => {
      const { findByText, container } = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const inputs = container.querySelectorAll('input');
      const uploadInput = inputs[1];

      const file = new File(['dummy content'], 'example.png', {
        type: 'image/png',
      });
      fireEvent.change(uploadInput, { target: { files: [file] } });

      const saveButton = await findByText('Save');
      fireEvent.click(saveButton);

      const editButtonAfterClickingSave = await findByText('Edit');
      fireEvent.click(editButtonAfterClickingSave);

      const newFile = new File(['another content'], 'example2.png', {
        type: 'image/png',
      });

      fireEvent.change(uploadInput, { target: { files: [newFile] } });

      const cancelButton = await findByText('Cancel');
      fireEvent.click(cancelButton);

      const image = container.querySelector('img');
      expect(image.src).toContain('/images/profile/profile1-update.png');
    });
  });
});

console.error = {};
