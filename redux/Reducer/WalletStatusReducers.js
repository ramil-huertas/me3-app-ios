import types from '../Action/types';

const intialState = {
    loading: true,
    createStatus: false,
    retrieveStatus: false,
    WalletProcessType: '',
    WalletProcessId: '',
    passcodeStatus: false,
};

export default (state = intialState, action) => {
    switch (action.type) {
        case types.GET_WALLET_CREATE_STATUS_START: {
            return {
                ...state,
                loading: true,
            };
        }

        case types.GET_WALLET_CREATE_STATUS_FINISH: {
            return {
                ...state,
                loading: false,
                createStatus: action.walletStatus,
            };
        }

        case types.GET_WALLET_RETRIEVE_STATUS_START: {
            return {
                ...state,
                loading: true,
            };
        }

        case types.GET_WALLET_RETRIEVE_STATUS_FINISH: {
            return {
                ...state,
                loading: false,
                retrieveStatus: action.walletStatus,
            };
        }
        case types.SET_WALLET_TYPE: {
            return {
                ...state,
                loading: false,
                WalletProcessType: action.WalletProcess.type,
                WalletProcessId: action.WalletProcess.id,
            };
        }

        case types.RESET_WALLET_STATE: {
            return {
                ...state,
                createStatus: false,
                retrieveStatus: false,
                WalletProcessType: '',
                WalletProcessId: '',
                passcodeStatus: 'false',
            };
        }

        case types.PASSCODE_SET_STATUS_TYPE: {
            return {
                ...state,
                passcodeStatus: action.PasscodeStatus,
            };
        }

        default: {
            return state;
        }
    }
};
