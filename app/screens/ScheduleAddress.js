import React, { Component } from 'react';
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
  SafeAreaView,
  Dimensions,
} from 'react-native';
// import {SafeAreaView} from 'react-navigation';
import BlueButton from '../components/button/BlueButton';
import styles from './styles';
// import {Dropdown} from 'react-native-material-dropdown';
import { connect } from 'react-redux';
import Images from '../assets/images/index';
import { ActionCreators } from '../actions/index';
import * as Utils from '../lib/utils';
import Input from '../components/Input';
import RadioButton from '../components/RadioButton';
import LoaderView from '../components/LoaderView';
import PickerInput from '../components/PickerInput';
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import SelectDropdown from 'react-native-select-dropdown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
const { width } = Dimensions.get('screen');
class ScheduleAddressScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'SCHEDULE',
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
      selectedShipInfo: null,
      checkValue: '',
      selectedAddress: !this.props.completeAddressDetails.is_add_new_address
        ? this.props.completeAddressDetails.pickup_address_id
        : 'Saved Addresses', // 'Saved Addresses' value is used for placeholder instead of ''. Hence all checks for '' instead use 'Saved Addresses'
      oldSelectedAddress: !this.props.completeAddressDetails.is_add_new_address
        ? this.props.completeAddressDetails.pickup_address_id
        : 'Saved Addresses',
      addressList: this.props.completeAddressDetails.addressList,
      addNewAddress: this.props.completeAddressDetails.is_add_new_address,
      keyboardVisible: false,
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
        email: '',
        password: '',
        hear_about_us: '',
      },
      loading:
        this.props.completeAddressDetails?.stateList?.length > 0 ? false : true,
      loadingStates:
        this.props.completeAddressDetails?.stateList?.length > 0 ? false : true,
      loadingCities: false,
      newAddress:
        this.props.completeAddressDetails?.address_details?.length > 0
          ? this.props.completeAddressDetails.address_details[0]
          : {
            first_name: this.props.appData.first_name,
            last_name: this.props.appData.last_name,
            mobile: '',
            address2: '',
            address1: '',
            state_id: '',
            cross_street: '',
            city_id: '',
            zip_code: '',
            doorman_building: 'yes',
            city: '',
            state: '',
            email: '',
            password: '',
            hear_about_us: '',
          },
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
      stateList: this.props.completeAddressDetails.stateList,
      cityList: this.props.completeAddressDetails.cityList,
    };
    this._mounted = false;
    this.inputs = {};
    this.inputsContainerComponents = {};
    this.onAddNewAddressPress = this.onAddNewAddressPress.bind(this);
    this.onChangeTextCallback = this.onChangeTextCallback.bind(this);
    this.navToSelectCard = this.navToSelectCard.bind(this);
    this.setInputsBlur = this.setInputsBlur.bind(this);
    this.onChangeSelectedAddress = this.onChangeSelectedAddress.bind(this);
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
    if (this.state.stateList.length <= 0) {
      this.fetchStates().then(() => {
        this.setState({ loading: false });
        if (this.props.signUpData?.isSignUpDone) { this.fetchAddresses(); } else {
          this.onAddNewAddressPress()
        }
      });
    }

    this.props.navigation.addListener('focus', () => {
      if (this.props.signUpData?.isSignUpDone) { this.fetchAddresses(); }
    });
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  focusField(key) {
    this.inputs[key] && this.inputs[key].focus();
  }

  setInputsBlur() {
    Keyboard.dismiss();
    for (let i in this.inputsContainerComponents) {
      this.inputsContainerComponents[i].blurInput();
    }
  }

  fetchAddresses() {
    Utils.makeApiRequest(
      `user/${this.props.appData.id}`,
      {},
      this.props.appData.token,
      'GET',
      'user-address',
    )
      .then(result => {
        if (this._mounted) {
          if (result.status === false) {
            this.setState({ loading: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
          } else if (result.status === true) {
            const resultData = result.data;

            if (resultData.length === 0) {
              this.autoFillNewAddressFields();
            }
            // this.setState({ addressList: resultData }, () => {
            //   let address = null;
            //   let addressArray = resultData.filter(items => {
            //     return items.primary == 'yes';
            //   });
            //   if (addressArray.length > 0) {
            //     address = this.getAddress(addressArray[0].id);
            //     console.log(address, 'asaasass');
            //   } else {
            //     address = this.getAddress();
            //   }
            //   this.setState({
            //     // selectedShipInfo: {
            //     //   state: this.getSelectedState(state_id),
            //     //   city: this.getSelectedCity(city_id),
            //     // },
            //     selectedAddress: address?.id,
            //     oldSelectedAddress: address?.id,
            //   });
            //   this.autoFillNewAddressFields(address).then(() => {
            //     if (resultData.length === 0) {
            //       this.setState({ loading: false, addNewAddress: true });
            //     } else {
            //       this.setState({ loading: false, addNewAddress: false });
            //     }
            //   });
            // });
            this.setState({ addressList: resultData }, () => {
              let address = null;
              let primaryAddresses = resultData.filter(item => item.primary === "yes");
              
              if (primaryAddresses.length > 0) {
                  address = this.getAddress(primaryAddresses[0].id);
              } else {
                  address = this.getAddress();
              }
          
              this.setState({
                  selectedAddress: address?.id,
                  oldSelectedAddress: address?.id,
              });
          
              this.autoFillNewAddressFields(address).then(() => {
                  this.setState({ loading: false, addNewAddress: resultData.length === 0 });
              });
          });
          } else {
            this.setState({ loading: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert('', result.msg || 'Invalid Request');
            }
          }
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  getStateName(id = null) {
    if (id) {
      for (let i = 0; i < this.state.stateList.length; i++) {
        if (this.state.stateList[i].id == id) {
          return this.state.stateList[i].name;
        }
      }
    } else {
      return '';
    }
  }

  getCityName(id = null) {
    if (id) {
      for (let i = 0; i < this.state.cityList.length; i++) {
        if (this.state.cityList[i].id == id) {
          return this.state.cityList[i].name;
        }
      }
    } else {
      return '';
    }
  }

  getSelectedState = id => {
    return this.state.stateList.find(state => state.id === id);
  };
  getSelectedCity = id => {
    return this.state.cityList.find(city => city.id === id);
  };

  fetchStates() {
    this.setState({ loadingStates: true });
    return Utils.makeApiRequest(
      'state',
      { country_id: 1 },
      this.props.appData.token,
      'GET',
      '',
    )
      .then(result => {
        if (this._mounted) {
          if (result.status === false) {
            this.setState({ loadingStates: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
          } else if (result.status == true) {
            this.setState({
              stateList: result.data,
              // checkValue: result.result[0].name,
              loadingStates: false,
            });
          } else {
            this.setState({ loadingStates: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert('', result.msg || 'Invalid Request');
            }
          }
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  fetchCities(state_id = null) {
    if (state_id) {
      this.setState({ loadingCities: true });
      return Utils.makeApiRequest(
        `state/${state_id}`,
        { state_id: state_id },
        this.props.appData.token,
        'GET',
        'city',
      )
        .then(result => {
          if (this._mounted) {
            if (result.status === false) {
              this.setState({ cityList: [], loadingCities: false });
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  '',
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
              }
            } else if (result.status == true) {
              this.setState({ cityList: result.data, loadingCities: false });
            } else {
              this.setState({ cityList: [], loadingCities: false });
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert('', result.msg || 'Invalid Request');
              }
            }
          }
        })
        .catch(error => {
          console.log(error);
          throw new Error(error);
        });
    } else {
      return true;
    }
  }

  // getAddress(id = null) {
  //   if (this.state.addressList.length > 0) {
  //     for (let i = 0; i < this.state.addressList.length; i++) {
  //       let address = this.state.addressList[i];
  //       if (id === null) {
  //         if (address.primary == '0') {
  //           return address;
  //           break;
  //         }
  //       } else {
  //         if (address.id == id) {
  //           return address;
  //         }
  //       }
  //     }
  //     return null;
  //   } else {
  //     return null;
  //   }
  // }
  getAddress(id = null) {
    if (this.state.addressList.length > 0) {
        for (let i = 0; i < this.state.addressList.length; i++) {
            let address = this.state.addressList[i];
            if (id === null) {
                if (address.primary === "yes") {
                    return address;
                }
            } else {
                if (address.id == id) {
                    return address;
                }
            }
        }
    }
    return null;
}

  autoFillNewAddressFields(address = null) {
    // function to set data after fetching states and cities
    var setDataWhenAddressNotEmpty = (state_id = '') => {
      let city_id = '';
      if (this.state.cityList.length > 0) {
        for (let i = 0; i < this.state.cityList.length; i++) {
          if (this.state.cityList[i].id == address.city_id) {
            city_id = address.city_id;
          }
        }
      }

      if (state_id == '' && this.state.stateList.length > 0) {
        state_id = 1;
      }

      let newAddress = {
        first_name: address.first_name,
        last_name: address.last_name,
        mobile: address.mobile,
        address2: address.address2,
        address1: address.address1,
        state_id: state_id,
        cross_street: address.cross_street,
        state: this.getStateName(state_id),
        city_id: city_id,
        city: this.getCityName(city_id),
        zip_code: address.zip_code,
        doorman_building: address.doorman_building,
        id: address.id,
        email: this.props.signUpData?.email,
        passowrd: address.password,
        hear_about_us: address.hear_about_us
      };

      let selectedShipInfo = {
        state: this.getSelectedState(state_id),
        city: this.getSelectedCity(city_id),
      };

      let errors = {
        first_name: '',
        last_name: '',
        mobile: '',
        address2: '',
        address1: '',
        state_id: '',
        city_id: '',
        zip_code: '',
        password: '',
        doorman_building: '',
        hearAboutUs: '',
      };

      this.setState({
        selectedAddress: newAddress?.id,
        oldSelectedAddress: address?.id,
        newAddress: newAddress,
        addNewAddress: false,
        errors: errors,
        selectedShipInfo: selectedShipInfo,
      });
    };

    const setDataWhenAddressEmpty = () => {
      if (
        this.state.addressList.length <= 0 ||
        this.state.selectedAddress !== 'Saved Addresses'
      ) {
        // clear fields when automatically filled by selecting the dropdown
        let state_id = this.state.stateList.length > 0 ? 1 : '';
        let city_id =
          this.state.stateList.length > 0 && this.state.cityList.length > 0
            ? 1
            : '';
        this.state.newAddress = {
          first_name: this.props.appData.first_name,
          last_name: this.props.appData.last_name,
          mobile: '',
          address2: '',
          address1: '',
          cross_street: '',
          state_id: state_id,
          state: this.getStateName(state_id),
          city_id: city_id,
          city: this.getCityName(city_id),
          zip_code: '',
          doorman_building: 'yes',
          email: this.props.signUpData?.email,
          password: '',
          hear_about_us: ''
        };
        let selectedShipInfo = {
          state: this.getSelectedState(state_id),
          city: this.getSelectedCity(city_id),
        };
        this.setState({ selectedShipInfo: selectedShipInfo })
      }
      this.setState({
        selectedAddress: 'Saved Addresses',
        oldSelectedAddress: 'Saved Addresses',
        newAddress: this.state.newAddress,
        addNewAddress: true,
      });
      setTimeout(() => this.focusField('first_name'), 200);
    };

    return new Promise((resolve, reject) => {
      let state_id = '',
        shouldFetchCities = false;
      if (address) {
        for (let i = 0; i < this.state.stateList.length; i++) {
          if (this.state.stateList[i].id == address.state_id) {
            state_id = address.state_id;
            shouldFetchCities = true;
            break;
          }
        }
      } else {
        if (
          this.state.addressList.length <= 0 ||
          this.state.selectedAddress !== 'Saved Addresses'
        ) {
          shouldFetchCities = true;
          state_id = 1;
        }
      }

      if (shouldFetchCities) {
        this.fetchCities(state_id).then(() => {
          address
            ? setDataWhenAddressNotEmpty(state_id)
            : setDataWhenAddressEmpty();
          resolve(true);
        });
      } else {
        if (this.state.stateList.length <= 0) {
          this.setState({ cityList: [] });
        }
        address ? setDataWhenAddressNotEmpty() : setDataWhenAddressEmpty();
        resolve(true);
      }
    });
  }

  onAddNewAddressPress() {
    if (this.state.addressList.length > 0) {
      if (!this.state.addNewAddress) {
        this.autoFillNewAddressFields();
      } else {
        this.setState({
          addNewAddress: false,
          errors: {
            first_name: '',
            last_name: '',
            mobile: '',
            address2: '',
            address1: '',
            state_id: '',
            state: '',
            city_id: '',
            city: '',
            zip_code: '',
            doorman_building: '',
            cross_street: '',
            email: this.props.signUpData?.email,
            password: '',
            hear_about_us: '',
          }
        });
      }
    } else if (!this.state.addNewAddress) {
      this.autoFillNewAddressFields();
    } else {
      this.focusField('first_name');
    }
  }

  checkZipCode() {
    if (this.state.newAddress.zip_code) {
      this.setState({ loading: true });
      return Utils.makeApiRequest(
        `verify/${this.state.newAddress.zip_code}`,
        {},
        this.props.appData.token,
        'GET',
        'zipcode',
      )
        .then(result => {
          if (this._mounted) {
            this.setState({ loading: false });
            if (result.status === false) {
              if (this.props.navigation.isFocused()) {
                if (result?.msg) {
                  Utils.displayAlert('', result.msg);
                } else {
                  Utils.displayAlert(
                    '',
                    'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                  );
                }
              }
              return false;
            } else if (result.status == true) {
              return true;
            } else {
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
    return false;
  }

  navToSelectCard() {
    if (this.state.addNewAddress || this.state.addressList.length <= 0) {
      let error = false,
        errors = {};
      let address = this.state.newAddress;
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
        email: 'Please enter email',
        password: 'Please enter password',
        hear_about_us: 'Please select hear about us',
      };
      if (this.props.signUpData.isSignUpDone) {
        delete address?.email
        delete address?.password
        delete address?.hear_about_us
      }

      for (let field in address) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passRegex = /^.{6,}$/;
        if (field == 'mobile') {
          if (!address.mobile) {
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
        } else if (passRegex.test(address.password) == false) {
          if (error == false) {
            this.focusField('password');
          }
          errors.password = 'Password must be at least 6 characters';
          error = true;
        }
        else if (!address[field]) {
          if (error == false) {
            this.focusField(field);
          }
          errors[field] = errorNameFieldMap[field];
          error = true;
        }
      }

      this.state.errors = errors;
      this.setState({ errors: this.state.errors });

      if (error) {
        return;
      }
    } else if (this.state.selectedAddress == 'Saved Addresses') {
      Utils.displayAlert(
        '',
        'Please select one of saved addresses or add new address!!!',
      );
      return;
    }
    Keyboard.dismiss();
    let newAddressData = { ...this.state.newAddress }
    if (this.state.addNewAddress || this.state.addressList.length <= 0) {

      this.checkZipCode().then(result => {
        if (result) {
          if (this.props.signUpData.isSignUpDone) {
            this._addUserAddress(newAddressData, result)
          } else {
            this.props.setSignUpUserAddress(newAddressData)
            this.props.navigation.navigate('ScheduleCard');
          }
        }
      });
    } else {
      this.props.setScheduleOrderDataAddress({
        address_details: [newAddressData],
        is_add_new_address: false,
        pickup_address_id: this.state.oldSelectedAddress,
        addressList: this.state.addressList,
        stateList: this.state.stateList,
        cityList: this.state.cityList,
      });
      this.props.navigation.navigate('ScheduleCard');
    }
  }

  _addUserAddress(newAddressData, result) {
    Utils.makeApiRequest(
      ``,
      { ...newAddressData, user_id: this.props.appData.id },
      this.props.appData.token,
      'POST',
      'user-address',
    )
      .then(resultAddress => {
        if (this._mounted) {
          if (resultAddress.status === false) {
            this.setState({ loading: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
          } else if (resultAddress.status === true) {
            this.props.setScheduleOrderDataAddress({
              address_details: [newAddressData],
              is_add_new_address: true,
              pickup_address_id: resultAddress?.data?.id,
              addressList: this.state.addressList,
              stateList: this.state.stateList,
              cityList: this.state.cityList,
            });
            this.props.navigation.navigate('ScheduleCard');
          } else if (
            typeof resultAddress.zip_available != 'undefined' &&
            !resultAddress.zip_available === false
          ) {
            this.setState({ loading: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                result.msg ||
                'We are currently not available at your location.',
              );
            }
          } else {
            this.setState({ loading: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                result.msg || 'Invalid Request',
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

  onChangeSelectedAddress(value) {
    // this.autoFillNewAddressFields(null);
    let address = this.getAddress(value);
    this.autoFillNewAddressFields(address);
  }

  onChangeTextCallback(input, value) {
    this.state.errors[input] = '';
    this.state.newAddress[input] = value;
    this.setState({
      errors: this.state.errors,
      newAddress: this.state.newAddress,
    });
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
    this.state.newAddress.mobile = newValue;
    await this.setState({
      errors: this.state.errors,
      newAddress: this.state.newAddress,
    });
  }

  keyboardWillShow = event => {
    this.setState({ keyboardVisible: true });
  };

  keyboardWillHide = event => {
    this.setState({ keyboardVisible: false });
  };

  render() {
    let preSelectedAddress = this.state.addressList?.find(
      address => address.primary === 'yes',
    );

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
          ) : (
            <View></View>
          )}
          <View style={localStyle.containerView}>
            <Text style={[localStyle.text, localStyle.heading]}>
              PICKUP ADDRESS
            </Text>
            {this.state.addressList.length > 0 && (
              <>
                {/* OLD CODE */}
                {/* <RNPickerSelect
                  style={pickerSelectStyles2}
                  placeholder={{label: 'Saved Address'}}
                  value={this.state.selectedAddress}
                  onValueChange={this.onChangeSelectedAddress}
                  items={this.state.addressList.map(obj => ({
                    id: obj.id,
                    label: obj.address1,
                    value: obj.id,
                  }))}
                  onDonePress={val => {
                    console.log(
                      '🚀 ~ file: ScheduleAddress.js ~ line 653 ~ ScheduleAddressScreen ~ render ~ val',
                      val,
                    );
                  }}
                  useNativeAndroidPickerStyle={false}
                /> */}

                {/* NEW CODE */}
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 8,
                    marginBottom: 8,
                  }}>
                  {/* <Picker
                    placeholder={'Saved Address'}
                    selectedValue={this.state.selectedAddress?.id}
                    onValueChange={this.onChangeSelectedAddress}
                    onDonePress={val => {
                      console.log(
                        '🚀 ~ file: ScheduleAddress.js ~ line 653 ~ ScheduleAddressScreen ~ render ~ val',
                        val,
                      );
                    }}>
                    <Picker.Item label="Select Address" value={0} />
                    {this.state.addressList.map(obj => {
                      return (
                        <Picker.Item
                          key={obj.id}
                          label={obj.address1}
                          value={obj.id}
                        />
                      );
                    })}
                  </Picker> */}
                  <SelectDropdown
                    buttonTextStyle={{ fontSize: 15 }}
                    onSelect={(selectedItem, index) => {
                      this.onChangeSelectedAddress(selectedItem.id);
                    }}
                    data={this.state.addressList}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      return selectedItem.address1;
                    }}
                    defaultValue={preSelectedAddress}
                    defaultButtonText="Select Address"
                    rowTextForSelection={(item, inex) => {
                      return item.address1;
                    }}
                    buttonStyle={{ width: Utils.width * 0.88, borderRadius: 8 }}
                  />
                </View>
                <View>
                  {/* <Dropdown
                  fontSize={Utils.moderateScale(14, 0.5)}
                  labelFontSize={Utils.moderateScale(12)}
                  baseColor="black"
                  textColor="#17114f"
                  onFocus={this.setInputsBlur}
                  data={this.state.addressList}
                  lineWidth={0}
                  value={this.state.selectedAddress}
                  fontFamily="Poppins-Regular"
                  containerStyle={localStyle.dropdownContainerStyle}
                  onChangeText={this.onChangeSelectedAddress}
                  pickerStyle={localStyle.dropdownPickerStyle}
                  valueExtractor={item => item.id}
                  labelExtractor={item => item.address1}
                  dropdownOffset={{top: 10}}
                /> */}
                </View>
              </>
            )}
            <TouchableOpacity
              style={[styles.card, localStyle.checkboxContainer]}
              onPress={this.onAddNewAddressPress}>
              {this.state.addNewAddress ? (
                <Image
                  style={localStyle.checkbox}
                  source={Images.selectIcon}
                  resizeMode="contain"
                  resizeMethod="resize"
                />
              ) : (
                <View style={localStyle.checkboxCircle} />
              )}
              <Text style={[localStyle.text, localStyle.checkboxText]}>
                ADD NEW ADDRESS
              </Text>
            </TouchableOpacity>
          </View>
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            behavior="padding"
            style={localStyle.newAddressContainer}>
            <View
              // showsVerticalScrollIndicator={false}
              // horizontal={false}
              style={[
                styles.card,
                localStyle.card,
                { marginBottom: Utils.scale(4) },
              ]}
            // showsHorizontalScrollIndicator={false}
            >
              <View style={localStyle.row}>
                <Input
                  label="FIRST NAME"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  editable={this.state.addNewAddress}
                  value={this.state.newAddress.first_name}
                  error={this.state.errors.first_name}
                  focusElement={() => this.focusField('first_name')}
                  refCallback={input => (this.inputs['first_name'] = input)}
                  ref={input =>
                    (this.inputsContainerComponents.first_name = input)
                  }
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
                  editable={this.state.addNewAddress}
                  value={this.state.newAddress.last_name}
                  error={this.state.errors.last_name}
                  ref={input =>
                    (this.inputsContainerComponents.last_name = input)
                  }
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
                  maxLength={12}
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  blurOnSubmit={false}
                  editable={this.state.addNewAddress}
                  value={this.state.newAddress.mobile}
                  error={this.state.errors.mobile}
                  ref={input => (this.inputsContainerComponents.mobile = input)}
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
                  editable={this.state.addNewAddress}
                  value={this.state.newAddress.address1}
                  error={this.state.errors.address1}
                  ref={input =>
                    (this.inputsContainerComponents.address1 = input)
                  }
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
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  blurOnSubmit={false}
                  editable={this.state.addNewAddress}
                  value={this.state.newAddress.address2}
                  error={this.state.errors.address2}
                  ref={input =>
                    (this.inputsContainerComponents.address2 = input)
                  }
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
                  blurOnSubmit={false}
                  editable={this.state.addNewAddress}
                  value={this.state.newAddress.cross_street}
                  error={this.state.errors.cross_street}
                  ref={input =>
                    (this.inputsContainerComponents.cross_street = input)
                  }
                  focusElement={() => this.focusField('cross_street')}
                  refCallback={input => (this.inputs['cross_street'] = input)}
                  onChangeText={cross_street =>
                    this.onChangeTextCallback('cross_street', cross_street)
                  }
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {/* NEW CODE */}
                <View>
                  {/* <Picker
                    placeholder={'Select State'}
                    disabled={!this.state.addNewAddress}
                    style={{backgroundColor: '#efefef', width: width * 0.4}}
                    selectedValue={this.state.newAddress.state_id}
                    enabled={this.state.addNewAddress}
                    onValueChange={value => {
                      Keyboard.dismiss();
                      this.state.newAddress = {
                        ...this.state.newAddress,
                        state_id: value,
                        state: this.getStateName(value),
                        city_id: '',
                        city: '',
                      };
                      this.state.errors.state_id = '';
                      this.setState({
                        newAddress: this.state.newAddress,
                        cityList: [],
                        errors: this.state.errors,
                      });
                      this.fetchCities(value);
                    }}
                    onDonePress={val => {
                      console.log('Done press value', val);
                    }}>
                    <Picker.Item value={0} label="State" />
                    {this.state.stateList
                      ?.filter(item => item?.name)
                      .map(obj => {
                        return (
                          <Picker.Item
                            key={obj.id}
                            label={obj.name}
                            value={obj.id}
                          />
                        );
                      })}
                  </Picker> */}
                  {this.state.stateList.length >= 1 && (
                    <SelectDropdown
                      buttonTextStyle={{ fontSize: 15 }}
                      onSelect={(selectedItem, index) => {
                        Keyboard.dismiss();
                        this.state.newAddress = {
                          ...this.state.newAddress,
                          state_id: selectedItem.id,
                          state: this.getStateName(selectedItem.id),
                          city_id: '',
                          city: '',
                        };
                        this.state.errors.state_id = '';
                        this.setState({
                          newAddress: this.state.newAddress,
                          cityList: [],
                          errors: this.state.errors,
                        });
                        this.fetchCities(selectedItem.id);
                      }}
                      data={this.state.stateList}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem.name;
                      }}
                      defaultButtonText="Select State"
                      defaultValue={this.state.selectedShipInfo?.state}
                      rowTextForSelection={(item, inex) => {
                        return item.name;
                      }}
                      buttonStyle={{ width: Utils.width * 0.4, borderRadius: 8 }}
                      disabled={
                        this.state.selectedShipInfo?.state ? true : false
                      }
                    />
                  )}

                  <Text
                    style={[
                      styles.errorText,
                      { paddingTop: 0, marginBottom: Utils.moderateScale(5) },
                    ]}>
                    {this.state.errors.state_id}
                  </Text>
                </View>

                {/* NEW CODE */}
                <View>
                  {/* <Picker
                    placeholder={'Select City'}
                    style={{backgroundColor: '#efefef', width: width * 0.4}}
                    disabled={!this.state.addNewAddress}
                    enabled={this.state.addNewAddress}
                    selectedValue={this.state.newAddress.city_id}
                    onValueChange={value => {
                      Keyboard.dismiss();
                      this.state.errors.city_id = '';
                      this.state.newAddress.city_id = value;
                      this.state.newAddress.city = this.getCityName(value);
                      this.setState({
                        newAddress: this.state.newAddress,
                        errors: this.state.errors,
                      });
                    }}>
                    <Picker.Item vlaue={0} label="City" />
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

                  {this.state.cityList.length >= 0 && (
                    <SelectDropdown
                      buttonTextStyle={{ fontSize: 15 }}
                      onSelect={(selectedItem, index) => {
                        Keyboard.dismiss();
                        this.state.errors.city_id = '';
                        this.state.newAddress.city_id = selectedItem.id;
                        this.state.newAddress.city = this.getCityName(
                          selectedItem.id,
                        );
                        this.setState({
                          newAddress: this.state.newAddress,
                          errors: this.state.errors,
                        });
                      }}
                      disabled={
                        this.state.selectedShipInfo?.city ? true : false
                      }
                      data={this.state.cityList}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem.name;
                      }}
                      defaultValue={this.state.selectedShipInfo?.city}
                      defaultButtonText="Select City"
                      rowTextForSelection={(item, inex) => {
                        return item.name;
                      }}
                      buttonStyle={{ width: Utils.width * 0.36, borderRadius: 8 }}
                    />
                  )}

                  <Text
                    style={[
                      styles.errorText,
                      { paddingTop: 0, marginBottom: Utils.moderateScale(5) },
                    ]}>
                    {this.state.errors.city_id}
                  </Text>
                </View>
              </View>

              <View style={localStyle.row}>
                <Input
                  label="ZIP CODE"
                  returnKeyType="done"
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  editable={this.state.addNewAddress}
                  focusElement={() => this.focusField('zip_code')}
                  value={this.state.newAddress.zip_code}
                  error={this.state.errors.zip_code}
                  ref={input =>
                    (this.inputsContainerComponents.zip_code = input)
                  }
                  refCallback={input => (this.inputs['zip_code'] = input)}
                  onChangeText={zip_code =>
                    this.onChangeTextCallback('zip_code', zip_code)
                  }
                />
              </View>
              <View
                style={[
                  localStyle.row,
                  { paddingBottom: this.props.signUpData.isSignUpDone ? 10 : 0 },
                  localStyle.doormanBuildingContainer,
                  this.state.keyboardVisible
                    ? localStyle.keyboardShowing
                    : localStyle.keyboardNotShowing,
                ]}>
                <Text style={localStyle.label}>DOORMAN BUILDING</Text>
                {!this.state.loading &&
                  !this.state.loadingStates &&
                  !this.state.loadingCities && (
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
                        this.state.newAddress.doorman_building?.toLowerCase() ==
                          'yes'
                          ? 0
                          : 1
                      }
                      disabled={!this.state.addNewAddress}
                      onPress={value => {
                        this.state.newAddress.doorman_building = value;
                        this.setState({ newAddress: this.state.newAddress });
                      }}
                    />
                  )}
              </View>
              {this.props.signUpData.isSignUpDone ? null : <>
                <Input
                  label="EMAIL"
                  returnKeyType="next"
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={false}
                  error={this.state.errors.email}
                  value={this.state.newAddress.email}
                  focusElement={() => this.focusField('email')}
                  refCallback={input => (this.inputs['email'] = input)}
                  ref={input =>
                    (this.inputsContainerComponents.email = input)
                  }
                  onChangeText={email =>
                    this.onChangeTextCallback('email', email)
                  }
                />

                <View style={localStyle.row}>

                  <Input
                    label="PASSWORD"
                    returnKeyType="done"
                    containerStyle={localStyle.inputContainerStyle}
                    autoCorrect={false}
                    blurOnSubmit={false}
                    editable={this.state.addNewAddress}
                    value={this.state.newAddress.passowrd}
                    error={this.state.errors.password}
                    ref={input =>
                      (this.inputsContainerComponents.passowrd = input)
                    }
                    autoCapitalize="none"
                    secureTextEntry={true}
                    focusElement={() => this.focusField('password')}
                    refCallback={input => (this.inputs['password'] = input)}
                    onChangeText={pass =>
                      this.onChangeTextCallback('password', pass)
                    }
                  />
                </View>
                <View style={localStyle.inputContainerStyle}>
                  <View>
                    <Text style={[localStyle.text, localStyle.label]}>
                      {' '}
                      HOW DID YOU HEAR ABOUT US?
                    </Text>
                  </View>
                  <SelectDropdown
                    buttonTextStyle={{ fontSize: 15 }}
                    onSelect={(selectedItem, index) => {
                      this.state.errors.hear_about_us = '';
                      this.state.newAddress.hear_about_us = selectedItem.data;
                      // this.setState({
                      //   data: this.state.data,
                      //   errors: this.state.errors,
                      // });

                      this.setState({
                        errors: this.state.errors,
                        newAddress: this.state.newAddress,
                      });
                    }}
                    data={this.state.hearAboutUs}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      return selectedItem.data;
                    }}
                    defaultButtonText="Select Option"
                    rowTextForSelection={(item, inex) => {
                      return item.data;
                    }}
                    buttonStyle={{ width: Utils.width * 0.77, borderRadius: 8, marginBottom: this.state?.errors?.hear_about_us ? 0 : 20 }}
                  />

                  <Text style={[styles.errorText, { marginBottom: this.state?.errors?.hear_about_us ? 20 : 0 }]}>
                    {this.state?.errors?.hear_about_us}
                  </Text>
                </View>
              </>}
            </View>
          </KeyboardAwareScrollView>
          {this.props.signUpData.isSignUpDone ? null : <View style={localStyle.bottomContainer}>
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
          </View>}
          <View>
            <BlueButton
              onPress={this.navToSelectCard}
              buttonText="CONTINUE"
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
    paddingTop: Utils.moderateScale(30),
    paddingBottom: 0,
  },
  inputContainerStyle: {
    marginBottom: Utils.verticalScale(5),
    flex: 1,
  },
  addressContainer: {
    flex: 1,
  },
  selectAddress: {
    marginBottom: Utils.verticalScale(10),
    justifyContent: 'center',
    height: Utils.moderateScale(45),
  },
  loaderContainer: {
    position: 'absolute',
    height: Utils.height,
    width: Utils.width,
    backgroundColor: 'rgba(150, 200, 200, 0.4)',
    zIndex: 100,
  },
  label: {
    color: '#b1b6bb',
    fontSize: Utils.moderateScale(12),
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
  },
  placeholderBWColumn: {
    width: 50
    // flex: 1,
  },
  doormanBuildingContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    padding: Utils.moderateScale(20),
    paddingTop: Utils.verticalScale(15),
    marginTop: Utils.verticalScale(5),
  },
  errorText: {
    color: 'red',
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(12),
    paddingTop: Utils.verticalScale(5),
  },
  button: {
    alignSelf: 'center',
    marginBottom: Utils.scale(5),
  },
  text: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(14),
  },
  text2: {
    fontFamily: 'Poppins-Regular',
  },
  label: {
    color: '#b1b6bb',
    fontSize: Utils.moderateScale(12),
    letterSpacing: 1,
    marginBottom: 5,
  },
  bottomContainer: {
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginBottom: Utils.moderateVerticalScale(10),
  },
  newAddressContainer: {
    flex: 1,
    padding: Utils.scale(20),
    paddingTop: 0,
    paddingBottom: Utils.moderateScale(5),
    marginTop: 0,
  },
  checkboxText: {
    marginLeft: Utils.moderateScale(10),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Utils.moderateScale(15),
    paddingBottom: Utils.moderateScale(15),
    paddingLeft: Utils.moderateScale(20),
  },
  checkbox: {
    height: Utils.moderateScale(20),
    width: Utils.moderateScale(20),
    borderRadius: Utils.moderateScale(20) / 2,
    borderColor: 'white',
  },
  checkboxCircle: {
    backgroundColor: 'white',
    height: Utils.moderateScale(20),
    width: Utils.moderateScale(20),
    borderRadius: Utils.moderateScale(20) / 2,
    borderColor: '#171151',
    borderWidth: 1,
  },
  heading: {
    marginBottom: Utils.verticalScale(10),
    letterSpacing: 1,
    fontSize: Utils.moderateScale(14),
  },
  keyboardShowing: {
    marginBottom: Utils.verticalScale(110),
  },
  keyboardNotShowing: {
    marginBottom: Utils.verticalScale(30),
  },
  dropdownContainerStyle: {
    paddingLeft: Utils.moderateScale(20),
    paddingRight: Utils.moderateScale(15),
  },
  dropdownPickerStyle: {
    width: Utils.scale(300),
    marginLeft: Utils.moderateScale(15),
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
  policyContainer: {
    flexDirection: 'row',
  },
  privacyPolicyLink: {
    color: '#171150',
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

const pickerSelectStyles2 = StyleSheet.create({
  inputIOS: {
    // flex: 1,q
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 10,
    color: 'black',
    minWidth: Utils.verticalScale(140),
    height: 50,
    backgroundColor: 'white',
    paddingRight: 30,
    marginBottom: 10,
    paddingLeft: 10, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    // width: Utils.verticalScale(130),
    // height: 50,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderWidth: 1,
    borderRadius: 8,
    color: 'black',
    backgroundColor: 'white',
    paddingRight: 30,
    marginBottom: 10, // to ensure the text is never behind the icon
  },
});

const mapStateToProps = state => {
  return {
    appData: state.appData.appData,
    completeAddressDetails: state.appData.scheduleOrderData.address,
    signUpData: state.appData.signUpData,
    signUpUserAddress: state.appData.signUpUserAddress
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setScheduleOrderDataAddress: data =>
      dispatch(ActionCreators.setScheduleOrderDataAddress(data)),
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
    setSignUpUserAddress: data =>
      dispatch(ActionCreators.setSignUpUserAddress(data))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ScheduleAddressScreen);
