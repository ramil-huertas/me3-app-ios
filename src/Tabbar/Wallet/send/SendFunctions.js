import { getChainDetail, getBTCMapping } from '@database/sql';
import {
    longHandle,
    gasComputed,
    getPrice,
    saveNum,
    fromWei,
    toWei,
    send,
    callERCToken,
    hexToNumber,
} from '@chains/ethereum/contract';
import { logger } from '@constants/Log';
import { getGasFee } from '@chains/filcoin/jsonRPC';
import { apiGetUTXToList } from '@api/Gasapis';
import { feeComputed, signTransactionBTC } from '@chains/btc/wallet';
import { feeComputedLTC, signTransactionLTC } from '@chains/litcoin/wallet';
import { feeComputedBCH, signTransactionBCH } from '@chains/bch/wallet';
const rate = 0.3;
import { apiSendTransaction } from '@api/TransactionApis';
export async function getEthGas(
    currentClickedWallet,
    selectedTokenToSend,
    sendAmount,
    addressToPaste,
    dispatch,
) {
    try {
        let limit;
        if (selectedTokenToSend != null && selectedTokenToSend.contractAddr) {
            let value = await longHandle(
                sendAmount,
                selectedTokenToSend.precision,
            );
            limit = await gasComputed(
                {
                    from: currentClickedWallet.address,
                    to: selectedTokenToSend.contractAddr,
                    value: 0,
                },
                'ERC20',
                currentClickedWallet.chainDetail,
                currentClickedWallet.address,
                dispatch,
                'transfer',
                [addressToPaste, value],
                [],

            );
        } else {
            let value = await longHandle(sendAmount, 18);
            limit = await gasComputed(
                {
                    from: currentClickedWallet.address,
                    to: addressToPaste,
                    value,
                },
                '',
                currentClickedWallet.chainDetail,
                currentClickedWallet.address,
                dispatch,
                '',
                [],
                [],

            );
        }
        if (limit.gasType == 1) {
            let price = await getPrice(currentClickedWallet.chainDetail);
            let dataToPass = fromWei(
                `${parseInt(
                    parseInt(limit.gas) *
                    parseInt(price) *
                    (50 / 100 + 1) *
                    1.5 *
                    (1 + rate),
                )}`,
                currentClickedWallet.chainDetail.node,
                18,
            )
            let result = saveNum(
                dataToPass
            );
            logger(`result ${result}`);
            return result;
        } else {
            logger("No gas... error", limit)
            return 0;
        }
    } catch (error) {
        logger('ETH gas error ', error);
    }

}

export async function getEthGasNFT(
    clickedWallet,
    nftDetail,
    addressToPaste,
    setGasPrice,
    setProgressShowStatus,
    dispatch,
) {
    const chainDetail = await getChainDetail(clickedWallet.chain);
    let limit;
    try {
        if (nftDetail.contract_type == 'ERC721') {
            limit = await gasComputed(
                {
                    from: clickedWallet.address,
                    to: nftDetail.token_address,
                    value: 0,
                },
                'ERC721',
                chainDetail.rows.item(0),
                clickedWallet.address,
                dispatch,
                'transferFrom',
                [clickedWallet.address, addressToPaste, nftDetail.token_id],
                [],

            );
        } else if (nftDetail.contract_type == 'ERC1155') {
            limit = await gasComputed(
                {
                    from: clickedWallet.address,
                    to: nftDetail.token_address,
                    value: 0,
                },
                'ERC1155',
                chainDetail.rows.item(0),
                clickedWallet.address,
                dispatch,
                'safeTransferFrom',
                [
                    clickedWallet.address,
                    addressToPaste,
                    nftDetail.token_id,
                    1, //from amount
                    '0x0',
                ],
                [],
            );
        }
        if (limit.gasType == 1) {
            let price = await getPrice(chainDetail.rows.item(0));
            setGasPrice(price);
            let result = saveNum(
                fromWei(
                    `${parseInt(
                        parseInt(limit.gas) * parseInt(price) * (50 / 100 + 1) * 1.5,
                    )}`,
                    chainDetail.rows.item(0).node,
                    18,
                ),
            ); // CALCULATE FEE
            return {
                fee: result,
                gasPrice: price,
            };
        } else {
           logger("NFT gas error :: ", limit)
            return null;
        }
    } catch (error) {
        logger('***error', error);
        setProgressShowStatus(false);
    }
}

export async function getBtcGas(
    currentClickedWallet,
    mainCurrency,
    sendAmount,
    addressToPaste,
) {
    try {
        let mapping = await getBTCMapping(currentClickedWallet.id);
        const params = {
            address: currentClickedWallet.address,
            symbolType: mainCurrency.chainName,
        };
        let result = await apiGetUTXToList(params);
        let workWallet = {
            type: mapping.rows.item(0).type,
            address: currentClickedWallet.address,
        };
        let feeResult = await feeComputed(
            workWallet,
            result,
            addressToPaste,
            sendAmount,
            mainCurrency.chainName != 'BTC',
            parseInt(13 + rate * 10),
        );
        logger(feeResult / 1e8);
        return feeResult / 1e8;
    } catch (error) {
        logger('BTC gas fee error ', error);
    }
}

