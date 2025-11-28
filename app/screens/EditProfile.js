import React, {Component} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
// import { SafeAreaView } from 'react-navigation';
import BlueButton from '../components/button/BlueButton';
import {CheckBox} from 'native-base';
import styles from './styles';
import LoaderView from '../components/LoaderView';
import {connect} from 'react-redux';
import {ActionCreators} from '../actions/index';
import Images from '../assets/images/index';
import * as Utils from '../lib/utils';
import RadioButton from '../components/RadioButton';
import Input from '../components/Input';
import LinearGradient from 'react-native-linear-gradient';

class EditProfileScreen extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: 'EDIT PROFILE',
      headerRight: (
        <TouchableOpacity
          style={{
            paddingLeft: Utils.scale(30),
            paddingTop: Utils.scale(10),
            paddingBottom: Utils.scale(10),
          }}
          onPress={navigation.getParam('openDrawer')}>
          <Image
            source={Images.drawerIcon}
            style={{
              marginRight: Utils.moderateScale(15, 0.5),
              width: Utils.moderateScale(22),
              height: Utils.moderateScale(22),
            }}
            resizeMode="contain"
            resizeMethod="resize"
          />
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      profile: {
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
        id: '',
      },
      errors: {
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
      },
      email_notifications: '',
      push_notifications: '',
      keyboardVisible: false,
      loading: true,
      updatingProfile: false,
    };
    this._mounted = false;
    this.inputs = {};
    this.onChangeTextCallback = this.onChangeTextCallback.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.handleCellPhoneInput = this.handleCellPhoneInput.bind(this);
    this.updateEmailNotificationSubscription =
      this.updateEmailNotificationSubscription.bind(this);
    this.updatePushNotificationSubscription =
      this.updatePushNotificationSubscription.bind(this);
  }

  componentDidMount() {
    this._mounted = true;
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });
    this.fetchProfile();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  focusField(key) {
    this.inputs[key] && this.inputs[key].focus();
  }

  fetchProfile() {
    return Utils.makeApiRequest(
      'my-profile',
      {},
      this.props.appData.token,
      'GET',
    )
      .then(result => {
        if (this._mounted) {
          if (result.status === false) {
            this.setState({loading: false});
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                'Opps!',
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
          } else if (result.status === true) {
            let profile = result.data;
            this.setState({
              profile: {
                first_name: profile.first_name,
                last_name: profile.last_name,
                email: profile.email,
                mobile: profile.mobile,
                id: profile.id,
              },
              email_notifications: profile.email_notifications,
              push_notifications: profile.push_notifications,
              loading: false,
            });
          } else {
            this.setState({loading: false});
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                result.msg ||
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
          }
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  updateProfile(userId) {
    let error = false,
      errors = {};
    let profile = this.state.profile;
    let errorNameFieldMap = {
      first_name: 'Please enter first name',
      last_name: 'Please enter last name',
      email: 'Please enter email',
      mobile: 'Please enter cell phone number',
    };

    for (let field in profile) {
      if (field == 'mobile') {
        if (!profile.mobile) {
          if (error == false) {
            this.focusField('mobile');
          }
          errors.mobile = errorNameFieldMap.mobile;
          error = true;
        } else if (
          /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/.test(profile.mobile) == false
        ) {
          if (error == false) {
            this.focusField('mobile');
          }
          errors.mobile = 'Please enter a valid cell phone number';
          error = true;
        }
      } else if (!profile[field]) {
        if (error == false) {
          this.focusField(field);
        }
        errors[field] = errorNameFieldMap[field];
        error = true;
      }
    }

    this.state.errors = errors;
    this.setState({errors: this.state.errors});

    if (error) {
      return;
    }

    this.setState({updatingProfile: true});
    Keyboard.dismiss();

    Utils.makeApiRequest(
      `update/${userId}`,
      this.state.profile,
      this.props.appData.token,
      'POST',
      'users',
    )
      .then(result => {
        if (this._mounted) {
          this.setState({updatingProfile: false});
          if (result.status === false) {
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
          } else if (result.status == true) {
            Utils.displayAlert(
              '',
              result.msg || 'Your profile has been updated successfully',
              'OK',
              null,
              () => {
                this.props.navigation.navigate('Profile');
              },
              false,
              false,
            );
          } else {
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                result.msg ||
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
          }
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  onChangeTextCallback(input, value) {
    this.state.errors[input] = '';
    this.state.profile[input] = value;
    this.setState({errors: this.state.errors, profile: this.state.profile});
  }

  updateEmailNotificationSubscription(value = null) {
    console.log(value);
    if (value && this.state.email_notifications != value) {
      this.setState({updatingProfile: true});
      Utils.makeApiRequest(
        `update/${this.state.profile.id}`,
        {email_notifications: value},
        this.props.appData.token,
        'POST',
        'users',
      )
        .then(result => {
          if (this._mounted) {
            if (result.status === false) {
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  '',
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
              }
              this.setState({updatingProfile: false});
            } else if (result.status == true) {
              Utils.displayAlert(
                '',

                'You have successfully subscribed to email notifications',
              );
              this.setState({
                updatingProfile: false,
                email_notifications: value,
              });
            } else {
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  '',
                  result.msg ||
                    'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
              }
              this.setState({updatingProfile: false});
            }
          }
        })
        .catch(error => {
          console.log(error);
          throw new Error(error);
        });
    }
  }

  updatePushNotificationSubscription(value = null) {
    if (value && this.state.push_notifications != value) {
      this.setState({updatingProfile: true});
      Utils.makeApiRequest(
        `update/${this.state.profile.id}`,
        {push_notifications: value},
        this.props.appData.token,
        'POST',
        'users',
      )
        .then(result => {
          if (this._mounted) {
            if (result.status === false) {
              this.setState({updatingProfile: false});
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  '',
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
              }
            } else if (result.status === true) {
              this.setState({
                updatingProfile: false,
                push_notifications: value,
              });
              Utils.displayAlert(
                '',
                'You have successfully subscribed to push notifications',
              );
            } else {
              this.setState({updatingProfile: false});
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  '',
                  result.msg ||
                    'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
              }
            }
          }
        })
        .catch(error => {
          console.log(error);
          throw new Error(error);
        });
    }
  }

  async handleCellPhoneInput(value) {
    let newValue = Utils.formatPhoneNumber(value);
    this.state.errors.mobile = '';
    this.state.profile.mobile = newValue;
    await this.setState({
      errors: this.state.errors,
      profile: this.state.profile,
    });
  }

  render() {
    return (
      //<SafeAreaView style={ styles.container }>
      <LinearGradient colors={['#3b2eb6', '#21e381']} style={styles.container}>
        {this.state.loading || this.state.updatingProfile ? (
          <View style={localStyle.loaderContainer}>
            <LoaderView
              loading={this.state.loading || this.state.updatingProfile}
              style={localStyle.loader}
            />
          </View>
        ) : null}
        <View style={localStyle.containerView}>
          <KeyboardAvoidingView behavior="padding">
            <ScrollView
              showsVerticalScrollIndicator={false}
              horizontal={false}
              style={[styles.card, localStyle.card]}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={localStyle.row}>
                <Input
                  label="FIRST NAME"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  value={this.state.profile.first_name}
                  error={this.state.errors.first_name}
                  focusElement={() => this.focusField('first_name')}
                  refCallback={input => (this.inputs['first_name'] = input)}
                  onSubmitEditing={() => this.focusField('last_name')}
                  onChangeText={first_name =>
                    this.onChangeTextCallback('first_name', first_name)
                  }
                />
              </View>
              <View style={localStyle.row}>
                <Input
                  label="LAST NAME"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  value={this.state.profile.last_name}
                  error={this.state.errors.last_name}
                  focusElement={() => this.focusField('last_name')}
                  refCallback={input => (this.inputs['last_name'] = input)}
                  onSubmitEditing={() => this.focusField('mobile')}
                  onChangeText={last_name =>
                    this.onChangeTextCallback('last_name', last_name)
                  }
                />
              </View>
              <View style={localStyle.row}>
                <Input
                  label="EMAIL"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  keyboardType="email-address"
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  editable={false}
                  value={this.state.profile.email}
                  error={this.state.errors.email}
                  focusElement={() => this.focusField('email')}
                  refCallback={input => (this.inputs['email'] = input)}
                  onChangeText={email =>
                    this.onChangeTextCallback('email', email)
                  }
                />
              </View>
              <View style={localStyle.row}>
                <Input
                  label="CELL PHONE NUMBER"
                  returnKeyType="done"
                  maxLength={12}
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  value={this.state.profile.mobile}
                  error={this.state.errors.mobile}
                  focusElement={() => this.focusField('mobile')}
                  refCallback={input => (this.inputs['mobile'] = input)}
                  onChangeText={this.handleCellPhoneInput}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <View
            style={[
              localStyle.row,
              localStyle.notificationContainer,
              styles.card,
            ]}>
            <Text style={localStyle.label}>EMAIL NOTIFICATIONS</Text>
            {!this.state.loading && (
              <RadioButton
                data={[
                  {
                    label: 'Yes',
                    value: 'yes',
                  },
                  {
                    label: 'No',
                    value: 'no',
                  },
                ]}
                default={
                  this.state.email_notifications.toLowerCase() == 'yes' ? 0 : 1
                }
                onPress={this.updateEmailNotificationSubscription}
              />
            )}
          </View>
          <View
            style={[
              localStyle.row,
              localStyle.notificationContainer,
              styles.card,
            ]}>
            <Text style={localStyle.label}>PUSH NOTIFICATIONS</Text>
            {!this.state.loading && (
              <RadioButton
                data={[
                  {
                    label: 'Yes',
                    value: 'yes',
                  },
                  {
                    label: 'No',
                    value: 'no',
                  },
                ]}
                default={
                  this.state.push_notifications.toLowerCase() == 'yes' ? 0 : 1
                }
                onPress={this.updatePushNotificationSubscription}
              />
            )}
          </View>
        </View>
        <View>
          <BlueButton
            onPress={() => this.updateProfile(this.state.profile.id)}
            buttonText="SAVE"
            style={localStyle.button}
          />
        </View>
      </LinearGradient>
      //</SafeAreaView>
    );
  }
}

const localStyle = StyleSheet.create({
  containerView: {
    padding: Utils.scale(20),
    paddingTop: Utils.verticalScale(10),
    paddingBottom: 0,
    flex: 1,
  },
  loaderContainer: {
    position: 'absolute',
    height: Utils.height,
    width: Utils.width,
    backgroundColor: 'rgba(150, 200, 200, 0.4)',
    zIndex: 100,
  },
  inputContainerStyle: {
    marginBottom: Utils.verticalScale(5),
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  card: {
    padding: Utils.moderateScale(20),
    paddingTop: Utils.verticalScale(15),
    marginTop: Utils.verticalScale(5),
    paddingBottom: 0,
  },
  button: {
    alignSelf: 'center',
    marginBottom: Utils.scale(5),
  },
  label: {
    color: '#676767',
    fontSize: Utils.moderateScale(12),
    letterSpacing: 1,
  },
  notificationContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Utils.moderateScale(10),
    padding: Utils.moderateScale(15),
  },
});

const mapStateToProps = state => {
  return {
    appData: state.appData.appData,
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    //setScheduleOrderDataAddress: data => dispatch(ActionCreators.setScheduleOrderDataAddress(data)),
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditProfileScreen);
