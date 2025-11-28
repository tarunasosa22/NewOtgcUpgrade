import React, {Component} from 'react';
import {
  StyleSheet,
  Platform,
  View,
  Image,
  Modal,
  SafeAreaView,
} from 'react-native';
import styles from '../screens/styles';
import * as Utils from '../lib/utils';
import Images from '../assets/images/index';
import BlueButton from '../components/button/BlueButton';

export default class CustomAlert extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    <Modal
      transparent={true}
      animationType={'fade'}
      visible={this.props.visible}
      onRequestClose={this.props.onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.contentWrapper}>
          <ActivityIndicator animating={loading} size="large" color="#0000ff" />
          <BlueButton
            onPress={this.props.onClose}
            buttonText={this.props.buttonText}
          />
        </View>
      </View>
    </Modal>;
  }
}

const style = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040',
  },
  contentWrapper: {
    backgroundColor: '#FFFFFF',
    height: 100,
    width: 100,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
