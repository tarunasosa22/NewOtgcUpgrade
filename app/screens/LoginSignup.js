import React, { Component } from 'react';
import {
  View,
  Text,
  Platform,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Animated,
  ScrollView,
  Keyboard,
  StatusBar,
} from 'react-native';
import { connect } from 'react-redux';
import messaging from '@react-native-firebase/messaging';

import { ActionCreators } from '../actions/index';
import { Header, Body } from 'native-base';
import styles from './styles';
import BlueButton from '../components/button/BlueButton';
import LoaderFullScreen from '../components/LoaderFullScreen';
import LoginNavBar from './LoginNavBar';
import Input from '../components/Input';
import Images from '../assets/images/index';
import * as Utils from '../lib/utils';
// import {Dropdown} from 'react-native-material-dropdown';
import { Picker } from '@react-native-picker/picker';
import SelectDropdown from 'react-native-select-dropdown';
import { firebase } from '@react-native-firebase/dynamic-links';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';

class AnimatedViewSlideAndFade extends Component {
  constructor(props) {
    super(props);

    (this.leftPosition = -Utils.width),
      (this.rightPosition = Utils.width),
      (this.midPosition = 0),
      (this.horizontalSlideDuration = 500),
      (this.originalPosition = props.startFrom),
      (this.state = {
        fadeAnimStartValue: new Animated.Value(0),
        fadeAnimEndValue: 1,
        slideAnimStartValue: new Animated.Value(
          props.startFrom === 'left'
            ? -Utils.width
            : props.startFrom === 'right'
              ? Utils.width
              : 0,
        ),
        slideAnimEndValue: 0,
        verticalAnimStartValue: new Animated.Value(props.verticalAnimStart),
        verticalAnimEndValue: 0,
        verticalAnimDuration: 0,
        currentHorizontalPosition: props.startFrom,
      });
  }

  animateHorizontalSlide() {
    Animated.parallel([
      Animated.timing(this.state.fadeAnimStartValue, {
        toValue: this.state.fadeAnimEndValue,
        duration: this.horizontalSlideDuration,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.slideAnimStartValue, {
        toValue: this.state.slideAnimEndValue,
        duration: this.horizontalSlideDuration,
        useNativeDriver: true,
      }),
    ]).start();
  }

  async animateVertialSlide(end, duration) {
    await this.setState({
      verticalAnimEndValue: end,
      verticalAnimDuration: duration,
    });
    Animated.timing(this.state.verticalAnimStartValue, {
      toValue: this.state.verticalAnimEndValue,
      duration: this.state.verticalSlideDuration,
      useNativeDriver: true,
    }).start();
  }

  async slideRight() {
    if (this.state.currentHorizontalPosition === 'left') {
      await this.setState({
        fadeAnimEndValue: 1,
        slideAnimEndValue: this.midPosition,
        currentHorizontalPosition: 'mid',
      });
    } else if (this.state.currentHorizontalPosition === 'mid') {
      await this.setState({
        fadeAnimEndValue: 0,
        slideAnimEndValue: this.rightPosition,
        currentHorizontalPosition: 'right',
      });
    }
    this.animateHorizontalSlide();
  }

  async slideLeft() {
    if (this.state.currentHorizontalPosition === 'right') {
      await this.setState({
        fadeAnimEndValue: 1,
        slideAnimEndValue: this.midPosition,
        currentHorizontalPosition: 'mid',
      });
    } else if (this.state.currentHorizontalPosition === 'mid') {
      await this.setState({
        fadeAnimEndValue: 0,
        slideAnimEndValue: this.leftPosition,
        currentHorizontalPosition: 'left',
      });
    }
    this.animateHorizontalSlide();
  }

  reset() {
    if (this.originalPosition === 'left') {
      this.setState({
        fadeAnimStartValue: new Animated.Value(0),
        fadeAnimEndValue: 1,
        slideAnimStartValue: new Animated.Value(
          this.originalPosition === 'left'
            ? -Utils.width
            : this.originalPosition === 'right'
              ? Utils.width
              : 0,
        ),
        slideAnimEndValue: 0,
        currentHorizontalPosition: this.originalPosition,
      });
    } else {
      this.setState({
        fadeAnimStartValue: new Animated.Value(0),
        fadeAnimEndValue: 1,
        slideAnimStartValue: new Animated.Value(
          this.originalPosition === 'left'
            ? -Utils.width
            : this.originalPosition === 'right'
              ? Utils.width
              : 0,
        ),
        slideAnimEndValue: 0,
        currentHorizontalPosition: this.originalPosition,
      });
    }
  }

  componentDidMount() {
    if (this.state?.currentHorizontalPosition === 'left') {
      this.slideRight();
    } else {
      this.slideLeft();
    }
    this.animateHorizontalSlide();
  }

  render() {
    return (
      <Animated.View
        style={[
          this.props.style,
          {
            opacity: this.state.fadeAnimStartValue,
            transform: [
              {
                translateX: this.state.slideAnimStartValue,
              },
              {
                translateY: this.state.verticalAnimStartValue,
              },
            ],
          },
        ]}>
        {this.props.children}
      </Animated.View>
    );
  }
}

class LoginSignupScreen extends Component {
  static navigationOptions = {
    headerStyle: {
      borderBottomWidth: 0,
    },
    headerTransparent: true,
    headerBackground: <LoginNavBar />,
    headerLeft: null,
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      showLoginView:
        this.props?.route?.params &&
        this.props?.route?.params?.viewType === 'login',
      // this.props?.navigation?.route?.params &&
      // this.props?.navigation?.route?.params?.viewType === 'login',
      showSignupView:
        this.props?.route?.params &&
        this.props?.route?.params?.viewType === 'signup',
      // this.props?.navigation?.route?.params &&
      // this.props?.navigation?.route?.params?.viewType === 'signup',
      showSignupView2: false,
      data: {
        login: { email: '', password: '' },
        signup: {
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          mobile: '',
          zip_code: '',
          hear_about_us: '',
        },
      },
      errors: {
        login: { email: '', password: '' },
        signup1: { zip_code: '', email: '' },
        signup2: {
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          mobile: '',
          hear_about_us: '',
        },
      },
      loading: false,
      message: '',
      currentlyVisibleView: this.props?.route?.state?.params?.viewType,
      // currentlyVisibleView: this.props?.navigation?.state?.params?.viewType,

      verticalChangeInAnimatedView: 0,
      hearAboutUs: [
        { id: 1, data: 'Google' },
        { id: 2, data: 'Yelp' },
        { id: 3, data: 'Saw ‘On the Go’ Truck' },
        { id: 4, data: 'A Friend' },
        { id: 5, data: 'Doorman' },
        { id: 6, data: 'Facebook' },
        { id: 7, data: 'Instagram' },
        { id: 8, data: 'Other' },
      ],
    };
    this._mounted = false;
    this.verticalAnimStartValue = Utils.moderateVerticalScale(207);
    this.verticalChangeInAnimatedView = 0;
    this.inputs = { login: {}, signup1: {}, signup2: {} };
    this.signupStep1 = this.signupStep1.bind(this);
    // this.signup = this.signup.bind(this);
    this.login = this.login.bind(this);
    this.keyboardWillShowSub =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
        : Keyboard.addListener('keyboardDidShow', this.keyboardWillShow);
    this.keyboardWillHideSub =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardWillHide', this.keyboardWillHide)
        : Keyboard.addListener('keyboardDidHide', this.keyboardWillHide);
  }

