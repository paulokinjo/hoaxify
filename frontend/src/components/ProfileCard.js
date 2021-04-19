import React from 'react';
import ProfileImageWithDefault from './ProfileImageWithDefault';
const ProfileCard = ({ user }) => {
  return (
    <div className="card">
      <div className="card-header text-center">
        <ProfileImageWithDefault
          alt="profile"
          width="200"
          height="200"
          image={user.image}
          className="rounded-circle shadow"
        />
      </div>
      <div className="card-body text-center">
        <h4>{`${user.displayName}@${user.username}`}</h4>
      </div>
    </div>
  );
};

export default ProfileCard;
