import React from 'react';

import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Image,
    StatusBar,
} from 'react-native';
import { theme } from '@constants';
import string from '@constants/ConstantStrings';
import { calculateHeight, colors, fonts } from '@constants/theme';
import ConstStorage from '@constants/ConstStorage';
import { saveKeyValueData } from '@constants/Storage';
import moment from 'moment';

export default function OnBoardComplete({ navigation }) {
    return (
        <View style={styles.container}>
            <StatusBar
                animated={true}
                backgroundColor={theme.colors.purple_button_color1}
                barStyle={'light-content'}
            />
            <View style={styles.imageContainerStyle}>
                <Image
                    source={require('@assets/walletReady.png')}
                    style={styles.imageStyle}
                    resizeMode={'contain'}
                />
            </View>
            <View style={styles.meThreeWalletIsReady}>
                <Text style={[styles.textStyle, { fontSize: theme.sizes.f28 }]}>
                    {string.YOUR_ME3_WALLET_IS_READY}
                </Text>
                <Text style={[styles.textStyle, styles.useWalletDescText]}>
                    {string.USE_WALLET_DESCRIPTION}
                </Text>
            </View>
            {/* <View style={styles.bottomViewStyle} > */}
            <View style={{ marginTop: calculateHeight(80) }}>
                <Text style={styles.startExploringTextStyle}>
                    {string.START_EXPLORING}
                </Text>
                <TouchableOpacity
                    style={styles.bottomTouchableStyle}
                    onPress={async () => {
                        const timeOfAppOpen = moment().toLocaleString();
                        await saveKeyValueData(
                            ConstStorage.TIME_OF_LOGIN,
                            timeOfAppOpen,
                        );
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'MainContainer' }],
                        });
                    }}>
                    <Text style={styles.bottomButtonStyle}>
                        {string.CONTINUE}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* </View> */}
        </View>
    );
}
const styles = StyleSheet.create({
    bottomButtonStyle: {
        color: theme.colors.purple_button_color,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.button_text_size,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    bottomTouchableStyle: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.sizes.button_border_radius,
        marginBottom: 34,
        marginHorizontal: 20,
        marginTop: 2,
        paddingHorizontal: 18,
        paddingVertical: 16,
    },
    container: {
        backgroundColor: colors.purple_button_color1,
        flex: 1,
        justifyContent: 'center',
    },
    imageContainerStyle: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        margin: 24,
        marginTop: 82 + StatusBar.currentHeight,
    },

    imageStyle: {
        height: 312,
        width: 312,
    },
    meThreeWalletIsReady: {
        alignItems: 'center',
    },
    startExploringTextStyle: {
        color: theme.colors.white,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: 16,
        marginBottom: 15,
        textAlign: 'center',
    },
    textStyle: {
        color: theme.colors.white,
        fontFamily: fonts.titillium_bold,
        marginBottom: 16,
        textAlign: 'center',
    },
    useWalletDescText: {
        fontSize: theme.sizes.f16,
        marginHorizontal: 45,
    },
});
