import React, { Component } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform, Modal, Text } from 'react-native';
import * as Utils from '../lib/utils';

export default class LoaderFullScreen extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            this.props.loading &&
            <Modal
                transparent={true}
                animationType={'fade'}
                visible={this.props.loading}
                onRequestClose={() => {}}>
                <View style={style.modalBackground}>
                    <View style={[ style.activityIndicatorWrapper, this.props.message &&  style.activityIndicatorWrapperWidthHeight ]}>
                        {
                            this.props.message && this.props.message.length > 0 ?
                            <Text style={ style.message }>
                                {this.props.message}
                            </Text> : null
                        }
                        <ActivityIndicator animating={this.props.loading} size="large" color="#0000ff" />
                    </View>
                </View>
            </Modal>
        );
    }
}

const style = StyleSheet.create({
    modalBackground: {
        flex: 1,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(150, 200, 200, 0.4)',//'rgba(23, 17, 81, 0.4)',
        zIndex: 100,
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        height: Utils.moderateScale(100),
        width: Utils.moderateScale(100),
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    activityIndicatorWrapperWidthHeight: {
        height: Utils.moderateScale(110),
        width: Utils.moderateScale(225),
    },
    message: {
        fontFamily: 'Poppins-Regular',
        fontSize: Utils.moderateScale(14),
    },
});
