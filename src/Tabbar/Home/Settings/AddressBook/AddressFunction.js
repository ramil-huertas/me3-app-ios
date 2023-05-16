import {
    validateBitcoin,
    validateETHAddress,
    validateLitecoin,
} from '@constants/AddressValidator';

export const validateAddress = url => {
    if (url.startsWith('ethereum:')) {
        return true;
    } else if (validateETHAddress(url)) {
        return true;
    } else if (validateBitcoin(url)) {
        return true;
    } else if (url.startsWith('bitcoincash:')) {
        return true;
    } else if (url.startsWith('bitcoin')) {
        return true;
    } else if (
        url.toLowerCase().startsWith('litecoin:ltc1') ||
        url.toLowerCase().startsWith('litecoin:') ||
        url.toLowerCase().startsWith('ltc1')
    ) {
        // this is litecoin segwit address
        return true;
    } else if (validateLitecoin(url)) {
        return true;
    } else {
        return false;
    }
};

export const validateAddressWithChain = (url, series) => {
    let status = false;
    switch (series) {
        case 'btc':
            if (validateBitcoin(url)) {
                status = true;
            } else if (url.startsWith('bitcoincash:')) {
                status = true;
            } else if (url.startsWith('bitcoin')) {
                status = true;
            } else status = false;
            break;
        case 'eth':
            if (url.startsWith('ethereum:')) {
                status = true;
            } else if (validateETHAddress(url)) {
                status = true;
            } else status = false;
            break;
        case 'ltc':
            if (
                url.toLowerCase().startsWith('litecoin:ltc1') ||
                url.toLowerCase().startsWith('litecoin:') ||
                url.toLowerCase().startsWith('ltc1')
            ) {
                // this is litecoin segwit address
                status = true;
            } else if (validateLitecoin(url)) {
                status = true;
            }
            break;
        case 'dot':
            break;
        case 'fil':
            break;
        case 'bch':
            if (url.startsWith('bitcoincash:')) {
                status = true;
            } else status = false;
            break;
    }
    return status;

    // if (url.startsWith('ethereum:')) {
    //   return true;
    // } else if (validateETHAddress(url)) {
    //   return true;
    // } else if (validateBitcoin(url)) {
    //   return true;
    // } else if (url.startsWith('bitcoincash:')) {
    //   return true;
    // } else if (url.startsWith('bitcoin')) {
    //   return true;
    // } else if (
    //   url.toLowerCase().startsWith('litecoin:ltc1') ||
    //   url.toLowerCase().startsWith('litecoin:') ||
    //   url.toLowerCase().startsWith('ltc1')
    // ) {
    //   // this is litecoin segwit address
    //   return true;
    // } else if (validateLitecoin(url)) {
    //   return true;
    // } else {
    //   return false;
    // }
};
