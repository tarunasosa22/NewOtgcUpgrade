import React, {Component} from 'react';
import {StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import * as Utils from '../lib/utils';

export default class RadioButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeButton: props.default,
    };
  }

  // UNSAFE_componentWillReceiveProps(props) {
  //   let defaultProps = props.default;
  //   if (this.activeButton != defaultProps) {
  //     this.setState({activeButton: defaultProps});
  //   }
  // }

  static getDerivedStateFromProps(props, state) {
    let defaultProps = props.default;
    if (this.activeButton != defaultProps) {
      return {
        activeButton: defaultProps,
      };
    }

    // Return null to indicate no change to state.
    return null;
  }

  render() {
    return (
      <View style={style.container}>
        <TouchableOpacity
          onPress={() => {
            if (!this.props.disabled) {
              this.setState({activeButton: 0});
              this.props.onPress(this.props.data[0].value);
            }
          }}
          style={style.button}
          hitSlop={{
            top: Utils.moderateScale(10),
            left: 0,
            bottom: Utils.moderateScale(10),
            right: 0,
          }}>
          <View
            style={
              this.props.disabled
                ? this.state.activeButton == 0
                  ? style.disabledActiveRadio
                  : style.inactiveRadio
                : this.state.activeButton === 0
                ? style.activeRadio
                : style.inactiveRadio
            }
          />
          <Text
            style={
              this.props.disabled
                ? style.inactiveText
                : this.state.activeButton === 0
                ? style.activeText
                : style.inactiveText
            }>
            {this.props.data[0].label}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (!this.props.disabled) {
              this.setState({activeButton: 1});
              this.props.onPress(this.props.data[1].value);
            }
          }}
          style={[style.button, style.secondButton]}
          hitSlop={{
            top: Utils.moderateScale(10),
            left: 0,
            bottom: Utils.moderateScale(10),
            right: 0,
          }}>
          <View
            style={
              this.props.disabled
                ? this.state.activeButton == 1
                  ? style.disabledActiveRadio
                  : style.inactiveRadio
                : this.state.activeButton === 1
                ? style.activeRadio
                : style.inactiveRadio
            }
          />
          <Text
            style={
              this.props.disabled
                ? style.inactiveText
                : this.state.activeButton === 1
                ? style.activeText
                : style.inactiveText
            }>
            {this.props.data[1].label}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondButton: {
    marginLeft: Utils.moderateScale(15),
  },
  disabledActiveRadio: {
    backgroundColor: '#b1b6bb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b1b6bb',
    width: Utils.moderateScale(14),
    height: Utils.moderateScale(14),
    marginRight: Utils.moderateScale(10),
  },
  activeRadio: {
    backgroundColor: '#171151',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#171151',
    width: Utils.moderateScale(14),
    height: Utils.moderateScale(14),
    marginRight: Utils.moderateScale(10),
  },
  inactiveRadio: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#b1b6bb',
    width: Utils.moderateScale(14),
    height: Utils.moderateScale(14),
    marginRight: Utils.moderateScale(10),
  },
  activeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(13),
    color: '#171151',
  },
  inactiveText: {
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(13),
    color: '#b1b6bb',
  },
});
