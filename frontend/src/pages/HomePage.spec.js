import HomePage from './HomePage';
import React from 'react';
import { render } from '@testing-library/react';

describe('HomePage', () => {
  describe('Layout', () => {
    it('has root page div', () => {
      const { queryByTestId } = render(<HomePage />);
      const homePageDiv = queryByTestId('homepage');
      expect(homePageDiv).toBeInTheDocument();
    });
  });
});
