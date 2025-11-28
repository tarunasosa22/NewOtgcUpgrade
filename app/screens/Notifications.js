import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from 'react-native';
import _ from 'lodash';
// import {SafeAreaView} from 'react-navigation';
import ActionButton from 'react-native-action-button';
import {connect} from 'react-redux';
import styles from './styles';
import {ActionCreators} from '../actions/index';
import * as Utils from '../lib/utils';
import Images from '../assets/images/index';
import LoaderView from '../components/LoaderView';
import ListEmptyComponent from '../components/ListEmptyComponent';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
// import MomentTimezone from 'moment-timezone';

class NotificationsScreen extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: 'ORDER TRACKER',
      headerRight: (
        <View style={{flexDirection: 'row'}}>
          {navigation.getParam('showCancelButton') && (
            <TouchableOpacity onPress={navigation.getParam('onCancelPress')}>
              <Image
                source={Images.undoIcon}
                style={{
                  marginRight: Utils.moderateScale(15, 0.5),
                  width: Utils.moderateScale(22),
                  height: Utils.moderateScale(22),
                }}
                resizeMode="contain"
                resizeMethod="resize"
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={navigation.getParam('openDrawer')}>
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
        </View>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      notificationList: [],
      page: 1,
      reset: false,
      loading: true,
      refreshing: false,
      loadingMore: false,
      noDataLeft: false,
      selectingItems: false,
      selectedItems: [],
      showLoaderInList: false,
    };
    this.firstMount = false;
    this.renderItem = this.renderItem.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handleLoadMore = this.handleLoadMore.bind(this);
    this.fetchNotifications = this.fetchNotifications.bind(this);
    const didFocusSubscription = this.props.navigation.addListener(
      'didFocus',
      payload => {
        if (true) {
          !this.state.refreshing && this.handleRefresh();
        }
      },
    );
  }

  componentDidMount() {
    this._navigationEvent = this.props.navigation.addListener('focus', () => {
      this.handleRefresh();
    });

    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });
    this.props.navigation.setParams({
      onCancelPress: () => {
        this.setState({selectingItems: false, selectedItems: []});
        this.props.navigation.setParams({showCancelButton: false});
      },
    });
    this.props.navigation.setParams({showCancelButton: false});
    this.fetchNotifications().then(() => {
      this.firstMount = true;
    });
  }

  componentWillUnmount() {
    this.firstMount = false;
  }

  async fetchNotifications() {
    return Utils.makeApiRequest(
      'my-notifications',
      {
        page: this.state.page,
        item_per_page: Utils.ItemsPerPage,
        user_id: this.props.appData.id,
      },
      this.props.appData.token,
      'POST',
      'notification',
    )
      .then(async result => {
        console.log(result);
        if (result.status === false) {
          await this.setState({
            loading: false,
            refreshing: false,
            loadingMore: false,
          });
          if (this.props.navigation.isFocused()) {
            // Utils.displayAlert('', 'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com');
          }
        } else if (result.status == true) {
          if (result.data.length == Utils.ItemsPerPage) {
            if (this.state.reset) {
              await this.setState({
                notificationList: result.data,
                page: this.state.page + 1,
                loading: false,
                refreshing: false,
                reset: false,
                loadingMore: false,
                noDataLeft: false,
              });
            } else {
              await this.setState({
                notificationList: _.uniqBy(
                  [...this.state.notificationList, ...result.data],
                  'id',
                ),
                page: this.state.page + 1,
                loading: false,
                refreshing: false,
                reset: false,
                loadingMore: false,
              });
            }
          } else {
            if (this.state.reset) {
              await this.setState({
                notificationList: result.data,
                loading: false,
                refreshing: false,
                reset: false,
                loadingMore: false,
                noDataLeft: true,
              });
            } else {
              await this.setState({
                notificationList: _.uniqBy(
                  [...this.state.notificationList, ...result.data],
                  'id',
                ),
                loading: false,
                refreshing: false,
                reset: false,
                loadingMore: false,
                noDataLeft: true,
              });
            }
          }
        } else {
          await this.setState({
            loading: false,
            refreshing: false,
            loadingMore: false,
          });
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

  handleRefresh() {
    this.props.navigation.setParams({showCancelButton: false});
    this.setState(
      {
        showLoaderInList: false,
        selectingItems: false,
        selectedItems: [],
        refreshing: true,
        page: 1,
        reset: true,
        loadingMore: false,
      },
      () => {
        setTimeout(() => this.fetchNotifications(), 500);
      },
    );
  }

  handleLoadMore() {
    if (
      !this.state.loading &&
      !this.state.refreshing &&
      !this.state.loadingMore &&
      !this.state.noDataLeft
    ) {
      this.setState({loadingMore: true}, () => {
        this.fetchNotifications();
      });
    }
  }

  checkInSelectedItems(id = null) {
    if (id) {
      for (let i = 0; i < this.state.selectedItems.length; i++) {
        if (this.state.selectedItems[i] == id) {
          return true;
        }
      }
    }
    return false;
  }

  async handlePress(id = null, order_id = null) {
    if (id) {
      if (this.state.selectingItems) {
        if (this.checkInSelectedItems(id)) {
          let newItems = this.state.selectedItems.filter(item => item != id);
          if (newItems.length <= 0) {
            this.props.navigation.setParams({showCancelButton: false});
            await this.setState({
              selectedItems: newItems,
              selectingItems: false,
            });
          } else {
            await this.setState({selectedItems: newItems});
          }
        } else {
          this.state.selectedItems.push(id);
          await this.setState({selectedItems: this.state.selectedItems});
        }
      } else {
        try {
          Utils.makeApiRequest(
            'update-notification-status',
            {status: 'Read', notification_ids: [id]},
            this.props.appData.token,
            'POST',
            'notification',
          );

          this.props?.navigation?.navigate('OrderDetails', {orderId: order_id});
        } catch (error) {
          console.log(error);
          throw new Error(error);
        }
      }
    }
  }

  async handleLongPress(id = null) {
    if (this.state.selectingItems) {
      if (this.checkInSelectedItems(id)) {
        let newItems = this.state.selectedItems.filter(item => item != id);
        if (newItems.length <= 0) {
          this.props.navigation.setParams({showCancelButton: false});
          await this.setState({selectedItems: newItems, selectingItems: false});
        } else {
          await this.setState({selectedItems: newItems});
        }
      } else {
        this.state.selectedItems.push(id);
        await this.setState({selectedItems: this.state.selectedItems});
      }
    } else {
      this.props.navigation.setParams({showCancelButton: true});
      this.state.selectedItems.push(id);
      await this.setState({
        selectedItems: this.state.selectedItems,
        selectingItems: true,
      });
    }
  }

  filterNotificationListAgainstSelectedItems(type = '') {
    let newList = [];
    let selected = this.state.selectedItems;
    for (let i = 0; i < this.state.notificationList.length; i++) {
      let item = this.state.notificationList[i];
      if (this.checkInSelectedItems(item.id)) {
        if (type == 'Read') {
          newList.push({...item, status: 'Read'});
        } else if (type == 'Unread') {
          newList.push({...item, status: 'Unread'});
        } else if (type != 'delete') {
          newList.push(item);
        }
      } else {
        newList.push(item);
      }
    }
    return newList;
  }

  handleFabTap(type = '') {
    if (this.state.selectingItems && this.state.selectedItems.length > 0) {
      this.setState({showLoaderInList: true});
      return Utils.makeApiRequest(
        'update-notification-status',
        {status: type, notification_ids: this.state.selectedItems},
        this.props.appData.token,
      )
        .then(result => {
          if (result === false || typeof result !== 'object') {
            this.setState({showLoaderInList: false});
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
          } else if (result.success == true) {
            this.props.navigation.setParams({showCancelButton: false});
            this.setState({
              showLoaderInList: false,
              selectingItems: false,
              selectedItems: [],
              notificationList:
                this.filterNotificationListAgainstSelectedItems(type),
            });
          } else {
            this.setState({showLoaderInList: false});
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
  }

  renderItem({item, index}) {
    let notificationImageSrc =
      item.status == 'Read'
        ? Images.notificationReadIcon
        : Images.notificationUnreadIcon;
    let textColorStyle = item.status == 'Read' && localStyle.notificationRead;
    let dateColorStyle =
      item.status == 'Read'
        ? localStyle.notificationRead
        : localStyle.notificationUnread;
    return (
      <TouchableOpacity
        onPress={() => {
          this.handlePress(item.id, item.order_id);
        }}
        style={[
          styles.card,
          localStyle.card,
          this.checkInSelectedItems(item.id) && localStyle.selectedItem,
          index == 0 &&
            Platform.OS === 'android' &&
            localStyle.firstCardAndroid,
        ]}
        onLongPress={() => {
          this.handleLongPress(item.id);
        }}>
        <View style={localStyle.content}>
          <Image
            style={localStyle.image}
            source={notificationImageSrc}
            resizeMode="contain"
          />
          <View style={localStyle.textContainer}>
            <Text style={[localStyle.text, textColorStyle]}>
              {'#' + item.order_id + '\n' + item.message}
            </Text>
            <Text style={[localStyle.date, dateColorStyle]}>
              {moment(item.created).format(Utils.DateFormat)} {item.createdTime}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3b2eb6', '#21e381']}
          style={styles.container}>
          {this.state.showLoaderInList && (
            <View style={localStyle.loaderContainer}>
              <LoaderView loading={this.state.showLoaderInList} />
            </View>
          )}
          {this.state.loading ? (
            <LoaderView loading={this.state.loading} />
          ) : (
            <FlatList
              data={this.state.notificationList}
              showsVerticalScrollIndicator={false}
              horizontal={false}
              style={localStyle.flatList}
              keyExtractor={(item, index) => item.id.toString()}
              renderItem={this.renderItem}
              ListEmptyComponent={
                <ListEmptyComponent message="No new notifications." />
              }
              ListFooterComponent={() => (
                <ActivityIndicator
                  size="large"
                  color="#0000ff"
                  animating={this.state.loadingMore}
                  style={{marginTop: Utils.moderateScale(8)}}
                />
              )}
              onEndReached={this.handleLoadMore}
              onEndReachedThreshold={0.2}
              refreshControl={
                <RefreshControl
                  colors={['red', 'blue', 'orange']}
                  refreshing={this.state.refreshing}
                  onRefresh={this.handleRefresh}
                />
              }
            />
          )}
          {this.state.selectingItems && (
            <ActionButton
              size={Utils.moderateScale(35, 0.5)}
              buttonColor="#171151"
              verticalOrientation="up"
              position="right"
              offsetX={Utils.moderateScale(30, 0.5)}
              backdrop={<View style={localStyle.backdrop}></View>}
              buttonTextStyle={localStyle.actionButtonTextStyle}>
              <ActionButton.Item
                title="MARK AS READ"
                buttonColor="#42d966"
                textStyle={localStyle.actionButtonItemTextStyle}
                textContainerStyle={
                  localStyle.actionButtonItemTextContainerStyle
                }
                onPress={() => this.handleFabTap('Read')}>
                <Image
                  source={Images.readIcon}
                  style={localStyle.actionButtonItemIcon}
                />
              </ActionButton.Item>
              <ActionButton.Item
                title="MARK AS UNREAD"
                buttonColor="#42d966"
                textStyle={localStyle.actionButtonItemTextStyle}
                textContainerStyle={
                  localStyle.actionButtonItemTextContainerStyle
                }
                onPress={() => this.handleFabTap('Unread')}>
                <Image
                  source={Images.unreadIcon}
                  style={localStyle.actionButtonItemIcon}
                />
              </ActionButton.Item>
              <ActionButton.Item
                title="DELETE"
                buttonColor="#42d966"
                textStyle={localStyle.actionButtonItemTextStyle}
                textContainerStyle={
                  localStyle.actionButtonItemTextContainerStyle
                }
                onPress={() => this.handleFabTap('delete')}>
                <Image
                  source={Images.deleteIcon}
                  style={localStyle.actionButtonItemIcon}
                />
              </ActionButton.Item>
            </ActionButton>
          )}
        </LinearGradient>
      </SafeAreaView>
    );
  }
}

const localStyle = StyleSheet.create({
  flatList: {
    flex: 1,
    marginBottom: Utils.scale(5),
    marginTop: Utils.moderateScale(10),
  },
  loaderContainer: {
    position: 'absolute',
    height: Utils.height,
    width: Utils.width,
    backgroundColor: 'rgba(150, 200, 200, 0.4)',
    zIndex: 999,
  },
  firstCardAndroid: {
    marginTop: Utils.scale(8),
  },
  card: {
    flex: 1,
    marginTop: Utils.scale(8),
    ...Platform.select({
      android: {
        marginTop: Utils.scale(4),
        marginBottom: Utils.scale(4),
      },
    }),
    width: '90%',
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: Utils.moderateScale(10),
    marginBottom: Utils.moderateScale(10),
    alignItems: 'center',
  },
  selectedItem: {
    position: 'relative',
    backgroundColor: 'rgba(66, 217, 102, 0.3)',
  },
  image: {
    flex: 1,
    width: Utils.moderateScale(40, 0.5),
    height: Utils.moderateScale(40, 0.5),
    alignSelf: 'center',
  },
  textContainer: {
    flex: 4,
  },
  text: {
    flex: 1,
    fontSize: Utils.moderateScale(14),
    color: 'black',
    fontFamily: 'Poppins-Regular',
  },
  date: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(12),
  },
  backdrop: {
    height: Utils.height,
    width: Utils.width,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    position: 'absolute',
  },
  notificationUnread: {
    color: '#697b84',
  },
  notificationRead: {
    color: '#99aaad',
  },
  actionButtonTextStyle: {
    fontSize: Utils.moderateScale(18, 0.5),
  },
  actionButtonItemTextStyle: {
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(12),
    color: 'black',
  },
  actionButtonItemTextContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    height: Utils.moderateScale(20),
  },
  actionButtonItemIcon: {
    height: Utils.moderateScale(20, 0.5),
    width: Utils.moderateScale(20, 0.5),
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NotificationsScreen);
