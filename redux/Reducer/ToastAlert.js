import types from '../Action/types';
import ConstantStrings from '@constants/ConstantStrings'
const initialState = {
    loading: false,
    alertObject: {
        message: '',
        modalType: ConstantStrings.COPY,
        showAlert: false,
        showImage: ''
    },
};

export default (state = initialState, action) => {
    switch (action.type) {
        case types.GET_TOAST_ALERT_START: {
            return {
                ...state,
                loading: true,
            };
        }
        case types.GET_TOAST_ALERT_FINISH: {
            return {
                ...state,
                loading: false,
                alertObject: action.alertObject,
            };
        }
        case types.CLEAR_TOAST_ALERT: {
            return {
                ...initialState,
            };
        }

        default: {
            return state;
        }
    }
};
