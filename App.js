import React, { Component } from 'react';
import {
  View,
  StatusBar,
  Text,
  StyleSheet,
  Platform,
  LogBox,
  Modal,
  Linking,
  TouchableOpacity,
  Alert,

} from 'react-native';
import moment from 'moment';
import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import messaging from '@react-native-firebase/messaging';
import { Provider, connect } from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import RootStackCreator from './app/config/routes';
import appReducer from './app/reducers/index';
import { ActionCreators } from './app/actions/index';
import * as Utils from './app/lib/utils';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { ModalPortal } from 'react-native-modals';
import * as Sentry from '@sentry/react-native';
import RenderHtml from 'react-native-render-html';

import { setCustomText } from 'react-native-global-props';
import { SignUpContext, SignUpContextProvider } from './app/context/SignUpContext';
import persistStore from 'redux-persist/es/persistStore';
import { PersistGate } from 'redux-persist/integration/react';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { LINK_APP } from './app/screens/Profile';
import DeviceInfo from "react-native-device-info";
import { compare } from "compare-versions";

Sentry.init({
  dsn: 'https://32588deff9c8ed829e554091367cc157@o4505826987147264.ingest.sentry.io/4505878617391104',
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
});

const customTextProps = { style: { fontFamily: 'Poppins-Regular' } };
setCustomText(customTextProps);
LogBox.ignoreAllLogs(true);
// LogBox.ignoreLogs([
//   'Warning: isMounted(...) is deprecated',
//   'Module RCTImageLoader',
//   'Animated: `useNativeDriver`',
//   'Found screens with the same name nested inside one another',
// ]);

// const middleware = createReactNavigationReduxMiddleware("root", state => state.navigation);
//
// const Nav = reduxifyNavigator(RootStack, "root");
//
// const mapStateToProps = (state) => ({state: state.navigation});
// const AppWithNavigationState = connect(mapStateToProps)(Nav);

export const store = createStore(appReducer, applyMiddleware(/*middleware, */));
export const persistor = persistStore(store)

export class NewSideMenu extends Component {
  constructor(props) {
    super(props);
    this.unsubscribe = null;
    this.unsubscribed = null;
    this.handleChange = this.handleChange.bind(this);
  }

  state = {
    isOpen: false,
    isOpenUpgradePopup: false
  };

  handleChange() {
    let token = store.getState().appData?.appData?.token;
    let open = store.getState().appData?.drawerState?.open;
    if (token?.length > 0 && open) {
      this.setState({ isOpen: true });
    } else {
      this.setState({ isOpen: false });
    }
  }

  render() {
    if (this.unsubscribe == null) {
      this.unsubscribe = store.subscribe(this.handleChange);
    }
    return (
      <View>
        <Text style={drawerStyle.name}>
          {store.getState().appData?.appData?.name}
        </Text>
      </View>
    );
  }
}

const drawerStyle = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Utils.moderateVerticalScale(32, 1),
    flexDirection: 'row',
  },
  name: {
    marginTop: Utils.moderateVerticalScale(105, 1),
    marginBottom: Utils.moderateVerticalScale(50, 0.5),
    fontSize: Utils.moderateScale(16, 0.5),
    fontFamily: 'Roboto-BoldCondensed',
    color: 'white',
  },
  image: {
    height: Utils.moderateScale(20),
    width: Utils.moderateScale(20),
  },
  text: {
    fontSize: Utils.moderateScale(14),
    fontFamily: 'Poppins-Regular',
    marginLeft: Utils.moderateScale(20),
    color: 'white',
  },
});
class App extends Component {
  state = {
    isReady: false,
  };

  async componentDidMount() {
    let appState = await Utils.getStateAsyncStorage('appData');
    store.dispatch(ActionCreators.setCurrentURL(Utils.siteUrl()))
    if (appState) {
      store.dispatch(ActionCreators.setInitialState(appState));
    }

    this.openUpdatePopup()
    // let token = await store.getState().appData.appData.token;
    // if (token) {
    //   setTimeout(() => {
    //     this.fetchPopuSetting(token);
    //   }, 200);
    // }
    this.onTokenRefreshListener = messaging().onTokenRefresh(async fcmToken => {
      try {
        let oldState = await Utils.getStateAsyncStorage('appData');
        let userId = oldState.appData.id;
        store.dispatch(ActionCreators.updateDeviceToken(fcmToken));
        Utils.saveStateAsyncStorage({
          ...oldState,
          appData: { ...oldState.appData, deviceToken: fcmToken },
        });
        if (userId) {
          try {
            Utils.makeApiRequest(
              'update-device-token',
              {
                old_device_token: oldState.appData.deviceToken,
                device_token: fcmToken,
                token: oldState.appData.token,
                device_type: Platform.OS === 'ios' ? 'ios' : 'android',
              },
              null,
              'POST',
              'users',
            );
          } catch (error) {
            console.log(error);
            throw new Error(error);
          }
        }
      } catch (error) {
        console.log(
          'error occured while updating new device token: ' +
          fcmToken +
          ' => ' +
          error,
        );
      }
    });
    this.setState({ isReady: true });
    setTimeout(() => {
      SplashScreen.hide();
    }, 500);
    if (Platform.OS === 'android') {
      StatusBar.setHidden(true);
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    } else {
      StatusBar.setHidden(false);
    }
    StatusBar.setBarStyle('light-content', true);

    await messaging().registerDeviceForRemoteMessages();

    this.MessageListner = messaging().onMessage(remoteMessage => {
      console.log('Remote Message Is Comming', remoteMessage);
      this.onDisplayNotification(remoteMessage);
    });

    this.MessageListner = messaging().setBackgroundMessageHandler(
      async message => {
        console.log(message);
        // this.onDisplayNotification(message);
      },
    );
  }

