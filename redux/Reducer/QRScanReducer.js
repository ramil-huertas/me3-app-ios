import types from '../Action/types';
import { logger } from '@constants/Log';

const intialState = {
    loading: false,
    receiverAddress: '',
    errorStatus: false,
    qrScannedStatus: false,
};

export default (state = intialState, action) => {
    switch (action.type) {
        case types.SCANNED_ADDRESS: {
            logger('address', action);
            return {
                ...state,
                receiverAddress: action.receiverAddress,
            };
        }

        case types.RESET_STATE_QRCODE: {
            return {
                ...state,
                receiverAddress: '',
                errorStatus: false,
                qrScannedStatus: false,
            };
        }
        case types.SCANNED_ADDRESS_ERROR_STATUS: {
            return {
                ...state,
                errorStatus: action.errorStatus,
            };
        }
        case types.SCANNED_QRCODE_ERROR_STATUS: {
            return {
                ...state,
                qrScannedStatus: action.qrStatus,
            };
        }
        default: {
            return state;
        }
    }
};
