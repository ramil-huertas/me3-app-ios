import {
    View,
    SafeAreaView,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { colors } from '@constants/theme';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { clearStorage, saveKeyValueData } from '@constants/Storage';
import { clearDatabase } from '@database/sql.js';
import constStorage from '@constants/ConstStorage';
import LogOutPopUp from '../Home/LogOutPopUp';
import BackupWarning from '../Home/BackupWarning';
import Wallet from '../../walletconnect/ExportWalletNativeModule';
import { firebaseEvents } from '@firebase/FirebaseEventName';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
const CustomHeader = ({ navigation, connectToAppCallBack }) => {
    const [showLogOutPopUP, setShowLogOutPopUP] = useState(false);
    const [showBackupWarning, setShowBackupWarning] = useState(false);
    return (
        <SafeAreaView>
            {showLogOutPopUP && (
                <LogOutPopUp
                    setShowLogOutPopUP={setShowLogOutPopUP}
                    logoutCallback={logoutCallback}
                />
            )}
            {showBackupWarning && (
                <BackupWarning setShowBackupWarning={setShowBackupWarning} />
            )}

            <View style={styles.header}>
                <Image
                    source={require('@assets/me3logo.png')}
                    style={styles.logo}
                    resizeMode="contain"></Image>
                <View style={styles.logoView}>
                    <TouchableOpacity
                        style={styles.navigateToScanTouchStyle}
                        onPress={navigateToScan}>
                        <Image
                            source={require('@assets/scan.png')}
                            resizeMode="contain"
                            style={styles.icon}></Image>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.navigateToSettingTouchStyle}
                        onPress={navigateToSetting}>
                        <Image
                            source={require('@assets/Settings.png')}
                            resizeMode="contain"
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );

    function navigateToScan() {
        connectToAppCallBack();
    }

    async function logoutCallback() {
        await Wallet.clearAllData();
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        clearStorage();
        clearDatabase();
        saveKeyValueData(constStorage.WALLETBACKUPED, 'FALSE');
        saveKeyValueData(constStorage.SHOW_HIDE_TESTNET,'false')
        setTimeout(() => {
            navigation.replace('OnBoarding');
        }, 200);
    }

    function navigateToSetting() {
        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.home_settings, eventObject);
        navigation.navigate('Setting');
    }
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        backgroundColor: colors.mainColor,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
    },

    icon: {
        height: 25,
        width: 25,
    },

    logo: {
        height: 16,
        width: 84,
    },

    logoView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    navigateToScanTouchStyle :{
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    navigateToSettingTouchStyle:{
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    }
});

export default CustomHeader;
