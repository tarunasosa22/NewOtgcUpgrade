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
} from 'react-native';
// import {SafeAreaView} from 'react-navigation';
import BlueButton from '../components/button/BlueButton';
import styles from './styles';
import { Dropdown } from 'react-native-material-dropdown';
import LoaderView from '../components/LoaderView';
import { connect } from 'react-redux';
import Images from '../assets/images/index';
import { ActionCreators } from '../actions/index';
import * as Utils from '../lib/utils';
import RadioButtonScheduleOrder from '../components/RadioButtonScheduleOrder';
import Input from '../components/Input';
import PickerInput from '../components/PickerInput';
import PickerInput2 from '../components/PickerInput2';
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import SelectDropdown from 'react-native-select-dropdown';
import { store } from '../../App';
import DeviceInfo from 'react-native-device-info';

class ScheduleCardScreen extends Component {
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
      checkValue: '',
      selectedCard: !this.props.completeCardDetails.is_add_new_card
        ? this.props.completeCardDetails.user_card_id
        : 'Saved Cards', // 'Saved Cards' value is used for placeholder instead of ''. Hence all checks for '' instead use 'Saved Cards'
      cardList: this.props.completeCardDetails.cardList,
      addNewCard: this.props.completeCardDetails.is_add_new_card,
      keyboardVisible: false,
      errors: {
        card_n̥o: '',
        year: '',
        month: '',
        cvv: '',
        promocode: '',
        state_id: '',
        tip: '',
      },
      loading: this.props.completeCardDetails.dataSaved ? false : true,
      newCard:
        this.props.completeCardDetails.card_details.length > 0
          ? this.props.completeCardDetails.card_details[0]
          : {
            name_on_card: this.props.appData.name,
            card_no: '',
            year: '',
            month: '',
            cvv: '',
            //address: '',
            // state_id: '',
            // city_id: '',
            zip: '',
          },
      card: {
        user_id: this.props.appData.id,
        card_no: '',
        year: '',
        month: '',
        cvv: '',
        zip: '',
      },
      promocode: this.props.completeCardDetails.promo_code,
      tip: this.props.completeCardDetails.tip,
      yearList: this.getYears(),
      monthList: this.getMonths(),
      user_card_id: '',
    };
    this._mounted = false;
    this.inputs = {};
    this.inputsContainerComponents = {};
    this.onAddNewCardPress = this.onAddNewCardPress.bind(this);
    this.onChangeTextCallback = this.onChangeTextCallback.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.setInputsBlur = this.setInputsBlur.bind(this);
    this.onChangeSelectedCard = this.onChangeSelectedCard.bind(this);
    this.keyboardWillShowSub =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
        : Keyboard.addListener('keyboardDidShow', this.keyboardWillShow);
    this.keyboardWillHideSub =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardWillHide', this.keyboardWillHide)
        : Keyboard.addListener('keyboardDidHide', this.keyboardWillHide);
  }

  getYears() {
    let curYear = new Date().getFullYear();
    let years = [];
    for (let i = curYear; i < curYear + 10; i++) {
      years.push({ id: i, name: '' + i });
    }
    return years;
  }

  getMonths() {
    return [
      // {id: 1, name: 'JANUARY (01)', value: '01'},
      // {id: 2, name: 'FEBRUARY (02)', value: '02'},
      // {id: 3, name: 'MARCH (03)', value: '03'},
      // {id: 4, name: 'APRIL (04)', value: '04'},
      // {id: 5, name: 'MAY (05)', value: '05'},
      // {id: 6, name: 'JUNE (06)', value: '06'},
      // {id: 7, name: 'JULY (07)', value: '07'},
      // {id: 8, name: 'AUGUST (08)', value: '08'},
      // {id: 9, name: 'SEPTEMBER (09)', value: '09'},
      // {id: 10, name: 'OCTOBER (10)', value: '10'},
      // {id: 11, name: 'NOVEMBER (11)', value: '11'},
      // {id: 12, name: 'DECEMBER (12)', value: '12'},
      { id: 1, name: '(01)', value: '01' },
      { id: 2, name: '(02)', value: '02' },
      { id: 3, name: '(03)', value: '03' },
      { id: 4, name: '(04)', value: '04' },
      { id: 5, name: '(05)', value: '05' },
      { id: 6, name: '(06)', value: '06' },
      { id: 7, name: '(07)', value: '07' },
      { id: 8, name: '(08)', value: '08' },
      { id: 9, name: '(09)', value: '09' },
      { id: 10, name: '(10)', value: '10' },
      { id: 11, name: '(11)', value: '11' },
      { id: 12, name: '(12)', value: '12' },
    ];
  }

  componentDidMount() {
    this._mounted = true;
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });
    if (this.state.loading) {
      if (this.props.signUpData?.isSignUpDone) { this.fetchCards(); } else {
        this.setState({ loading: false });
      }
    }

    this.props.navigation.addListener('focus', () => {
      if (this.props.signUpData?.isSignUpDone) { this.fetchCards(); } else {
        this.setState({ loading: false });
      }
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
      this.inputsContainerComponents[i] &&
        this.inputsContainerComponents[i].blurInput();
    }
  }

  fetchCards() {
    Utils.makeApiRequest(
      `cards/${this.props.appData.id}`,
      {},
      this.props.appData.token,
      'GET',
      'payment',
    )
      .then(result => {
        if (this._mounted) {
          if (result.status === false) {
            this.setState({ loading: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                'Oops!',
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
          } else if (result.status == true) {
            this.setState({ cardList: result.data }, () => {
              let card = this.getCard();
              this.autoFillNewCardFields(card);
              this.setState({ loading: false });
            });
          } else {
            this.setState({ loading: false });
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

  getCard(id = null) {
    if (this.state.cardList.length > 0) {
      for (let i = 0; i < this.state.cardList.length; i++) {
        let card = this.state.cardList[i];
        if (id === null) {
          if (card.primary == 'yes') {
            return card;
            break;
          }
        } else {
          if (card.id == id) {
            return card;
          }
        }
      }
      return null;
    } else {
      return null;
    }
  }

  autoFillNewCardFields(card = null) {
    if (card) {
      let newCard = { card_no: card.card_number };
      let errors = { card_no: '', year: '', month: '', cvv: '', zip: '' };
      this.setState({
        selectedCard: card.id,
        newCard: newCard,
        addNewCard: false,
        errors: errors,
      });
    } else {
      if (
        this.state.cardList.length <= 0 ||
        this.state.selectedCard !== 'Saved Cards'
      ) {
        this.state.newCard = {
          card_no: '',
          year: '',
          month: '',
          cvv: '',
          zip: '',
        };
        this.setState({
          selectedCard: 'Saved Cards',
          newCard: this.state.newCard,
          addNewCard: true,
        });
        setTimeout(() => this.focusField('name_on_card'), 200);
      } else {
        // don't reset the fields filled by the user
        this.setState({ addNewCard: true });
        setTimeout(() => this.focusField('name_on_card'), 200);
      }
    }
  }

  onAddNewCardPress() {
    if (this.state.cardList.length > 0) {
      if (!this.state.addNewCard) {
        this.autoFillNewCardFields();
      } else {
        this.setState({
          addNewCard: false,
          errors: { name_on_card: '', card_no: '', year: '', month: '', cvv: '' },
        });
      }
    } else if (!this.state.addNewCard) {
      this.autoFillNewCardFields();
    } else {
      this.focusField('name_on_card');
    }
  }
  onSubmit() {
    let promocodeData = null;
    let error = false;

    if (
      this.state.tip &&
      (isNaN(parseFloat(this.state.tip)) || parseFloat(this.state.tip) <= 0)
    ) {
      Utils.displayAlert('Oops!', 'Please enter a valid amount for tip');
      return;
    } else {
      this.verifyPromocode().then(promocode_data => {
        // console.log("promocode_data ------------> ", promocode_data)
        if (!promocode_data) {
          return;
        } else if (promocode_data !== true) {
          promocodeData = promocode_data;
        }
        // doSubmit();
      })
      .catch((error) => {
        console.log("Invalid promo code, continuing with order...", error);
      })
      .finally(() => {
        doSubmit();
      });
    }
    var doSubmit = () => {
      if (this.state.addNewCard || this.state.cardList.length <= 0) {
        let error = false,
          errors = {};
        let cardno = this.state.newCard.card_no.replace(/\s+/g, '')
        let card = cardno;
        let errorNameFieldMap = {
          card_no: 'Please enter card number',
          year: 'Please select year',
          month: 'Please select month',
          cvv: 'Please enter CVV',
          zip: 'Please enter zip code',
        };

        for (let field in card) {
          if (card[field] == '') {
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
        this.setState({
          card: { ...this.state.card, ...this.state.newCard },
          loading: true,
        });

        if (
          new Date(
            `${this.state.card.year}-${this.state.card.month}`,
          ).getTime() < new Date().getTime()
        ) {
          Utils.displayAlert(
            '',
            'Your credit card has reached its expiration date!',
          );
          this.setState({
            card: { ...this.state.card, ...this.state.newCard },
            loading: false,
          });

          return;
        }
        return this.props.signUpData?.isSignUpDone ? this._add_card(promocodeData) : this._signUp(promocodeData)
      } else if (this.state.selectedCard == 'Saved Cards') {
        Utils.displayAlert(
          'Oops!',
          'Please select one of saved cards or add new card!!!',
        );
        return;
      }

      let promo = {
        // promo_code_id: '',
        promo_code: '',
        // promo_code_type: '',
        // promo_code_amount: '',
      };
      if (promocodeData) {
        promo = {
          // promo_code_id: promocodeData.id,
          promo_code: promocodeData.promo_code,
          // promo_code_type: promocodeData.type,
          // promo_code_amount: promocodeData.discount,
        };
      }
      if (this.state.addNewCard || this.state.cardList.length <= 0) {
        this.props.setScheduleOrderDataCard({
          card_details: [this.state.newCard],
          is_add_new_card: true,
          user_card_id: [this.state.user_card_id],
          ...promo,
          cardList: this.state.cardList,
          tip: this.state.tip,
          dataSaved: true,
        });
      } else {
        this.props.setScheduleOrderDataCard({
          card_details: [this.state.newCard],
          is_add_new_card: false,
          user_card_id: this.state.selectedCard,
          ...promo,
          cardList: this.state.cardList,
          tip: this.state.tip,
          dataSaved: true,
        });
      }
      this.validateCard(this.state.selectedCard)
      // this.props.navigation.navigate('ReviewOrder');
    };
  }
  async storeFcm() {
    console.log('FCM_DATA->1', this.props.fcmToken)
    if (this.props.fcmToken == '') {
      const fcmToken = await messaging().getToken();
      console.log('FCM_DATA->', fcmToken)
      this.props.setFcmToken(fcmToken)
    }
  }

  _signUp(promocodeData) {
    this.storeFcm()
    let signup = {
      first_name: this.props.signUpUserAddress.first_name,
      last_name: this.props.signUpUserAddress.last_name,
      email: this.props.signUpData.email,
      password: this.props.signUpUserAddress.password,
      zip_code: this.props.signUpData.zip_code,
      mobile: this.props.signUpUserAddress.mobile,
      hear_about_us: this.props.signUpUserAddress.hear_about_us,
    }

    Utils.makeApiRequest(
      'signup',
      signup,
      null,
      'POST',
      'auth',
    )
      .then(result => {
        if (this._mounted) {
          if (result.message === 'User Created') {
            // this.setState({ message: 'Signup Successful...' });
            setTimeout(async () => {
              if (this._mounted) {
                // this.setState({ message: 'Logging You In...' });
                let fcmToken = this.props.fcmToken
                const appVersion = await DeviceInfo.getVersion();
                Utils.makeApiRequest(
                  'signin',
                  {
                    email: signup.email,
                    password: signup.password,
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
                          Utils.displayAlert('Oops!', result?.message);
                        } else {
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

                        let signUpdata = {
                          email: signup.email,
                          isSignUpDone: true,
                          zip_code: signup.zip_code
                        }
                        this.props.setSignUpData(signUpdata)
                        let count = Number(this.props.isOrderSchedule?.isOrderSchedule) + 1
                        this.props.setOderSchedule({ isOrderSchedule: count })
                        if (count % 3 == 0) {
                          store.dispatch(ActionCreators.setDoneRate({ isDoneRate: false }))
                        }
                        this._addUserAddress(promocodeData)

                        // this.props.navigation.navigate('LoggedInNav');
                      } else {
                        // this.onSignupButtonTapNavBar();
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

  _add_card(promocodeData) {
    let cardno = this.state.card.card_no.replace(/\s+/g, '')
    Utils.makeApiRequest(
      'add-card',
      {
        cardNumber: cardno,
        cardCVC: this.state.card.cvv,
        month: this.state.card.month,
        year: this.state.card.year,
        zipcode: this.state.card.zip,
        user_id: this.props.appData.id,
      },
      this.props.appData.token,
      'POST',
      'payment',
    )
      .then(result => {
        if (this._mounted) {
          this.setState({ loading: false });
          if (result?.status === false || result?.error) {
            if (this.props.navigation.isFocused()) {
              // console.log('Result-->', result)
              // if (result?.response) {
              //   Utils.displayAlert('', result?.response?.error);
              // } else {
              //   Utils.displayAlert(
              //     '',
              //     'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              //   );
              // }
              if (
                result?.response?.error?.startsWith(
                  "The 'AnetApi/xml/v1/schema/AnetApiSchema.xsd:cardNumber' element is invalid - The value ",
                )
              ) {
                Utils.displayAlert('', 'Invalid card number!');
              } else {
                Utils.displayAlert('', result.response ?? result.error);
              }
            }
          } else if (result.status == true) {
            console.log(result, 'success');
            this.setState({
              card: {
                user_id: this.props.appData.id,
                card_no: '',
                year: '',
                month: '',
                cvv: '',
                zip: '',
              },
              user_card_id: result.data.id,
            });
            let promo = {
              // promo_code_id: '',
              promo_code: '',
              // promo_code_type: '',
              // promo_code_amount: '',
            };
            if (promocodeData) {
              console.log(
                promocodeData,
                '-------------------------------------',
              );
              promo = {
                // promo_code_id: promocodeData.id,
                promo_code: promocodeData.promo_code,
                // promo_code_type: promocodeData.type,
                // promo_code_amount: promocodeData.discount,
              };
            }
            if (this.state.addNewCard || this.state.cardList.length <= 0) {
              this.props.setScheduleOrderDataCard({
                card_details: [this.state.newCard],
                is_add_new_card: true,
                user_card_id: result.data.id,
                ...promo,
                cardList: this.state.cardList,
                tip: this.state.tip,
                dataSaved: true,
              });
            } else {
              this.props.setScheduleOrderDataCard({
                card_details: [this.state.newCard],
                is_add_new_card: false,
                user_card_id: this.state.selectedCard,
                ...promo,
                cardList: this.state.cardList,
                tip: this.state.tip,
                dataSaved: true,
              });
            }
            this.validateCard(result.data.id)
            // this.props.navigation.navigate('ReviewOrder');
          } else {
            // if (this.props.navigation.isFocused()) {
            //console.error(result.msg);
            Utils.displayAlert('Info!', result.msg || 'Invalid Request');
            return false;
            // }
          }
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  _addUserAddress(promocodeData) {

    let newAddressData = { ...this.props.signUpUserAddress }
    delete newAddressData?.password;
    delete newAddressData?.hear_about_us;

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
            this._add_card(promocodeData)
            // this.props.navigation.navigate('ScheduleCard');
          } else {
            this.setState({ loading: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                resultAddress.msg || 'Invalid Request',
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

  validateCard(card_id) {
    this.setState({
      loading: true,
    });

    return Utils.makeApiRequest(
      'validate-card',
      {
        card: card_id,
      },
      this.props.appData.token,
      'POST',
      'payment',
    )
      .then(result => {
        if (this._mounted) {
          this.setState({ loading: false });
          if (result.err) {
            Utils.displayAlert('Info!', result.err
              || 'Invalid Request');
            return false;
          } else {
            this.props.navigation.navigate('ReviewOrder');
          }
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  // onChangeSelectedCard(value, index) {
  //   console.log('1. Value from onChangeSelectedCard,', value);
  //   this.setState({
  //     newCard: {
  //       ...this.state.newCard,
  //       // card_no: this.state.cardList[index - 1].card_no,
  //     },
  //   });
  //   if (!this.state.cardList) {
  //     let card = this.getCard(this.state.cardList[index].id);

  //     this.autoFillNewCardFields(card);
  //   }

  //   // console.log('The value onChangeSelectedCard is,', value);
  // }

  onChangeSelectedCard(value) {
    let card = this.getCard(value);
    this.autoFillNewCardFields(card);
  }

  verifyCard() {
    this.setState({ loading: true });
    return;
  }

  // verifyPromocode() {
  //   const _this = this;
  //   if (_this.state.promocode == '') {
  //     return new Promise(function (resolve, reject) {
  //       resolve(true);
  //     });
  //   } else {
  //     return new Promise(function (resolve, reject) {
  //       _this.setState({ loading: true });

  //       return Utils.makeApiRequest(
  //         'coupon-code',
  //         { promo_code: _this.state.promocode, user_id: _this.props.appData.id },
  //         _this.props.appData.token,
  //         'POST',
  //         'order/verify',
  //       )
  //         .then(async result => {
  //           console.log("result ----------> ", result)
  //           if (_this._mounted) {
  //             _this.setState({ loading: false });
  //             if (result.status === false) {
  //               if (_this.props.navigation.isFocused()) {
  //                 if (result?.message) {
  //                   Utils.displayAlert('', result?.message, null, null, () => {
  //                     reject(false);
  //                   });
  //                 } else {
  //                 }
  //               }
  //               return false;
  //             } else if (result.status) {
  //               if (_this.props.navigation.isFocused()) {
  //                 Utils.displayAlert(
  //                   'Promo Code Applied!',
  //                   result.message,
  //                   null,
  //                   null,
  //                   () => {
  //                     resolve(result.data);
  //                   },
  //                 );
  //               }
  //             } else {
  //               if (_this.props.navigation.isFocused()) {
  //                 Utils.displayAlert(
  //                   'Oops!',
  //                   result.msg || 'Invalid Code',
  //                   null,
  //                   null,
  //                   () => {
  //                     reject(false);
  //                   },
  //                 );
  //               }
  //             }
  //           }
  //         })
  //         .catch(error => {
  //           console.log(error);
  //           throw new Error(error);
  //         });
  //     });
  //   }
  // }

  verifyPromocode() {
    const _this = this;
  
    if (_this.state.promocode === '') {
      return Promise.resolve(true);
    }
  
    return Utils.makeApiRequest(
      'coupon-code',
      { promo_code: _this.state.promocode, user_id: _this.props.appData.id },
      _this.props.appData.token,
      'POST',
      'order/verify',
    ).then((res) => {
      // console.log("res ----> ", res);
      
      if (res.status === true) {
        if (_this.props.navigation.isFocused()) {
          Utils.displayAlert(
            'Promo Code Applied!',
            null,
            null,
          );
        }
        return res;
      } else {
        
        if (_this.props.navigation.isFocused()) {
          Utils.displayAlert('', res?.error, null, null);
        }
        return null;
      }
    }).catch((error) => {
      console.log("API error in verifyPromocode:", error);
      throw error;
    });
  }

  onChangeTextCallback(input, value) {
    let newValue = value
    if (input === 'card_no') {
      newValue = Utils.formatCardNumber(value);
    }
    this.state.errors[input] = '';
    this.state.newCard[input] = newValue;
    this.setState({ errors: this.state.errors, newCard: this.state.newCard });
  }

  keyboardWillShow = event => {
    this.setState({ keyboardVisible: true });
  };

  keyboardWillHide = event => {
    this.setState({ keyboardVisible: false });
  };

  render() {
    const preSelectedCard = this.state.cardList.find(
      card => card.id === this.state.selectedCard,
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
                  this.state.loadingStates ||
                  this.state.loadingCities
                }
                style={localStyle.loader}
              />
            </View>
          ) : (
            <View></View>
          )}
          <ScrollView
            showsVerticalScrollIndicator={false}
            horizontal={false}
            style={localStyle.containerView}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={localStyle.promocodeContainer}>
              <Text style={[localStyle.text, localStyle.heading]}>
                PROMO CODE
              </Text>
              <View style={[styles.card, localStyle.promocodeInputContainer]}>
                <TextInput
                  style={[localStyle.textInput, { fontSize: this.state.promocode ? Utils.moderateScale(14, 0.5) : Utils.moderateScale(12, 0.5), }]}
                  underlineColorAndroid="transparent"
                  ref={input => (this.inputs.promocode = input)}
                  returnKeyType="done"
                  autoCapitalize="none"
                  placeholder="Applied to any amount over $25 minimum"
                  autoCorrect={false}
                  placeholderTextColor={'silver'}
                  value={this.state.promocode}
                  onChangeText={code => {
                    this.setState({ promocode: code });
                  }}
                />
              </View>
            </View>
            <View style={localStyle.promocodeContainer}>
              <Text style={[localStyle.text, localStyle.heading]}>
                DELIVERY TIP (OPTIONAL)
              </Text>
              <View style={[styles.card, localStyle.tipInputContainer]}>
                <Text style={localStyle.dollarSign}>$ </Text>
                <TextInput
                  style={[localStyle.textInput]}
                  underlineColorAndroid="transparent"
                  ref={input => (this.inputs.tip = input)}
                  returnKeyType="done"
                  keyboardType="numeric"
                  placeholder="Enter Tip"
                  placeholderTextColor={'silver'}
                  value={this.state.tip}
                  onChangeText={tip => {
                    this.setState({ tip: tip });
                  }}
                />
              </View>
            </View>
            <View style={localStyle.paymentCardContainer}>
              <Text style={[localStyle.text, localStyle.heading]}>PAYMENT</Text>
              {this.state.cardList.length > 0 && (
                <>
                  {/* OLD CODE */}
                  {/* <RNPickerSelect
                    placeholder={{
                      label: 'Select Card',
                    }}
                    onValueChange={this.onChangeSelectedCard}
                    value={this.state.selectedCard}
                    useNativeAndroidPickerStyle={false}
                    items={this.state.cardList.map(obj => ({
                      id: obj.id,
                      label: obj.card_no,
                      value: obj.id,
                    }))}
                    onDonePress={value => {
                      this.setState({
                        selectedCard: this.state.selectedCard,
                      });
                    }}
                    style={pickerSelectStyles}
                  /> */}

                  <View>
                    {/* <Picker
                      placeholder={'Select Card'}
                      onValueChange={this.onChangeSelectedCard}
                      selectedValue={this.state.selectedCard}>
                      <Picker.Item value={0} label="Select Card" />
                      <Picker.Item value={0} label="Select Card" />
                      {this.state.cardList.map(obj => {
                        return (
                          <Picker.Item
                            key={obj.id}
                            label={obj.card_number}
                            value={obj.id}
                          />
                        );
                      })}
                    </Picker> */}

                    <SelectDropdown
                      buttonTextStyle={{ fontSize: 15 }}
                      onSelect={(selectedItem, index) => {
                        this.onChangeSelectedCard(selectedItem.id);
                      }}
                      data={this.state.cardList}
                      buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem.card_number;
                      }}
                      defaultValue={preSelectedCard}
                      defaultButtonText="Select Card"
                      rowTextForSelection={(item, inex) => {
                        return item.card_number;
                      }}
                      buttonStyle={{
                        width: Utils.width * 0.88,
                        borderRadius: 8,
                        marginBottom: 10,
                      }}
                    />
                  </View>
                </>
              )}
              <TouchableOpacity
                style={[styles.card, localStyle.checkboxContainer]}
                onPress={this.onAddNewCardPress}>
                {this.state.addNewCard ? (
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
                  ADD NEW CARD
                </Text>
              </TouchableOpacity>
              {(this.state.newCard.card_no || this.state.addNewCard) ? <View style={[styles.card, localStyle.card]}>
                <View style={localStyle.row}>
                  <Input
                    label="CARD NUMBER"
                    returnKeyType="done"
                    containerStyle={localStyle.inputContainerStyle}
                    autoCorrect={false}
                    editable={this.state.addNewCard}
                    value={this.state.newCard.card_no}
                    error={this.state.errors.card_n̥o}
                    ref={input =>
                      (this.inputsContainerComponents.card_no = input)
                    }
                    focusElement={() => this.focusField('card_no')}
                    refCallback={input => (this.inputs['card_no'] = input)}
                    onChangeText={card_no =>
                      this.onChangeTextCallback('card_no', card_no)
                    }
                  />
                </View>

                {this.state.selectedCard == 'Saved Cards' && (
                  <View
                    style={[localStyle.row, { justifyContent: 'space-between' }]}>
                    <View style={{ flex: 0.45 }}>
                      {/* OLD CODE */}
                      {/* <RNPickerSelect
                        placeholder={{value: null, label: 'Month'}}
                        style={pickerSelectStyles2}
                        disabled={!this.state.addNewCard}
                        value={this.state.newCard.month}
                        onValueChange={value => {
                          if (!value) {
                            this.state.newCard.month = '';
                          } else {
                            this.state.newCard.month = value;
                          }
                          // this.state.card.month =
                          //   '00'.slice(String(value).length) + String(value);
                          // console.warn(value);
                          this.state.errors.month = '';
                          this.setState({
                            newCard: this.state.newCard,
                            errors: this.state.errors,
                          });
                        }}
                        items={this.state.monthList.map(obj => ({
                          id: obj.id,
                          label: obj.name,
                          value: obj.value,
                        }))}
                        onDonePress={() => {}}
                      /> */}

                      {/* {NEW CODE} */}
                      <Picker
                        placeholder={'Month'}
                        style={pickerSelectStyles2}
                        disabled={!this.state.addNewCard}
                        selectedValue={this.state.newCard.month}
                        onValueChange={value => {
                          if (!value) {
                            this.state.newCard.month = '';
                          } else {
                            this.state.newCard.month = value;
                          }
                          // this.state.card.month =
                          //   '00'.slice(String(value).length) + String(value);
                          // console.warn(value);
                          this.state.errors.month = '';
                          this.setState({
                            newCard: this.state.newCard,
                            errors: this.state.errors,
                          });
                        }}
                        // items={this.state.monthList.map(obj => ({
                        //   id: obj.id,
                        //   label: obj.name,
                        //   value: obj.value,
                        // }))}
                        onDonePress={() => { }}>
                        <Picker.Item value={0} label="Month" />

                        {this.state.monthList.map(obj => {
                          return (
                            <Picker.Item
                              key={obj.id}
                              label={obj.name}
                              value={obj.value}
                            />
                          );
                        })}
                      </Picker>
                    </View>
                    <View style={{ flex: 0.45 }}>
                      {/* OLD CODE */}
                      {/* <RNPickerSelect
                        placeholder={{value: null, label: 'Year'}}
                        style={pickerSelectStyles2}
                        // value={this.state.newCard.year}
                        disabled={!this.state.addNewCard}
                        onValueChange={value => {
                          Keyboard.dismiss();
                          this.state.card.year = value;
                          // console.warn(value);
                          if (!value) {
                            this.state.newCard.year = '';
                          } else {
                            this.state.newCard.year = value;
                          }
                          this.state.errors.year = '';
                          this.setState({
                            newCard: this.state.newCard,
                            errors: this.state.errors,
                          });
                        }}
                        items={this.state.yearList.map(obj => ({
                          id: obj.id,
                          label: obj.name,
                          value: obj.name,
                        }))}
                        onDonePress={val => {
                          // console.log('Done press value', val);
                          console.log(
                            'The value on done is',
                            this.state.newCard.year,
                          );
                        }}
                      /> */}

                      {/* NEW CODE */}
                      <Picker
                        placeholder={'Year'}
                        style={pickerSelectStyles2}
                        selectedValue={this.state.newCard.year}
                        disabled={!this.state.addNewCard}
                        onValueChange={value => {
                          Keyboard.dismiss();
                          this.state.card.year = value;
                          // console.warn(value);
                          if (!value) {
                            this.state.newCard.year = '';
                          } else {
                            this.state.newCard.year = value;
                          }
                          this.state.errors.year = '';
                          this.setState({
                            newCard: this.state.newCard,
                            errors: this.state.errors,
                          });
                        }}>
                        <Picker.Item value={0} label="Year" />

                        {this.state.yearList.map(obj => {
                          return (
                            <Picker.Item
                              key={obj.id}
                              label={obj.name}
                              value={obj.name}
                            />
                          );
                        })}
                      </Picker>
                    </View>
                  </View>
                )}
                {this.state.selectedCard == 'Saved Cards' && (
                  <View style={localStyle.row}>
                    <Input
                      label="CVV Security Code"
                      returnKeyType="next"
                      secureTextEntry={true}
                      containerStyle={localStyle.inputContainerStyle}
                      autoCorrect={false}
                      maxLength={4}
                      editable={this.state.addNewCard}
                      focusElement={() => this.focusField('cvv')}
                      value={this.state.newCard.cvv}
                      error={this.state.errors.cvv}
                      ref={input =>
                        (this.inputsContainerComponents.cvv = input)
                      }
                      refCallback={input => (this.inputs['cvv'] = input)}
                      onSubmitEditing={() => this.focusField('address')}
                      onChangeText={cvv =>
                        this.onChangeTextCallback('cvv', cvv)
                      }
                    />
                    <View style={localStyle.placeholderBWColumn} />
                    {/*<View style={{flex: 1}}></View>*/}
                  </View>
                )}

                {this.state.selectedCard == 'Saved Cards' && (
                  <View>
                    <View
                      style={[
                        localStyle.row,
                        this.state.keyboardVisible
                          ? localStyle.keyboardShowing
                          : localStyle.keyboardNotShowing,
                      ]}>
                      <Input
                        label="BILLING ZIP"
                        returnKeyType="done"
                        editable={this.state.addNewCard}
                        containerStyle={localStyle.inputContainerStyle}
                        autoCorrect={false}
                        focusElement={() => this.focusField('zip')}
                        value={this.state.newCard.zip}
                        error={this.state.errors.zip}
                        refCallback={input => (this.inputs['zip'] = input)}
                        onChangeText={zip =>
                          this.onChangeTextCallback('zip', zip)
                        }
                      />
                    </View>
                  </View>
                )}
              </View> : null}
            </View>
          </ScrollView>
          <View>
            {/* <BlueButton
              onPress={this.onSubmit}
              buttonText="REVIEW ORDER"
              style={localStyle.button}
            /> */}
            <TouchableOpacity
              onPress={this.onSubmit}
              style={[localStyle.blueButton]}
              disabled={this.state.loading}>
              <Text style={localStyle.blueButtonText}>
                REVIEW ORDER
              </Text>
            </TouchableOpacity>
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
  loaderContainer: {
    position: 'absolute',
    height: Utils.height,
    width: Utils.width,
    backgroundColor: 'rgba(150, 200, 200, 0.4)',
    zIndex: 100,
  },
  loader: {
    marginBottom: Utils.moderateVerticalScale(50),
  },
  inputContainerStyle: {
    marginBottom: Utils.verticalScale(5),
    flex: 1,
  },
  addressLabel: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    letterSpacing: 2,
    fontSize: Utils.moderateScale(14, 0.5),
    marginBottom: Utils.moderateScale(20, 0.5),
  },
  promocodeInputContainer: {
    height: Utils.moderateScale(50),
    justifyContent: 'center',
    ...Platform.select({
      android: {
        marginLeft: Utils.scale(2),
        marginRight: Utils.scale(2),
      },
    }),
  },
  tipInputContainer: {
    height: Utils.moderateScale(50),
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      android: {
        marginLeft: Utils.scale(2),
        marginRight: Utils.scale(2),
      },
    }),
  },
  promocodeContainer: {
    marginTop: Utils.verticalScale(10),
  },
  inputContainer: {
    marginTop: Utils.verticalScale(10),
  },
  paymentCardContainer: {
    flex: 1,
    marginTop: Utils.verticalScale(10),
    marginBottom: Utils.verticalScale(20),
  },
  selectPaymentCard: {
    marginBottom: Utils.verticalScale(10),
    justifyContent: 'center',
    height: Utils.moderateScale(45),
    ...Platform.select({
      android: {
        marginLeft: Utils.scale(2),
        marginRight: Utils.scale(2),
      },
    }),
  },
  row: {
    flexDirection: 'row',
  },
  placeholderBWColumn: {
    flex: 2,
  },
  card: {
    padding: Utils.moderateScale(20),
    paddingTop: Utils.verticalScale(15),
    marginTop: Utils.verticalScale(5),
    ...Platform.select({
      android: {
        marginLeft: Utils.scale(2),
        marginRight: Utils.scale(2),
      },
    }),
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
  checkboxText: {
    marginLeft: Utils.moderateScale(10),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Utils.moderateScale(15),
    paddingBottom: Utils.moderateScale(15),
    paddingLeft: Utils.moderateScale(10),
    ...Platform.select({
      android: {
        marginLeft: Utils.scale(2),
        marginRight: Utils.scale(2),
      },
    }),
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
    marginBottom: Utils.verticalScale(20),
  },
  dropdownContainerStyle: {
    paddingLeft: Utils.moderateScale(20),
    paddingRight: Utils.moderateScale(15),
  },
  dropdownPickerStyle: {
    width: Utils.scale(300),
    marginLeft: Utils.moderateScale(15),
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
    color: '#17114f',
    fontSize: Utils.moderateScale(14, 0.5),
    width: '90%',
    height: '90%',
    alignSelf: 'center',
  },
  dollarSign: {
    fontFamily: 'Poppins-Regular',
    color: '#17114f',
    fontSize: Utils.moderateScale(14, 0.5),
  },
  blueButton: {
    backgroundColor: '#1a3163',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#171151',
    height: Utils.moderateVerticalScale(40, 0.5),
    width: "85%",
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#171151',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  blueButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Regular',
    letterSpacing: 2,
    fontSize: Utils.moderateScale(14),
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    color: 'black',
    // width: Utils.verticalScale(110),
    height: 50,
    backgroundColor: 'white',
    paddingRight: 30,
    paddingLeft: 10,
    marginBottom: 20, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 8,
    color: 'black',
    backgroundColor: 'white',
    paddingRight: 30,
    marginBottom: 20, // to ensure the text is never behind the icon
  },
});

const pickerSelectStyles2 = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: 'gray',
    borderRadius: 2,
    color: 'black',
    height: 50,
    flex: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    paddingRight: 5,
    paddingLeft: 5, // to ensure the text is never behind the icon
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
    completeCardDetails: state.appData.scheduleOrderData.card,
    signUpData: state.appData.signUpData,
    signUpUserAddress: state.appData.signUpUserAddress,
    fcmToken: state.appData.fcmToken,
    isOrderSchedule: state.appData.isOrderSchedule
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setLoggedInUserData: data =>
      dispatch(ActionCreators.setLoggedInUserData(data)),
    setScheduleOrderDataCard: data =>
      dispatch(ActionCreators.setScheduleOrderDataCard(data)),
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
    setSignUpData: data =>
      dispatch(ActionCreators.setSignUpData(data)),
    setOderSchedule: data =>
      dispatch(ActionCreators.setOrderSchedule(data)),
    setFcmToken: data =>
      dispatch(ActionCreators.setFcmToken(data)),
    setScheduleOrderDataAddress: data =>
      dispatch(ActionCreators.setScheduleOrderDataAddress(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleCardScreen);
