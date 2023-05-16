import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native';
import React, { useState, useEffect } from 'react';
import ConstantStrings, {
    IMPORTFROMGALLERY,
    SCANQRCODE,
} from '@constants/ConstantStrings';
import { colors, fonts, Height, sizes, Width } from '@constants/theme';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {
    connectWallet,
    openPhoto,
} from '../src/walletconnect/WalletConnectNativeModule';
import { logger } from '@constants/Log';
import CustomToast from './CustomToast';
import {
    scannedAddress,
    resetStateQR,
    errorStatus,
    qrScannedStatus,
} from '@redux/Action/QRScanActions';
import { useDispatch, useSelector } from 'react-redux';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import { firebaseEvents } from '@firebase/FirebaseEventName';
import { getAddressStatus } from '../constant/AddressValidator';

const QrScanner = ({ navigation, route }) => {
    const QRScanReducer = useSelector(state => state.QRScanReducer);
    const dispatch = useDispatch();

    const [isFromSendSwap, setIsFromSendSwap] = useState(false);
    useEffect(() => {
        if (route.params != null || route.params != undefined) {
            if (
                route.params.eventName == '' ||
                route.params.isFromAddressScan
            ) {
                setIsFromSendSwap(true);
            }
        }
    }, []);
    useEffect(() => {
        qrScannedStatus(dispatch, false);
        errorStatus(dispatch, false);
    }, []);

    const onSuccess = async res => {
        const url = res.data;
        logger('uri scanned from QR code', url);

        const eventObject = {
            timeOfClick: new Date().toLocaleString(),
        };
        firebaseAnalytics(firebaseEvents.dapp_connect, eventObject);

        if (url.startsWith('wc')) {
            qrScannedStatus(dispatch, true);
            setTimeout(async () => {
                await connectWallet(url);
                navigation.goBack();
            }, 500);
        } else {
            let validationObject = getAddressStatus(url);
            let isValidAddress = (validationObject.isValidAddress =
                getAddressStatus(url));
            qrScannedStatus(dispatch, true);
            logger(`isValidAddress = ${isValidAddress} `);
            if (!isValidAddress) {
                errorStatus(dispatch, true);
                qrScannedStatus(dispatch, false);
            } else {
                if (isFromSendSwap) {
                    logger('from send or swap screen');
                    qrScannedStatus(dispatch, true);
                    resetStateQR(dispatch);
                    setTimeout(() => {
                        scannedAddress(dispatch, url);
                        navigation.goBack();
                    }, 1000);
                } else {
                    qrScannedStatus(dispatch, true);
                    navigation.replace('Send', {
                        isFromHome: true,
                        walletAddress: url,
                    });
                }
            }
        }
    };
    const openGallery = async () => {
        if (route.params.eventName != '') {
            const eventObject = {
                timeOfClick: new Date().toLocaleString(),
            };
            firebaseAnalytics(route.params.eventName, eventObject);
        }

        await openPhoto()
            .then(async url => {
                logger('qr data ', url);
                try {
                    if (url.startsWith('wc')) {
                        qrScannedStatus(dispatch, true);
                        await connectWallet(url);
                        navigation.goBack();
                    } else {
                        let isValidAddress = getAddressStatus(url);
                        if (!isValidAddress) {
                            errorStatus(dispatch, true);
                        } else {
                            // redirect to send page
                            if (isFromSendSwap) {
                                logger('from send or swap screen');
                                qrScannedStatus(dispatch, true);
                                resetStateQR(dispatch);
                                setTimeout(() => {
                                    scannedAddress(dispatch, url);
                                    navigation.goBack();
                                }, 1000);
                            } else {
                                qrScannedStatus(dispatch, true);
                                navigation.replace('Send', {
                                    isFromHome: true,
                                    walletAddress: url,
                                });
                            }
                        }
                    }
                } catch (error) {
                    qrScannedStatus(dispatch, false);
                    errorStatus(dispatch, true);
                    logger('image read from gallery Error', error);
                }
            })
            .catch(error => {
                qrScannedStatus(dispatch, false);
                logger('error in opening gallery', error);
                errorStatus(dispatch, true);
            });
    };
    function setShowToastNotification() {
        setTimeout(() => {
            errorStatus(dispatch, false);
            qrScannedStatus(dispatch, false);
        }, 200);
    }
    function checkTintColor() {
        if (QRScanReducer.errorStatus) {
            return colors.offRed;
        } else if (
            QRScanReducer.qrScannedStatus &&
            !QRScanReducer.errorStatus
        ) {
            return colors.success;
        } else return colors.white;
    }
    const renderMarker = () => {
        const qrMarkerStyle = {
            height: 218,
            width: 218,
            tintColor: checkTintColor(),
        };
        return (
            <SafeAreaView style={{backgroundColor:colors.transparent,flex:1,}}>
            <View style={styles.flexOneWidth}>
                {QRScanReducer.errorStatus && (
                    <CustomToast
                        url={require('@assets/CopySuccess.png')}
                        Message={ConstantStrings.PLEASE_TRY_AGAIN_QRCODE}
                        type={'error'}
                        setShowToastNotification={setShowToastNotification}
                    />
                )}
                <View style={styles.ScanHeader}>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.goBack();
                        }}
                        style={styles.backIconTouchable}>
                        <Image
                            source={require('@assets/backIcon.png')}
                            resizeMode="contain"
                            style={styles.iconArrow}
                        />
                    </TouchableOpacity>

                    <Text style={styles.headText}>{SCANQRCODE}</Text>
                </View>
                <View style={styles.qrMarkerTouchable}>
                    <Image
                        source={require('@assets/qr-marker.png')}
                        resizeMode={'contain'}
                        style={qrMarkerStyle}
                    />
                    <TouchableOpacity onPress={openGallery}>
                        <View style={styles.btngalleryImport}>
                            <Image
                                source={require('@assets/GalleryImport.png')}
                                resizeMode="contain"
                                style={styles.galleryImport}></Image>
                            <Text style={styles.txtDeposite}>
                                {IMPORTFROMGALLERY}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            </SafeAreaView>
        );
    };
    return (
            <QRCodeScanner
                onRead={onSuccess}
                showMarker={true}
                reactivate={true}
                reactivateTimeout={4000}
                vibrate={true}
                cameraStyle={{ height: Height }}
                flashMode={'off'}
                ref={node => {
                    this.scanner = node;
                }}
                customMarker={renderMarker}
            />
    );
};

export default QrScanner;
const styles = StyleSheet.create({
    ScanHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    backIconTouchable: {
        alignItems: 'center',
        height: 24,
        //   marginLeft: 24,
        justifyContent: 'center',
        width: 24,
    },
    btngalleryImport: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 10,
        flexDirection: 'row',
        marginTop: 54,
        paddingHorizontal: 18,
        paddingVertical: 16,
    },
    flexOneWidth: {
        flex: 1,
        width: Width,
    },
    galleryImport: {
        height: 15,
        width: 15,
    },
    headText: {
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
        lineHeight: sizes.lh20,
    },
    iconArrow: {
        height: 12,
        marginRight: 15,
        tintColor: colors.white,
        width: 10,
    },

    qrMarkerTouchable: {
        alignItems: 'center',
        backgroundColor: colors.transparent,
        flex: 1,
        justifyContent: 'center',
    },
    txtDeposite: {
        color: colors.white,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
        paddingLeft: 5,
    },
});
