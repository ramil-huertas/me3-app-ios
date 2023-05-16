import types from '../Action/types';

const intialState = {
    loading: false,
    list: [],
    mainCurrency: [],
    mergedList: [],
};

export default (state = intialState, action) => {
    switch (action.type) {
        case types.GET_TOKEN_PROCESS_START_ALLDATA:
        case types.GET_TOKEN_PROCESS_START: {
            return {
                ...state,
                loading: true,
                list: [],
            };
        }
        case types.GET_TOKEN_PROCESS_FINISH: {
            return {
                ...state,
                list: action.payload.data,
                swapTokenList: action.payload.data,
                mainCurrency: [
                    ...state.mainCurrency,
                    action.payload.mainCurrency,
                ],
                mergedList: action.payload.mergedList,
                loading: false,
            };
        }

        case types.GET_TOKEN_PROCESS_FINISH_ALLDATA: {
            return {
                ...state,
                loading: false,
                // list: action.payload.data,
                mainCurrency: action.mainCurrencyList,
                mergedList: action.mergedDataList,
            };
        }
        case types.TOKEN_RESET_STATE: {
            return {
                ...state,
                loading: false,
                list: [],
                mainCurrency: [],
                mergedList: [],
            };
        }

        case types.TOKEN_UPDATE: {
            const index = state.mergedList.findIndex(token => token === action.objectToCheck); //finding index of the item
            const newArray = [...state.mergedList]; //making a new array
            newArray[index].isShow = !newArray[index].isShow//changing value in the new array
            return {
                ...state,
                mergedList: newArray
            }
        }
        case types.TOKEN_UPDATE_LIST_OF_TOKENS: {
            return {
                ...state,
                mergedList: action.tokenlist
            }
        }
        case types.TOKEN_UPDATE_MAIN_CURRENCY: {
            return {
                ...state,
                mainCurrency: action.mainCurrencyList
            }
        }

        case types.TOKEN_LIST_UPDATE_FROM_SWAP: {
            return {
                ...state,
                swapTokenList: action.tokenList,
                loading: true,
            }
        }
        default: {
            return state;
        }
    }
};
