import axios from 'axios';
import apiConst from './apiConst';
import { retrieveKeyValueData } from '@constants/Storage';
import storageConst from '@constants/ConstStorage';
import configData from '@constants/config';
import { logger } from '@constants/Log';
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

export const apiGetTotalAssets = async params => {
    logger(params);
    const header = await getHeader();
    const config = {
        method: 'get',
        url: apiConst.BASE_URL + apiConst.GET_TOTAL_ASSETS,
        headers: header,
    };
    return new Promise(resolve => {
        axios(config)
            .then(response => {
                logger('Resposne TotalAsset', response.data);
                resolve(response.data.data);
            })
            .catch(error => {
                resolve(error);
            });
    });
};

export const apiGetFocusChains = async params => {
    const header = await getHeader();
    params = await getRequestParams(params);
    const config = {
        method: 'get',
        url: apiConst.BASE_URL + apiConst.GET_FOCUS_CHAINS + '?' + params,
        headers: header,
    };
    return new Promise(resolve => {
        axios(config)
            .then(response => {
                resolve(response.data.data);
            })
            .catch(error => {
                resolve(error);
            });
    });
};
export const apiGetChainAssets = async params => {
    const header = await getHeader();
    params = await getRequestParams(params);
    const config = {
        method: 'get',
        url: apiConst.BASE_URL + apiConst.GET_CHAIN_ASSETS + '?' + params,
        headers: header,
    };
    return new Promise(resolve => {
        axios(config)
            .then(response => {
                resolve(response.data.data);
            })
            .catch(error => {
                resolve(error);
            });
    });
};

export const apiGetTokensToImport = async params => {
    const header = await getHeader();
    params = await getRequestParams(params);
    const config = {
        method: 'get',
        url: apiConst.BASE_URL + apiConst.GET_TOKENS_TO_IMPORT + '?' + params,
        headers: header,
    };
    return new Promise((resolve, reject) => {
        axios(config)
            .then(response => {
                resolve(response.data.data.records);
            })
            .catch(error => {
                logger('error', error);
                reject(error);
            });
    });
};

export const apiFollowToken = async params => {
    const header = await getHeader();
    params = await getRequestParams(params);
    const config = {
        method: 'post',
        url: apiConst.BASE_URL + apiConst.FOLLOW_TOKEN + '?' + params,
        headers: header,
    };
    return new Promise((resolve, reject) => {
        axios(config)
            .then(response => {
                if (response.data.code == 0) resolve(response.data.data);
                else reject(response.data.msg);
            })
            .catch(error => {
                resolve(error);
            });
    });
};

export const apiGetSupportCurrency = async params => {
    logger(params);
    const header = await getHeader();
    const config = {
        method: 'get',
        url: apiConst.BASE_URL + apiConst.GET_SUPPORT_CURRENCY,
        headers: header,
    };
    return new Promise(resolve => {
        axios(config)
            .then(response => {
                let data = response.data.data;
                resolve(data);
            })
            .catch(error => {
                logger('Errro currency ', error);
                resolve(error);
            });
    });
};

export const apiAddCusstomToken = async params => {
    const header = await getHeader();
    const data = JSON.stringify(params);
    const config = {
        method: 'post',
        url: apiConst.BASE_URL + apiConst.ADD_CUSTOM_TOKEN,
        headers: header,
        data: data,
    };
    console.log("config :: ",config)
    return new Promise((resolve, reject) => {
        axios(config)
            .then(response => {
                if (response.data.code == 0)
                    resolve(response.data);
                else
                    reject(response.data.msg)
            })
            .catch(error => {
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
