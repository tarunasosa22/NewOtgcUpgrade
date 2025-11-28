import React, {Component} from 'react';
import {StyleSheet, SafeAreaView, View, Text, ScrollView} from 'react-native';
// import {SafeAreaView} from 'react-navigation';
import {ActionCreators} from '../actions/index';
import {connect} from 'react-redux';
import styles from './styles';
import LoaderView from '../components/LoaderView';
import * as Utils from '../lib/utils';
import LinearGradient from 'react-native-linear-gradient';

class WashAndFoldPricingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pricing: [],
      washAndFoldPricing: [],
      loading: true,
    };
    this._mounted = false;
  }

  static navigationOptions = ({navigation}) => {
    return {
      title: 'WASH & FOLD',
    };
  };

  componentDidMount() {
    this._mounted = true;
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });
    setTimeout(() => {
      Utils.makeApiRequest(
        `pricing`,
        {category_id: 1},
        this.props.appData.token,
        'GET',
        'category',
      )
        .then(result => {
          console.log('price-details 1 ==>>> ', result);
          if (this._mounted) {
            if (result.status === false) {
              this.setState({loading: false});
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  'Oops!',
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
              }
            } else if (result.status == true) {
              this.setState({
                pricing: result.data?.priceData[0]?.productData,
                washAndFoldPricing: [result.data?.priceData[0]?.service],
                loading: false,
              });
            } else {
              this.setState({loading: false});
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert('Oops!', result.msg || 'Invalid Request');
              }
            }
          }
        })
        .catch(error => {
          console.log(error);
          throw new Error(error);
        });
    }, 500);
  }

  componentWillUnmount() {
    this._mounted = false;
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
            <ScrollView
              horizontal={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={true}>
              <View style={[styles.card, localStyle.card]}>
                <View style={localStyle.row}>
                  <Text style={[localStyle.label, localStyle.left]}>ITEM</Text>
                  <Text style={[localStyle.label, localStyle.right]}>
                    PRICE
                  </Text>
                </View>
                {this.state?.washAndFoldPricing?.map((item, index) => {
                  return (
                    <View key={index} style={localStyle.row}>
                      <Text style={[localStyle.text, localStyle.left]}>
                        Wash & Fold (per lb)
                      </Text>
                      <Text style={[localStyle.value, localStyle.right]}>
                        ${item.price.toFixed(2)}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View style={[styles.card, localStyle.card]}>
                <View style={localStyle.row}>
                  <Text style={[localStyle.label, localStyle.left]}>ITEM</Text>
                  <Text style={[localStyle.label, localStyle.right]}>
                    PRICE
                  </Text>
                </View>
                {this.state?.pricing?.map((item, index) => {
                  return (
                    <View key={index} style={localStyle.row}>
                      <Text style={[localStyle.text, localStyle.left]}>
                        {item.name}
                      </Text>
                      <Text style={[localStyle.value, localStyle.right]}>
                        ${item.price.toFixed(2)}
                      </Text>
                    </View>
                  );
                })}
                <Text style={localStyle.conditionsText}>
                  * All prices are subject to change. Certain items may require
                  additional care. Please contact us for pricing on any item not
                  listed.
                </Text>
              </View>
            </ScrollView>
          )}
        </LinearGradient>
      </SafeAreaView>
    );
  }
}

const localStyle = StyleSheet.create({
  card: {
    width: '90%',
    alignSelf: 'center',
    marginTop: Utils.scale(8),
    padding: Utils.moderateScale(15),
    marginBottom: Utils.scale(4),
  },
  conditionsText: {
    marginTop: Utils.moderateScale(8),
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(14),
    lineHeight: Utils.moderateScale(22),
  },
  left: {
    flex: 3,
  },
  right: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    color: '#657f8b',
    fontFamily: 'Poppins-Regular',
    letterSpacing: 1,
    fontSize: Utils.moderateScale(12),
    lineHeight: Utils.moderateScale(30),
  },
  text: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(14),
    lineHeight: Utils.moderateScale(30),
  },
  value: {
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(14),
    color: 'black',
    fontWeight: '500',
    lineHeight: Utils.moderateScale(30),
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
)(WashAndFoldPricingScreen);
