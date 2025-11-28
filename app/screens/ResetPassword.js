import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Keyboard,
  Text,
  ScrollView,
  SafeAreaView,
} from 'react-native';
// import {SafeAreaView, StackActions, NavigationActions} from 'react-navigation';
import styles from './styles';
import Images from '../assets/images/index';
import * as Utils from '../lib/utils';
import Input from '../components/Input';
import BlueButton from '../components/button/BlueButton';
import LoaderFullScreen from '../components/LoaderFullScreen';
import LinearGradient from 'react-native-linear-gradient';

export default class ResetPasswordScreen extends Component {
  static navigationOptions = {
    title: 'RESET PASSWORD',
  };

  constructor(props) {
    super(props);
    this.state = {
      data: {password: '', confirm_password: ''},
      errors: {password: '', confirm_password: ''},
      loading: false,
      focusedElement: '',
    };
    this._mounted = false;
    this.email = this.props?.route?.params
      ? this.props?.route?.params?.email
      : this.props.navigation.goBack();
    this.otp = this.props?.route?.params
      ? this.props?.route?.params?.otp
      : this.props.navigation.goBack();
    this.inputs = {};
    this.resetPassword = this.resetPassword.bind(this);
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  focusField(key) {
    this.inputs[key] && this.inputs[key].focus();
  }

  resetPassword() {
    let error = false;
    let errors = {};

    if (!this.state.data.password) {
      if (!error) {
        this.focusField('password');
      }
      errors.password = 'Please enter new password';
      error = true;
    } else {
      errors.password = '';
    }
    if (!this.state.data.confirm_password) {
      if (!error) {
        this.focusField('confirm_password');
      }
      errors.confirm_password = 'Please confirm new password';
      error = true;
    } else {
      errors.confirm_password = '';
    }
    if (
      !error &&
      this.state.data.password !== this.state.data.confirm_password
    ) {
      if (!error) {
        this.focusField('confirm_password');
      }
      errors.confirm_password = 'Passwords do not match';
      error = true;
    }

    this.setState({errors: errors});

    if (error) {
      return;
    }

    Keyboard.dismiss();
    this.setState({loading: true});

    Utils.makeApiRequest(
      'reset-password',
      {
        email: this.email,
        password: this.state.data.password,
        otp: this.otp,
      },
      null,
      'POST',
      'auth',
    )
      .then(result => {
        if (this._mounted) {
          this.setState({loading: false});
          if (result.status === false && !result?.message) {
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
          } else if (result.status) {
            Utils.displayAlert(
              'Password Changes Successfully!',
              '',
              'OK',
              null,
              () => {
                this.props.navigation.navigate('LoginSignup');
              },
            );
          } else {
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert('', result.message || 'Invalid Request');
            }
          }
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3b2eb6', '#21e381']}
          style={styles.container}>
          <ScrollView
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            keyboardShouldPersistTaps="handled">
            <LoaderFullScreen loading={this.state.loading} />
            <View style={[styles.card, localStyle.card]}>
              <View style={localStyle.content}>
                <View style={localStyle.newPasswordContainer}>
                  <Input
                    label="NEW PASSWORD"
                    secureTextEntry={true}
                    returnKeyType="next"
                    autoCorrect={false}
                    containerStyle={{marginBottom: Utils.scale(5)}}
                    autoCapitalize="none"
                    refCallback={ref => (this.inputs.password = ref)}
                    error={this.state.errors.password}
                    value={this.state.data.password}
                    focusElement={() => this.focusField('password')}
                    onSubmitEditing={() => this.focusField('confirm_password')}
                    onChangeText={password => {
                      this.state.errors.password = '';
                      this.state.data.password = password;
                      this.setState({
                        data: this.state.data,
                        errors: this.state.errors,
                      });
                    }}
                  />
                </View>
                <View style={localStyle.confirmPasswordContainer}>
                  <Input
                    label="CONFIRM PASSWORD"
                    secureTextEntry={true}
                    returnKeyType="done"
                    autoCorrect={false}
                    containerStyle={{marginBottom: Utils.scale(5)}}
                    autoCapitalize="none"
                    refCallback={ref => (this.inputs.confirm_password = ref)}
                    error={this.state.errors.confirm_password}
                    value={this.state.data.confirm_password}
                    focusElement={() => this.focusField('confirm_password')}
                    onChangeText={confirm_password => {
                      this.state.errors.confirm_password = '';
                      this.state.data.confirm_password = confirm_password;
                      this.setState({
                        data: this.state.data,
                        errors: this.state.errors,
                      });
                    }}
                  />
                </View>
              </View>
            </View>
            <View style={localStyle.submitButtonContainer}>
              <BlueButton
                onPress={this.resetPassword}
                buttonText="SUBMIT"
                style={localStyle.submitButton}
              />
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }
}

const localStyle = StyleSheet.create({
  card: {
    width: '90%',
    marginTop: Utils.moderateScale(40, 0.5),
    alignSelf: 'center',
  },
  content: {
    width: '85%',
    alignSelf: 'center',
    marginBottom: Utils.moderateScale(10, 0.5),
  },
  newPasswordContainer: {
    marginTop: Utils.moderateScale(22, 0.5),
  },
  confirmPasswordContainer: {
    marginTop: Utils.moderateScale(10, 0.5),
  },
  submitButtonContainer: {
    alignItems: 'center',
    marginTop: Utils.moderateScale(40, 0.5),
    width: '90%',
    alignSelf: 'center',
  },
});
