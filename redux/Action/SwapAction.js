import types from './types';
import { apiGetSwapCoinList } from '@api/SwapApis';
import { saveKeyValueData } from '@constants/Storage';
import ConstStorage from '../../constant/ConstStorage';

const swapDetailsAction = (pay, receive) => ({
    type: types.SWAP_CHAIN_DETAILS,
    ReceiverSymbol: receive, //matic
    PaySymbol: pay, //eth
});

const resetStateAction = () => ({
    type: types.RESET_STATE_SWAP,
});
const resetStateSwapAllDataAction = () => ({
    type: types.RESET_STATE_SWAP_ALLDATA,
});
export const setPayChain = pay => ({
    type: types.SET_PAY_SYMBOL,
    paySymbol: pay,
});
export const setReceiveChain = receive => ({
    type: types.SET_RECEIVE_SYMBOL,
    receiveSymbol: receive,
});

const getSwapTokenProcessStart = () => ({
    type: types.GET_SWAP_TOKEN_PROCESS_START,
});

const getSwapTokenProcessFinish = (data, mergedList) => ({
    type: types.GET_SWAP_TOKEN_PROCESS_FINISH,
    payload: { data, mergedList },
});
const saveSwapList = data => ({
    type: types.SAVE_SWAP_COIN_LIST,
    payload: data,
});
const setSwapWalletAction = data => ({
    type: types.SET_SWAP_WALLET,
    wallet: data,
});
const setSwapAmountAction = value => ({
    type: types.SET_SWAP_AMOUNT,
    amount: value,
});

export const getPayAndReceiveSymbolList = async (
    dispatch,
    chain,
    mergedList,
) => {
    dispatch(getSwapTokenProcessStart());
    const params = {
        pageNo: 1,
        pageSize: 10000,
        chainName: chain,
        keyword: '',
    };
    const swapCoinList = await apiGetSwapCoinList(params);
    const newMergedList = [...mergedList, ...swapCoinList];
    dispatch(getSwapTokenProcessFinish(swapCoinList, newMergedList));
    return swapCoinList;
};

export const resetStateSwap = dispatch => {
    dispatch(resetStateAction());
};
// function used to reset all data when user do logout
export const resetStateSwapAllData = dispatch => {
    dispatch(resetStateSwapAllDataAction());
};

export const SwapChain = (dispatch, Chain) => {
    //eth,matic
    dispatch(swapDetailsAction(Chain.pay, Chain.receive));
};

export const saveSwapCoinList = (dispatch, swapListArray) => {
    dispatch(saveSwapList(swapListArray));
};
export const setSwapWallet = (dispatch, Data) => {
    saveKeyValueData(ConstStorage.SWAP_WALLET_CHAIN, JSON.stringify(Data))
    dispatch(setSwapWalletAction(Data));
};
export const saveSwapAmount = (dispatch, value) => {
    resetStateSwap(dispatch)
    setTimeout(() => {
        dispatch(setSwapAmountAction(value));
    }, 100);
};
