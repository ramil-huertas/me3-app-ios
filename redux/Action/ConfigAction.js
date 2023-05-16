import types from './types';

export const setInternet = hasInternet => ({
    type: types.SET_INTERNET_CONNECTION_STATUS,
    hasInternet,
});
