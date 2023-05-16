import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import React from 'react';
import { theme } from '@constants';

export default function Progress() {
    return (
        <Modal onRequestClose={() => {}} transparent={true}>
            <View style={styles.contain}>
                <View>
                    <ActivityIndicator
                        size="large"
                        color={theme.colors.purple_dark}></ActivityIndicator>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    contain: {
        backgroundColor: theme.colors.black_opacity40,
        flex: 1,
        justifyContent: 'space-around',
    },
});

/*** the below code is to be used when the progress is displayed and the whole screen is moved and to resolve this issue
 * 
 * // export default function Progress({}) {
//   return (

//     // <Modal
//     //   onRequestClose={() => {
//     //   }}
//     //   animationType={'fade'}
//     //   transparent={true}>
//       <View style={styles.contain}>
//         <StatusBar
//           animated={false}
//           backgroundColor={theme.colors.white}
//           barStyle={'dark-content'}
//         />
//         <View style={{justifyContent: 'center',alignItems: 'center',flex:1}}>

//           <ActivityIndicator
//             size="large"
//             color={theme.colors.purple_dark}></ActivityIndicator>
//             </View>
//       </View>
//     // </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   contain: {
//     height:Height,
//     width:Width,
//     backgroundColor: 'rgba(0,0,0, 0.4)',
//     position:'absolute',
//     zIndex:10000,
//   },
// });

 * 
 * 
 * 
 * 
 * ****/
