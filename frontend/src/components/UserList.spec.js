import * as apiCalls from '../api/apiCalls';

import { fireEvent, render, waitFor } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import UserList from './UserList';

const setup = () => {
  return render(
    <MemoryRouter>
      <UserList />
    </MemoryRouter>
  );
};

const mockedEmptySuccessResponse = {
  data: {
    content: [],
    number: 0,
    size: 3,
  },
};

const mockedSuccessGetSinglePage = {
  data: {
    content: [
      {
        username: 'user1',
        displayName: 'display1',
        image: '',
      },
      {
        username: 'user2',
        displayName: 'display2',
        image: '',
      },
      {
        username: 'user3',
        displayName: 'display3',
        image: '',
      },
    ],
    number: 0,
    first: true,
    last: true,
    size: 3,
    totalPages: 1,
  },
};

const mockedSuccessGetMultiPageFirst = {
  data: { ...mockedSuccessGetSinglePage.data, last: false, totalPages: 2 },
};

const mockedSuccessGetMultiPageLast = {
  data: {
    ...mockedSuccessGetMultiPageFirst.data,
    content: [
      {
        username: 'user4',
        displayName: 'display4',
        image: '',
      },
      {
        username: 'user5',
        displayName: 'display5',
        image: '',
      },
      {
        username: 'user6',
        displayName: 'display6',
        image: '',
      },
    ],
    number: 1,
    first: false,
    last: true,
  },
};

const mockFailGet = {
  response: {
    data: {
      message: 'Load error',
    },
  },
};

describe('UserList', () => {
  describe('Layout', () => {
    it('has header of Users', () => {
      const { container } = setup();
      const header = container.querySelector('h3');
      expect(header).toHaveTextContent('Users');
    });

    it('displays 3 items when listUsers api returns 3 users', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockedSuccessGetSinglePage);

      const { queryByTestId } = await waitFor(() => setup());

      const userGroup = queryByTestId('usergroup');
      expect(userGroup.childElementCount).toBe(3);
    });

    it('displays the displayName@username when listUser api returns users', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockedSuccessGetSinglePage);

      const { queryByText } = await waitFor(() => setup());
      const firstUser = await waitFor(() => queryByText('display1@user1'));

      expect(firstUser).toBeInTheDocument();
    });

    it('displays the next button when response has last value as false', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockedSuccessGetMultiPageFirst);

      const { queryByText } = await waitFor(() => setup());
      const nextLink = await waitFor(() => queryByText('next >'));

      expect(nextLink).toBeInTheDocument();
    });

    it('hides the next button when response has last value as true', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockedSuccessGetMultiPageLast);

      const { queryByText } = await waitFor(() => setup());
      const nextLink = await waitFor(() => queryByText('next >'));

      expect(nextLink).not.toBeInTheDocument();
    });

    it('displays the previous button when response has first value as false', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockedSuccessGetMultiPageLast);

      const { queryByText } = await waitFor(() => setup());
      const previousLink = await waitFor(() => queryByText('< previous'));

      expect(previousLink).toBeInTheDocument();
    });

    it('hides the previous button when response has first value as true', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockedSuccessGetMultiPageFirst);

      const { queryByText } = await waitFor(() => setup());
      const previousLink = await waitFor(() => queryByText('< previous'));

      expect(previousLink).not.toBeInTheDocument();
    });

    it('has link to UserPage', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockedSuccessGetSinglePage);
      const { queryByText, container } = setup();

      await waitFor(() => queryByText('display1@user1'));

      const firstAnchor = container.querySelectorAll('a')[0];
      expect(firstAnchor.getAttribute('href')).toBe('/user1');
    });
  });

  describe('Lifecycle', () => {
    it('calls listUsers api when it is rendered', () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockedEmptySuccessResponse);

      setup();

      expect(apiCalls.listUsers).toHaveBeenCalledTimes(1);
    });

    it('calls listUsers method with page=0 and size=3', () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockedEmptySuccessResponse);

      setup();

      expect(apiCalls.listUsers).toHaveBeenCalledWith({ page: 0, size: 3 });
    });
  });

  describe('Interactions', () => {
    it('loads next page when clicked to next button', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValueOnce(mockedSuccessGetMultiPageFirst)
        .mockResolvedValueOnce(mockedSuccessGetMultiPageLast);

      const { queryByText } = await waitFor(() => setup());
      const nextLink = await waitFor(() => queryByText('next >'));
      await waitFor(() => fireEvent.click(nextLink));

      const secondPageUser = queryByText('display4@user4');

      expect(secondPageUser).toBeInTheDocument();
    });

    it('loads previous page when clicked to previous button', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValueOnce(mockedSuccessGetMultiPageLast)
        .mockResolvedValueOnce(mockedSuccessGetMultiPageFirst);

      const { queryByText } = await waitFor(() => setup());
      const previousLink = await waitFor(() => queryByText('< previous'));
      await waitFor(() => fireEvent.click(previousLink));

      const firstPageUser = queryByText('display1@user1');

      expect(firstPageUser).toBeInTheDocument();
    });

    it('displays error message when loading other page fails', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValueOnce(mockedSuccessGetMultiPageLast)
        .mockRejectedValueOnce(mockFailGet);

      const { queryByText } = await waitFor(() => setup());
      const previousLink = await waitFor(() => queryByText('< previous'));
      await waitFor(() => fireEvent.click(previousLink));

      const errorMessage = await waitFor(() => queryByText('User load failed'));

      expect(errorMessage).toBeInTheDocument();
    });

    it('hides error message when successfully loading other page', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValueOnce(mockedSuccessGetMultiPageLast)
        .mockRejectedValueOnce(mockFailGet)
        .mockResolvedValueOnce(mockedSuccessGetMultiPageFirst);

      const { queryByText } = await waitFor(() => setup());
      const previousLink = await waitFor(() => queryByText('< previous'));

      await waitFor(() => fireEvent.click(previousLink));
      await waitFor(() => queryByText('User load failed'));
      await waitFor(() => fireEvent.click(previousLink));

      const errorMessage = await waitFor(() => queryByText('User load failed'));

      expect(errorMessage).not.toBeInTheDocument();
    });
  });
});

console.error = () => {};
