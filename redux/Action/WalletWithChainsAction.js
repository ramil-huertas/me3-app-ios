import types from './types';
import { getAllWallets, getChainDetail } from '@database/sql';
import { getWalletsBasedOnSetting } from '@constants/commonFuncation';
import { logger } from '@constants/Log';
const resetStateAction = () => ({
    type: types.RESET_LIST,
});

const getWalletAddressList = walletlist => ({
    type: types.WALLET_LIST,
    walletList: walletlist,
});

export const resetStateWalletChains = dispatch => {
    dispatch(resetStateAction());
};
export const getWalletAddressWithChainList = async dispatch => {
    try {
        let allWallets = await getAllWallets();
        let walletList = [];
        for (let i = 0; i < allWallets.rows.length; i++) {
            let chainDetail = await getChainDetail(allWallets.rows.item(i).chain);
            let chDetail = chainDetail.rows.item(0);
            if (chDetail) {
                let temp = { icon: chDetail.chain_icon, chainId: chDetail.chainId, chainDetail: chDetail, ...allWallets.rows.item(i) }
                walletList.push(temp);
            }
        }
        let finalWalletData = await getWalletsBasedOnSetting(walletList)
        finalWalletData.sort((a, b) => {
            return (a.chainDetail?.symbol > b.chainDetail?.symbol) ? 1 : -1
        });
        dispatch(getWalletAddressList(finalWalletData));
        return finalWalletData;
    } catch (error) {
        logger("ERROR ::: ", error)
    }
};
