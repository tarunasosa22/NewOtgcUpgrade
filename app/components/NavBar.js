import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import styles from '../screens/styles';
import * as Utils from '../lib/utils';

export default class NavBarScreen extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={ localStyle.container }>
                <Text style={ localStyle.text }>{this.props.title}</Text>
            </View>
        );
    }
}

const localStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#36d965',
    },
    text: {
        letterSpacing: 2,
        color: 'white',
        fontFamily: 'Roboto-BoldCondensed',
    },
});