  async componentDidMount() {
    this._mounted = true;

    if (Platform.OS == 'ios') {
      const enabled = await messaging().hasPermission();
      if (enabled === -1) {
        try {
          await messaging().requestPermission();
        } catch (error) {
          return false;
        }
      } else {
        await this.storeFcm()
      }
    }
    else {
      const androidVersion = Platform.Version
      console.log('else', androidVersion)
      if (androidVersion >= 33) {
        this.checkPermission()
      }
    }


  }

  async storeFcm() {
    console.log('FCMMM-->before', this.props.fcmToken)
    if (!this.props.fcmToken || this.props.fcmToken.fcmToken === '') {
      const fcmToken = await messaging().getToken();
      console.log('FCM_DATA->', fcmToken)
      this.props.setFcmToken(fcmToken)
    }
  }

  componentWillUnmount() {
    this._mounted = false;
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
  }

  keyboardWillShow = event => {
    let duration = 200;
    if (event && event.duration) {
      duration = event.duration;
    }
    if (this.state?.currentlyVisibleView == 'login') {
      this.inputs.login.password.measure(
        (x, y, width, height, pageX, pageY) => {
          let diff = pageY + height + 30 - event.endCoordinates.screenY;
          if (diff > 0) {
            this.verticalChangeInAnimatedView = diff;
            this.loginView.animateVertialSlide(
              Utils.verticalScale(this.verticalAnimStartValue) - diff,
              duration,
            );
          }
        },
      );
    } else if (this.state.currentlyVisibleView == 'signup') {
      this.inputs.signup1.email.measure((x, y, width, height, pageX, pageY) => {
        let diff = pageY + height + 30 - event.endCoordinates.screenY;
        if (diff > 0) {
          this.verticalChangeInAnimatedView = diff;
          this.signupView.animateVertialSlide(
            Utils.verticalScale(this.verticalAnimStartValue) - diff,
            duration,
          );
        }
      });
    } else if (this.state.currentlyVisibleView == 'signup2') {
      this.inputs.signup2.password.measure(
        (x, y, width, height, pageX, pageY) => {
          let diff = pageY + height + 30 - event.endCoordinates.screenY;
          if (diff > 0) {
            this.verticalChangeInAnimatedView = diff;
            this.signupView2.animateVertialSlide(
              Utils.verticalScale(this.verticalAnimStartValue) - diff,
              duration,
            );
          }
        },
      );
    }
  };

  keyboardWillHide = event => {
    let duration = 200;
    if (event && event.duration) {
      duration = event.duration;
    }
    if (this.state.currentlyVisibleView == 'login') {
      if (this.verticalChangeInAnimatedView > 0) {
        this.loginView.animateVertialSlide(
          Utils.verticalScale(this.verticalAnimStartValue),
          duration,
        );
      }
    } else if (this.state.currentlyVisibleView == 'signup') {
      if (this.verticalChangeInAnimatedView > 0) {
        this.signupView.animateVertialSlide(
          Utils.verticalScale(this.verticalAnimStartValue),
          duration,
        );
      }
    } else if (this.state.currentlyVisibleView == 'signup2') {
      if (this.verticalChangeInAnimatedView > 0) {
        this.signupView2.animateVertialSlide(
          Utils.verticalScale(this.verticalAnimStartValue),
          duration,
        );
      }
    }
    this.verticalChangeInAnimatedView = 0;
  };

  focusField(parentKey, key) {
    this.inputs[parentKey] &&
      this.inputs[parentKey][key] &&
      this.inputs[parentKey][key].focus();
  }

  onLoginButtonTapNavBar = () => {
    Keyboard.dismiss();
    this.keyboardWillHide({ duration: 200 });
    if (!this.state.showLoginView) {
      if (this.state.currentlyVisibleView === 'signup') {
        this.setState({ showLoginView: true, currentlyVisibleView: 'login' });
        this.signupView.slideRight();
      } else {
        this.setState({ showLoginView: true, currentlyVisibleView: 'login' });
        this.signupView.reset();
        this.signupView.slideRight();
      }
    } else if (this.state.currentlyVisibleView !== 'login') {
      if (this.state.currentlyVisibleView === 'signup') {
        this.loginView.slideRight();
        this.signupView.slideRight();
        this.setState({ currentlyVisibleView: 'login' });
      } else if (this.state.currentlyVisibleView === 'signup2') {
        this.loginView.slideRight();
        this.signupView.reset();
        this.signupView2.slideRight();
        this.setState({ currentlyVisibleView: 'login' });
      }
    }
  };

