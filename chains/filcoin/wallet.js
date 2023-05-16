import { keyPairFromPrivateKey } from '@nodefactory/filecoin-address';
let { fromSeed } = require('bip32');
import { Encrypt } from '@constants/EncryptDecrypt';
import { generateMnemonic, getSeedFromMnemonic } from '../WalletUtils';
import { logger } from '@constants/Log';

async function keyDeriveFromSeed(seed, path, mnemonic, network = 'mainnet') {
    try {
        const masterKey = fromSeed(seed);
        const childKey = masterKey.derivePath(path);
        let result = await keyRecover(
            Buffer.from(childKey.privateKey).toString('hex'),
            network,
        );
        result.mnemonic = mnemonic;
        return result;
    } catch (err) {
        logger(err);
        return false;
    }
}
async function keyRecover(privateKey, network = 'mainnet') {
    try {
        return keyPairFromPrivateKey(
            privateKey,
            network === 'mainnet' ? 'f' : 't',
        );
    } catch (err) {
        logger(err);
    }
}
async function createFILSeed(count, index, mnemonic, network = 'mainnet') {
    try {
        let wallets = [];
        let seed;

        let currentSeed;
        if (mnemonic) {
            currentSeed = seed;
        } else {
            mnemonic = generateMnemonic();
            currentSeed = await getSeedFromMnemonic(mnemonic);
        }

        let result = await keyDeriveFromSeed(
            currentSeed,
            `m/44'/461'/0'/0/${index}`,
            mnemonic,
            network,
        );
        wallets.push({
            address: result.address,
            privateKey: result.privateKey,
        });

        return {
            seed: mnemonic,
            list: wallets,
        };
    } catch (error) {
        logger('Error', error);
    }
}

async function recoverAddressFilcoin(privateKey, network = 'mainnet') {
    let result = await keyRecover(privateKey, network);
    return {
        address: result._address,
        privateKey: await Encrypt(result._privateKey),
    };
}

export { createFILSeed, recoverAddressFilcoin };
