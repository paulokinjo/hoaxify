import React from 'react';
import defaultPicture from '../assets/profile.png';

const ProfileImageWithDefault = (props) => {
  const { image } = props;
  const imageSource = image ? `/images/profile/${image}` : defaultPicture;

  return (
    //eslint-disable-next-line
    <img
      {...props}
      src={props.src || imageSource}
      onError={(event) => {
        event.target.src = defaultPicture;
      }}
    />
  );
};

export default ProfileImageWithDefault;
