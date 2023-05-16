import types from '../Action/types';

const intialState = {
    hasInternet: true,
};

export default (state = intialState, action) => {
    switch (action.type) {
        case types.SET_INTERNET_CONNECTION_STATUS: {
            return {
                ...state,
                hasInternet: action.hasInternet,
            };
        }
        default:
            return state;
    }
};
