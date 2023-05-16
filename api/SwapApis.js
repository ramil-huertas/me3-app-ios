import axios from 'axios';
import apiConst from './apiConst';
import { retrieveKeyValueData } from '@constants/Storage';
import storageConst from '@constants/ConstStorage';
import configData from '@constants/config';
import { logger } from '@constants/Log';
import { showMessageToast } from '@redux/Action/ToastAlert';
import { getCurrencyToPassInAPI } from '@constants/commonFuncation';

let getHeader = async () => {
    let lightToken = await retrieveKeyValueData(storageConst.LIGHT_TOKEN);
    let currency = await retrieveKeyValueData(storageConst.LEGAL_DETAIL);

    return {
        'Company-ID': configData.COMPANY_ID,
        'Partner-ID': configData.PARTNER_ID,
        'Light-token': lightToken,
        'Content-Type': 'application/json',
        Currency: getCurrencyToPassInAPI(currency),
    };
};

export const apiGetSwapCoinList = async params => {
    const header = await getHeader();
    params = await getRequestParams(params);
    const config = {
        method: 'get',
        url: apiConst.BASE_URL + apiConst.GET_SWAP_TOKEN_LIST + '?' + params,
        headers: header,
    };
    // logger("config => ", config)
    return new Promise(resolve => {
        axios(config)
            .then(response => {
                // logger("swapcoin result => ", response.data.data.records)
                resolve(response.data.data.records);
            })
            .catch(error => {
                logger('error -> ', error);
                resolve(error);
            });
    });
};

function supportSwapChain(chainId) {
    let chain;
    switch (chainId) {
        case 1:
            chain = 'ethereum';
            break;
        case 137:
            chain = 'polygon';
            break;
        case 4:
            chain = 'rinkeby';
            break;
        case 56:
            chain = 'bsc';
            break;
        case 43114:
            chain = 'avalanche';
            break;
    }
    return chain;
}
export const swap_get_encode = async (params, dispatch) => {
    let { tokenIn, tokenOut, amountIn, to, chainId } = params;
    let chain = supportSwapChain(chainId);
    if (!chain) {
        // showMessageToast(dispatch, 'The current main chain does not support');
        return;
    }

    logger(
        `swap_get_encode GET https://aggregator-api.kyberswap.com/${chain}/route/encode?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}&saveGas=0&slippageTolerance=50&isInBps=false&to=${to}&clientData={"source":"kyberswap"}`,
    );

    const config = {
        method: 'GET',
        url: `https://aggregator-api.kyberswap.com/${chain}/route/encode?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}&saveGas=0&slippageTolerance=50&to=${to}&clientData={"source":"kyberswap"}`,
        headers: {
            'Accept-Version': 'Latest',
        },
    };
    return new Promise((resolve, reject) => {
        axios(config)
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                logger('kyber', error);
                reject(error);
            });
    });
};
async function getRequestParams(obj) {
    return new Promise(resolve => {
        let temp = [];
        Object.keys(obj).forEach(item => {
            temp.push(`${item}=${obj[item]}`);
        });
        resolve(temp.join('&'));
    });
}
