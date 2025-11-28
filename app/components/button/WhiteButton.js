import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, Platform} from 'react-native';
import * as Utils from '../../lib/utils';

export default class WhiteButton extends Component {
  render() {
    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        style={[styles.whiteButton, this.props.style]}>
        <Text style={styles.whiteButtonText}>{this.props.buttonText}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  whiteButton: {
    backgroundColor: 'white',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'white',
    height: Utils.moderateVerticalScale(40, 0.5),
    width: '85%',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  whiteButtonText: {
    color: 'black',
    fontFamily: 'Poppins-Regular',
    letterSpacing: 2,
    fontSize: Utils.moderateScale(14),
  },
});
