import { View, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import React from 'react';
import { calculateWidth, colors } from '@constants/theme';
import { ADDRESS_BOOK, ADDRESS_SAVED_TOAST } from '@constants/ConstantStrings';
import ScreenTopHeader from '@components/ScreenTopHeader';
import { useDispatch } from 'react-redux';

import AddressBookComponent from './AddressBookComponent';
import { showCopyToast } from '@redux/Action/ToastAlert';
import Clipboard from '@react-native-clipboard/clipboard';

const AddressBook = ({ navigation }) => {
    const dispatch = useDispatch();
    const topBackClick = () => {
        navigation.goBack();
    };

    const copyWalletAddress = item => {
        Clipboard.setString(item.wallet_address);
        showCopyToast(dispatch, ADDRESS_SAVED_TOAST);
    };
    return (
        <SafeAreaView style={styles.parentView}>
            <StatusBar
                animated={true}
                backgroundColor={colors.white}
                barStyle={'dark-content'}
            />
            <View style={styles.marginHorizontal20}>
                <ScreenTopHeader
                    title={ADDRESS_BOOK}
                    topBackClick={topBackClick}
                    showBack={true}
                />
            </View>
            <AddressBookComponent onPress={copyWalletAddress} />
        </SafeAreaView>
    );
};

export default AddressBook;
const styles = StyleSheet.create({
    marginHorizontal20: {
        marginHorizontal: calculateWidth(20),
    },
    parentView: {
        backgroundColor: colors.white,
        flex: 1,
    },
});
