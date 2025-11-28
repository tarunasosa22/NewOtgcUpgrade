import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import React, {Component} from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import LinearGradient from 'react-native-linear-gradient';
import * as Utils from '../lib/utils';
import Images from '../assets/images/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActionCreators} from '../actions';
import {store} from '../../App';
import messaging from '@react-native-firebase/messaging';

class DrawerContent extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <DrawerContentScrollView {...this.props}>
        <LinearGradient
          colors={['#3b2eb6', '#21e381']}
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View style={drawerStyle.container}>
            <Text style={drawerStyle.name}>
              {/* {store.getState().appData.appData.name} */}
            </Text>
            <TouchableOpacity
              hitSlop={{top: 15, bottom: 15, left: 0, right: 0}}
              style={drawerStyle.content}
              onPress={() => {
                store.dispatch(ActionCreators.setDrawerCloseState());
                this.props.navigation.navigate('Profile');
              }}>
              <Image
                source={Images.drawerProfileIcon}
                resizeMode="contain"
                style={drawerStyle.image}
              />
              <Text style={drawerStyle.text}>My Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              hitSlop={{top: 15, bottom: 15, left: 0, right: 0}}
              style={drawerStyle.content}
              onPress={() => {
                store.dispatch(ActionCreators.setDrawerCloseState());
                this.props.navigation.navigate('MyOrders');
              }}>
              <Image
                source={Images.drawerOrdersIcon}
                resizeMode="contain"
                style={drawerStyle.image}
              />
              <Text style={drawerStyle.text}>My Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity
              hitSlop={{top: 15, bottom: 15, left: 0, right: 0}}
              style={drawerStyle.content}
              onPress={() => {
                //   store.dispatch(ActionCreators.setDrawerCloseState());
                this.props.navigation.navigate('MyAddresses');
                // navigation.navigate('MyAddresses');
              }}>
              <Image
                source={Images.drawerAddressIcon}
                resizeMode="contain"
                style={drawerStyle.image}
              />
              <Text style={drawerStyle.text}>My Addresses</Text>
            </TouchableOpacity>
            <TouchableOpacity
              hitSlop={{top: 15, bottom: 15, left: 0, right: 0}}
              style={drawerStyle.content}
              onPress={() => {
                store.dispatch(ActionCreators.setDrawerCloseState());
                this.props.navigation.navigate('Pricing');
              }}>
              <Image
                source={Images.drawerPricingIcon}
                resizeMode="contain"
                style={drawerStyle.image}
              />
              <Text style={drawerStyle.text}>Pricing</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity hitSlop={{ top: 15, bottom: 15, left: 0, right: 0 }} style={drawerStyle.content} onPress={() => {
                                store.dispatch(ActionCreators.setDrawerCloseState());
                                NavigationService.navigate('AboutUs');
                            }}>
                                <Image source={Images.drawerAboutIcon} resizeMode="contain" style={drawerStyle.image} />
                                <Text style={drawerStyle.text}>About</Text>
                            </TouchableOpacity> */}
            <TouchableOpacity
              hitSlop={{top: 15, bottom: 15, left: 0, right: 0}}
              style={drawerStyle.content}
              onPress={() => {
                store.dispatch(ActionCreators.setDrawerCloseState());
                this.props.navigation.navigate('Faq');
              }}>
              <Image
                source={Images.drawerFaqIcon}
                resizeMode="contain"
                style={drawerStyle.image}
              />
              <Text style={drawerStyle.text}>FAQ's</Text>
            </TouchableOpacity>
            <TouchableOpacity
              hitSlop={{top: 15, bottom: 15, left: 0, right: 0}}
              style={drawerStyle.content}
              onPress={() => {
                store.dispatch(ActionCreators.setDrawerCloseState());
                this.props.navigation.navigate('Feedback');
              }}>
              <Image
                source={Images.drawerFeedbacksIcon}
                resizeMode="contain"
                style={drawerStyle.image}
              />
              <Text style={drawerStyle.text}>Feedback</Text>
            </TouchableOpacity>
            <TouchableOpacity
              hitSlop={{top: 15, bottom: 15, left: 0, right: 0}}
              style={drawerStyle.content}
              onPress={() => {
                Utils.displayAlert(
                  'Logout',
                  'Are you sure you want to logout?',
                  'Yes',
                  null,
                  async () => {
                    await messaging().deleteToken()
                    try {
                      Utils.makeApiRequest(
                        'delete-device-token',
                        {
                          device_token:
                            store.getState().appData.appData.deviceToken,
                        },
                        store.getState().appData.appData.token,
                      );
                    } catch (error) {
                      console.log(error);
                      DrawerContent;
                      throw new Error(error);
                    }
                    AsyncStorage.clear();
                    store.dispatch(ActionCreators.clearScheduleOrderData());
                    store.dispatch(ActionCreators.setDrawerCloseState());
                    store.dispatch(ActionCreators.logout());
                    // this.props.navigate('LoggedOutNav');
                    this.props.navigation.navigate('LoggedOutNav');
                  },
                  true,
                  true,
                );
              }}>
              <Image
                source={Images.drawerLogoutIcon}
                resizeMode="contain"
                style={drawerStyle.image}
              />
              <Text style={drawerStyle.text}>Logout</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </DrawerContentScrollView>
    );
  }
}

export default DrawerContent;

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
