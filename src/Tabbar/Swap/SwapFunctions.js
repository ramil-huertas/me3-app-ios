import { swap_get_encode } from '@api/SwapApis';
import { apiGetCoinDetail } from '@api/CoinApis';
import {
    longHandle,
    smallHandle,
    eth_SwapGas,
    getPriceWithNodeDirect,
    saveNum,
    fromWei,
    send,
    call,
    hexToNumber,
    goodNumber,
    longHandleFromWeb3,
} from '@chains/ethereum/contract';
import { getPrecision } from '../TabbarFuncation';
import { logger } from '@constants/Log';
import { getPayAndReceiveSymbolList } from '@redux/Action/SwapAction';
import { showMessageToast } from '@redux/Action/ToastAlert';
let _ = require('lodash');


function getAmountToPass(SwapReducer, amount, selectedChainWallet) {
    let precision = getPrecision(SwapReducer.paySymbolDetails)
    //console.log("seleced chainwalet ", selectedChainWallet)
    if (precision == 18 && selectedChainWallet && selectedChainWallet.node) {
        return longHandleFromWeb3(
            amount,
            selectedChainWallet.node,
        )
    } else {
        let valueToReturn = amount * Math.pow(10, precision)
        console.log("longhandle precision value :: ",valueToReturn)
        return valueToReturn;//longHandle(amount, precision)
    }
}
export const getParams = (SwapReducer, amount, selectedChainWallet) => {
console.log("*******selectedChainWallet.chainId*********",selectedChainWallet.chainId)
    try {
        let amountInCalculated = getAmountToPass(SwapReducer, amount, selectedChainWallet)
        return {
            tokenIn: SwapReducer.paySymbolDetails.contractAddr
                ? SwapReducer.paySymbolDetails.contractAddr
                : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            tokenOut: SwapReducer.receiveSymbolDetail.contractAddr
                ? SwapReducer.receiveSymbolDetail.contractAddr
                : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            amountIn: amountInCalculated,
            to: selectedChainWallet.address,
            chainId: selectedChainWallet.chainId,
        }
    } catch (error) {
        logger("ERROR  : : :getParams : : :: ", error)
        return null
    }
};

export const getParamsReverse = (SwapReducer, amount, selectedChainWallet) => {
    return {
        tokenIn: SwapReducer.receiveSymbolDetail.contractAddr
            ? SwapReducer.receiveSymbolDetail.contractAddr
            : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        tokenOut: SwapReducer.paySymbolDetails.contractAddr
            ? SwapReducer.paySymbolDetails.contractAddr
            : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        amountIn: getAmountToPass(SwapReducer.amount, selectedChainWallet),
        to: selectedChainWallet.address,
        chainId: selectedChainWallet.chainId,
    };
};

export function convert(n) {
    let sign = +n < 0 ? '-' : '',
        toStr = n.toString();
    if (!/e/i.test(toStr)) {
        return n;
    }
    let [lead, decimal, pow] = n
        .toString()
        .replace(/^-/, '')
        .replace(/^([0-9]+)(e.*)/, '$1.$2')
        .split(/e|\./);
    return +pow < 0
        ? sign +
        '0.' +
        '0'.repeat(Math.max(Math.abs(pow) - 1 || 0, 0)) +
        lead +
        decimal
        : sign +
        lead +
        (+pow >= decimal.length
            ? decimal +
            '0'.repeat(Math.max(+pow - decimal.length || 0, 0))
            : decimal.slice(0, +pow) + '.' + decimal.slice(+pow));
}
export async function getEncode(
    SwapReducer,
    value,
    selectedChainWallet,
    setSwapAmount,
    setSwapToAmount,
    setEncode,
    setFee,
    setParamsToSend,
    reverseCalculation,
    dispatch,
) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("encode :: called :: for ::::: getparams :: ")
            let encode = {};
            const params = reverseCalculation
                ? getParamsReverse(SwapReducer, value, selectedChainWallet)
                : getParams(SwapReducer, value, selectedChainWallet);
            let result = await swap_get_encode(params, dispatch);
            let isEncodeExist = 'encodedSwapData' in result;
            if (!isEncodeExist) {
                // showMessageToast(
                //     dispatch,
                //     'Current currency pair does not support exchange',
                // );
            } else {
                let smallhandleamountNotFixed = smallHandle(
                    result.outputAmount,
                    getPrecision(SwapReducer.receiveSymbolDetail),
                );
                let smallhandleamount = smallhandleamountNotFixed;
                const mainValue = convert(smallhandleamount);
                if (reverseCalculation) {
                    setSwapAmount(parseFloat(mainValue).toFixed(5).toString());
                } else {
                    setSwapToAmount(mainValue.toString());
                }
                encode = result;
                setEncode(encode);
                logger('smallhandle ', smallhandleamount);
                const encodeObject = {
                    encode: encode,
                    amount: mainValue,
                };
                resolve(encodeObject);
            }
        } catch (err) {
            logger(err);
            reject(err);
        }
    });
}

