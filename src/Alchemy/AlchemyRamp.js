import { View, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import { colors, calculateWidth } from '@constants/theme';
import WebView from 'react-native-webview';
import { logger } from '@constants/Log';
import ScreenTopHeader from '@components/ScreenTopHeader';
import Progress from '@components/Progress';
import { BUY, SELL } from '../../constant/ConstantStrings';
const AlchemyRamp = ({ navigation, route }) => {
    const [ProgressStatus, setProgressStatus] = useState(false);
    const {
        tokenName,
        walletName,
        walletAddress,
        fiatValue,
        amount,
        encodedSign,
        email,
        BuyTabSelected,
    } = route.params;

    const AlchemyAppId = 'f83Is2y7L425rxl8';
    const appSecret = `4Yn8RkxDXN71Q3p0`;
    const AlchemyType = BuyTabSelected?BUY.toLowerCase():SELL.toLowerCase()
    let AlchemyTestUrl;
    if(BuyTabSelected){
        AlchemyTestUrl = `https://ramptest.alchemypay.org/?appId=${AlchemyAppId}&email=${email}&crypto=${tokenName}&network=${walletName}&address=${walletAddress}&fiat=${fiatValue}&fiatAmount=${amount}&showTable=${AlchemyType}&sign=${encodedSign}&type=${AlchemyType}`;
    }else{
        AlchemyTestUrl = `https://ramptest.alchemypay.org/?appId=${AlchemyAppId}&email=${email}&crypto=${tokenName}&cryptoAmount=${amount}&network=${walletName}&address=${walletAddress}&fiat=${fiatValue}&showTable=${AlchemyType}&sign=${encodedSign}&type=${AlchemyType}`;
    }

    
    
    
    
    
   
   


    function spaceSupply(text) {
        let len = text.length;
        let supply = 16 - (len % 16);
        let supplyStr = new Array(supply).fill(' ').join('');
        return text + supplyStr;
    }

    /* useEffect(() => {
    * const text = `address=${walletAddress}&appId=${AlchemyAppId}&fiat=${fiatValue}&fiatAmount=${amount}`
    * var textBytes = aesjs.utils.utf8.toBytes( spaceSupply(text));
    * var secretKey = aesjs.utils.utf8.toBytes(appSecret);
    * var iv = [ 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,35, 36 ];

    * var aesCbc = new aesjs.ModeOfOperation.cbc(secretKey, iv);
    * var encryptedBytes = aesCbc.encrypt(textBytes);
    * var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    * const bytes = utf8.encode(encryptedHex);
    * const encodedSign = base64.encode(bytes);
    * const encodeURI = encodeURIComponent(encodedSign)

    *   var bytes = base64.decode(encoded);
    *   var dtext = utf8.decode(bytes);

    *   var encryptedBytes = aesjs.utils.hex.toBytes(dtext);
    *   var aesCbc = new aesjs.ModeOfOperation.cbc(secretKey, iv);
    *   var decryptedBytes = aesCbc.decrypt(encryptedBytes);

    *   var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    * }, [])
    */

    return (
        <SafeAreaView style={styles.parentView}>
            <StatusBar
                animated={true}
                backgroundColor={colors.mainColor}
                barStyle={'light-content'}
            />
            {ProgressStatus && <Progress />}
            <View style={{ marginHorizontal: calculateWidth(20) }}>
                <ScreenTopHeader
                    title={'Alchemy Pay'}
                    topBackClick={() => {
                        navigation.goBack();
                    }}
                    showBack={true}
                />
            </View>
            <WebView
                contentMode="mobile"
                cacheEnabled={true}
                source={{ uri: `${AlchemyTestUrl}` }}
                setSupportMultipleWindows={true}
                allowFileAccess={true}
                scalesPageToFit={true}
                originWhitelist={['*']}
                onLoad={event => {
                    console.log('webview onload :: ', event.nativeEvent.url);
                }}
                onLoadStart={() => {
                    setProgressStatus(true);
                }}
                onLoadEnd={() => {
                    setProgressStatus(false);
                }}
            />
        </SafeAreaView>
    );
};

export default AlchemyRamp;
const styles = StyleSheet.create({
    parentView: {
        backgroundColor: colors.white,
        flex: 1,
    },
});
