import erc20_abi from './ERC20.json';
import erc721_abi from './ERC721.json';
import erc1155_abi from './ERC1155.json';
import Web3 from 'web3';
import { Decrypt } from '@constants/EncryptDecrypt';
import { logger } from '@constants/Log';
import { showMessageToast } from '@redux/Action/ToastAlert';

export function longHandleFromWeb3(n, node) {
    let ethUtils = ethWeb3(node).utils;
    let weiNumber = ethUtils.toWei("" + n, 'ether');
    logger(`amount (${n}) = wei (${weiNumber})`)
    return weiNumber
}
export function longHandle(n, l = 18) {
    let valueToReturn = parseFloat(n) * Math.pow(10, l)
    console.log("longhandle precision value :: ", valueToReturn)
    return valueToReturn
    // n = '' + n;
    // if (n.indexOf('.') == -1) {
    //     n = n + new Array(l).fill(0).join('');
    // } else {
    //     let h = n.split('.')[0];
    //     let e = n.split('.')[1];
    //     if (e.length >= l) {
    //         e = e.substr(0, l);
    //     } else {
    //         e = e + new Array(l - e.length).fill(0).join('');
    //     }
    //     if (parseInt(h)) {
    //         n = h + e;
    //     } else {
    //         n = e;
    //     }
    // }
    // logger(
    //     `longhandle swpaamount =${n} precision=${l} , final amountOut = ${n}`,
    // );
    // return n;
}

export function smallHandle(n, l = 18) {
    try {
        n = '' + n;
        let e = n.length - l;
        if (n.length >= l + 1) {
            let f = n.slice(0, e);
            let s = n.slice(e);
            n = `${f}.${s}`;
        } else {
            let f;
            f = new Array(Math.abs(e)).fill(0).join('');
            n = `0.${f}${n}`;
        }
        return parseFloat(n);
    } catch (err) {
        logger('****** ', err);
    }
}

export async function eth_SwapSend(params, node, privateKey) {
    let ethObj = ethWeb3(node).eth;
    let ethUtils = ethWeb3(node).utils;
    let isPass = true;
    let gas;
    try {
        gas = await ethObj.estimateGas(params);
        gas = parseInt(gas * 1.5).toString();
        params.gas = ethUtils.numberToHex(gas);
    } catch (err) {
        console.log('error :: ', err);
        isPass = false;
    }
    if (!isPass) {
        return;
    }
    let nonce = await ethObj.getTransactionCount(params.from);
    params.nonce = nonce;

    let privateKeyDecryp = await Decrypt(privateKey);
    let signed = await ethObj.accounts.signTransaction(
        params,
        privateKeyDecryp,
    );
    let result;
    try {
        result = await getTransactionHash(signed.rawTransaction, node);
    } catch (err) {
        console.log('thash :: ', err);
        return false;
    }
    return result;
}

