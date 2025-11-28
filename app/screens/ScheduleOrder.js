import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  Platform,
  Dimensions,
  SafeAreaView,
} from 'react-native';
// import {SafeAreaView} from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';
import messaging from '@react-native-firebase/messaging';
import { connect } from 'react-redux';
import BlueButton from '../components/button/BlueButton';
import RadioButtonOrder from '../components/RadioButtonOrder';
import styles from './styles';
import { ActionCreators } from '../actions/index';
import Images from '../assets/images/index';
import LoaderView from '../components/LoaderView';
import * as Utils from '../lib/utils';
import notifee, { AndroidImportance } from '@notifee/react-native';
import moment from 'moment';
import RenderHTML from 'react-native-render-html';

var { height, width } = Dimensions.get('window');

class ScheduleOrderScreen extends Component {
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
      services: [],
      washAndFoldPreferences: [],
      dryCleaningPreferences: [],
      selectedWashAndFoldPreferences: [],
      selectedDryCleaningPreferences: [],
      activeService: -1,
      loadingServices: true,
      loadingWashAndFoldPreferences: false,
      loadingDryCleaningPreferences: false,
      selectedData: { services: '', preferences: [] },
      data: null,
      expressOrderButton: true,
      addressList: [],
      page: 0,
      reset: false,
      loading: true,
      refreshing: false,
      isWashAndFoldSelected: false,
      isDryCleaningSelected: false,
      minimum_order_charge: 10,
      isPopupshow: false
    };
    this.firstMount = false;
    this.serviceTapHandler = this.serviceTapHandler.bind(this);
    this.getPreferenceList = this.getPreferenceList.bind(this);
    this.continueButtonPress = this.continueButtonPress.bind(this);
    this.fetchServiceList = this.fetchServiceList.bind(this);
    this.navToExpressOrder = this.navToExpressOrder.bind(this);
    const didFocusSubscription = this.props.navigation.addListener(
      'didFocus',
      payload => {
        if (this.props.newOrderAdded.added) {
          this.resetState();
        }
        if (this.firstMount && this.state.services.length <= 0) {
          this.fetchServiceList();
        }
      },
    );
    this.navigation = this.props.navigation;
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('focus', () => {
      // if (!this.state.isPopupshow) {
      this.setState({ isPopupshow: true })
      setTimeout(() => {

        this.fetchPopuSetting()
      }, 400);
      // }
    });
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });

    if (this.state.services.length <= 0) {
      this.fetchServiceList().then(() => {
        this.firstMount = true;
      });
    }
    this.fetchProfile();

    notifee.onBackgroundEvent(async event => {
      console.log(event);
    });

    notifee.onForegroundEvent(async event => {
      if (this.props.appData) {
        if (event.detail.pressAction?.id === 'otgcDefault') {
          console.log(event.detail.notification?.data);
          let notification = event.detail.notification?.data;
          if (notification?.order_id) {
            this.props.navigation.navigate('MyOrders', {
              screen: 'OrderDetails',
              params: {
                orderId: Number(notification?.order_id),
              },
            });
          }
        }
      }
    });

    this.notificationListener = messaging().onNotificationOpenedApp(
      notificationOpen => {
        if (this.props.appData) {
          let notification = notificationOpen?.notification;
          let d = notificationOpen?.data;
          if (d?.order_id) {
            this.props.navigation.navigate('MyOrders', {
              screen: 'OrderDetails',
              params: {
                orderId: Number(d?.order_id),
              },
            });
          }
        }
      },
    );
  }

  fetchProfile() {
    Utils.makeApiRequest(
      `order-count/${this.props.appData.id}`,
      {},
      this.props.appData.token,
      'GET',
      'order',
    )
      .then(result => {
        if (result.status == true) {
          if (result.data.orderCount > 0) {
            this.setState({
              expressOrderButton: false,
            });
          }
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  navToExpressOrder() {
    this.props.navigation.navigate('ExpressOrder');
  }

  async resetState() {
    await this.setState({
      washAndFoldPreferences: [],
      dryCleaningPreferences: [],
      selectedWashAndFoldPreferences: [],
      selectedDryCleaningPreferences: [],
      activeService: -1,
      loadingServices: false,
      loadingWashAndFoldPreferences: false,
      loadingDryCleaningPreferences: false,
      expressOrderButton: false,
      selectedData: { services: '', preferences: [] },
    });
  }

  fetchServiceList() {
    return Utils.makeApiRequest(
      'pricing',
      {},
      this.props.appData.token,
      'GET',
      'category',
    )
      .then(result => {
        console.log(result);
        if (!result) {
          this.setState({ loadingServices: false });
          if (this.props.navigation.isFocused()) {
            Utils.displayAlert(
              '',
              'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
            );
          }
        } else if (result.status == true && result?.data?.services.length > 0) {
          this.props.setScheduleOrderDataServicesNameList(result.data.services);
          console.log('1. Result from services,', result.data);
          this.setState({
            services: result.data.services,
            loadingServices: false,
          });
        } else {
          this.setState({ loadingServices: false });
          if (this.props.navigation.isFocused()) {
            Utils.displayAlert('', result.msg || 'Invalid Request');
          }
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  getPreferenceList(id = null) {
    if (id === null) {
      return false;
    }

    Utils.makeApiRequest(
      `category/${id}`,
      {},
      this.props.appData.token,
      'GET',
      `preference`,
    )
      .then(result => {
        console.log('get-preferences ===>>> ', result);
        if (result.status === false) {
          if (id === 1) {
            this.setState({ loadingWashAndFoldPreferences: false });
          } else {
            this.setState({ loadingDryCleaningPreferences: false });
          }
          if (this.props.navigation.isFocused()) {
            //console.error(result);
            Utils.displayAlert(
              '',
              'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
            );
          }
        } else if (result.status == true && result.data?.length > 0) {
          this.setState({ minimum_order_charge: result.minimum_order_charge });
          if (id === 1) {
            this.setState(
              {
                washAndFoldPreferences: result.data,
                loadingWashAndFoldPreferences: false,
              },
              () => {
                this.props.setScheduleOrderDataPreferencesNameList({
                  1: this.state.washAndFoldPreferences,
                });
              },
            );
          } else {
            this.setState(
              {
                dryCleaningPreferences: result.data,
                loadingDryCleaningPreferences: false,
              },
              () => {
                this.props.setScheduleOrderDataPreferencesNameList({
                  2: this.state.dryCleaningPreferences,
                });
              },
            );
          }
        } else {
          if (id === 1) {
            this.setState({ loadingWashAndFoldPreferences: false });
          } else {
            this.setState({ loadingDryCleaningPreferences: false });
          }
          // if (this.props.navigation.isFocused()) {
          //     Utils.displayAlert('', result.msg || 'Invalid Request');
          // }
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  getServiceName(id = null) {
    if (id) {
      for (let i = 0; i < this.state.services.length; i++) {
        if (this.state.services[i].id == id) {
          return this.state.services[i].name;
        }
      }
    }
    return '';
  }

  serviceTapHandler(id = null, service) {
    if (
      this.state.loadingWashAndFoldPreferences ||
      this.state.loadingDryCleaningPreferences
    ) {
      return;
    }

    let firstServiceName = this.getServiceName(1);
    let secondServiceName = this.getServiceName(2);

    if (id === 1) {
      let activeService = { '-1': 1, 0: 2, 1: -1, 2: 0 }[
        String(this.state.activeService)
      ];
      let exists =
        this.state.selectedData.services.indexOf('Wash & Fold') == -1
          ? false
          : true;
      if (exists) {
        console.log(activeService);
        this.state.selectedData.services =
          this.state.selectedData.services == firstServiceName
            ? ''
            : secondServiceName;
        this.setState({
          activeService: activeService,
          loadingWashAndFoldPreferences: false,
          washAndFoldPreferences: [],
          selectedWashAndFoldPreferences: [],
          selectedData: this.state.selectedData,
        });
        console.log(this.state.selectedData);
      } else {
        this.state.selectedData.services =
          this.state.selectedData.services == ''
            ? firstServiceName
            : firstServiceName + ',' + this.state.selectedData.services;
        this.setState({
          activeService: activeService,
          loadingWashAndFoldPreferences: true,
          washAndFoldPreferences: [],
          selectedWashAndFoldPreferences: [],
          selectedData: this.state.selectedData,
        });
        this.getPreferenceList(1);
      }
    }
    if (id === 2) {
      let exists =
        this.state.selectedData.services.indexOf('Dry Cleaning') == -1
          ? false
          : true;
      let activeService = { '-1': 2, 0: 1, 1: 0, 2: -1 }[
        String(this.state.activeService)
      ];
      if (exists) {
        this.state.selectedData.services =
          this.state.selectedData.services == secondServiceName
            ? ''
            : firstServiceName;
        this.setState({
          activeService: activeService,
          loadingDryCleaningPreferences: false,
          dryCleaningPreferences: [],
          selectedDryCleaningPreferences: [],
          selectedData: this.state.selectedData,
        });
      } else {
        this.state.selectedData.services =
          this.state.selectedData.services == ''
            ? secondServiceName
            : this.state.selectedData.services + ',' + secondServiceName;
        this.setState({
          activeService: activeService,
          loadingDryCleaningPreferences: true,
          dryCleaningPreferences: [],
          selectedDryCleaningPreferences: [],
          selectedData: this.state.selectedData,
        });
        this.getPreferenceList(2);
      }
    }
  }

  renderServices() {
    if (!this.state.loadingServices) {
      if (this.state.services.length > 0) {
        return this.state.services.map((service, index) => {
          let serviceIcon = '';
          switch (service.id) {
            case 1:
              serviceIcon =
                this.state.activeService == 1 || this.state.activeService == 0
                  ? Images.scheduleWashAndFoldOnIcon
                  : Images.scheduleWashAndFoldOffIcon;
              break;
            case 2:
              serviceIcon =
                this.state.activeService == 2 || this.state.activeService == 0
                  ? Images.scheduleDryCleanOnIcon
                  : Images.scheduleDryCleanOffIcon;
              break;
          }

          let activeServiceStyle = null;
          let active = false;
          if (
            this.state.activeService == service.id ||
            this.state.activeService == 0
          ) {
            activeServiceStyle = localStyle.activeService;
            active = true;
          }
          return (
            <View key={service.id} style={localStyle.placeholder}>
              <TouchableOpacity
                style={[
                  styles.card,
                  localStyle.card,
                  index == 0 && localStyle.servicesGap,
                  activeServiceStyle,
                ]}
                onPress={() => this.serviceTapHandler(service.id, service)}>
                {active ? (
                  <Image
                    style={{
                      height: Utils.moderateScale(20),
                      width: Utils.moderateScale(20),
                      position: 'absolute',
                      alignSelf: 'flex-end',
                      top: 2,
                      right: 2,
                      zIndex: 2,
                    }}
                    source={Images.selectIcon}
                    resizeMode="contain"
                    resizesMethod="resize"
                  />
                ) : null}
                <View style={localStyle.imageContainer}>
                  <View style={localStyle.placeholder} />
                  <Image
                    source={serviceIcon}
                    style={{
                      width: width / 2 - Utils.moderateScale(50, 0.5),
                      height: Utils.moderateVerticalScale(90),
                    }}
                    resizeMode="stretch"
                  />
                  <View style={localStyle.placeholder} />
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={localStyle.serviceText}>{service.name}</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        });
      } else {
        return (
          <View style={[styles.card, localStyle.card]}>
            <Text style={localStyle.noServicesAvailText}>
              Sorry! Our app is being worked on at the moment. Please use our
              website{' '}
              <Text style={{ color: '#171151', fontWeight: 'bold' }}>
                OnTheGoCleaners.com
              </Text>
              .
            </Text>
          </View>
        );
      }
    } else {
      return (
        <View style={[styles.card, localStyle.card, localStyle.loader]}>
          <LoaderView loading={this.state.loadingServices} />
        </View>
      );
    }
  }

  updateSelectedPreference(id, value, category_id) {
    let list =
      category_id == 1
        ? this.state.washAndFoldPreferences
        : this.state.dryCleaningPreferences;
    let data = null;
    for (let i = 0; i < list.length; i++) {
      if (list[i].id == id) {
        let selected_option =
          list[i].options[0]?.id == value
            ? list[i]?.options[0]?.name
            : list[i]?.options[1]?.name;
        data = {
          preference_id: id,
          category_id: category_id,
          preference_amount: list[i].price,
          preference_name: list[i].name,
          option1: list[i]?.options[0]?.name,
          option2: list[i]?.options[1]?.name,
          selected_option: selected_option,
        };
      }
    }

    let preferenceVarName = 'selectedWashAndFoldPreferences';
    if (category_id == 2) {
      preferenceVarName = 'selectedDryCleaningPreferences';
    }

    if (data) {
      let found = false;
      for (let i = 0; i < this.state[preferenceVarName].length; i++) {
        if (this.state[preferenceVarName][i].preference_id == id) {
          this.state[preferenceVarName][i] = data;
          found = true;
          break;
        }
      }
      if (!found) {
        this.state[preferenceVarName].push(data);
      }
      this.setState({ selectedData: this.state.selectedData });
    }
  }

  getPreferenceDetails(id = null) {
    let preferenceListVarName = '',
      preferenceLoadingVarName = '';
    if (id === 1) {
      preferenceListVarName = 'washAndFoldPreferences';
      preferenceLoadingVarName = 'loadingWashAndFoldPreferences';
    } else if (id === 2) {
      preferenceListVarName = 'dryCleaningPreferences';
      preferenceLoadingVarName = 'loadingDryCleaningPreferences';
    }

    if (!this.state[preferenceLoadingVarName]) {
      if (this.state[preferenceListVarName].length > 0) {
        return this.state[preferenceListVarName]
          .filter(preference => preference.status === 'active')
          .map((preference, index) => {
            if (preference?.id != 14) {
              if (preference.show_price == 'yes') {
                return (
                  <View
                    key={preference.id}
                    style={[styles.card, localStyle.card]}>
                    <View style={localStyle.preference}>
                      <Text style={localStyle.text}>
                        {preference?.name}{' '}
                        <Text style={localStyle.preferenceAmount}>
                          {preference.price !== 0 && (
                            <>(${parseFloat(preference.price).toFixed(2)})</>
                          )}
                        </Text>
                      </Text>
                      <RadioButtonOrder
                        data={[
                          {
                            label: preference?.options?.[1]?.name,
                            value: preference?.options?.[1]?.id,
                          },
                          {
                            label: preference?.options?.[0]?.name,
                            value: preference?.options?.[0]?.id,
                          },
                        ]}
                        default={
                          preference?.options?.[0]?.default_option === 'yes'
                            ? 1
                            : 0
                        }
                        onPress={value =>
                          this.updateSelectedPreference(
                            preference.id,
                            value,
                            preference.category_id,
                          )
                        }
                      />
                    </View>
                  </View>
                );
              } else {
                return (
                  <View
                    key={preference.id}
                    style={[styles.card, localStyle.card]}>
                    <View style={localStyle.preference}>
                      <Text style={localStyle.text}>{preference.name}</Text>
                      <RadioButtonOrder
                        data={[
                          {
                            label: preference?.options?.[1].name,
                            value: preference?.options?.[1].id,
                          },
                          {
                            label: preference?.options?.[0].name,
                            value: preference?.options?.[0].id,
                          },
                        ]}
                        default={
                          preference?.options?.[0].default_option === 'yes'
                            ? 1
                            : 0
                        }
                        onPress={value =>
                          this.updateSelectedPreference(
                            preference.id,
                            value,
                            preference.category_id,
                          )
                        }
                      />
                    </View>
                  </View>
                );
              }
            }
          });
      } else {
        return (
          <View>
            <View style={[styles.card, localStyle.card]}>
              <Text style={localStyle.noServicesAvailText}>
                Sorry! No Preferences available right now!!!
              </Text>
            </View>
          </View>
        );
      }
    } else {
      return (
        <View style={[styles.card, localStyle.card, localStyle.loader]}>
          <LoaderView loading={this.state[preferenceLoadingVarName]} />
        </View>
      );
    }
  }

  renderPreferences(id = null) {
    if (this.state.activeService === 0) {
      return (
        <View style={localStyle.allPreferences}>
          <Text style={[localStyle.text, localStyle.heading]}>
            WASH & FOLD PREFERENCES
          </Text>
          {this.getPreferenceDetails(1)}
          <Text
            style={[
              localStyle.text,
              localStyle.heading,
              { marginTop: Utils.moderateScale(23) },
            ]}>
            DRY CLEANING PREFERENCES
          </Text>
          {this.getPreferenceDetails(2)}
        </View>
      );
    }
    if (this.state.activeService === 1) {
      return (
        <View style={localStyle.allPreferences}>
          <Text style={[localStyle.text, localStyle.heading]}>
            WASH & FOLD PREFERENCES
          </Text>
          {this.getPreferenceDetails(1)}
        </View>
      );
    }
    if (this.state.activeService === 2) {
      return (
        <View style={localStyle.allPreferences}>
          <Text style={[localStyle.text, localStyle.heading]}>
            DRY CLEANING PREFERENCES
          </Text>
          {this.getPreferenceDetails(2)}
        </View>
      );
    }
  }

  continueButtonPress() {
    if (
      this.state.loadingServices ||
      this.state.loadingWashAndFoldPreferences ||
      this.state.loadingDryCleaningPreferences
    ) {
      Utils.displayAlert('', 'Please wait while we are loading data');
      return;
    }
    if (this.state.services.length <= 0) {
      Utils.displayAlert(
        '',
        'Sorry! There are no services available right now',
      );
    } else if (this.state.selectedData.services == '') {
      Utils.displayAlert('', 'Please select service(s) !');
    } else {
      this.props.setScheduleOrderDataServicesAndPreferences({
        services: this.state.selectedData.services,
        preferences: [
          ...this.state.selectedWashAndFoldPreferences,
          ...this.state.selectedDryCleaningPreferences,
        ],
      });
      this.props.navigation.navigate('ScheduleOrderInstructions', {
        minimum_order_charge: this.state.minimum_order_charge,
      });
    }
  }
  isPopupActive(popup) {
    if (!popup?.popup_display_start || !popup?.popup_display_end) return false;
  
    const displayStart = new Date(popup.popup_display_start);
    const displayEnd = new Date(popup.popup_display_end);
    displayEnd.setDate(displayEnd.getDate() + 1);
  
    const currentDate = new Date();
  
    return (
      currentDate >= displayStart &&
      currentDate <= displayEnd &&
      popup.enabled === 'yes' &&
      (popup.popup_options === 'only_app' || popup.popup_options === 'both')
    );
  }

  fetchPopuSetting(token) {
    Utils.makeApiRequest(`notify?user_id=${this.props.appData.id}`, {}, token, 'GET', 'auth', true)
      .then(result => {
        if (result?.status === true && this.isPopupActive(result?.data)) {
          Utils.displayAlert(
            'Attention',
            <RenderHTML
              contentWidth={100}
              baseStyle={{ width: Utils.width * 0.7 }}
              source={{ html: result?.data?.popup_content }}
            />,
            '',
            null,
            null,
            true,
          );
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
            showsVerticalScrollIndicator={false}
            horizontal={false}
            style={localStyle.scrollView}>
            <BlueButton
              disabled={this.state.expressOrderButton}
              onPress={this.navToExpressOrder}
              buttonText="EXPRESS CHECKOUT"
              style={localStyle.expressOrderButton}
            />
            <Text style={localStyle.orText}>OR</Text>
            <Text style={localStyle.orText}>START NEW ORDER HERE</Text>

            <View style={localStyle.selectService}>
              <Text style={[localStyle.text, localStyle.heading]}>
                SELECT SERVICE(S)
              </Text>
              <View style={localStyle.services}>{this.renderServices()}</View>
              <Text
                style={{
                  alignSelf: 'center',
                  textAlign: 'center',
                  marginTop: 10,
                  color: 'black',
                }}>
                {this.state.activeService == 0 ? '*PLEASE BAG SEPARATELY' : ''}
              </Text>
            </View>
            {this.renderPreferences()}
          </ScrollView>
          <BlueButton
            onPress={this.continueButtonPress}
            // onPress={() => alert('Working now')}
            buttonText="CONTINUE"
            style={localStyle.continueButton}
          />
        </LinearGradient>
      </SafeAreaView>
    );
  }
}

const localStyle = StyleSheet.create({
  placeholder: {
    flex: 1,
  },
  servicesGap: {
    marginRight: Utils.moderateScale(5),
  },
  imageContainer: {
    flex: 2,
    flexDirection: 'row',
  },
  activeService: {
    borderWidth: 2,
    borderColor: '#171151',
    backgroundColor: 'rgba(0, 255, 0, 0.25)',
  },
  preferenceAmount: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    letterSpacing: 1,
    fontSize: Utils.moderateScale(13),
  },
  card: {
    flex: 1,
    marginTop: Utils.scale(8),
    paddingVertical: Utils.moderateScale(15),
    paddingHorizontal: Utils.moderateScale(5),
    ...Platform.select({
      android: {
        marginTop: Utils.scale(7),
        marginBottom: Utils.scale(2),
      },
    }),
  },
  expressOrderButton: {
    marginTop: Utils.scale(10),
    alignSelf: 'center',
  },
  continueButton: {
    marginBottom: Utils.scale(5),
    alignSelf: 'center',
    marginTop: Utils.scale(5),
  },
  scrollView: {
    flex: 1,
    marginBottom: Utils.scale(5),
  },
  selectService: {
    marginLeft: Utils.scale(15),
    marginRight: Utils.scale(15),
  },
  services: {
    flexDirection: 'row',
  },
  serviceText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    marginTop: Utils.scale(10),
    marginBottom: Utils.scale(5),
    marginRight: Utils.scale(5),
    marginLeft: Utils.scale(5),
    textAlign: 'center',
    fontSize: Utils.moderateScale(12),
  },
  allPreferences: {
    marginTop: Utils.moderateScale(15),
    marginLeft: Utils.scale(15),
    marginRight: Utils.scale(15),
  },
  text: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    color: 'black',
    marginRight: Utils.moderateScale(7),
    fontSize: Utils.moderateScale(13),
  },
  orText: {
    marginTop: Utils.moderateScale(15),
    fontFamily: 'NexaRegular',
    color: 'black',
    fontSize: Utils.moderateScale(15),
    textAlign: 'center',
    letterSpacing: 1,
  },
  heading: {
    letterSpacing: 1,
    marginTop: Utils.moderateScale(15),
    fontSize: Utils.moderateScale(14),
    marginBottom: Utils.moderateScale(8),
  },
  preference: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noServicesAvailText: {
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(13),
  },
  loader: {
    height: Utils.moderateVerticalScale(125),
  },
});

const mapStateToProps = state => {
  return {
    appData: state.appData.appData,
    servicesAndPreferences:
      state.appData.scheduleOrderData.servicesAndPreferences,
    servicesNameList: state.appData.scheduleOrderData.servicesNameList,
    preferencesNameList: state.appData.scheduleOrderData.preferencesNameList,
    newOrderAdded: state.appData.newOrderAdded,
    signUpData: state.appData.signUpData
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setScheduleOrderDataServicesAndPreferences: data =>
      dispatch(ActionCreators.setScheduleOrderDataServicesAndPreferences(data)),
    setScheduleOrderDataServicesNameList: data =>
      dispatch(ActionCreators.setScheduleOrderDataServicesNameList(data)),
    setScheduleOrderDataPreferencesNameList: data =>
      dispatch(ActionCreators.setScheduleOrderDataPreferencesNameList(data)),
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ScheduleOrderScreen);
