import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  InteractionManager,
  Text,
} from 'react-native';
// import { SafeAreaView } from 'react-navigation';
import { CommonActions, StackActions } from '@react-navigation/native';
import { connect } from 'react-redux';
import Images from '../assets/images/index';
import LoaderFullScreen from '../components/LoaderFullScreen';
import { ActionCreators } from '../actions/index';
import styles from './styles';
import * as Utils from '../lib/utils';
import BlueButton from '../components/button/BlueButton';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import MomentTimezone from 'moment-timezone';
import dayjs from 'dayjs';
import { AppStrings } from '../utils/AppStrings';
import { firebase } from '@react-native-firebase/dynamic-links';
import { store } from '../../App';

class ReviewOrderScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'REVIEW ORDER',
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
      loading: false,
      defaultTurnTime: 1,
      deliveryDay: null,
      services: this.props?.servicesAndPreferences?.services,
    };
    this._mounted = false;
    this.placeOrder = this.placeOrder.bind(this);
  }

  componentDidMount() {
    this._mounted = true;
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });

    this.getSiteSettings();
  }

  async getSiteSettings() {
    Utils.makeApiRequest('settings', {}, null, 'GET', 'auth').then(res => {
      if (res?.data) {
        let deliveryDate = dayjs(
          this.props.orderData?.dateTime?.delivery_pickup_date,
        ).add(res.data.default_turn_time, 'days');

        const weekDay = dayjs(deliveryDate).day();

        if (weekDay === 0) {
          deliveryDate = dayjs(deliveryDate)
            .add(1, 'days')
            .format('dddd, MM/DD/YY');
        }
        if (weekDay === 6) {
          deliveryDate = dayjs(deliveryDate)
            .add(2, 'days')
            .format('dddd, MM/DD/YY');
        }
        if (typeof deliveryDate === 'object') {
          deliveryDate = deliveryDate.format('dddd, MM/DD/YY');
        }
        this.setState({
          defaultTurnTime: res.data.default_turn_time,
          deliveryDay: deliveryDate,
        });
      }
    });
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  checkIdExists(selectedPreferences = [], id = null) {
    if (selectedPreferences.length && id) {
      for (let i = 0; i < selectedPreferences.length; i++) {
        if (selectedPreferences[i].preference_id == id) {
          return true;
        }
      }
    }
    return false;
  }

  getSelectedOption(selectedPreferences = [], id = null) {
    if (selectedPreferences.length && id) {
      for (let i = 0; i < selectedPreferences.length; i++) {
        if (selectedPreferences[i].preference_id == id) {
          return selectedPreferences[i].selected_option;
        }
      }
    }
    return 'No';
  }

  getPreferencesWithYes(allPreferences = [], selectedPreferences = []) {
    let result = [];
    for (let i = 0; i < allPreferences.length; i++) {
      let add = false;
      if (this.checkIdExists(selectedPreferences, allPreferences[i].id)) {
        if (
          this.getSelectedOption(
            selectedPreferences,
            allPreferences[i].id,
          ).toLowerCase() == 'yes'
        ) {
          add = true;
        }
      } else if (
        (allPreferences[i].options[0]?.default_option == 1 &&
          allPreferences[i].options[0]?.name.toLowerCase() == 'yes') ||
        (allPreferences[i].options[1]?.default_option == 1 &&
          allPreferences[i].options[1]?.name.toLowerCase() == 'yes')
      ) {
        add = true;
      }

      if (add) {
        result.push({
          preference_id: allPreferences[i].id,
          category_id: allPreferences[i].category_id,
          preference_amount: allPreferences[i].price,
          preference_name: allPreferences[i].name,
          option1: allPreferences[i].options[0].name,
          option2: allPreferences[i].options[1].name,
          selected_option: 'Yes',
        });
      }
    }
    return result;
  }

  async generateLink(orderId) {
    try {
      const link = await firebase.dynamicLinks().buildShortLink(
        {
          link: `https://onthegocleaners.page.link?open_app/${orderId}`,
          // link: `https://onthegocleaners.com?open_app/${orderId}`,
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
      console.log('LINK---', link)
      return link
    }
    catch (error) {
      console.error('Error generating dynamic link:', error);
    }
  }

  async placeOrder() {
    let orderData = this.props.orderData;
    console.log('Order Data', orderData);
    let { services, preferences } = orderData.servicesAndPreferences;
    let { preferencesNameList, address, card } = orderData;
    let { service_instructions, driver_instructions, dry_instructions } =
      orderData.instructions;

    let {
      delivery_pickup_date,
      delivery_pickup_time_from,
      delivery_pickup_time_to,
      deliveryData,
      selectedTurnAroundTimes,
    } = orderData.dateTime;
    console.log('Selected Turn Around Time: ', selectedTurnAroundTimes);

    if (services.split(',').length == 2) {
      preferences = [
        ...this.getPreferencesWithYes(preferencesNameList['1'], preferences),
        ...this.getPreferencesWithYes(preferencesNameList['2'], preferences),
      ];
    } else if (services == 'Wash & Fold') {
      preferences = this.getPreferencesWithYes(
        preferencesNameList['1'],
        preferences,
      );
    } else {
      preferences = this.getPreferencesWithYes(
        preferencesNameList['2'],
        preferences,
      );
    }

    let oldYear = '',
      oldMonth = '';

    if (card && card.is_add_new_card) {
      oldYear = card.card_details[0].year;
      oldMonth = card.card_details[0].month;
      card.card_details[0].year = String(card.card_details[0].year).slice(2);
      let tempMonth = '0' + String(card.card_details[0].month);
      card.card_details[0].month = tempMonth.slice(
        tempMonth.length - 2,
        tempMonth.length,
      );
    }

    const data = {
      service: {
        service: services.split(',').map(item => {
          if (item === 'Wash & Fold') {
            return 1;
          }
          if (item === 'Dry Cleaning / Wash & Press') {
            return 2;
          }
        }),
        preference: preferences.map(item => item.preference_id),
        date: delivery_pickup_date,
        deliveryDate: deliveryData?.delivery_pickup_date,
        driverInstruction: driver_instructions,
        washInstruction: service_instructions,
        sameDayDelivery: selectedTurnAroundTimes[0] ?? null,
        dryInstruction: dry_instructions,
        serviceDetail: services.split(',').length === 2 ? 'both' : [services],
        timeSlotDetail: {
          from_slot: delivery_pickup_time_from,
          to_slot: delivery_pickup_time_to,
        },
        delivery_slot: {
          // date: deliveryData?.delivery_pickup_date,
          delivery_from_slot: deliveryData?.delivery_pickup_time_from,
          delivery_to_slot: deliveryData?.delivery_pickup_time_to,
        }
      },
      userAddress: {
        user_id: this.props.appData.id,
        addressID: address.pickup_address_id,
      },
      // appURL: await this.generateLink(),
      userCard: {
        id: card.user_card_id,
        billingZipcode: card?.cardList[0]?.zip_code,
        tip: this.props.orderData?.card?.tip,
        promoCode: this.props.orderData?.card.promo_code,
      },
    };

    // let data = {
    //   services: services,
    //   selected_preferences: preferences,
    //   delivery_pickup_date: delivery_pickup_date,
    //   delivery_pickup_time_from: delivery_pickup_time_from,
    //   delivery_pickup_time_to: delivery_pickup_time_to,
    //   service_instructions: service_instructions,
    //   dry_instructions: dry_instructions,
    //   driver_instructions: driver_instructions,
    //   promo_code_id: card.promo_code_id,
    //   promo_code: card.promo_code,
    //   promo_code_type: card.promo_code_type,
    //   is_add_new_card: card.is_add_new_card,
    //   is_add_new_address: address.is_add_new_address,
    //   pickup_address_id: address.pickup_address_id,
    //   tip: card.tip,
    //   user_card_id: card.user_card_id,
    //   selected_turn_around_times: selectedTurnAroundTimes,
    //   address_details: address.is_add_new_address
    //     ? address.address_details
    //     : [{}],
    //   card_details: card.is_add_new_card ? card.is_add_new_card : [{}],
    // };
    console.log(JSON.stringify(data), 'data order');
    this.setState({ loading: true });


    Utils.makeApiRequest(
      'confirm-order?orderVia=App',
      JSON.stringify(data),
      this.props.appData.token,
      'POST',
      'order',
      true,
    )
      .then(async result => {
        if (this._mounted) {
          if (oldYear && oldMonth) {
            card.card_details[0].year = oldYear;
            card.card_details[0].month = oldMonth;
          }
          this.setState({ loading: false });
          if (result.status === false) {
            Utils.displayAlert(
              '',
              'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
            );
          } else if (result.status) {
            let count = Number(this.props.isOrderSchedule?.isOrderSchedule) + 1
            this.props.setOderSchedule({ isOrderSchedule: count })
            if (count % 3 == 0) {
              store.dispatch(ActionCreators.setDoneRate({ isDoneRate: false }))
            }
            let params = {
              appURL: await this.generateLink(result.data.id),
              orderId: result.data.id
            }
            Utils.makeApiRequest(
              'app-url/update',
              JSON.stringify(params),
              this.props.appData.token,
              'PATCH',
              'order',
              true,
            ).then(result => {
              if (result.status) {
                global.expressOrder = false;
                Utils.displayAlert(
                  'Thank You!',
                  'Your order has been placed',
                  'CLOSE',
                  null,
                  () => {
                    this.props.clearScheduleOrderData();
                    this.props.toggleNewOrderAdded();
                    this.props.navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [
                          {
                            name: 'MyOrdersNav',
                          },
                        ],
                      }),
                    );
                    // this.props.navigation.navigate('MyOrdersNav', {
                    //   screen: 'PendingOrders',
                    // });

                    // InteractionManager.runAfterInteractions(() =>
                    //   this.props.navigation.navigate('MyOrdersNav', {
                    //     screen: 'PendingOrders',
                    //   }),
                    // );
                  },
                  false,
                  false,
                );
              }
            })

          } else {
            Utils.displayAlert(
              '',
              result.msg ||
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

  getOption(preference = {}, selectedPreferencesList = []) {
    const filteredList = selectedPreferencesList?.filter(
      sameDay => sameDay.preference_id != 14,
    );
    if (filteredList.length) {
      for (let i = 0; i < filteredList.length; i++) {
        if (filteredList[i].preference_id == preference.id) {
          if (filteredList[i].selected_option?.toLowerCase() == 'yes') {
            return filteredList[i].selected_option;
          } else {
            return false;
          }
        }
      }
    }
    return this.findDefaultOption(preference.options);
  }

  findDefaultOption(options = []) {
    if (options.length > 0) {
      for (let i = 0; i < options.length; i++) {
        if (
          options[i].name.toLowerCase() == 'yes' &&
          options[i].default_option == 1
        ) {
          return options[i].name;
        }
      }
    }
    return false;
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

  renderWashAndFoldPreferences(
    preferencesNameList = [],
    selectedPreferences = [],
  ) {
    if (preferencesNameList.length <= 0) {
      return <Text style={localStyle.text}>No preferences selected</Text>;
    }
    let i = 0;
    function getIndex() {
      i += 1;
      return i;
    }

    return preferencesNameList.map((preference, index) => {
      let option = this.getOption(preference, selectedPreferences);
      if (option !== false) {
        return (
          <View key={index} style={localStyle.preferenceRow}>
            <Text style={[localStyle.text, localStyle.preferenceType]}>
              {'   '}
              {preference.name}
            </Text>
            <Text style={localStyle.preferenceHyphen}></Text>
            <Text style={[localStyle.text, localStyle.preferenceText]}></Text>
          </View>
        );
      } else {
        return undefined;
      }
    });
  }

  renderDryCleaningPreferences(
    preferencesNameList = [],
    selectedPreferences = [],
  ) {
    if (preferencesNameList.length <= 0) {
      return <Text style={localStyle.text}> No preferences selected</Text>;
    }
    let i = 0;
    function getIndex() {
      i += 1;
      return i;
    }
    return preferencesNameList.map((preference, index) => {
      let option = this.getOption(preference, selectedPreferences);
      if (option !== false) {
        return (
          <View key={index} style={localStyle.preferenceRow}>
            <Text style={[localStyle.text, localStyle.preferenceType]}>
              {'   '}
              {preference.name}
            </Text>
            <Text style={localStyle.preferenceHyphen}></Text>
            <Text style={[localStyle.text, localStyle.preferenceText]}></Text>
          </View>
        );
      } else {
        return undefined;
      }
    });
  }

  renderServicesAndPreferences(
    services = [],
    preferencesNameList = [],
    washAndFoldPreferences = [],
    dryCleaningPreferences = [],
  ) {
    const filteredList = washAndFoldPreferences?.filter(
      sameDay => sameDay.preference_id != 14,
    );
    const sameDayFilter = washAndFoldPreferences?.filter(
      sameDay => sameDay.preference_id === 14,
    );
    let renderWashAndFoldPreferencesData = this.renderWashAndFoldPreferences(
      preferencesNameList['1'],
      filteredList,
    );
    renderWashAndFoldPreferencesData =
      renderWashAndFoldPreferencesData.length == undefined
        ? renderWashAndFoldPreferencesData
        : renderWashAndFoldPreferencesData.filter(item => item != undefined);

    let renderDryCleaningPreferencesData = this.renderDryCleaningPreferences(
      preferencesNameList['2'],
      dryCleaningPreferences,
    );
    renderDryCleaningPreferencesData =
      renderDryCleaningPreferencesData.length == undefined
        ? renderDryCleaningPreferencesData
        : renderDryCleaningPreferencesData.filter(item => item != undefined);
    if (services.length == 2) {
      let wAFPref = renderWashAndFoldPreferencesData;
      let dCPref = renderDryCleaningPreferencesData;
      return (
        <View>
          <View style={localStyle.firstRowOfTwoRows}>
            <Text style={[localStyle.text]}>1. Wash & Fold</Text>
            <View>
              <Text style={[localStyle.label]}>{'   '}PREFERENCES</Text>
              <View>
                {wAFPref.length > 0 ? wAFPref : <Text>{'   '}---</Text>}
              </View>
            </View>
          </View>
          <View style={localStyle.lastRowOfTwoRows}>
            <Text style={[localStyle.text]}>2. Dry Cleaning</Text>
            <View>
              <Text style={[localStyle.label]}>{'   '}PREFERENCES</Text>
              <View>
                {dCPref.length > 0 ? dCPref : <Text>{'   '}---</Text>}
              </View>
            </View>
          </View>
        </View>
      );
    } else if (services.length == 1) {
      if (services[0] == 'Wash & Fold') {
        let wAFPref = renderWashAndFoldPreferencesData;
        return (
          <>
            <View style={localStyle.firstRowOfTwoRows}>
              <Text style={[localStyle.text]}>Wash & Fold</Text>
              <View>
                <Text style={[localStyle.label]}>{'   '}PREFERENCES</Text>
                <View>
                  {wAFPref.length > 0 ? wAFPref : <Text>{'   '}---</Text>}
                </View>
              </View>
            </View>
            {sameDayFilter.length > 0 && (
              <View style={localStyle.firstRowOfTwoRows}>
                <View>
                  <Text style={[localStyle.text]}>
                    {sameDayFilter[0]?.preference_name} - Yes
                  </Text>
                </View>
              </View>
            )}
          </>
        );
      } else {
        let dCPref = renderDryCleaningPreferencesData;
        return (
          <View style={localStyle.lastRowOfTwoRows}>
            <Text style={[localStyle.text]}>Dry Cleaning</Text>
            {dCPref.length > 0 ? (
              <View>
                <Text style={[localStyle.label]}>{'   '}PREFERENCES</Text>
                <View>{dCPref}</View>
              </View>
            ) : (
              <View>
                <Text style={[localStyle.label]}>{'   '}PREFERENCES</Text>
                <View>
                  <Text>{'   '}---</Text>
                </View>
              </View>
            )}
          </View>
        );
      }
    } else {
      return <Text>---</Text>;
    }
  }

  checkService() {
    let service = this.state.services
    if (service.includes(AppStrings.WASH_AND_FOLD) && !service.includes(AppStrings.DRY_CLEANING_AND_WASH_PRESS)) {
      return 1;
    } else if (service.includes(AppStrings.DRY_CLEANING_AND_WASH_PRESS) && !service.includes(AppStrings.WASH_AND_FOLD)) {
      return 2;
    } else if (service.includes(AppStrings.WASH_AND_FOLD) && service.includes(AppStrings.DRY_CLEANING_AND_WASH_PRESS)) {
      return 3;
    } else {
      return null; // Handle other cases as needed
    }
  }

  render() {
    let orderData = this.props.orderData;

    let { services, preferences } = orderData.servicesAndPreferences;
    services = services.split(',').filter(item => item != '');
    let washAndFoldPreferences = [],
      dryCleaningPreferences = [];
    if (preferences.length > 0) {
      for (let i = 0; i < preferences.length; i++) {
        if (preferences[i].category_id == 1) {
          washAndFoldPreferences.push(preferences[i]);
        } else if (preferences[i].category_id == 2) {
          dryCleaningPreferences.push(preferences[i]);
        }
      }
    }

    let { servicesNameList, preferencesNameList, address, card } = orderData;
    let promo_code_type = card.promo_code_type || null;
    let promo_code = card.promo_code || '---';
    let promo_code_amount = card.promo_code_amount || '---';
    if (promo_code_type && promo_code_amount != '---') {
      promo_code_amount =
        promo_code_type == 'Direct'
          ? '$' + promo_code_amount
          : promo_code_amount + '%';
    } else if (promo_code_amount != '---') {
      promo_code_amount = '$' + card.promo_code_amount;
    }
    if (promo_code !== '---') {
      promo_code += ' (' + promo_code_amount + ')';
    }

    let tip = card.tip || '---';
    if (!Utils.isEmpty(address) && address.address_details.length > 0) {
      address = address.address_details[0];
    }
    if (!Utils.isEmpty(card) && card.card_details.length > 0) {
      card = card.card_details[0];
    }
    let { service_instructions, dry_instructions, driver_instructions } =
      orderData.instructions;
    let {
      momentDelivery_pickup_date,
      deliveryData,
      delivery_pickup_date,
      delivery_pickup_time_from,
      delivery_pickup_time_to,
    } = orderData.dateTime;
    let momentDelivery_pickup_date1;
    let momentDelivery_date1;
    let momentfinal_delivery_date;
    if (delivery_pickup_date) {
      momentDelivery_pickup_date = moment(delivery_pickup_date)
        .tz('America/New_York')
        .format(Utils.DateFormatReview);

      momentDelivery_pickup_date1 = moment(delivery_pickup_date)
        .tz('America/New_York')
        .format(Utils.DateFormatReview1);

      momentDelivery_date1 = moment(deliveryData?.delivery_pickup_date)
        .tz('America/New_York')
        .format(Utils.DateFormatReview1);

      // let dayName = this.getDayOfWeek(delivery_pickup_date);
      let dayName = moment(delivery_pickup_date).format('dddd');
      let deliveryDayName = moment(deliveryData?.delivery_pickup_date).format('dddd');
      let dayName1 = this.getDayOfWeek(momentDelivery_pickup_date1);
      momentDelivery_pickup_date = dayName + ', ' + momentDelivery_pickup_date1;
      momentfinal_delivery_date = deliveryDayName + ', ' + momentDelivery_date1;
      delivery_pickup_date = new Date(delivery_pickup_date);
      delivery_pickup_date =
        dayName +
        ', ' +
        String(delivery_pickup_date.getMonth() + 1) +
        '/' +
        String(delivery_pickup_date.getDate()) +
        '/' +
        String(delivery_pickup_date.getFullYear()).substring(2);
    }

    let cardNo = '';
    if (card && typeof card == 'object' && typeof card.card_no == 'string') {
      for (let i = 0; i < card.card_no.length - 4; i++) {
        cardNo += '*';
      }
      cardNo += card.card_no.slice(-4);
    }

    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3b2eb6', '#21e381']}
          style={styles.container}>
          <LoaderFullScreen
            loading={this.state.loading}
            message={this.state.message}
          />
          <BlueButton
            onPress={this.placeOrder}
            buttonText="PLACE ORDER"
            style={localStyle.confirmButton}
          />
          <ScrollView style={localStyle.scrollView}>
            <View style={[styles.card, localStyle.card]}>
              <View style={localStyle.content}>
                <View style={localStyle.editRow}>
                  <Text style={localStyle.label}>SERVICES</Text>
                  <TouchableOpacity
                    hitSlop={{ top: 15, bottom: 15, right: 15, left: 15 }}
                    onPress={() =>
                      this.props.navigation.navigate('ScheduleOrder')
                    }>
                    <Image
                      source={Images.editReviewIcon}
                      style={localStyle.editIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
                {services.length <= 0 ? (
                  <Text>---</Text>
                ) : (
                  this.renderServicesAndPreferences(
                    services,
                    preferencesNameList,
                    washAndFoldPreferences,
                    dryCleaningPreferences,
                  )
                )}
              </View>
            </View>
            <View style={[styles.card, localStyle.card]}>
              <View style={localStyle.content}>
                {services?.includes('Wash & Fold') && (
                  <View style={localStyle.firstRowOfTwoRows}>
                    <View style={localStyle.editRow}>
                      <Text style={localStyle.label}>
                        ADDITIONAL WASH & FOLD INSTRUCTIONS
                      </Text>
                      <TouchableOpacity
                        hitSlop={{ top: 15, bottom: 15, right: 15, left: 15 }}
                        onPress={() =>
                          this.props.navigation.navigate(
                            'ScheduleOrderInstructions',
                          )
                        }>
                        <Image
                          source={Images.editReviewIcon}
                          style={localStyle.editIcon}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={localStyle.text}>
                      {service_instructions ? service_instructions : '---'}
                    </Text>
                  </View>
                )}
                {services?.includes('Dry Cleaning / Wash & Press') &&
                  (
                    <View style={localStyle.firstRowOfTwoRows}>
                      <View style={localStyle.editRow}>
                        <Text style={localStyle.label}>
                          ADDITIONAL DRY CLEANING / WASH & PRESS INSTRUCTIONS
                        </Text>
                        <TouchableOpacity
                          hitSlop={{ top: 15, bottom: 15, right: 15, left: 15 }}
                          onPress={() =>
                            this.props.navigation.navigate(
                              'ScheduleOrderInstructions',
                            )
                          }>
                          <Image
                            source={Images.editReviewIcon}
                            style={localStyle.editIcon}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      </View>
                      <Text style={localStyle.text}>
                        {dry_instructions ? dry_instructions : '---'}
                      </Text>
                    </View>
                  )}
                <View style={localStyle.lastRowOfTwoRows}>
                  <Text style={localStyle.label}>
                    DRIVER/DELIVERY INSTRUCTIONS
                  </Text>
                  <Text style={localStyle.text}>
                    {driver_instructions ? driver_instructions : '---'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={[styles.card, localStyle.card]}>
              <View style={[localStyle.content, localStyle.twoCols]}>
                <View style={localStyle.column}>
                  <Text style={localStyle.label}>PICKUP DATE</Text>
                  <Text style={localStyle.text}>
                    {/* {console.log(momentDelivery_pickup_date, '-------')} */}
                    {momentDelivery_pickup_date}
                  </Text>
                </View>
                <View style={localStyle.column}>
                  <View style={localStyle.editRow}>
                    <Text style={localStyle.label}>PICKUP TIME SLOT</Text>
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate('ScheduleDateTime')
                      }>
                      <Image
                        source={Images.editReviewIcon}
                        style={localStyle.editIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={localStyle.text}>
                    {delivery_pickup_time_from +
                      ' - ' +
                      delivery_pickup_time_to}
                  </Text>
                </View>
              </View>
              <View style={{ paddingHorizontal: 15, paddingBottom: 18 }}>
                <View>
                  {this.props.orderData?.dateTime?.selectedTurnAroundTimes
                    ?.length >= 1 ? (
                    <>
                      <Text style={localStyle.label}>DELIVERY</Text>
                      <Text>
                        {
                          this.props.orderData?.dateTime
                            ?.selectedTurnAroundTimes[0]?.description
                        }
                      </Text>
                    </>
                  ) :
                    <>
                      {(this.checkService() == 1 || this.checkService() == 3) ?
                        <View
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <View style={{ width: '50%' }}>
                            <Text style={localStyle.label}>DELIVERY DATE</Text>
                            <Text style={localStyle.text}>
                              {(this.checkService() == 1 || this.checkService() == 3) ? momentfinal_delivery_date : this.state.deliveryDay}
                              {/* {this.state.deliveryDay} */}
                            </Text>
                          </View>

                          <View style={{ width: '50%' }}>
                            <Text style={localStyle.label}>DELIVERY TIME SLOT</Text>
                            <Text style={localStyle.text}>
                              {(this.checkService() == 1 || this.checkService() == 3) ?
                                deliveryData?.delivery_pickup_time_from +
                                ' - ' +
                                deliveryData?.delivery_pickup_time_to :
                                delivery_pickup_time_from +
                                ' - ' +
                                delivery_pickup_time_to}
                            </Text>
                          </View>
                        </View> : null}
                    </>
                  }
                </View>
              </View>
            </View>
            <View style={[styles.card, localStyle.card]}>
              <View style={localStyle.content}>
                <View style={localStyle.editRow}>
                  <Text style={localStyle.label}>PICKUP ADDRESS</Text>
                  <TouchableOpacity
                    hitSlop={{ top: 15, bottom: 15, right: 15, left: 15 }}
                    onPress={() =>
                      this.props.navigation.navigate('ScheduleAddress')
                    }>
                    <Image
                      source={Images.editReviewIcon}
                      style={localStyle.editIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={localStyle.text}>
                  {address && address.first_name && address.last_name
                    ? address.first_name +
                    ' ' +
                    address.last_name +
                    '\n' +
                    address.address2 +
                    '\n' +
                    address.address1 +
                    '\n' +
                    (address.cross_street
                      ? address.cross_street + '\n'
                      : '') +
                    address.city +
                    ', ' +
                    address.state +
                    ' ' +
                    address.zip_code +
                    '\n' +
                    address.mobile +
                    '\nDoorman Building : ' +
                    address.doorman_building.toUpperCase()
                    : '---'}
                </Text>
              </View>
            </View>
            <View style={[styles.card, localStyle.card]}>
              <View style={localStyle.content}>
                <View style={localStyle.firstRowOfTwoRows}>
                  <View style={localStyle.editRow}>
                    <Text style={localStyle.label}>PROMO CODE</Text>
                    <TouchableOpacity
                      hitSlop={{ top: 15, bottom: 15, right: 15, left: 15 }}
                      onPress={() =>
                        this.props.navigation.navigate('ScheduleCard')
                      }>
                      <Image
                        source={Images.editReviewIcon}
                        style={localStyle.editIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={localStyle.text}>{promo_code}</Text>
                </View>
                <View style={localStyle.lastRowOfTwoRows}>
                  <Text style={localStyle.label}>TIP AMOUNT</Text>
                  <Text style={localStyle.text}>
                    {tip != '---' ? '$' + String(tip) : tip}
                  </Text>
                </View>
                <View style={localStyle.lastRowOfTwoRows}>
                  <Text style={localStyle.label}>PAYMENT TYPE</Text>
                  <Text style={localStyle.text}>Card ({cardNo})</Text>
                </View>
              </View>
            </View>
          </ScrollView>
          <BlueButton
            onPress={this.placeOrder}
            buttonText="PLACE ORDER"
            style={localStyle.confirmButton}
          />
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
  },
  scrollView: {
    flex: 1,
    marginBottom: Utils.scale(5),
  },
  topCard: {
    marginTop: Utils.scale(10),
  },
  content: {
    margin: Utils.scale(15),
  },
  twoCols: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  label: {
    color: '#657f8b',
    fontFamily: 'Poppins-Regular',
    letterSpacing: 1,
    fontSize: Utils.moderateScale(11),
    lineHeight: 22,
  },
  editIcon: {
    height: Utils.moderateScale(12),
    width: Utils.moderateScale(12),
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Poppins-Regular',
    lineHeight: 22,
    color: 'black',
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
  confirmButton: {
    marginBottom: Utils.scale(5),
    alignSelf: 'center',
    marginTop: Utils.scale(10),
  },
  thankyouImage: {
    height: Utils.moderateScale(150),
    width: Utils.moderateScale(150),
    alignSelf: 'center',
  },
});

const mapStateToProps = state => {
  return {
    appData: state.appData.appData,
    orderData: state.appData.scheduleOrderData,
    servicesAndPreferences:
      state.appData?.scheduleOrderData?.servicesAndPreferences,
    isOrderSchedule: state.appData.isOrderSchedule
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    //setPendingOrderList: data => dispatch(ActionCreators.setPendingOrderList(data)),
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
    toggleNewOrderAdded: data =>
      dispatch(ActionCreators.toggleNewOrderAdded(data)),
    clearScheduleOrderData: data =>
      dispatch(ActionCreators.clearScheduleOrderData(data)),
    setOderSchedule: data =>
      dispatch(ActionCreators.setOrderSchedule(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ReviewOrderScreen);
