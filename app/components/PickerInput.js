import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
} from 'react-native';
import {Dropdown} from 'react-native-material-dropdown-v2';
import styles from '../screens/styles';
import * as Utils from '../lib/utils';

export default class PickerInput extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={style.container}>
        {this.props.label && (
          <Text style={[style.text, style.label]}>{this.props.label}</Text>
        )}
        <Dropdown
          data={this.props.data}
          fontSize={Utils.moderateScale(14, 0.5)}
          labelFontSize={Utils.moderateScale(12)}
          baseColor="#b1b6bb"
          textColor="#17114f"
          lineWidth={2}
          value={this.props.value}
          disabledLineType="solid"
          fontFamily="Poppins-Regular"
          onFocus={
            typeof this.props.onFocus === 'function' ? this.props.onFocus : null
          }
          onChangeText={this.props.onChange}
          pickerStyle={{width: Utils.scale(160)}}
          containerStyle={{marginTop: -35}}
          disabled={this.props.disabled}
          valueExtractor={item => item.id}
          labelExtractor={item => item.name}
          style={{marginTop: 10}}
        />
        <Text
          style={[
            styles.errorText,
            {paddingTop: 0, marginBottom: Utils.moderateScale(5)},
          ]}>
          {this.props.error}
        </Text>
      </View>
    );
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontFamily: 'Poppins-Regular',
  },
  label: {
    color: '#b1b6bb',
    fontSize: Utils.moderateScale(12),
    letterSpacing: 1,
    marginBottom: 5,
  },
});
