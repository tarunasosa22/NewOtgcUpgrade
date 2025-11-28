import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Utils from '../lib/utils';

export default class ListEmptyComponent extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={ style.container }>
                <Text style={ style.text }>
                    { this.props.message || 'No Data Found' }
                </Text>
            </View>
        );
    }
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        marginTop: Utils.verticalScale(200),
        textAlign: 'center',
        fontFamily: 'Roboto-BoldCondensed',
        fontSize: Utils.scale(16),
    },
});