  async onDisplayNotification(remoteMessage) {
    await notifee.requestPermission();
    const channelId = await notifee.createChannel({
      id: 'otgcDefault',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    // Display a notification
    await notifee.displayNotification({
      title: remoteMessage.notification.title,
      body: remoteMessage.notification.body,
      android: {
        sound: 'default',
        channelId,
        // smallIcon: 'app_assets_images_img_aboutlogo',
        pressAction: {
          id: 'otgcDefault',
        },
        importance: AndroidImportance.HIGH,
        data: remoteMessage.data,
      },
      ios: {
        sound: 'default',
        pressAction: {
          id: 'otgcDefault',
        },
        foregroundPresentationOptions: {
          badge: true,
          sound: true,
          banner: true,
          list: true,
        },
      },
    });
  }

  // componentWillUnmount() {
  //   this.unsubscribed();
  // }

  fetchPopuSetting(token) {
    Utils.makeApiRequest('notify', {}, token, 'GET', 'auth')
      .then(result => {
        if (result.status == true) {
          console.log(result?.data, 'data');
          if (result?.data?.enabled === 'yes') {
            var compareDate = moment(new Date()).format('YYYY-MM-DD');
            var startDate = result?.data?.popup_display_start ? moment(result?.data?.popup_display_start).format(
              'YYYY-MM-DD',
            ) : compareDate;
            var endDate = moment(result?.data?.popup_display_end).format(
              'YYYY-MM-DD',
            );
            let popup_options = result?.data?.popup_options
            if (moment(compareDate).isBetween(startDate, endDate) || moment(compareDate).isSame(endDate) || moment(compareDate).isBefore(endDate)) {
              if (popup_options == 'only_app' || popup_options == 'both') {
                Utils.displayAlert(
                  'Attention',
                  <RenderHtml
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
            }
          }
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }


  openUpdatePopup() {
    try {
      Utils.makeApiRequest('app-version', {}, null, 'GET', 'auth').then(
        async res => {
          const appVersion = await DeviceInfo.getVersion();
          // if (
          //   appVersion !== (Platform.OS === "ios" ? res.data.ios_version : res.data.android_version)
          // ) {
          //   // this.setState({ isOpenUpgradePopup: true });
          // } else {
          //   this.setState({ isOpenUpgradePopup: false });
          // }

          if (
            res?.data &&
            compare(
              appVersion,
              Platform.OS === "ios" ? `${res.data.ios_version}` : `${res.data.android_version}`,
              "<"
            )
          ) {
            this.setState({ isOpenUpgradePopup: true });
          } else {
            this.setState({ isOpenUpgradePopup: false });
          }
        }
      )

    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  render() {
    if (this.state.isReady) {
      let appState = store.getState();
      let isSignUpDone = appState.appData.signUpData?.isSignUpDone

      let signedIn = false;

      console.log("first-INAPPURL---->", appState?.appData?.url)
      if (!appState?.appData?.url || appState?.appData?.url?.url === '') {
        console.log('first-INAPP', Utils.siteUrl())
        store.dispatch(ActionCreators.setCurrentURL(Utils.siteUrl()))
      } else if (appState?.appData?.url) {
        console.log("first-INAPPURL22---->", appState?.appData?.url, appState?.appData?.url !== Utils.siteUrl())
        if (appState?.appData?.url !== Utils.siteUrl()) {
          store.dispatch(ActionCreators.logout());
          signedIn = false;
        } else if (!isSignUpDone) {
          signedIn = false;
        } else {
          try {
            signedIn = appState?.appData?.appData?.token?.length > 0 ? true : false;
          } catch (error) {
            signedIn = false;
          }
        }
      } else {
        try {
          if (!isSignUpDone) {
            signedIn = false;
          } else {
            signedIn = appState?.appData?.appData?.token?.length > 0 ? true : false;
          }
        } catch (error) {
          signedIn = false;
        }
      }

      return (
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <RootStackCreator signedIn={signedIn} />
            <ModalPortal />
          </PersistGate>
          {this.state.isOpenUpgradePopup && <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.isOpenUpgradePopup}
            onRequestClose={() => { }}>
            <View style={styles.container}>
              <View style={styles.alertView}>
                <View style={styles.titleView}>
                  <Text style={styles.title}>Update Required</Text>
                  <Text style={styles.subTitle}>
                    On The Go Cleaners is out of date. Please visit the App Store to upgrade to the latest version.
                  </Text>
                </View>
                <View style={styles.divider}></View>
                <TouchableOpacity style={styles.btnView}
                  onPress={() => {
                    Linking.openURL(
                      Platform.OS === "ios" ? LINK_APP.APP_STORE : LINK_APP.PLAY_STORE
                    )
                  }}>
                  <Text style={styles.btnTxt}>Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>}
        </Provider>
      );
    } else {
      return <View></View>;
    }
  }
}

export default Sentry.wrap(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00000056',
    justifyContent: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  alertView: {
    width: '80%',
    alignSelf: "stretch",
    // marginHorizontal: 22,
    backgroundColor: 'white',
    borderRadius: 8,
    // paddingVertical: 25,
    alignItems: "center",
    alignSelf: 'center'
  },
  titleView: {
    alignItems: 'center'
  },
  title: {
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(16),
    color: 'black',
    fontWeight: 'bold',
    margin: 20
  },
  subTitle: {
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(14),
    color: 'black',
    marginHorizontal: 20
  },
  divider: {
    width: '100%', marginTop: 20, height: '0.2%', backgroundColor: 'gray'
  },
  btnView: {
    backgroundColor: '#171151', borderRadius: 20, marginVertical: 15
  },
  btnTxt:
  {
    color: 'white', fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(18),
    marginHorizontal: 15,
    marginVertical: 10

  }
})