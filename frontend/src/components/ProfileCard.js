import ButtonWithProgress from './ButtonWithProgress';
import Input from './input';
import ProfileImageWithDefault from './ProfileImageWithDefault';
import React from 'react';

const ProfileCard = ({
  user,
  isEditable,
  inEditMode,
  onClickEdit,
  onClickCancel,
  onClickSave,
  onChangeDisplayName,
  pendingUpdateCall,
  loadedImage,
  onFileSelect,
}) => {
  const showEditButton = isEditable && !inEditMode;

  return (
    <div className="card">
      <div className="card-header text-center">
        <ProfileImageWithDefault
          alt="profile"
          width="200"
          height="200"
          image={user.image}
          className="rounded-circle shadow"
          src={loadedImage}
        />
      </div>
      <div className="card-body text-center">
        {!inEditMode && <h4>{`${user.displayName}@${user.username}`}</h4>}
        {inEditMode && (
          <div className="mb-2">
            <Input
              value={user.displayName}
              label={`Change Display Name for ${user.username}`}
              onChange={onChangeDisplayName}
            />
            <input
              type="file"
              className="form-control-file mt-2"
              onChange={onFileSelect}
            />
          </div>
        )}
        {showEditButton && (
          <button className="btn btn-outline-success" onClick={onClickEdit}>
            <i className="fas fa-user-edit" /> Edit
          </button>
        )}

        {inEditMode && (
          <>
            <ButtonWithProgress
              className="btn btn-primary"
              onClick={onClickSave}
              text={
                <>
                  <i className="fas fa-save" /> Save
                </>
              }
              pendingApiCall={pendingUpdateCall}
              disabled={pendingUpdateCall}
            />
            <button
              className="btn btn-outline-secondary ml-1"
              onClick={onClickCancel}
              disabled={pendingUpdateCall}
            >
              <i className="fas fa-window-close" /> Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
