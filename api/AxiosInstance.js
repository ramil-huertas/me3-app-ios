import axios from 'axios';
import apiConst from './apiConst';
import { retrieveKeyValueData } from '@constants/Storage';
import storageConst from '@constants/ConstStorage';
import configData from '@constants/config';
import { logger } from '@constants/Log';
import { axiosPOSTRequest } from './APIFunctions';

import { util } from 'node-forge';
import { ChaCha20Poly1305, NONCE_LENGTH } from '@stablelib/chacha20poly1305';
import * as stable64 from '@stablelib/base64';
import * as stableUtf8 from '@stablelib/utf8';
import { b64Str2Key, forge2Node } from '@constants/EncDecChacha';
import { getCurrencyToPassInAPI } from '@constants/commonFuncation';

const decryptSecretAndGetData = async response => {
    const ResponseOfAPI = response.data;
    if (ResponseOfAPI.data.secret == undefined) {
        return response.data;
    } else {
        const data = ResponseOfAPI.data.data;
        const secret = ResponseOfAPI.data.secret;
        const privateKeyEncoded = await retrieveKeyValueData(
            storageConst.CLIENT_PRIVATEKEY,
        );
        const privateKeyDecoded = b64Str2Key(privateKeyEncoded, true);

        const chachaKey = forge2Node(
            privateKeyDecoded.decrypt(util.decode64(secret), 'RSA-OAEP'),
        );
        const decipher = new ChaCha20Poly1305(chachaKey);
        const arrayData = stable64.decode(data);
        const decryptedData = stableUtf8.decode(
            decipher.open(
                arrayData.slice(0, NONCE_LENGTH),
                arrayData.slice(NONCE_LENGTH),
            ),
        );
        return JSON.parse(decryptedData);
    }
};

const headers = {
    'Content-Type': 'application/json',
    'Company-ID': configData.COMPANY_ID,
    'Partner-ID': configData.PARTNER_ID,
};

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

export const apiKeyExchange = async (email, publicKey) => {
    const data = {
        email: email,
        publicKey: publicKey,
    };
    return axiosPOSTRequest(apiConst.API_KEY_EXCHANGE, data)
        .then(respone => {
            return respone.data;
        })
        .catch(error => {
            logger('Key exchange error', error);
            return error;
        });
};
export const apiRegisterUser = async email => {
    return new Promise(function (resolve, reject) {
        axios
            .post(
                apiConst.BASE_URL + apiConst.API_REGISTER + '?faceId=' + email,
                {},
                {
                    headers: headers,
                },
            )
            .then(async response => {
                logger(
                    '=======================Register Responce=======================',
                );
                logger(response.data);
                const decryptedData = await decryptSecretAndGetData(response);
                resolve(decryptedData);
            })
            .catch(error => {
                logger(error);
                reject(error);
            });
    });
};
export const uploadFileToDrive = async (url, accessToken, file) => {
    return new Promise(function (resolve, reject) {
        axios
            .post(
                url,
                {
                    data: `---------314159265358979323846 Content-Type: application/json {"name":"test.json","mimeType":"application/json"} ---------314159265358979323846 Content-Type: application/json  ${JSON.stringify(
                        file,
                    )} ---------314159265358979323846--`,
                },
                {
                    header: {
                        'Content-Type':
                            'multipart/related; boundary="-------314159265358979323846"',
                        authorization: 'Bearer ' + accessToken,
                    },
                },
            )
            .then(response => {
                resolve(response);
            })
            .catch(async error => {
                reject(error);
            });
    });
};
export const apiAddWalletToServer = async params => {
    return axiosPOSTRequest(apiConst.ADD_WALLET, params)
        .then(respone => {
            logger('apiAddWalletToServer resposne:', respone);
            return respone.data;
        })
        .catch(error => {
            logger('apiAddWalletToServer error', error);
            return error;
        });
};
export const apiAddSymbolAddress = async params => {
    //  params = JSON.stringify(params)//await getRequestParams(params)
    const header = await getHeader();
    const data = JSON.stringify(params);
    const config = {
        method: 'post',
        url: apiConst.BASE_URL + apiConst.ADD_SYMBOL_ADDRESS_NOTE,
        headers: header,
        data: data,
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

export async function getPreviousWallets(params = {}) {
    return requestOfGet({
        url: apiConst.GET_ALL_PREVIOUS_WALLET,
        params,
    });
}
export async function apiGetAllChains(params = {}) {
    let result = await requestOfGet({
        url: apiConst.GET_CHAIN_LIST,
        params,
    });
    return result.data;
}
export async function api_set_fileId(fileId) {
    logger(apiConst.BASE_URL + apiConst.SET_GET_DRIVE_FILE_ID);
    const header = await getHeader();
    return new Promise(function (resolve, reject) {
        let url;
        logger(fileId);
        if (fileId == undefined) {
            url =
                apiConst.BASE_URL + apiConst.SET_GET_DRIVE_FILE_ID + '?fileId=';
        } else {
            url =
                apiConst.BASE_URL +
                apiConst.SET_GET_DRIVE_FILE_ID +
                `?fileId=${fileId}`;
        }
        axios
            .post(
                url,
                {},
                {
                    headers: header,
                },
            )
            .then(response => {
                logger(
                    '=======================fileid Responce=======================',
                );
                logger(response.data);
                if (response.data.code == 0) {
                    resolve(response.data);
                } else {
                    reject(response.data);
                }
            })
            .catch(error => {
                logger(error);
                reject(error);
            });
    });
}
async function getRequestParams(obj) {
    return new Promise(resolve => {
        let temp = [];
        Object.keys(obj).forEach(item => {
            temp.push(`${item}=${obj[item]}`);
        });
        resolve(temp.join('&'));
    });
}
async function requestOfGet({ url, params }) {
    try {
        params = await getRequestParams(params);
        logger(`GET ${url}?${params}`);
        let lightToken = await retrieveKeyValueData(storageConst.LIGHT_TOKEN);

        return new Promise(function (resolve, reject) {
            axios
                .get(apiConst.BASE_URL + url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Company-ID': configData.COMPANY_ID,
                        'Partner-ID': configData.PARTNER_ID,
                        'Light-token': lightToken,
                    },
                })
                .then(async response => {
                    let success = response && response.data.code == 0;
                    if (success) {
                        const decryptedData = await decryptSecretAndGetData(
                            response,
                        );
                        resolve(decryptedData);
                    } else {
                        reject('No data');
                    }
                })
                .catch(async error => {
                    logger('erro : ', error);
                    reject(error);
                });
        });
    } catch (err) {
        logger(err);
    }
}
