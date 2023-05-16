import {
    View,
    Text,
    StyleSheet,
    Platform,
    Image,
    TextInput,
    SectionList,
    SafeAreaView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenTopHeader from '@components/ScreenTopHeader';
import {
    colors,
    fonts,
    sizes,
    calculateHeight,
    calculateWidth,
} from '@constants/theme';
import { getKeyboardType } from '@constants/commonFuncation';
import _ from 'lodash';
import CustomCollapse from './CustomCollapse';
import ConstantStrings from '@constants/ConstantStrings';
import { getFaqList } from '@redux/Action/FaqAction';
import { useDispatch, useSelector } from 'react-redux';
import Progress from '@components/Progress';
import EmptyFaq from './EmptyFaq';

const FAQ = ({ navigation }) => {
    const dispatch = useDispatch();
    const FaqReducer = useSelector(state => state.FaqReducer);
    const [searchText, setSearchText] = useState('');
    const [refresh, setRefresh] = useState(false);
    const [data, setData] = useState('');

    useEffect(() => {
        getFaqList(dispatch);
    }, []);

    useEffect(() => {
        if (FaqReducer && FaqReducer.faqList && FaqReducer.faqList != []) {
            const newData = FaqReducer.faqList.map(i => ({
                ...i,
                isOpen: false,
            }));
            if (searchText.length != 0) {
                const temp = newData.filter(item => {
                    return item.title
                        .toLowerCase()
                        .includes(searchText.toLowerCase());
                });
                const newformatedData = _.chain(temp)
                    .groupBy('description')
                    .map((value, key) => ({ title: key, data: value }))
                    .value();
                setData(newformatedData);
            } else {
                const newformatedData = _.chain(newData)
                    .groupBy('description')
                    .map((value, key) => ({ title: key, data: value }))
                    .value();
                setData(newformatedData);
            }
        } else {
            setData([]);
        }
    }, [searchText.length, FaqReducer.faqList && FaqReducer.faqList.length]);

    const topBackClick = () => {
        navigation.goBack();
    };

    const renderItem = ({ item }) => {
        return (
            <CustomCollapse
                onToggleFunction={() => {
                    !item.isOpen ? (item.isOpen = true) : (item.isOpen = false);
                    setRefresh(!refresh);
                }}
                isOpen={!item.isOpen}
                titleText={item.title}
                bodyDescription={item.details}
            />
        );
    };

    const getImageSource = title => {
        if (title.toLowerCase() == ConstantStrings.GENERAL.toLowerCase()) {
            return require('assets/faq_msg.png');
        } else if (
            title.toLowerCase() == ConstantStrings.ACCOUNT.toLowerCase()
        ) {
            return require('assets/faq_acc.png');
        } else if (
            title.toLowerCase() ==
            ConstantStrings.WALLET_FUNCTIONS.toLowerCase()
        ) {
            return require('assets/faq_walletfunctions.png');
        } else {
            return require('assets/faq_walletconnect.png');
        }
    };

    return (
        <SafeAreaView style={styles.parentView}>
            {FaqReducer.loading && <Progress />}
            <View style={styles.marginHorizontal_20}>
                <ScreenTopHeader
                    title={ConstantStrings.FAQ_FULL}
                    topBackClick={topBackClick}
                    showBack={true}
                />
                <View style={styles.searchView}>
                    <Image
                        source={require('@assets/search.png')}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        onChangeText={text => {
                            setSearchText(text);
                        }}
                        style={styles.searchTokenTextInput}
                        placeholderTextColor={colors.gray1_textcolor}
                        placeholder={ConstantStrings.SEARCH_QUESTIONS_KEYWORDS}
                        selectionColor={colors.gray1_textcolor}
                        keyboardType={getKeyboardType()}
                        autoCorrect={false}
                        spellCheck={false}
                        autoComplete={'off'}
                    />
                </View>

                <SectionList
                    sections={data}
                    stickySectionHeadersEnabled={false}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={EmptyFaq}
                    renderItem={renderItem}
                    renderSectionHeader={({ section }) => (
                        <View style={styles.sectionHeader}>
                            <Image
                                source={getImageSource(section.title)}
                                style={styles.sectionTitleImage}
                                resizeMode={'contain'}
                            />
                            <Text style={styles.sectionTitleText}>
                                {section.title}
                            </Text>
                        </View>
                    )}
                    style={{ marginBottom: calculateHeight(120) }}
                    keyExtractor={(item, index) => index}
                />
            </View>
        </SafeAreaView>
    );
};

export default FAQ;
const styles = StyleSheet.create({
    marginHorizontal_20: {
        marginHorizontal: calculateWidth(20),
    },
    parentView: {
        backgroundColor: colors.white,
        flex: 1,
    },
    searchIcon: {
        borderRadius: 22 / 2,
        height: calculateHeight(22),
        tintColor: colors.menuDotsTint,
        width: calculateHeight(22),
    },
    searchTokenTextInput: {
        color: colors.gray_textcolor,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        marginLeft: 8,
        paddingVertical: Platform.OS === 'ios' ? sizes.mvp8 : 4,
    },
    searchView: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderColor: colors.gray_background_1,
        borderRadius: 20,
        borderWidth: 1,
        flexDirection: 'row',
        paddingHorizontal: 12,
    },
    sectionHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: calculateHeight(12),
    },
    sectionTitleImage: {
        height: calculateHeight(15),
        marginRight: calculateWidth(8),
        tintColor: colors.purple_button_color,
        width: calculateHeight(15),
    },
    sectionTitleText: {
        color: colors.purple_button_color,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
    },
});
