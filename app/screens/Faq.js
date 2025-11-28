import React, {Component} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
// import { SafeAreaView } from 'react-navigation';
import {ActionCreators} from '../actions/index';
import {connect} from 'react-redux';
import styles from './styles';
import Images from '../assets/images/index';
import LoaderView from '../components/LoaderView';
import * as Utils from '../lib/utils';
import LinearGradient from 'react-native-linear-gradient';

class AnimatedFaq extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      height: new Animated.Value(400),
    };

    this.setMinHeight = this.setMinHeight.bind(this);
    this.setMaxHeight = this.setMaxHeight.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    let initialValue = this.state.expanded
      ? this.maxHeight + this.minHeight
      : this.minHeight;
    let finalValue = this.state.expanded
      ? this.minHeight
      : this.maxHeight + this.minHeight;

    this.setState({expanded: !this.state.expanded});
    this.state.height.setValue(initialValue);
    Animated.spring(this.state.height, {
      toValue: finalValue,
      useNativeDriver: false,
    }).start();
  }

  setMinHeight(event) {
    if (!this.minHeight) {
      this.minHeight = event.nativeEvent.layout.height;
      this.setState({ height: new Animated.Value(this.minHeight) });
      // this.props.title == 'HOW DO I GIVE SPECIAL INSTRUCTIONS FOR MY CLOTHING?' ? console.log('min Height', this.minHeight) : null;
      // this.props.title == 'HOW DO I PAY?' ? console.log('min Height', this.minHeight) : null;
    }
  }

  setMaxHeight(event) {
    if (!this.maxHeight) {
      this.maxHeight = event.nativeEvent.layout.height;
      // this.props.title == 'HOW DO I GIVE SPECIAL INSTRUCTIONS FOR MY CLOTHING?' ? console.log('max Height', this.maxHeight) : null;
      // this.props.title == 'HOW DO I PAY?' ? console.log('max Height', this.maxHeight) : null;
    }
  }

  render() {
    let icon = this.state.expanded ? Images.faqMinusIcon : Images.faqPlusIcon;
    return (
      <Animated.View
        style={[
          styles.card,
          localStyle.card,
          {height: this.state.height},
          this.props.style,
        ]}>
        <TouchableOpacity
          onPress={this.toggle}
          style={localStyle.titleContainer}
          onLayout={this.setMinHeight}>
          <Image
            source={icon}
            style={[localStyle.placeholder, localStyle.image]}
            resizeMode="contain"
          />
          <Text style={localStyle.title}>{this.props.title}</Text>
        </TouchableOpacity>
        <View style={localStyle.content} onLayout={this.setMaxHeight}>
          <View style={localStyle.placeholder}></View>
          <View style={localStyle.content}>{this.props.children}</View>
        </View>
      </Animated.View>
    );
  }
}

class FaqScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      faqs: [],
      loading: true,
    };
  }

  static navigationOptions = ({navigation}) => {
    return {
      title: 'FAQS',
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

  componentDidMount() {
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });
    this.setState({
      loading: false,
      faqs: [],
      // faqs: [
      //   {
      //     id: 8,
      //     question: 'HOW DO I PAY?',
      //     answer:
      //       ' Input your credit card information. When your order is being returned, the card on file will be charged.  (All credit card information is encrypted and stored with a 3rd party secure credit card processor)',
      //   },
      //   {
      //     id: 9,
      //     question: 'IS THERE A MINIMUM ORDER?',
      //     answer:
      //       '$25 minimum.  If your items are under $25 (Laundry/Dry Cleaning combined), a surcharge will be added to the order to reach this amount.  *Laundry has a 10 pound minimum per bag',
      //   },
      //   {
      //     id: 12,
      //     question: 'WHAT AREAS DO YOU SERVICE?',
      //     answer:
      //       'We mostly service the east side of Manhattan:<br/>\r\n\r\n                  10003<br/>\r\n                  10009<br/>\r\n                  10010<br/>\r\n                  10016<br/>\r\n                  10017<br/>\r\n                  10022<br/>\r\n                  10065<br/>\r\n                  10075<br/>\r\n                  10128<br/>\r\n                  10021<br/>\r\n                  10028<br/>\r\n           \r\n\r\nWe are expanding rapidly, so create an account, and we will keep you in mind for future business!  If you are outside of these zip codes, there may be a $50-$100 minimum for pickup (Laundry/Dry Cleaning Combined).  We do not service Hotels/Air BnB.',
      //   },
      //   {
      //     id: 14,
      //     question: 'HOW DO I GIVE SPECIAL INSTRUCTIONS FOR MY CLOTHING?',
      //     answer:
      //       'Please utilize the additional preferences box while placing order.  We will do our best to accommodate and will call you if we have any issue/questions about your request.',
      //   },
      //   {
      //     id: 15,
      //     question: 'WHAT KIND OF DETERGENT IS USED?',
      //     answer:
      //       'Our standard is a mildly scented detergent.   We also offer Tide Free and Clear (unscented), Tide detergent (Scented), Downy Softener (Scented).  These can be selected under preferences for a small additional fee. ',
      //   },
      //   {
      //     id: 18,
      //     question: 'CAN I USE MY OWN DETERGENT?',
      //     answer:
      //       'Customers may provide us with their own detergent ONLY if it is in a single-use disposable container or pods. If you choose to provide your own  single-use detergent, please provide a separate bag with this.  Can be handed to driver or attached to outside of the laundry bag.   Please write these instructions in under the additional preferences box when ordering.\r\n\r\nPlease do NOT send bottles of your own detergent. We cannot be responsible for using or returning them after use.',
      //   },
      //   {
      //     id: 13,
      //     question: 'I FORGOT ABOUT MY PICKUP, AM I STILL BEING CHARGED?',
      //     answer:
      //       ' We charge a $10 fee for missed pickups. You can cancel up to 30 minutes prior to your pickup time. Try giving us a call, we can work with you.',
      //   },
      //   {
      //     id: 16,
      //     question: 'HOW DO I KNOW HOW MUCH MY ORDER IS?',
      //     answer:
      //       'Please refer to our pricing page. *Prices may be subject to change. This page shows standard item pricing.\r\n\r\nWe will provide an email and paper receipt upon return of your items. ',
      //   },
      //   {
      //     id: 20,
      //     question: 'Do you alter clothes? ',
      //     answer: 'Unfortunately we do not offer this service.',
      //   },
      //   {
      //     id: 22,
      //     question: 'Do you service Hotels or Air Bnb etc?',
      //     answer:
      //       'We do not.  We are strictly a service for residential local customers. ',
      //   },
      //   {
      //     id: 17,
      //     question: 'HOW CAN I GET ADDITIONAL DISCOUNTS? REFER A FRIEND!',
      //     answer:
      //       'Tell a friend about us!  Email their name to us after they place their first order.  We will give you a $5 discount for every new customer.  Your friend will receive $10 off their first order as well!\r\n                \r\nEmail: Support@OnTheGoCleaners.com or go to our contact us page and submit an inquiry with the information requested. ',
      //   },
      //   {
      //     id: 19,
      //     question: 'Why choose On the Go Cleaners?',
      //     answer:
      //       "On The Go Cleaners is a premier laundry and dry cleaning service provider in New York City, catering to the bustling lifestyles of residents in various neighborhoods. We specialize in offering convenient same-day laundry and efficient dry cleaning pickup and delivery services to ensure our customers' garments are well-maintained without disrupting their busy schedules.\r\nLocated in the heart of the Upper East Side, our laundry service is strategically positioned to serve the local community, providing them with a reliable and hassle-free solution for all their laundry needs. We understand the demands of urban living, and that's why we strive to offer unparalleled convenience by offering dry cleaning delivery right to our customers' doorsteps.\r\nAs one of the best dry cleaners in NYC, our commitment to excellence is reflected in the quality of our services. We handle each garment with the utmost care, utilizing advanced cleaning techniques and premium detergents to deliver exceptional results. Whether it's delicate fabrics, intricate designs, or stubborn stains, our skilled team of professionals ensures that every garment is treated with precision and attention to detail.\r\nAt On The Go Cleaners, we take pride in being a leading laundry delivery service in Murray Hill and the wider NYC area. Our fleet of dedicated drivers ensures prompt and reliable laundry pickup and delivery throughout the city. Our streamlined processes and state-of-the-art tracking system enable customers to conveniently schedule and monitor their laundry orders, giving them peace of mind and full control over their laundry routines.\r\nWe understand that busy urban dwellers often require a comprehensive laundry solution. That's why we offer a range of services, including wash and fold, dry cleaning, and laundry pickup and delivery. Our commitment to customer satisfaction drives us to continuously improve our services, ensuring that we meet and exceed the expectations of the best laundry service in NYC.\r\nDiscover the convenience and quality of On The Go Cleaners where same-day laundry, dry cleaning pickup and delivery, and exceptional service are our top priorities. Experience the ease of managing your laundry needs with just a few clicks, and let us take care of the rest.\r\nRegister with us today to join our growing community of satisfied customers who enjoy the best laundry service in NYC.\r\n",
      //   },
      //   {
      //     id: 5,
      //     question: 'HOW DOES IT WORK?',
      //     answer:
      //       "> Select the services and washing preferences for your order \r\n \r\n> Select the pickup time (for doorman buildings, items can be left with doorman).  Delivery can be scheduled with pickup driver (if no doorman).  \r\n\r\n> Leave the rest to us! We will return your items with our special 'On the Go' Laundry and Dry Cleaning bags to use for future orders.  \r\n\r\n*EXPRESS CHECKOUT option after first order!",
      //   },
      //   {
      //     id: 21,
      //     question: 'What do I put my clothes in?',
      //     answer:
      //       "Any bag can be used on your first order. It'll be returned back to you. When we return your items, we will provide you one of our 'On the Go' Cleaners Bags to use for future orders.  ",
      //   },
      //   {
      //     id: 10,
      //     question: 'WHAT IS THE TURNAROUND TIME?',
      //     answer:
      //       'Same Day Laundry return available for our first time slot of the day (please select SAME DAY for a small additional cost).  24-36 hour return for anything after.  We suggest selecting the earliest time frame to ensure the fastest turnaround time.   Dry Cleaning takes 1-3 business days.  Closed over weekends. ',
      //   },
      // ],
    });
    Utils.makeApiRequest('faq', {}, this.props.appData.token, 'GET', 'admin')
      .then(result => {
        if (result.status === false) {
          this.setState({loading: false});
          // Utils.displayAlert('', 'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com');
        } else if (result.status == true) {
          this.setState({faqs: result.data, loading: false});
        } else {
          this.setState({loading: false});
          // Utils.displayAlert('', result.msg || 'Invalid Request');
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  render() {
    const regex = /(<([^>]+)>)/gi;
    return (
      //<SafeAreaView style={ styles.container }>
      <LinearGradient colors={['#3b2eb6', '#21e381']} style={styles.container}>
        {this.state.loading ? (
          <LoaderView loading={this.state.loading} />
        ) : (
          <ScrollView
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={true}>
            {this.state.faqs.map((item, index) => {
              return (
                <AnimatedFaq key={item.id} title={item.question}>
                  <Text style={localStyle.text}>
                    {item.answer.replace(regex, '')}
                  </Text>
                </AnimatedFaq>
              );
            })}

            <View style={{marginBottom: Utils.scale(4)}} />
          </ScrollView>
        )}
      </LinearGradient>
      //</SafeAreaView>
    );
  }
}

const localStyle = StyleSheet.create({
  card: {
    width: '90%',
    alignSelf: 'center',
    marginTop: Utils.scale(8),
    overflow: 'hidden',
  },
  placeholder: {
    flex: 0.15,
  },
  image: {
    height: Utils.moderateScale(8),
    width: Utils.moderateScale(8),
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: Utils.moderateScale(15),
    marginRight: Utils.moderateScale(10),
  },
  title: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(14),
    paddingTop: Utils.moderateScale(15),
    paddingBottom: Utils.moderateScale(15),
    marginRight: Utils.moderateScale(10),
  },
  text: {
    fontFamily: 'Poppins-Regular',
    color: '#617b88',
    fontSize: Utils.moderateScale(14),
    lineHeight: Utils.moderateScale(20),
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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

export default connect(mapStateToProps, mapDispatchToProps)(FaqScreen);
