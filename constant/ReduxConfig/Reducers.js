import { combineReducers } from 'redux';

import ConfigReducer from '@redux/Reducer/ConfigReducer';
import WalletStatusReducers from '@redux/Reducer/WalletStatusReducers';
import SwapReducer from '@redux/Reducer/SwapReducer';
import QRScanReducer from '@redux/Reducer/QRScanReducer';
import CurrencyReducer from '@redux/Reducer/CurrencyReducer';
import AddressBookReducer from '@redux/Reducer/AddressBookReducer';
import ToastAlert from '@redux/Reducer/ToastAlert';
import BackUpReducer from '@redux/Reducer/BackUpReducer';
import HomeReducer from '@redux/Reducer/HomeReducer';
import DepositQRReducer from '@redux/Reducer/DepositQRReducer';
import WalletWithChainsReducer from '@redux/Reducer/WalletWithChainsReducer';
import TokenReducer from '@redux/Reducer/TokenReducer';
import FaqReducer from '@redux/Reducer/FaqReducer';
import NFTReducer from '@redux/Reducer/NFTReducer';
export default combineReducers({
    ConfigReducer,
    WalletStatusReducers,
    SwapReducer,
    QRScanReducer,
    CurrencyReducer,
    AddressBookReducer,
    ToastAlert,
    BackUpReducer,
    HomeReducer,
    DepositQRReducer,
    WalletWithChainsReducer,
    TokenReducer,
    FaqReducer,
    NFTReducer,
});
