import types from '../Action/types';

const intialState = {
    loading: false,
    walletList: [],
};

export default (state = intialState, action) => {
    switch (action.type) {
        case types.WALLET_LIST: {
            return {
                ...state,
                walletList: action.walletList,
            };
        }

        case types.RESET_LIST: {
            return {
                ...state,
                walletList: [],
            };
        }

        default: {
            return state;
        }
    }
};