export async function getFilGas(
    currentClickedWallet,
    sendAmount,
    addressToPaste,
) {
    try {
        const chainDetail = await getChainDetail(currentClickedWallet.chain);
        let value = sendAmount;
        return await getGasFee(
            {
                from: currentClickedWallet.address,
                to: addressToPaste,
                amount: value,
            },
            chainDetail.rows.item(0).node,
        );
    } catch (error) {
        logger('FIL GAS Error ', error);
    }
}

export async function getLtcGas(
    currentClickedWallet,
    mainCurrency,
    sendAmount,
    addressToPaste,
) {
    try {
        let mapping = await getBTCMapping(currentClickedWallet.id);
        const params = {
            address: currentClickedWallet.address,
            symbolType: mainCurrency.chainName,
        };
        let result = await apiGetUTXToList(params);
        let workWallet = {
            type: mapping.rows.item(0).type,
            address: currentClickedWallet.address,
        };
        return await feeComputedLTC(
            workWallet,
            result,
            addressToPaste,
            sendAmount,
            mainCurrency.chainName != 'LTC',
            parseInt(2 + rate * 10),
        );
    } catch (error) {
        logger('ltc errro gas fee ', error);
    }
}

export async function getBchGas(
    currentClickedWallet,
    mainCurrency,
    sendAmount,
    addressToPaste,
) {
    try {
        let mapping = await getBTCMapping(currentClickedWallet.id);
        const params = {
            address: currentClickedWallet.address,
            symbolType: mainCurrency.chainName,
        };
        let result = await apiGetUTXToList(params);
        let workWallet = {
            type: mapping.rows.item(0).type,
            address: currentClickedWallet.address,
        };
        return await feeComputedBCH(
            workWallet,
            result,
            addressToPaste,
            sendAmount,
            mainCurrency.chainName != 'BCH',
            parseInt(2 + rate * 10),
        );
    } catch (error) {
        logger('ltc errro gas fee ', error);
    }
}

export async function sendEth(
    clickedWallet,
    selectedTokenToSend,
    amount,
    toWallet,
    setIsProgressShowStatus,
    dispatch,
) {
    logger('send eth called');
    let gasPrice = await getPrice(clickedWallet.chainDetail);
    let result;
    if (selectedTokenToSend.contractAddr) {
        let decimals = await callERCToken(
            {
                to: selectedTokenToSend.contractAddr,
            },
            'ERC20',
            clickedWallet.chainDetail.node,
            clickedWallet.address,
            'decimals',
            [],
            [],
        );
        decimals = hexToNumber(decimals);

        let value = await longHandle(amount, decimals);
        result = await send(
            {
                from: clickedWallet.address,
                to: selectedTokenToSend.contractAddr,
                value: 0,
                gasPrice: parseInt(gasPrice * (50 / 100 + 1) * (1 + rate)),
            },
            'ERC20',
            clickedWallet.chainDetail.node,
            clickedWallet,
            dispatch,
            'transfer',
            [toWallet, value],
            [],
        );
    } else {
        logger(clickedWallet.chainDetail.node);
        let value = await toWei(amount, clickedWallet.chainDetail.node);
        logger('wei ', value);
        result = await send(
            {
                from: clickedWallet.address,
                to: toWallet,
                value,
                gasPrice: parseInt(gasPrice * (50 / 100 + 1) * (1 + 0.03)),
            },
            '',
            clickedWallet.chainDetail.node,
            clickedWallet,
            dispatch,
            '',
            [],
            [],
        );
    }
    if (result && result.transactionHash) {
        return result.transactionHash;
    } else {
        setIsProgressShowStatus(false);
        logger('send failed');
        //this.$store.commit('tipErr', this.langJson("Send fail！"))
        return false;
    }
}