export async function eth_SwapGas(params, node, dispatch) {
    let ethObj = ethWeb3(node).eth;
    let gas;
    try {
        gas = await ethObj.estimateGas(params);
        gas = parseInt(gas * 1.3).toString();
        return { gas, status: true };
    } catch (err) {
        console.log('eth_SwapGas error', err);
        // showMessageToast(dispatch, `${err}`);
        return { message: err, status: false };
    }
}
const ethWeb3 = node => {
    return new Web3(new Web3.providers.HttpProvider(node));
};
export async function gasComputed(
    tx,
    type,
    chainDetail,
    clickedWallet,
    dispatch,
    method = '',
    param = [],
    json = [],
) {
    let abi = await initAbi(type, json);
    let params = tx;
    // let { node,wallet,privateKey } = await runBase(true,chainDetail)
    let node = chainDetail.node;
    let wallet = clickedWallet;
    // 如果没有填写发起人默认自己
    if (!('from' in params)) {
        params.from = wallet;
    }
    let ethObj = ethWeb3(node).eth;
    // data 转码
    if (method) {
        let methodABI = abi.filter(item => {
            return item.type == 'function' && item.name == method;
        })[0];
        params.data = ethObj.abi.encodeFunctionCall(methodABI, param);
    }
    // 获取gaslimit 以及检查是否
    let gasObjectWithStatus;
    let gas;
    try {
        gas = await ethObj.estimateGas(params);

        gas = parseInt(gas * 1.3).toString();
        gasObjectWithStatus = { gas, gasType: 1 }
        return gasObjectWithStatus;
    } catch (err) {
        console.log(' gasComputed error', err);
        // showMessageToast(dispatch, `${err}`);
        gasObjectWithStatus = { gas, gasType: 0 }
        return gasObjectWithStatus;
    }
}
export async function getPrice(chainDetail) {
    let ethObj = ethWeb3(chainDetail.node).eth;
    return ethObj.getGasPrice();
}
export async function getPriceWithNodeDirect(node) {
    let ethObj = ethWeb3(node).eth;
    return ethObj.getGasPrice();
}
async function initAbi(type = 'ERC1155', abi = []) {
    return new Promise((resolve, reject) => {
        try {
            switch (type) {
                case 'ERC20':
                    this.abi = erc20_abi.abi.concat(abi);
                    break;
                case 'ERC721':
                    this.abi = erc721_abi.abi.concat(abi);
                    break;
                case 'ERC1155':
                    this.abi = erc1155_abi.abi.concat(abi);
                    break;
                default:
                    this.abi = abi;
                    break;
            }
            resolve(this.abi);
        } catch (err) {
            logger(err);
            reject(false);
        }
    });
}
export function saveNum(n, l = 8) {
    n = '' + n;
    if (n.indexOf('.') == -1) {
        n = n + '.' + new Array(l).fill(0).join('');
    } else {
        let h = n.split('.')[0];
        let e = n.split('.')[1];
        if (e.length >= l) {
            e = e.substr(0, l);
        } else {
            e = e + new Array(l - e.length).fill(0).join('');
        }
        n = h + '.' + e;
    }
    try {
        //去零
        let num = n - 0;
        const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
        return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
    } catch (e) {
        return n;
    }
}
export function fromWei(n, node, l = 18) {
    let ethUtils = ethWeb3(node).utils;
    let result;
    if (!n) {
        return 0;
    }
    switch (l) {
        case 18:
            result = ethUtils.fromWei(n, 'ether');
            break;
        case 15:
            result = ethUtils.fromWei(n, 'finney');
            break;
        case 12:
            result = ethUtils.fromWei(n, 'micro');
            break;
        case 10:
            result = parseFloat(parseInt(n) / Math.pow(10, parseInt(l)));
            break;
        case 9:
            result = ethUtils.fromWei(n, 'gwei');
            break;
        case 8:
            result = parseFloat(parseInt(n) / Math.pow(10, parseInt(l)));
            break;
        case 7:
            result = parseFloat(parseInt(n) / Math.pow(10, parseInt(l)));
            break;
        case 6:
            result = ethUtils.fromWei(n, 'mwei');
            break;
        case 5:
            result = parseFloat(parseInt(n) / Math.pow(10, parseInt(l)));
            break;
        case 4:
            result = parseFloat(parseInt(n) / Math.pow(10, parseInt(l)));
            break;
        case 3:
            result = ethUtils.fromWei(n, 'kwei');
            break;
        case 2:
            result = parseFloat(parseInt(n) / Math.pow(10, parseInt(l)));
            break;
        case 1:
            result = parseFloat(parseInt(n) / Math.pow(10, parseInt(l)));
            break;
        default:
            result = n;
            break;
    }
    return result;
}

export async function toWei(value, node) {
    let ethUtils = ethWeb3(node).utils;
    return ethUtils.toWei(value.toString(), 'ether');
}

