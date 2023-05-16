import * as React from 'react';
import SplashScreen from '../SplashScreen';
import OnBoarding from '../OnBoarding/index';
import OnBoardComplete from '../OnBoarding/OnBoardComplete';
import UnableToRecover from '../OnBoarding/UnableToRecover';
import GooglePermissionDenied from '../OnBoarding/GooglePermissionDenied';
import WalletDashboard from '../dashboard/WalletDashboard';
import MainContainer from '../Tabbar/MainContainer';
import CryptoDetails from '../Tabbar/Wallet/CryptoDetails';
import Send from '../Tabbar/Wallet/send/Send';
import SwapPreview from '../Tabbar/Swap/SwapPreview';
import WalletQrcode from '../Tabbar/QRCode/WalletQrcode';
import QrScanner from '@components/QrScanner';
import Setting from '../Tabbar/Home/Settings/Setting';
import SecuritySetting from '../Tabbar/Home/Settings/SecuritySetting';
import SetUpPIN from '../Tabbar/Home/Settings/SetUpPIN';
import BackUpStatus from '../Tabbar/Home/Settings/BackUpStatus';
import LockScreen from '../Tabbar/Home/Settings/LockScreen';
import Disablelock from '../Tabbar/Home/Settings/Disablelock';
import WelcomeLoader from '../OnBoarding/welcome/WelcomeLoader';
import WelcomeToMe3 from '../OnBoarding/welcome/WelcomeToMe3';
import OnBoardPasscode from '../OnBoarding/passcodes/OnBoardPasscode';
import PasscodeSuccess from '../OnBoarding/passcodes/PasscodeSuccess';
import { enableScreens } from 'react-native-screens';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
import EnableBioMetric from '../Tabbar/Home/Settings/EnableBioMetric';
import ChangePassword from '../Tabbar/Home/Settings/ChangePassword';
import AlchemyPay from '../Alchemy/AlchemyPay';
import AlchemyRamp from '../Alchemy/AlchemyRamp';
import AddressBook from '../Tabbar/Home/Settings/AddressBook/AddressBook';
import HistoryDetail from '../Tabbar/Wallet/history/HistoryDetail';
import FAQ from '../Tabbar/Home/Settings/FAQ/FAQ';
import Swap from '../Tabbar/Swap/Swap';
enableScreens();
const Stack = createSharedElementStackNavigator();

const forFade = ({ current }) => ({
    cardStyle: {
        opacity: current.progress,
    },
});
function MainStackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: forFade,
            }}
            initialRouteName="SplashScreen">
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="OnBoarding" component={OnBoarding} />
            <Stack.Screen name="OnBoardComplete" component={OnBoardComplete} />
            <Stack.Screen name="UnableToRecover" component={UnableToRecover} />
            <Stack.Screen
                name="GooglePermissionDenied"
                component={GooglePermissionDenied}
            />
            <Stack.Screen name="WalletDashboard" component={WalletDashboard} />
            <Stack.Screen name="MainContainer" component={MainContainer} />
            <Stack.Screen name="CryptoDetails" component={CryptoDetails} />
            <Stack.Screen name="Send" component={Send} />
            <Stack.Screen name="SwapPreview" component={SwapPreview} />
            <Stack.Screen name="Swap" component={Swap} />
            {/* <Stack.Screen name="NftDetail" component={NftDetail} /> */}
            {/* <Stack.Screen name="SendNFT" component={SendNFT} /> */}
            <Stack.Screen name="WalletQrcode" component={WalletQrcode} />
            <Stack.Screen name="QrScanner" component={QrScanner} />
            <Stack.Screen name="Setting" component={Setting} />
            <Stack.Screen name="SecuritySetting" component={SecuritySetting} />
            <Stack.Screen name="SetUpPIN" component={SetUpPIN} />
            <Stack.Screen name="EnableBioMetric" component={EnableBioMetric} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />
            <Stack.Screen name="BackUpStatus" component={BackUpStatus} />
            <Stack.Screen name="LockScreen" component={LockScreen} />
            <Stack.Screen name="Disablelock" component={Disablelock} />
            <Stack.Screen name="WelcomeLoader" component={WelcomeLoader} />
            <Stack.Screen name="WelcomeToMe3" component={WelcomeToMe3} />
            <Stack.Screen name="PasscodeSuccess" component={PasscodeSuccess} />
            <Stack.Screen name="OnBoardPasscode" component={OnBoardPasscode} />
            <Stack.Screen name="AlchemyPay" component={AlchemyPay} />
            <Stack.Screen name="AlchemyRamp" component={AlchemyRamp} />
            <Stack.Screen name="AddressBook" component={AddressBook} />
            <Stack.Screen name="HistoryDetail" component={HistoryDetail} />
            <Stack.Screen name="FAQ" component={FAQ} />
        </Stack.Navigator>
    );
}

export default MainStackNavigator;