export async function getGasSwap(
    encode,
    swapAmount,
    selectedChainWallet,
    SwapReducer,
    setParamsToSend,
    dispatch,
) {
    try {
        console.log("swapamount :: ", swapAmount)
        console.log("precision :: ", getPrecision(SwapReducer.paySymbolDetails))
        let limit = await eth_SwapGas(
            {
                from: selectedChainWallet.address,
                to: encode.routerAddress,
                data: encode.encodedSwapData,
                value:
                    SwapReducer.paySymbolDetails.contractAddr == ''
                        ? getAmountToPass(SwapReducer, swapAmount, selectedChainWallet)
                        : 0,
            },
            selectedChainWallet.node,
            dispatch,
        );

        let price = await getPriceWithNodeDirect(selectedChainWallet.node);

        let params = {
            from: selectedChainWallet.address,
            to: encode.routerAddress,
            data: encode.encodedSwapData,
            value:
                SwapReducer.paySymbolDetails.contractAddr == ''
                    ? swapAmount
                    : 0,
            gasPrice: parseInt(parseInt(price) * (20 / 100 + 1)),
        };
        setParamsToSend(params);
        let dataToPass = fromWei(
            `${parseInt(
                parseInt(limit) * parseInt(price) * (50 / 100 + 1) * 1.5,
            )}`,
            selectedChainWallet.node,
            18,
        );
        return saveNum(dataToPass);
    } catch (err) {
        logger('getGasSwap error', err);
        return 0;
    }
}

export const checkIfMainSymbol = SwapReducer => {
    return SwapReducer.paySymbolDetails.contractAddr
        ? SwapReducer?.paySymbolDetails?.contractAddr?.toLowerCase() == ''
        : true;
};

export const getEncodeForGasPrice = async (
    SwapReducer,
    amount,
    selectedChainWallet,
    setParamsToSend,
    dispatch,
) => {

    // return await getGasSwap(
    //     encode,
    //     amount,
    //     selectedChainWallet,
    //     SwapReducer,
    //     setParamsToSend,
    //     dispatch,
    // );
    try {
        console.log("getEncodeForGasPrice :: called :: for ::::: getparams :: ")

        const params1 = getParams(SwapReducer, amount, selectedChainWallet);
        let encode = await swap_get_encode(params1, dispatch);
        console.log("swapamount :: ", amount)
        console.log("precision :: ", getPrecision(SwapReducer.paySymbolDetails))
        let limit = await eth_SwapGas(
            {
                from: selectedChainWallet.address,
                to: encode.routerAddress,
                data: encode.encodedSwapData,
                value:
                    SwapReducer.paySymbolDetails.contractAddr == ''
                        ? getAmountToPass(SwapReducer, amount, selectedChainWallet)
                        : 0,
            },
            selectedChainWallet.node,
            dispatch,
        );
        if (limit && limit.status) {
            let price = await getPriceWithNodeDirect(selectedChainWallet.node);

            let params = {
                from: selectedChainWallet.address,
                to: encode.routerAddress,
                data: encode.encodedSwapData,
                value:
                    SwapReducer.paySymbolDetails.contractAddr == ''
                        ? amount
                        : 0,
                gasPrice: parseInt(parseInt(price) * (20 / 100 + 1)),
            };
            setParamsToSend(params);
            let dataToPass = fromWei(
                `${parseInt(
                    parseInt(limit.gas) * parseInt(price) * (50 / 100 + 1) * 1.5,
                )}`,
                selectedChainWallet.node,
                18,
            );
            return saveNum(dataToPass);
        } else {
            console.log("error from gasgetGasSwap calculation ::", limit.message)
            return false
        }
    } catch (err) {
        logger('getGasSwap error', err);
        return false;
    }
};

