import types from './types';
import { apiGetCoinList } from '@api/CoinApis';
import { logger } from '@constants/Log';

const resetStateAction = () => ({
    type: types.TOKEN_RESET_STATE,
});
export const resetStateTokens = dispatch => {
    dispatch(resetStateAction());
};
const getTokenProcessStart = () => ({
    type: types.GET_TOKEN_PROCESS_START,
});

const getTokenProcessFinish = data => ({
    type: types.GET_TOKEN_PROCESS_FINISH,
    payload: data,
});

export const saveTokenListAndChain = (
    dispatch,
    chainName,
    address,
    reducerList,
) => {
    dispatch(getTokenProcessStart());
    let params = {
        chainName: chainName,
        address: address,
        pageNo: 1,
        pageSize: '10000000000',
    };

    return apiGetCoinList(params)
        .then(data => {

            data.data.map(item => {
                if (item.balance > 0)
                    item.isShow = true
                else item.isShow = false;
            })
            data.mergedList = reducerList.concat(data.data);
            dispatch(getTokenProcessFinish(data));
            return data;
        })
        .catch(error => {
            logger(error);
            dispatch(getTokenProcessFinish([]));
            return [];
        });
};

/** this methods are use at a time of getting all token list in one go from home screen
 * to show top fiat value for all the tokens (mainchain + other tokens)
 */
const getTokenProcessStartAllData = () => ({
    type: types.GET_TOKEN_PROCESS_START_ALLDATA,
});

const getTokenProcessFinishAllData = (mainCurrency, allDataList) => ({
    type: types.GET_TOKEN_PROCESS_FINISH_ALLDATA,
    mainCurrencyList: mainCurrency,
    mergedDataList: allDataList
});

export const saveTokenListAndChainForAll = async (
    dispatch,
    allWalletData
) => {
    dispatch(getTokenProcessStartAllData());
    let finalArrayForAll = []
    let mainCurrency = []
    console.log("Start time :: ", new Date())
    for (let i = 0; i < allWalletData.rows.length; i++) {
        let params = {
            chainName: allWalletData.rows.item(i).chain,
            address: allWalletData.rows.item(i).address,
            pageNo: 1,
            pageSize: '10000000000',
        };
        await apiGetCoinList(params)
            .then(data => {
                data.data.map(item => {
                    if (item.balance > 0)
                        item.isShow = true
                    else item.isShow = false;
                })
                mainCurrency.push(data.mainCurrency)
                finalArrayForAll.push(data.data)
            })
            .catch(error => {
                logger(error);
            });
    }
    console.log("End time :: ", new Date())
    let arrayToconcat = []
    for (const dataItem of finalArrayForAll) {
        arrayToconcat = arrayToconcat.concat(dataItem)
    }
    dispatch(getTokenProcessFinishAllData(mainCurrency, arrayToconcat))
    return arrayToconcat;
};
const updateStatus = tokenObj => ({
    type: types.TOKEN_UPDATE,
    objectToCheck: tokenObj
});

export const updateStatusOfToken = (dispatch, tokenObj) => {
    dispatch(updateStatus(tokenObj))
}

// update balance in tokens list for specific chain when user do pull to refresh from in-chain
const updateTokenItems = tokenItem => ({
    type: types.TOKEN_UPDATE_LIST_OF_TOKENS,
    tokenlist: tokenItem
})
export const updateTokenListFromApiItems = (dispatch, itemList) => {
    dispatch(updateTokenItems(itemList))
}

// update main currency list when user do pull to refresh from in-chain
const updateMainCurrency = currencyList => ({
    type: types.TOKEN_UPDATE_MAIN_CURRENCY,
    mainCurrencyList: currencyList
})
export const updateMainCurrencyOnRefresh = (dispatch, currencyList) => {
    dispatch(updateMainCurrency(currencyList))
}

export const tokenListUpdate = tList => ({
    type: types.TOKEN_LIST_UPDATE_FROM_SWAP,
    tokenList: tList
})

export const updateSwapTokenList = (dispatch, tokenList) => {
    dispatch(tokenListUpdate(tokenList))
}