  onSignupButtonTapNavBar = () => {
    Keyboard.dismiss();
    this.keyboardWillHide({ duration: 200 });
    if (!this.state.showSignupView) {
      this.setState({ showSignupView: true, currentlyVisibleView: 'signup' });
      this.loginView.slideLeft();
    } else if (this.state.currentlyVisibleView !== 'signup') {
      if (this.state.currentlyVisibleView === 'login') {
        this.loginView.slideLeft();
        this.signupView.slideLeft();
        this.setState({ currentlyVisibleView: 'signup' });
      } else if (this.state.currentlyVisibleView === 'signup2') {
        this.signupView.slideRight();
        this.signupView2.slideRight();
        this.state.errors = {
          login: { email: '', password: '' },
          signup1: { zip_code: '', email: '' },
          signup2: {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            hear_about_us: '',
          },
        };
        (this.state.data.signup = {
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          zip_code: '10003',
          hear_about_us: 'ast.mm1@gmail.com',
        }),
          this.setState({
            currentlyVisibleView: 'signup',
            data: this.state.data,
            errors: this.state.errors,
          });
      }
    }
  };

  async generateLink() {
    try {
      const link = await firebase.dynamicLinks().buildShortLink(
        {
          link: `https://onthegocleaners.page.link/open_app`,
          domainUriPrefix: 'https://onthegocleaners.page.link',
          android: {
            packageName: 'com.otgc.onthegocleaners', // Android package name
            // fallbackUrl: 'https://mytogmaapp.com/fallback', // Fallback URL for non-app users
          },
          ios: {
            appStoreId: '1436606731',
            bundleId: 'com.onTheGoCleaners.app',
            // customScheme: 'com.Rate-It-now',
          },
          navigation: {
            forcedRedirectEnabled: true,
          },
        },
        firebase.dynamicLinks.ShortLinkType.SHORT,
      );
      console.log('LINK--->', link)
    }
    catch (error) {
      console.error('Error generating dynamic link:', error);
    }

  }

