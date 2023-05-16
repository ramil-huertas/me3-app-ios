import types from '../Action/types';

const intialState = {
    loading: false,
    nftList: [],
};

export default (state = intialState, action) => {
    switch (action.type) {
        case types.GET_NFT_LIST_START: {
            return {
                ...state,
                loading: true,
            };
        }

        case types.GET_NFT_LIST_FINISH: {
            return {
                ...state,
                loading: false,
                nftList: action.nftList
            };
        }

        case types.RESET_NFT_LIST: {
            return {
                ...state,
                nftList: [],
                loading: false,
            }
        }
        default: {
            return state;
        }
    }
};
