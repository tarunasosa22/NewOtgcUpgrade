import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import * as Utils from '../../lib/utils';

export default class BlueButton extends Component {

    render() {
        if(this.props.hasOwnProperty('disabled') && this.props.disabled == true){
            return (
                <TouchableOpacity onPress={()=>{Utils.displayAlert('', 'Please place your first order.');}} style={ [styles.blueButton, this.props.style] } >
                    <Text style={ styles.blueButtonText }>
                        {this.props.buttonText}
                    </Text>
                </TouchableOpacity>
            )
        }else{
            return (
                <TouchableOpacity onPress={this.props.onPress} style={ [styles.blueButton, this.props.style] } >
                    <Text style={ styles.blueButtonText }>
                        {this.props.buttonText}
                    </Text>
                </TouchableOpacity>
            )
        }
    }
}

const styles = StyleSheet.create({
    blueButton: {
        backgroundColor: '#1a3163',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#171151',
        height: Utils.moderateVerticalScale(40, 0.5),
        width: "85%",
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#171151',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    blueButtonText: {
        color: 'white',
        fontFamily: 'Poppins-Regular',
        letterSpacing: 2,
        fontSize: Utils.moderateScale(14),
    },
});
