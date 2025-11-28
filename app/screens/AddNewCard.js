import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Image,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
// import {SafeAreaView} from 'react-navigation';
import BlueButton from '../components/button/BlueButton';
import styles from './styles';
import Images from '../assets/images/index';
import LoaderView from '../components/LoaderView';
import { connect } from 'react-redux';
import { ActionCreators } from '../actions/index';
import * as Utils from '../lib/utils';
import Input from '../components/Input';
import PickerInput from '../components/PickerInput';
import LinearGradient from 'react-native-linear-gradient';
import SelectDropdown from 'react-native-select-dropdown';

class AddNewCardScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'ADD NEW CARD',
      headerRight: () => (
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
      errors: {
        card_no: '',
        year: '',
        month: '',
        cvv: '',
        zip: '',
      },
      card: {
        card_no: '',
        year: '',
        month: '',
        cvv: '',
        zip: '',
      },
      yearList: this.getYears(),
      monthList: this.getMonths(),
      loading: false,
      keyboardVisible: false,
    };
    this._mounted = false;
    this.inputs = {};
    this.onChangeTextCallback = this.onChangeTextCallback.bind(this);
    this.saveCard = this.saveCard.bind(this);
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
  }

  componentWillUnmount() {
    this._mounted = false;
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
    // return [
    //   {id: 1, name: 'JANUARY (01)', value: '01'},
    //   {id: 2, name: 'FEBRUARY (02)', value: '02'},
    //   {id: 3, name: 'MARCH (03)', value: '03'},
    //   {id: 4, name: 'APRIL (04)', value: '04'},
    //   {id: 5, name: 'MAY (05)', value: '05'},
    //   {id: 6, name: 'JUNE (06)', value: '06'},
    //   {id: 7, name: 'JULY (07)', value: '07'},
    //   {id: 8, name: 'AUGUST (08)', value: '08'},
    //   {id: 9, name: 'SEPTEMBER (09)', value: '09'},
    //   {id: 10, name: 'OCTOBER (10)', value: '10'},
    //   {id: 11, name: 'NOVEMBER (11)', value: '11'},
    //   {id: 12, name: 'DECEMBER (12)', value: '12'},
    // ];
    return [
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

  focusField(key) {
    this.inputs[key] && this.inputs[key].focus();
  }

  saveCard() {
    let error = false,
      errors = {};
    let card = this.state.card;
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

    this.setState({ errors: errors });

    if (error) {
      return;
    }
    if (
      new Date(`${this.state.card.year}-${this.state.card.month}`).getTime() <
      new Date().getTime()
    ) {
      Utils.displayAlert(
        '',
        'Your credit card has reached its expiration date!',
      );
      return;
    }

    this.setState({ loading: true });
    Keyboard.dismiss();
    let cardno = this.state.card.card_no.replace(/\s+/g, '')
    console.log('cardno', cardno)
    const cardData = {
      cardNumber: cardno,
      month: this.state.card.month,
      year: this.state.card.year,
      cardCVC: this.state.card.cvv,
      zipcode: this.state.card.zip,
      user_id: this.props.appData.id,
    };
    Utils.makeApiRequest(
      'add-card',
      cardData,
      this.props.appData.token,
      'POST',
      'payment',
    )
      .then(result => {
        if (this._mounted) {
          if (result?.error) {
            this.setState({ loading: false });
            if (this.props.navigation.isFocused()) {
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
          } else if (result.status === true) {
            this.setState({
              card: { card_no: '', year: '', month: '', cvv: '', zip: '' },
              loading: false,
            });

            Utils.displayAlert(
              'Info!',
              'Your card has been added successfully',
              'OK',
              null,
              () => {
                this.props.toggleNewCardAdded();
                this.props.navigation.navigate('MyCards');
              },
              false,
              false,
            );
          } else {
            this.setState({ loading: false });
            console.warn('Invalid Request', result.msg);

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

  onChangeTextCallback(input, value) {
    let newValue = value
    if (input === 'card_no') {
      newValue = Utils.formatCardNumber(value);
    }
    this.state.errors[input] = '';
    this.state.card[input] = newValue;
    this.setState({ errors: this.state.errors, card: this.state.card });
  }

  keyboardWillShow = event => {
    this.setState({ keyboardVisible: true });
  };

  keyboardWillHide = event => {
    this.setState({ keyboardVisible: false });
  };

  render() {
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
                  label="CARD NUMBER"
                  keyboardType="text"
                  returnKeyType="done"
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  value={this.state.card.card_no}
                  error={this.state.errors.card_no}
                  focusElement={() => this.focusField('card_no')}
                  refCallback={input => (this.inputs['card_no'] = input)}
                  onChangeText={card_no =>
                    this.onChangeTextCallback('card_no', card_no)
                  }
                />
              </View>

              <View
                style={[
                  localStyle.row,
                  { flex: 1, justifyContent: 'space-between' },
                ]}>
                <View style={{ flex: 0.45 }}>
                  {/* OLD CODE */}
                  {/* <RNPickerSelect
                    placeholder={{
                      value: null,
                      label: 'Month',
                    }}
                    style={pickerSelectStyles2}
                    useNativeAndroidPickerStyle={false}
                    value={this.state.card.month}
                    onValueChange={value => {
                      Keyboard.dismiss();
                      if (!value) {
                        this.state.card.month = '';
                      } else {
                        this.state.card.month = value;
                      }
                      // this.state.card.month =
                      //   '00'.slice(String(value).length) + String(value);
                      // console.warn(value);
                      this.state.errors.month = '';
                      this.setState({
                        card: this.state.card,
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

                  {/* NEW CODE */}
                  {/* <Picker
                    placeholder={'Month'}
                    style={pickerSelectStyles2}
                    selectedValue={this.state.card.month}
                    onValueChange={value => {
                      Keyboard.dismiss();
                      if (!value) {
                        this.state.card.month = '';
                      } else {
                        this.state.card.month = value;
                      }
                      // this.state.card.month =
                      //   '00'.slice(String(value).length) + String(value);
                      // console.warn(value);
                      this.state.errors.month = '';
                      this.setState({
                        card: this.state.card,
                        errors: this.state.errors,
                      });
                    }}
                    // items={this.state.monthList.map(obj => ({
                    //   id: obj.id,
                    //   label: obj.name,
                    //   value: obj.value,
                    // }))}
                    onDonePress={() => {}}>
                    <Picker.Item value={0} label="Month" />
                    {this.state.monthList.map(obj => {
                      return (
                        <Picker.Item
                          key={obj.id}
                          value={obj.value}
                          label={obj.name}
                        />
                      );
                    })}
                  </Picker> */}

                  <SelectDropdown
                    onSelect={(selectedItem, index) => {
                      Keyboard.dismiss();
                      if (!selectedItem.id) {
                        this.state.card.month = '';
                      } else {
                        this.state.card.month = selectedItem.id;
                      }
                      // this.state.card.month =
                      //   '00'.slice(String(value).length) + String(value);
                      // console.warn(value);
                      this.state.errors.month = '';
                      this.setState({
                        card: this.state.card,
                        errors: this.state.errors,
                      });
                    }}
                    buttonTextStyle={{ fontSize: 15 }}
                    data={this.state.monthList}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      return selectedItem.name;
                    }}
                    defaultButtonText="Select Month"
                    rowTextForSelection={(item, inex) => {
                      return item.name;
                    }}
                    buttonStyle={{ width: Utils.width * 0.4, borderRadius: 8 }}
                  />

                  <Text
                    style={[
                      styles.errorText,
                      { paddingTop: 0, marginBottom: Utils.moderateScale(5) },
                    ]}>
                    {this.state.errors.month}
                  </Text>
                </View>
                <View style={{ flex: 0.45 }}>
                  {/* {OLD CODE} */}
                  {/* <RNPickerSelect
                    placeholder={{
                      value: null,
                      label: 'Year',
                    }}
                    useNativeAndroidPickerStyle={false}
                    style={pickerSelectStyles2}
                    // value={this.state.card.year}
                    onValueChange={value => {
                      Keyboard.dismiss();
                      this.state.card.year = value;
                      // console.warn(value);
                      if (!value) {
                        this.state.card.year = '';
                      } else {
                        this.state.card.year = value;
                      }
                      this.state.errors.year = '';
                      this.setState({
                        card: this.state.card,
                        errors: this.state.errors,
                      });
                    }}
                    items={this.state.yearList.map(obj => ({
                      id: obj.id,
                      label: obj.name,
                      value: obj.name,
                    }))}
                    onDonePress={() => {}}
                  /> */}

                  {/* NEW CODE */}
                  {/* <Picker
                    placeholder={'Year'}
                    style={pickerSelectStyles2}
                    selectedValue={this.state.card.year}
                    onValueChange={value => {
                      Keyboard.dismiss();
                      this.state.card.year = value;
                      // console.warn(value);
                      if (!value) {
                        this.state.card.year = '';
                      } else {
                        this.state.card.year = value;
                      }
                      this.state.errors.year = '';
                      this.setState({
                        card: this.state.card,
                        errors: this.state.errors,
                      });
                    }}
                    // items={this.state.yearList.map(obj => ({
                    //   id: obj.id,
                    //   label: obj.name,
                    //   value: obj.name,
                    // }))}
                    onDonePress={() => {}}>
                    <Picker.Item label="Year" value={0} />
                    {this.state.yearList.map(obj => {
                      return (
                        <Picker.Item
                          key={obj.id}
                          label={obj.name}
                          value={obj.name}
                        />
                      );
                    })}
                  </Picker> */}

                  <SelectDropdown
                    buttonTextStyle={{ fontSize: 15 }}
                    onSelect={(selectedItem, index) => {
                      Keyboard.dismiss();
                      this.state.card.year = selectedItem.id;
                      // console.warn(value);
                      if (!selectedItem.id) {
                        this.state.card.year = '';
                      } else {
                        this.state.card.year = selectedItem.id;
                      }
                      this.state.errors.year = '';
                      this.setState({
                        card: this.state.card,
                        errors: this.state.errors,
                      });
                    }}
                    data={this.state.yearList}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      return selectedItem.name;
                    }}
                    defaultButtonText="Select Year"
                    rowTextForSelection={(item, inex) => {
                      return item.name;
                    }}
                    buttonStyle={{ width: Utils.width * 0.35, borderRadius: 8 }}
                  />
                  <Text
                    style={[
                      styles.errorText,
                      { paddingTop: 0, marginBottom: Utils.moderateScale(5) },
                    ]}>
                    {this.state.errors.year}
                  </Text>
                </View>
              </View>

              <View style={localStyle.row}>
                <Input
                  label="CVV Security Code"
                  returnKeyType="next"
                  keyboardType="numeric"
                  secureTextEntry={true}
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  focusElement={() => this.focusField('cvv')}
                  blurOnSubmit={false}
                  maxLength={4}
                  value={this.state.card.cvv}
                  error={this.state.errors.cvv}
                  refCallback={input => (this.inputs['cvv'] = input)}
                  onSubmitEditing={() => this.focusField('address')}
                  onChangeText={cvv => this.onChangeTextCallback('cvv', cvv)}
                />
                <View style={localStyle.placeholderBWColumn} />
                <View style={{ flex: 1 }}></View>
              </View>
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
                  containerStyle={localStyle.inputContainerStyle}
                  autoCorrect={false}
                  focusElement={() => this.focusField('zip')}
                  value={this.state.card.zip}
                  error={this.state.errors.zip}
                  refCallback={input => (this.inputs['zip'] = input)}
                  onChangeText={zip => this.onChangeTextCallback('zip', zip)}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <View>
            <BlueButton
              onPress={this.saveCard}
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
  addressLabel: {
    fontFamily: 'Poppins-Regular',
    letterSpacing: 2,
    fontSize: Utils.moderateScale(14, 0.5),
    marginBottom: Utils.moderateScale(20, 0.5),
    color: 'black',
  },
  keyboardShowing: {
    marginBottom: Utils.verticalScale(100),
  },
  keyboardNotShowing: {
    marginBottom: Utils.verticalScale(20),
  },
  row: {
    flexDirection: 'row',
  },
  placeholderBWColumn: {
    flex: 1,
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
    paddingLeft: 5, // to ensure the text is never behind the icon
    paddingRight: 5,
  },
  inputAndroid: {
    width: '100%',
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 15,
    color: 'black',
    backgroundColor: '#f0f0f0',
    paddingRight: 30,
    marginBottom: 10, // to ensure the text is never behind the icon
  },
});

const mapStateToProps = state => {
  return {
    appData: state.appData.appData,
    newCardAdded: state.appData.newCardAdded,
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    //setScheduleOrderDataAddress: data => dispatch(ActionCreators.setScheduleOrderDataAddress(data)),
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
    toggleNewCardAdded: data =>
      dispatch(ActionCreators.toggleNewCardAdded(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddNewCardScreen);
