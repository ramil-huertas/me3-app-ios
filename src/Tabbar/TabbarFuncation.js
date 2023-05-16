import ConstStorage from '@constants/ConstStorage';
import { retrieveKeyValueData } from '@constants/Storage';
import {
    validateBitcoin,
    validateETHAddress,
    validateLitecoin,
} from '@constants/AddressValidator';
import ConstantStrings from '@constants/ConstantStrings';

export async function checkBalanceIsHidden() {
    let hideBalance = await retrieveKeyValueData(
        ConstStorage.EYE_ON_OFF_STATUS,
    );
    if (hideBalance != null && hideBalance == '1') {
        return false;
    } else {
        return true;
    }
}

export const countDecimalPoint = text => {
    return (text.match(/\./g) || []).length;
};

export function getPrecision(data) {
    let precision;
    if (data?.symbol?.toLowerCase() == 'avax') {
        precision = 18;
    } else {
        precision = data.precision;
    }
    return precision;
}

export const getChainForWallet = url => {
    let message;
    if (url.startsWith('ethereum:')) {
        message = 'ETH';
    } else if (validateETHAddress(url)) {
        message = 'ETH';
    } else if (validateBitcoin(url)) {
        message = 'BTCTest';
    } else if (url.startsWith('bitcoincash:')) {
        message = 'BCH';
    } else if (url.startsWith('bitcoin')) {
        message = 'BTCTest';
    } else if (
        url.toLowerCase().startsWith('litecoin:ltc1') ||
        url.toLowerCase().startsWith('litecoin:') ||
        url.toLowerCase().startsWith('ltc1')
    ) {
        // this is litecoin segwit address
        message = 'LTC';
    } else if (validateLitecoin(url)) {
        message = 'LTC';
    } else {
        message = '';
    }
    return message;
};

export const getSeriesForWallet = url => {
    let message;
    if (url.startsWith('ethereum:')) {
        message = 'eth';
    } else if (validateETHAddress(url)) {
        message = 'eth';
    } else if (validateBitcoin(url)) {
        message = 'btc';
    } else if (url.startsWith('bitcoincash:')) {
        message = 'bch';
    } else if (url.startsWith('bitcoin')) {
        message = 'btc';
    } else if (
        url.toLowerCase().startsWith('litecoin:ltc1') ||
        url.toLowerCase().startsWith('litecoin:') ||
        url.toLowerCase().startsWith('ltc1')
    ) {
        // this is litecoin segwit address
        message = 'ltc';
    } else if (validateLitecoin(url)) {
        message = 'ltc';
    } else {
        message = '';
    }
    return message;
};

export const getWalletName = url => {
    let message;
    if (url.startsWith('ethereum:')) {
        message = 'EVM ' + ConstantStrings.ADDRESS_DETECTED;
    } else if (validateETHAddress(url)) {
        message = 'EVM ' + ConstantStrings.ADDRESS_DETECTED;
    } else if (validateBitcoin(url)) {
        message = 'BTC ' + ConstantStrings.ADDRESS_DETECTED;
    } else if (url.startsWith('bitcoincash:')) {
        message = 'BCH ' + ConstantStrings.ADDRESS_DETECTED;
    } else if (url.startsWith('bitcoin')) {
        message = 'BTC ' + ConstantStrings.ADDRESS_DETECTED;
    } else if (
        url.toLowerCase().startsWith('litecoin:ltc1') ||
        url.toLowerCase().startsWith('litecoin:') ||
        url.toLowerCase().startsWith('ltc1')
    ) {
        // this is litecoin segwit address
        message = 'LTC ' + ConstantStrings.ADDRESS_DETECTED;
    } else if (validateLitecoin(url)) {
        message = 'LTC ' + ConstantStrings.ADDRESS_DETECTED;
    } else {
        message = '';
    }
    return message;
};

export const getAddressWarning = url => {
    let message = {
        main: '',
        sub: '',
    };

    if (validateETHAddress(url)) {
        message = {
            main: 'This is an EVM address. ',
            sub: 'Only transfer funds on Ethereum, Polygon, Avalanche C-Chain and other EVM-compatible networks to this address.',
        };
    } else if (validateBitcoin(url)) {
        message = {
            main: 'This is a Bitcoin Cash address.',
            sub: 'Only transfer BCH on the Bitcoin Cash network to this address.',
        };
    } else if (url.startsWith('bitcoincash:')) {
        message = {
            main: 'This is a Bitcoin Cash address.',
            sub: 'Only transfer BCH on the Bitcoin Cash network to this address.',
        };
    } else if (url.startsWith('bitcoin')) {
        message = {
            main: 'This is a Bitcoin Cash address.',
            sub: 'Only transfer BCH on the Bitcoin Cash network to this address.',
        };
    } else if (
        url.toLowerCase().startsWith('litecoin:ltc1') ||
        url.toLowerCase().startsWith('litecoin:') ||
        url.toLowerCase().startsWith('ltc1')
    ) {
        // this is litecoin segwit address
        message = {
            main: 'This is a Litecoin address. ',
            sub: 'Only transfer LTC on the Litecoin network to this address.',
        };
    } else if (validateLitecoin(url)) {
        message = {
            main: 'This is a Litecoin address. ',
            sub: 'Only transfer LTC on the Litecoin network to this address.',
        };
    } else {
        message = {
            main: '',
            sub: '',
        };
    }
    return message;
};

export const getFormattedURL = url => {
    if (url != null && url.length > 0) {
        return url
            .replace('bitcoin:', '')
            .replace('bitcoincash:', '')
            .replace('ethereum:', '')
            .replace('litecoin:', '')
            .split('?')[0];
    } else return '';
};
