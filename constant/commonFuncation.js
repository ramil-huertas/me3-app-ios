import { colors } from '@constants/theme';
import ConstantStrings from './ConstantStrings';
import moment from 'moment';
import { Platform } from 'react-native';
import {
    retrieveKeyValueData,
    clearStorage,
    saveKeyValueData,
} from '@constants/Storage';
import {
    clearDatabase,
    getFirstWalletfromTable,
    getFirstWalletFromMainnetChainsForSwap,
} from '@database/sql';
import ConstStorage from '@constants/ConstStorage';
import WalletConnect from '../src/walletconnect/ExportWalletNativeModule';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { showMessageToast } from '@redux/Action/ToastAlert';
import { logger } from '@constants/Log';

export function checkNullOrEmpty(object) {
    return object == null || object == '' || object == undefined;
}

export const getKeyboardType = () => {
    return Platform.OS === 'ios' ? 'default' : 'visible-password';
};
export function getCurrencyToPassInAPI(currency) {
    if (currency == '' || currency == undefined) return 'USD';
    return JSON.parse(currency) && JSON.parse(currency).fiat
        ? JSON.parse(currency).fiat
        : 'USD';
}
export function formatBalanceValue(n) {
    const parsedValue = parseFloat(n).toFixed(2);
    const amountToString = parsedValue?.toString();
    if (amountToString.includes('.')) {
        const ifnIncludesDecimalPoints = amountToString.split('.');
        const beforeDecimalPointValue = ifnIncludesDecimalPoints[0];
        const formatNumber = beforeDecimalPointValue.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            ',',
        );
        ifnIncludesDecimalPoints[0] = formatNumber;
        const joinedString = ifnIncludesDecimalPoints.join('.');
        return joinedString;
    } else {
        return parsedValue?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}

export function checkType(item, isFromDetail) {
    if (item.type == 1) {
        return {
            img: require('@assets/send.png'),
            description: ConstantStrings.TO + ' ' + item.address,
            title: isFromDetail ? 'Sent' : 'Send',
            tintColor: colors.purple_button_color1,
        };
    } else if (item.type == 2) {
        return {
            img: require('@assets/arrowBottom.png'),
            description: ConstantStrings.FROM + ' ' + item.address,
            title: isFromDetail ? 'Received' : 'Receive',
            tintColor: colors.purple_color80,
        };
    } else {
        return {
            img: require('@assets/SwapIcon.png'),
            description: ConstantStrings.TO + ' ' + item.address,
            title: isFromDetail ? 'Swaped' : 'Swap',
            tintColor: colors.purple_dark,
        };
    }
}
export const autoLogoutAfter1Week = async (navigation, dispatch) => {
    const timeOfLogin = await retrieveKeyValueData(ConstStorage.TIME_OF_LOGIN);
    if (checkNullOrEmpty(timeOfLogin)) {
        logger('no time is saved ...');
    } else {
        const currentTime = moment().toLocaleString();
        const appActivityTime = moment(timeOfLogin)
            .add(168, 'hours')
            .toLocaleString();
        logger('timeOfLogin :: ', timeOfLogin);
        logger('appActivityTime :: ', appActivityTime);
        logger('currentTime :: ', currentTime);
        logger(
            'currentTime > appActivityTime :: ',
            currentTime > appActivityTime,
        );
        const condition =
            moment(currentTime).format('x') >
            moment(appActivityTime).format('x');
        if (condition) {
            await WalletConnect.clearAllData();
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
            clearStorage();
            clearDatabase();
            saveKeyValueData(ConstStorage.WALLETBACKUPED, 'FALSE');
            saveKeyValueData(ConstStorage.TIME_OF_LOGIN, '');
            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'OnBoarding' }],
                });
                showMessageToast(dispatch, 'Session time out');
            }, 200);
        }
    }
};

// export const holdingListBackgroundColour = chain => {
//     const mainChainSymbol = chain.replaceAll(' ', '').toLowerCase();
//     switch (mainChainSymbol) {
//         case 'avalanche':
//             return colors.avax_gradient;
//         case 'bitcoin':
//             return colors.btc_gradient;
//         case 'bitcoincash':
//             return colors.btc_cash_gradient;
//         case 'bnbsmartchain':
//             return colors.bnb_gradient;
//         case 'ethereum':
//             return colors.eth_gradient;
//         case 'litecoin':
//             return colors.ltc_gradient;
//         case 'polygon':
//             return colors.matic_gradient;
//         default:
//             return colors.whiteGradient;
//     }
// };

export const holdingListBackgroundColour = chain => {
    const mainChainSymbol = chain.replaceAll(' ', '').toLowerCase();
    switch (mainChainSymbol) {
        case 'avax':
            return colors.avax_gradient;
        case 'btc':
            return colors.btc_gradient;
        case 'bch':
            return colors.btc_cash_gradient;
        case 'bsc':
            return colors.bnb_gradient;
        case 'eth':
            return colors.eth_gradient;
        case 'ltc':
            return colors.ltc_gradient;
        case 'polygon':
            return colors.matic_gradient;
        default:
            return colors.whiteGradient;
    }
};

