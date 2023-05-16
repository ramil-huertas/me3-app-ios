import { COPY, ERROR, WARN } from '@constants/ConstantStrings';
import { logger } from '@constants/Log';
import types from './types';

const getAlertStart = () => ({
    type: types.GET_TOAST_ALERT_START,
});
const getAlertFinish = object => ({
    type: types.GET_TOAST_ALERT_FINISH,
    alertObject: object,
});

const getClearAlert = () => ({
    type: types.CLEAR_TOAST_ALERT,
});

export const clearAlert = dispatch => {
    logger('cleared Toast data')
    dispatch(getClearAlert());
};

let previousMessage = '';
export const showToast = async (dispatch, object) => {
    try {
        dispatch(getAlertStart());
        if (previousMessage != object.message) {
            previousMessage = object.message;
            const alertObject = {
                message: object.message,
                modalType: object.modalType,
                showAlert: object.showAlert,
                showImage: object.showImage,
            };

            dispatch(getAlertFinish(alertObject));
            setTimeout(() => {
                previousMessage = '';
            }, 2700);
        }
    } catch (error) {
        logger(`error is => `, error);
    }
};

export const showCopyToast = (dispatch, msg) => {
    const object = {
        message: msg,
        modalType: COPY,
        showImage: true,
        showAlert: true,
    };
    showToast(dispatch, object);
};
export const showWarnToast = (dispatch, msg) => {
    const object = {
        message: msg,
        modalType: WARN,
        showImage: true,
        showAlert: true,
    };
    showToast(dispatch, object);
};
export const showErrorToast = (dispatch, msg) => {
    const object = {
        message: msg,
        modalType: ERROR,
        showImage: true,
        showAlert: true,
    };
    showToast(dispatch, object);
};
export const showMessageToast = (dispatch, msg) => {
    const object = {
        message: msg,
        modalType: COPY,
        showImage: false,
        showAlert: true,
    };
    showToast(dispatch, object);
};
