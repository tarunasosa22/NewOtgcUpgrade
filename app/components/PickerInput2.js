import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import styles from '../screens/styles';
import * as Utils from '../lib/utils';
import {Picker} from '@react-native-picker/picker';

export default class PickerIn1put2 extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={style.container}>
        {this.props?.label && (
          <Text style={[style.text, style.label]}>{this.props?.label}</Text>
        )}
        {/* {OLD CODE} */}
        {/* <RNPickerSelect
          value={this.props?.value}
          items={[
            {label: this.props?.labelValue, value: this.props?.value},
            // {label: 'Baseball', value: 'baseball'},
            // {label: 'Hockey', value: 'hockey'},
          ]}
          onValueChange={this.props?.onChange}
          // disabled={this.props?.disabled}
          itemKey={item => item.id}
          style={pickerSelectStyles || this.props.style}
          onDonePress={this.props.donePress}
        /> */}

        {/* {NEW CODE} */}
        <Picker
          onValueChange={this.props?.onChange}
          // disabled={this.props?.disabled}
          selectedValue={this.props.value}
          itemKey={item => item.id}
          style={pickerSelectStyles || this.props.style}
          onDonePress={this.props.donePress}>
          <Picker.Item
            value={this.props?.value}
            label={this.props?.labelValue}
          />
        </Picker>
        {/* <Dropdown
          data={this.props?.data}
          fontSize={Utils.moderateScale(14, 0.5)}
          labelFontSize={Utils.moderateScale(12)}
          baseColor="#b1b6bb"
          textColor="#17114f"
          lineWidth={2}
          value={this.props?.value}
          disabledLineType="solid"
          fontFamily="Poppins-Regular"
          onFocus={
            typeof this.props?.onFocus === 'function'
              ? this.props?.onFocus
              : null
          }
          onChangeText={this.props?.onChange}
          pickerStyle={{width: Utils.scale(160)}}
          containerStyle={{marginTop: -35}}
          disabled={this.props?.disabled}
          valueExtractor={item => item.id}
          labelExtractor={item => item.name}
        /> */}
        <Text
          style={[
            styles.errorText,
            {paddingTop: 0, marginBottom: Utils.moderateScale(5)},
          ]}>
          {this.props?.error}
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

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    color: 'black',
    height: 50,
    backgroundColor: 'white',
    paddingRight: 30,
    paddingLeft: 10, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderWidth: 5,
    borderColor: 'red',
    borderRadius: 8,
    color: 'black',
    backgroundColor: '#dedede',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
