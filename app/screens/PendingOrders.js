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
// import { SafeAreaView } from "react-navigation";
import {connect} from 'react-redux';
import styles from './styles';
import * as Utils from '../lib/utils';
import {ActionCreators} from '../actions/index';
import Images from '../assets/images/index';
import LoaderView from '../components/LoaderView';
import ListEmptyComponent from '../components/ListEmptyComponent';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';

class PendingOrdersScreen extends Component {
  static navigationOptions = {
    title: 'ACTIVE ORDERS',
  };

  constructor(props) {
    super(props);
    this.state = {
      orderList: [],
      page: 1,
      reset: false,
      loading: true,
      refreshing: false,
      loadingMore: false,
      noDataLeft: false,
    };
    this.firstMount = false;
    this.renderItem = this.renderItem.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handleLoadMore = this.handleLoadMore.bind(this);
    this.fetchOrderData = this.fetchOrderData.bind(this);
    const didFocusSubscription = this.props.navigation.addListener(
      'didFocus',
      payload => {
        if (this.props.newOrderAdded.added) {
          this.props.toggleNewOrderAdded();
          this.handleRefresh();
        } else if (this.firstMount) {
          !this.state.refreshing && this.handleRefresh();
        }
      },
    );
  }

  componentDidMount() {
    // this.handleRefresh();
    this._navigationEvent = this.props.navigation.addListener('focus', () => {
      this.handleRefresh();
    });
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });
    this.fetchOrderData().then(() => {
      this.firstMount = true;
    });
  }

  componentWillUnmount() {
    this.firstMount = false;
    this._navigationEvent();
  }

  async fetchOrderData() {
    return Utils.makeApiRequest(
      `order?page=${this.state.page}&limit=${Utils.ItemsPerPage}&user_id=${this.props.appData.id}&status=pending_pickup`,
      {
        page: this.state.page,
        type: 'pending',
        item_per_page: Utils.ItemsPerPage,
      },
      this.props.appData.token,
      'GET',
      ``,
    )
      .then(async result => {
        if (result.status === false) {
          await this.setState({
            loading: false,
            refreshing: false,
            loadingMore: false,
          });
          if (this.props.navigation.isFocused()) {
            Utils.displayAlert(
              '',
              'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
            );
          }
        } else if (result.status == true) {
          if (result.data.length == Utils.ItemsPerPage) {
            if (this.state.reset) {
              await this.setState({
                orderList: result.data,
                page: this.state.page + 1,
                loading: false,
                refreshing: false,
                reset: false,
                loadingMore: false,
                noDataLeft: false,
              });
            } else {
              await this.setState({
                orderList: [...this.state.orderList, ...result.data],
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
                orderList: result.data,
                loading: false,
                refreshing: false,
                reset: false,
                loadingMore: false,
                noDataLeft: true,
              });
            } else if (
              this.state.page == 1 &&
              result.data.length < Utils.ItemsPerPage
            ) {
              await this.setState({
                orderList: result.data,
                loading: false,
                refreshing: false,
                reset: false,
                loadingMore: false,
                noDataLeft: true,
              });
            } else {
              await this.setState({
                orderList: [...this.state.orderList, ...result.data],
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
    this.setState(
      {refreshing: true, page: 1, reset: true, loadingMore: false},
      () => {
        setTimeout(() => this.fetchOrderData(), 500);
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
        this.fetchOrderData();
      });
    }
  }

  navToOrderDetails(orderId) {
    if (orderId) {
      this.props.navigation.navigate('OrderDetails', {
        orderId: orderId,
        orderType: 'pending',
      });
    }
  }

  renderItem({item, index}) {
    let d = item.pickup_date.split(' ');
    let day = d[0],
      month = d[1];
    day = day.split('-');
    let monthString = day[1];
    let dayString = day[2];
    let yearString = day[0];

    return (
      <TouchableOpacity
        onPress={() => this.navToOrderDetails(item.id)}
        style={[
          styles.card,
          localStyle.card,
          index == 0 &&
            Platform.OS === 'android' &&
            localStyle.firstCardAndroid,
        ]}>
        <View style={localStyle.content}>
          <View
            style={[
              localStyle.infoContainer,
              localStyle.infoContainerForOrderDate,
            ]}>
            <View>
              <View style={localStyle.orderDateContainer}>
                <Text
                  style={
                    localStyle.orderDateDay
                  }>{`${monthString}-${dayString}-${yearString}`}</Text>
                <Text style={localStyle.orderDateMonth}> {month}</Text>
              </View>
              <Text style={localStyle.orderTime}>{item.time_slot}</Text>
            </View>
          </View>
          <View
            style={[
              localStyle.infoContainer,
              localStyle.infoContainerForOrderNumber,
            ]}>
            <View>
              <Text style={localStyle.labels}>ORDER NO.</Text>
              <Text style={localStyle.info}>#{item.order_number}</Text>
            </View>
          </View>
          {/* <View
            style={[
              localStyle.infoContainer,
              localStyle.infoContainerForDelDate
            ]}
          >
            <View>
              <Text style={localStyle.labels}>DELIVERY DATE</Text>
              <Text style={localStyle.info}>{moment(item.delivery_date).format(Utils.DateFormat)}</Text>
            </View>
          </View> */}
          <View style={localStyle.arrowIcon}>
            <Image source={Images.arrowIcon} />
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
          {this.state.loading ? (
            <LoaderView loading={this.state.loading} />
          ) : (
            <FlatList
              data={this.state.orderList}
              showsVerticalScrollIndicator={false}
              horizontal={false}
              style={localStyle.flatList}
              keyExtractor={(item, index) => item.id.toString()}
              renderItem={this.renderItem}
              ListEmptyComponent={
                <ListEmptyComponent message="You do not have any orders yet." />
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
        </LinearGradient>
      </SafeAreaView>
    );
  }
}

const localStyle = StyleSheet.create({
  flatList: {
    flex: 1,
    marginBottom: Utils.scale(5),
  },
  firstCardAndroid: {
    marginTop: Utils.scale(8),
  },
  card: {
    width: '94%',
    alignSelf: 'center',
    marginTop: Utils.scale(8),
    ...Platform.select({
      android: {
        marginTop: Utils.scale(4),
        marginBottom: Utils.scale(4),
      },
    }),
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    marginTop: Utils.moderateScale(15),
    marginBottom: Utils.moderateScale(15),
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderDateDay: {
    fontFamily: 'Roboto-BoldCondensed',
    ...Platform.select({
      android: {
        fontWeight: '500',
      },
    }),
    color: 'black',
    fontSize: Utils.moderateScale(18, 0.5),
  },
  orderDateMonth: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(12, 0.5),
  },
  orderTime: {
    fontFamily: 'Poppins-Regular',
    color: '#838688',
    fontSize: Utils.moderateScale(12, 0.5),
  },
  info: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(12, 0.5),
  },
  labels: {
    fontFamily: 'Poppins-Regular',
    color: '#b1b6bb',
    letterSpacing: 1,
    fontSize: Utils.moderateScale(10),
  },
  orderDateContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainerForOrderDate: {
    borderRightWidth: 1,
    borderRightColor: '#d7d8da',
    flex: 1.2,
  },
  infoContainerForOrderNumber: {
    flex: 0.9,
  },
  infoContainerForDelDate: {
    alignItems: 'flex-start',
    flex: 1,
  },
  arrowIcon: {
    flex: 0.15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const mapStateToProps = state => {
  return {
    appData: state.appData.appData,
    newOrderAdded: state.appData.newOrderAdded,
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
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PendingOrdersScreen);
