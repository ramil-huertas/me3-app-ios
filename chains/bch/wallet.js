const bitcoin = require('bitcoinjs-lib');
let bitcoincash = require('@pefish/bch-bitcoinjs-lib');

const BCHJS = require('@psf/bch-js');
const bchjs = new BCHJS();

import { Encrypt, Decrypt } from '@constants/EncryptDecrypt';
import { generateMnemonic, getSeedFromMnemonic } from '../WalletUtils';
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
async function createBCHSeed(count, index, mnemonic, seed, testnet = true) {
    try {
        let network;
        if (testnet) {
            network = bitcoincash.networks.testnet;
        } else {
            network = bitcoincash.networks.bitcoincash;
        }

        let wallets = [];

        let currentSeed;
        if (mnemonic) {
            currentSeed = seed;
        } else {
            mnemonic = generateMnemonic();
            currentSeed = await getSeedFromMnemonic(mnemonic);
        }

        const root = bitcoincash.bip32.fromSeed(currentSeed, network);
        let path = chooseBipSeed('44', index, testnet);
        let wif = root.derivePath(path).toWIF();
        const keyPair = bitcoin.ECPair.fromWIF(wif, network);
        // 普通地址
        let address_P2PKH = generateAddress('P2PKH', keyPair, network);
        // 隔离见证地址
        let witness_P2WPKH = generateAddress('P2WPKH', keyPair, network);
        wallets.push({
            address: bchjs.Address.toCashAddress(address_P2PKH),
            type: 'P2PKH',
            address_P2PKH: bchjs.Address.toCashAddress(address_P2PKH),
            address_P2WPKH: bchjs.Address.toCashAddress(witness_P2WPKH),
            privateKey: wif,
        });

        return {
            seed: mnemonic,
            list: wallets,
        };
    } catch (error) {
        logger('Error', error);
    }
}

async function recoverAddressBCH(privateKey, testnet = true) {
    try {
        let network;
        if (testnet) {
            network = bitcoincash.networks.testnet;
        } else {
            network = bitcoincash.networks.bitcoincash;
        }
        const keyPair = bitcoin.ECPair.fromWIF(privateKey, network);
        let address_P2PKH = generateAddress('P2PKH', keyPair, network);
        let witness_P2WPKH = generateAddress('P2WPKH', keyPair, network);
        return {
            address: bchjs.Address.toCashAddress(address_P2PKH),
            type: 'P2PKH',
            address_P2PKH: bchjs.Address.toCashAddress(address_P2PKH),
            address_P2WPKH: bchjs.Address.toCashAddress(witness_P2WPKH),
            privateKey: await Encrypt(privateKey),
        };
    } catch (error) {
        logger('Error', error);
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
let feeComputedBCH = async (
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

let signTransactionBCH = async (
    wallet,
    txs,
    to,
    sendAmount,
    testnet = true,
    sat = 1,
) => {
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
        if (testnet) {
            network = bitcoincash.networks.testnet;
        } else {
            network = bitcoincash.networks.bitcoincash;
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
        logger(`输入总金额:${amount}`);
        logger(`手续费:${fee}`);
        const pKey = await Decrypt(wallet.privateKey);
        const keyPair = bitcoin.ECPair.fromWIF(pKey, network);

        // 构建交易对象
        const RawTransaction = new bitcoin.TransactionBuilder(network);
        logger(`-------交易输入（input）-------`);
        inputArr.forEach((item, i) => {
            logger(`输入UTXO_${i + 1}:${item.txid} => ${item.value}`);
            RawTransaction.addInput(
                item.txid,
                item.vout,
                bitcoin.Transaction.DEFAULT_SEQUENCE,
            );
        });
        logger(`-------交易输出（output）-------`);
        logger(`发送金额:${sendAmount}`);
        logger(`找零金额:${amount - sendAmount - fee}`);
        RawTransaction.addOutput(bchjs.Address.toLegacyAddress(to), sendAmount);
        RawTransaction.addOutput(
            bchjs.Address.toLegacyAddress(wallet.address),
            parseInt(amount - sendAmount - fee),
        );

        RawTransaction.enableBitcoinCash(true);
        RawTransaction.setVersion(2);

        const hashType =
            bitcoin.Transaction.SIGHASH_ALL |
            bitcoin.Transaction.SIGHASH_BITCOINCASHBIP143;
        inputArr.forEach((item, index) => {
            RawTransaction.sign(
                index,
                keyPair,
                null,
                hashType,
                parseInt(item.value),
            );
        });
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
export { createBCHSeed, recoverAddressBCH, feeComputedBCH, signTransactionBCH };
