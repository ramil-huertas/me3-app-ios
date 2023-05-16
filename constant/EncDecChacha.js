import { asn1, pki, random, util } from 'node-forge';
import * as stableHex from '@stablelib/hex';

export const forge2Node = forgeBytesStr => {
    const hexStr = util.bytesToHex(forgeBytesStr);
    return stableHex.decode(hexStr);
};

export const b64Str2Key = (b64Str, isPriKey = true) => {
    const asn1Obj = asn1.fromDer(util.decode64(b64Str));
    return isPriKey === true
        ? pki.privateKeyFromAsn1(asn1Obj)
        : pki.publicKeyFromAsn1(asn1Obj);
};

export const key2B64Str = (key, isPriKey = true) => {
    const asn1Obj =
        isPriKey === true
            ? pki.privateKeyToAsn1(key)
            : pki.publicKeyToAsn1(key);
    const derFmt = asn1.toDer(asn1Obj).getBytes();
    return util.encode64(derFmt);
};

export const getRandomBytes = length => {
    return random.getBytesSync(length);
};

export const generateKeyPairs = () => {
    return pki.rsa.generateKeyPair({
        bits: 1024,
        e: 0x10001,
    });
};
