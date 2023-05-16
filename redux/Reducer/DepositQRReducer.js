import types from '../Action/types';

const intialState = {
    loading: false,
    qrCodeList: [],
    currentQrCode: null,
};

export default (state = intialState, action) => {
    switch (action.type) {
        case types.CURRENT_QRCODE: {
            return {
                ...state,
                currentQrCode: action.qrObj,
                qrCodeList: state.qrCodeList.concat(action.qrObj),
            };
        }
        case types.QRCODE_LIST: {
            return {
                ...state,
                qrCodeList: [],
            };
        }

        case types.RESET_QRCODE: {
            return {
                ...state,
                currentQrCode: '',
                qrCodeList: [],
            };
        }

        default: {
            return state;
        }
    }
};
