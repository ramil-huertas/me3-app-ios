import axios from 'axios';
import apiConst from './apiConst';
import { retrieveKeyValueData } from '@constants/Storage';
import storageConst from '@constants/ConstStorage';
import configData from '@constants/config';
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

export const apiGetCoinList = async params => {
    params = await getRequestParams(params);
    const header = await getHeader();
    const config = {
        method: 'get',
        url: apiConst.BASE_URL + apiConst.GET_COIN + params,
        headers: header,
    };
    return new Promise((resolve, reject) => {
        axios(config)
            .then(response => {
                if (response.data.code > 0) {
                    reject(response.data.msg);
                } else resolve(response.data.data);
            })
            .catch(error => {
                resolve(error);
            });
    });
};

export const apiGetCoinDetail = async params => {
    const header = await getHeader();
    params = await getRequestParams(params);
    const config = {
        method: 'get',
        url: apiConst.BASE_URL + apiConst.GET_COIN_DETAIL + '?' + params,
        headers: header,
    };
    return new Promise(resolve => {
        axios(config)
            .then(response => {
                resolve(response.data.data.data);
            })
            .catch(error => {
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
