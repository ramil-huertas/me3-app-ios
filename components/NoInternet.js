import { View, Image, StatusBar, StyleSheet, Text, Modal } from 'react-native';
import React from 'react';
import {
    colors,
    calculateHeight,
    calculateWidth,
    fonts,
    sizes,
} from '../constant/theme';
import strings from '@constants/ConstantStrings';

const NoInternet = ({ showPopUp, setShowPopUp }) => {
    return (
        <Modal
            onRequestClose={() => {
                setShowPopUp(false);
            }}
            visible={showPopUp}
            animationType="fade"
            presentationStyle="overFullScreen"
            statusBarTranslucent={true}>
            <View style={styles.parentView}>
                <StatusBar
                    animated={true}
                    backgroundColor={colors.mainColor}
                    barStyle={'light-content'}
                />

                <Image
                    style={styles.me3Logo}
                    resizeMode={'contain'}
                    source={require('@assets/me3logo.png')}
                />
                <View style={styles.noInternetView}>
                    <Image
                        style={styles.noInternetLogo}
                        resizeMode={'contain'}
                        source={require('@assets/noInternet.png')}
                    />
                    <Text style={styles.noInternetText}>
                        {strings.NOINTERNET}
                    </Text>
                    <Text style={styles.unableToConnectText}>
                        {strings.UNABLETOCONNECT}
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

export default NoInternet;

const styles = StyleSheet.create({
    me3Logo: {
        alignSelf: 'center',
        height: calculateHeight(25),
        marginBottom: calculateHeight(34),
        marginTop: calculateHeight(200) + StatusBar.currentHeight,
        width: calculateWidth(126),
    },
    noInternetLogo: {
        alignSelf: 'center',
        height: calculateHeight(100),
        marginBottom: calculateHeight(24),
        width: calculateWidth(100),
    },
    noInternetText: {
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f20,
    },
    noInternetView: {
        backgroundColor: colors.white,
        borderRadius: 12,
        marginHorizontal: calculateWidth(20),
        paddingHorizontal: calculateHeight(24),
        paddingVertical: calculateWidth(28),
    },
    parentView: {
        backgroundColor: colors.mainColor,
        flex: 1,
    },
    unableToConnectText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_Regular,
        fontSize: sizes.f14,
        marginTop: calculateHeight(16),
    },
});
