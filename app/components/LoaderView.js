import React, { Component } from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import Images from '../assets/images/index';

export default class LoaderView extends Component {

    constructor(props) {
        super(props);
    }
// <Image source={Images.spinner} />
    render() {
        return (
            this.props.loading && <View style={[ style.loading, this.props.style ]}>
                <ActivityIndicator size="large" color="#0000ff" animating={this.props.loading} />
            </View>
        );
    }
}

const style = StyleSheet.create({
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
