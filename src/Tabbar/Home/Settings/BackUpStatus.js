import { Image, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors } from '@constants/theme';
import { theme } from '@constants';
import {
    BACKING_UP_WALLET,
    BACKING_UP_WALLET_MESSAGE,
    BACKUP_STATUS,
    COME_BACK_TO_CHECK,
    YOUR_WALLET_BACKEDUP,
} from '@constants/ConstantStrings';
import { getAllNotBackedUpWallets } from '@database/sql';
import BackConfirmationPopup from '../BackConfirmationPopup';
import { retrieveKeyValueData } from '@constants/Storage';
import storageConst from '@constants/ConstStorage';
import ScreenTopHeader from '@components/ScreenTopHeader';

export default function BackUpStatus({ navigation }) {
    const [backUped, setBackUped] = useState(false);
    const [showBackConfirmationPopup, setShowBackConfirmationPopup] =
        useState(false);
    useEffect(() => {
        checkKeysBackUpStatus();
        checkBackUpStatus();
    }, []);
    const checkKeysBackUpStatus = async () => {
        const status = await retrieveKeyValueData(storageConst.BACKUPEDARGEE);
        if (status == 'TRUE') {
            setShowBackConfirmationPopup(false);
        } else {
            setShowBackConfirmationPopup(true);
        }
    };

    async function checkBackUpStatus() {
        const result = await getAllNotBackedUpWallets();
        if (result.rows.length == 0) {
            setBackUped(true);
        } else {
            setBackUped(false);
        }
    }

    return (
        <SafeAreaView style={styles.content}>
            <StatusBar
                animated={true}
                backgroundColor={theme.colors.white}
                barStyle={'dark-content'}
            />
            {showBackConfirmationPopup && (
                <BackConfirmationPopup
                    setShowBackConfirmationPopup={setShowBackConfirmationPopup}
                    navigation={navigation}
                />
            )}
            <View style={styles.header}>
                <ScreenTopHeader
                    title={BACKUP_STATUS}
                    topBackClick={closeClickevent}
                    showBack={true}></ScreenTopHeader>
            </View>

            <View style={styles.body}>
                <View style={styles.contentSubView}>
                    {backUped ? (
                        <Image
                            source={require('@assets/Backup_success.png')}
                            style={styles.backUpIcon}
                            resizeMode="contain"></Image>
                    ) : (
                        <Image
                            source={require('@assets/Backup_Inprogress.png')}
                            style={styles.backUpIcon}
                            resizeMode="contain"></Image>
                    )}
                    <Text style={[styles.headText, styles.backupText]}>
                        {' '}
                        {backUped ? YOUR_WALLET_BACKEDUP : BACKING_UP_WALLET}
                    </Text>
                    <Text style={styles.messageText}>
                        {' '}
                        {BACKING_UP_WALLET_MESSAGE}
                    </Text>
                    {backUped ? null : (
                        <Text style={styles.comebackText}>
                            {' '}
                            {COME_BACK_TO_CHECK}
                        </Text>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );

    function closeClickevent() {
        navigation.pop();
    }
}

const styles = StyleSheet.create({
    backUpIcon: {
        height: 102,
        marginBottom: 24,
        marginTop: 48,
        width: 102,
    },
    backupText: {
        fontSize: theme.sizes.f24,
        marginBottom: 12,
    },
    body: {
        alignContent: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    comebackText: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f14,
        marginBottom: 24,
    },

    content: {
        backgroundColor: colors.white,
        flex: 1,
    },

    contentSubView: {
        alignItems: 'center',
        backgroundColor: colors.gray_background,
        borderRadius: 24,
        justifyContent: 'center',
        marginLeft: 24,
        marginRight: 24,
    },

    headText: {
        color: colors.menuDotsTint,
        fontFamily: theme.fonts.titillium_bold,
        fontSize: theme.sizes.f18,
    },

    header: {
        marginHorizontal: 20,
    },

    messageText: {
        color: colors.gray_textcolor,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: theme.sizes.f14,
        marginBottom: 24,
        textAlign: 'center',
        width: '80%',
    },
});
