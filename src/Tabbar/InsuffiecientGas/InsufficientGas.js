import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import {
    colors,
    fonts,
    sizes,
    calculateHeight,
    calculateWidth,
    NativeBaseModalStyle,
} from '@constants/theme';
import {
    Cancel,
    COVER_ESTIMATED_FEES,
    Deposit,
    INSUFFICIENT_GAS,
    YOU_DONT_HAVE_SUFFICIENT,
} from '@constants/ConstantStrings';
import { Modal } from 'native-base';

const InsufficientGas = ({
    navigation,
    ShowPopupStatus,
    setShowPopupStatus,
    chainName,
    chainIcon,
    walletAddress,
    chainDescription,
    onCancel,
}) => {
    return (
        <Modal
            animationPreset="fade"
            isOpen={ShowPopupStatus}
            onClose={() => {
                setShowPopupStatus(false);
            }}
            background={colors.popupBgcolor}
            size={'full'}
            backdropVisible={false}>
            <Modal.Content style={NativeBaseModalStyle.setBottomModal} p={'1'}>
                <Modal.Body
                    style={styles.popupView}
                    _scrollview={{ bounces: false }}>
                    <Image
                        source={require('@assets/notEnoughGas.png')}
                        style={styles.gasIcon}
                        resizeMode={'contain'}
                    />
                    <Text style={styles.titleText}>{INSUFFICIENT_GAS}</Text>
                    <View style={styles.inlineSubText}>
                        <Text style={styles.subTitleText}>
                            {YOU_DONT_HAVE_SUFFICIENT + '  '}
                        </Text>
                        <View style={styles.chainImageStyle}>
                            <Image
                                source={{ uri: chainIcon }}
                                style={styles.chainIcon}
                                resizeMode={'contain'}
                            />
                            <Text style={styles.chainName}>
                                {` ${chainName?.toUpperCase()} `}
                            </Text>
                        </View>
                        <View style={styles.topMarginStyle}>
                            <Text style={styles.subTitleText}>
                                {COVER_ESTIMATED_FEES}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.cancelButonStyle}>
                        <TouchableOpacity
                            onPress={() => {
                                onCancel();
                                setShowPopupStatus(false);
                            }}
                            style={styles.Button}>
                            <Text style={styles.buttonText}>{Cancel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setShowPopupStatus(false);
                                navigation.navigate('WalletQrcode', {
                                    isFromHome: false,
                                    address: walletAddress,
                                    chainName: chainName,
                                    chainIcon: chainIcon,
                                    chainDescription: chainDescription,
                                });
                            }}
                            style={[styles.Button, styles.buttonSecondStyle]}>
                            <Image
                                source={require('@assets/arrowBottom.png')}
                                style={[
                                    styles.smallImageIcon,
                                    styles.smallImageSecondStyle,
                                ]}
                                resizeMode={'contain'}
                            />
                            <Text
                                style={[
                                    styles.buttonText,
                                    { color: colors.white },
                                ]}>
                                {`${Deposit} ${chainName?.toUpperCase()}`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Modal.Body>
            </Modal.Content>
        </Modal>
    );
};

export default InsufficientGas;
const styles = StyleSheet.create({
    Button: {
        alignItems: 'center',
        backgroundColor: colors.gray_background,
        borderRadius: 10,
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: calculateWidth(6),
        paddingHorizontal: calculateWidth(18),
        paddingVertical: calculateHeight(16),
    },
    buttonSecondStyle: {
        backgroundColor: colors.purple_button_color,
        flexDirection: 'row',
    },
    buttonText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
    },
    cancelButonStyle: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    chainIcon: {
        borderRadius: 50,
        height: calculateHeight(20),
        width: calculateHeight(20),
    },
    chainImageStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'nowrap',
    },
    chainName: {
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
    },
    gasIcon: {
        height: calculateHeight(80),
        marginBottom: calculateHeight(24),
        width: calculateHeight(80),
    },
    inlineSubText: {
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginHorizontal: calculateWidth(25),
        marginVertical: calculateHeight(20),
    },
    popupView: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: calculateHeight(30),
    },
    smallImageIcon: {
        height: calculateHeight(20),
        width: calculateHeight(20),
    },
    smallImageSecondStyle: {
        marginRight: 8,
        tintColor: colors.white,
    },
    subTitleText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_Regular,
        fontSize: sizes.f14,
        lineHeight: sizes.lh24,
        textAlign: 'center',
    },
    titleText: {
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f20,
        lineHeight: sizes.lh24,
    },
    topMarginStyle: {
        marginTop: 5,
    },
});
