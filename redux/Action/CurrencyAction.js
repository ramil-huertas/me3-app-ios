import types from './types';

const resetStateAction = () => ({
    type: types.RESET_STATE_CURRENCY,
});

const setCurrentSelectedCurrency = currency => ({
    type: types.CURRENT_CURRENCY,
    currentCurrency: currency,
});

export const resetState = dispatch => {
    // alert('reset state called')
    dispatch(resetStateAction());
};
export const setCurrentCurrencyFromAction = (dispatch, currency) => {
    dispatch(setCurrentSelectedCurrency(currency));
};
