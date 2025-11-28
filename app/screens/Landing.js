import React, { Component } from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import styles from './styles';
import * as Utils from '../lib/utils';
import Images from '../assets/images/index';
import BlueButton from '../components/button/BlueButton';
import WhiteButton from '../components/button/WhiteButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connect } from 'react-redux';
import { ActionCreators } from '../actions';

class LandingScreen extends Component {
  constructor(props) {
    super(props);
    this.navToLoginSignup = this.navToLoginSignup.bind(this);
  }

  static navigationOptions = {
    headerStyle: {
      borderBottomWidth: 0,
    },
    headerTransparent: true,
  };

  navToLoginSignup = buttonType => {
    AsyncStorage.clear();
    this.props.clearScheduleOrderData();
    this.props.logout()
    this.props.navigation.navigate('LoginSignup', { viewType: buttonType });
  };

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={Images.landingImage}
          style={styles.imageBackground}>
          <View style={localStyle.placeholder}></View>
          <View style={localStyle.buttonContainer}>
            <WhiteButton
              onPress={() => {
                this.navToLoginSignup('login');
              }}
              style={localStyle.whiteButton}
              buttonText="LOGIN"
            />
            <BlueButton
              onPress={() => this.navToLoginSignup('signup')}
              style={localStyle.blueButton}
              buttonText="SIGNUP"
            />
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    appData: state.appData.appData,
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    clearScheduleOrderData: data =>
      dispatch(ActionCreators.clearScheduleOrderData(data)),
    logout: data =>
      dispatch(ActionCreators.logout()),
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LandingScreen);


const localStyle = StyleSheet.create({
  buttonContainer: {
    flex: 1.1,
    alignItems: 'center',
  },
  placeholder: {
    flex: 4,
  },
  whiteButton: {
    marginBottom: Utils.moderateScale(10),
    width: '80%',
  },
  blueButton: {
    width: '80%',
  },
});
