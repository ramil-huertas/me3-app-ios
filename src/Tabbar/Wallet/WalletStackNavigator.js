import React from 'react';
import Wallet from './Wallet';
import CryptoDetails from './CryptoDetails';
import { createStackNavigator } from '@react-navigation/stack';
import Send from './send/Send';
import SwapPreview from '../Swap/SwapPreview';
import { firebaseEvents } from '@firebase/FirebaseEventName';
import { firebaseAnalytics } from '@firebase/FirebaseAnalytics';
import NftDetail from './nft/NftDetail';
import SendNFT from './nft/SendNFT';

const WalletStackNavigator = ({ navigation }) => {
    const WalletStack = createStackNavigator();
    const forFade = ({ current }) => ({
        cardStyle: {
            opacity: current.progress,
        },
    });

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('tabPress', e => {
            const eventObject = {
                timeOfClick: new Date().toLocaleString(),
            };
            firebaseAnalytics(firebaseEvents.menu_wallet, eventObject);
        });

        return unsubscribe;
    }, [navigation]);
    return (
        <WalletStack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: forFade,
            }}>
            <WalletStack.Screen
                name="WalletScreen"
                component={Wallet}
            // options={{headerShown: false}}
            />
            <WalletStack.Screen
                name="CryptoDetails"
                component={CryptoDetails}
            // options={{headerShown: false}}
            />
            <WalletStack.Screen name="NftDetail" component={NftDetail} />
            <WalletStack.Screen name="SendNFT" component={SendNFT} />
            <WalletStack.Screen name="Send" component={Send} />
            <WalletStack.Screen name="SwapPreview" component={SwapPreview} />
        </WalletStack.Navigator>
    );
};

export default WalletStackNavigator;
