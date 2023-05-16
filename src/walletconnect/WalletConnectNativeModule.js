import { StyleSheet, View } from 'react-native';
import React from 'react';
import Wallet from './ExportWalletNativeModule';
import { launchImageLibrary } from 'react-native-image-picker';
import { QRreader } from '../walletconnect/QRCodeNativeModule';
import { logger } from '@constants/Log';
export const removeByAttr = (array, attr, value) => {
    let arr = JSON.parse(array);
    logger('before removal of ', value);
    logger('before removal array =>  ', arr);
    let i = arr.length - 1;
    for (i; i >= 0; i--) {
        logger('index :: ', i);
        if (arr[i].id == value) {
            logger('arr[i].id ', arr[i].id);
            logger('value ', value);
            logger('arr[i].id == value ', arr[i].id == value);
            arr.splice(i, 1);
        }
    }
    logger('after removal of ', value);
    logger('after removal array =>  ', arr);
    return arr;
};

export const connectWallet = async URL => {
    try {
        await Wallet.createSession(URL);
    } catch (error) {
        logger('create session error', error);
    }
};

export const disconnectWallet = async clickedDappItem => {
    try {
        await Wallet.killSession(JSON.stringify(clickedDappItem));
    } catch (error) {
        logger('disconnect error', error);
    }
};

export const openPhoto = async () => {
    return new Promise((resolve, reject) => {
        launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
            includeBase64: false,
        })
            .then(response => {
                logger('Response = ', response);
                if (response.didCancel) {
                    logger('User cancelled image picker');
                } else if (response.error) {
                    logger('ImagePicker Error: ', response.error);
                } else if (response.customButton) {
                    logger(
                        'User tapped custom button: ',
                        response.customButton,
                    );
                } else {
                    try {
                        const ImageResponse = response.assets[0];
                        if (ImageResponse.uri) {
                            let path = ImageResponse.path;
                            if (!path) {
                                path = ImageResponse.uri;
                            }
                            QRreader(path)
                                .then(data => {
                                    logger(' recognition successful', data);
                                    resolve(data);
                                })
                                .catch(err => {
                                    logger('failed to recognition ', err);
                                    reject('failed to recognition ' + err);
                                });
                        } else {
                            logger('no image path/uri present');
                            reject('no image path/uri present');
                        }
                    } catch (error) {
                        logger('error in finding the path of image :: ', error);
                        reject(
                            'error in finding the path of image :: ' + error,
                        );
                    }
                }
            })
            .catch(error => {
                logger('error in reading qr code :: ', error);
                reject('error in reading qr code :: ' + error);
            });
    });
};

const WalletConnectNativeModule = () => {
    return (
        <View style={styles.flexOneStyle}>
            {/* <TouchableOpacity
        onPress={async () => {
          const historyData = await AsyncStorage.getItem('connectedWallets');
          const historyDataID = await AsyncStorage.getItem('connectedWalletId');
          logger('display list', historyDataID, ' :: ', historyData);
        }}
        style={{
          width: '100%',
          backgroundColor: 'lightblue',
          height: '10%',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
        <Text>print list</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={async () => {
          AsyncStorage.setItem('connectedWallets', '[]');
          AsyncStorage.setItem('connectedWalletId', '');
        }}
        style={{
          width: '100%',
          backgroundColor: 'lightblue',
          height: '10%',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
        <Text>Clear List</Text>
      </TouchableOpacity> */}
        </View>
    );
};

export default WalletConnectNativeModule;

const styles = StyleSheet.create({
    flexOneStyle: {
        flex: 1,
    },
})