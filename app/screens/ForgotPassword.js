import React, {Component} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Keyboard,
  InteractionManager,
  ScrollView,
  Text,
} from 'react-native';
// import { SafeAreaView } from 'react-navigation';
import styles from './styles';
import * as Utils from '../lib/utils';
import Images from '../assets/images/index';
import Input from '../components/Input';
import BlueButton from '../components/button/BlueButton';
import LoaderFullScreen from '../components/LoaderFullScreen';
import LinearGradient from 'react-native-linear-gradient';

export default class ForgotPasswordScreen extends Component {
  static navigationOptions = {
    title: 'FORGOT PASSWORD',
  };

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      errorMsg: '',
      loading: false,
    };
    this._mounted = false;
    this.inputs = {};
    this.forgotPass = this.forgotPass.bind(this);
  }

  componentDidMount() {
    this._mounted = true;
    InteractionManager.runAfterInteractions(() => this.inputs.email.focus());
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  forgotPass() {
    let error = false;

    if (!this.state.email) {
      this.inputs.email.focus();
      this.setState({errorMsg: 'Please enter email'});
      error = true;
    } else {
      this.setState({errorMsg: ''});
    }
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/;
    if (reg.test(this.state.email) === false) {
      if (!error) {
        this.inputs.email.focus();
        this.setState({errorMsg: 'Please enter a valid email'});
        error = true;
      } else {
        this.setState({errorMsg: ''});
      }
    }

    if (error) {
      return;
    }

    Keyboard.dismiss();
    this.setState({loading: true});

    Utils.makeApiRequest(
      'forgot-password',
      {email: this.state.email, isMobile: true},
      null,
      'POST',
      'auth',
    )
      .then(result => {
        console.warn(result);
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
            this.props.navigation.navigate('Otp', {email: this.state.email});
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
            <Text style={localStyle.text}>
              We'll send you a code to reset password.
            </Text>
            <View style={[styles.card, localStyle.card]}>
              <View style={localStyle.content}>
                <Input
                  label="EMAIL"
                  returnKeyType="done"
                  autoCorrect={false}
                  containerStyle={{marginBottom: Utils.scale(5)}}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  refCallback={ref => (this.inputs.email = ref)}
                  error={this.state.errorMsg}
                  value={this.state.email}
                  focusElement={() => this.inputs.email.focus()}
                  onChangeText={email =>
                    this.setState({email: email, errorMsg: ''})
                  }
                />
              </View>
            </View>
            <View style={localStyle.submitButtonContainer}>
              <BlueButton onPress={this.forgotPass} buttonText="SUBMIT" />
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
  card: {
    width: '90%',
    marginTop: Utils.moderateScale(40, 0.5),
    alignSelf: 'center',
  },
  content: {
    marginTop: Utils.moderateScale(20, 0.5),
    marginBottom: Utils.moderateScale(10, 0.5),
    width: '85%',
    alignSelf: 'center',
  },
  submitButtonContainer: {
    alignItems: 'center',
    marginTop: Utils.moderateScale(40, 0.5),
    width: '90%',
    alignSelf: 'center',
  },
});
