import types from '../Action/types';

const intialState = {
    loading: false,
    isUserConfirmedBackupStatus: false,
    isUploaded: false,
};

export default (state = intialState, action) => {
    switch (action.type) {
        case types.SET_BACK_UP_STATUS: {
            return {
                ...state,
                isUserConfirmedBackupStatus: action.status,
            };
        }
        case types.SET_UPLOAD_STATUS: {
            return {
                ...state,
                isUploaded: action.isStatusUploaded,
            };
        }
        case types.RESET_BACKUP_STATUS:
            {
                return {
                    ...state,
                    isUserConfirmedBackupStatus: false,
                    isUploaded: false,
                }
            }
        default: {
            return state;
        }
    }
};
