import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ImageBackground,
  Text,
  Image,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {connect} from 'react-redux';
import {ActionCreators} from '../actions/index';
import ActionButton from 'react-native-action-button';
import LoaderView from '../components/LoaderView';
import Images from '../assets/images/index';
import styles from './styles';
import * as Utils from '../lib/utils';

import RNActionButton from 'react-native-action-button';
import { Animated } from 'react-native';

import AnimatedButtonPatch from '../patch/AnimatedButton';
import BlueButton from '../components/button/BlueButton';
import messaging from '@react-native-firebase/messaging';
import Rate, { AndroidMarket } from 'react-native-rate';
import * as StoreReview from 'react-native-store-review';
import RateModal from 'react-native-store-rating'
import routes from '../config/routes';


const IOS_APP_ID = 'com.onTheGoCleaners.app'
const ANDROID_APP_ID = 'com.otgc.onthegocleaners'
const APP_STORE_LINK = `itms-apps://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`;
const PLAY_STORE_LINK = `market://details?id=${ANDROID_APP_ID}`;

export const LINK_APP = {
  APP_STORE: "https://apps.apple.com/us/app/on-the-go-cleaners/id1436606731",
  PLAY_STORE: "https://play.google.com/store/apps/details?id=com.otgc.onthegocleaners",
};

const STORE_LINK = Platform.select({
  ios: APP_STORE_LINK,
  android: PLAY_STORE_LINK,
});

