import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import HomeScreen from './Home/Home';
import SwapScreen from './Swap/Swap';
import { Image, StyleSheet } from 'react-native';
import WalletStackNavigator from './Wallet/WalletStackNavigator';
import { theme } from '@constants';
//Screen names
const homeName = 'Home';
const swapName = 'Swap';
const walletName = 'Wallet';

const Tab = createBottomTabNavigator();

function MainContainer() {
    return (
        <Tab.Navigator
            initialRouteName={homeName}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    let rn = route.name;

                    if (rn === homeName) {
                        iconName = require('@assets/TabHome.png');
                    } else if (rn === swapName) {
                        iconName = require('@assets/TabSwap.png');
                    } else if (rn === walletName) {
                        iconName = require('@assets/TabWallet.png');
                    }

                    // You can return any component that you like here!
                    return (
                        <Image
                            source={iconName}
                            resizeMode="contain"
                            style={
                                styles.imageIconStyle(color)
                            }></Image>
                    );
                },
                tabBarStyle: { height: theme.sizes.bottomTabHeight, padding: 10 },
                tabBarActiveTintColor: '#9957E5',
                tabBarInactiveTintColor: '#7A728A',
                tabBarPosition: 'bottom',
                tabBarLabelStyle: { fontSize: 10 ,paddingBottom:theme.sizes.paddingBottomTabLabel},
                tabBarHideOnKeyboard: true,
            })}

        // tabBarOptions={{
        //   activeTintColor: '#9957E5',
        //   inactiveTintColor: '#7A728A',
        //   labelStyle: { paddingBottom: 20, fontSize: 10 },
        //   style: { padding: 10 }
        // }}
        >
            <Tab.Screen
                name={homeName}
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            <Tab.Screen
                name={swapName}
                component={SwapScreen}
                options={{ headerShown: false }}
            />
            <Tab.Screen
                name={walletName}
                component={WalletStackNavigator}
                options={{ headerShown: false }}
            />
        </Tab.Navigator>
    );
}

export default MainContainer;

const styles = StyleSheet.create({
    imageIconStyle: color => ({
        tintColor: color,
        width: 20,
        height: 20,
        marginVertical: 10,
    }),
})