export async function checkApproveStatus(
    SwapReducer,
    amount,
    selectedChainWallet,
    setEncode,
    dispatch,
    setProgressStatus
) {
    if (amount != 0) {
        let status = checkIfMainSymbol(SwapReducer);
        if (!status) {
            setProgressStatus(true)
            return await getApproveAmount(
                SwapReducer,
                amount,
                selectedChainWallet,
                setEncode,
                dispatch,
            );
        } else {
            return true;
        }
    }
}

async function getApproveAmount(
    SwapReducer,
    amount,
    selectedChainWallet,
    setEncode,
    dispatch,
) {
    try {
        logger('getapprove amount called');
        let amountIn = getAmountToPass(SwapReducer, amount, selectedChainWallet);
        let result = await swap_get_encode(
            {
                tokenIn: SwapReducer.paySymbolDetails.contractAddr
                    ? SwapReducer.paySymbolDetails.contractAddr
                    : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                tokenOut: SwapReducer.receiveSymbolDetail.contractAddr
                    ? SwapReducer.receiveSymbolDetail.contractAddr
                    : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                amountIn,
                to: selectedChainWallet.address,
                chainId: selectedChainWallet.chainId,
            },
            dispatch,
        );
        let isEncodeExist = 'encodedSwapData' in result;
        if (isEncodeExist) {
            setEncode(result);
        }
        let isrouterAddress = 'routerAddress' in result;
        if (isrouterAddress) {
            try {
                let amount1 = await call(
                    {
                        to: SwapReducer.paySymbolDetails.contractAddr,
                    },
                    'ERC20',
                    selectedChainWallet.node,
                    selectedChainWallet.address,
                    'allowance',
                    [selectedChainWallet.address, result.routerAddress],
                    [],
                );
                amount1 = hexToNumber(amount1);
                logger(`Approve from getApproveAmount :${amount1}`);
                let pass =
                    parseInt(goodNumber(amount1)) >=
                    parseInt(goodNumber(amountIn));
                return pass;
            } catch (error) {
                logger('isrouterAddress error', error);
                return false;
            }
        }
    } catch (error) {
        logger('getapproveamount error ', error);
        return false;
    }
}

export async function approveAmount(
    SwapReducer,
    encodeData,
    selectedChainWallet,
    dispatch,
    setProgressStatus,
) {
    try {
        setProgressStatus(true);
        let result = await send(
            {
                from: selectedChainWallet.address,
                to: SwapReducer.paySymbolDetails.contractAddr,
            },
            'ERC20',
            selectedChainWallet.node,
            selectedChainWallet,
            dispatch,
            'approve',
            [
                encodeData.routerAddress,
                '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            ],
            [],
        );
        logger('send result', result);
        setProgressStatus(false)
        return !!result;
    } catch (err) {
        logger(err);
        setProgressStatus(false);
    }
}

export const checkIfEnoughBalance = (SwapReducer, amount) => {
    console.log(`********************************************* amount ${amount}  paysymbol amount ${parseFloat(SwapReducer.paySymbolDetails.balance).toFixed(5)}`)
    let balance_check =
        parseFloat(amount) <= parseFloat(SwapReducer.paySymbolDetails.balance).toFixed(5);
    return balance_check;
};


/** NEW FUNCTIONS **/
export async function getSwapCoinList(
    chain,
    dispatch,
    mergedList,
) {
    if (chain != undefined || chain != null) {
        await getPayAndReceiveSymbolList(
            dispatch,
            chain,
            mergedList,
        );
    } else {
        logger('swap function => selectedChainWallet is null');
    }
}
export const getFilteredSwapCoinListArray = async swapList => {
    if (swapList && swapList.length > 1) {
        let filtered_array = _.filter(swapList, function (item) {
            return item.coinType == 0;
        });
        return filtered_array;
    }
};
export async function getSymbolDetail(id, selectedChainWallet) {
    const params = {
        coinId: id,
        chainName: selectedChainWallet.chain,
        address: selectedChainWallet.address,
    };
    let resultData = await apiGetCoinDetail(params);
    return resultData;
}
