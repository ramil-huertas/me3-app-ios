import types from './types';

const getWalletCreateStatusStart = () => ({
    type: types.GET_WALLET_CREATE_STATUS_START,
});

const getWalletCreateStatusFinish = status => ({
    type: types.GET_WALLET_CREATE_STATUS_FINISH,
    walletStatus: status,
});

const getWalletRetrieveStatusStart = () => ({
    type: types.GET_WALLET_RETRIEVE_STATUS_START,
});

const getWalletRetrieveStatusFinish = status => ({
    type: types.GET_WALLET_RETRIEVE_STATUS_FINISH,
    walletStatus: status,
});

const setWalletType = WalletObject => ({
    type: types.SET_WALLET_TYPE,
    WalletProcess: WalletObject,
});

const resetWalletStateAction = () => ({
    type: types.RESET_WALLET_STATE,
});

const passcodeStatusType = type => ({
    type: types.PASSCODE_SET_STATUS_TYPE,
    PasscodeStatus: type,
});

export const resetWalletState = dispatch => {
    dispatch(resetWalletStateAction());
};

export const setWalletProcessType = (dispatch, object) => {
    dispatch(setWalletType(object));
};

export const WalletCreateStatusStart = dispatch => {
    dispatch(getWalletCreateStatusStart());
};

export const WalletCreateStatusFinish = (dispatch, status) => {
    dispatch(getWalletCreateStatusFinish(status));
};

export const WalletRetrieveStatusStart = dispatch => {
    dispatch(getWalletRetrieveStatusStart());
};

export const WalletRetrieveStatusFinish = (dispatch, status) => {
    dispatch(getWalletRetrieveStatusFinish(status));
};

export const setPasscodeStatusType = (dispatch, object) => {
    dispatch(passcodeStatusType(object));
};
