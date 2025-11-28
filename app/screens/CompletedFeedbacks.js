import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {connect} from 'react-redux';
// import { SafeAreaView } from 'react-navigation';
import styles from './styles';
import * as Utils from '../lib/utils';
import LoaderView from '../components/LoaderView';
import Images from '../assets/images/index';
import BlueButton from '../components/button/BlueButton';
import ListEmptyComponent from '../components/ListEmptyComponent';
import LinearGradient from 'react-native-linear-gradient';

class CompletedFeedbacks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      feedbackList: [],
      page: 1,
      reset: false,
      loading: true,
      refreshing: false,
      loadingMore: false,
      noDataLeft: false,
    };
    this._mounted = false;
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handleLoadMore = this.handleLoadMore.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }

  componentDidMount() {
    this._navigationEvent = this.props.navigation.addListener('focus', () => {
      this.handleRefresh();
    });
    this._mounted = true;
    setTimeout(() => {
      this.fetchFeedbacks();
    }, 500);
  }

  componentWillUnmount() {
    this._mounted = false;
    this._navigationEvent();
  }

  async fetchFeedbacks() {
    return Utils.makeApiRequest(
      `${this.props.appData.id}?status=completed`,
      {
        page: this.state.page,
        status: 'completed',
        item_per_page: Utils.ItemsPerPage,
      },
      this.props.appData.token,
      'GET',
      'feedback',
    )
      .then(async result => {
        if (this._mounted) {
          if (result.status === false) {
            await this.setState({
              loading: false,
              refreshing: false,
              loadingMore: false,
            });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                'Oops!',
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
          } else if (result.status === true) {
            if (result.data.length == Utils.ItemsPerPage) {
              if (this.state.reset) {
                await this.setState({
                  feedbackList: result.data,
                  page: this.state.page + 1,
                  loading: false,
                  refreshing: false,
                  reset: false,
                  loadingMore: false,
                  noDataLeft: false,
                });
              } else {
                await this.setState({
                  feedbackList: [...result.data],
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
                  feedbackList: result.data,
                  loading: false,
                  refreshing: false,
                  reset: false,
                  loadingMore: false,
                  noDataLeft: true,
                });
              } else {
                await this.setState({
                  feedbackList: [...result.data],
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
              Utils.displayAlert(
                'Oops!',
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

  handleRefresh() {
    this.setState(
      {refreshing: true, page: 1, reset: true, loadingMore: false},
      () => {
        setTimeout(() => this.fetchFeedbacks(), 500);
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
        this.fetchFeedbacks();
      });
    }
  }

  handleTap(id = null) {
    if (id) {
      this.props.navigation.navigate('FeedbackDetails', {id: id});
    }
  }

  renderItem({item, index}) {
    let date = new Date(item.created);
    let month = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ][date.getMonth()];
    return (
      <TouchableOpacity
        onPress={() => this.handleTap(item.id)}
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
                <Text style={localStyle.orderDateDay}>{date.getDate()}</Text>
              </View>
              <Text style={localStyle.orderTime}>{month}</Text>
            </View>
          </View>
          <View style={localStyle.infoContainer}>
            <View>
              <Text style={localStyle.labels}></Text>
              <Text
                style={localStyle.info}
                ellipsizeMode="tail"
                numberOfLines={2}>
                {item.feedbacks}
              </Text>
            </View>
          </View>
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
              data={this.state.feedbackList}
              showsVerticalScrollIndicator={false}
              horizontal={false}
              style={localStyle.flatList}
              keyExtractor={(item, index) => item.id.toString()}
              renderItem={this.renderItem}
              ListEmptyComponent={<ListEmptyComponent />}
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
    width: '90%',
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
    marginTop: Utils.moderateScale(15, 0.5),
    marginBottom: Utils.moderateScale(15, 0.5),
  },
  button: {
    marginBottom: Utils.scale(5),
    alignSelf: 'center',
    marginTop: Utils.scale(15),
  },
  infoContainer: {
    flex: 1,
    marginLeft: Utils.scale(15),
  },
  orderDateDay: {
    fontFamily: 'Roboto-BoldCondensed',
    fontSize: Utils.moderateScale(18, 0.5),
    color: 'black',
    ...Platform.select({
      android: {
        fontWeight: '500',
      },
    }),
  },
  orderTime: {
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(12, 0.5),
    color: 'black',
  },
  info: {
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(12, 0.5),
    color: 'black',
  },
  labels: {
    fontFamily: 'Poppins-Regular',
    color: '#b1b6bb',
    letterSpacing: 1,
    fontSize: Utils.moderateScale(12),
  },
  orderDateContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainerForOrderDate: {
    borderRightWidth: 1,
    borderRightColor: '#d7d8da',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.25,
    marginLeft: 0,
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

export default connect(mapStateToProps, mapDispatchToProps)(CompletedFeedbacks);