export const getFlex = () => {
    return 0.98;
};

export async function getWalletsBasedOnSetting(walletList) {
    let isShowTestnet = await retrieveKeyValueData(
        ConstStorage.SHOW_HIDE_TESTNET,
    );
    if (isShowTestnet == 'false') {
        // let chain_ids = [1, 137, 43114, 56];
        let chainNames = ['AVAX', 'BCH', 'BSC', 'BTC', 'ETH', 'LTC', 'POLYGON'];
        let chains = chainNames
            .map(item => {
                let chain_detail = walletList.find(chain_item => {
                    return (
                        chain_item.chain.toLowerCase() ==
                        item.toLocaleLowerCase()
                    );
                });
                return chain_detail ? chain_detail : false;
            })
            .filter(item => {
                return item ? true : false;
            });
        return chains;
    } else {
        return walletList;
    }
}

export async function getDefaultWalletChainNameForSelection() {
    let isShowTestnet = await retrieveKeyValueData(
        ConstStorage.SHOW_HIDE_TESTNET,
    );
    if (isShowTestnet == 'true') {
        return new Promise(function (resolve, reject) {
            getFirstWalletfromTable()
                .then(firstWallet => {
                    resolve(firstWallet.rows.item(0).chain);
                })
                .catch(error => {
                    logger('Error getting first wallet :: ', error);
                    reject(error);
                });
        });
    } else {
        return new Promise(function (resolve, reject) {
            // let chain_ids = [1, 137, 43114, 56];
            getFirstWalletFromMainnetChain()
                .then(defaultWallet => {
                    resolve(defaultWallet.chain);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}

export async function getMainnetChainsOnly() {
    let chainlist = JSON.parse(await retrieveKeyValueData('allChains'));
    // let chain_ids = [1, 137, 43114, 56];
    let chainNames = ['AVAX', 'BCH', 'BSC', 'BTC', 'ETH', 'LTC', 'POLYGON'];
    return chainNames
        .map(item => {
            let chain_detail = chainlist.find(chain_item => {
                return chain_item.chain.toLowerCase() == item.toLowerCase();
            });
            return chain_detail ? chain_detail.chain : false;
        })
        .filter(item => {
            return item ? true : false;
        });
}
export async function getMainnetChainsOnlyForSwap() {
    let chainlist = JSON.parse(await retrieveKeyValueData('allChains'));
    // let chain_ids = [1, 137, 43114, 56];
    let chainNames = ['AVAX', 'BSC', 'ETH', 'POLYGON'];
    return chainNames
        .map(item => {
            let chain_detail = chainlist.find(chain_item => {
                return chain_item.chain.toLowerCase() == item.toLowerCase();
            });
            return chain_detail ? chain_detail.chain : false;
        })
        .filter(item => {
            return item ? true : false;
        });
}

export async function getFirstWalletFromMainnetChain() {
    // let chain_ids = [1, 137, 43114, 56];
    let chainNames = "'AVAX', 'BCH', 'BSC', 'BTC', 'ETH', 'LTC', 'POLYGON'";
    return new Promise(function (resolve, reject) {
        getFirstWalletFromMainnetChainsForSwap(chainNames)
            .then(data => {
                let walletdata = data.rows.item(0);
                resolve(walletdata);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export async function getFirstWalletFromMainnetChainForSwap() {
    // let chain_ids = [1, 137, 43114, 56];
    let chainNames = "'AVAX', 'BSC', 'ETH', 'POLYGON'";
    return new Promise(function (resolve, reject) {
        getFirstWalletFromMainnetChainsForSwap(chainNames)
            .then(data => {
                let walletdata = data.rows.item(0);
                resolve(walletdata);
            })
            .catch(error => {
                reject(error);
            });
    });
}

export async function filterChains(chainList) {
    let isShowTestnet = await retrieveKeyValueData(
        ConstStorage.SHOW_HIDE_TESTNET,
    );
    if (isShowTestnet == 'true') return chainList;
    else {
        // let chain_ids = [1, 137, 43114, 56];
        let chainNames = ['AVAX', 'BCH', 'BSC', 'BTC', 'ETH', 'LTC', 'POLYGON'];
        let chains = chainNames
            .map(item => {
                let chain_detail = chainList.find(chain_item => {
                    return (
                        chain_item.chainName.toLowerCase() == item.toLowerCase()
                    );
                });
                return chain_detail ? chain_detail : false;
            })
            .filter(item => {
                return item ? true : false;
            });
        return chains;
    }
}

export function toFixed(num, fixed) {
    if (checkNullOrEmpty(num)) {
        return 0;
    }
    const re = new RegExp('^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}
