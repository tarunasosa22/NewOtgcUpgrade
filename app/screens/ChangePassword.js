import React, {Component} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  View,
  Keyboard,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
// import { SafeAreaView, StackActions, NavigationActions } from 'react-navigation';
import styles from './styles';
import {connect} from 'react-redux';
import {ActionCreators} from '../actions/index';
import Images from '../assets/images/index';
import * as Utils from '../lib/utils';
import Input from '../components/Input';
import BlueButton from '../components/button/BlueButton';
import LoaderFullScreen from '../components/LoaderFullScreen';
import LinearGradient from 'react-native-linear-gradient';

class ChangePasswordScreen extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: 'CHANGE PASSWORD',
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
      data: {old_password: '', new_password: '', confirm_password: ''},
      errors: {old_password: '', new_password: '', confirm_password: ''},
      loading: false,
      focusedElement: '',
    };
    this._mounted = false;
    this.inputs = {};
    this.changePassword = this.changePassword.bind(this);
  }

  componentDidMount() {
    this._mounted = true;
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  focusField(key) {
    this.inputs[key] && this.inputs[key].focus();
  }

  changePassword() {
    let error = false;
    let errors = {};

    if (!this.state.data.old_password) {
      if (!error) {
        this.focusField('old_password');
      }
      errors.old_password = 'Please enter old password';
      error = true;
    } else {
      errors.old_password = '';
    }
    if (!this.state.data.new_password) {
      if (!error) {
        this.focusField('new_password');
      }
      errors.new_password = 'Please enter new password';
      error = true;
    } else {
      errors.new_password = '';
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
      this.state.data.new_password !== this.state.data.confirm_password
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
      'change-password',
      {...this.state.data, user_id: this.props.appData.id},
      this.props.appData.token,
      'POST',
      'auth',
    )
      .then(result => {
        if (this._mounted) {
          if (result.status === false) {
            let message = result?.message || result?.msg;
            if (message) {
              this.setState({loading: false});
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert('Opps!', message);
              }
            } else {
              this.setState({loading: false});
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  'Opps!',
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
              }
            }
          } else if (result.status == true) {
            this.setState({
              data: {old_password: '', new_password: '', confirm_password: ''},
              errors: {
                old_password: '',
                new_password: '',
                confirm_password: '',
              },
              loading: false,
            });
            Utils.displayAlert('Info!', 'Your password has been updated');
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

  render() {
    return (
      //<SafeAreaView style={ styles.container }>
      <LinearGradient colors={['#3b2eb6', '#21e381']} style={styles.container}>
        <ScrollView
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          keyboardShouldPersistTaps="handled">
          <LoaderFullScreen loading={this.state.loading} />
          <View style={[styles.card, localStyle.card]}>
            <View style={localStyle.content}>
              <View style={localStyle.oldPasswordContainer}>
                <Input
                  label="CURRENT PASSWORD"
                  secureTextEntry={true}
                  returnKeyType="next"
                  autoCorrect={false}
                  blurOnSubmit={false}
                  containerStyle={{marginBottom: Utils.scale(5)}}
                  autoCapitalize="none"
                  refCallback={ref => (this.inputs.old_password = ref)}
                  error={this.state.errors.old_password}
                  value={this.state.data.old_password}
                  focusElement={() => this.focusField('old_password')}
                  onSubmitEditing={() => this.focusField('new_password')}
                  onChangeText={old_password => {
                    this.state.errors.old_password = '';
                    this.state.data.old_password = old_password;
                    this.setState({
                      data: this.state.data,
                      errors: this.state.errors,
                    });
                  }}
                />
              </View>
              <View style={localStyle.confirmPasswordContainer}>
                <Input
                  label="NEW PASSWORD"
                  secureTextEntry={true}
                  returnKeyType="next"
                  autoCorrect={false}
                  blurOnSubmit={false}
                  containerStyle={{marginBottom: Utils.scale(5)}}
                  autoCapitalize="none"
                  refCallback={ref => (this.inputs.new_password = ref)}
                  error={this.state.errors.new_password}
                  value={this.state.data.new_password}
                  focusElement={() => this.focusField('new_password')}
                  onSubmitEditing={() => this.focusField('confirm_password')}
                  onChangeText={new_password => {
                    this.state.errors.new_password = '';
                    this.state.data.new_password = new_password;
                    this.setState({
                      data: this.state.data,
                      errors: this.state.errors,
                    });
                  }}
                />
              </View>
              <View style={localStyle.confirmPasswordContainer}>
                <Input
                  label="CONFIRM NEW PASSWORD"
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
              onPress={this.changePassword}
              buttonText="SUBMIT"
              style={localStyle.submitButton}
            />
          </View>
        </ScrollView>
      </LinearGradient>
      //</SafeAreaView>
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
  oldPasswordContainer: {
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

const mapStateToProps = state => {
  return {
    appData: state.appData.appData,
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    //setPendingOrderList: data => dispatch(ActionCreators.setPendingOrderList(data)),
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChangePasswordScreen);
