import types from './types';

const setStatus = backUpStatus => ({
    type: types.SET_BACK_UP_STATUS,
    status: backUpStatus,
});

const setIsUploaded = status => ({
    type: types.SET_UPLOAD_STATUS,
    isStatusUploaded: status,
});

const resetBackupAction = () => ({
    type: types.RESET_BACKUP_STATUS
})
export const setBackUpStatus = (dispatch, status) => {
    dispatch(setStatus(status));
};

export const setUploadStatus = (dispatch, status) => {
    dispatch(setIsUploaded(status));
};
export const resetBackupStatus = (dispatch) => {
    dispatch(resetBackupAction())
}