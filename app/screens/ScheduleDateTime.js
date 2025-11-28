import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Keyboard,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
// import { SafeAreaView } from 'react-navigation';
import { Calendar } from 'react-native-calendars';
import { connect } from 'react-redux';
import Images from '../assets/images/index';
import { ActionCreators } from '../actions/index';
import BlueButton from '../components/button/BlueButton';
import styles from './styles';
import * as Utils from '../lib/utils';
import LoaderView from '../components/LoaderView';
import RadioButtonScheduleOrder from '../components/RadioButtonScheduleOrder';
import LinearGradient from 'react-native-linear-gradient';
import moment, { weekdays } from 'moment';
import LoaderFullScreen from '../components/LoaderFullScreen';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { AppStrings } from '../utils/AppStrings';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');
dayjs.locale('en');

// import MomentTimezone from 'moment-timezone';
// import RadioButtonOrder from '../components/RadioButtonOrder';
// import {ActivityIndicator} from 'react-native-paper';
// import {DateTime} from 'luxon';

const DISABLED_DAYS = ['Saturday', 'Sunday'];
// state = {
//     markedDates: this.fetchBlockByMonth(moment().month(), moment().year(), DISABLED_DAYS)
// }
let markedDates = {
  [moment().format('YYYY-MM-DD')]: {
    dotColor: 'red',
    selected: true,
    marked: true,
  },
};

// const currentDay = moment().format('YYYY-MM-DD');
const currentDay = dayjs().format('YYYY-MM-DD');
const deliveryDate = dayjs().add(1, 'day').format('YYYY-MM-DD');

class ScheduleDateTimeScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'SCHEDULE',
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
    let markedDate = {};
    let markedDeliveryDate = {};
    let signUpData = {}
    this.dayOrder = {
      Sun: 0,
      Mon: 1,
      Tues: 2,
      Wed: 3,
      Thrus: 4,
      Fri: 5,
      Sat: 6,
    };

    (this.weekDaysName = ['Sun', 'Mon', 'Tues', 'Wed', 'Thrus', 'Fri', 'Sat']),
      // if (this.props.dateTime.delivery_pickup_date) {
      //     markedDate[this.props.dateTime.delivery_pickup_date] = { selected: true, marked: true };
      // }

      (this.state = {
        services: this.props?.servicesAndPreferences?.services,
        pickup_date: {
          delivery_pickup_date: this.props.dateTime.delivery_pickup_date,
          delivery_pickup_time_from:
            this.props.dateTime.delivery_pickup_time_from,
          delivery_pickup_time_to: this.props.dateTime.delivery_pickup_time_to,
        },
        delivery_date: {
          delivery_pickup_date: this.props.dateTime.delivery_pickup_date,
          delivery_pickup_time_from:
            this.props.dateTime.delivery_pickup_time_from,
          delivery_pickup_time_to: this.props.dateTime.delivery_pickup_time_to,
        },
        loadingPickup: false,
        loadingDelivery: false,
        loadingTimeslots: false,
        loadingDeliveryTimeslots: false,
        timeslots: this.props.dateTime.timeslots || [],
        deliveytimeslots: this.props.dateTime.timeslots || [],
        turnAroundTimes: this.props.dateTime.turnAroundTimes || [],
        turnAroundTimesLoading: false,
        selectedTurnAroundTimes: [],
        markedDate: markedDate,
        markedDeliveryDate: markedDeliveryDate,
        loadingBlockDates: true,
        loading: false,
        todaySelected: true,
        showSameDay: false,
        addressData: [],
        calenderLoading: false,
        deliveryNextDate: dayjs(),
        autoHolidaysList: [],
        sameDayPrefences: {
          category_id: 1,
          id: 14,
          name: 'Same Day Delivery',
          show_price: 'no',
          options: [
            {
              id: 5000,
              preference_id: 14,
              default_option: 'yes',
              name: 'No',
            },
            {
              id: 5001,
              preference_id: 14,
              default_option: 'no',
              name: 'Yes',
            },
          ],
          price: 5,
          isSameDay: true,
        },
      });
    this._mounted = true;
    this.blockDates = {};
    this.blockDeliveryDates = {};
    this.oldDate = null;
    this.handleSelectedDate = this.handleSelectedDate.bind(this);
    this.onSelectTime = this.onSelectTime.bind(this);
    this.navToSelectAddress = this.navToSelectAddress.bind(this);
    // this.fetchBlockByMonth = this.fetchBlockByMonth.bind(this);
    this.handleMonthChange = this.handleMonthChange.bind(this);
    this.handleDeliveryMonthChange = this.handleDeliveryMonthChange.bind(this);
    // this.fetchTurnAroundTimes = this.fetchTurnAroundTimes(this)
  }

  componentDidMount() {
    this._mounted = true;
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });
    this.fetchBlock();
    if (this.props.signUpData?.isSignUpDone) { this.fetchAddresses(); }

    this.props.navigation.addListener('focus', async () => {
      if (this.props.signUpData?.isSignUpDone) { this.fetchAddresses(); }
    });
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  checkService() {
    let service = this.state.services
    if (service.includes(AppStrings.WASH_AND_FOLD) && !service.includes(AppStrings.DRY_CLEANING_AND_WASH_PRESS)) {
      return 1;
    } else if (service.includes(AppStrings.DRY_CLEANING_AND_WASH_PRESS) && !service.includes(AppStrings.WASH_AND_FOLD)) {
      return 2;
    } else if (service.includes(AppStrings.WASH_AND_FOLD) && service.includes(AppStrings.DRY_CLEANING_AND_WASH_PRESS)) {
      return 3;
    } else {
      return null; // Handle other cases as needed
    }
  }

  fetchTimeslots(date = '', showModel = true, isDelivery = false, isBoth, isShowSameDay, time_slot_id) {
    if (date) {
      var d = new Date(date);
      var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
      return Utils.makeApiRequest(
        `day/${this.dayOrder[this.weekDaysName[dayjs.utc(date).day()]]}`,
        { pickup_date: date, current_time: time },
        this.props.appData.token,
        'GET',
        'pickup-days',
      )
        .then(result => {
          if (this._mounted) {
            if (result.status === false) {
              this.setState({ loadingTimeslots: false, loadingDeliveryTimeslots: false });
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  '',
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
              }
              return false;
            } else if (result.status == true) {
              if (isBoth) {
                this.setState({ deliveytimeslots: result.data, loadingTimeslots: false, loadingDeliveryTimeslots: false });
                this.setState({ timeslots: result.data, loadingTimeslots: false });
              } else if (isDelivery) {
                this.fetchTurnAroundTimes(this.state.pickup_date.delivery_pickup_date, date, result.data, isShowSameDay, time_slot_id)
              } else {
                this.setState({ timeslots: result.data, loadingTimeslots: false });
              }
              return true;
            } else {
              this.setState({ loadingTimeslots: false });
              if (this.props.navigation.isFocused()) {
                showModel &&
                  Utils.displayAlert('', result.msg || 'Invalid Request');
              }
              return false;
            }
          }
        })
        .catch(error => {
          console.log(error);
          throw new Error(error);
        });
    }
    return false;
  }

  fetchTimeslots1(date = '') {
    if (date) {
      var d = new Date(date);
      var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();

      return Utils.makeApiRequest(
        `day/${this.dayOrder[this.weekDaysName[dayjs.utc(date).day()]]}`,
        { pickup_date: date, current_time: time },
        this.props.appData.token,
        'GET',
        'pickup-days',
      )
        .then(result => {
          if (this._mounted) {
            if (result.status === false) {
              this.setState({ loadingTimeslots: false, loadingDeliveryTimeslots: false });
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  '',
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
              }
              return false;
            } else if (result.status == true) {
              // this.setState({timeslots: result.data, loadingTimeslots: false});
              return result.data;
            } else {
              this.setState({ loadingTimeslots: false, loadingDeliveryTimeslots: false });
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert('', result.msg || 'Invalid Request');
              }
              return false;
            }
          }
        })
        .catch(error => {
          console.log(error);
          throw new Error(error);
        });
    }
    return false;
  }

  fetchBlock() {
    this.setState({ loadingPickup: true })
    this.setState({ loadingDelivery: true })
    let _this = this;
    return Utils.makeApiRequest(
      'after-today',
      {},
      this.props.appData.token,
      'GET',
      'pickup-dates',
    )
      .then(result => {
        if (this._mounted) {
          if (result.status === false) {
            this.setState({ loadingBlockDates: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
            return false;
          } else if (result.status == true) {
            this.setState({ loadingBlockDates: false });
            this.setState({ autoHolidaysList: result.data })
            let dateResult = result.data;
            dateResult.forEach(element => {
              let date = element.pickup_date.split('T')[0];

              this.state.markedDate[date] = {
                disabled: true,
                disableTouchEvent: true,
              };

              this.state.markedDeliveryDate[date] = {
                disabled: true,
                disableTouchEvent: true,
              };
              this.blockDates[date] = { disabled: true, disableTouchEvent: true };
              this.blockDeliveryDates[date] = { disabled: true, disableTouchEvent: true };
            });
            this.oldDate = dayjs().format('YYYY-MM-DD');

            while (this.blockDates[this.oldDate]) {
              this.oldDate = dayjs(this.oldDate)
                .add(1, 'days')
                .format('YYYY-MM-DD');
            }
            const weekDay = dayjs(this.oldDate).day();

            if (weekDay === 0) {
              this.oldDate = dayjs(this.oldDate)
                .add(1, 'days')
                .format('YYYY-MM-DD');
            }
            if (weekDay === 6) {
              this.oldDate = dayjs(this.oldDate)
                .add(2, 'days')
                .format('YYYY-MM-DD');
            }

            while (this.blockDates[this.oldDate]) {
              this.oldDate = dayjs(this.oldDate)
                .add(1, 'days')
                .format('YYYY-MM-DD');
            }

            this.state.markedDate[this.oldDate] = {
              selected: true,
              marked: true,
            };

            if (this.checkService() == 1 || this.checkService() == 3) {
              let deliveryNextDate = dayjs(this.oldDate).add(1, 'day'); // Get tomorrow's date
              // Check if the next day is Saturday (6) or Sunday (0)
              if (deliveryNextDate.day() === 6) {
                deliveryNextDate = deliveryNextDate.add(2, 'day'); // If it is, add another day
              } else if (deliveryNextDate.day() === 0) {
                deliveryNextDate = deliveryNextDate.add(1, 'day');
              }

              let isDateMatching = this.isDateMatching(dateResult, deliveryNextDate)
              deliveryNextDate = isDateMatching;

              // if (this.checkService() == 1 || this.checkService() == 3) {
              //   deliveryNextDate = dayjs()
              // }
              let finalDeliveryNextDate = deliveryNextDate.format('YYYY-MM-DD')
              this.setState({ deliveryNextDate: finalDeliveryNextDate })

              this.state.markedDeliveryDate[finalDeliveryNextDate] = {
                selected: true,
                marked: true,
              };
              // if (this.checkService() == 3) {
              this.state.markedDeliveryDate[dayjs().format('YYYY-MM-DD')] = {
                disabled: true, disableTouchEvent: true
              };
              // }
              const dateData = {
                month: dayjs(deliveryNextDate).month() + 1,
                year: dayjs(deliveryNextDate).year(),
                dateString: dayjs(deliveryNextDate).format('YYYY-MM-DD'),
              };
              this.handleDeliveryMonthChange(dateData, true);
              _this.fetchTimeslots(deliveryNextDate, false, true, false).then(result => {
                if (result === false) {
                  // _this.state.pickup_date.delivery_pickup_date = '';
                  _this.state.delivery_date.delivery_pickup_date = '';
                  _this.setState({
                    loadingBlockDates: false,
                    // pickup_date: this.state.pickup_date,
                    delivery_date: this.state.delivery_date,
                  });
                } else {
                  _this.setState({ loadingBlockDates: false });
                }
              });
            }
            this.blockDates = this.state.markedDate;

            if (this.checkService() == 1 || this.checkService() == 3) {
              this.blockDeliveryDates = this.state.markedDeliveryDate;
            }

            const dateCurrent = {
              dateString: this.oldDate,
            };

            this.handleSelectedDate(dateCurrent);
            this.setState({
              pickup_date: {
                delivery_pickup_date: this.oldDate,
                delivery_pickup_time_from: '',
                delivery_pickup_time_to: '',
              },
              delivery_date: {
                delivery_pickup_date: this.oldDate,
                delivery_pickup_time_from: '',
                delivery_pickup_time_to: '',
              },
              loadingTimeslots: true,
              loadingDeliveryTimeslots: true,
              timeslots: [],
              deliveytimeslots: [],
              markedDate: this.state.markedDate,
              markedDeliveryDate: this.state.markedDeliveryDate,
            });

            _this.fetchTimeslots(this.oldDate, false, false, false).then(result => {
              if (result === false) {
                _this.state.pickup_date.delivery_pickup_date = '';
                _this.setState({
                  loadingBlockDates: false,
                  pickup_date: this.state.pickup_date,
                });
                _this.setState({ loadingPickup: false, loadingDelivery: false })
              } else {
                _this.setState({ loadingBlockDates: false });
                _this.setState({ loadingPickup: false, loadingDelivery: false })
              }
            });

            const dateData = {
              month: dayjs(this.oldDate).month() + 1,
              year: dayjs(this.oldDate).year(),
              dateString: dayjs(this.oldDate).format('YYYY-MM-DD'),
            };
            // if (this.checkService() == 1 || this.checkService() == 3) {
            //   this.handleDeliveryMonthChange(dateData);
            // }
            this.handleMonthChange(dateData);
            return true;
          } else {
            this.setState({ loadingBlockDates: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert('', result.msg || 'Invalid Request');
            }
            return false;
          }
        }
      })
      .catch(err => {
        console.log(err);
        throw new Error(err);
      });
  }

  isDateMatching(array, dateToCheck) {
    let isNextDay = dateToCheck
    let isCheck = array.some(item => item?.pickup_date.split('T')[0] === isNextDay?.format('YYYY-MM-DD'))
    if (isCheck) {
      return this.isDateMatching(array, dateToCheck.add(1, 'day'))
    } else {
      return isNextDay
    }
    // return array.some(item => item?.pickup_date.split('T')[0] === dateToCheck);
  }

  // fetchBlockByMonth(
  //   month = {
  //     month: new Date().getMonth() + 1,
  //     year: new Date().getFullYear(),
  //     dateString: '',
  //   },
  // ) {
  //   var d = month.dateString !== '' ? new Date(month.dateString) : new Date();
  //   var getTot = this.daysInMonth(d.getMonth() + 1, d.getFullYear());
  //   var sat = [];
  //   var sun = [];

  //   for (var i = 0; i <= getTot; i++) {
  //     var newDate = new Date(d.getFullYear(), d.getMonth(), i);
  //     if (newDate.getDay() == 0) {
  //       // this.setState({ loadingCalendar: true });
  //       var countLength = this.digits_count(i);
  //       var countLengthm = this.digits_count(month.month);
  //       if (countLength < 2) {
  //         if (countLengthm < 2) {
  //           sun.push({ date: month.year + '-0' + month.month + '-0' + i });
  //         } else {
  //           sun.push({ date: month.year + '-' + month.month + '-0' + i });
  //         }
  //       } else {
  //         if (countLengthm < 2) {
  //           sun.push({ date: month.year + '-0' + month.month + '-' + i });
  //         } else {
  //           sun.push({ date: month.year + '-' + month.month + '-' + i });
  //         }
  //       }
  //     }

  //     if (newDate.getDay() == 6) {
  //       // this.setState({ loadingCalendar: true });
  //       var countLength = this.digits_count(i);
  //       var countLengthm = this.digits_count(month.month);
  //       if (countLength < 2) {
  //         if (countLengthm < 2) {
  //           sat.push({ date: month.year + '-0' + month.month + '-0' + i });
  //         } else {
  //           sat.push({ date: month.year + '-' + month.month + '-0' + i });
  //         }
  //       } else {
  //         if (countLengthm < 2) {
  //           sat.push({ date: month.year + '-0' + month.month + '-' + i });
  //         } else {
  //           sat.push({ date: month.year + '-' + month.month + '-' + i });
  //         }
  //       }
  //     }
  //   }
  //   var resultSat = '';
  //   this.fetchTimeslots1(sat[0]).then(result => {
  //     if (result === false) {
  //     } else {
  //       resultSat = result;
  //       if (resultSat.length == 0) {
  //         sat.forEach(element => {
  //           let date = element.date;
  //           this.state.markedDate[date] = {
  //             disabled: true,
  //             disableTouchEvent: true,
  //           };
  //           this.blockDates[date] = { disabled: true, disableTouchEvent: true };
  //         });
  //         this.setState({ markedDate: this.blockDates });
  //       }
  //     }
  //   });

  //   this.fetchTimeslots1(sun[0]).then(result => {
  //     if (result === false) {
  //     } else {
  //       resultSat = result;
  //       if (resultSat.length == 0) {
  //         sun.forEach(element => {
  //           let date = element.date;
  //           this.state.markedDate[date] = {
  //             disabled: true,
  //             disableTouchEvent: true,
  //           };
  //           this.blockDates[date] = { disabled: true, disableTouchEvent: true };
  //         });
  //         this.setState({ markedDate: this.blockDates });
  //       }
  //     }
  //   });

  //   //     sun.forEach(element => {
  //   //         let date = element.date;
  //   //         this.state.markedDate[ date ] = { "disabled": true, "disableTouchEvent": true };
  //   //         this.blockDates[ date ] = { "disabled": true, "disableTouchEvent": true };
  //   //     });
  //   //     this.oldDate3 = month.dateString.toString("yyy-mm-dd");
  //   //    // this.state.markedDate[ this.oldDate3 ] = { "selected": true, "marked": true };
  //   //     this.setState({ data: { delivery_pickup_date: this.oldDate3, delivery_pickup_time_from: '', delivery_pickup_time_to: '' }, loadingTimeslots: true, timeslots: [], markedDate: this.state.markedDate });
  //   //     this.fetchTimeslots(this.oldDate3)
  //   //         .then(result => {
  //   //             if (result === false) {
  //   //                 this.state.data.delivery_pickup_date = '';
  //   //                 this.setState({ loadingBlockDates: false, data: this.state.data });
  //   //             } else {
  //   //                 this.setState({ loadingBlockDates: false });
  //   //             }
  //   //         });
  //   // }
  //   // this.setState({ loadingCalendar: false });
  // }
  digits_count(n) {
    var count = 0;
    if (n >= 1) ++count;

    while (n / 10 >= 1) {
      n /= 10;
      ++count;
    }

    return count;
  }
  daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  fetchAddresses() {
    Utils.makeApiRequest(
      `user/${this.props?.appData?.id}`,
      {},
      this.props?.appData?.token,
      'GET',
      'user-address',
    )
      .then(result => {
        if (this._mounted) {
          if (result.status === false) {
            this.setState({ loading: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
          } else if (result.status === true) {
            const resultData = result.data;
            this.setState({ addressData: resultData });
          } else {
            this.setState({ loading: false });
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

  datesDifferByMonthOrYear = (dateStr1, dateStr2) => {
    const [year1, month1, day1] = dateStr1.split('-').map(Number);
    const [year2, month2, day2] = dateStr2.split('-').map(Number);

    return month1 !== month2 || year1 !== year2;
  };

  handleSelectedDate(day) {
    this.setState({ calenderLoading: true })
    let previous_date = this.state.deliveryNextDate
    if (!this.state.loadingTimeslots) {
      this.state.markedDate = {};
      this.state.markedDate = JSON.parse(JSON.stringify(this.blockDates));
      // const filteredData =
      if (day.dateString !== this.oldDate) {
        this.state.markedDate[this.oldDate] = { selected: false, marked: false };
      }
      this.state.markedDate[day.dateString] = { selected: true, marked: true };
      this.setState({
        todaySelected: false,
        pickup_date: {
          delivery_pickup_date: day.dateString,
          delivery_pickup_time_from: '',
          delivery_pickup_time_to: '',
        },
        loadingTimeslots: true,
        loadingDeliveryTimeslots: true,
        timeslots: [],
        markedDate: this.state.markedDate,
        turnAroundTimes: [],
        selectedTurnAroundTimes: [],
        turnAroundTimesLoading: false,
      });

      if (this.checkService() == 1 || this.checkService() == 3) {
        let deliveryNextDate = dayjs(day.dateString).add(1, 'day');
        if (deliveryNextDate.day() === 6) {
          deliveryNextDate = deliveryNextDate.add(2, 'day');
        } else if (deliveryNextDate.day() === 0) {
          deliveryNextDate = deliveryNextDate.add(1, 'day');
        }
        let isDateMatching = this.isDateMatching(this.state.autoHolidaysList, deliveryNextDate)
        deliveryNextDate = isDateMatching;

        // if (this.checkService() == 1 || this.checkService() == 3) {
        //   deliveryNextDate = dayjs(day.dateString)
        // }
        let finalDeliveryNextDate = deliveryNextDate.format('YYYY-MM-DD')
        if (this.datesDifferByMonthOrYear(this.state.pickup_date.delivery_pickup_date, finalDeliveryNextDate)) {
          let month = {
            dateString: finalDeliveryNextDate,
            day: Number(deliveryNextDate.format('DD')),
            month: Number(deliveryNextDate.format('MM')),
            timestamp: dayjs(deliveryNextDate, 'DD-MM-YYYY').valueOf(),
            year: Number(deliveryNextDate.format('YYYY'))
          }
          this.setState({ loadingDelivery: true })
          this.handleDeliveryMonthChange(month)
        } else {
        }

        this.setState({ deliveryNextDate: finalDeliveryNextDate })

        const filteredKeys = Object.keys(this.state.markedDeliveryDate)?.filter(dateKey => {
          const date = dayjs(dateKey.toString())
          if ((this.state.markedDeliveryDate[dateKey].selected && this.state.markedDeliveryDate[dateKey].marked) && date !== deliveryNextDate) {
            return date > deliveryNextDate || date < deliveryNextDate;
          }
          return false
        });
        let tempDelteDate = []

        filteredKeys.forEach(dateKey => {
          this.state.markedDeliveryDate[dateKey] = {
            disabled: true,
            disableTouchEvent: true
          };
        });

        const filteredDisbleKeys = Object.keys(this.state.markedDeliveryDate).map(dateKey => {
          const date = dayjs(dateKey.toString())
          const dayOfWeek = date.day();
          if (this.state.markedDeliveryDate[dateKey]?.disabled && this.state.markedDeliveryDate[dateKey]?.disableTouchEvent && date > deliveryNextDate && dayOfWeek !== 6 && dayOfWeek !== 0) {
            tempDelteDate.push(dateKey)
          }
        });

        tempDelteDate.forEach(dateKey => {
          let isExitHoliday = this.state.autoHolidaysList?.some(item => item?.pickup_date.split('T')[0] === dateKey)
          if (!isExitHoliday || !this.state.autoHolidaysList) {
            delete this.state.markedDeliveryDate[dateKey];
          }
        });
        this.handleSelectedDeliveryDate({ dateString: finalDeliveryNextDate }, false)

      }
      if (this.checkService() == 2) {
        setTimeout(() => {
          if (this.scrollView) {
            this.scrollView.scrollToEnd({ animated: true });
          }
        }, 100);
      }
      this.fetchTimeslots(day.dateString, null, false, false).then(result => {
        if (result.status === true) {
          this.state.pickup_date.delivery_pickup_date = '';
          this.setState({ pickup_date: this.state.pickup_date, markedDate: this.blockDates });
          this.setState({ loadingPickup: false, loadingDelivery: false })
        }
      });
      this.setState({ loadingPickup: false, loadingDelivery: false })
    }
  }

  // handleSelectedDeliveryDate(day, isShowSameDay, time_slot_id) {

  //   if (!this.state.loadingDeliveryTimeslots || this.state.loadingTimeslots) {
  //     this.state.markedDeliveryDate = {};
  //     if (this.state.showSameDay) {
  //       delete this.blockDeliveryDates[this.state.pickup_date.delivery_pickup_date]
  //     }

  //     const filteredDisbleKeys = Object.keys(this.blockDeliveryDates).map(dateKey => {
  //       if (this.blockDeliveryDates[dateKey]?.selected && this.blockDeliveryDates[dateKey]?.marked) {
  //         delete this.blockDeliveryDates[dateKey]
  //       }
  //     });

  //     this.state.markedDeliveryDate = JSON.parse(JSON.stringify(this.blockDeliveryDates));

  //     this.state.markedDeliveryDate[day.dateString] = { selected: true, marked: true };
  //     this.setState({
  //       todaySelected: false,
  //       delivery_date: {
  //         delivery_pickup_date: day.dateString,
  //         delivery_pickup_time_from: '',
  //         delivery_pickup_time_to: '',
  //       },
  //       loadingDeliveryTimeslots: true,
  //       deliveytimeslots: [],
  //       markedDeliveryDate: this.state.markedDeliveryDate,
  //       turnAroundTimes: [],
  //       selectedTurnAroundTimes: [],
  //       turnAroundTimesLoading: false,
  //     });
  //     this.fetchTimeslots(day.dateString, null, true, false, isShowSameDay, time_slot_id).then(result => {
  //       if (result === true) {
  //         this.setState({
  //           delivery_date: {
  //             delivery_pickup_date: day.dateString,
  //             delivery_pickup_time_from: '',
  //             delivery_pickup_time_to: '',
  //           },
  //         })
  //         // console.log('ARRAYY-->', this.blockDeliveryDates)
  //         // this.state.delivery_date.delivery_pickup_date = '';
  //         // this.setState({ markedDeliveryDatArray: this.blockDeliveryDates });
  //       }
  //     });
  //   }

  // }

  handleSelectedDeliveryDate(day, isShowSameDay, time_slot_id) {
    if (!this.state.loadingDeliveryTimeslots || this.state.loadingTimeslots) {
      this.state.markedDeliveryDate = {};
      if (this.state.showSameDay) {
        delete this.blockDeliveryDates[this.state.pickup_date.delivery_pickup_date];
      }
      if (day.dateString !== this.state.pickup_date.delivery_pickup_date) {
        this.blockDeliveryDates[this.state.pickup_date.delivery_pickup_date] = {
          disabled: true,
          disableTouchEvent: true
        };
      } else {
        delete this.blockDeliveryDates[this.state.pickup_date.delivery_pickup_date];
      }
      this.state.markedDeliveryDate = { ...this.blockDeliveryDates };
      this.state.markedDeliveryDate[day.dateString] = {
        selected: true,
        marked: true
      };
      this.setState({
        todaySelected: false,
        delivery_date: {
          delivery_pickup_date: day.dateString,
          delivery_pickup_time_from: '',
          delivery_pickup_time_to: ''
        },
        loadingDeliveryTimeslots: true,
        deliveytimeslots: [],
        markedDeliveryDate: this.state.markedDeliveryDate,
        turnAroundTimes: [],
        selectedTurnAroundTimes: [],
        turnAroundTimesLoading: false
      });

      this.fetchTimeslots(day.dateString, null, true, false, isShowSameDay, time_slot_id).then(result => {
        if (result === true) {
          this.setState({
            delivery_date: {
              delivery_pickup_date: day.dateString,
              delivery_pickup_time_from: '',
              delivery_pickup_time_to: ''
            }
          });
        }
      });
    }
  }

  isCheckHolidays(dateToCheck) {
    let isNextDay = dateToCheck
    let isCheck = this.state.autoHolidaysList.some(item => item?.pickup_date.split('T')[0] === isNextDay.add(1, 'day')?.format('YYYY-MM-DD'))
    if (isCheck) {
      return this.isCheckHolidays(dateToCheck.add(1, 'day'))
    } else {
      return isNextDay
    }
  }

  fetchTurnAroundTimes(pickup_date, delivery_date, deliverySlot, isShowSameDay, time_slot_id) {
    this.setState({ loadingDeliveryTimeslots: true })
    Utils.makeApiRequest(
      'turn-around-time',
      {},
      this.props.appData.token,
      'GET',
      'admin',
    )
      .then(result => {
        if (this._mounted) {
          if (result.status !== false) {
            let temp_pickup_date = this.isCheckHolidays(dayjs(pickup_date));

            const temp_delivery_date = dayjs(delivery_date);
            // const differenceInDays = date2.diff(date1, 'day');
            let differenceInDays = 0;

            // Iterate through each day between start and end dates
            for (let date = temp_pickup_date; date.isBefore(temp_delivery_date) || date.isSame(temp_delivery_date); date = date.add(1, 'day')) {
              // Check if the day is not Saturday (6) or Sunday (0)
              if (date.day() !== 6 && date.day() !== 0) {
                differenceInDays++; // Increment count for weekdays
              }
            }
            // if (result?.data) {
            const filteredItems = result?.data?.filter(item => item.day === differenceInDays - 1);

            // let finalDeliverySlot = { ...deliverySlot, days: filteredItems[0]?.day, cost: filteredItems[0]?.cost }
            if (result?.data) {
              const updatedData = Object.values(deliverySlot).map(item => ({
                ...item,
                days: filteredItems[0] ? filteredItems[0].day : undefined,
                cost: filteredItems[0] ? filteredItems[0].cost : undefined,
                diff: differenceInDays - 1
              }));
              if (isShowSameDay) {
                let data = updatedData.filter((item) => item.delivery_day === "SameDay" && item.id == time_slot_id)
                this.setState({ deliveytimeslots: data, loadingDeliveryTimeslots: false });
              } else {
                if (this.state.pickup_date.delivery_pickup_time_from !== '' && this.state.pickup_date.delivery_pickup_time_to !== '')
                  updatedData?.map((item) => {
                    const currentDate = moment();
                    const pickupStartTime = moment(`${currentDate.format('YYYY-MM-DD')} ${this.state.pickup_date.delivery_pickup_time_from}`, 'YYYY-MM-DD h:mm A');
                    const pickupEndTime = moment(`${currentDate.format('YYYY-MM-DD')} ${this.state.pickup_date.delivery_pickup_time_to}`, 'YYYY-MM-DD h:mm A');
                    const deliveryStartTime = moment(`${currentDate.format('YYYY-MM-DD')} ${item.from_slot}`, 'YYYY-MM-DD h:mm A');
                    const deliveryEndTime = moment(`${currentDate.format('YYYY-MM-DD')} ${item.to_slot}`, 'YYYY-MM-DD h:mm A');
                    const count = this.countHolidaysBetweenDates(pickup_date, delivery_date, this.state.autoHolidaysList);

                    if (item.diff <= (1 + count)) {
                      if (deliveryStartTime !== '' && (deliveryStartTime.isBefore(pickupStartTime))) {

                        if ((deliveryStartTime.isAfter(pickupStartTime) && deliveryStartTime.isBefore(pickupEndTime))) {
                          if ((deliveryEndTime.isAfter(pickupEndTime))) {
                            item.status = 'active';
                          } else {
                            item.status = 'inactive';
                          }
                        }
                        item.status = 'inactive';
                      } else {
                        item.status = 'active';
                      }
                    }
                  })
                this.setState({ deliveytimeslots: updatedData, loadingDeliveryTimeslots: false });
              }
            } else {
              this.setState({ deliveytimeslots: [], loadingDeliveryTimeslots: false });
            }

          } else {
            this.setState({ loadingDeliveryTimeslots: false })
          }
        } else {
          this.setState({ loadingDeliveryTimeslots: false })
        }
      })
      .catch(err => {
        this.setState({
          turnAroundTimesLoading: false,
        });
        throw new Error(err);
      });
  }

  fetchSelectedTurnAroundTimes(time_slot_id) {
    this.setState({
      turnAroundTimesLoading: true,
    });
    Utils.makeApiRequest(
      'turn-times',
      { slot_id: time_slot_id },
      this.props.appData.token,
      'GET',
      'pickup-dates',
    )
      .then(result => {
        if (this._mounted) {
          if (result.status !== false) {
            let { result: turnAroundTimes } = result;
            this.setState({
              turnAroundTimes,
              turnAroundTimesLoading: false,
            });
          } else {
            this.setState({
              turnAroundTimesLoading: false,
            });
          }
        } else {
          this.setState({
            turnAroundTimesLoading: false,
          });
        }
      })
      .catch(err => {
        this.setState({
          turnAroundTimesLoading: false,
        });
        throw new Error(err);
      });
  }

  onSelectTime(turn_around, from, to, delivery_day, time_slot_id, isDeliveryData) {
    const sameDayPreferences = this.fetchSameDayPreferences();
    if (isDeliveryData) {
      if (this.state.pickup_date.delivery_pickup_time_from != '' && this.state.pickup_date.delivery_pickup_time_to != '') {
        this.state.deliveytimeslots.map((item) => {
          const currentDate = moment();
          const pickupStartTime = moment(`${currentDate.format('YYYY-MM-DD')} ${this.state.pickup_date.delivery_pickup_time_from}`, 'YYYY-MM-DD h:mm A');
          const pickupEndTime = moment(`${currentDate.format('YYYY-MM-DD')} ${this.state.pickup_date.delivery_pickup_time_to}`, 'YYYY-MM-DD h:mm A');
          const deliveryStartTime = moment(`${currentDate.format('YYYY-MM-DD')} ${item.from_slot}`, 'YYYY-MM-DD h:mm A');
          const deliveryEndTime = moment(`${currentDate.format('YYYY-MM-DD')} ${item.to_slot}`, 'YYYY-MM-DD h:mm A');
          if (item.diff <= 1) {
            if (deliveryStartTime !== '' && (deliveryStartTime.isBefore(pickupStartTime))) {
              if ((deliveryStartTime.isAfter(pickupStartTime) && deliveryStartTime.isBefore(pickupEndTime))) {
                if ((deliveryEndTime.isAfter(pickupEndTime))) {
                  item.status = 'active';
                } else {
                  item.status = 'inactive';
                }
              }
              item.status = 'inactive';
            } else {
              item.status = 'active';
            }
          }
        })
      }
      this.state.delivery_date.delivery_pickup_time_from = from;
      this.state.delivery_date.delivery_pickup_time_to = to;
    } else {

      this.state.deliveytimeslots.map((item) => {
        const currentDate = moment();
        const pickupStartTime = moment(`${currentDate.format('YYYY-MM-DD')} ${from}`, 'YYYY-MM-DD h:mm A');
        const pickupEndTime = moment(`${currentDate.format('YYYY-MM-DD')} ${to}`, 'YYYY-MM-DD h:mm A');
        const deliveryStartTime = moment(`${currentDate.format('YYYY-MM-DD')} ${item.from_slot}`, 'YYYY-MM-DD h:mm A');
        const deliveryEndTime = moment(`${currentDate.format('YYYY-MM-DD')} ${item.to_slot}`, 'YYYY-MM-DD h:mm A');
        const count = this.countHolidaysBetweenDates(this.state.pickup_date.delivery_pickup_date, this.state.delivery_date.delivery_pickup_date, this.state.autoHolidaysList);
        if (item.diff <= (1 + count) && delivery_day !== 'SameDay') {
          if (deliveryStartTime !== '' && (deliveryStartTime.isBefore(pickupStartTime))) {

            if ((deliveryStartTime.isAfter(pickupStartTime) && deliveryStartTime.isBefore(pickupEndTime))) {
              if ((deliveryEndTime.isAfter(pickupEndTime))) {
                item.status = 'active';
              } else {
                item.status = 'inactive';
              }
            }
            item.status = 'inactive';
          } else {
            item.status = 'active';
          }
        }
      })
      let isCheck = this.state.deliveytimeslots.some(item => item.from_slot === this.state.delivery_date.delivery_pickup_time_from && item.to_slot === this.state.delivery_date.delivery_pickup_time_to && item.status == 'inactive')

      if (isCheck) {
        this.state.delivery_date.delivery_pickup_time_from = '';
        this.state.delivery_date.delivery_pickup_time_to = '';
      }
      this.state.pickup_date.delivery_pickup_time_from = from;
      this.state.pickup_date.delivery_pickup_time_to = to;


      if ((delivery_day === 'SameDay' || this.state.pickup_date.delivery_pickup_date == this.state.delivery_date.delivery_pickup_date) && (this.checkService() == 3 || this.checkService() == 1)) {
        let deliveryNextDate = '';
        if (delivery_day === 'SameDay') {
          this.setState({ showSameDay: true, loadingDelivery: true })
          deliveryNextDate = dayjs(this.state.pickup_date.delivery_pickup_date);
        } else {
          this.setState({ showSameDay: false, loadingDelivery: true })
          deliveryNextDate = dayjs(this.state.pickup_date.delivery_pickup_date).add(1, 'day');
          if (deliveryNextDate.day() === 6) {
            deliveryNextDate = deliveryNextDate.add(2, 'day');
          } else if (deliveryNextDate.day() === 0) {
            deliveryNextDate = deliveryNextDate.add(1, 'day');
          }
          let isDateMatching = this.isDateMatching(this.state.autoHolidaysList, deliveryNextDate)
          deliveryNextDate = isDateMatching;
        }

        let finalDeliveryNextDate = deliveryNextDate.format('YYYY-MM-DD')

        this.setState({ deliveryNextDate: finalDeliveryNextDate })
        const filteredKeys = Object.keys(this.state.markedDeliveryDate)?.filter(dateKey => {
          const date = dayjs(dateKey.toString())
          if ((this.state.markedDeliveryDate[dateKey].selected && this.state.markedDeliveryDate[dateKey].marked) && date !== deliveryNextDate) {
            return date > deliveryNextDate || date < deliveryNextDate;
          }
          return false
        });
        let tempDelteDate = []

        filteredKeys.forEach(dateKey => {
          this.state.markedDeliveryDate[dateKey] = {
            disabled: true,
            disableTouchEvent: true
          };
        });

        const filteredDisbleKeys = Object.keys(this.state.markedDeliveryDate).map(dateKey => {
          const date = dayjs(dateKey.toString())
          const dayOfWeek = date.day();
          if (this.state.markedDeliveryDate[dateKey]?.disabled && this.state.markedDeliveryDate[dateKey]?.disableTouchEvent && date > deliveryNextDate && dayOfWeek !== 6 && dayOfWeek !== 0) {
            tempDelteDate.push(dateKey)
          }
        });

        tempDelteDate.forEach(dateKey => {
          let isExitHoliday = this.state.autoHolidaysList?.some(item => item?.pickup_date.split('T')[0] === dateKey)
          if (!isExitHoliday || !this.state.autoHolidaysList) {
            delete this.state.markedDeliveryDate[dateKey];
          }
        });
        this.setState({ loadingDelivery: false })
        this.handleSelectedDeliveryDate({ dateString: finalDeliveryNextDate }, delivery_day === 'SameDay', time_slot_id)
      } else {
        this.setState({ loadingDelivery: false })
        this.blockDeliveryDates[this.state.pickup_date.delivery_pickup_date] = { disabled: true, disableTouchEvent: true }
      }

      if (this.checkService() == 1 || this.checkService() == 3) {
        setTimeout(() => {
          if (this.scrollView) {
            this.scrollView.scrollTo({ y: this.checkService() == 3 ? 700 : 800, animated: true });
          }
          // this.scrollView.scrollToEnd({ animated: true });
        }, 500);
      }
    }

    this.setState({ delivery_day: this.state.delivery_date });
    if (turn_around) {
      this.setState({
        turnAroundTimes: turn_around?.map(turnTime => {
          return turnTime.turn_time;
        }),
        turnAroundTimesLoading: false,
        deliveryDay: delivery_day,
      });
    } else {
      this.setState({
        turnAroundTimes: [],
        turnAroundTimesLoading: false,
      });
    }
    // this.fetchSelectedTurnAroundTimes(time_slot_id);

    // if (delivery_day === 'SameDay' && sameDayPreferences) {
    //   this.setState({showSameDay: true});

    //   setTimeout(() => {
    //     this.scrollView.scrollToEnd({animated: true});
    //   }, 500);
    // } else {
    //   this.setState({showSameDay: false});
    // }
  }

  countHolidaysBetweenDates(pickupDate, deliveryDate, holidays) {
    // Convert dates to Date objects for comparison
    const pickup = new Date(pickupDate);
    const delivery = new Date(deliveryDate);
    let holidayCount = 0;

    holidays.forEach(holiday => {
      const holidayDate = new Date(holiday.pickup_date.split('T')[0]);
      if (holidayDate >= pickup && holidayDate <= delivery) {
        holidayCount++;
      }
    });

    return holidayCount;
  }

  updateSelectedPreference(id, value, category_id) {
    let list = this.fetchSameDayPreferences();
    let selected_option =
      list?.options[0].id == value
        ? list?.options[0].name
        : list?.options[1].name;
    const data = {
      preference_id: id,
      category_id: category_id,
      preference_amount: list?.price,
      preference_name: list?.name,
      option1: list?.options[0].name,
      option2: list?.options[1].name,
      selected_option: selected_option,
    };
    if (selected_option === 'Yes' && this.state.showSameDay) {
      this.props.setScheduleOrderDataServicesAndPreferences({
        ...this.props.servicesAndPreferences,
        preferences: [...this.props.servicesAndPreferences?.preferences, data],
      });
    } else {
      const removedData =
        this.props.servicesAndPreferences?.preferences?.filter(
          pref => pref.preference_id !== 14,
        );
      this.props.setScheduleOrderDataServicesAndPreferences({
        ...this.props.servicesAndPreferences,
        preferences: removedData,
      });
    }
  }
  navToSelectAddress() {
    if (this.checkService() == 1 || this.checkService() == 3) {
      if (this.state.pickup_date.delivery_pickup_date == '' || this.state.delivery_date.delivery_pickup_date == '') {
        Utils.displayAlert('', 'Please select date and timeslot to continue!!!');
      } else if (
        this.state.pickup_date.delivery_pickup_time_from == '' ||
        this.state.pickup_date.delivery_pickup_time_to == '' ||
        this.state.delivery_date.delivery_pickup_time_from == '' ||
        this.state.pickup_date.delivery_pickup_time_to == ''
      ) {
        Utils.displayAlert('', 'Please select timeslot to continue!!!');
      } else {
        this.props.setScheduleOrderDataDateTime({
          ...this.state.pickup_date,
          deliveryData: this.state.delivery_date,
          timeslots: this.state.timeslots,
          deliveryDay: this.state.deliveryDay,
          selectedTurnAroundTimes: this.state.selectedTurnAroundTimes,
        });
        // if (!this.state.showSameDay) {
        //   const removedData =
        //     this.props.servicesAndPreferences?.preferences?.filter(
        //       pref => pref.preference_id !== 14,
        //     );
        //   this.props.setScheduleOrderDataServicesAndPreferences({
        //     ...this.props.servicesAndPreferences,
        //     preferences: removedData,
        //   });
        // }
        this.props.navigation.navigate('ScheduleAddress');
      }
    } else {

      if (this.state.pickup_date.delivery_pickup_date == '') {
        Utils.displayAlert('', 'Please select date and timeslot to continue!!!');
      } else if (
        this.state.pickup_date.delivery_pickup_time_from == '' ||
        this.state.pickup_date.delivery_pickup_time_to == ''
      ) {
        Utils.displayAlert('', 'Please select timeslot to continue!!!');
      } else {
        this.props.setScheduleOrderDataDateTime({
          ...this.state.pickup_date,
          timeslots: this.state.timeslots,
          deliveryDay: this.state.deliveryDay,
          selectedTurnAroundTimes: this.state.selectedTurnAroundTimes,
        });
        this.props.navigation.navigate('ScheduleAddress');
      }
    }

  }
  getCurrentMonthYear = () => {
    const currentDate = new Date();
    return {
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    };
  };

  getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  disableWeekends = (month, year, dayString, isDayPress) => {
    const currentDate = moment(new Date()).format('YYYY-MM-DD');
    const daysCount = this.getDaysInMonth(month, year);
    const sat = [];
    const sun = [];

    for (let i = 1; i <= daysCount; i++) {
      const day = new Date(year, month - 1, i).getDay();
      if (day === 0 || day === 6) { // 0 for Sunday, 6 for Saturday
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        sun.push({ dateStr });
      }
    }

    var resultSat = '';
    this.fetchTimeslots1(sun[0]).then(result => {
      if (result === false) {
      } else {
        resultSat = result;
        if (resultSat.length == 0) {
          sun.forEach(element => {
            let date = element.dateStr;
            this.state.markedDate[date] = {
              disabled: true,
              disableTouchEvent: true,
            };
            this.blockDates[date] = { disabled: true, disableTouchEvent: true };
          });
          const includesTargetDate = sun.some(dateObj => dateObj.dateStr == dayString.toString());

          if (isDayPress) {
            if (!includesTargetDate) {
              const filteredDatesObject = Object.fromEntries(
                Object.entries(this.blockDates).filter(
                  ([date, properties]) => !(properties.selected && properties.marked)
                )
              );
              this.blockDates = filteredDatesObject
              this.blockDates[dayString] =
                { selected: true, marked: true };
            } else {
            }
          }
          this.setState({ calenderLoading: false, loadingPickup: false })
          this.setState({ markedDate: this.blockDates });
        }
      }
    });
  };

  disableDeliveryWeekends = (month, year, dayString, isDayPress) => {
    const currentDate = moment(new Date()).format('YYYY-MM-DD');
    const daysCount = this.getDaysInMonth(month, year);
    const sat = [];
    const sun = [];

    for (let i = 1; i <= daysCount; i++) {
      const day = new Date(year, month - 1, i).getDay();
      if (day === 0 || day === 6) { // 0 for Sunday, 6 for Saturday
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        sun.push({ dateStr });
      }
      sun.push({ currentDate })
    }

    var resultSat = '';
    this.fetchTimeslots1(sun[0]).then(result => {
      if (result === false) {
      } else {
        resultSat = result;
        if (resultSat.length == 0) {
          sun.forEach(element => {
            let date = element.dateStr;
            this.state.markedDeliveryDate[date] = {
              disabled: true,
              disableTouchEvent: true,
            };
            this.blockDeliveryDates[date] = { disabled: true, disableTouchEvent: true };
          });
          const includesTargetDate = sun.some(dateObj => dateObj.dateStr == dayString.toString());
          if (isDayPress) {
            if (!includesTargetDate) {
              const filteredDatesObject = Object.fromEntries(
                Object.entries(this.blockDeliveryDates).filter(
                  ([date, properties]) => !(properties.selected && properties.marked)
                )
              );
              this.blockDeliveryDates = filteredDatesObject
              this.blockDeliveryDates[dayString] =
                { selected: true, marked: true };
            } else {
            }
          } else {
            this.blockDeliveryDates[this.state.delivery_date.delivery_pickup_date] = {
              selected: true,
              marked: true
            };
          }
          this.setState({ markedDeliveryDate: this.blockDeliveryDates, loadingDelivery: false });
        }
      }
    });
  };

  handleMonthChange = (newMonth, isDayPress) => {
    this.setState({ loadingPickup: true })
    this.setState({ calenderLoading: true })
    this.disableWeekends(newMonth.month, newMonth.year, newMonth.dateString, isDayPress);
  };
  handleDeliveryMonthChange = (newMonth, isDayPress, isMonthChange) => {
    this.setState({ loadingDelivery: true })
    this.disableDeliveryWeekends(newMonth.month, newMonth.year, newMonth.dateString, isDayPress);
  };

  isPickupComplete = () => {
    return (
      this.state.pickup_date.delivery_pickup_date !== '' &&
      this.state.pickup_date.delivery_pickup_time_from !== '' &&
      this.state.pickup_date.delivery_pickup_time_to !== ''
    );
  };

  renderTimeslots() {
    if (this.state.pickup_date.delivery_pickup_date == '') {
      return <View />;
    }
    let isClosed = this.state.timeslots.every(item => item.off !== 'yes');

    if (!this.state.loadingTimeslots) {
      if (isClosed || this.state.timeslots.length >= 1) {
        return (
          <RadioButtonScheduleOrder
            data={this.state.timeslots}
            selectedFrom={this.state.pickup_date.delivery_pickup_time_from}
            selectedTo={this.state.pickup_date.delivery_pickup_time_to}
            onPress={this.onSelectTime}
            deliveryDay={this.state.pickup_date.delivery_day}
            appData={this.props.appData}
            addressData={this.state.addressData}
            selectedDate={this.state.pickup_date.delivery_pickup_date}
            isShowingDeliverySlot={false}
            checkService={(this.checkService() == 3 || this.checkService() == 1)}
          />
        );
      } else {
        return (
          <View style={[styles.card, localStyle.card]}>
            <Text style={localStyle.noTimeslotAvailText}>
              Sorry! No times left today - Please choose another date
            </Text>
          </View>
        );
      }
    } else {
      return (
        <View style={[styles.card, localStyle.card, localStyle.loader]}>
          <LoaderView loading={this.state.loadingTimeslots} />
        </View>
      );
    }
  }

  renderDeliveryTimeslots() {
    if (this.state.delivery_date.delivery_pickup_date == '') {
      return <View />;
    }
    let isClosed = this.state.deliveytimeslots.every(item => item.off !== 'yes');

    if (!this.state.loadingDeliveryTimeslots) {
      if (isClosed || this.state.deliveytimeslots.length >= 1) {

        return (
          <RadioButtonScheduleOrder
            data={this.state.deliveytimeslots}
            selectedFrom={this.state.delivery_date.delivery_pickup_time_from}
            selectedTo={this.state.delivery_date.delivery_pickup_time_to}
            onPress={this.onSelectTime}
            deliveryDay={this.state.deliveryNextDate}
            appData={this.props.appData}
            addressData={this.state.addressData}
            selectedDate={this.state.deliveryNextDate}
            isShowingDeliverySlot={this.state.showSameDay}
            isDeliveryData
            checkService={(this.checkService() == 3 || this.checkService() == 1)}
          />
        );
      } else {
        return (
          <View style={[styles.card, localStyle.card]}>
            <Text style={localStyle.noTimeslotAvailText}>
              Sorry! No times left today - Please choose another date
            </Text>
          </View>
        );
      }
    } else {
      return (
        <View style={[styles.card, localStyle.card, localStyle.loader]}>
          <LoaderView loading={this.state.loadingDeliveryTimeslots} />
        </View>
      );
    }
  }
  fetchSameDayPreferences = () => {
    const sameDayPrefencesData = this.props.preferencesNameList['1']?.filter(
      sameDay => sameDay.id === 14,
    );
    return sameDayPrefencesData[0];
  };
  render() {
    if (this.state.loadingBlockDates) {
      return <LoaderView loading={this.state.loadingBlockDates} />;
    }
    const { todaySelected } = this.state;
    // const sameDayPrefences = this.fetchSameDayPreferences();
    const markedDatArray = JSON.parse(JSON.stringify(this.state.markedDate));
    const markedDeliveryDatArray = JSON.parse(JSON.stringify(this.state.markedDeliveryDate));

    return (
      <SafeAreaView style={styles.container}>
        <LoaderFullScreen loading={this.state.loading} />
        <LinearGradient
          colors={['#3b2eb6', '#21e381']}
          style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            horizontal={false}
            style={localStyle.scrollView}
            ref={view => {
              this.scrollView = view;
            }}
            onContentSizeChange={() => {
              if (this.checkService() == 2) {
                if (this.scrollView) {
                  this.scrollView.scrollToEnd({ animated: true });
                }
              }
              // this.scrollView.scrollToEnd({ animated: true })
            }
            }
          >
            <View style={localStyle.selectDate}>
              <Text style={[localStyle.text, localStyle.heading]}>
                PICKUP DATE
              </Text>
              {this.state.pickup_date.delivery_pickup_date &&
                Object.keys(markedDatArray).length >= 1 &&
                <>
                  <Calendar
                    key={this.state.pickup_date.delivery_pickup_date}
                    // current={this.state.data.delivery_pickup_date || currentDay}
                    current={this.state.pickup_date.delivery_pickup_date || currentDay}
                    minDate={currentDay}
                    monthFormat={'MMMM, yyyy'}
                    markedDates={markedDatArray}
                    theme={{
                      backgroundColor: '#ffffff',
                      calendarBackground: '#ffffff',
                      textDayFontFamily: 'Poppins-Regular',
                      textMonthFontFamily: 'Poppins-Regular',
                      textDayHeaderFontFamily: 'Poppins-Regular',
                      textMonthFontWeight: 'bold',
                      todayTextColor: '#17114f',
                      textDayFontSize: Utils.moderateScale(14),
                      textMonthFontSize: Utils.moderateScale(15),
                      textDayHeaderFontSize: Utils.moderateScale(12),
                      arrowColor: '#ced6d8',
                      selectedDayBackgroundColor: '#17114f',
                      // todayBackgroundColor: `${todaySelected ? '#17114f' : 'transparent'}`,
                    }}
                    style={[styles.card, localStyle.calendarContainer]}
                    onDayPress={day => {
                      this.setState({ loadingPickup: true, showSameDay: false })
                      this.handleSelectedDate(day)
                      this.handleMonthChange(day, true);
                    }}
                    onMonthChange={month => {
                      this.setState({ loadingPickup: true })
                      this.handleMonthChange(month);
                      // this.fetchBlockByMonth(month);
                    }}
                    onPressArrowLeft={substractMonth => substractMonth()}
                    onPressArrowRight={addMonth => addMonth()}
                  />
                  {this.state.loadingPickup &&
                    <View style={{
                      ...StyleSheet.absoluteFillObject,
                      justifyContent: 'center',
                      alignItems: 'center',

                    }}>
                      <View style={{
                        top: 20, width: 100, height: 100, justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <ActivityIndicator animating={this.state.loadingPickup} size="large" color="gray" />
                      </View>
                    </View>}
                </>
              }

            </View>
            <View style={localStyle.selectTime}>
              <Text style={[localStyle.text, localStyle.heading]}>
                PICKUP TIME
              </Text>
              {this.renderTimeslots()}
            </View>

            {this.checkService() == 3 && (
              <Text style={localStyle.centerMsg}>
                Please note, the delivery options below are for Wash & Fold services only. Dry Cleaning takes 1-3 business days and will be delivered as soon as possible.                </Text>
            )}


            {(this.state.pickup_date.delivery_pickup_time_from && this.state.pickup_date.delivery_pickup_time_to &&
              this.isPickupComplete() && (this.checkService() == 1 || this.checkService() == 3)) &&
              <>
                <View style={[localStyle.selectDate, { marginTop: this.checkService() == 3 ? Utils.moderateScale(15) : Utils.moderateScale(30) }]}>
                  <Text style={[localStyle.text, localStyle.heading]}>
                    DELIVERY DATE
                  </Text>
                  {/* {this.state.delivery_date.delivery_pickup_date &&
                    Object.keys(markedDeliveryDatArray).length >= 1 && (
                      <>
                        <Calendar
                          key={this.state.delivery_date.delivery_pickup_date}
                          // current={this.state.data.delivery_pickup_date || currentDay}
                          current={this.state.delivery_date.delivery_pickup_date}
                          minDate={this.state.deliveryNextDate}
                          monthFormat={'MMMM, yyyy'}
                          markedDates={markedDeliveryDatArray}
                          theme={{
                            backgroundColor: '#ffffff',
                            calendarBackground: '#ffffff',
                            textDayFontFamily: 'Poppins-Regular',
                            textMonthFontFamily: 'Poppins-Regular',
                            textDayHeaderFontFamily: 'Poppins-Regular',
                            textMonthFontWeight: 'bold',
                            todayTextColor: '#17114f',
                            textDayFontSize: Utils.moderateScale(14),
                            textMonthFontSize: Utils.moderateScale(15),
                            textDayHeaderFontSize: Utils.moderateScale(12),
                            arrowColor: '#ced6d8',
                            selectedDayBackgroundColor: '#17114f',
                            // todayBackgroundColor: `${todaySelected ? '#17114f' : 'transparent'}`,
                          }}
                          style={[styles.card, localStyle.calendarContainer]}
                          onDayPress={day => {
                            this.setState({ loadingDelivery: true, showSameDay: false })
                            if (this.state.pickup_date.delivery_pickup_date == day.dateString) {
                              const matchingItem = this.state.timeslots.find(item => item.to_slot === this.state.pickup_date.delivery_pickup_time_to && item.from_slot === this.state.pickup_date.delivery_pickup_time_from);
                              this.handleSelectedDeliveryDate(day, matchingItem ? true : false, matchingItem ? matchingItem?.id : null)
                            } else {
                              this.handleSelectedDeliveryDate(day, false)
                            }
                            this.handleDeliveryMonthChange(day, true);
                          }}
                          onMonthChange={month => {
                            this.setState({ loadingDelivery: true })
                            this.handleDeliveryMonthChange(month);
                            // this.fetchBlockByMonth(month);
                          }}
                          onPressArrowLeft={substractMonth => substractMonth()}
                          onPressArrowRight={addMonth => addMonth()}
                        // onMonthChange={ month => {
                        //     this.fetchBlockByMonth(month);
                        //     //this.GetAppointmentList(month.year + '-' + month.month + '-01');
                        // } }
                        />
                        {this.state.loadingDelivery &&
                          <View style={{
                            ...StyleSheet.absoluteFillObject,
                            justifyContent: 'center',
                            alignItems: 'center',

                          }}>
                            <View style={{
                              top: 20, width: 100, height: 100, justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                              <ActivityIndicator animating={this.state.loadingDelivery} size="large" color="gray" />
                            </View>
                          </View>}
                      </>
                    )} */}
                  {this.state.delivery_date.delivery_pickup_date &&
                    Object.keys(markedDeliveryDatArray).length >= 1 && (
                      <>
                        <Calendar
                          key={this.state.delivery_date.delivery_pickup_date}
                          current={this.state.delivery_date.delivery_pickup_date}
                          minDate={this.state.deliveryNextDate}
                          monthFormat={'MMMM, yyyy'}
                          markedDates={this.state.markedDeliveryDate}
                          theme={{
                            backgroundColor: '#ffffff',
                            calendarBackground: '#ffffff',
                            textDayFontFamily: 'Poppins-Regular',
                            textMonthFontFamily: 'Poppins-Regular',
                            textDayHeaderFontFamily: 'Poppins-Regular',
                            textMonthFontWeight: 'bold',
                            todayTextColor: '#17114f',
                            textDayFontSize: Utils.moderateScale(14),
                            textMonthFontSize: Utils.moderateScale(15),
                            textDayHeaderFontSize: Utils.moderateScale(12),
                            arrowColor: '#ced6d8',
                            selectedDayBackgroundColor: '#17114f',
                          }}
                          onDayPress={day => {
                            this.setState({ loadingDelivery: true, showSameDay: false });
                            if (this.state.pickup_date.delivery_pickup_date === day.dateString) {
                              const matchingItem = this.state.timeslots.find(item =>
                                item.to_slot === this.state.pickup_date.delivery_pickup_time_to &&
                                item.from_slot === this.state.pickup_date.delivery_pickup_time_from
                              );
                              this.handleSelectedDeliveryDate(day, matchingItem ? true : false, matchingItem ? matchingItem.id : null);
                            } else {
                              this.handleSelectedDeliveryDate(day, false);
                            }
                            this.handleDeliveryMonthChange(day, true);
                          }}
                          onMonthChange={month => {
                            this.setState({ loadingDelivery: true });
                            this.handleDeliveryMonthChange(month);
                          }}
                          onPressArrowLeft={substractMonth => substractMonth()}
                          onPressArrowRight={addMonth => addMonth()}
                        />
                        {this.state.loadingDelivery &&
                          <View style={{
                            ...StyleSheet.absoluteFillObject,
                            justifyContent: 'center',
                            alignItems: 'center',

                          }}>
                            <View style={{
                              top: 20, width: 100, height: 100, justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                              <ActivityIndicator animating={this.state.loadingDelivery} size="large" color="gray" />
                            </View>
                          </View>}
                      </>
                    )}
                </View>
                {this.isPickupComplete() && (
                  <View style={localStyle.selectTime}>
                    <Text style={[localStyle.text, localStyle.heading]}>
                      DELIVERY TIME
                    </Text>
                    {this.renderDeliveryTimeslots()}
                  </View>
                )}
              </>}

            {/* {this.state.turnAroundTimesLoading && (
              <View
                style={{
                  width: '90%',
                  alignSelf: 'center',
                  marginTop: Utils.moderateScale(25),
                  marginBottom: Utils.scale(3),
                }}>
                <Text style={[localStyle.text, localStyle.heading]}>
                  Turn Around Time
                </Text>
                <View style={[styles.card, localStyle.card, localStyle.loader]}>
                  <LoaderView loading={!this?.state?.turnAroundTimesLoading} />
                </View>
              </View>
            )} */}
            {
              // this.state.turnAroundTimes?.length > 0 &&
              // this?.state?.services?.includes('Wash & Fold') && (
              <View style={[localStyle.selectTime, { marginTop: 10 }]}>
                {this.checkService() == 2 && (
                  <Text style={{ marginBottom: 15, textAlign: 'justify', marginHorizontal: 10 }}>
                    {/* Please note, the delivery options below are for Wash &
                        Fold service only.  */}
                    Dry cleaning takes 1-3 business days. We will contact you once your clothing is ready for delivery.
                  </Text>
                )}

              </View>
              // )
            }
            {/* {this.state.showSameDay && (
              <View style={localStyle.selectTime}>
                <Text style={[localStyle.text, localStyle.heading]}>
                  SAME DAY
                </Text>
                <View
                  key={sameDayPrefences?.id}
                  style={[styles.card, localStyle.card]}>
                  <View style={[localStyle.preference, {flexDirection: 'row'}]}>
                    <Text style={[{fontSize: 12, marginRight: 5}]}>
                      {sameDayPrefences?.name}{' '}
                      <Text style={localStyle.preferenceAmount}>
                        (${parseFloat(sameDayPrefences?.price).toFixed(2)})
                      </Text>
                    </Text>
                    <RadioButtonOrder
                      data={[
                        {
                          label: sameDayPrefences?.options?.[0].name,
                          value: sameDayPrefences?.options?.[0].id,
                        },
                        {
                          label: sameDayPrefences?.options?.[1].name,
                          value: sameDayPrefences?.options?.[1].id,
                        },
                      ]}
                      default={
                        sameDayPrefences?.options?.[0].default_option == 'yes'
                          ? 0
                          : 1
                      }
                      onPress={value =>
                        this.updateSelectedPreference(
                          sameDayPrefences?.id,
                          value,
                          sameDayPrefences?.category_id,
                        )
                      }
                    />
                  </View>
                </View>
              </View>
            )} */}
          </ScrollView>
          <BlueButton
            onPress={this.navToSelectAddress}
            buttonText="CONTINUE"
            style={localStyle.button}
          />
        </LinearGradient>
      </SafeAreaView>
    );
  }
}

const localStyle = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  selectDate: {
    width: '90%',
    alignSelf: 'center',
    marginTop: Utils.moderateScale(30),
    marginBottom: Utils.moderateScale(8),
  },
  selectTime: {
    width: '90%',
    alignSelf: 'center',
    marginTop: Utils.moderateScale(25),
    marginBottom: Utils.scale(3),
  },
  calendarContainer: {
    padding: Utils.moderateScale(10),
  },
  card: {
    padding: Utils.scale(15),
  },
  button: {
    alignSelf: 'center',
    marginBottom: Utils.scale(5),
    marginTop: Utils.scale(5),
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(14),
    color: 'black',
    marginBottom: Utils.moderateScale(15),
  },
  heading: {
    letterSpacing: 1,
  },
  noTimeslotAvailText: {
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(13),
  },
  loader: {
    height: Utils.moderateVerticalScale(125),
  },

  activeRadio: {
    backgroundColor: '#171151',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#171151',
    width: Utils.moderateScale(14),
    height: Utils.moderateScale(14),
    alignSelf: 'center',
  },
  inactiveRadio: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#b1b6bb',
    width: Utils.moderateScale(14),
    height: Utils.moderateScale(14),
    alignSelf: 'center',
  },
  centerMsg: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(13),
    color: '#ffff',
    marginBottom: 0,
    marginTop: Utils.moderateScale(15),
    textAlign: Platform.OS == 'android' ? 'left' : 'center',
    marginHorizontal: 20
  }
});

const mapStateToProps = state => {
  return {
    appData: state.appData.appData,
    dateTime: state.appData.scheduleOrderData.dateTime,
    servicesAndPreferences:
      state.appData?.scheduleOrderData?.servicesAndPreferences,
    preferences: state.appData?.scheduleOrderData,
    addressData: state.appData.addressData,
    preferencesNameList: state.appData.scheduleOrderData.preferencesNameList,
    signUpData: state.appData.signUpData
    //navigation: state.navigation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setScheduleOrderDataDateTime: data =>
      dispatch(ActionCreators.setScheduleOrderDataDateTime(data)),
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
    setScheduleOrderDataServicesAndPreferences: data =>
      dispatch(ActionCreators.setScheduleOrderDataServicesAndPreferences(data)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ScheduleDateTimeScreen);