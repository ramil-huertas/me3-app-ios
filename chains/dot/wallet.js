import {
    cryptoIsReady,
    cryptoWaitReady,
    encodeAddress,
    mnemonicToMiniSecret,
    sr25519PairFromSeed,
} from '@polkadot/util-crypto';
import { u8aToHex, hexToU8a } from '@polkadot/util';
import { Encrypt } from '@constants/EncryptDecrypt';
import { generateMnemonic } from '../WalletUtils';
import { logger } from '@constants/Log';

async function createDOTSeed(mnemonic) {
    try {
        let wallets = [];
        mnemonic = mnemonic ? mnemonic : generateMnemonic();

        const mini = await mnemonicToMiniSecret(mnemonic);
        const { publicKey, secretKey } = sr25519PairFromSeed(mini);
        wallets.push({
            address: encodeAddress(publicKey),
            privateKey: u8aToHex(secretKey),
        });

        return {
            seed: mnemonic,
            list: wallets,
        };
    } catch (error) {
        logger('Error', error);
    }
}
async function recoverAddressDOT(privatekey) {
    if (!cryptoIsReady()) {
        await cryptoWaitReady();
    }
    const { publicKey } = await sr25519PairFromSeed(hexToU8a(privatekey));
    return {
        address: encodeAddress(publicKey),
        privateKey: await Encrypt(privatekey),
    };
}

export { createDOTSeed, recoverAddressDOT };
