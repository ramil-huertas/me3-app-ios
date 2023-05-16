import types from './types';

const resetStateAction = () => ({
    type: types.RESET_STATE_QRCODE,
});

const setScannedAddress = address => ({
    type: types.SCANNED_ADDRESS,
    receiverAddress: address,
});

const setErrorStatus = status => ({
    type: types.SCANNED_ADDRESS_ERROR_STATUS,
    errorStatus: status,
});

const setQrScannedStatus = status => ({
    type: types.SCANNED_QRCODE_ERROR_STATUS,
    qrStatus: status,
});

export const resetStateQR = dispatch => {
    // alert('reset state called')
    dispatch(resetStateAction());
};
export const scannedAddress = (dispatch, address) => {
    dispatch(setScannedAddress(address));
};

export const errorStatus = (dispatch, status) => {
    dispatch(setErrorStatus(status));
};
export const qrScannedStatus = (dispatch, status) => {
    dispatch(setQrScannedStatus(status));
};
