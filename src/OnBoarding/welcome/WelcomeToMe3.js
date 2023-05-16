import { View, StyleSheet, Image, StatusBar, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors } from '@constants/theme';
import string from '@constants/ConstantStrings';
import MessageComponent from './MessageComponent';
const WelcomeToMe3 = ({ navigation, route }) => {
    const [refresh, setRefresh] = useState(false);
    const [refresh1, setRefresh1] = useState(false);
    const [refresh2, setRefresh2] = useState(false);
    const [refresh3, setRefresh3] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [data, setData] = useState([]);
    function onStart(type) {
        const obj1 = {
            id: 1,
            type: 0,
            message: string.WELCOME_TO_ME3,
            imageSource: require('@assets/partyPopperEmoji.png'),
            passcodeStatus: true,
        };
        data.push(obj1);

        setRefresh(!refresh);
        setTimeout(() => {
            const obj = {
                id: 2,
                type: 2,
                message:
                    type == 'backup'
                        ? string.WE_ARE_GENERATING_WALLET
                        : string.WE_ARE_RECOVERING_WALLET,
                imageSource: null,
            };
            data.push(obj);
            setRefresh1(!refresh1);
        }, 1500);
        setTimeout(() => {
            const obj = {
                id: 3,
                type: 1,
                message: string.SETUP_YOUR_PASSCODE,
                imageSource: require('@assets/lockEmoji.png'),
            };
            data.push(obj);
            setRefresh2(!refresh2);
        }, 3000);
        setTimeout(() => {
            const obj = {
                id: 4,
                type: 4,
                message: null,
                imageSource: null,
            };
            data.push(obj);
            setRefresh3(!refresh3);
        }, 4500);
    }

    useEffect(() => {
        let type = route.params.type;
        onStart(type);
    }, []);

    const renderItem = ({ item, index }) => {
        return (
            <MessageComponent
                Data={data}
                item={item}
                index={index}
                navigation={navigation}
            />
        );
    };
    return (
        <View style={styles.mainContainer}>
            <StatusBar
                animated={true}
                backgroundColor={colors.mainColor}
                barStyle={'light-content'}
            />
            <View style={styles.me3LogoContainerStyle}>
                <Image
                    source={require('@assets/me3logo.png')}
                    resizeMode={'contain'}
                    style={styles.me3logo}
                />
                <Image
                    source={require('@assets/onboard__noBackground.png')}
                    resizeMode={'contain'}
                    style={styles.onboard_one}
                />
            </View>
            <View style={styles.listContainerStyle}>
                {data == [] || data == null || data == undefined ? null : (
                    <FlatList
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index}
                    />
                )}
            </View>
        </View>
    );
};

export default WelcomeToMe3;
const styles = StyleSheet.create({
    listContainerStyle: { marginBottom: 36, marginHorizontal: 24 },
    mainContainer: {
        backgroundColor: colors.mainColor,
        flex: 1,
    },
    me3LogoContainerStyle: {
        flex: 1,
        marginHorizontal: 24
    },
    me3logo: {
        height: 25,
        marginTop: 93 - StatusBar.currentHeight,
        width: 126,
    },
    onboard_one: {
        alignSelf: 'center',
        height: 310,
        marginTop: 46,
        width: 296,
    },
});
