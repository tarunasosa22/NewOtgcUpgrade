import {
  StyleSheet,
  Platform,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Text,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BlueButton from '../components/button/BlueButton';
import LoaderView from '../components/LoaderView';
import { ActionCreators } from '../actions/index';
import Images from '../assets/images/index';
import React, { Component } from 'react';
import * as Utils from '../lib/utils';
import { connect } from 'react-redux';
import styles from './styles';
import moment from 'moment';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { AppStrings } from '../utils/AppStrings';
dayjs.extend(utc);

class OrderDetailsScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'ORDER DETAILS',
      headerRight: (
        <TouchableOpacity
          style={{
            paddingLeft: Utils.scale(30),
            paddingTop: Utils.scale(10),
            paddingBottom: Utils.scale(10),
          }}
          onPress={this.props?.navigation?.getParam('openDrawer')}>
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
      orderData: {},
      loading: true,
      addressData: {
        city: null,
        state: null,
      },
      net_amount: 0,
      coupon_code_amount: 0,
    };
    this._mounted = false;
    const { params } = this.props.route;
    this.orderId = params ? params.orderId : null;
    this.userId = this.props.appData ? this.props?.appData?.id : null;
    this.cancelOrderButtonPress = this.cancelOrderButtonPress.bind(this);
  }

  async fetchState() {
    try {
      const response = await Utils.makeApiRequest(
        ``,
        { country_id: 1 },
        this.props.appData.token,
        'GET',
        'state',
      );
      if (response.status) {
        this.setState({
          loading: false,
          addressData: {
            ...this.state.addressData,
            state: response.data,
          },
        });
        return response.data;
      } else {
        Utils.displayAlert(
          '',
          'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
        );
        this.setState({ loading: false });
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async fetchCity(state_id) {
    try {
      const response = await Utils.makeApiRequest(
        `state/${state_id}`,
        { country_id: 1 },
        this.props.appData.token,
        'GET',
        'city',
      );
      if (response.status) {
        this.setState({
          loading: false,
          addressData: {
            ...this.state.addressData,
            city: response.data,
          },
        });
        return response.data;
      } else {
        Utils.displayAlert(
          '',
          'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
        );
        this.setState({ loading: false });
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  componentDidMount() {
    this._mounted = true;

    if (this.orderId) {
      Utils.makeApiRequest(
        `${this.orderId}`,
        {},
        this.props.appData.token,
        'GET',
        'order',
      )
        .then(async result => {
          console.log(
            '-------------------------------------------------------------',
          );
          console.log('Order Detail ====>>> ', result);
          if (this._mounted) {
            if (result.status === false) {
              this.setState({ loading: false });
              if (this.props?.navigation.isFocused()) {
                Utils.displayAlert(
                  '',
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
              }
            } else if (result.status == true) {
              await this.fetchState();
              await this.fetchCity(this.state.addressData.state[0].id);
              let net_amount = 0;
              if (result.data?.wf_quantity_amount > 0) {
                net_amount += result.data.wf_quantity_amount;
              }
              if (result.data?.wash_fold_amount > 0) {
                net_amount += result.data.wash_fold_amount;
              }
              if (result.data?.dry_clean_amount > 0) {
                net_amount += result.data.dry_clean_amount;
              }
              if (result.data?.preference_amount > 0) {
                net_amount += result.data.preference_amount;
              }
              if (result.data?.order_turn_around) {
                net_amount += result.data?.order_turn_around?.amount;
              }
              if (result.data?.tips > 0) {
                net_amount += result.data?.tips;
              }
              if (result.data?.surcharge_amount) {
                net_amount += result.data?.surcharge_amount;
              }
              if (result.data?.promo_code_amount) {
                if (result.data?.promo_code_type === 'Direct') {
                  net_amount -= result.data?.promo_code_amount;
                  this.setState({
                    coupon_code_amount: result.data?.promo_code_amount,
                  });
                } else {
                  // calcaulte discount percent
                  let coupon_code_amount = 0;
                  coupon_code_amount =
                    (net_amount / 100) * result.data?.promo_code_amount;
                  net_amount -= coupon_code_amount;
                  this.setState({ coupon_code_amount: coupon_code_amount });
                }
              }

              this.setState({
                net_amount,
                orderData: {
                  ...result.data,
                  UserAddress: {
                    ...result.data.UserAddress,
                    city: this.state.addressData.city[0],
                    state: this.state.addressData.state[0],
                  },
                },
                loading: false,
              });
            } else {
              this.setState({ loading: false });
              if (this.props?.navigation.isFocused()) {
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
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  renderWashAndFoldPreferences(preferences = []) {
    if (preferences.length <= 0) {
      return (
        <Text style={[localStyle.text, { marginLeft: 10 }]}>
          {' '}
          No preferences selected
        </Text>
      );
    }
    return preferences.map((preference, index) => {
      return (
        <View key={index} style={localStyle.preferenceRow}>
          <Text style={[localStyle.text, localStyle.preferenceType]}>
            {'   '} {preference.name}
          </Text>
          <Text style={localStyle.preferenceHyphen}></Text>
          <Text style={[localStyle.text, localStyle.preferenceText]}></Text>
        </View>
      );
    });
  }

  renderDryCleaningPreferences(preferences = []) {
    if (preferences.length <= 0) {
      return (
        <Text style={[localStyle.text, { marginLeft: 10 }]}>
          {' '}
          No preferences selected
        </Text>
      );
    }
    return preferences.map((preference, index) => {
      return (
        <View key={index} style={localStyle.preferenceRow}>
          <Text style={[localStyle.text, localStyle.preferenceType]}>
            {'   '} {preference.name}
          </Text>
          <Text style={localStyle.preferenceHyphen}></Text>
          <Text style={[localStyle.text, localStyle.preferenceText]}></Text>
        </View>
      );
    });
  }

  renderServiesAndPrefernces(
    services = [],
    washAndFoldPreferences = [],
    dryCleaningPreferences = [],
  ) {
    if (services.length === 2) {
      return (
        <View>
          <View style={localStyle.firstRowOfTwoRows}>
            <Text style={[localStyle.text]}>1. Wash & Fold</Text>
            <Text style={[localStyle.label]}>{'   '}PREFERENCES</Text>
            <View>
              {this.renderWashAndFoldPreferences(washAndFoldPreferences)}
            </View>
            <View
              style={[
                localStyle.firstRowOfTwoRows,
                { marginLeft: 12, paddingTop: 10 },
              ]}>
              {this.state?.orderData?.order_turn_around && (
                <>
                  <Text style={localStyle.label}>Turn Around Time</Text>
                  {/* <View style={{paddingTop: 5}}>
                    {this.state?.orderData?.order_turn_around?.map(item => {
                      return (
                        <Text
                          style={[localStyle.text, localStyle.preferenceType]}>
                          {item.turntimes} - YES
                        </Text>
                      );
                    })}
                  </View> */}

                  <View style={{ paddingTop: 5 }}>
                    <Text style={[localStyle.text, localStyle.preferenceType]}>
                      {this.state?.orderData?.order_turn_around?.turntimes}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={localStyle.lastRowOfTwoRows}>
            <Text style={[localStyle.text]}>2. Dry Cleaning</Text>
            <Text style={[localStyle.label]}>{'   '}PREFERENCES</Text>
            <View>
              {this.renderDryCleaningPreferences(dryCleaningPreferences)}
            </View>
          </View>
        </View>
      );
    } else if (services.length == 1) {
      if (services[0] == 'Wash & Fold') {
        return (
          <View style={localStyle.firstRowOfTwoRows}>
            <Text style={[localStyle.text]}>Wash & Fold</Text>
            <Text style={[localStyle.label]}>{'   '}PREFERENCES</Text>
            <View>
              {this.renderWashAndFoldPreferences(washAndFoldPreferences)}
            </View>
            <View style={{ paddingTop: 10, marginLeft: 0 }}>
              {this.state?.orderData?.order_turn_around && (
                <>
                  <Text style={localStyle.label}>Turn Around Time</Text>
                  {/* <View style={{paddingTop: 5}}>
                    {this.state?.orderData?.ordersTurnAroundTimes?.map(item => {
                      return (
                        <Text
                          style={[localStyle.text, localStyle.preferenceType]}>
                          {item.turntimes} - YES
                        </Text>
                      );
                    })}
                  </View> */}
                  <View style={{ paddingTop: 5 }}>
                    <Text style={[localStyle.text, localStyle.preferenceType]}>
                      {this.state?.orderData?.order_turn_around?.turntimes}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        );
      } else {
        return (
          <View style={localStyle.lastRowOfTwoRows}>
            <Text style={[localStyle.text]}>Dry Cleaning</Text>
            <Text style={[localStyle.label]}>{'   '}PREFERENCES</Text>
            <View>
              {this.renderDryCleaningPreferences(dryCleaningPreferences)}
            </View>
          </View>
        );
      }
    } else {
      return <Text>---</Text>;
    }
  }

  renderWashAndFoldItems(washAndFoldItems = []) {
    if (washAndFoldItems.length > 0) {
      return (
        <View>
          <View style={[styles.card, localStyle.card]}>
            <Text style={localStyle.heading}>WASH & FOLD ITEMS</Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: Utils.moderateScale(20),

                minHeight: Utils.moderateScale(30),
              }}>
              <Text style={[localStyle.label, { flex: 0.33 }]}>Products</Text>
              <Text
                style={[localStyle.label, { flex: 0.2, textAlign: 'center' }]}>
                QTY
              </Text>
              <Text
                style={[localStyle.label, { flex: 0.22, textAlign: 'right' }]}>
                Unit Price
              </Text>
              <Text
                style={[localStyle.label, { flex: 0.15, textAlign: 'right' }]}>
                Total
              </Text>
            </View>

            {washAndFoldItems.map((item, index) => {
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: Utils.moderateScale(5),
                    paddingHorizontal: Utils.moderateScale(20),
                    minHeight: Utils.moderateScale(40),
                  }}>
                  <Text style={[localStyle.text, { flex: 0.36 }]}>
                    {item.name ? item.name : item?.product?.name}
                  </Text>
                  <Text
                    style={[
                      localStyle.text,
                      { flex: 0.15, textAlign: 'center' },
                    ]}>
                    {item.quantity}{' '}
                    {item.name === 'Wash & Fold Weight' ? 'lb' : ''}
                  </Text>
                  <Text
                    style={[localStyle.text, { flex: 0.2, textAlign: 'right' }]}>
                    $ {this.getFixed(item.price)}
                  </Text>
                  <Text
                    style={[localStyle.text, { flex: 0.2, textAlign: 'right' }]}>
                    $ {this.getFixed(item.quantity * item.price)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      );
    }
    return null;
  }

  renderTurnAroundTimeItems() {
    {
      return (
        this.state?.orderData?.order_turn_around?.length > 0 && (
          <>
            <View>
              <Text style={localStyle.heading}>Turn Around Times</Text>

              <View style={[styles.card, localStyle.card]}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: Utils.moderateScale(5),
                    minHeight: Utils.moderateScale(30),
                  }}>
                  <Text style={[localStyle.label, { flex: 0.45 }]}>Products</Text>
                  <Text
                    style={[
                      localStyle.label,
                      { flex: 0.15, textAlign: 'center' },
                    ]}>
                    QTY
                  </Text>
                  <Text
                    style={[localStyle.label, { flex: 0.2, textAlign: 'right' }]}>
                    Unit Price
                  </Text>
                  <Text
                    style={[localStyle.label, { flex: 0.2, textAlign: 'right' }]}>
                    Total
                  </Text>
                </View>

                {this.state?.orderData?.ordersTurnAroundTimes.map(
                  (item, index) => {
                    console.log(item);
                    return (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: Utils.moderateScale(5),
                          minHeight: Utils.moderateScale(40),
                        }}>
                        <Text style={[localStyle.text, { flex: 0.45 }]}>
                          {item.turntimes ? item.turntimes : '---'}
                        </Text>
                        <Text
                          style={[
                            localStyle.text,
                            { flex: 0.15, textAlign: 'center' },
                          ]}>
                          1
                        </Text>
                        <Text
                          style={[
                            localStyle.text,
                            { flex: 0.2, textAlign: 'right' },
                          ]}>
                          $ {this.getFixed(item.amount)}
                        </Text>
                        <Text
                          style={[
                            localStyle.text,
                            { flex: 0.2, textAlign: 'right' },
                          ]}>
                          $ {this.getFixed(item.amount)}
                        </Text>
                      </View>
                    );
                  },
                )}
              </View>
            </View>
          </>
        )
      );
    }
  }

  renderDryCleanItems(dryCleanItems = []) {
    if (dryCleanItems.length > 0) {
      return (
        <View>
          <View style={[styles.card, localStyle.card]}>
            <Text style={localStyle.heading}>DRY CLEANING ITEMS</Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: Utils.moderateScale(20),
                minHeight: Utils.moderateScale(30),
              }}>
              <Text style={[localStyle.label, { flex: 0.48 }]}>Products</Text>
              <Text
                style={[localStyle.label, { flex: 0.2, textAlign: 'center' }]}>
                QTY
              </Text>
              <Text
                style={[localStyle.label, { flex: 0.28, textAlign: 'right' }]}>
                Unit Price
              </Text>
              <Text
                style={[localStyle.label, { flex: 0.22, textAlign: 'right' }]}>
                Total
              </Text>
            </View>

            {dryCleanItems.map((item, index) => {
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: Utils.moderateScale(5),
                    paddingHorizontal: Utils.moderateScale(20),

                    minHeight: Utils.moderateScale(40),
                  }}>
                  <Text style={[localStyle.text, { flex: 0.4 }]}>
                    {item.name ? item.name : item?.product?.name}
                  </Text>
                  <Text
                    style={[localStyle.text, { flex: 0.1, textAlign: 'center' }]}>
                    {item.quantity}
                  </Text>
                  <Text
                    style={[localStyle.text, { flex: 0.2, textAlign: 'right' }]}>
                    ${this.getFixed(item.price)}
                  </Text>
                  <Text
                    style={[localStyle.text, { flex: 0.2, textAlign: 'right' }]}>
                    ${this.getFixed(item.quantity * item.price)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      );
    }
    return null;
  }

  renderItemData() {
    if (
      !Utils.isEmpty(this.state.orderData) &&
      this.state.orderData.orderItems &&
      this.state.orderData.orderItems.length > 0
    ) {
      console.log('Order Data ===>> ', this.state.orderData);
      let orderItems = this.state.orderData.orderItems;
      let preferencesItems = this.state.orderData.preferences;
      let dryCleanItems = [];
      let washAndFoldItems = [];

      if (this.state.orderData.wf_quantity_amount > 0) {
        let wfWeightItem = {
          categoryID: 1,
          categoryName: 'Wash & Fold',
          name: 'Wash & Fold Weight',
          price:
            this.state.orderData.wf_quantity_amount /
            this.state.orderData.wf_quantity,
          quantity: this.state.orderData.wf_quantity,
        };
        washAndFoldItems.push(wfWeightItem);
      }
      for (let i = 0; i < orderItems.length; i++) {
        if (orderItems[i].category_id == 1) {
          washAndFoldItems.push(orderItems[i]);
        } else if (orderItems[i].category_id == 2) {
          dryCleanItems.push(orderItems[i]);
        }
      }

      for (let i = 0; i < preferencesItems.length; i++) {
        let item = {
          categoryID: preferencesItems[i].category_id,
          categoryName: preferencesItems[i].categoryName,
          name: preferencesItems[i].preference_name,
          price: preferencesItems[i].preference_amount,
          quantity: 1,
        };
        if (item.categoryID == 1) {
          washAndFoldItems.push(item);
        } else if (item.categoryID == 2) {
          dryCleanItems.push(item);
        }
      }

      return (
        <View>
          {this.renderWashAndFoldItems(washAndFoldItems)}
          {this.renderDryCleanItems(dryCleanItems)}
          {this.renderTurnAroundTimeItems()}
        </View>
      );
    } else {
      return null;
    }
  }

  getFixed(value = 0) {
    return parseFloat(value).toFixed(2);
  }

  renderPaymentDetails() {
    if (
      !Utils.isEmpty(this.state.orderData) &&
      this.state.orderData?.status === 'delivered'
    ) {
      let paymentData = this.state.orderData;
      let tip = this.state.orderData.tips ? this.state.orderData.tips : 0;

      return (
        <View
          style={[
            styles.card,
            localStyle.card,
            { padding: Utils.moderateScale(15) },
          ]}>
          {paymentData.wf_quantity_amount > 0 && (
            <View style={localStyle.row}>
              <View
                style={[localStyle.column, localStyle.paymentTextContainer]}>
                <Text style={localStyle.paymentText}>
                  WASH & FOLD WEIGHT AMOUNT
                </Text>
              </View>
              <Text style={localStyle.paymentDetailsHyphen}>:</Text>
              <Text
                style={[
                  localStyle.column,
                  localStyle.text,
                  localStyle.paymentValue,
                ]}>
                <Text style={[localStyle.text, localStyle.dollarSign]}>$</Text>
                {this.getFixed(paymentData.wf_quantity_amount)}
              </Text>
            </View>
          )}
          {paymentData.wash_fold_amount > 0 && (
            <View style={localStyle.row}>
              <View
                style={[localStyle.column, localStyle.paymentTextContainer]}>
                <Text style={localStyle.paymentText}>Wash & Fold Items</Text>
              </View>
              <Text style={localStyle.paymentDetailsHyphen}>:</Text>
              <Text
                style={[
                  localStyle.column,
                  localStyle.text,
                  localStyle.paymentValue,
                ]}>
                <Text style={[localStyle.text, localStyle.dollarSign]}>$</Text>
                {this.getFixed(paymentData.wash_fold_amount)}
              </Text>
            </View>
          )}
          {paymentData.dry_clean_amount > 0 && (
            <View style={localStyle.row}>
              <View
                style={[localStyle.column, localStyle.paymentTextContainer]}>
                <Text style={localStyle.paymentText}>Dry Clean Amount</Text>
              </View>
              <Text style={localStyle.paymentDetailsHyphen}>:</Text>
              <Text
                style={[
                  localStyle.column,
                  localStyle.text,
                  localStyle.paymentValue,
                ]}>
                <Text style={[localStyle.text, localStyle.dollarSign]}>$</Text>
                {this.getFixed(paymentData.dry_clean_amount)}
              </Text>
            </View>
          )}
          {paymentData.preference_amount > 0 && (
            <View style={localStyle.row}>
              <View
                style={[localStyle.column, localStyle.paymentTextContainer]}>
                <Text style={localStyle.paymentText}>Preference Amount</Text>
              </View>
              <Text style={localStyle.paymentDetailsHyphen}>:</Text>
              <Text
                style={[
                  localStyle.column,
                  localStyle.text,
                  localStyle.paymentValue,
                ]}>
                <Text style={[localStyle.text, localStyle.dollarSign]}>$</Text>
                {this.getFixed(paymentData.preference_amount)}
              </Text>
            </View>
          )}

          {paymentData.total_amount > 0 && (
            <View style={localStyle.row}>
              <View
                style={[localStyle.column, localStyle.paymentTextContainer]}>
                <Text style={localStyle.paymentText}>Sub Total</Text>
              </View>
              <Text style={localStyle.paymentDetailsHyphen}>:</Text>
              <Text
                style={[
                  localStyle.column,
                  localStyle.text,
                  localStyle.paymentValue,
                ]}>
                <Text style={[localStyle.text, localStyle.dollarSign]}>$</Text>
                {this.getFixed(paymentData.total_amount)}
              </Text>
            </View>
          )}

          {this.state?.orderData?.order_turn_around && (
            <>
              <View style={localStyle.row}>
                <View
                  style={[localStyle.column, localStyle.paymentTextContainer]}>
                  <Text style={localStyle.paymentText}>
                    {this.state?.orderData?.order_turn_around?.turntimes}
                  </Text>
                </View>
                <Text style={localStyle.paymentDetailsHyphen}>:</Text>
                <Text
                  style={[
                    localStyle.column,
                    localStyle.text,
                    localStyle.paymentValue,
                  ]}>
                  <Text style={[localStyle.text, localStyle.dollarSign]}>
                    $
                  </Text>
                  {this.getFixed(
                    this.state?.orderData?.order_turn_around?.amount,
                  )}
                </Text>
              </View>
            </>
          )}

          {tip > 0 && (
            <View style={localStyle.row}>
              <View
                style={[localStyle.column, localStyle.paymentTextContainer]}>
                <Text style={localStyle.paymentText}>Tip Amount</Text>
              </View>
              <Text style={localStyle.paymentDetailsHyphen}>:</Text>
              <Text
                style={[
                  localStyle.column,
                  localStyle.text,
                  localStyle.paymentValue,
                ]}>
                <Text style={[localStyle.text, localStyle.dollarSign]}>$</Text>
                {this.getFixed(tip)}
              </Text>
            </View>
          )}

          {paymentData?.surcharge_title && (
            <View style={localStyle.row}>
              <View
                style={[localStyle.column, localStyle.paymentTextContainer]}>
                <Text style={localStyle.paymentText}>
                  {paymentData?.surcharge_title}
                </Text>
              </View>
              <Text style={localStyle.paymentDetailsHyphen}>:</Text>
              <Text
                style={[
                  localStyle.column,
                  localStyle.text,
                  localStyle.paymentValue,
                ]}>
                <Text style={[localStyle.text, localStyle.dollarSign]}>$</Text>
                {this.getFixed(paymentData?.surcharge_amount)}
              </Text>
            </View>
          )}

          {paymentData.promo_code_amount > 0 && (
            <View style={localStyle.row}>
              <View
                style={[localStyle.column, localStyle.paymentTextContainer]}>
                <Text style={localStyle.paymentText}>Coupon Code Discount</Text>
              </View>
              <Text style={localStyle.paymentDetailsHyphen}>:</Text>
              <Text
                style={[
                  localStyle.column,
                  localStyle.text,
                  localStyle.paymentValue,
                ]}>
                <Text style={[localStyle.text, localStyle.dollarSign]}>-$</Text>
                {this.getFixed(this.state.coupon_code_amount)}
              </Text>
            </View>
          )}

          <View style={localStyle.row}>
            <View style={[localStyle.column, localStyle.paymentTextContainer]}>
              <Text
                style={[
                  localStyle.paymentText,
                  { fontFamily: 'Poppins-Medium', fontWeight: '600' },
                ]}>
                Total
              </Text>
            </View>
            <Text style={localStyle.paymentDetailsHyphen}>:</Text>
            <Text
              style={[
                localStyle.column,
                localStyle.text,
                localStyle.paymentValue,
                { fontFamily: 'Poppins-Medium', fontWeight: '600' },
              ]}>
              <Text
                style={[
                  localStyle.text,
                  localStyle.dollarSign,
                  { fontFamily: 'Poppins-Medium', fontWeight: '600' },
                ]}>
                $
              </Text>
              {this.getFixed(this.state.net_amount)}
            </Text>
          </View>
        </View>
      );
    }
    return null;
  }

  getDayOfWeek(date) {
    var dayOfWeek = new Date(date).getDay();
    return isNaN(dayOfWeek)
      ? null
      : [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ][dayOfWeek];
  }

  cancelOrderButtonPress() {
    Utils.displayAlert(
      '',
      'Are you sure you want to cancel this order?',
      'OK',
      null,
      function () {
        if (this.orderId) {
          Utils.makeApiRequest(
            `cancel/${this.orderId}`,
            JSON.stringify({}),
            this.props.appData.token,
            'GET',
            'order',
            true,
          )
            .then(result => {
              if (this._mounted) {
                if (result.status === false) {
                  this.setState({ loading: false });
                  if (this.props?.navigation.isFocused()) {
                    Utils.displayAlert(
                      '',
                      'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                    );
                  }
                } else if (result.status == true) {
                  if (this.props?.navigation.isFocused()) {
                    Utils.displayAlert(
                      '',
                      'Order successfully canceled.',
                      'OK',
                      null,
                      function () {
                        this.props?.navigation.goBack();
                      }.bind(this),
                    );
                  }
                } else {
                  this.setState({ loading: false });
                  if (this.props?.navigation?.isFocused()) {
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
      }.bind(this),
      true,
      true,
      false,
    );
  }

  checkService(service) {
    if (service?.includes(AppStrings.WASH_AND_FOLD) && !service?.includes(AppStrings.DRY_CLEANING_AND_WASH_PRESS)) {
      return 1;
    } else if (service?.includes(AppStrings.DRY_CLEANING_AND_WASH_PRESS) && !service?.includes(AppStrings.WASH_AND_FOLD)) {
      return 2;
    } else if (service?.includes(AppStrings.WASH_AND_FOLD) && service?.includes(AppStrings.DRY_CLEANING_AND_WASH_PRESS)) {
      return 3;
    } else {
      return null; // Handle other cases as needed
    }
  }

  render() {
    let { ordersItemData } = this.state.orderData;

    console.log(
      this.state.orderData?.pickupAddress,
      'pickup====================================',
    );

    let ordersData = this.state.orderData;
    let ordersCardData = this.state.orderData?.UserCard;
    let ordersPickupAddressData =
      this.state.orderData?.pickupAddress &&
      this.state.orderData?.pickupAddress[0];
    let ordersPreferenceData = this.state.orderData?.preferences;
    let pickup_date = '---',
      delivery_date = '---',
      timeslot = '---',
      deliveryTimeSlot = '---',
      card_no = '---',
      tip = '---',
      promo_code = '---',
      status = '---',
      address = '---',
      services = [],
      washAndFoldPreferences = [],
      dryCleaningPreferences = [];

    if (ordersData) {
      if (ordersData.pickup_date) {
        // let pickup_date_day_name = this.getDayOfWeek(ordersData.pickup_date);
        let pickup_date_day_name = moment(ordersData.pickup_date).format(
          'dddd',
        );
        pickup_date = new Date(ordersData.pickup_date);
        pickup_date =
          pickup_date_day_name +
          ', ' +
          dayjs(pickup_date).utc().format('MMM DD');
        // moment(pickup_date)
        //   .tz('America/New_York')
        //   .format(Utils.DateFormatReview);
        // moment(pickup_date).format(Utils.DateFormat);
      }
      if (ordersData.delivery_date) {
        // let delivery_date_day_name = this.getDayOfWeek(
        //   ordersData.delivery_date,
        // );
        let delivery_date_day_name = moment(ordersData.delivery_date).format(
          'dddd',
        );

        delivery_date = new Date(ordersData.delivery_date);
        delivery_date =
          delivery_date_day_name +
          ', ' +
          dayjs(delivery_date).utc().format('MMM DD');
        // moment(delivery_date)
        //   .tz('America/New_York')
        //   .format(Utils.DateFormatReview);
        // moment(delivery_date).format(Utils.DateFormat);
      }

      timeslot = ordersData.from_slot + ' - ' + ordersData.to_slot;
      deliveryTimeSlot =
        this.state.orderData.delivery_from_slot +
        ' - ' +
        this.state.orderData.delivery_to_slot;
      services = ordersData.services?.split(',');

      status = {
        pending_pickup: 'Pending Pickup',
        items_collected: 'Items Collected',
        items_being_cleaned: 'Washing and/or Dry Cleaning in Progress',
        on_the_way: 'Out for Delivery',
        delivered: 'Laundry and/or Dry Cleaning returned',
        dry_cleaning_returned: 'Dry Cleaning returned',
        laundry_returned: 'Laundry Returned',
        payment_made: 'Payment Made',
        cancelled: 'Canceled',
      }[ordersData.status];

      promo_code = ordersData.promo_code || '---';
      let promo_code_type = ordersData.promo_code_type || null;
      let promo_code_amount = ordersData.promo_code_amount || '---';
      if (promo_code_type && promo_code_amount != '---') {
        promo_code_amount =
          promo_code_type == 'Direct'
            ? '$' + promo_code_amount
            : promo_code_amount + '%';
      } else if (promo_code_amount != '---') {
        promo_code_amount = '$' + ordersData.promo_code_amount;
      }
      if (promo_code !== '---' && promo_code_amount != '---') {
        promo_code += ' (' + promo_code_amount + ')';
      }
    }

    if (ordersCardData) {
      card_no = ordersCardData.card_no;
    }
    if (ordersPreferenceData) {
      for (let i = 0; i < ordersPreferenceData.length; i++) {
        if (ordersPreferenceData[i].category_id == 1) {
          washAndFoldPreferences.push({
            name: ordersPreferenceData[i].preference_name,
            option: 'Yes',
          });
        } else if (ordersPreferenceData[i].category_id == 2) {
          dryCleaningPreferences.push({
            name: ordersPreferenceData[i].preference_name,
            option: 'Yes',
          });
        }
      }
    }
    console.log('=============>OO', ordersPickupAddressData);
    if (ordersPickupAddressData) {
      address = ordersPickupAddressData.first_name
        ? ordersPickupAddressData.first_name.charAt(0).toUpperCase() +
        ordersPickupAddressData.first_name.substr(1).toLowerCase() +
        ' ' +
        ordersPickupAddressData.last_name.charAt(0).toUpperCase() +
        ordersPickupAddressData.last_name.substr(1).toLowerCase() +
        '\n' +
        ordersPickupAddressData.address2 +
        '\n' +
        ordersPickupAddressData.address1 +
        '\n' +
        (ordersPickupAddressData.cross_street
          ? ordersPickupAddressData.cross_street + '\n'
          : '') +
        ordersPickupAddressData?.cityData?.name +
        ', ' +
        ordersPickupAddressData?.stateData?.name +
        ' ' +
        ordersPickupAddressData.zip_code +
        '\n' +
        'USA' +
        '\n' +
        ordersPickupAddressData.mobile +
        '\n'
        : '---';
      address += ordersPickupAddressData.doorman_building
        ? ordersPickupAddressData.doorman_building.toLowerCase() == 'yes'
          ? 'Doorman Building: Yes'
          : 'Doorman Building: No'
        : '';
    }

    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3b2eb6', '#21e381']}
          style={styles.container}>
          {this.state.loading && (
            <View style={localStyle.loaderContainer}>
              <LoaderView loading={this.state.loading} />
            </View>
          )}
          <ScrollView style={localStyle.scrollView}>
            {/*Order Number and Status*/}
            <View style={[styles.card, localStyle.card, localStyle.topCard]}>
              <View style={[localStyle.content]}>
                <View
                  style={[
                    localStyle.column,
                    localStyle.row,
                    { justifyContent: 'space-between' },
                  ]}>
                  <Text style={localStyle.label}>ORDER NUMBER:</Text>
                  <Text style={localStyle.text}>
                    {ordersData && ordersData.order_number
                      ? '#' + ordersData.order_number
                      : '---'}
                  </Text>
                </View>
                <View
                  style={[
                    localStyle.column,
                    localStyle.row,
                    { justifyContent: 'space-between' },
                  ]}>
                  <Text style={[localStyle.label, { flex: 0.35 }]}>
                    ORDER STATUS:
                  </Text>
                  {/*{`\u2022 `}  -- Dot is removed  */}
                  <Text
                    style={[localStyle.text, { textAlign: 'right', flex: 0.65 }]}>
                    {status}
                  </Text>
                </View>
              </View>
            </View>

            {/*/!* Services Preferences*!/*/}
            <View style={[styles.card, localStyle.card]}>
              <View style={[localStyle.content, { marginBottom: 0 }]}>
                <Text style={localStyle.label}>SERVICES</Text>
                {services?.length <= 0 ? (
                  <Text>---</Text>
                ) : (
                  this.renderServiesAndPrefernces(
                    services,
                    washAndFoldPreferences,
                    dryCleaningPreferences,
                  )
                )}
              </View>
            </View>

            {/*Pickup Date and Time Slot*/}
            <View style={[styles.card, localStyle.card]}>
              <View style={[localStyle.content]}>
                <View style={localStyle.row}>
                  <View style={localStyle.column}>
                    <Text style={localStyle.label}>PICKUP DATE</Text>
                    <Text style={localStyle.text}>{pickup_date}</Text>
                  </View>
                  <View
                    style={[
                      localStyle.column,
                      { paddingLeft: Utils.moderateScale(5) },
                    ]}>
                    <Text style={localStyle.label}>TIME SLOT</Text>
                    <Text style={localStyle.text}>{timeslot}</Text>
                  </View>
                </View>
              </View>

              <View style={[localStyle.content]}>
                <View style={localStyle.row}>
                  <View style={localStyle.column}>
                    <Text style={localStyle.label}>DELIVERY DATE</Text>
                    <Text style={localStyle.text}>{this.checkService(ordersData?.services) == 2 ? '---' : delivery_date}</Text>
                  </View>
                  {this.state?.orderData?.order_turn_around?.turntimes
                    ?.toLowerCase()
                    ?.includes('same day') ? (
                    <Text></Text>
                  ) : (
                    <View
                      style={[
                        localStyle.column,
                        { paddingLeft: Utils.moderateScale(5) },
                      ]}>
                      <Text style={localStyle.label}>TIME SLOT</Text>
                      <Text style={localStyle.text}>{this.checkService(ordersData?.services) == 2 ? '---' : deliveryTimeSlot}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* <View
                style={{
                  marginLeft: Utils.moderateScale(Utils.width * 0.04),
                  marginBottom: Utils.verticalScale(Utils.height * 0.02),
                }}>
                <Text style={localStyle.label}>DELIVERY TIME</Text>
                <View style={{flexDirection: 'row', gap: 10}}>
                  <Text style={localStyle.text}>{delivery_date}</Text>
                  <Text style={localStyle.text}>
                    {this.state.orderData.delivery_to_slot}
                  </Text>
                </View>
              </View> */}
            </View>

            {/*Pickup Address*/}
            <View style={[styles.card, localStyle.card]}>
              <View style={localStyle.content}>
                <Text style={localStyle.label}>PICKUP ADDRESS</Text>
                <Text style={localStyle.text}>{address}</Text>
              </View>
            </View>

            {/*Additional Cleaning Instruction*/}
            <View style={[styles.card, localStyle.card]}>
              <View style={localStyle.content}>
                {services?.includes('Wash & Fold') && (
                  <View style={localStyle.firstRowOfTwoRows}>
                    <Text style={localStyle.label}>
                      ADDITIONAL WASH & FOLD INSTRUCTIONS
                    </Text>
                    <Text style={localStyle.text}>
                      {ordersData && ordersData.service_instructions
                        ? ordersData.service_instructions
                        : '---'}
                    </Text>
                  </View>
                )}
                {services?.includes('Dry Cleaning / Wash & Press') && (
                  <View style={localStyle.firstRowOfTwoRows}>
                    <Text style={localStyle.label}>
                      ADDITIONAL DRY CLEANING / WASH & PRESS INSTRUCTIONS
                    </Text>
                    <Text style={localStyle.text}>
                      {ordersData && ordersData.dry_instructions
                        ? ordersData.dry_instructions
                        : '---'}
                    </Text>
                  </View>
                )}

                <View style={localStyle.lastRowOfTwoRows}>
                  <Text style={localStyle.label}>
                    DRIVER/DELIVERY INSTRUCTIONS
                  </Text>
                  <Text style={localStyle.text}>
                    {ordersData && ordersData.driver_instructions
                      ? ordersData.driver_instructions
                      : '---'}
                  </Text>
                </View>
              </View>
            </View>

            {/*Promo Code, Tip and Card*/}
            <View style={[styles.card, localStyle.card]}>
              <View style={localStyle.content}>
                <View style={localStyle.firstRowOfTwoRows}>
                  <Text style={localStyle.label}>PROMO CODE</Text>
                  <Text style={localStyle.text}>{promo_code}</Text>
                </View>
                <View style={localStyle.lastRowOfTwoRows}>
                  <Text style={localStyle.label}>TIP</Text>
                  <Text style={localStyle.text}>
                    {ordersData && ordersData.tips
                      ? '$' + String(ordersData.tips)
                      : '---'}
                  </Text>
                </View>
                <View style={localStyle.lastRowOfTwoRows}>
                  <Text style={localStyle.label}>PAYMENT TYPE</Text>
                  <Text style={localStyle.text}>
                    {card_no !== '---'
                      ? 'Credit Card (' + card_no + ')'
                      : '---'}
                  </Text>
                </View>
              </View>
            </View>

            {this.renderItemData()}
            {this.renderPaymentDetails()}

            {this.props.route.params.orderType == 'pending' ? (
              <BlueButton
                onPress={this.cancelOrderButtonPress}
                buttonText="CANCEL ORDER"
                style={localStyle.cancelOrderButton}
              />
            ) : null}
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }
}

const localStyle = StyleSheet.create({
  card: {
    marginLeft: Utils.scale(15),
    marginRight: Utils.scale(15),
    marginTop: Utils.scale(8),
    paddingVertical: Utils.scale(10),
    ...Platform.select({
      android: {
        marginTop: Utils.scale(4),
        marginBottom: Utils.scale(4),
      },
    }),
  },
  heading: {
    fontFamily: 'Poppins-Medium',
    fontWeight: '700',
    letterSpacing: 1,
    color: '#657f8b',
    fontSize: Utils.moderateScale(14, 0.5),
    marginLeft: Utils.scale(15),
    marginTop: Utils.scale(2),
    paddingBottom: Utils.scale(10),
  },
  scrollView: {
    marginBottom: Utils.scale(5),
  },
  topCard: {
    marginTop: Utils.scale(20),
  },
  content: {
    margin: Utils.scale(15),
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  cancelOrderButton: {
    marginBottom: Utils.scale(5),
    alignSelf: 'center',
    marginTop: Utils.scale(5),
  },
  loaderContainer: {
    position: 'absolute',
    height: Utils.height,
    width: Utils.width,
    backgroundColor: 'rgba(150, 200, 200, 0.4)',
    zIndex: 100,
  },
  label: {
    color: '#657f8b',
    fontFamily: 'Poppins-Medium',
    fontWeight: '900',
    letterSpacing: 1,
    fontSize: Utils.scale(11),
    lineHeight: 22,
  },
  text: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    lineHeight: 22,
  },
  firstRowOfTwoRows: {
    marginBottom: Utils.scale(6),
  },
  lastRowOfTwoRows: {
    marginTop: Utils.scale(6),
  },
  preferenceRow: {
    flexDirection: 'row',
  },
  preferenceType: {
    flex: 2,
  },
  preferenceText: {
    flex: 0.4,
  },
  preferenceHyphen: {
    flex: 0.2,
    textAlign: 'center',
  },
  paymentTextContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  paymentText: {
    color: '#434343',
    fontFamily: 'Roboto-BoldCondensed',
    lineHeight: 30,
    fontSize: Utils.moderateScale(14),
    ...Platform.select({
      android: {
        fontWeight: '600',
        fontSize: Utils.moderateScale(13),
      },
    }),
  },
  paymentDetailsHyphen: {
    lineHeight: 30,
    flex: 0.2,
    textAlign: 'center',
  },
  paymentValue: {
    flex: 0.7,
    color: '#1f3f33',
    textAlign: 'right',
    lineHeight: 30,
    letterSpacing: 1,
  },
  dollarSign: {
    lineHeight: 30,
    fontWeight: '500',
    color: '#1f3f33',
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

export default connect(mapStateToProps, mapDispatchToProps)(OrderDetailsScreen);
