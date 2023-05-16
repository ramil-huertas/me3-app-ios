let WAValidator = require('wallet-address-validator');
import { validate } from 'bitcoin-address-validation';

export function validateBitcoin(address) {
    return validate(address);
}

export function validateETHAddress(address) {
    return WAValidator.validate(address, 'ETH');
}
export function validateaddresss(address) {
    return WAValidator.validate(address, 'BTC');
}
export function validateLitecoin(address) {
    return WAValidator.validate(address, 'litecoin');
}
export function validateBitcoinCash(address) {
    return WAValidator.validate(address, 'bitcoin');
}

export function getAddressStatus(url) {
    let isValidAddress;
    let chainName;
    if (url.startsWith('ethereum:') || validateETHAddress(url)) {
        isValidAddress = true;
        chainName = 'ethereum';
    } else if (validateBitcoin(url)) {
        isValidAddress = true;
        chainName = 'btc';
    } else if (url.startsWith('bitcoincash:')) {
        isValidAddress = true;
        chainName = 'bch';
    } else if (url.startsWith('bitcoin')) {
        let replaced = url.replace('bitcoin:', '');
        isValidAddress = validateBitcoin(replaced);
        chainName = 'btc';
    } else if (
       ( url.toLowerCase().startsWith('litecoin:ltc1') ||
        url.toLowerCase().startsWith('litecoin:') ||
        url.toLowerCase().startsWith('ltc1')) || validateLitecoin(url)
    ) {
        // this is litecoin segwit address
        isValidAddress = true;
        chainName = 'ltc';
    } else {
        isValidAddress = validateaddresss(url);
        chainName = '';
    }
    return {
        isValidAddress,
        chainName,
    };
}

// Old Validator
// if (url.startsWith('0x')) {
//   isValidAddress = validateETHAddress(url);
// } else if (url.startsWith('1') || url.startsWith('2')) {
//   isValidAddress = validateBitcoin(url);
// } else if (url.startsWith('bitcoin')) {
//   let replaced = url.replace('bitcoin:', '').replace('bitcoincash:', '');
//   isValidAddress = validateBitcoin(replaced);
// } else {
//   isValidAddress = validateaddresss(url);
// }
