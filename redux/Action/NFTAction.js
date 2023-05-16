import types from './types';
import { logger } from '@constants/Log';
import { getAllWallets } from '@database/sql';
import { apiGetNFTList } from '@api/NFTsApi';


const getNFTListStart = () => ({
    type: types.GET_NFT_LIST_START,
});
const getNFTListFinish = data => ({
    type: types.GET_NFT_LIST_FINISH,
    nftList: data
});

export const getNFTList = async dispatch => {
    return new Promise(function (resolve, reject) {
        dispatch(getNFTListStart())
        getAllWallets()
            .then(async result => {
                let datalength = result.rows.length;
                if (datalength > 0) {
                    let allNFTList = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        let currentWallet = result.rows.item(i);
                        const params = {
                            chainName: currentWallet.chain,
                            address: currentWallet.address,
                            pageNo: 1,
                            pageSize: 10000000000,
                        };

                        let nftListFromApi = await apiGetNFTList(params);
                        try {
                            allNFTList = allNFTList.concat(
                                nftListFromApi.map(item => {
                                    item.chain = currentWallet.chain;
                                    item.image =
                                        item.image == null
                                            ? null
                                            : item.image.startsWith('ipfs')
                                                ? `https://ipfs.io/ipfs/${item.image.slice(7)}`
                                                : item.image;
                                    return item;
                                }),
                            );
                        } catch (error) {
                            logger("nft errro :: ", error)
                        }
                    }

                    dispatch(getNFTListFinish(allNFTList))
                    resolve(allNFTList);
                } else {
                    dispatch(getNFTListFinish([]))
                    reject(null)
                }
            })
            .catch(error => {
                dispatch(getNFTListFinish([]))
                logger('get wallet error', error);
                reject(error)
            });
    });
};

const resetNFTList = () => ({
    type: types.RESET_NFT_LIST,
});
export const resetNFTListFromAction = dispatch => {
    dispatch(resetNFTList());
};