export async function sendETHNFT(
    clickedWallet,
    nftDetail,
    gasPrice,
    toWallet,
    dispatch,
) {
    logger(toWallet);
    const chainDetail = await getChainDetail(clickedWallet.chain);
    let result;
    logger('chaindetail ', chainDetail);
    try {
        if (nftDetail.contract_type == 'ERC721') {
            result = await send(
                {
                    from: clickedWallet.address,
                    to: nftDetail.token_address,
                    value: 0,
                    gasPrice: parseInt(gasPrice * (50 / 100 + 1)),
                },
                'ERC721',
                chainDetail.rows.item(0).node,
                clickedWallet,
                dispatch,
                'transferFrom',
                [clickedWallet.address, toWallet, nftDetail.token_id],
                [],
            );
        } else if (nftDetail.contract_type == 'ERC1155') {
            result = await send(
                {
                    from: clickedWallet.address,
                    to: nftDetail.token_address,
                    value: 0,
                    gasPrice: parseInt(gasPrice * (50 / 100 + 1)),
                },
                'ERC1155',
                chainDetail.rows.item(0).node,
                clickedWallet,
                dispatch,
                'safeTransferFrom',
                [clickedWallet.address, toWallet, nftDetail.token_id, 1, '0x0'],
                [],
            );
        }
        logger('Result ', result.transactionHash);
        let hash = result.transactionHash;
        if (hash != null && hash.length > 0) return result.transactionHash;
        else return '';
    } catch (error) {
        logger('ERROR :: ', error);
    }
}

export async function sendBtc(
    clickedWallet,
    mainCurrency,
    amount,
    toWallet,
    setIsProgressShowStatus,
) {
    try {
        let mapping = await getBTCMapping(clickedWallet.id);
        const params = {
            address: clickedWallet.address,
            symbolType: mainCurrency.chainName,
        };
        let result = await apiGetUTXToList(params);
        let workWallet = {
            type: mapping.rows.item(0).type,
            address: clickedWallet.address,
            privateKey: clickedWallet.privateKey,
        };
        let signTransaction = await signTransactionBTC(
            workWallet,
            result,
            toWallet,
            amount,
            mainCurrency.chainName != 'BTC',
            parseInt(10 + rate * 10),
        );
        logger('Signtrasaction ', signTransaction);
        let sendResult;
        if (signTransaction) {
            const reqParam = {
                symbol: mainCurrency.symbol,
                hash: signTransaction,
                symbolType: mainCurrency.chainName,
            };
            sendResult = await apiSendTransaction(reqParam);
            logger('sendresult ', sendResult.result);
        }
        if (sendResult.result) {
            return sendResult.result;
        } else {
            return false;
        }
    } catch (error) {
        setIsProgressShowStatus(false);
        logger('btc send error ', error);
    }
}

export async function sendLtc(
    clickedWallet,
    mainCurrency,
    amount,
    toWallet,
    setIsProgressShowStatus,
) {
    try {
        let mapping = await getBTCMapping(clickedWallet.id);
        const params = {
            address: clickedWallet.address,
            symbolType: mainCurrency.chainName,
        };
        logger('UTXtolist ', params);
        let result = await apiGetUTXToList(params);
        logger('result frm utxtolist => ', result);
        let workWallet = {
            type: mapping.rows.item(0).type,
            address: clickedWallet.address,
            privateKey: clickedWallet.privateKey,
        };
        logger('work wallet ', workWallet);
        let signTransaction = await signTransactionLTC(
            workWallet,
            result,
            toWallet,
            amount,
            mainCurrency.chainName != 'LTC',
            parseInt(2 + rate * 10),
        );
        logger('Signtrasaction ', signTransaction);
        let sendResult;
        if (signTransaction) {
            const reqParam = {
                symbol: mainCurrency.symbol,
                hash: signTransaction,
                symbolType: mainCurrency.chainName,
            };
            sendResult = await apiSendTransaction(reqParam);
            logger('sendresult ', sendResult.result);
        }
        if (sendResult.result) {
            return sendResult.result;
        } else {
            return false;
        }
    } catch (error) {
        setIsProgressShowStatus(false);
        logger('btc send error ', error);
    }
}
export async function sendBch(
    clickedWallet,
    mainCurrency,
    amount,
    toWallet,
    setIsProgressShowStatus,
) {
    try {
        let mapping = await getBTCMapping(clickedWallet.id);
        const params = {
            address: clickedWallet.address,
            symbolType: mainCurrency.chainName,
        };
        logger('UTXtolist ', params);
        let result = await apiGetUTXToList(params);
        logger('result frm utxtolist => ', result);
        let workWallet = {
            type: mapping.rows.item(0).type,
            address: clickedWallet.address,
            privateKey: clickedWallet.privateKey,
        };
        logger('work wallet ', workWallet);
        let signTransaction = await signTransactionBCH(
            workWallet,
            result,
            toWallet,
            amount,
            mainCurrency.chainName != 'BCH',
            parseInt(2 + rate * 10),
        );
        logger('Signtrasaction ', signTransaction);
        let sendResult;
        if (signTransaction) {
            const reqParam = {
                symbol: mainCurrency.symbol,
                hash: signTransaction,
                symbolType: mainCurrency.chainName,
            };
            sendResult = await apiSendTransaction(reqParam);
            logger('sendresult ', sendResult.result);
        }
        if (sendResult.result) {
            return sendResult.result;
        } else {
            return false;
        }
    } catch (error) {
        setIsProgressShowStatus(false);
        logger('btc send error ', error);
    }
}
