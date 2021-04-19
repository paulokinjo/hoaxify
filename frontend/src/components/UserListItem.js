import { Link } from 'react-router-dom';
import ProfileImageWithDefault from './ProfileImageWithDefault';
import React from 'react';

const UserListItem = (props) => {
  return (
    <Link
      to={`/${props.user.username}`}
      className="list-group-item list-group-item-action"
    >
      <div className="list-group-item list-group-item-action">
        <ProfileImageWithDefault
          className="rounded-circle"
          alt="profile"
          width="32"
          height="32"
          image={props.user.image}
        />
        <span className="pl-2">
          {`${props.user.displayName}@${props.user.username}`}
        </span>
      </div>
    </Link>
  );
};

export default UserListItem;
