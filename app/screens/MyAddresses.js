import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import {connect} from 'react-redux';
import {ActionCreators} from '../actions/index';
import styles from './styles';
import * as Utils from '../lib/utils';
import Images from '../assets/images/index';
import LoaderView from '../components/LoaderView';
import LoaderFullScreen from '../components/LoaderFullScreen';
import BlueButton from '../components/button/BlueButton';
import ListEmptyComponent from '../components/ListEmptyComponent';
import LinearGradient from 'react-native-linear-gradient';

class MyAddressesScreen extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: 'MY ADDRESSES',
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
      addressList: [],
      page: 0,
      reset: false,
      loading: true,
      refreshing: false,
      loadingMore: false,
      showOptions: false,
      optionMenuXPos: Utils.width / 2,
      optionMenuYPos: Utils.height / 2,
      activeAddress: null,
      showFullScreenLoader: false,
    };
    this._mounted = false;
    this.threeDots = {};
    this.renderItem = this.renderItem.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handleLoadMore = this.handleLoadMore.bind(this);
    this.fetchAddresses = this.fetchAddresses.bind(this);
    this.handleMoreTap = this.handleMoreTap.bind(this);
    this.setDefault = this.setDefault.bind(this);
    this.deleteAddress = this.deleteAddress.bind(this);
    this.onEditAddressTap = this.onEditAddressTap.bind(this);
    const didFocusSubscription = this.props.navigation.addListener(
      'didFocus',
      payload => {
        if (this.props.addressUpdated.updated) {
          this.handleRefresh();
          this.props.toggleUpdatedAddressStatus();
        } else if (this.props.newAddressAdded.added) {
          this.handleRefresh();
          this.props.toggleNewAddessAdded();
        }
      },
    );
  }

  componentDidMount() {
    this._navigationEvent = this.props.navigation.addListener('focus', () => {
      this.handleRefresh();
    });
    this._mounted = true;
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });
    this.fetchAddresses();
  }

  componentWillUnmount() {
    this._mounted = false;
    this._navigationEvent();
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
            this.setState({loading: false, refreshing: false});
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
          } else if (result.status === true) {
            if (this.state.reset) {
              this.setState({
                addressList: result.data,
                page: this.state.page + 1,
                loading: false,
                refreshing: false,
                reset: false,
              });
            } else {
              console.log(this.state.addressList);
              this.setState({
                addressList: [...result.data],
                page: this.state.page + 1,
                loading: false,
                refreshing: false,
                reset: false,
              });
            }
          } else {
            this.setState({loading: false, refreshing: false});
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

  handleRefresh() {
    this.setState({refreshing: true, page: 0, reset: true}, () => {
      this.fetchAddresses();
    });
  }

  handleLoadMore() {
    this.setState({loadingMore: true}, () => {
      this.fetchAddresses();
    });
  }

  handleMoreTap(id) {
    let x = Utils.width / 2,
      y = Utils.height / 2;
    (menuHeight = Utils.moderateScale(100, 0.4)), (tabBarHeight = 100);
    this.threeDots[id].measure((x, y, width, height, pageX, pageY) => {
      (x = pageX), (y = pageY);
      if (Utils.height - (y + menuHeight) < tabBarHeight) {
        y = y - menuHeight;
      }
      this.setState({
        optionMenuXPos: x,
        optionMenuYPos: y,
        showOptions: true,
        activeAddress: id,
      });
    });
  }

  updateDefaultAddressInState(address_id = null) {
    if (address_id) {
      this.setState({
        addressList: this.state.addressList.map(address => {
          if (address.id == address_id) {
            return {...address, primary: 'yes'};
          } else if (address.primary == 'yes') {
            return {...address, primary: 'no'};
          } else {
            return address;
            result;
          }
        }),
      });
    }
  }

  deleteAddressInState(address_id = null) {
    if (address_id) {
      this.setState({
        addressList: this.state.addressList.filter(
          address => address.id != address_id,
        ),
      });
    }
  }

  async deleteAddress() {
    await this.setState({showOptions: false});
    if (this.state.activeAddress) {
      let address_id = this.state.activeAddress;
      Utils.displayAlert(
        '',
        'You are about to delete a pickup address. Do you want to perform this action?',
        'CONFIRM',
        null,
        () => {
          this.setState({showFullScreenLoader: true});
          setTimeout(() => {
            Utils.makeApiRequest(
              `${address_id}`,
              {},
              this.props.appData.token,
              'DELETE',
              'user-address',
            )
              .then(async result => {
                if (this._mounted) {
                  await this.setState({
                    showFullScreenLoader: false,
                    activeAddress: null,
                  });
                  if (result.status === false) {
                    if (this.props.navigation.isFocused()) {
                      if (result?.msg) {
                        Utils.displayAlert('', result.msg);
                      } else {
                        Utils.displayAlert(
                          'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                        );
                      }
                    }
                  } else if (result.status) {
                    this.deleteAddressInState(address_id);
                    this.handleRefresh();
                    Utils.displayAlert(
                      '',
                      result.msg || 'Your address has been deleted.',
                    );
                  } else {
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
          }, 200);
        },
        true,
      );
    }
  }

  async setDefault() {
    await this.setState({showOptions: false});
    if (this.state.activeAddress) {
      let address_id = this.state.activeAddress;
      Utils.displayAlert(
        '',
        'You are about to change the default address. Do you want to perform this action?',
        'CONFIRM',
        null,
        () => {
          const prevAddress = this.state.addressList.find(
            item => item.id === this.state.activeAddress,
          );
          console.log(prevAddress, 'asass');
          this.setState({showFullScreenLoader: true});
          setTimeout(() => {
            Utils.makeApiRequest(
              `${address_id}`,
              {primary: prevAddress?.primary === 'yes' ? 'no' : 'yes'},
              this.props.appData.token,
              'POST',
              'user-address',
            )
              .then(async result => {
                if (this._mounted) {
                  await this.setState({
                    showFullScreenLoader: false,
                    activeAddress: null,
                  });
                  if (result.status === false) {
                    if (this.props.navigation.isFocused()) {
                      Utils.displayAlert(
                        '',
                        'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                      );
                    }
                  } else if (result.status) {
                    this.updateDefaultAddressInState(address_id);
                    Utils.displayAlert(
                      '',
                      'Your default address has been changed.',
                    );
                    this.fetchAddresses();
                  } else {
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
          }, 200);
        },
        true,
      );
    }
  }

  async onEditAddressTap() {
    if (this.state.activeAddress) {
      let address_id = this.state.activeAddress;
      this.setState({showOptions: false, activeAddress: null});
      this.props.navigation.navigate('EditAddress', {address_id: address_id});
    } else {
      this.setState({showOptions: false, activeAddress: null});
    }
  }

  renderItem({item, index}) {
    let address = item.first_name
      ? item.first_name.charAt(0).toUpperCase() +
        item.first_name.substr(1).toLowerCase() +
        ' ' +
        item.last_name.charAt(0).toUpperCase() +
        item.last_name.substr(1).toLowerCase() +
        '\n' +
        item.address2 +
        '\n' +
        item.address1 +
        '\n' +
        (item.cross_street ? item.cross_street + '\n' : '') +
        item.city?.name +
        ', ' +
        item.state?.name +
        ' ' +
        item.zip_code +
        '\n' +
        'USA' +
        '\n' +
        item.mobile +
        '\n' +
        'Doorman Building: '
      : '---';

    address += item.doorman_building
      ? item.doorman_building.toLowerCase() == 'yes'
        ? 'Yes'
        : 'No'
      : '---';
    return (
      <View
        style={[
          styles.card,
          localStyle.content,
          index == 0 &&
            Platform.OS === 'android' &&
            localStyle.firstCardAndroid,
        ]}>
        <View style={localStyle.left}>
          <Text style={localStyle.addressLabel}>
            {'ADDRESS ' + (index + 1)}
          </Text>
          <Text style={localStyle.address}>{address}</Text>
        </View>
        <View style={localStyle.right}>
          <TouchableOpacity
            hitSlop={{
              top: 15,
              bottom: 15,
              right: Utils.moderateScale(20, 1),
              left: Utils.moderateScale(20, 1),
            }}
            style={localStyle.threeDotsContainer}
            onPress={() => this.handleMoreTap(item.id)}>
            <Image
              ref={v => (this.threeDots[item.id] = v)}
              source={Images.threeDotsIcon}
            />
          </TouchableOpacity>
          {item.primary == 'yes' && (
            <Image source={Images.checkIcon} resizeMode="contain" />
          )}
        </View>
      </View>
    );
  }

  render() {
    const prevAddress = this.state.addressList.find(
      item => item.id === this.state.activeAddress,
    );
    return (
      //<SafeAreaView style={styles.container}>
      <LinearGradient colors={['#3b2eb6', '#21e381']} style={styles.container}>
        {this.state.showFullScreenLoader && (
          <LoaderFullScreen
            loading={this.state.showFullScreenLoader}
            message={this.state.message}
          />
        )}
        {this.state.showOptions && (
          <TouchableWithoutFeedback
            onPress={() => this.setState({showOptions: false})}>
            <View style={localStyle.backdrop}></View>
          </TouchableWithoutFeedback>
        )}
        {this.state.showOptions && (
          <View
            style={[
              styles.card,
              localStyle.optionsMenuContainer,
              {
                top: this.state.optionMenuYPos - 70,
                left: this.state.optionMenuXPos - Utils.moderateScale(150),
              },
            ]}>
            <TouchableOpacity
              style={localStyle.optionsContainer}
              onPress={this.setDefault}>
              {prevAddress?.primary == 'yes' && (
                <Image source={Images.selectIcon} />
              )}
              <Text style={localStyle.optionText}>Set as Default</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={localStyle.optionsContainer}
              onPress={this.onEditAddressTap}>
              <Image source={Images.editCardIcon} />
              <Text style={localStyle.optionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={localStyle.optionsContainer}
              onPress={this.deleteAddress}>
              <Image source={Images.deleteCardIcon} />
              <Text style={localStyle.optionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        <BlueButton
          onPress={() => this.props.navigation.navigate('AddNewAddress')}
          buttonText="+ ADD NEW"
          style={localStyle.button}
        />
        {this.state.loading ? (
          <LoaderView loading={this.state.loading} />
        ) : (
          <FlatList
            data={this.state.addressList}
            showsVerticalScrollIndicator={false}
            horizontal={false}
            style={localStyle.flatList}
            keyExtractor={(item, index) => item.id.toString()}
            renderItem={this.renderItem}
            ListEmptyComponent={<ListEmptyComponent />}
            refreshControl={
              <RefreshControl
                colors={['red', 'blue', 'orange']}
                refreshing={this.state.refreshing}
                onRefresh={this.handleRefresh}
              />
            }
          />
        )}
      </LinearGradient>
      //</SafeAreaView>
    );
  }
}

const localStyle = StyleSheet.create({
  flatList: {
    flex: 1,
    marginBottom: Utils.scale(5),
  },
  backdrop: {
    height: Utils.height,
    width: Utils.width,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    position: 'absolute',
    zIndex: 10,
  },
  optionsMenuContainer: {
    position: 'absolute',
    opacity: 1,
    width: Utils.moderateScale(150),
    zIndex: 50,
    padding: Utils.moderateScale(10, 0.5),
    alignItems: 'flex-start',
  },
  optionsContainer: {
    flexDirection: 'row',
    padding: Utils.moderateScale(5, 0.5),
    alignItems: 'center',
    width: '100%',
  },
  optionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(14),
    marginLeft: Utils.moderateScale(8),
    color: 'black',
  },
  firstCardAndroid: {
    marginTop: Utils.scale(8),
  },
  content: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: Utils.scale(8),
    ...Platform.select({
      android: {
        marginTop: Utils.scale(4),
        marginBottom: Utils.scale(4),
      },
    }),
    padding: Utils.moderateScale(15),
  },
  button: {
    marginBottom: Utils.scale(5),
    alignSelf: 'center',
    marginTop: Utils.scale(15),
  },
  tick: {
    height: Utils.moderateScale(10, 0.5),
    width: Utils.moderateScale(10, 0.5),
  },
  left: {
    flex: 1,
  },
  right: {
    flex: 0.1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  address: {
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(14),
    marginRight: Utils.moderateScale(10),
    lineHeight: Utils.moderateScale(18),
    color: 'black',
    flex: 1,
  },
  addressLabel: {
    color: '#667c87',
    fontSize: Utils.moderateScale(12),
  },
  threeDotsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  threeDotsIcon: {
    height: Utils.moderateScale(10, 0.5),
    width: Utils.moderateScale(10, 0.5),
  },
  doormanBuildingContainer: {
    flexDirection: 'row',
  },
  doormanBuilding: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(14),
    lineHeight: Utils.moderateScale(18),
  },
});

const mapStateToProps = state => {
  return {
    appData: state.appData.appData,
    addressUpdated: state.appData.addressUpdated,
    newAddressAdded: state.appData.newAddressAdded,
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    //setPendingOrderList: data => dispatch(ActionCreators.setPendingOrderList(data)),
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
    toggleUpdatedAddressStatus: data =>
      dispatch(ActionCreators.toggleUpdatedAddressStatus(data)),
    toggleNewAddessAdded: data =>
      dispatch(ActionCreators.toggleNewAddessAdded(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MyAddressesScreen);
