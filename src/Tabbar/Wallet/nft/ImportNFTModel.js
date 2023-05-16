import {
    Image,
    Modal,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors, fonts, sizes } from '@constants/theme';
import ConstantStrings from '@constants/ConstantStrings';
import { getKeyboardType } from '@constants/commonFuncation';
export default function ImportNFTModel({ setShowNFTImport }) {
    const [contractAddress, setContractAddress] = useState();
    const [tokenId, setTokenId] = useState();

    return (
        <>
            <Modal
                onRequestClose={() => {
                    setShowNFTImport(false);
                }}
                transparent={true}>
                <View style={styles.contain}>
                    <View style={styles.popupView}>
                        <View style={styles.titleView}>
                            <Text style={styles.title}>
                                {ConstantStrings.IMPORTNFT}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowNFTImport(false);
                                }}>
                                <Image
                                    source={require('@assets/close.png')}
                                    style={styles.closeIcon}
                                />
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={styles.textInputLabelStyle}>
                                {ConstantStrings.CONTRACT_ADDRESS}
                            </Text>
                            <TextInput
                                value={contractAddress}
                                onChangeText={text => { }}
                                style={styles.textInputStyle}
                                placeholderTextColor={colors.gray1_textcolor}
                                placeholder={'0x...'}
                                selectionColor={colors.gray1_textcolor}
                                keyboardType={getKeyboardType()}
                                autoCorrect={false}
                                spellCheck={false}
                                autoComplete={'off'}
                            />
                        </View>
                        <View>
                            <Text style={styles.textInputLabelStyle}>
                                {ConstantStrings.TOKEN_ID}
                            </Text>
                            <TextInput
                                value={tokenId}
                                onChangeText={text => { }}
                                style={styles.textInputStyle}
                                placeholderTextColor={colors.gray1_textcolor}
                                placeholder={'GNO'}
                                selectionColor={colors.gray1_textcolor}
                                keyboardType={getKeyboardType()}
                                autoCorrect={false}
                                spellCheck={false}
                                autoComplete={'off'}
                            />
                        </View>

                        <View
                            style={styles.bottomButtonContainerStyle}>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    { backgroundColor: colors.gray_background },
                                ]}>
                                <Text
                                    style={[
                                        styles.buttonTitles,
                                        { color: colors.gray_textcolor },
                                    ]}>
                                    {ConstantStrings.Cancel}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.importButtonExtraStyle,
                                ]}>
                                <Text
                                    style={[
                                        styles.buttonTitles,
                                        { color: colors.white },
                                    ]}>
                                    {ConstantStrings.IMPORT}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}
const styles = StyleSheet.create({
    bottomButtonContainerStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: 16,
    },
    button: {
        alignItems: 'center',
        borderRadius: 10,
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 18,
        paddingVertical: 16,
    },
    buttonTitles: {
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
    },

    closeIcon: {
        height: 24,
        width: 24,
    },
    contain: {
        backgroundColor: colors.popupBgcolor,
        flex: 1,
        justifyContent: 'space-around',
        margin: 0,
    },

    importButtonExtraStyle: {
        backgroundColor:
            colors.purple_button_color,
        marginLeft: 12,
    },

    popupView: {
        backgroundColor: colors.white,
        borderRadius: 12,
        margin: 20,
        padding: 20,
    },

    textInputLabelStyle: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
        lineHeight: sizes.lh20,
        marginVertical: 8,
    },
    textInputStyle: {
        backgroundColor: colors.gray_background,
        borderColor: colors.gray_background_1,
        borderRadius: 10,
        borderWidth: 1,
        color: colors.gray1_textcolor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
        marginBottom: 8,
        padding: 10,
    },
    title: {
        color: colors.mainColor,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f18,
        lineHeight: sizes.lh24 + 4,
    },
    titleView: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
});
