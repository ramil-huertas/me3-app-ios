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

export const requestRPCForFilcoin = async (url, params) => {
    logger(params);
    const config = {
        method: 'post',
        url: url.url,
        headers: {
            'Content-Type': 'application/json',
        },
        data: url.params,
    };
    return new Promise(resolve => {
        axios(config)
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                resolve(error);
            });
    });
};

export const apiGetUTXToList = async params => {
    const header = await getHeader();
    params = await getRequestParams(params);
    const config = {
        method: 'post',
        url: apiConst.BASE_URL + apiConst.GET_UTX_TO_LIST + '?' + params,
        headers: header,
    };
    return new Promise(resolve => {
        axios(config)
            .then(response => {
                resolve(response.data.data.result);
            })
            .catch(error => {
                logger('filcoin', error);
                resolve(error);
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
