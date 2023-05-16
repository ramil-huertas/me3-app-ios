import types from '../Action/types';

const intialState = {
    loading: false,
    list: [],
};

export default (state = intialState, action) => {
    switch (action.type) {
        case types.GET_ADDRESS_BOOK_LIST: {
            return {
                ...state,
                list: action.addressList,
            };
        }
        case types.RESET_ADDRESSBOOK: {
            return {
                ...state,
                list: []
            }
        }

        default: {
            return state;
        }
    }
};
