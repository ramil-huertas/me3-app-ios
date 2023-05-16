let ethers = require('ethers');
import { hdkey } from 'ethereumjs-wallet';
import { toChecksumAddress } from 'ethereumjs-util';
const DEFAULT_HD_PATH = `m/44'/60'/0'`;
import { Encrypt } from '@constants/EncryptDecrypt';
import { generateMnemonic, getSeedFromMnemonic } from '../WalletUtils';
import { logger } from '@constants/Log';

async function createSeed(count, index, mnemonic, seed) {
    try {
        let wallets = [];
        let currentSeed;
        if (mnemonic) {
            currentSeed = seed;
        } else {
            mnemonic = generateMnemonic();
            currentSeed = await getSeedFromMnemonic(mnemonic);
        }

        const hdNode = hdkey.fromMasterSeed(currentSeed);
        const node = hdNode.derivePath(DEFAULT_HD_PATH);
        const change = node.deriveChild(0);
        const childNode = change.deriveChild(index);
        const childWallet = childNode.getWallet();

        wallets.push({
            address: toChecksumAddress(
                `0x${childWallet.getAddress().toString('hex')}`,
            ),
            privateKey: childWallet.getPrivateKey().toString('hex'),
        });
        return {
            seed: mnemonic,
            list: wallets,
        };

        //this below code is taking too much time to create wallet..
        // const path = chooseBipSeed('60', index)
        // let walletObj = ethers.Wallet.fromMnemonic(mnemo, path)
        // wallets.push({
        //     "address": walletObj.address,
        //     "privateKey": walletObj.privateKey
        // });
        // let wallet = {
        //     "seed": walletObj.mnemonic.phrase,
        //     "list": wallets
        // };
        // return wallet
    } catch (error) {
        logger('Error', error);
    }
}

async function recoverAddressETH(privateKey) {
    let walletObj = new ethers.Wallet(privateKey);
    return {
        address: walletObj.address,
        privateKey: await Encrypt(walletObj.privateKey),
    };
}

export { createSeed, recoverAddressETH };