class ProfileScreen extends Component {
  static navigationOptions = {
    headerStyle: {
      borderBottomWidth: 0,
    },
    headerTransparent: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      loading: true,
      isModalOpen: false
    };
    this.firstMount = false;
    this.fetchProfile = this.fetchProfile.bind(this);
    const didFocusSubscription = this.props.navigation.addListener(
      'didFocus',
      payload => {
        if (this.firstMount) {
          this.fetchProfile();
          // StoreReview.requestReview();
        }
      },
    );
  }

  getOrderCount = async userId => {
    return Utils.makeApiRequest(
      `order-count/${userId}`,
      {},
      this.props.appData.token,
      'GET',
      'order',
    )
      .then(result => {
        if (result.status === true) {
          return result.data.orderCount;
        } else {
          // Error getting order count
          Utils.displayAlert(
            'Opps!',
            'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
          );
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  };

  fetchProfile() {
    return Utils.makeApiRequest(
      'my-profile',
      {},
      this.props.appData.token,
      'GET',
    )
      .then(async result => {
        console.log(result, '================================myProfile');
        if (result.status === false) {
          this.setState({ loading: false });
          if (this.props.navigation.isFocused()) {
            Utils.displayAlert(
              '',
              'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
            );
          }
        } else if (result.status === true) {
          let orderCount = await this.getOrderCount(result.data.id);
          this.setState({
            data: {
              profile: { ...result.data },
              orders: { order_count: orderCount },
            },
            loading: false,
          });
        } else {
          this.setState({ loading: false });
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

  componentDidMount() {
    this.fetchProfile().then(() => {
      this.firstMount = true;
    });
    this.props.navigation.addListener('focus', () => {
      this.fetchProfile();
    });
  }

  componentWillUnmount() {
    this.firstMount = false;
  }

  rateTheApp() {
    // console.log('first')
    // try {
    //   StoreReview.requestReview()

    // } catch (e) {
    //   console.log(e)
    // }

    this.setState({ isModalOpen: true })
    // const options = {
    //   AppleAppID: "1436606731",
    //   GooglePackageName: "com.otgc.onthegocleaners",
    //   // AmazonPackageName: "com.mywebsite.myapp",
    //   // OtherAndroidURL: "http://www.randomappstore.com/app/47172391",
    //   preferredAndroidMarket: AndroidMarket.Google,
    //   preferInApp: false,
    //   openAppStoreIfInAppFails: true,
    //   // fallbackPlatformURL: "http://www.mywebsite.com/myapp.html",
    // }
    // Rate.rate(options, (success, errorMessage) => {
    //   if (success) {
    //     // this technically only tells us if the user successfully went to the Review Page. Whether they actually did anything, we do not know.
    //     this.setState({ rated: true })
    //   }
    //   if (errorMessage) {
    //     // errorMessage comes from the native code. Useful for debugging, but probably not for users to view
    //     console.error(`Example page Rate.rate() error: ${errorMessage}`)
    //   }
    // })
  }


  render() {
    let { profile, orders /*, addressData*/ } = this.state.data
      ? this.state.data
      : { profile: null, orders: null /*, addressData: null*/ };

    let name =
      profile && profile.first_name && profile.last_name
        ? profile.first_name.charAt(0).toUpperCase() +
        profile.first_name.substr(1).toLowerCase() +
        ' ' +
        profile.last_name.charAt(0).toUpperCase() +
        profile.last_name.substr(1).toLowerCase()
        : '---';
    const rateModalStyles = StyleSheet.create({
      button: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textTransform: 'upparcase'
      },
    })
    return (
      <View style={styles.container}>
        {this.state.loading && (
          <View style={localStyle.loaderContainer}>
            <LoaderView loading={this.state.loading} />
          </View>
        )}
        {
          //<ImageBackground source={Images.profileImage} style={ styles.imageBackground }>
        }
        <LinearGradient
          colors={['#3b2eb6', '#21e381']}
          style={styles.container}>
          <ScrollView>
            <View style={localStyle.container}>
              <View style={localStyle.half}>
                <View style={localStyle.nameContainer}>
                  <Text style={localStyle.name}>{name}</Text>
                </View>
                <View style={localStyle.ordersAndFabContainer}>
                  <View style={localStyle.container}>
                    <Text style={localStyle.ordersLabel}>ORDERS</Text>
                    <Text style={localStyle.ordersValue}>
                      {orders && orders.order_count ? orders.order_count : '0'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={localStyle.half}>
                <View style={localStyle.content}>
                  <Text style={localStyle.label}>EMAIL</Text>
                  <Text style={localStyle.text}>
                    {profile && profile.email ? profile.email : '---'}
                  </Text>
                </View>
                <View style={localStyle.content}>
                  <Text style={localStyle.label}>MOBILE</Text>
                  <Text style={localStyle.text}>
                    {profile && profile.mobile ? profile.mobile : '---'}
                  </Text>
                </View>
                {/* <View style={localStyle.content}>
                  <Text style={localStyle.label}>
                    SUBSCRIBED TO EMAIL NOTIFICATIONS
                  </Text>
                  <Text style={localStyle.text}>
                    {profile && profile.email_notifications
                      ? profile.email_notifications.charAt(0).toUpperCase() +
                        profile.email_notifications.substr(1).toLowerCase()
                      : 'No'}
                  </Text>
                </View> */}
                {/* <View style={localStyle.content}>
                  <Text style={localStyle.label}>
                    SUBSCRIBED TO PUSH NOTIFICATIONS
                  </Text>
                  <Text style={localStyle.text}>
                    {profile && profile.push_notifications
                      ? profile.push_notifications.charAt(0).toUpperCase() +
                        profile.push_notifications.substr(1).toLowerCase()
                      : 'No'}
                  </Text>
                </View> */}
              </View>
              <View
                style={{
                  marginHorizontal: 40,
                  marginTop: Utils.height * 0.05,
                  marginBottom: 40,
                }}>
                <Pressable
                  android_ripple={{ color: 'rgba(255,255,255,.2)' }}
                  onPress={() => {
                    this.props.navigation.navigate('EditProfile');
                  }}
                  style={{
                    backgroundColor: 'rgba(255,255,255,.1)',
                    borderRadius: 8,
                    paddingLeft: 20,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 10,
                      paddingVertical: Utils.height * 0.015,
                      alignItems: 'center',
                    }}>
                    <Image
                      source={Images.editIconProfile}
                      style={localStyle.actionButtonItemIcon}
                    />
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}>
                      PROFILE SETTINGS
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  android_ripple={{ color: 'rgba(255,255,255,.2)' }}
                  onPress={() => {
                    this.props.navigation.navigate('ChangePassword');
                  }}
                  style={{
                    backgroundColor: 'rgba(255,255,255,.1)',
                    borderRadius: 8,
                    paddingLeft: 20,
                    marginTop: Utils.height * 0.014,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 10,
                      paddingVertical: Utils.height * 0.015,
                      alignItems: 'center',
                    }}>
                    <Image
                      source={Images.changePasswordIconProfile}
                      style={localStyle.actionButtonItemIcon}
                    />
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}>
                      Change Password
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  android_ripple={{ color: 'rgba(255,255,255,.2)' }}
                  onPress={() => {
                    this.props.navigation.navigate('MyCards');
                  }}
                  style={{
                    backgroundColor: 'rgba(255,255,255,.1)',
                    borderRadius: 8,
                    paddingLeft: 20,
                    marginTop: Utils.height * 0.014,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 10,
                      paddingVertical: Utils.height * 0.015,
                      alignItems: 'center',
                    }}>
                    <Image
                      source={Images.cardsIconProfile}
                      style={localStyle.actionButtonItemIcon}
                    />
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}>
                      My Cards
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  android_ripple={{ color: 'rgba(255,255,255,.2)' }}
                  onPress={() => {
                    this.props.navigation.navigate('MyAddressesD');
                  }}
                  style={{
                    backgroundColor: 'rgba(255,255,255,.1)',
                    borderRadius: 8,
                    paddingLeft: 20,
                    marginTop: Utils.height * 0.014,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 10,
                      paddingVertical: Utils.height * 0.015,
                      alignItems: 'center',
                    }}>
                    <Image
                      source={Images.addressIconProfile}
                      style={localStyle.actionButtonItemIcon}
                    />
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}>
                      My Addresses
                    </Text>
                  </View>
                </Pressable>
                {/* <Pressable style={{
                  backgroundColor: 'rgba(255,255,255,.1)',
                  borderRadius: 8,
                  paddingLeft: 20,
                  marginTop: Utils.height * 0.014,
                }}
                  onPress={() => this.rateTheApp()}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 10,
                      paddingVertical: Utils.height * 0.015,
                      alignItems: 'center',
                    }}>
                    <Image
                      source={Images.logoutIconProfile}
                      style={localStyle.actionButtonItemIcon}
                    />
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}>
                      Rate the app
                    </Text>
                  </View>
                </Pressable> */}

                <Pressable
                  android_ripple={{ color: 'rgba(255,255,255,.2)' }}
                  onPress={() => {
                    Utils.displayAlert(
                      'Are you sure you want to logout?',
                      '',
                      'Yes',
                      null,
                      async () => {

                        try {
                          this.props.navigation.setParams({
                            openDrawer: this.props.setDrawerOpenState,
                          });
                          console.log('first');
                          Utils.makeApiRequest(
                            'delete-device-token',
                            {
                              device_token: this.props.appData.deviceToken,
                            },
                            this.props.appData.token,
                          );
                        } catch (error) {
                          console.log(error);
                          throw new Error(error);
                        }
                        AsyncStorage.clear();
                        this.props.clearScheduleOrderData();
                        this.props.logout()
                        setTimeout(async () => {
                          this.props.navigation.reset({ index: 0, routes: [{ name: 'LoggedOutNav' }] });
                          await messaging().deleteToken()
                        }, 1000);
                      },
                      true,
                      true,
                    );
                  }}
                  style={{
                    backgroundColor: 'rgba(255,255,255,.1)',
                    borderRadius: 8,
                    paddingLeft: 20,
                    marginTop: Utils.height * 0.014,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 10,
                      paddingVertical: Utils.height * 0.015,
                      alignItems: 'center',
                    }}>
                    <Image
                      source={Images.logoutIconProfile}
                      style={localStyle.actionButtonItemIcon}
                    />
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}>
                      Logout
                    </Text>
                  </View>
                </Pressable>
              </View>
              {/* <ActionButton
              size={Utils.moderateScale(35, 0.5)}
              buttonColor="#171151"
              verticalOrientation="up"
              position="right"
              status
              renderIcon={active =>
                active ? (
                  <Image
                    source={require('../assets/images/img/close-icon.png')}
                    style={{maxHeight: 10, maxWidth: 10}}
                  />
                ) : (
                  <Image
                    source={require('../assets/images/img/edit-icon.png')}
                    style={{maxHeight: 15, maxWidth: 15}}
                  />
                )
              }
              offsetX={Utils.moderateScale(30, 0.5)}
              backdrop={<View style={localStyle.backdrop}></View>}
              buttonTextStyle={localStyle.actionButtonTextStyle}>
              <ActionButton.Item
                title="CHANGE PASSWORD"
                buttonColor="#42d966"
                textStyle={localStyle.actionButtonItemTextStyle}
                textContainerStyle={[
                  localStyle.actionButtonItemTextContainerStyle,
                  localStyle.changePasswordFabStyle,
                ]}
                onPress={() =>
                  this.props.navigation.navigate('ChangePassword')
                }>
                <Image
                  source={Images.changePasswordIconProfile}
                  style={localStyle.actionButtonItemIcon}
                />
              </ActionButton.Item>
              <ActionButton.Item
                title="MY CARDS"
                buttonColor="#42d966"
                textStyle={localStyle.actionButtonItemTextStyle}
                textContainerStyle={
                  localStyle.actionButtonItemTextContainerStyle
                }
                onPress={() => this.props.navigation.navigate('MyCards')}>
                <Image
                  source={Images.cardsIconProfile}
                  style={localStyle.actionButtonItemIcon}
                />
              </ActionButton.Item>
              <ActionButton.Item
                title="MY ADDRESSES"
                buttonColor="#42d966"
                textStyle={localStyle.actionButtonItemTextStyle}
                textContainerStyle={
                  localStyle.actionButtonItemTextContainerStyle
                }
                onPress={() => this.props.navigation.navigate('MyAddressesD')}>
                <Image
                  source={Images.addressIconProfile}
                  style={localStyle.actionButtonItemIcon}
                />
              </ActionButton.Item>
              <ActionButton.Item
                title="PROFILE SETTINGS"
                buttonColor="#42d966"
                textStyle={localStyle.actionButtonItemTextStyle}
                textContainerStyle={
                  localStyle.actionButtonItemTextContainerStyle
                }
                onPress={() => this.props.navigation.navigate('EditProfile')}>
                <Image
                  source={Images.editIconProfile}
                  style={localStyle.actionButtonItemIcon}
                />
              </ActionButton.Item>
              <ActionButton.Item
                title="LOGOUT"
                buttonColor="#42d966"
                textStyle={localStyle.actionButtonItemTextStyle}
                textContainerStyle={
                  localStyle.actionButtonItemTextContainerStyle
                }
                onPress={() => {
                  Utils.displayAlert(
                    '',
                    'Are you sure you want to logout?',
                    'Yes',
                    null,
                    () => {
                      try {
                        Utils.makeApiRequest(
                          'delete-device-token',
                          {
                            device_token: this.props.appData.deviceToken,
                          },
                          this.props.appData.token,
                        );
                      } catch (error) {
                        console.log(error);
                      }
                      AsyncStorage.clear();
                      this.props.clearScheduleOrderData();
                      setTimeout(() => {
                        this.props.navigation.navigate('LoggedOutNav');
                      }, 1000);
                    },
                    true,
                    true,
                  );
                }}>
                <Image
                  source={Images.logoutIconProfile}
                  style={localStyle.actionButtonItemIcon}
                />
              </ActionButton.Item>
            </ActionButton> */}
            </View>
          </ScrollView>
          <RateModal
            modalTitle="Are you enjoying this app?"
            rateBtnText={'Rate'}
            cancelBtnText={'Cancel'}
            totalStarCount={5}
            defaultStars={0}
            isVisible={true}
            sendBtnText={'Send'}
            commentPlaceholderText={'Placeholder text'}
            emptyCommentErrorMessage={'Empty comment error message'}
            iTunesStoreUrl={`itms-apps://itunes.apple.com/app/${IOS_APP_ID}`}
            playStoreUrl={`market://details?id=${ANDROID_APP_ID}`}
            isModalOpen={this.state.isModalOpen}
            // storeRedirectThreshold={3}
            style={{
              paddingHorizontal: 30,
            }}
            onSendReview={(e) => console.log(e)}
            onStarSelected={(e) => {
              console.log('change rating', e);
            }}
            onClosed={() => {
              console.log('pressed cancel button...')
              this.setState({
                isModalOpen: false
              })
            }}
            sendContactUsForm={(state) => {
              // alert(JSON.stringify(state));
              this.setState({
                isModalOpen: false
              })
            }}
            styles={rateModalStyles}
            ratingProps={{
              selectedColor: 'red',
            }}
            modalProps={{
              animationType: 'fade',
            }}
          />
        </LinearGradient>
        {
          //</ImageBackground>
        }
      </View>
    );
  }
}

const localStyle = StyleSheet.create({
  backdrop: {
    height: Utils.height,
    width: Utils.width,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    position: 'absolute',
  },
  container: {
    flex: 1,
    marginTop: Utils.height * 0.08,
  },
  loaderContainer: {
    position: 'absolute',
    height: Utils.height,
    width: Utils.width,
    backgroundColor: 'rgba(150, 200, 200, 0.4)',
    zIndex: 100,
  },
  half: {
    flex: 0.4,
    marginLeft: Utils.scale(40, 0.5),
  },
  nameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'Roboto-BoldCondensed',
    ...Platform.select({
      android: {
        fontWeight: '500',
      },
    }),
    fontSize: Utils.moderateScale(22, 0.5),
    color: 'white',
    letterSpacing: 1,
  },
  ordersLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(13),
    color: 'white',
    letterSpacing: 1,
    lineHeight: 28,
  },
  ordersValue: {
    fontFamily: 'Roboto-BoldCondensed',
    ...Platform.select({
      android: {
        fontWeight: '500',
      },
    }),
    fontSize: Utils.moderateScale(20),
    color: 'white',
    letterSpacing: 1,
  },
  ordersAndFabContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(12),
    letterSpacing: 1,
    color: 'white', //'#657b85',
  },
  text: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(14),
    marginRight: Utils.moderateScale(80, 0.5),
  },
  actionButtonTextStyle: {
    fontSize: Utils.moderateScale(18, 0.5),
    paddingTop:
      Platform.OS == 'android'
        ? Utils.moderateScale(8, 0.5)
        : Utils.moderateScale(5, 0.5),
  },
  actionButtonItemTextStyle: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(12),
  },
  actionButtonItemTextContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    height: Utils.moderateScale(20),
  },
  changePasswordFabStyle: {
    ...Platform.select({
      ios: {
        width: Utils.moderateScale(140),
      },
    }),
  },
  actionButtonItemIcon: {
    height: Utils.moderateScale(20, 0.5),
    width: Utils.moderateScale(20, 0.5),
  },
  content: {
    marginTop: Utils.moderateScale(25, 0.5),
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
    clearScheduleOrderData: data =>
      dispatch(ActionCreators.clearScheduleOrderData(data)),
    logout: data =>
      dispatch(ActionCreators.logout()),
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileScreen);
