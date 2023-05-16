import React from 'react';
import { colors, NativeBaseModalStyle } from '@constants/theme';
import { Modal } from 'native-base';

/**
 *
 * <CustomModal children={<Render/>} isModalVisible={} closeModal={}/>
 *
 * -----------------------OR-------------------------
 *
 * <CustomModal isModalVisible={} closeModal={}>
 *  <Render/>
 * </CustomModal>
 *
 **/

const CustomModal = ({ isModalVisible, closeModal, children }) => {
    return (
        <Modal
            animationPreset="fade"
            isOpen={isModalVisible}
            onClose={() => {
                closeModal(false);
            }}
            size={'full'}
            background={colors.popupBgcolor}>
            <Modal.Content
                style={NativeBaseModalStyle.setBottomModal}
                p={'3'}
                pt={'4'}
                pb={'6'}>
                <Modal.Body _scrollview={{ bounces: false }}>
                    {children}
                </Modal.Body>
            </Modal.Content>
        </Modal>
    );
};

export default CustomModal;
