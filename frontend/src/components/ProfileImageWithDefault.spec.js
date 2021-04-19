import React from 'react';
import { render } from '@testing-library/react';
import ProfileImageWithDefault from './ProfileImageWithDefault';

const user = {
  id: 1,
  username: 'user1',
  displayName: 'display1',
  image: 'profile1.png',
};

describe('ProfileImageWithDefault', () => {
  describe('Layout', () => {
    it('has image', () => {
      const { container } = render(<ProfileImageWithDefault />);
      const image = container.querySelector('img');

      expect(image).toBeInTheDocument();
    });

    it('displays default image when image property not provided', () => {
      const { container } = render(<ProfileImageWithDefault />);
      const image = container.querySelector('img');

      expect(image.src).toContain('/profile.png');
    });

    it('displays user image when image property provided', () => {
      const { container } = render(
        <ProfileImageWithDefault image="profile1.png" />
      );
      const image = container.querySelector('img');

      expect(image.src).toContain('/images/profile/profile1.png');
    });
  });
});
