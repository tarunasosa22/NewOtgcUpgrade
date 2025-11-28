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
  SafeAreaView,
} from 'react-native';
// import {SafeAreaView} from 'react-navigation';
import {connect} from 'react-redux';
import styles from './styles';
import {ActionCreators} from '../actions/index';
import * as Utils from '../lib/utils';
import Images from '../assets/images/index';
import LoaderView from '../components/LoaderView';
import LoaderFullScreen from '../components/LoaderFullScreen';
import BlueButton from '../components/button/BlueButton';
import ListEmptyComponent from '../components/ListEmptyComponent';
import LinearGradient from 'react-native-linear-gradient';

class MyCardsScreen extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: 'MY CARDS',
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
      cardList: [],
      page: 0,
      reset: false,
      loading: true,
      refreshing: false,
      loadingMore: false,
      showOptions: false,
      optionMenuXPos: Utils.width / 2,
      optionMenuYPos: Utils.height / 2,
      activeCard: null,
      showFullScreenLoader: false,
    };
    this._mounted = false;
    this.threeDots = {};
    this.renderItem = this.renderItem.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handleLoadMore = this.handleLoadMore.bind(this);
    this.fetchCards = this.fetchCards.bind(this);
    this.setDefault = this.setDefault.bind(this);
    this.deleteCard = this.deleteCard.bind(this);
    this.handleMoreTap = this.handleMoreTap.bind(this);
    const didFocusSubscription = this.props.navigation.addListener(
      'didFocus',
      payload => {
        if (this.props.newCardAdded.added) {
          this.handleRefresh();
          this.props.toggleNewCardAdded();
        } else if (this.props.cardUpdated.updated) {
          this.handleRefresh();
          this.props.toggleCardUpdatedStatus();
        }
      },
    );
  }

  componentDidMount() {
    this._navigationEvent = this.props.navigation.addListener('focus', () => {
      this.fetchCards();
    });
    this._mounted = true;
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });
    this.fetchCards();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  fetchCards() {
    Utils.makeApiRequest(
      `cards/${this.props.appData.id}`,
      {},
      this.props.appData.token,
      'GET',
      'payment',
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
          } else if (result.status == true) {
            console.log(result, 'status: ');
            if (this.state.reset) {
              this.setState({
                cardList: result.data,
                page: this.state.page + 1,
                loading: false,
                refreshing: false,
                reset: false,
              });
            } else {
              this.setState({
                cardList: [...result.data],
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
      this.fetchCards();
    });
  }

  handleLoadMore() {
    this.setState({loadingMore: true}, () => {
      this.fetchCards();
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
        activeCard: id,
      });
    });
  }

  getCardno(card_no = null) {
    if (card_no) {
      return card_no;
    }
    return card_no;
  }

  updateDefaultCardInState(card_id = null) {
    if (card_id) {
      this.setState({
        cardList: this.state.cardList.map(card => {
          if (card.id == card_id) {
            return {...card, primary: 'yes'};
          } else if (card.primary == 'yes') {
            return {...card, primary: 'no'};
          } else {
            return card;
          }
        }),
      });
    }
  }

  deleteCardInState(card_id = null) {
    if (card_id) {
      this.setState({
        cardList: this.state.cardList.filter(card => card.id != card_id),
      });
    }
  }

  async deleteCard() {
    await this.setState({showOptions: false});
    if (this.state.activeCard) {
      let card_id = this.state.activeCard;
      Utils.displayAlert(
        '',
        'You are about to delete a card. Do you want to perform this action?',
        'CONFIRM',
        null,
        () => {
          this.setState({showFullScreenLoader: true});
          setTimeout(() => {
            Utils.makeApiRequest(
              `${card_id}`,
              {card_id: card_id},
              this.props.appData.token,
              'DELETE',
              'user-card',
            )
              .then(async result => {
                if (this._mounted) {
                  await this.setState({
                    showFullScreenLoader: false,
                    activeCard: null,
                  });
                  if (result.status === false) {
                    if (this.props.navigation.isFocused()) {
                      Utils.displayAlert(
                        '',
                        'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                      );
                    }
                  } else if (result.status) {
                    this.deleteCardInState(card_id);
                    this.handleRefresh();
                    Utils.displayAlert('', 'Your card has been deleted.');
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
    if (this.state.activeCard) {
      let card_id = this.state.activeCard;

      const cardDetails = this.state.cardList.find(item => item.id === card_id);

      Utils.displayAlert(
        '',
        'You are about to change the default card. All further payments will be made on the new card. Do you want to perform this action?',
        'CONFIRM',
        null,
        async () => {
          await Utils.makeApiRequest(
            'payment/update',
            {user_id: this.props.appData?.id, user_card_id: card_id},
            this.props.appData.token,
            'POST',
            'order',
          );
          this.setState({showFullScreenLoader: true});
          setTimeout(() => {
            Utils.makeApiRequest(
              `${card_id}/${this.props.appData.id}`,
              {primary: cardDetails.primary === 'yes' ? 'no' : 'yes'},
              this.props.appData.token,
              'POST',
              'user-card',
            )
              .then(async result => {
                if (this._mounted) {
                  await this.setState({
                    showFullScreenLoader: false,
                    activeCard: null,
                  });
                  if (result.status === false) {
                    if (this.props.navigation.isFocused()) {
                      Utils.displayAlert(
                        '',
                        'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                      );
                    }
                  } else if (result.status) {
                    this.updateDefaultCardInState(card_id);
                    Utils.displayAlert(
                      '',
                      'Your default card has been changed.',
                    );
                    this.fetchCards();
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

  renderItem({item, index}) {
    console.log(item, 'amsakmsaksmkams');
    return (
      <View
        style={[
          styles.card,
          localStyle.content,
          index == 0 &&
            Platform.OS === 'android' &&
            localStyle.firstCardAndroid,
        ]}>
        <View style={localStyle.cardType}>
          <Image source={Images.visaCardIcon} resizeMode="contain" />
        </View>
        <View style={localStyle.cardNumberContainer}>
          <Text style={localStyle.cardNumber}>
            {this.getCardno(item.card_number)}
          </Text>
          {item.primary == 'yes' && (
            <Image source={Images.checkIcon} resizeMode="contain" />
          )}
          {console.log(item.cardData, 'asnaksnak')}
          {new Date(item.cardData).getTime() < new Date().getTime() && (
            <Text
              style={{
                color: 'red',
                fontSize: 12,
                paddingLeft: Utils.moderateScale(20),
              }}>
              Expired
            </Text>
          )}
        </View>
        <TouchableOpacity
          hitSlop={{top: 15, bottom: 15, left: 0, right: 0}}
          style={localStyle.threeDotsContainer}
          onPress={() => this.handleMoreTap(item.id)}>
          <Image
            ref={v => (this.threeDots[item.id] = v)}
            source={Images.threeDotsIcon}
          />
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    let card_id = this.state.activeCard;
    const cardDetails = this.state.cardList.find(item => item.id === card_id);

    return (
      //<SafeAreaView style={ styles.container }>
      <LinearGradient colors={['#3b2eb6', '#21e381']} style={styles.container}>
        {this.state.showFullScreenLoader && (
          <LoaderFullScreen
            loading={this.state.showFullScreenLoader}
            message={this.state.message}
          />
        )}
        {this.state.showOptions && (
          <TouchableWithoutFeedback
            onPress={() =>
              this.setState({showOptions: false, activeCard: null})
            }>
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
              {cardDetails.primary === 'yes' && (
                <Image source={Images.selectIcon} />
              )}
              <Text style={localStyle.optionText}>Set as Default</Text>
            </TouchableOpacity>
            {cardDetails.primary !== 'yes' && <TouchableOpacity
              style={localStyle.optionsContainer}
              onPress={this.deleteCard}>
              <Image source={Images.deleteCardIcon} />
              <Text style={localStyle.optionText}>Delete</Text>
            </TouchableOpacity>}
          </View>
        )}
        <BlueButton
          onPress={() => this.props.navigation.navigate('AddNewCard')}
          buttonText="+ ADD NEW"
          style={localStyle.button}
        />
        {this.state.loading ? (
          <LoaderView loading={this.state.loading} />
        ) : (
          <FlatList
            data={this.state.cardList}
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
      // </SafeAreaView>
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
    color: 'black',
    fontSize: Utils.moderateScale(14),
    marginLeft: Utils.moderateScale(8),
  },
  firstCardAndroid: {
    marginTop: Utils.scale(8),
  },
  content: {
    flex: 1,
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
    paddingTop: Utils.moderateScale(15),
    paddingBottom: Utils.moderateScale(15),
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
  cardTypeIcon: {
    height: Utils.moderateScale(30, 0.5),
    width: Utils.moderateScale(30, 0.5),
  },
  cardNumberContainer: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  cardNumber: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(14),
    marginRight: Utils.moderateScale(10),
  },
  cardType: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  threeDotsContainer: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  threeDotsIcon: {
    height: Utils.moderateScale(10, 0.5),
    width: Utils.moderateScale(10, 0.5),
  },
});

const mapStateToProps = state => {
  return {
    appData: state.appData.appData,
    newCardAdded: state.appData.newCardAdded,
    cardUpdated: state.appData.cardUpdated,
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    //setPendingOrderList: data => dispatch(ActionCreators.setPendingOrderList(data)),
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
    toggleNewCardAdded: data =>
      dispatch(ActionCreators.toggleNewCardAdded(data)),
    toggleCardUpdatedStatus: data =>
      dispatch(ActionCreators.toggleCardUpdatedStatus(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MyCardsScreen);
