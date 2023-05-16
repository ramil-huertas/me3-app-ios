import types from './types';
import { apiGetTotalAssets } from '@api/WalletAPIs';
import { retrieveKeyValueData } from '@constants/Storage';
import storageConst from '@constants/ConstStorage';
import { logger } from '@constants/Log';
import { formatBalanceValue } from '@constants/commonFuncation';
import {  setCurrentCurrencyFromAction } from './CurrencyAction';

const getAssetsStart = () => ({
    type: types.GET_TOTAL_ASSETS_API_START,
});

const getAssetsReset = () => ({
    type: types.RESET_STATE,
});

const getAssetsFinish = data => ({
    type: types.GET_TOTAL_ASSETS_API_FINISH,
    payload: data,
});

export const getTotalAssets = dispatch => {
    // resetAssestsState(dispatch)
    dispatch(getAssetsStart());

    apiGetTotalAssets()
        .then(totalasset => {
            logger('asset total ', totalasset);
            retrieveKeyValueData(storageConst.LEGAL_DETAIL).then(currency => {
                logger('currency 1', currency);
                setCurrentCurrencyFromAction(dispatch, JSON.parse(currency));
                if (totalasset == null || totalasset == undefined) {
                    const dataToBeStored = {
                        mainData: totalasset,
                        totalAsset: JSON.parse(currency).icon + ' ' + 0,
                        totalAssetToCompare: 0,
                    };
                    dispatch(getAssetsFinish(dataToBeStored));
                } else {
                    const dataToBeStored = {
                        mainData: totalasset,
                        totalAsset:
                            JSON.parse(currency).icon +
                            ' ' +
                            formatBalanceValue(totalasset.totalBalance),
                        totalAssetToCompare: totalasset.totalBalance,
                    };
                    dispatch(getAssetsFinish(dataToBeStored));
                }
            });
        })
        .catch(error => {
            const dataToBeStored = {
                mainData: null,
                totalAsset: 0,
                totalAssetToCompare: 0,
            };
            dispatch(getAssetsFinish(dataToBeStored));
            logger('Error', error);
        });
};

export const resetAssestsState = dispatch => {
    dispatch(getAssetsReset());
};
