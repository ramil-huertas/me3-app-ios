import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    SectionList,
    RefreshControl,
    Platform,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import {
    calculateWidth,
    calculateHeight,
    colors,
    fonts,
    sizes,
} from '@constants/theme';
import { ADD, ADDRESS_SEARCH_CHAIN } from '@constants/ConstantStrings';
import EmptyAddress from './EmptyAddress';
import AddressList from './AddressList';
import { useDispatch, useSelector } from 'react-redux';
import DeleteAddress from './DeleteAddress';
import AddEditAddress from './AddEditAddress';
var _ = require('lodash');
import Progress from '@components/Progress';
import storageConst from '@constants/ConstStorage';
import { retrieveKeyValueData } from '@constants/Storage';
import { logger } from '@constants/Log';
import { insertAddressIntoBook, updateAddressInBook } from '@database/sql';
import { getAddressBook } from '@redux/Action/AddressBookAction';
import { showErrorToast } from '@redux/Action/ToastAlert';
import { getKeyboardType } from '@constants/commonFuncation';

const AddressBookComponent = ({ onPress }) => {
    const dispatch = useDispatch();
    const AddressBookReducer = useSelector(state => state.AddressBookReducer);
    const [searchAddress, setSearchAddress] = useState('');
    const [editAddress, setEditAddress] = useState(false);
    const [searchedArray, setSearchedArray] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [showAddAddressPopUp, setShowAddAddressPopUp] = useState(false);
    const [showDeleteAddressPopUp, setShowDeleteAddressPopUp] = useState(false);
    const [addressDeleted, setAddressDeleted] = useState(false);
    const [itemDetails, setItemDetails] = useState(false);
    useEffect(() => {
        refreshList();
    }, []);

    useEffect(() => {
        getArrayByNameOrChain()
            .then(() => {
                logger('array filtered by chain name or address name ');
            })
            .catch(error => {
                logger('error :: ', error);
            });
    }, [searchAddress.length, addressDeleted]);

    const getArrayByNameOrChain = async () => {
        const Data = await getAddressBook(dispatch);
        if (searchAddress.length != 0) {
            const temp = Data.filter(item => {
                return (
                    item.name
                        .toLowerCase()
                        .includes(searchAddress.toLowerCase()) ||
                    item.chain
                        .toLowerCase()
                        .includes(searchAddress.toLowerCase()) ||
                    item.wallet_address
                        .toLowerCase()
                        .includes(searchAddress.toLowerCase())
                );
            });
            const filteredData = _.chain(temp)
                .groupBy('chain')
                .map((value, key) => ({ title: key, data: value }))
                .value();
            setSearchedArray(filteredData);
        } else {
            const filteredData = _.chain(Data)
                .groupBy('chain')
                .map((value, key) => ({ title: key, data: value }))
                .value();
            setSearchedArray(filteredData);
        }
    };

    const onAddAddress = () => {
        setEditAddress(false);
        setShowAddAddressPopUp(true);
    };

    const onDeleteAddress = item => {
        setAddressDeleted(false);
        setItemDetails(item);
        setShowDeleteAddressPopUp(true);
    };

    const onSuccess = async object => {
        setRefresh(true);
        await retrieveKeyValueData(storageConst.USERID)
            .then(async userId => {
                object.uid = userId;
                if (editAddress) {
                    object.id = itemDetails.id;
                    await updateAddressInBook(object)
                        .then(() => {
                            refreshList();
                        })
                        .catch(error => {
                            logger('error when editing address :: ', error);
                        });
                    setRefresh(false);
                } else {
                    if (
                        AddressBookReducer &&
                        AddressBookReducer.list &&
                        AddressBookReducer.list.length >= 50
                    ) {
                        showErrorToast(
                            dispatch,
                            'Address adding limit reached',
                        );
                    } else {
                        await insertAddressIntoBook(object).then(() => {
                            refreshList();
                        });
                    }
                    setRefresh(false);
                }
            })
            .catch(error => {
                logger('add new address error :: ', error);
                setRefresh(false);
            });
    };

    const refreshList = async () => {
        const Data = await getAddressBook(dispatch);
        const filteredData = _.chain(Data)
            .groupBy('chain')
            .map((value, key) => ({ title: key, data: value }))
            .value();
        setSearchedArray(filteredData);
    };
    const EmptyComponent = () => {
        return <EmptyAddress />;
    };

    const editItem = item => {
        setItemDetails(item);
        setEditAddress(true);
        setTimeout(() => {
            setShowAddAddressPopUp(true);
        }, 500);
    };

    const renderItem = ({ item }) => {
        return (
            <AddressList
                item={item}
                editItem={editItem}
                onDeleteAddress={onDeleteAddress}
                onPress={onPress}
            />
        );
    };
    return (
        <View style={styles.container}>
            {showDeleteAddressPopUp && (
                <DeleteAddress
                    showDeleteAddressPopUp={showDeleteAddressPopUp}
                    setShowDeleteAddressPopUp={setShowDeleteAddressPopUp}
                    ItemDetails={itemDetails}
                    setAddressDeleted={setAddressDeleted}
                />
            )}
            {refresh ? (
                <Progress />
            ) : (
                <View style={styles.marginHorizontal20}>
                    {showAddAddressPopUp && (
                        <AddEditAddress
                            showPopupStatus={showAddAddressPopUp}
                            setShowPopupStatus={setShowAddAddressPopUp}
                            editAddress={editAddress}
                            addAddressWithDetails={false}
                            itemDetails={itemDetails}
                            onSuccess={onSuccess}
                            onCancel={() => {
                                setShowAddAddressPopUp(false);
                            }}
                        />
                    )}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchView}>
                            <Image
                                source={require('@assets/search.png')}
                                style={[
                                    styles.icon,
                                    { tintColor: colors.menuDotsTint },
                                ]}
                            />
                            <TextInput
                                value={searchAddress}
                                onChangeText={text => {
                                    setSearchAddress(text);
                                }}
                                style={styles.searchAddressTextInput}
                                placeholderTextColor={colors.gray1_textcolor}
                                placeholder={ADDRESS_SEARCH_CHAIN}
                                selectionColor={colors.gray1_textcolor}
                                keyboardType={getKeyboardType()}
                                autoCorrect={false}
                                spellCheck={false}
                                autoComplete={'off'}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.addAddress}
                            onPress={onAddAddress}>
                            <Image
                                source={require('@assets/Add.png')}
                                style={styles.addAddressIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.addAddressText}>{ADD}</Text>
                        </TouchableOpacity>
                    </View>

                    <SectionList
                        sections={searchedArray}
                        refreshControl={
                            <RefreshControl
                                refreshing={refresh}
                                onRefresh={refreshList}
                            />
                        }
                        stickySectionHeadersEnabled={false}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={EmptyComponent}
                        renderItem={renderItem}
                        renderSectionHeader={({ section }) => (
                            <Text
                                style={{
                                    marginTop: calculateHeight(12),
                                    marginBottom: calculateHeight(8),
                                    fontFamily: fonts.titillium_bold,
                                    fontSize: sizes.f12,
                                    color: colors.gray_textcolor,
                                }}>
                                {section.title}
                            </Text>
                        )}
                        keyExtractor={(item, index) => index}
                    />
                </View>
            )}
        </View>
    );
};

export default AddressBookComponent;
const styles = StyleSheet.create({
    addAddress: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        marginLeft: calculateWidth(8),
        paddingHorizontal: calculateWidth(16),
        paddingVertical: calculateHeight(8),
    },
    addAddressIcon: {
        height: calculateHeight(20),
        marginRight: 4,
        tintColor: colors.white,
        width: calculateHeight(20),
    },
    addAddressText: {
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
    },
    container: { flex: 1 },
    icon: {
        height: 24,
        width: 24,
    },
    marginHorizontal20: {
        flex: 1,
        marginBottom: calculateHeight(20),
        marginHorizontal: calculateWidth(20),
    },
    searchAddressTextInput: {
        color: colors.black,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        marginLeft: 8,
        paddingVertical: Platform.OS === 'ios' ? null : sizes.mvp4,
    },
    searchContainer: { alignItems: 'center', flexDirection: 'row' },
    searchView: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderColor: colors.gray_background_1,
        borderRadius: 120,
        borderWidth: 1,
        flex: 1,
        flexDirection: 'row',
        marginVertical: calculateHeight(20),
        paddingHorizontal: sizes.mhp12,
        paddingVertical: Platform.OS === 'ios' ? sizes.mvp8 - 2 : null,
    },
});
