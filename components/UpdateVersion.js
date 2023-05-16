import {
    View,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    Linking,
} from 'react-native';
import React from 'react';
import {
    colors,
    calculateHeight,
    calculateWidth,
    fonts,
    sizes,
    Width,
} from '../constant/theme';
import LinearGradient from 'react-native-linear-gradient';
import strings from '@constants/ConstantStrings';
import VersionCheck from 'react-native-version-check';
import { logger } from '../constant/Log';

const UpdateVersion = () => {
    return (
        <View style={styles.parentView}>
            <StatusBar
                animated={true}
                backgroundColor={colors.mainColor}
                barStyle={'light-content'}
            />
            <View style={styles.relativePosition}>
                <Image
                    style={styles.Backimage}
                    resizeMode={'cover'}
                    source={require('@assets/updateVersion.png')}
                />
                <LinearGradient
                    colors={colors.mainColorGradient}
                    style={styles.linearGradient}
                />
            </View>
            <Image
                style={styles.me3Logo}
                resizeMode={'contain'}
                source={require('@assets/me3logo.png')}
            />
            <View style={styles.updateVersionView}>
                <Text style={styles.updateAppText}>{strings.UPDATEAPP}</Text>
                <Text style={styles.updateAvailableText}>
                    {strings.UPDATEAVAILABLE}
                </Text>
                <TouchableOpacity
                    onPress={() => {
                        VersionCheck.getPlayStoreUrl({
                            packageName: VersionCheck.getPackageName(),
                            // packageName: `app.me3.crypto`
                        })
                            .then(storeUrl => {
                                Linking.openURL(storeUrl);
                            })
                            .catch(error => {
                                logger(
                                    'error getting application store url',
                                    error,
                                );
                            });
                    }}
                    style={styles.updateNowButton}>
                    <Text style={styles.updateNowText}>
                        {strings.UPDATENOW}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default UpdateVersion;
const styles = StyleSheet.create({
    Backimage: {
        height: calculateHeight(343),
        width: Width,
    },
    linearGradient: {
        bottom: 0,
        height: calculateHeight(62.07),
        position: 'absolute',
        width: Width,
    },
    me3Logo: {
        alignSelf: 'center',
        height: calculateHeight(25),
        marginBottom: calculateHeight(34),
        marginTop: calculateHeight(43.74),
        width: calculateWidth(126),
    },
    parentView: {
        backgroundColor: colors.mainColor,
        flex: 1,
    },
    relativePosition: {
        position: 'relative',
    },
    updateAppText: {
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f20,
    },
    updateAvailableText: {
        color: colors.gray_textcolor,
        fontFamily: fonts.titillium_Regular,
        fontSize: sizes.f14,
        marginBottom: calculateHeight(24),
        marginTop: calculateHeight(16),
    },
    updateNowButton: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 10,
        padding: calculateHeight(16),
    },
    updateNowText: {
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
    },
    updateVersionView: {
        backgroundColor: colors.white,
        borderRadius: 12,
        marginHorizontal: calculateWidth(20),
        paddingHorizontal: calculateHeight(24),
        paddingVertical: calculateWidth(28),
    },
});
