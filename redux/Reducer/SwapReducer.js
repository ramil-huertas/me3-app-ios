import types from '../Action/types';

const intialState = {
    loading: false,
    paySymbolDetails: {},
    receiveSymbolDetail: {},
    swapCoinList: [],
    mergedList: [],
    swapWallet: {},
    swapAmount: '',
};

export default (state = intialState, action) => {
    switch (action.type) {
        case types.SWAP_CHAIN_DETAILS: {
            return {
                ...state,
                paySymbolDetails: action.ReceiverSymbol,
                receiveSymbolDetail: action.PaySymbol,
            };
        }

        case types.SET_PAY_SYMBOL: {
            return {
                ...state,
                paySymbolDetails: action.paySymbol,
            };
        }

        case types.SET_RECEIVE_SYMBOL: {
            return {
                ...state,
                receiveSymbolDetail: action.receiveSymbol,
            };
        }

        case types.SET_SWAP_WALLET: {
            return {
                ...state,
                swapWallet: action.wallet,
            };
        }

        case types.RESET_STATE_SWAP: {
            return {
                ...state,
                // paySymbolDetails: {},
                // receiveSymbolDetail: {},
                swapAmount: '',
            };
        }
        case types.RESET_STATE_SWAP_ALLDATA: {
            return {
                ...state,
                // paySymbolDetails: {},
                // receiveSymbolDetail: {},
                paySymbolDetails: {},
                receiveSymbolDetail: {},
                swapCoinList: [],
                mergedList: [],
                swapWallet: {},
                swapAmount: '',
            };
        }
        case types.GET_SWAP_TOKEN_PROCESS_START: {
            return {
                ...state,
                loading: true,
            };
        }
        case types.GET_SWAP_TOKEN_PROCESS_FINISH: {
            return {
                ...state,
                loading: false,
                swapCoinList: action.payload.data,
                mergedList: action.payload.mergedList,
            };
        }
        case types.SAVE_SWAP_COIN_LIST: {
            return {
                ...state,
                loading: false,
                swapCoinList: action.payload,
            };
        }
        case types.SET_SWAP_AMOUNT: {
            return {
                ...state,
                swapAmount: action.amount,
            };
        }

        default: {
            return state;
        }
    }
};
