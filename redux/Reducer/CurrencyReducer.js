import types from '../Action/types';
import { logger } from '@constants/Log';

const intialState = {
    loading: false,
    currentCurrency: '',
};

export default (state = intialState, action) => {
    switch (action.type) {
        case types.CURRENT_CURRENCY: {
            logger('currency', action);
            return {
                ...state,
                currentCurrency: action.currentCurrency,
            };
        }

        case types.RESET_STATE_CURRENCY: {
            return {
                ...state,
                currentCurrency: '',
            };
        }

        default: {
            return state;
        }
    }
};
