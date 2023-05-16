import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors, fonts, sizes, calculateHeight } from '@constants/theme';
import { theme } from '@constants';
import CheckBox from '@react-native-community/checkbox';
import { saveKeyValueData } from '@constants/Storage';
import { DISPLAY_CHAIN_LIST } from '@constants/ConstStorage';
import ManageChainPopUp from './ManageChainPopUp';
import CustomImage from '@components/CustomImage';
import { useDispatch } from 'react-redux';
import { showWarnToast } from '@redux/Action/ToastAlert';
import CSwitch from '@components/CSwitch';
import { filterChains } from '@constants/commonFuncation';
import ConstantStrings from '@constants/ConstantStrings';
const ManageChain = ({ setShowManageChain, chainData, Refresh, setRefresh }) => {
    const dispatch = useDispatch();
    const [selectAll, setSelectAll] = useState(false);
    const [showManageChainPopUp, setShowManageChainPopUp] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [currentData, setCurrentData] = useState(null)
    useEffect(() => {
        let count = 0;
        // this filter is added to get list of chains based on Show Testnet setting from Setting Screen
        filterChains(chainData).then(data => {
            const toBeSortedArray = data;
            toBeSortedArray.sort((a, b) => {
                return (a.mainChainInfo.symbol > b.mainChainInfo.symbol) ? 1 : -1
            });

            setCurrentData(toBeSortedArray)

            toBeSortedArray.map(item => {
                if (item.show) {
                    count++;
                } else {
                    count--;
                }
            });
            if (count == toBeSortedArray.length) {
                setSelectAll(true);
            }
        })
    }, []);


    function checkForSelectAllIconChange(datalist) {
        let count = 0;
        datalist.map(item => {
            if (item.show) {
                count++;
            } else {
                count--;
            }
        });
        setSelectAll(count == datalist.length);
    }
    const selectAllProccess = value => {
        if (value) {
            currentData.map(item => {
                if (item.isDisable) {
                    item.show = false;
                } else {
                    item.show = true;
                }
            });
            setLoaded(!loaded);
        } else {
            currentData.map(item => {
                item.show = false;
            });
            setLoaded(!loaded);
        }
    };

    async function buttonSaveClickEvent() {
        saveKeyValueData(DISPLAY_CHAIN_LIST, JSON.stringify(chainData));
        setShowManageChain(false);
        setRefresh(!Refresh);
    }
    const renderItem = item => {
        let url = item.item.mainChainInfo.symbolIcon;
        return (
            <View
                style={styles.flexAlignItemStyle}>
                <View style={styles.iconView}>
                    <CustomImage imageUrl={url} />
                </View>
                <Text
                    style={[
                        styles.chainTitles,
                        {
                            color: !item.item.show
                                ? colors.gray_text
                                : colors.menuDotsTint,
                        },
                    ]}>
                    {item.item.mainChainInfo.description.trim()}
                </Text>
                <View>
                    <CSwitch
                        // disabled={item.item.isDisable}
                        value={
                            item.item.show == null
                                ? true
                                : item.item.show
                        }
                        onValueChange={value => {
                            if (item.item.isDisable) {
                                showWarnToast(
                                    dispatch,
                                    'This chain is not available at the moment',
                                );
                                return;
                            } else {
                                item.item.show = value;
                            }
                            checkForSelectAllIconChange(currentData)
                            setLoaded(!loaded);
                        }}
                        condition={item.item.show}
                    />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.mainView}>
            {showManageChainPopUp && (
                <ManageChainPopUp
                    setshowManageChainPopUp={setShowManageChainPopUp}
                />
            )}

            <View
                style={[
                    styles.contain,
                    styles.containerSecondStyle,
                ]}>
                <Text style={styles.displayChain}>{ConstantStrings.DISPLAY_CHAINS}</Text>
                <CheckBox
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    tintColors={{
                        true: theme.colors.purple_dark,
                        false: '#E4E4E4',
                    }}
                    disabled={false}
                    value={selectAll}
                    onValueChange={newValue => {
                        setSelectAll(newValue);
                        selectAllProccess(newValue);
                    }}
                    boxType={'square'}
                    onAnimationType={'bounce'}
                    offAnimationType={'bounce'}
                    onCheckColor={theme.colors.white}
                    onFillColor={theme.colors.purple_dark}
                    onTintColor={theme.colors.purple_dark}
                />
                <Text style={styles.selectAll}>{ConstantStrings.SELECT_ALL_CHAINS}</Text>
                <TouchableOpacity
                    onPress={() => {
                        buttonSaveClickEvent();
                    }}>
                    <View style={styles.btnSave}>
                        <Text style={styles.btnSaveTxt}>{ConstantStrings.SAVE_MANAGECHAINS}</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <FlatList
                data={currentData}
                renderItem={renderItem}
                keyExtractor={(item, index) => index}
                showsVerticalScrollIndicator={false}
                style={{
                    marginBottom: calculateHeight(50),
                }}
            />
        </View>
    );

};

export default ManageChain;

const styles = StyleSheet.create({
    btnSave: {
        alignItems: 'center',
        backgroundColor: colors.purple_button_color,
        borderRadius: 4,
        height: 28,
        justifyContent: 'center',
        marginLeft: 10,
        width: 45,
    },
    btnSaveTxt: {
        color: colors.white,
        fontFamily: theme.fonts.titillium_Regular,
        fontSize: sizes.f12,
    },
    chainTitles: {
        color: colors.menuDotsTint,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f14,
        lineHeight: sizes.lh18,
        marginLeft: 8,
    },

    contain: {
        justifyContent: 'center',
        marginVertical: 6,
        paddingVertical: 4,
    },

    containerSecondStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 2,
    },

    displayChain: {
        color: colors.menuDotsTint,
        flex: 1,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f16,
        lineHeight: sizes.lh20,
    },

    flexAlignItemStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 6,
        paddingVertical:5,
    },

    mainView: {
        backgroundColor: colors.white,
        borderRadius: 8,
        marginBottom: calculateHeight(120),
        marginVertical: 4,
        paddingHorizontal: 16,
    },
    selectAll: {
        color: colors.menuDotsTint,
        fontFamily: fonts.titillium_bold,
        fontSize: sizes.f12,
        lineHeight: sizes.lh14,
    },
});
