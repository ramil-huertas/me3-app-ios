import { getAllAddressBooks, getChainDetail } from '@database/sql';
import types from './types';
let _ = require('lodash');

const getAddressList = list => ({
    type: types.GET_ADDRESS_BOOK_LIST,
    addressList: list,
});

export const getAddressBook = async dispatch => {
    const AddressBookList = await getAddressFromDatabase();
    dispatch(getAddressList(AddressBookList));
    return AddressBookList;
};

export const getAddressFromDatabase = async () => {
    const addressBook = await getAllAddressBooks();
    const addressList = [];
    if (addressBook.rows.length == 0) {
        return;
    } else {
        for (let i = 0; i < addressBook.rows.length; i++) {
            const item = addressBook.rows.item(i);
            const chain_icon = await getChainDetail(item.chain);
            if (chain_icon.rows.length == 0) {
                item.chain_icon = '';
            } else {
                item.chain_icon = chain_icon.rows.item(0).chain_icon;
            }
            addressList.push(item);
        }
    }
    if (addressList.length == 1) {
        return addressList;
    } else {
        const sortedArray = addressList.sort((a, b) => {
            const chainA = a.chain;
            const chainB = b.chain;
            const chainAName = a.name;
            const chainBName = b.name;
            if (chainA == chainB) {
                if (chainAName > chainBName) {
                    return 1; // return -1 here for non alphabetical order
                } else {
                    return -1;
                }
            } else {
                if (chainA > chainB) {
                    return 1; // return -1 here for non alphabetical order
                }
                return -1;
            }
        });
        return sortedArray;
    }
};

const resetStateAction = () => ({
    type: types.RESET_ADDRESSBOOK,
});
export const resetStateAddressbook = dispatch => {
    dispatch(resetStateAction());
};