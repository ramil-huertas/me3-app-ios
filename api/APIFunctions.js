import axios from 'axios';
import apiConst from './apiConst';
import { retrieveKeyValueData } from '@constants/Storage';
import storageConst from '@constants/ConstStorage';
import configData from '@constants/config';
import { getCurrencyToPassInAPI } from '@constants/commonFuncation';
import { logger } from '@constants/Log';

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

export const axiosPOSTRequest = async (url, params) => {
    const header = await getHeader();
    const data = JSON.stringify(params);
    const config = {
        method: 'post',
        url: apiConst.BASE_URL + url,
        headers: header,
        data: data,
    };
    return new Promise((resolve, reject) => {
        axios(config)
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
};
export const axiosPOSTRequestWithParamInURL = async (url, params) => {
    const header = await getHeader();
    params = await getRequestParams(params);
    const config = {
        method: 'post',
        url: apiConst.BASE_URL + url + params,
        headers: header,
    };
    return new Promise((resolve, reject) => {
        axios(config)
            .then(response => {
                resolve(response.data);
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

export const axiosGETRequest = async (url, params) => {
    logger(params);
    const header = await getHeader();
    const config = {
        method: 'get',
        url: apiConst.BASE_URL + url,
        headers: header,
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
