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

export default function UnableToRecover({ navigation }) {
    return (
        <View style={styles.container}>
            <StatusBar
                animated={true}
                backgroundColor={theme.colors.mainColor}
                barStyle={'light-content'}
            />
            <View style={styles.unabletoRecovercontainerStyle}>
                <Text
                    style={[
                        styles.textStyle,
                        styles.unableToRecoverWalletText,
                    ]}>
                    {string.UNABLE_TO_RECOVER_WALLET}
                </Text>
                <Text
                    style={[
                        styles.textStyle,
                        styles.keyRecoveryNotLocatedText,
                    ]}>
                    {string.KEY_RECOVERY_NOT_LOCATED_ON_DRIVE}
                </Text>
                <Image
                    style={styles.driveImageStyle}
                    source={require('@assets/drive_file_image.png')}></Image>
                <View style={styles.messageOneParentView}>
                    <Text style={styles.msgOne}>{string.MESSAGE_1}</Text>
                    <Text style={styles.msgTwo}>{string.MESSAGE_2}</Text>
                </View>
            </View>

            <View style={styles.bottomViewStyle}>
                <TouchableOpacity
                    style={styles.bottomTouchableStyle}
                    onPress={() => navigation.navigate('LookingForFile')}>
                    <Text style={styles.bottomButtonStyle}>
                        {string.CHECK_AGAIN}
                    </Text>
                </TouchableOpacity>
                <Text style={styles.bottomTextStyle}>
                    {string.SIGN_IN_WITH_DIFFERENT_GOOGLE_ACCOUNT}
                </Text>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    bottomButtonStyle: {
        backgroundColor: theme.colors.purple_button_color,
        borderRadius: theme.sizes.button_border_radius,
        color: theme.colors.white,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.button_text_size,
        height: '100%',
        textAlign: 'center',
        textAlignVertical: 'center',
        width: '100%',
    },
    bottomTextStyle: {
        color: theme.colors.white,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: 16,
        marginBottom: 15,
        marginTop: 10,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    bottomTouchableStyle: {
        height: '35%',
        width: '100%',
    },
    bottomViewStyle: {
        alignSelf: 'center',
        height: theme.sizes.bottom_button_view_height,
        justifyContent: 'center',
        width: '88%',
    },
    container: {
        backgroundColor: theme.colors.mainColor,
        flex: 1,
        justifyContent: 'center',
    },
    driveImageStyle: {
        alignSelf: 'center',
        height: '30%',
        marginBottom: 20,
        resizeMode: 'contain',
        width: '70%',
    },
    keyRecoveryNotLocatedText: {
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: 18,
        marginBottom: '10%',
    },
    messageOneParentView: {
        backgroundColor: theme.colors.purple_dark,
        borderRadius: 5,
        padding: 20,
        width: '88%',
    },
    msgOne: {
        color: theme.colors.white,
        fontFamily: theme.fonts.titillium_Regular,
    },
    msgTwo: {
        color: theme.colors.white,
        fontFamily: theme.fonts.titillium_Regular,
        marginTop: 10,
    },
    textStyle: {
        color: theme.colors.white,
        fontFamily: theme.fonts.titillium_bold,
        marginBottom: 10,
        textAlign: 'center',
        width: '88%',
    },
    unableToRecoverWalletText: {
        fontSize: theme.sizes.h1,
        width: '88%',
    },
    unabletoRecovercontainerStyle: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
});
