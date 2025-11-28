import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import styles from '../screens/styles';
import * as Utils from '../lib/utils';

export default class Input extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
    };
    this.blurInput = this.blurInput.bind(this);
  }

  blurInput() {
    if (this.state.focused) {
      this.setState({focused: false});
    }
  }

  render() {
    return (
      <View style={this.props.containerStyle}>
        <TouchableWithoutFeedback
          onPress={() => {
            typeof this.props.focusElement === 'function' &&
              this.props.editable !== false &&
              this.props.focusElement();
          }}>
          <View>
            <Text style={[style.text, style.label]}>{this.props.label}</Text>
          </View>
        </TouchableWithoutFeedback>
        <TextInput
          style={[
            style.textInput,
            this.props.editable == false && style.textInputDisabled,
          ]}
          underlineColorAndroid="transparent"
          secureTextEntry={
            this.props.secureTextEntry ? this.props.secureTextEntry : false
          }
          ref={
            typeof this.props.refCallback === 'function'
              ? this.props.refCallback
              : () => {}
          }
          returnKeyType={this.props.returnKeyType || 'next'}
          keyboardType={this.props.keyboardType || 'default'}
          blurOnSubmit={this.props.blurOnSubmit == false ? false : true}
          editable={this.props.editable === false ? false : true}
          style={this.props.style}
          maxLength={this.props.maxLength ? this.props.maxLength : undefined}
          autoCapitalize={this.props.autoCapitalize || 'sentences'}
          autoCorrect={this.props.autoCorrect || false}
          onFocus={() => {
            this.setState({focused: true});
            typeof this.props.onFocus === 'function' && this.props.onFocus();
          }}
          onBlur={() => {
            this.setState({focused: false});
          }}
          value={this.props.value}
          onSubmitEditing={
            typeof this.props.onSubmitEditing === 'function'
              ? this.props.onSubmitEditing
              : () => {}
          }
          onKeyPress={
            typeof this.props.onKeyPress === 'function'
              ? this.props.onKeyPress
              : () => {}
          }
          onChangeText={
            typeof this.props.onChangeText === 'function'
              ? this.props.onChangeText
              : () => {}
          }
        />
        <TouchableWithoutFeedback
          onPress={() => {
            typeof this.props.focusElement === 'function' &&
              this.props.editable === true &&
              this.props.focusElement();
          }}>
          <View
            style={[
              style.underline,
              this.props.error
                ? style.textInputError
                : this.state.focused
                ? style.textInputFocused
                : style.textInputBlurred,
            ]}
          />
        </TouchableWithoutFeedback>
        <Text style={[styles.errorText]}>{this.props.error}</Text>
      </View>
    );
  }
}

const style = StyleSheet.create({
  text: {
    fontFamily: 'Poppins-Regular',
  },
  label: {
    color: '#b1b6bb',
    fontSize: Utils.moderateScale(12),
    letterSpacing: 1,
    ...Platform.select({
      ios: {
        marginBottom: Utils.scale(5),
      },
    }),
  },
  underline: {
    ...Platform.select({
      ios: {
        marginTop: 3,
      },
    }),
    borderBottomColor: '#b1b6bb',
    borderBottomWidth: 2,
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
    color: '#17114f',
    fontSize: Utils.moderateScale(14, 0.5),
    ...Platform.select({
      android: {
        paddingVertical: 0,
      },
    }),
  },
  textInputFocused: {
    borderBottomColor: '#17114f',
  },
  textInputBlurred: {
    borderBottomColor: '#b1b6bb',
  },
  textInputError: {
    borderBottomColor: 'red',
  },
  textInputDisabled: {
    color: '#b1b6bb',
  },
});