export async function send(
    tx,
    type,
    node,
    clickedWallet,
    dispatch,
    method = '',
    param = [],
    json = [],
) {
    let abi = await initAbi(type, json);
    let params = tx;
    let wallet = clickedWallet.address;

    let privateKey = await Decrypt(clickedWallet.privateKey);
    if (!('from' in params)) {
        params.from = wallet;
    }
    let ethObj = ethWeb3(node).eth;
    let ethUtils = ethWeb3(node).utils;
    let isPass = true;
    if (method) {
        let methodABI = abi.filter(item => {
            return item.type == 'function' && item.name == method;
        })[0];
        params.data = ethObj.abi.encodeFunctionCall(methodABI, param);
    }
    let gas;
    try {
        gas = await ethObj.estimateGas(params);
        gas = parseInt(gas * 1.5).toString();
        params.gas = ethUtils.numberToHex(gas);
    } catch (err) {
        logger('send errro ', err);
        // show toast here
        // showMessageToast(dispatch, err + '');
        isPass = false;
    }
    // 终止交易
    if (!isPass) {
        return;
    }
    let nonce = await ethObj.getTransactionCount(params.from);
    params.nonce = nonce;

    // 进行交易签名

    let signed = await ethObj.accounts.signTransaction(params, privateKey);

    // 广播交易
    let result;
    try {
        result = await getTransactionHash(signed.rawTransaction, node);
    } catch (err) {
        logger(err);
        // showMessageToast(dispatch, err + '');
        return false;
    }
    return result;
}
export async function callERCToken(
    tx,
    type,
    node,
    wallet,
    method = '',
    param = [],
    json = [],
) {
    let abi = await initAbi(type, json);
    let params = tx;
    logger(node);
    if (!('from' in params)) {
        params.from = wallet;
    }
    let ethObj = ethWeb3(node).eth;
    if (method) {
        let methodABI = abi.filter(item => {
            return item.type == 'function' && item.name == method;
        })[0];
        params.data = ethObj.abi.encodeFunctionCall(methodABI, param);
    }
    return ethObj.call(params);
}
export async function call(
    tx,
    type,
    node,
    wallet,
    method = '',
    param = [],
    json = [],
) {
    let abi = await initAbi(type, json);
    let params = tx;

    if (!('from' in params)) {
        params.from = wallet;
    }
    let ethObj = ethWeb3(node).eth;
    if (method) {
        let methodABI = abi.filter(item => {
            return item.type == 'function' && item.name == method;
        })[0];
        params.data = ethObj.abi.encodeFunctionCall(methodABI, param);
    }
    return ethObj.call(params);
}
export function goodNumber(n) {
    n = n + '';
    let r = n.split('e')[0];
    let l = n.split('e')[1] ? n.split('e')[1] : '';
    if (l) {
        let zl;
        let zs = '';
        let rf = 0;
        if (/^\+\d+$/.test(l)) {
            zl = l.split('+')[1];
            for (let i = 0; i < zl; i++) {
                zs += '0';
            }
            if (r.split('.')[1]) {
                rf = r.split('.')[1].length;
                r = r.split('.')[0] + r.split('.')[1];
            }
            zs = zs.slice(0, zs.length - rf);
            return r + zs;
            // eslint-disable-next-line no-useless-escape
        } else if (/^\-\d+$/.test(l)) {
            zl = l.split('-')[1];
            for (let i = 0; i < zl; i++) {
                zs += '0';
            }
            rf = r.split('.')[0].length;
            if (r.split('.')[1]) {
                r = r.split('.')[0] + r.split('.')[1];
            }
            zs = zs.slice(0, zs.length - rf);
            return '0.' + zs + r;
        }
    } else {
        return r;
    }
}

export function hexToNumber(value) {
    return parseInt(value, 16);
}
function getTransactionHash(rawTransaction, node) {
    return new Promise((resolve, reject) => {
        let ethObj = ethWeb3(node).eth;
        ethObj
            .sendSignedTransaction(rawTransaction)
            .on('transactionHash', transactionHash => {
                logger(`交易hash:${transactionHash}`);
                resolve({
                    transactionHash,
                });
            })
            .on('error', error => {
                logger('sendSignedTransaction error', error);

                reject(error.toString());
            });
    });
}
