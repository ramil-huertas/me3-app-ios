const bitcoin = require('bitcoinjs-lib');
const bitcoinlib = require('react-native-bitcoinjs-lib');
import { Encrypt, Decrypt } from '@constants/EncryptDecrypt';
import { getSeedFromMnemonic, generateMnemonic } from '../WalletUtils';
import { logger } from '@constants/Log';

const chooseBipSeed = (bip, count, testnet) => {
    // choose bip
    let path;
    switch (bip) {
        case '32':
            if (testnet) {
                path = "m/0'/3/0" + count;
            } else {
                path = "m/0'/2/0" + count;
            }
            break;
        case '44':
            if (testnet) {
                path = "m/44'/3'/0'/0/" + count;
            } else {
                path = "m/44'/2'/0'/0/" + count;
            }
            break;
        default:
            if (testnet) {
                path = "m/49'/3'/0'/0/" + count;
            } else {
                path = "m/49'/2'/0'/0/" + count;
            }
            break;
    }
    return path;
};
async function createLTCSeed(count, index, mnemonic, seed, testnet = true) {
    try {
        let network;
        if (testnet) {
            network = bitcoinlib.networks.ltc_testnet;
        } else {
            network = bitcoinlib.networks.litecoin;
        }

        let wallets = [];
        let currentSeed;
        if (mnemonic) {
            currentSeed = seed;
        } else {
            mnemonic = generateMnemonic();
            currentSeed = await getSeedFromMnemonic(mnemonic);
        }

        const root = bitcoin.bip32.fromSeed(currentSeed, network);
        let path = chooseBipSeed('44', index, testnet);
        let wif = root.derivePath(path).toWIF();
        const keyPair = bitcoin.ECPair.fromWIF(wif, network);
        let address_P2PKH = generateAddress('P2PKH', keyPair, network);
        let witness_P2WPKH = generateAddress('P2WPKH', keyPair, network);
        wallets.push({
            address: address_P2PKH,
            type: 'P2PKH',
            address_P2PKH: address_P2PKH,
            address_P2WPKH: witness_P2WPKH,
            privateKey: wif,
        });

        return {
            seed: mnemonic,
            list: wallets,
        };
    } catch (error) {
        logger('Error ltc', error);
    }
}
async function recoverAddressLitcoin(privatekey, testnet = true) {
    try {
        logger(testnet);
        let network = bitcoinlib.networks.litecoin;

        const keyPair = bitcoin.ECPair.fromWIF(privatekey, network);
        let address_P2PKH = generateAddress('P2PKH', keyPair, network);
        let witness_P2WPKH = generateAddress('P2WPKH', keyPair, network);
        return {
            address: address_P2PKH,
            type: 'P2PKH',
            address_P2PKH: address_P2PKH,
            address_P2WPKH: witness_P2WPKH,
            privateKey: await Encrypt(privatekey),
        };
    } catch (error) {
        logger('Error ltc', error);
    }
}
let generateAddress = (type, keyPair, network) => {
    try {
        let address;
        if (type == 'P2WPKH') {
            const p2wpkh = bitcoin.payments.p2sh({
                redeem: bitcoin.payments.p2wpkh({
                    pubkey: keyPair.publicKey,
                    network,
                }),
                network,
            });
            address = p2wpkh.address;
        } else {
            const p2pkh = bitcoin.payments.p2pkh({
                pubkey: keyPair.publicKey,
                network,
            });
            address = p2pkh.address;
        }

        return address;
    } catch (err) {
        console.error(err);
        return false;
    }
};

let feeComputedLTC = async (
    wallet,
    txs,
    to,
    sendAmount,
    testnet = true,
    sat = 1,
) => {
    try {
        logger(testnet);
        if (!txs) {
            throw new Error('UTXO获取失败！');
        }
        let inputCount = txs.length;
        let inputArr = [];
        let amount = 0;
        if (inputCount <= 0) {
            throw new Error('Insufficient Balance');
        }

        // 整理输入信息
        for (let x = 0; x < inputCount; x++) {
            amount += txs[x].value;
            inputArr.push({
                txid: txs[x].tx_hash,
                vout: txs[x].tx_pos,
                value: txs[x].value,
            });
        }
        amount = parseInt(amount);
        // 计算手续费以及发送金额
        let fee = (inputCount * 180 + 2 * 34 + 10 + 40) * sat;
        sendAmount = parseInt(sendAmount * 100000000);
        if (amount < sendAmount + fee) {
            logger('Insufficient Balance');
            return false;
        }
        logger(`输入总金额:${amount}`);
        logger(`手续费:${fee}`);

        return fee;
    } catch (err) {
        // show error
        console.error(err);
        return false;
    }
};
let signTransactionLTC = async (
    wallet,
    txs,
    to,
    sendAmount,
    testnet = true,
    sat = 1,
) => {
    logger(wallet, txs, to, sendAmount, testnet, sat);
    try {
        let network;
        if (!txs) {
            throw new Error('UTXO获取失败！');
        }
        let inputCount = txs.length;
        let inputArr = [];
        let amount = 0;
        if (inputCount <= 0) {
            throw new Error('余额不足');
        }
        // 网络
        network = bitcoinlib.networks.litecoin;
        // 整理输入信息
        for (let x = 0; x < inputCount; x++) {
            amount += txs[x].value;
            inputArr.push({
                txid: txs[x].tx_hash,
                vout: txs[x].tx_pos,
                value: txs[x].value,
            });
        }
        amount = parseInt(amount);
        // 计算手续费以及发送金额
        let fee = (inputCount * 180 + 2 * 34 + 10 + 40) * sat;
        sendAmount = parseInt(sendAmount * 100000000);
        logger(`输入总金额:${amount}`);
        logger(`手续费:${fee}`);
        let privateKey = await Decrypt(wallet.privateKey);
        const keyPair = bitcoin.ECPair.fromWIF(privateKey, network);
        // 构建交易对象
        const RawTransaction = new bitcoin.TransactionBuilder(network);
        logger(`-------交易输入（input）-------`);
        inputArr.forEach((item, i) => {
            logger(`输入UTXO_${i + 1}:${item.txid} => ${item.value}`);
            RawTransaction.addInput(item.txid, item.vout);
        });
        logger(`-------交易输出（output）-------`);
        logger(`发送金额:${sendAmount}`);
        logger(`找零金额:${amount - sendAmount - fee}`);
        RawTransaction.addOutput(to, sendAmount);
        RawTransaction.addOutput(
            wallet.address,
            parseInt(amount - sendAmount - fee),
        );

        // 对交易签名
        if (wallet.type == 'P2PKH') {
            //p2pkp 普通地址 签名
            inputArr.forEach((item, index) => {
                RawTransaction.sign(index, keyPair);
            });
        } else if (wallet.type == 'P2WPKH') {
            let p2sh = bitcoin.payments.p2sh({
                redeem: bitcoin.payments.p2wpkh({
                    pubkey: keyPair.publicKey,
                    network,
                }),
                network,
            });
            inputArr.forEach((item, index) => {
                RawTransaction.sign(
                    index,
                    keyPair,
                    p2sh.redeem.output,
                    null,
                    parseInt(item.value),
                );
            });
        } else {
            throw new Error('not support');
        }

        const Transaction = RawTransaction.build().toHex();
        logger('交易签名:');
        logger(Transaction);

        return Transaction;
    } catch (err) {
        // show error
        console.error(err);
        return false;
    }
};

export {
    createLTCSeed,
    generateMnemonic,
    recoverAddressLitcoin,
    feeComputedLTC,
    signTransactionLTC,
};
