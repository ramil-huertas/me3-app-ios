let aesjs = require('aes-js');
let pbkdf2 = require('pbkdf2');
let base64 = require('base-64');
let utf8 = require('utf8');
const CryptoJS = require('./crypto-js.min.js');

import { retrieveKeyValueData } from '@constants/Storage';
import storageConst from '@constants/ConstStorage';
import { logger } from '@constants/Log';

function spaceSupply(text) {
    let len = text.length;
    let supply = 16 - (len % 16);
    let supplyStr = new Array(supply).fill(' ').join('');
    return text + supplyStr;
}

async function Encrypt(text, pwd = '') {
    let salt = await retrieveKeyValueData(storageConst.CLIENT_SALT);
    let password = await retrieveKeyValueData(storageConst.EXTERNAL_DB_REF_ID);
    let faceId = pwd ? pwd : password;
    if (salt == null) {
        throw new Error('salt not null');
    }

    let key_256 = pbkdf2.pbkdf2Sync(faceId, salt, 1, 256 / 8, 'sha512');
    let key_128 = pbkdf2.pbkdf2Sync(faceId, salt, 1, 128 / 8, 'sha512');
    text = spaceSupply(text);
    let textBytes = aesjs.utils.utf8.toBytes(text);
    let aesCbc = new aesjs.ModeOfOperation.cbc(key_256, key_128);
    let encryptedBytes = aesCbc.encrypt(textBytes);
    let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    let bytes = utf8.encode(encryptedHex);
    return base64.encode(bytes);
}

async function Decrypt(encoded, pwd = '') {
    try {
        let salt = await retrieveKeyValueData(storageConst.CLIENT_SALT);
        let password = await retrieveKeyValueData(
            storageConst.EXTERNAL_DB_REF_ID,
        );
        let faceId = pwd ? pwd : password;
        if (salt == null) {
            throw new Error('salt not null');
        }

        let key_256 = pbkdf2.pbkdf2Sync(faceId, salt, 1, 256 / 8, 'sha512');
        let key_128 = pbkdf2.pbkdf2Sync(faceId, salt, 1, 128 / 8, 'sha512');

        let bytes = base64.decode(encoded);
        let text = utf8.decode(bytes);

        let encryptedBytes = aesjs.utils.hex.toBytes(text);
        let aesCbc = new aesjs.ModeOfOperation.cbc(key_256, key_128);
        let decryptedBytes = aesCbc.decrypt(encryptedBytes);

        let decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
        return decryptedText.trim();
    } catch (err) {
        logger(err);
        throw new Error('解密失败');
    }
}

const DecryptEcb = (decryptString, key1) => {
    try {
        let key = CryptoJS.enc.Utf8.parse(key1);
        let decrypt = CryptoJS.AES.decrypt(decryptString, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });
        return CryptoJS.enc.Utf8.stringify(decrypt).toString();
    } catch (error) {
        logger(error);
        return '';
    }
};

function RandomIndex(min, max, i) {
    const _charStr =
        'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789';
    let index = Math.floor(Math.random() * (max - min + 1) + min),
        numStart = _charStr.length - 10;
    if (i == 0 && index >= numStart) {
        index = this.RandomIndex(min, max, i);
    }
    return index;
}

function getRandomString(len) {
    const _charStr =
        'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789';
    let min = 0,
        max = _charStr.length - 1,
        _str = '';
    len = len || 15;
    for (let i = 0, index; i < len; i++) {
        index = RandomIndex(min, max, i);
        _str += _charStr[index];
    }
    return _str;
}

export { Encrypt, Decrypt, getRandomString, DecryptEcb };
