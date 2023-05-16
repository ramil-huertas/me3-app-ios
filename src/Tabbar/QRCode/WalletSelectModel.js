import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    Image,
    TextInput,
    SafeAreaView,
    Platform,
    FlatList,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { theme } from '@constants';
import ConstantStrings from '@constants/ConstantStrings';
import CustomImage from '@components/CustomImage';
import SwitchNetworkConfirmationPopup from '../../walletconnect/SwitchNetworkConfirmationPopup';
import { fonts } from '@constants/theme';
import ScreenTopHeader from '@components/ScreenTopHeader';
import { getKeyboardType } from '@constants/commonFuncation';
export default function WalletSelectModel({
    setSelectedWalletToDeposite,
    setShowWalletList,
    WalletList,
    isFromDapp,
    isFromSwitchNetwork,
}) {
    const [searchedArray, setSearchedArray] = useState(WalletList);
    const [searchText, setSearchText] = useState('');
    const [showSwitchChainConfirmation, setShowSwitchChainConfirmation] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        if (searchText.length != 0) {
            const temp = WalletList.filter(item => {
                return item.chain
                    .toLowerCase()
                    .includes(searchText.toLowerCase());
            });
            temp.sort((a, b) => {
                return (a.symbol > b.symbol) ? 1 : -1
            });
            setSearchedArray(temp);
        } else {
            WalletList.sort((a, b) => {
                return (a.chainDetail?.symbol > b.chainDetail?.symbol) ? 1 : -1

            });

            setSearchedArray(WalletList);
        }
    }, [searchText.length]);

    function switchChain() {
        setSelectedWalletToDeposite(selectedItem);
        setShowWalletList(false);
    }

    const renderItem = item => {
        return (
            <>
                <TouchableOpacity
                    onPress={() => {
                        if (isFromSwitchNetwork) {
                            setSelectedItem(item.item);
                            setShowSwitchChainConfirmation(true);
                            setShowWalletList(true);
                        } else {
                            setSelectedWalletToDeposite(item.item);
                            setShowWalletList(false);
                        }
                    }}
                    style={styles.contain}>
                    <View
                        style={styles.imageContainerStyle
                        }>
                        <View style={styles.iconView}>
                            <CustomImage
                                imageUrl={item.item.chainDetail?.chain_icon}
                            />
                        </View>
                        <View style={styles.nameAddressContainerStyle}>
                            <Text style={styles.mainText}>
                                {item.item.chainDetail &&
                                    item.item.chainDetail.name}
                            </Text>
                            <Text style={styles.subText}>
                                {item.item.address}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={styles.border} />
            </>
        );
    };

    const topBackClick = () => {
        setShowWalletList(false);
    };
    return (
        <Modal
            onRequestClose={() => {
                setShowWalletList(false);
            }}
            transparent={true}>
            {showSwitchChainConfirmation && selectedItem && (
                <SwitchNetworkConfirmationPopup
                    setShowSwitchChainConfirmation={
                        setShowSwitchChainConfirmation
                    }
                    selectedItem={selectedItem}
                    switchChain={switchChain}
                />
            )}
            <SafeAreaView
                style={styles.safeareaContainerStyle}>
                <StatusBar
                    animated={true}
                    backgroundColor={theme.colors.white}
                    barStyle={'dark-content'}
                />
                <View style={styles.parentView}>
                    <ScreenTopHeader
                        title={
                            isFromDapp
                                ? ConstantStrings.SELCTED_WALLET
                                : ConstantStrings.SELCTED_WALLET_TO_DEPOSITE
                        }
                        topBackClick={topBackClick}
                        showBack={true}></ScreenTopHeader>

                    <View
                        style={styles.searchContainerStyle}>
                        <Image
                            source={require('@assets/search.png')}
                            style={[
                                styles.icon,
                                { tintColor: theme.colors.menuDotsTint },
                            ]}
                        />
                        <TextInput
                            keyboardType={getKeyboardType()}
                            autoCorrect={false}
                            spellCheck={false}
                            autoComplete={'off'}
                            onChangeText={text => {
                                setSearchText(text);
                            }}
                            style={styles.searchTokenTextInput}
                            placeholderTextColor={theme.colors.gray1_textcolor}
                            placeholder={ConstantStrings.SEARCHTOKEN}
                            selectionColor={theme.colors.gray1_textcolor}
                        />
                    </View>
                    {/* <View style={{
                        marginTop: 15, flexDirection: 'row',
                        paddingHorizontal: 2
                    }}>
                        <Text style={[styles.mainText, { flex: 1 }]}>Cryptocurrency</Text>
                        <Text style={styles.subText}>Available</Text>
                    </View> */}
                    <View style={styles.flatListContainerStyle}>
                        <FlatList
                            data={searchedArray}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    border: {
        borderBottomColor: theme.colors.menuDotsTint,
        borderBottomWidth: 1,
        marginHorizontal: 24,
        marginTop: 10,
        opacity: 0.1,
    },
    contain: {
        alignItems: 'center',
        marginHorizontal: 10,
        marginTop: 16,
    },
    flatListContainerStyle: {
        flex: 1,
        marginBottom: 10,
    },
    icon: {
        borderRadius: 22 / 2,
        height: 22,
        width: 22,
    },
    imageContainerStyle
        : {
        alignItems: 'center',
        flexDirection: 'row',
    },
    mainText: {
        color: theme.colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f16,
        lineHeight: theme.sizes.lh20,
    },
    nameAddressContainerStyle: {
        flex: 1,
        marginLeft: 10,
    },
    parentView: {
        flex: 1,
        marginHorizontal: 20,
    },
    safeareaContainerStyle: {
        backgroundColor: theme.colors.white,
        flex: 1,
    },
    searchContainerStyle: {
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderColor: theme.colors.gray_background_1,
        borderRadius: 20,
        borderWidth: 1,
        flexDirection: 'row',
        paddingHorizontal: theme.sizes.mhp12,
        paddingVertical:
            Platform.OS === 'ios'
                ? theme.sizes.mvp14
                : null,
    },
    searchTokenTextInput: {
        color: theme.colors.gray_textcolor,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f12,
        marginLeft: 8,
    },
    subText: {
        color: theme.colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: theme.sizes.f12,
        lineHeight: theme.sizes.lh14,
        marginTop: 4,
    },
});
