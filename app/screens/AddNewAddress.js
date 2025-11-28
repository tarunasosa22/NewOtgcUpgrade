import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  Platform,
  Dimensions,
  SafeAreaView,
} from 'react-native';
// import {SafeAreaView} from 'react-navigation';
import BlueButton from '../components/button/BlueButton';
import styles from './styles';
import Images from '../assets/images/index';
import LoaderView from '../components/LoaderView';
import {connect} from 'react-redux';
import {ActionCreators} from '../actions/index';
import * as Utils from '../lib/utils';
import RadioButton from '../components/RadioButton';
import Input from '../components/Input';
import PickerInput from '../components/PickerInput';
import LinearGradient from 'react-native-linear-gradient';
import {Picker} from '@react-native-picker/picker';
import SelectDropdown from 'react-native-select-dropdown';
import {utils} from '@react-native-firebase/app';

const {width} = Dimensions.get('screen');

class AddNewAddressScreen extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: 'ADD NEW ADDRESS',
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
      selectedAddress: {},
      address: {
        first_name: this.props.appData.first_name,
        last_name: this.props.appData.last_name,
        mobile: '',
        address2: '',
        address1: '',
        cross_street: '',
        state_id: '',
        city_id: '',
        zip_code: '',
        doorman_building: 'yes',
      },
      errors: {
        first_name: '',
        last_name: '',
        mobile: '',
        address2: '',
        address1: '',
        state_id: '',
        city_id: '',
        zip_code: '',
        doorman_building: '',
      },
      keyboardVisible: false,
      loading: false,
      loadingStates: false,
      loadingCities: false,
      stateList: [],
      cityList: [],
    };
    this.inputs = {};
    this._mounted = false;
    this.onChangeTextCallback = this.onChangeTextCallback.bind(this);
    this.mobileNumber = '';
    this.saveAddress = this.saveAddress.bind(this);
    this.handleCellPhoneInput = this.handleCellPhoneInput.bind(this);
    this.keyboardWillShowSub =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
        : Keyboard.addListener('keyboardDidShow', this.keyboardWillShow);
    this.keyboardWillHideSub =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardWillHide', this.keyboardWillHide)
        : Keyboard.addListener('keyboardDidHide', this.keyboardWillHide);
  }

  componentDidMount() {
    this._mounted = true;
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });
    this.fetchStates().then(fetchedStates => {
      if (fetchedStates) {
        this.fetchCities(1).then(fetchedCities => {
          if (fetchedCities) {
            this.state.address.state_id = 1;
            this.state.address.city_id = 1;
            this.setState({address: this.state.address});
          } else {
            this.state.address.state_id = 1;
            this.setState({address: this.state.address});
          }
        });
      }
    });
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  focusField(key) {
    this.inputs[key] && this.inputs[key].focus();
  }

  async fetchStates() {
    this.setState({loadingStates: true});
    const result = await Utils.makeApiRequest(
      'state',
      {country_id: 1},
      this.props.appData.token,
      'GET',
      '',
    ).catch(error => {
      console.log(error);
      throw new Error(error);
    });
    if (this._mounted) {
      if (result.status === false) {
        this.setState({loadingStates: false});
        if (this.props.navigation.isFocused()) {
          Utils.displayAlert(
            '',
            'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
          );
        }
        return false;
      } else if (result.status == true) {
        this.setState({
          stateList: result.data,
          loadingStates: false,
        });
        return true;
      } else {
        this.setState({loadingStates: false});
        if (this.props.navigation.isFocused()) {
          Utils.displayAlert(
            '',
            result.msg ||
              'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
          );
        }
        return false;
      }
    }
  }

  fetchCities(state_id = null) {
    if (state_id) {
      this.setState({loadingCities: true});
      return Utils.makeApiRequest(
        `state/${state_id}`,
        {},
        this.props.appData.token,
        'GET',
        'city',
      )
        .then(result => {
          if (this._mounted) {
            if (result.status === false) {
              this.setState({loadingCities: false});
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  '',
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
              }
              return false;
            } else if (result.status == true) {
              this.setState({
                cityList: result.data,
                loadingCities: false,
              });
              return true;
            } else {
              this.setState({loadingCities: false});
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert('', result.msg || 'Invalid Request');
              }
              return false;
            }
          }
        })
        .catch(error => {
          console.log(error);
          throw new Error(error);
        });
    }
  }

  saveAddress() {
    let error = false,
      errors = {};
    let address = this.state.address;
    let errorNameFieldMap = {
      first_name: 'Please enter first name',
      last_name: 'Please enter last name',
      mobile: 'Please enter cellphone number',
      address1: 'Please enter street address',
      address2: 'Please enter apartment number',
      state_id: 'Please select state',
      city_id: 'Please select city',
      doorman_building: 'Please select an option',
      zip_code: 'Please enter zip code',
    };

    for (let field in address) {
      if (field == 'mobile') {
        if (address.mobile == '') {
          if (error == false) {
            this.focusField('mobile');
          }
          errors.mobile = errorNameFieldMap.mobile;
          error = true;
        } else if (
          /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/.test(address.mobile) == false
        ) {
          if (error == false) {
            this.focusField('mobile');
          }
          errors.mobile = 'Please enter a valid cell phone number';
          error = true;
        }
      } else if (address[field] == '') {
        if (error == false) {
          this.focusField(field);
        }
        errors[field] = errorNameFieldMap[field];
        error = true;
      }
    }

    this.setState({errors: errors});

    if (error) {
      return;
    }

    Keyboard.dismiss();

    this.setState({loading: true});

    Utils.makeApiRequest(
      ``,
      {...this.state.address, user_id: this.props.appData.id},
      this.props.appData.token,
      'POST',
      'user-address',
    )
      .then(result => {
        if (this._mounted) {
          if (result.status === false) {
            let message = result?.message || result?.msg;
            if (message) {
              this.setState({loading: false});
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert('', message);
              }
            } else {
              this.setState({loading: false});
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  '',
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
              }
            }
          } else if (result.status === true) {
            this.setState({
              address: {
                first_name: '',
                last_name: '',
                mobile: '',
                address2: '',
                address1: '',
                state_id: '',
                city_id: '',
                zip_code: '',
                doorman_building: 'yes',
                cross_street: '',
              },
              loading: false,
            });
            Utils.displayAlert(
              'Info!',
              result.msg || 'Address has been saved successfully',
              'OK',
              null,
              () => {
                this.props.toggleNewAddessAdded();
                this.props.navigation.navigate('MyAddressesD');
              },
              false,
              false,
            );
          } else if (
            typeof result.zip_available != 'undefined' &&
            !result.zip_available === false
          ) {
            this.setState({loading: false});
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                result.msg ||
                  'We are currently not available at your location.',
              );
            }
          } else {
            this.setState({loading: false});
            if (this.props.navigation.isFocused()) {
              Utils.displayAlresultert(
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
    this.state.address[input] = value;
    this.setState({errors: this.state.errors, address: this.state.address});
  }

  async handleCellPhoneInput(value) {
    let newValue = Utils.formatPhoneNumber(value);
    // for (let i = 0, index = 0; i < value.length; i++) {
    //   let charCode = value.charCodeAt(i);
    //   if (charCode >= 48 && charCode <= 57) {
    //     if (index === 0) {
    //       newValue += '(' + value.charAt(i);
    //     } else if (index === 2) {
    //       newValue += value.charAt(i) + ') ';
    //     } else if (index === 5) {
    //       newValue += value.charAt(i) + '-';
    //     } else {
    //       newValue += value.charAt(i);
    //     }
    //     index++;
    //   }
    // }
    this.state.errors.mobile = '';
    this.state.address.mobile = newValue;
    await this.setState({
      errors: this.state.errors,
      address: this.state.address,
    });
  }

  keyboardWillShow = event => {
    this.setState({keyboardVisible: true});
  };

  keyboardWillHide = event => {
    this.setState({keyboardVisible: false});
  };

  render() {
    console.log(this.state.stateList);
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3b2eb6', '#21e381']}
          style={styles.container}>
          {this.state.loading ||
          this.state.loadingStates ||
          this.state.loadingCities ? (
            <View style={localStyle.loaderContainer}>
              <LoaderView
                loading={
                  this.state.loading ||
                  this.state.loadingCountries ||
                  this.state.loadingStates ||
                  this.state.loadingCities
                }
              />
            </View>
          ) : null}
          <KeyboardAvoidingView
            behavior="padding"
            style={localStyle.containerView}>
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
                  value={this.state.address.first_name}
                  error={this.state.errors.first_name}
                  focusElement={() => this.focusField('first_name')}
                  refCallback={input => (this.inputs['first_name'] = input)}
                  onSubmitEditing={() => this.focusField('last_name')}
                  onChangeText={first_name =>
                    this.onChangeTextCallback('first_name', first_name)
                  }
                />
                <View style={localStyle.placeholderBWColumn} />
                <Input
                  label="LAST NAME"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  value={this.state.address.last_name}
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
                  label="CELL PHONE NUMBER"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  maxLength={12}
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  value={this.state.address.mobile}
                  error={this.state.errors.mobile}
                  focusElement={() => this.focusField('mobile')}
                  refCallback={input => (this.inputs['mobile'] = input)}
                  onSubmitEditing={() => this.focusField('address1')}
                  onChangeText={this.handleCellPhoneInput}
                />
              </View>
              <View style={localStyle.row}>
                <Input
                  label="STREET ADDRESS"
                  returnKeyType="next"
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  value={this.state.address.address1}
                  error={this.state.errors.address1}
                  focusElement={() => this.focusField('address1')}
                  refCallback={input => (this.inputs['address1'] = input)}
                  onSubmitEditing={() => this.focusField('address2')}
                  onChangeText={address1 =>
                    this.onChangeTextCallback('address1', address1)
                  }
                />
              </View>
              <View style={localStyle.row}>
                <Input
                  label="APT #"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  value={this.state.address.address2}
                  error={this.state.errors.address2}
                  focusElement={() => this.focusField('address2')}
                  refCallback={input => (this.inputs['address2'] = input)}
                  onSubmitEditing={() => this.focusField('cross_street')}
                  onChangeText={address2 =>
                    this.onChangeTextCallback('address2', address2)
                  }
                />
              </View>
              <View style={localStyle.row}>
                <Input
                  label="CROSS STREET(s)"
                  returnKeyType="done"
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  value={this.state.address.cross_street}
                  focusElement={() => this.focusField('cross_street')}
                  refCallback={input => (this.inputs['cross_street'] = input)}
                  onChangeText={cross_street =>
                    this.onChangeTextCallback('cross_street', cross_street)
                  }
                />
              </View>
              <View style={{flexDirection: 'row', gap: 8}}>
                <View>
                  {/* <Picker
                    placeholder={'Select City'}
                    style={{
                      width: width * 0.4,
                      backgroundColor: '#e7e7e7',
                      borderRadius: 4,
                    }}
                    selectedValue={this.state.address.city_id}
                    onValueChange={value => {
                      Keyboard.dismiss();
                      console.log(value);
                      this.state.errors.city_id = '';
                      this.state.address.city_id = value;

                      this.setState({
                        address: this.state.address,
                        errors: this.state.errors,
                      });
                    }}>
                    <Picker.Item value={0} label="Select City" />

                    {this.state.cityList.map(obj => {
                      return (
                        <Picker.Item
                          key={obj.id}
                          label={obj.name}
                          value={obj.id}
                        />
                      );
                    })}
                  </Picker> */}

                  <SelectDropdown
                    onSelect={(selectedItem, index) => {
                      Keyboard.dismiss();
                      this.state.errors.city_id = '';
                      this.state.address.city_id = selectedItem.id;

                      this.setState({
                        address: this.state.address,
                        errors: this.state.errors,
                        selectedAddress: selectedItem,
                      });
                    }}
                    data={this.state.cityList}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      return selectedItem.name;
                    }}
                    defaultValue={this.state.cityList[0]}
                    defaultButtonText="Select City"
                    buttonTextStyle={{fontSize: 15}}
                    rowTextForSelection={(item, inex) => {
                      return item.name;
                    }}
                    buttonStyle={{width: Utils.width * 0.4, borderRadius: 4}}
                  />
                  <Text
                    style={[
                      styles.errorText,
                      {paddingTop: 0, marginBottom: Utils.moderateScale(5)},
                    ]}>
                    {this.state.errors.city_id}
                  </Text>
                </View>

                <View>
                  {/* <Picker
                    placeholder={'Select State'}
                    style={{
                      width: width * 0.4,
                      backgroundColor: '#e7e7e7',
                      borderRadius: 4,
                    }}
                    selectedValue={this.state.address.state_id}
                    onValueChange={value => {
                      Keyboard.dismiss();
                      this.state.address = {
                        ...this.state.address,
                        state_id: value,
                        // city_id: '',
                      };
                      this.state.errors.state_id = '';
                      this.setState({
                        address: this.state.address,
                        // cityList: [],
                        errors: this.state.errors,
                      });
                      // this.fetchCities(value);
                    }}>
                    <Picker.Item value={0} label="Select State" />
                    {this.state.stateList
                      ?.filter(item => item?.name)
                      .map(obj => {
                        console.log(obj);
                        return (
                          <Picker.Item
                            key={obj?.id}
                            label={obj?.name}
                            value={obj?.id}
                          />
                        );
                      })}
                  </Picker> */}

                  <SelectDropdown
                    onSelect={(selectedItem, index) => {
                      Keyboard.dismiss();
                      this.state.address = {
                        ...this.state.address,
                        state_id: selectedItem.id,
                        // city_id: '',
                      };
                      this.state.errors.state_id = '';
                      this.setState({
                        address: this.state.address,
                        // cityList: [],
                        errors: this.state.errors,
                      });
                      // this.fetchCities(value);
                    }}
                    buttonTextStyle={{fontSize: 15}}
                    dropdownStyle={{width: Utils.width * 0.36}}
                    data={this.state.stateList}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      return selectedItem.name;
                    }}
                    defaultValue={this.state.stateList[0]}
                    defaultButtonText="Select State"
                    rowTextForSelection={(item, inex) => {
                      return item.name;
                    }}
                    buttonStyle={{width: Utils.width * 0.4, borderRadius: 4}}
                  />
                  <Text
                    style={[
                      styles.errorText,
                      {paddingTop: 0, marginBottom: Utils.moderateScale(5)},
                    ]}>
                    {this.state.errors.city_id}
                  </Text>
                </View>

                <View style={localStyle.placeholderBWColumn} />
              </View>

              <View style={localStyle.row}>
                <Input
                  label="ZIP CODE"
                  returnKeyType="done"
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  focusElement={() => this.focusField('zip_code')}
                  value={this.state.address.zip_code}
                  error={this.state.errors.zip_code}
                  refCallback={input => (this.inputs['zip_code'] = input)}
                  onChangeText={zip_code =>
                    this.onChangeTextCallback('zip_code', zip_code)
                  }
                />
              </View>
              <View
                style={[
                  localStyle.row,
                  localStyle.doormanBuildingContainer,
                  this.state.keyboardVisible
                    ? localStyle.keyboardShowing
                    : localStyle.keyboardNotShowing,
                ]}>
                <Text style={localStyle.label}>DOORMAN BUILDING</Text>
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
                  default={this.state.address.doorman_building == 'yes' ? 0 : 1}
                  onPress={value => {
                    this.state.address.doorman_building = value;
                    this.setState({address: this.state.address});
                  }}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <View>
            <BlueButton
              onPress={this.saveAddress}
              buttonText="SAVE"
              style={localStyle.button}
            />
          </View>
        </LinearGradient>
      </SafeAreaView>
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
  inputContainerStyle: {
    marginBottom: Utils.verticalScale(5),
    flex: 1,
  },
  loaderContainer: {
    position: 'absolute',
    height: Utils.height,
    width: Utils.width,
    backgroundColor: 'rgba(150, 200, 200, 0.4)',
    zIndex: 100,
  },
  row: {
    flexDirection: 'row',
  },
  placeholderBWColumn: {
    flex: 1,
  },
  label: {
    color: '#b1b6bb',
    fontSize: Utils.moderateScale(12),
    letterSpacing: 1,
  },
  doormanBuildingContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 28,
  },
  card: {
    padding: Utils.moderateScale(20),
    paddingTop: Utils.verticalScale(15),
    marginTop: Utils.verticalScale(5),
    marginBottom: Utils.moderateScale(4),
  },
  button: {
    alignSelf: 'center',
    marginBottom: Utils.scale(5),
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(14),
    color: 'black',
  },
  keyboardShowing: {
    marginBottom: Utils.verticalScale(110),
  },
  keyboardNotShowing: {
    marginBottom: Utils.verticalScale(20),
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: 'gray',
    borderRadius: 2,
    color: 'black',
    width: Utils.verticalScale(110),
    height: 50,
    minWidth: Utils.verticalScale(110),
    backgroundColor: '#f0f0f0',
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
    backgroundColor: '#f0f0f0',
    paddingRight: 30,
    marginBottom: 10, // to ensure the text is never behind the icon
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
    toggleNewAddessAdded: data =>
      dispatch(ActionCreators.toggleNewAddessAdded(data)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddNewAddressScreen);
