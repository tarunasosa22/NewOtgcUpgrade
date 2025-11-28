import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  SafeAreaView,
  Text,
  TextInput,
} from 'react-native';
// import {SafeAreaView} from 'react-navigation';
import styles from './styles';
import Images from '../assets/images/index';
import * as Utils from '../lib/utils';
import BlueButton from '../components/button/BlueButton';
import LoaderFullScreen from '../components/LoaderFullScreen';
import LinearGradient from 'react-native-linear-gradient';
// import Input from '../components/Input';
// import { TextInput } from 'react-native-paper';

export default class OtpScreen extends Component {
  static navigationOptions = {
    title: 'OTP',
  };

  constructor(props) {
    super(props);
    this.state = {
      data: {firstDigit: '', secondDigit: '', thirdDigit: '', fourthDigit: ''},
      errors: {
        firstDigit: false,
        secondDigit: false,
        thirdDigit: false,
        fourthDigit: false,
      },
      focusedElement: '',
      loading: false,
    };
    this._mounted = false;
    this.inputNames = [
      'firstDigit',
      'secondDigit',
      'thirdDigit',
      'fourthDigit',
    ];
    this.email = this.props?.route?.params
      ? this.props?.route?.params?.email
      : this.props.navigation.goBack();
    this.inputs = {};
    this.verifyOtp = this.verifyOtp.bind(this);
    this.resendOtp = this.resendOtp.bind(this);
    this.renderInputs = this.renderInputs.bind(this);
    this.checkAndFocusEmptyTextInput =
      this.checkAndFocusEmptyTextInput.bind(this);
    this.onFocusCallBack = this.onFocusCallBack.bind(this);
    this.onChangeTextCallback = this.onChangeTextCallback.bind(this);
  }

  componentDidMount() {
    this._mounted = true;

    this.inputs['firstDigit']?.focus();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  focusField(key) {
    if (this.inputs[key] && this.inputs[key]._root) {
      this.inputs[key]._root.clear();
      this.inputs[key]._root.focus();
    }
  }

  resendOtp() {
    let d = {};
    for (let i in this.inputNames) {
      d[this.inputNames[i]] = '';
    }
    this.setState({loading: true, data: d});
    Utils.makeApiRequest(
      'forgot-password',
      {email: this.email},
      null,
      'POST',
      'auth',
    )
      .then(result => {
        if (this._mounted) {
          this.setState({loading: false});
          if (result === false && !result?.message) {
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
          } else if (result.status) {
            Utils.displayAlert(
              '',
              'OTP has been successfully sent to ' + this.email + '.',
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

  verifyOtp() {
    if (this.checkAndFocusEmptyTextInput()) {
      return false;
    }

    Keyboard.dismiss();
    this.setState({focusedElement: '', loading: true});

    let otp = '';
    for (let i in this.inputNames) {
      otp += this.state.data[this.inputNames[i]];
    }

    Utils.makeApiRequest(
      'verify-otp',
      {email: this.email, otp: otp},
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
            this.props.navigation.navigate('ResetPassword', {
              email: this.email,
              otp:
                this.state.data.firstDigit +
                this.state.data.secondDigit +
                this.state.data.thirdDigit +
                this.state.data.fourthDigit,
            });
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
  checkAndFocusEmptyTextInput() {
    for (let i in this.inputNames) {
      if (!this.state.data[this.inputNames[i]]) {
        this.inputs[this.inputNames[i]].focus();
        return true;
      }
    }
    return false;
  }

  onFocusCallBack(textInput) {
    this.state.data[textInput] = '';
    this.state.errors[textInput] = false;
    this.setState({
      data: this.state.data,
      errors: this.state.errors,
      focusedElement: textInput,
    });
  }

  async onKeyPressCallBack(textInput, key) {
    if (key == 'Backspace') {
      if (this.state.data[textInput]) {
        this.state.data[textInput] = '';
        await this.setState({data: this.state.data});
      } else {
        let prevTextInput = '';
        for (let i = 1; i <= this.inputNames.length; i++) {
          prevTextInput = this.inputNames[i - 1];
          if (this.inputNames[i] == textInput) {
            break;
          }
        }
        this.focusField(prevTextInput);
      }
    } else {
      this.state.data[textInput] = key;
      await this.setState({data: this.state.data});
      this.verifyOtp();
    }
  }

  onChangeTextCallback(textInput, key) {
    this.state.data[textInput] = key;
    this.setState({data: this.state.data}, () => {
      this.verifyOtp();
    });
  }

  renderInputs() {
    return this.inputNames.map((inputName, index) => {
      return (
        <TextInput
          caretHidden={true}
          key={index}
          // autoFocus
          maxLength={1}
          returnKeyType="next"
          keyboardType="numeric"
          blurOnSubmit={index === this.inputNames.length - 1 ? true : false}
          clearTextOnFocus={true}
          disableFullscreenUI={true}
          onFocus={() => this.onFocusCallBack(inputName)}
          style={[
            localStyle.textInput,
            {height: 80},
            this.state.errors[inputName]
              ? localStyle.textInputError
              : this.state.focusedElement === inputName
              ? localStyle.textInputFocused
              : localStyle.textInputBlurred,
          ]}
          ref={input => (this.inputs[inputName] = input)}
          value={this.state.data[inputName]}
          onChangeText={keyPress =>
            this.onChangeTextCallback(inputName, keyPress)
          }
        />
      );
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
            <Text style={localStyle.text}>
              Enter the 4 digit code we sent you on your{'\n'}registered email
              to continue
            </Text>
            <View style={localStyle.content}>
              <View style={localStyle.inputContainer}>
                {this.renderInputs()}
              </View>
            </View>
            <View style={localStyle.resendCodeContainer}>
              <Text style={localStyle.resendCodeText}>
                DIDN''T RECEIVE YET?{' '}
              </Text>
              <TouchableOpacity onPress={this.resendOtp}>
                <Text style={localStyle.resendOtpLink}>RESEND OTP</Text>
              </TouchableOpacity>
            </View>
            <View style={localStyle.submitButton}>
              <BlueButton onPress={this.verifyOtp} buttonText="DONE" />
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }
}

const localStyle = StyleSheet.create({
  text: {
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(14),
    marginTop: Utils.moderateScale(40, 0.5),
  },
  inputContainer: {
    marginTop: Utils.moderateScale(40, 0.5),
    marginBottom: Utils.moderateScale(60, 0.5),
    // marginLeft: (Utils.width - 230) / 2,
    // marginRight: (Utils.width - 230) / 2,
    justifyContent: 'center',
    flexDirection: 'row',
    display: 'flex',
  },
  textInput: {
    borderBottomWidth: 2,
    color: '#17114f',
    width: 60,
    height: 60,
    fontSize: 40,
    marginRight: 10,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  textInputFocused: {
    borderBottomColor: '#17114f',
  },
  textInputBlurred: {
    borderBottomColor: '#cfd7d9',
  },
  textInputError: {
    borderBottomColor: 'red',
  },
  submitButton: {
    alignItems: 'center',
    marginTop: Utils.moderateScale(40, 0.5),
  },
  resendCodeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  resendCodeText: {
    color: '#607c8c',
    fontSize: Utils.moderateScale(12),
    fontFamily: 'Poppins-Regular',
  },
  resendOtpLink: {
    color: '#171150',
    fontSize: Utils.moderateScale(14),
    fontFamily: 'Poppins-Regular',
  },
});
