import { requestRPCForFilcoin } from '@api/Gasapis';
import { logger } from '@constants/Log';
let { BigNumber } = require('bignumber.js');
export async function getGasFee({ from, to, amount }, node) {
    let nonce = await getNonce(from, node);
    let message = {
        From: from,
        To: to,
        Nonce: nonce,
        Value: new BigNumber(`${amount}e18`),
        GasLimit: 0,
        GasFeeCap: new BigNumber(0),
        GasPremium: new BigNumber(0),
        Method: 0,
        Params: '',
    };
    return getGas(message, node);
}

async function getGas(message, node) {
    try {
        let { result } = await requestRPCForFilcoin({
            // url:'https://calibration.node.glif.io',
            url: node,
            params: {
                jsonrpc: '2.0',
                method: 'Filecoin.GasEstimateMessageGas',
                params: [message, { MaxFee: '30000000000000' }, []],
                id: 7878,
            },
        });
        return result;
    } catch (err) {
        logger(err);
    }
}
async function getNonce(address, node) {
    logger(`gas fee ${address} ${node}`);
    let { result } = await requestRPCForFilcoin({
        // url:'https://calibration.node.glif.io',
        url: node,
        params: {
            jsonrpc: '2.0',
            method: 'Filecoin.MpoolGetNonce',
            params: [address],
            id: 7878,
        },
    });
    return result;
}
// export async function signMsg(message, privateKey) {
//     try {
//         let nonce = await getNonce(message.from);
//         message = {
//             From: message.from,
//             To: message.to,
//             Nonce: nonce,
//             Value: new BigNumber(`${parseFloat(message.value)}e18`),
//             GasLimit: 0,
//             GasFeeCap: new BigNumber(0),
//             GasPremium: new BigNumber(0),
//             Method: 0,
//             Params: '',
//         };
//         let unsignedMessage = await this.getGas(message);
//         this.platform = plus.webview.create(
//             '../../hybrid/html/fil/index.html',
//             'fil_platform',
//             {
//                 top: '0px',
//                 bottom: '0px',
//             },
//             {
//                 unsignedMessage,
//                 privateKey,
//             },
//         );
//         this.platform.appendJsFile('_www/static/common/fileSigner.js');

//         let Signature = await this.getSign();
//         if (Signature) {
//             this.$store.commit('waitStatus', false);
//             this.$store.commit('fileSign', '');

//             return await this.pushMsg(Signature);
//         }
//         this.platform.close();
//     } catch (err) {
//         this.$store.commit('waitStatus', false);
//         this.$store.commit('fileSign', '');
//         return false;
//     }
// }
