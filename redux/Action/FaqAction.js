import axios from 'axios';

import types from './types';
import configData from '@constants/config';
import { logger } from '@constants/Log';
import apiConst from '../../api/apiConst';

const getFaqListStart = () => ({
    type: types.GET_FAQ_LIST_START,
});
const getFaqListFinish = data => ({
    type: types.GET_FAQ_LIST_FINISH,
    payload: { faqData: data },
});

export const getFaqList = dispatch => {
    const headers = {
        'Company-ID': configData.COMPANY_ID,
        'Partner-ID': configData.PARTNER_ID,
    };
    dispatch(getFaqListStart());
    const config = {
        method: 'get',
        url: apiConst.BASE_URL + apiConst.FAQ_LIST,
        headers: headers,
    };
    axios(config)
        .then(async response => {
            const faqData = response.data.data;
            faqData.map(async item => {
                await getFaqDetails(item.id).then(response=>{
                    item.details = response
                }).catch(error=>{
                    logger('faq details error',error);
                })
            });
            setTimeout(() => {
                dispatch(getFaqListFinish(faqData));
            }, 500);
        })
        .catch(error => {
            logger('getting error from faq list api :: ', error);
            dispatch(getFaqListFinish([]));
        });
};

export const getFaqDetails = id => {
    return new Promise((resolve, reject) => {
        const headers = {
            'Company-ID': configData.COMPANY_ID,
            'Partner-ID': configData.PARTNER_ID,
        };
        const config = {
            method: 'get',
            url: apiConst.BASE_URL + apiConst.FAQ_DETAILS + id,
            headers: headers,
        };
        axios(config)
            .then(response => {
                const FAQDetails = response.data.data.content;
                resolve(FAQDetails);
            })
            .catch(error => {
                logger('getting error from faq details api :: ', error);
                reject(error);
            });
    });
};

const resetStateAction = () => ({
    type: types.RESET_FAQ_STATE,
});
export const resetStateFAQ = dispatch => {
    dispatch(resetStateAction());
};
