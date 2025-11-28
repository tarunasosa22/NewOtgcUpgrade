import React, {Component} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
// import { SafeAreaView } from 'react-navigation';
import styles from './styles';
import * as Utils from '../lib/utils';

export default class LoginNavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focusedElement: this.props?.initFocusedElement,
    };
  }

  render() {
    return (
      <SafeAreaView style={localStyle.container}>
        <TouchableOpacity
          style={localStyle.loginConainter}
          onPress={() => {
            this.setState({focusedElement: 'login'});
            this.props?.onLoginButtonTap();
          }}>
          <Text
            style={[
              localStyle.text,
              this.state.focusedElement === 'login'
                ? localStyle.focusedText
                : localStyle.blurredText,
            ]}>
            LOGIN
          </Text>
          <View
            style={[
              localStyle.underline,
              this.state.focusedElement === 'login'
                ? localStyle.underlineFocused
                : localStyle.underlineBlurred,
            ]}></View>
        </TouchableOpacity>
        <TouchableOpacity
          style={localStyle.signupContainer}
          onPress={() => {
            this.setState({focusedElement: 'signup'});
            this.props?.onSignupButtonTap();
          }}>
          <Text
            style={[
              localStyle.text,
              this.state.focusedElement === 'signup'
                ? localStyle.focusedText
                : localStyle.blurredText,
            ]}>
            SIGNUP
          </Text>
          <View
            style={[
              localStyle.underline,
              this.state.focusedElement === 'signup'
                ? localStyle.underlineFocused
                : localStyle.underlineBlurred,
            ]}></View>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

const localStyle = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
  },
  loginConainter: {
    flex: 1,
  },
  signupContainer: {
    flex: 1,
  },
  focusedText: {
    color: 'white',
    fontFamily: 'Roboto-BoldCondensed',
    ...Platform.select({
      android: {
        fontWeight: '500',
      },
    }),
  },
  blurredText: {
    color: '#adb5d1',
    fontFamily: 'Poppins-Regular',
  },
  text: {
    letterSpacing: 2,
    textAlign: 'center',
    fontSize: Utils.moderateScale(14, 0.5),
  },
  underline: {
    marginTop: 5,
    width: Utils.moderateScale(50, 0.5),
    alignSelf: 'center',
    borderBottomWidth: 1,
  },
  underlineFocused: {
    borderBottomColor: 'white',
  },
  underlineBlurred: {
    borderBottomColor: 'transparent',
  },
});
