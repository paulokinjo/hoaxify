import React from 'react';
import defaultPicture from '../assets/profile.png';

const ProfileImageWithDefault = (props) => {
  const { image } = props;
  const imageSource = image ? `/images/profile/${image}` : defaultPicture;

  //eslint-disable-next-line
  return <img src={imageSource} {...props} />;
};

export default ProfileImageWithDefault;
