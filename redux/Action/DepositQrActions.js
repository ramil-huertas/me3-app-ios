import types from './types';

const resetStateAction = () => ({
    type: types.RESET_QRCODE,
});

const setWalletQRCodeObj = qrcodeObj => ({
    type: types.CURRENT_QRCODE,
    qrObj: qrcodeObj,
});

export const resetStateDepositQR = dispatch => {
    dispatch(resetStateAction());
};
export const setQrcodeObject = (dispatch, qrObj) => {
    dispatch(setWalletQRCodeObj(qrObj));
};