  async login() {
    // this.storeFcm()
    let error = false;
    let errors = {};

    this.generateLink()
    let fcmToken;
    if (!this.props.fcmToken || this.props.fcmToken.fcmToken === '') {
      fcmToken = await messaging().getToken();
      this.props.setFcmToken(fcmToken)
    } else {
      fcmToken = this.props.fcmToken
    }
    // try {

    if (!this.state.data.login.email) {
      this.focusField('login', 'email');
      errors.email = 'Please enter email';
      error = true;
    } else {
      errors.email = '';
    }
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/;
    if (reg.test(this.state.data.login.email) === false) {
      if (!error) {
        this.focusField('login', 'email');
        errors.email = 'Please enter a valid email';
        error = true;
      }
    } else {
      errors.email = '';
    }

    if (!this.state.data.login.password) {
      if (!error) {
        this.focusField('login', 'password');
      }
      errors.password = 'Please enter password';
      error = true;
    } else {
      errors.password = '';
    }

    this.state.errors.login = errors;
    this.setState({ errors: this.state.errors });

    if (error) {
      return;
    }

    Keyboard.dismiss();
    this.setState({ loading: true });

    //   for (let i = 0; i < 5; i++) {
    //     fcmToken = await messaging().getToken();
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
    const appVersion = await DeviceInfo.getVersion();
    Utils.makeApiRequest(
      'signin',
      {
        ...this.state.data.login,
        device_token: fcmToken,
        device_type: Platform.OS === 'ios' ? 'ios' : 'android',
        app_version: appVersion
      },
      null,
      'POST',
      'auth',
    )
      .then(result => {
        if (this._mounted) {
          this.setState({ loading: false });
          if (result.status === 'FAILED') {
            if (this.props.navigation.isFocused()) {
              if (result?.message) {
                Utils.displayAlert('Oops!', result.message);
              } else {
                Utils.displayAlert(
                  'Oops!',
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
              }
            }
          } else if (result?.data) {
            let first_name =
              result.data.first_name.charAt(0).toUpperCase() +
              result.data.first_name.substr(1).toLowerCase();
            let last_name =
              result.data.last_name.charAt(0).toUpperCase() +
              result.data.last_name.substr(1).toLowerCase();
            this.props.setLoggedInUserData({
              id: result.data.id,
              token: result.accessToken,
              deviceToken: fcmToken,
              first_name: first_name,
              last_name: last_name,
              name: first_name + ' ' + last_name,
            });
            Utils.saveStateAsyncStorage({
              appData: {
                id: result.data.id,
                token: result.accessToken,
                deviceToken: fcmToken,
                first_name: first_name,
                last_name: last_name,
                name: first_name + ' ' + last_name,
              },
            });
            this.generateLink()
            let signUpdata = {
              email: this.state.data.login.email,
              isSignUpDone: true,
              zip_code: result.data.zip_code
            }
            this.props.setSignUpData(signUpdata)
            setTimeout(() => {
              this.props?.navigation?.reset({ index: 1, routes: [{ name: 'LoggedInNav' }] });
            }, 1000);
          } else {
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert('Oops!', result.msg || 'Invalid Request');
            }
          }
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  checkPermission = () => {
    check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)
      .then((result) => {
        if (result === RESULTS.GRANTED) {
          this.storeFcm()
        } else {
          messaging().registerDeviceForRemoteMessages()
          this.requestPermission();
        }
      })
      .catch((error) => {
        console.log(error)
        // Error handling
      });
  }

  requestPermission = () => {
    request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)
      .then((result) => {
        if (result === RESULTS.GRANTED) {
          this.storeFcm()
        } else {
        }
      })
      .catch((error) => {
      });
  }

  signupStep1() {
    let error = false;
    let errors = {};

    if (!this.state.data.signup.zip_code) {
      this.focusField('signup1', 'zip_code');
      errors.zip_code = 'Please enter zip code';
      error = true;
    } else {
      errors.zip_code = '';
    }
    if (!this.state.data.signup.email) {
      if (!error) {
        this.focusField('signup1', 'email');
      }
      errors.email = 'Please enter email';
      error = true;
    } else {
      errors.email = '';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/;
    if (emailRegex.test(this.state.data.signup.email) === false) {
      if (!error) {
        this.focusField('signup1', 'email');
        errors.email = 'Please enter a valid email';
        error = true;
      }
    } else {
      errors.email = '';
    }

    this.state.errors.signup1 = errors;
    this.setState({ errors: this.state.errors });

    if (error) {
      return;
    }

    Keyboard.dismiss();
    this.setState({ loading: true });

    Utils.makeApiRequest(
      `verify/${this.state.data.signup.zip_code}`,
      {
        email: '',
        zip_code: '',
      },
      null,
      'GET',
      'zipcode',
    )
      .then(result => {
        if (this._mounted) {
          this.setState({ loading: false });

          console.log({ result })
          if (result.status == true) {
            this.checkEmail()
            // this.signup()



            // if (!this.state.showSignupView2) {
            //   this.setState({
            //     showSignupView2: true,
            //     currentlyVisibleView: 'signup2',
            //   });
            //   this.signupView.slideLeft();
            // } else {
            //   this.signupView2.slideLeft();
            //   this.signupView.slideLeft();
            //   this.setState({ currentlyVisibleView: 'signup2' });
            // }
          } else {
            let emailNotify = this.state.data.signup.email;
            this.state.data.signup = {
              // first_name: '',
              // last_name: '',
              email: '',
              // password: '',
              zip_code: '',
            };
            this.setState({ data: this.state.data });
            if (this.props.navigation.isFocused()) {
              if (result.msg === 'zip code not found') {
                Utils.displayAlert(
                  'Oops!',
                  'Currently we are not servicing this zip code. We will notify when we expand to your location!',
                  'NOTIFY ME',
                  <Input
                    label="EMAIL"
                    autoCorrect={false}
                    containerStyle={[
                      localStyle.inputContainerStyle,
                      { width: '100%' },
                    ]}
                    returnKeyType="next"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={false}
                    value={emailNotify}
                  />,
                  () => {
                    this.setState({ loading: true });
                    Utils.makeApiRequest(
                      'notify-me',
                      {
                        email: emailNotify,
                        zip_code: this.state.data.signup.zip_code,
                      },
                      null,
                      'POST',
                      'users/zipcode',
                    );
                    this.setState({ loading: false });
                    setTimeout(
                      () =>
                        Utils.displayAlert(
                          'Thank You!',
                          "We will notify you when we've reached your area.",
                        ),
                      200,
                    );
                  },
                  true,
                );
              } else {
                Utils.displayAlert('Oops!', result.msg || 'Invalid Request');
              }
            }
          }
        }
      })
      .catch(error => {
        this.setState({ loading: false });
        if (this.props.navigation.isFocused()) {
          Utils.displayAlert(
            'Oops!',
            'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
          );
        }
        throw new Error(error);
      });
  }

  checkEmail() {
    let data = {
      email: this.state.data.signup.email,
    }
    Utils.makeApiRequest(
      `check-email`,
      JSON.stringify(data),
      null,
      'POST',
      'users',
      true
    ).then(result => {
      console.log({ result })
      if (this._mounted) {
        if (result.status == true) {
          Utils.displayAlert('Oops!', 'User already exists');

          // this.onLoginButtonTapNavBar()
        } else {
          let signUpdata = {
            email: this.state.data.signup.email,
            isSignUpDone: false,
            zip_code: this.state.data.signup.zip_code
          }
          // this._initProfile()
          this.props.setSignUpData(signUpdata)
          Utils.saveSignUpStateAsyncStorage(signUpdata)
          this.props.navigation.navigate('LoggedInNav');
        }
      }
    })
      .catch(error => {
        this.setState({ loading: false });
        if (this.props.navigation.isFocused()) {
          Utils.displayAlert(
            'Oops!',
            'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
          );
        }
        throw new Error(error);
      });
  }

  signup() {
    this.storeFcm()
    let error = false;
    let errors = {};

    // if (!this.state.data.signup.first_name) {
    //   this.focusField('signup2', 'first_name');
    //   errors.first_name = 'Please enter first name';
    //   error = true;
    // } else {
    //   errors.first_name = '';
    // }
    // if (!this.state.data.signup.last_name) {
    //   if (!error) {
    //     this.focusField('signup2', 'last_name');
    //   }
    //   errors.last_name = 'Please enter last name';
    //   error = true;
    // } else {
    //   errors.last_name = '';
    // }

    // if (!this.state.data.signup.password) {
    //   if (!error) {
    //     this.focusField('signup2', 'password');
    //   }
    //   errors.password = 'Please enter password';
    //   error = true;
    // } else {
    //   errors.password = '';
    // }

    // if (!this.state.data.signup.hear_about_us) {
    //   if (!error) {
    //     this.focusField('signup2', 'hear_about_us');
    //   }
    //   errors.hear_about_us = 'Please enter from where you hear about us';
    //   error = true;
    // } else {
    //   errors.hear_about_us = '';
    // }

    // this.state.errors.signup2 = errors;
    // this.setState({ errors: this.state.errors });

    // if (error) {
    //   return;
    // }

    Keyboard.dismiss();
    this.setState({ loading: true });

    Utils.makeApiRequest(
      'signup',
      { ...this.state.data.signup },
      null,
      'POST',
      'auth',
    )
      .then(result => {
        if (this._mounted) {
          if (result.message === 'User created') {
            this.setState({ message: 'Signup Successful...' });
            setTimeout(async () => {
              if (this._mounted) {
                this.setState({ message: 'Logging You In...' });
                let fcmToken = null;
                try {
                  for (let i = 0; i < 5; i++) {
                    fcmToken = await messaging().getToken();
                  }
                } catch (error) {
                  console.log(error);
                }
                const appVersion = await DeviceInfo.getVersion();
                Utils.makeApiRequest(
                  'signin',
                  {
                    email: this.state.data.signup.email,
                    password: this.state.data.signup.password,
                    device_token: fcmToken,
                    device_type: Platform.OS === 'ios' ? 'ios' : 'android',
                    app_version: appVersion
                  },
                  null,
                  'POST',
                  'auth',
                )
                  .then(result => {
                    if (this._mounted) {
                      this.setState({ loading: false, message: '' });
                      if (result.status === 'FAILED') {
                        if (result?.message) {
                          this.onSignupButtonTapNavBar();
                          Utils.displayAlert('Oops!', result?.message);
                        } else {
                          this.onSignupButtonTapNavBar();
                          Utils.displayAlert(
                            'Oops!',
                            'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                          );
                        }
                      } else if (result?.data) {
                        let first_name =
                          result.data.first_name.charAt(0).toUpperCase() +
                          result.data.first_name.substr(1).toLowerCase();
                        let last_name =
                          result.data.last_name.charAt(0).toUpperCase() +
                          result.data.last_name.substr(1).toLowerCase();

                        this.props.setLoggedInUserData({
                          id: result.data.id,
                          token: result.accessToken,
                          deviceToken: fcmToken,
                          first_name: first_name,
                          last_name: last_name,
                          name: first_name + ' ' + last_name,
                        });

                        Utils.saveStateAsyncStorage({
                          id: result.data.id,
                          appData: {
                            id: result.data.id,
                            token: result.accessToken,
                            deviceToken: fcmToken,
                            first_name: first_name,
                            last_name: last_name,
                            name: first_name + ' ' + last_name,
                          },
                        });

                        this.props.navigation.navigate('LoggedInNav');
                      } else {
                        this.onSignupButtonTapNavBar();
                        Utils.displayAlert(
                          'Oops!',
                          'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                        );
                      }
                    }
                  })
                  .catch(error => {
                    console.log(error);
                    throw new Error(error);
                  });
              }
            }, 1000);
          } else if (result?.message) {
            this.setState({ loading: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert('Oops!', result?.message || 'Invalid Request');
            }
          } else if (result.message === 'User already exists') {
            this.setState({ loading: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert('Oops!', result.message || 'Invalid Request');
            }
          } else {
            this.setState({ loading: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert('Oops!', result.msg || 'Invalid Request');
            }
          }
          if (
            result.msg ===
            'password must contain at least 1 letter and 1 number'
          ) {
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert('Oops!', result.msg || 'Invalid Request');
            }
          }
        }
      })
      .catch(error => {
        this.setState({ loading: false });
        if (this.props.navigation.isFocused()) {
          Utils.displayAlert(
            'Oops!',
            'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
          );
        }
        throw new Error(error);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <LoaderFullScreen
          loading={this.state.loading}
          message={this.state.message}
        />
        <ImageBackground
          source={Images.loginImage}
          style={styles.imageBackground}>
          {/* <Header transparent> */}
          <StatusBar backgroundColor="transparent" barStyle="light-content" />
          {/* <Body> */}
          <View style={{ marginTop: Utils.verticalScale(30) }}></View>
          <LoginNavBar
            onLoginButtonTap={this.onLoginButtonTapNavBar}
            onSignupButtonTap={this.onSignupButtonTapNavBar}
            initFocusedElement={this.props?.route?.params?.viewType}
          />
          {this.state?.showLoginView && (
            <AnimatedViewSlideAndFade
              ref={ci => (this.loginView = ci)}
              style={localStyle.animatedViewContainer}
              startFrom="left"
              verticalAnimStart={Utils.verticalScale(
                this.verticalAnimStartValue,
              )}>
              <ScrollView
                horizontal={false}
                style={[
                  styles.card,
                  localStyle.card,
                  localStyle.heightforandroid,
                ]}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <View style={localStyle.content}>
                  <Input
                    label="EMAIL"
                    cursorColor='black'
                    selectionColor={'black'}
                    autoCorrect={false}
                    containerStyle={localStyle.inputContainerStyle}
                    returnKeyType="next"
                    keyboardType="email-address"
                    blurOnSubmit={false}
                    autoCapitalize="none"
                    focusElement={() => this.focusField('login', 'email')}
                    error={this.state.errors.login.email}
                    refCallback={input => (this.inputs.login.email = input)}
                    value={this.state.data.login.email}
                    onSubmitEditing={() => {
                      this.focusField('login', 'password');
                    }}
                    onChangeText={email => {
                      this.state.errors.login.email = '';
                      this.state.data.login.email = email;
                      this.setState({
                        data: this.state.data,
                        errors: this.state.errors,
                      });
                    }}
                  />
                  <Input
                    label="PASSWORD"
                    secureTextEntry={true}
                    autoCorrect={false}
                    containerStyle={localStyle.inputContainerStyle}
                    returnKeyType="done"
                    autoCapitalize="none"
                    error={this.state.errors.login.password}
                    focusElement={() => this.focusField('login', 'password')}
                    refCallback={input => (this.inputs.login.password = input)}
                    value={this.state.data.password}
                    onChangeText={password => {
                      this.state.errors.login.password = '';
                      this.state.data.login.password = password;
                      this.setState({
                        data: this.state.data,
                        errors: this.state.errors,
                      });
                    }}
                  />
                </View>
              </ScrollView>
              <View style={localStyle.bottomContainer}>
                <BlueButton
                  onPress={this.login}
                  buttonText="LOGIN"
                  style={localStyle.loginButton}
                />
                <View style={localStyle.forgotPassContainer}>
                  <Text style={localStyle.forgotPassText}>
                    FORGOT PASSWORD?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate('ForgotPassword')
                    }>
                    <Text style={localStyle.forgotPassLink}>RECOVER HERE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </AnimatedViewSlideAndFade>
          )}

          {this.state.showSignupView && (
            <AnimatedViewSlideAndFade
              ref={ci => (this.signupView = ci)}
              style={localStyle.animatedViewContainer}
              startFrom="right"
              verticalAnimStart={Utils.verticalScale(
                this.verticalAnimStartValue,
              )}>
              <ScrollView
                horizontal={false}
                style={[
                  styles.card,
                  localStyle.card,
                  localStyle.heightforandroid,
                ]}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <View style={localStyle.content}>
                  <Input
                    label="ZIP CODE"
                    autoCorrect={false}
                    containerStyle={localStyle.inputContainerStyle}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    autoCapitalize="none"
                    error={this.state.errors.signup1.zip_code}
                    refCallback={input =>
                      (this.inputs.signup1.zip_code = input)
                    }
                    value={this.state.data.signup.zip_code}
                    focusElement={() => this.focusField('signup1', 'zip_code')}
                    onSubmitEditing={() => {
                      this.focusField('signup1', 'email');
                    }}
                    onChangeText={zip_code => {
                      this.state.errors.signup1.zip_code = '';
                      this.state.data.signup.zip_code = zip_code;
                      this.setState({
                        data: this.state.data,
                        errors: this.state.errors,
                      });
                    }}
                  />
                  <Input
                    label="EMAIL"
                    keyboardType="email-address"
                    autoCorrect={false}
                    containerStyle={localStyle.inputContainerStyle}
                    returnKeyType="done"
                    autoCapitalize="none"
                    error={this.state.errors.signup1.email}
                    focusElement={() => this.focusField('signup1', 'email')}
                    refCallback={input => (this.inputs.signup1.email = input)}
                    value={this.state.data.signup.email}
                    onChangeText={email => {
                      this.state.errors.signup1.email = '';
                      this.state.data.signup.email = email;
                      this.setState({
                        data: this.state.data,
                        errors: this.state.errors,
                      });
                    }}
                  />
                </View>
              </ScrollView>
              <View style={localStyle.bottomContainer}>
                <BlueButton
                  onPress={() => this.signupStep1()}
                  buttonText="SIGNUP"
                  style={localStyle.loginButton}
                />
                {/* <View style={localStyle.forgotPassContainer}>
                  <Text style={localStyle.forgotPassText}>
                    CREATE ACCOUNT 1/2
                  </Text>
                </View> */}
              </View>
            </AnimatedViewSlideAndFade>
          )}
          {/* </Body>
          {/* </Header> */}
          {/* {this.state.showLoginView && (
            <AnimatedViewSlideAndFade
              ref={ci => (this.loginView = ci)}
              style={localStyle.animatedViewContainer}
              startFrom="left"
              verticalAnimStart={Utils.verticalScale(
                this.verticalAnimStartValue,
              )}>
              <ScrollView
                horizontal={false}
                style={[styles.card, localStyle.card]}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <View style={localStyle.content}>
                  <Input
                    label="EMAIL"
                    autoCorrect={false}
                    containerStyle={localStyle.inputContainerStyle}
                    returnKeyType="next"
                    keyboardType="email-address"
                    blurOnSubmit={false}
                    autoCapitalize="none"
                    focusElement={() => this.focusField('login', 'email')}
                    error={this.state.errors.login.email}
                    refCallback={input => (this.inputs.login.email = input)}
                    value={this.state.data.login.email}
                    onSubmitEditing={() => {
                      this.focusField('login', 'password');
                    }}
                    onChangeText={email => {
                      this.state.errors.login.email = '';
                      this.state.data.login.email = email;
                      this.setState({
                        data: this.state.data,
                        errors: this.state.errors,
                      });
                    }}
                  />
                  <Input
                    label="PASSWORD"
                    secureTextEntry={true}
                    autoCorrect={false}
                    containerStyle={localStyle.inputContainerStyle}
                    returnKeyType="done"
                    autoCapitalize="none"
                    error={this.state.errors.login.password}
                    focusElement={() => this.focusField('login', 'password')}
                    refCallback={input => (this.inputs.login.password = input)}
                    value={this.state.data.password}
                    onChangeText={password => {
                      this.state.errors.login.password = '';
                      this.state.data.login.password = password;
                      this.setState({
                        data: this.state.data,
                        errors: this.state.errors,
                      });
                    }}
                  />
                </View>
              </ScrollView>
              <View style={localStyle.bottomContainer}>
                <BlueButton
                  onPress={this.login}
                  buttonText="LOGIN"
                  style={localStyle.loginButton}
                />
                <View style={localStyle.forgotPassContainer}>
                  <Text style={localStyle.forgotPassText}>
                    FORGOT PASSWORD?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate('ForgotPassword')
                    }>
                    <Text style={localStyle.forgotPassLink}>RECOVER HERE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </AnimatedViewSlideAndFade>
          )}
          {this.state.showSignupView && (
            <AnimatedViewSlideAndFade
              ref={ci => (this.signupView = ci)}
              style={localStyle.animatedViewContainer}
              startFrom="right"
              verticalAnimStart={Utils.verticalScale(
                this.verticalAnimStartValue,
              )}>
              <ScrollView
                horizontal={false}
                style={[styles.card, localStyle.card]}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <View style={localStyle.content}>
                  <Input
                    label="ZIP CODE"
                    autoCorrect={false}
                    containerStyle={localStyle.inputContainerStyle}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    autoCapitalize="none"
                    error={this.state.errors.signup1.zip_code}
                    refCallback={input =>
                      (this.inputs.signup1.zip_code = input)
                    }
                    value={this.state.data.signup.zip_code}
                    focusElement={() => this.focusField('signup1', 'zip_code')}
                    onSubmitEditing={() => {
                      this.focusField('signup1', 'email');
                    }}
                    onChangeText={zip_code => {
                      this.state.errors.signup1.zip_code = '';
                      this.state.data.signup.zip_code = zip_code;
                      this.setState({
                        data: this.state.data,
                        errors: this.state.errors,
                      });
                    }}
                  />
                  <Input
                    label="EMAIL"
                    keyboardType="email-address"
                    autoCorrect={false}
                    containerStyle={localStyle.inputContainerStyle}
                    returnKeyType="done"
                    autoCapitalize="none"
                    error={this.state.errors.signup1.email}
                    focusElement={() => this.focusField('signup1', 'email')}
                    refCallback={input => (this.inputs.signup1.email = input)}
                    value={this.state.data.signup.email}
                    onChangeText={email => {
                      this.state.errors.signup1.email = '';
                      this.state.data.signup.email = email;
                      this.setState({
                        data: this.state.data,
                        errors: this.state.errors,
                      });
                    }}
                  />
                </View>
              </ScrollView>
              <View style={localStyle.bottomContainer}>
                <BlueButton
                  onPress={this.signupStep1}
                  buttonText="NEXT"
                  style={localStyle.loginButton}
                />
                <View style={localStyle.forgotPassContainer}>
                  <Text style={localStyle.forgotPassText}>
                    CREATE ACCOUNT 1/2
                  </Text>
                </View>
              </View>
            </AnimatedViewSlideAndFade>
          )}
          {this.state.showSignupView2 && (
            <AnimatedViewSlideAndFade
              ref={ci => (this.signupView2 = ci)}
              style={localStyle.animatedViewContainer}
              startFrom="right"
              verticalAnimStart={Utils.verticalScale(
                this.verticalAnimStartValue,
              )}>
              <ScrollView
                horizontal={false}
                style={[
                  styles.card,
                  localStyle.card,
                  {height: Utils.moderateVerticalScale(Utils.height / 2)},
                ]}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <View style={localStyle.content}>
                  <Input
                    label="FIRST NAME"
                    autoCorrect={false}
                    containerStyle={localStyle.inputContainerStyle}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    autoCapitalize="none"
                    error={this.state.errors.signup2.first_name}
                    refCallback={input =>
                      (this.inputs.signup2.first_name = input)
                    }
                    value={this.state.data.signup.first_name}
                    focusElement={() =>
                      this.focusField('signup2', 'first_name')
                    }
                    onSubmitEditing={() => {
                      this.focusField('signup2', 'last_name');
                    }}
                    onChangeText={first_name => {
                      this.state.errors.signup2.first_name = '';
                      this.state.data.signup.first_name = first_name;
                      this.setState({
                        data: this.state.data,
                        errors: this.state.errors,
                      });
                    }}
                  />
                  <Input
                    label="LAST NAME"
                    autoCorrect={false}
                    containerStyle={localStyle.inputContainerStyle}
                    returnKeyType="next"
                    autoCapitalize="none"
                    blurOnSubmit={false}
                    error={this.state.errors.signup2.last_name}
                    refCallback={input =>
                      (this.inputs.signup2.last_name = input)
                    }
                    value={this.state.data.signup.last_name}
                    focusElement={() => this.focusField('signup2', 'last_name')}
                    onSubmitEditing={() => {
                      this.focusField('signup2', 'password');
                    }}
                    onChangeText={last_name => {
                      this.state.errors.signup2.last_name = '';
                      this.state.data.signup.last_name = last_name;
                      this.setState({
                        data: this.state.data,
                        errors: this.state.errors,
                      });
                    }}
                  />
                  <Input
                    label="EMAIL"
                    autoCorrect={false}
                    containerStyle={localStyle.inputContainerStyle}
                    returnKeyType="next"
                    keyboardType="email-address"
                    blurOnSubmit={false}
                    autoCapitalize="none"
                    editable={false}
                    error={this.state.errors.signup2.email}
                    refCallback={input => (this.inputs.signup2.email = input)}
                    value={this.state.data.signup.email}
                    onChangeText={email => {
                      this.state.errors.signup2.email = '';
                      this.state.data.signup.email = email;
                      this.setState({
                        data: this.state.data,
                        errors: this.state.errors,
                      });
                    }}
                  />
                  <Input
                    label="PASSWORD"
                    secureTextEntry={true}
                    autoCorrect={false}
                    containerStyle={localStyle.inputContainerStyle}
                    returnKeyType="done"
                    autoCapitalize="none"
                    error={this.state.errors.signup2.password}
                    refCallback={input =>
                      (this.inputs.signup2.password = input)
                    }
                    value={this.state.data.signup.password}
                    focusElement={() => this.focusField('signup2', 'password')}
                    onChangeText={password => {
                      this.state.errors.signup2.password = '';
                      this.state.data.signup.password = password;
                      this.setState({
                        data: this.state.data,
                        errors: this.state.errors,
                      });
                    }}
                  />
                  <View style={localStyle.inputContainerStyle}>
                    <View>
                      <Text style={[localStyle.text, localStyle.label]}>
                        {' '}
                        HOW DID YOU HEAR ABOUT US?
                      </Text>
                    </View>
                    <Dropdown
                      fontSize={Utils.moderateScale(14, 0.5)}
                      labelFontSize={Utils.moderateScale(12)}
                      baseColor="black"
                      textColor="#17114f"
                      data={this.state.hearAboutUs}
                      lineWidth={0}
                      value="Select"
                      fontFamily="Poppins-Regular"
                      containerStyle={localStyle.inputContainerStyle}
                      onChangeText={hear_about_us => {
                        this.state.errors.signup2.hear_about_us = '';
                        this.state.data.signup.hear_about_us = hear_about_us;
                        this.setState({
                          data: this.state.data,
                          errors: this.state.errors,
                        });
                      }}
                      pickerStyle={localStyle.dropdownPickerStyle}
                      valueExtractor={item => item.data}
                      labelExtractor={item => item.data}
                    />
                    <Text style={[styles.errorText]}>
                      {this.state.errors.signup2.hear_about_us}
                    </Text>
                  </View>
                </View>
              </ScrollView>
              <View style={localStyle.bottomContainer}>
                <BlueButton
                  onPress={this.signup}
                  buttonText="SIGNUP"
                  style={localStyle.loginButton}
                />
                <View style={localStyle.forgotPassContainer}>
                  <Text style={localStyle.forgotPassText}>
                    CREATE ACCOUNT 2/2
                  </Text>
                </View>
                <View style={localStyle.privacyPolicyContainer}>
                  <Image
                    style={localStyle.checkbox}
                    source={Images.selectIcon}
                    resizeMode="contain"
                    resizeMethod="resize"
                  />
                  <View style={localStyle.policyContainer}>
                    <Text style={localStyle.privacyPolicyText}>
                      I AGREE TO THE{' '}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate('TermsConditions')
                      }>
                      <Text
                        style={[
                          localStyle.privacyPolicyText,
                          localStyle.privacyPolicyLink,
                        ]}>
                        TERMS & CONDITIONS
                      </Text>
                    </TouchableOpacity>
                    <Text
                      style={[
                        localStyle.privacyPolicyText,
                        localStyle.otherText,
                      ]}>
                      {' '}
                      AND{'\n'}
                    </Text>
                  </View>
                </View>
                <View style={localStyle.policyContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate('PrivacyPolicy')
                    }>
                    <Text
                      style={[
                        localStyle.privacyPolicyText,
                        localStyle.privacyPolicyLink,
                      ]}>
                      PRIVACY POLICY
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={[
                      localStyle.privacyPolicyText,
                      localStyle.otherText,
                    ]}>
                    {' '}
                    OF THE APP
                  </Text>
                </View>
              </View>
            </AnimatedViewSlideAndFade>
          )} */}
        </ImageBackground>
      </View>
    );
  }
}

const localStyle = StyleSheet.create({
  animatedViewContainer: {
    marginLeft: Utils.scale(20),
    marginRight: Utils.scale(20),
    width: '100%',
    position: 'absolute',
    alignSelf: 'center',
  },
  animatedViewContainerSignUp: {
    marginLeft: Utils.scale(20),
    marginRight: Utils.scale(20),
    width: '100%',
    height: '65%',
    top: -30,
    position: 'absolute',
    alignSelf: 'center',
  },
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
  card: {
    paddingBottom: Utils.verticalScale(10),
    alignSelf: 'center',
    width: '90%',
  },
  heightforandroid: {
    height: Utils.moderateVerticalScale(Utils.height / 3.2),
    ...Platform.select({
      ios: {
        height: Utils.moderateVerticalScale(Utils.height / 4.2),
      },
    }),
  },
  heightforandroid2: {
    height: Utils.moderateVerticalScale(Utils.height / 3),
    ...Platform.select({
      ios: {
        height: Utils.moderateVerticalScale(Utils.height / 4),
      },
    }),
  },
  inputContainerStyle: {
    marginBottom: Utils.verticalScale(5),
    alignSelf: 'center',
    width: '85%',
    ...Platform.select({
      ios: {
        marginBottom: Utils.verticalScale(5),
        alignSelf: 'center',
        width: '85%',
      },
    }),
  },
  content: {
    marginTop: Utils.moderateScale(10, 0.5),
  },
  loginButton: {
    position: 'absolute',
    marginTop: -Utils.verticalScale(22.5),
    zIndex: 10,
  },
  forgotPassContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: Utils.moderateScale(35, 0.5),
  },
  bottomContainer: {
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginBottom: Utils.moderateVerticalScale(10),
  },
  forgotPassText: {
    color: '#607c8c',
    fontSize: Utils.moderateScale(12),
    fontFamily: 'Poppins-Regular',
  },
  forgotPassLink: {
    fontSize: Utils.moderateScale(14),
    color: '#171150',
    fontFamily: 'Poppins-Regular',
  },
  privacyPolicyContainer: {
    flexDirection: 'row',
    marginTop: Utils.moderateScale(12, 0.5),
    height: Utils.moderateScale(18),
  },
  privacyPolicyText: {
    fontSize: Utils.moderateScale(12),
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    color: '#607c8c',
  },
  privacyPolicyLink: {
    color: '#171150',
  },
  policyContainer: {
    flexDirection: 'row',
  },
  checkbox: {
    height: Utils.moderateScale(20),
    width: Utils.moderateScale(20),
    borderRadius: Utils.moderateScale(20) / 2,
    borderColor: 'white',
    marginRight: 10,
  },
  dropdownContainerStyle: {
    paddingLeft: Utils.moderateScale(20),
    paddingRight: Utils.moderateScale(15),
  },
  dropdownPickerStyle: {
    width: Utils.scale(300),
    marginLeft: Utils.moderateScale(15),
  },
});

const mapStateToProps = state => {
  console.log({ state })
  return {
    signUpdata: state.appData.signUpdata,
    fcmToken: state.appData.fcmToken
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setLoggedInUserData: data =>
      dispatch(ActionCreators.setLoggedInUserData(data)),
    setSignUpData: data =>
      dispatch(ActionCreators.setSignUpData(data)),
    setFcmToken: data =>
      dispatch(ActionCreators.setFcmToken(data))
  };
};

const pickerSelectStyles2 = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderRadius: 2,
    color: 'black',
    width: Utils.verticalScale(110),
    height: 50,
    minWidth: Utils.verticalScale(110),
    paddingRight: 30,
    marginBottom: 10,
    paddingLeft: 10, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    width: Utils.verticalScale(130),
    height: 50,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderWidth: 5,
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    marginBottom: 10, // to ensure the text is never behind the icon
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginSignupScreen);
