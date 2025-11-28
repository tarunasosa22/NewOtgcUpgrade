import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  InteractionManager,
  TextInput,
  Text,
  ActivityIndicator,
  Platform,
} from 'react-native';
// import {Text, Label, Input, Item} from 'native-base';
// import { SafeAreaView } from 'react-navigation';

import { Calendar } from 'react-native-calendars';
import { CommonActions, StackActions } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { connect } from 'react-redux';
import styles from './styles';
import LoaderView from '../components/LoaderView';
import { ActionCreators } from '../actions/index';
import LoaderFullScreen from '../components/LoaderFullScreen';
import BlueButton from '../components/button/BlueButton';
import RadioButtonScheduleOrder from '../components/RadioButtonScheduleOrder';
import Images from '../assets/images/index';
import moment from 'moment';
import * as Utils from '../lib/utils';
import RadioButtonOrder from '../components/RadioButtonOrder';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { AppStrings } from '../utils/AppStrings';
import { firebase } from '@react-native-firebase/dynamic-links';
import { store } from '../../App';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');
dayjs.locale('en');
dayjs.extend(utc);

const currentDay = dayjs().format('YYYY-MM-DD');
class ExpressOrderScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'EXPRESS CHECKOUT',
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
    this.dayOrder = {
      Sun: 0,
      Mon: 1,
      Tues: 2,
      Wed: 3,
      Thrus: 4,
      Fri: 5,
      Sat: 6,
    };
    this.weekDaysName = ['Sun', 'Mon', 'Tues', 'Wed', 'Thrus', 'Fri', 'Sat'];
    this.state = {
      data: { pickup_date: '', pickup_time_from: '', pickup_time_to: '' },
      delivery_data: { pickup_date: '', pickup_time_from: '', pickup_time_to: '' },
      loadingTimeslots: false,
      loadingDeliveryTimeslots: false,
      timeslots: [],
      deliveytimeslots: [],
      orderData: {},
      promocode: '',
      turnAroundTimes: this.props?.dateTime?.turnAroundTimes || [],
      turnAroundTimesLoading: false,
      selectedTurnAroundTimes: [],
      tip: '',
      loading: true,
      markedDate: {},
      markedDeliveryDate: {},
      showFullScreenLoader: false,
      loadingBlockDates: true,
      driver_instructions: '',
      showDriverDetails: false,
      service_instructions: '',
      dry_instructions: '',
      showServiceInstruction: false,
      showDryInstructions: false,
      showSameDay: false,
      same_day_preferences: '',
      city: null,
      state: null,
      addressData: [],
      deliveryNextDate: dayjs(),
      loadingPickup: false,
      loadingDelivery: false,
      autoHolidaysList: [],
    };
    this._mounted = false;
    this.blockDates = {};
    this.blockDeliveryDates = {};
    this.oldDate = null;
    this.disabled_days = [];
    this.handleSelectedDate = this.handleSelectedDate.bind(this);
    this.onSelectTime = this.onSelectTime.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleMonthChange = this.handleMonthChange.bind(this);
    this.handleDeliveryMonthChange = this.handleDeliveryMonthChange.bind(this);

  }

  componentDidMount() {
    this._mounted = true;
    this.props.navigation.setParams({
      openDrawer: this.props.setDrawerOpenState,
    });
    this.fetchAddresses();
    // this.fetchExpressOrderDetails();
    this.getPreferenceList();

    this.props.navigation.addListener('focus', () => {
      this.fetchAddresses();
      this.fetchExpressOrderDetails();
    });
  }

  fetchExpressOrderDetails() {
    this.setState({ loading: true });
    Utils.makeApiRequest(
      `express-order-detail/${this.props.appData.id}`,
      null,
      this.props.appData.token,
      'GET',
      'order',
    )
      .then(async result => {
        if (this._mounted) {
          const state = await this.fetchState();
          const city = await this.fetchCity(state[0].id);

          if (!result.status) {
            let message = result.message || result?.msg;
            if (message) {
              this.setState({ loading: false });
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  '',
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                  'OK',
                  null,
                  () => {
                    this.props.navigation.goBack();
                  },
                  false,
                  false,
                );
              }
            } else {
              this.setState({ loading: false });
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  '',
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                  'OK',
                  null,
                  () => {
                    this.props.navigation.goBack();
                  },
                  false,
                  false,
                );
              }
            }
          } else if (result.status == true) {
            console.log("result ----------------> ", JSON.stringify(result, null,2))
            let tip = '';
            try {
              if (result.data?.order?.tips) {
                tip = String(result.data?.order?.tips);
              }
            } catch (error) {
              console.log(error);
            }
            let orderData = {
              ...result.data?.order,
            };
            // if (!result.data?.order?.UserAddress) {
            //   const primaryAddress = this.state.addressData.find(
            //     address => address.primary === 'yes',
            //   );
            //   console.log("primaryAddress -----> ", primaryAddress)
            //   if (primaryAddress) {
            //     orderData = {
            //       ...orderData,
            //       UserAddress: primaryAddress,
            //     };
            //   }
            // }

            const primaryAddress = this.state.addressData.find(
              address => address.primary === 'yes',
            );
            
            if (primaryAddress) {
              orderData = {
                ...orderData,
                UserAddress: primaryAddress,
              };
            }

            this.setState({
              orderData: orderData,
              tip: tip,
              loading: false,
              driver_instructions: result?.data?.order?.driver_instructions,
              dry_instructions: result?.data?.order?.dry_instructions,
              service_instructions: result?.data?.order?.service_instructions,
            });
            this.fetchBlock();
          } else {
            this.setState({ loading: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                result.msg ||
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                'OK',
                null,
                () => {
                  this.props.navigation.goBack();
                },
                false,
                false,
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
            if (this.state.orderData) {
              const primaryAddress = resultData.find(
                address => address.primary === 'yes'
              );
              
              if (primaryAddress) {
                this.setState(prevState => ({
                  orderData: {
                    ...prevState.orderData,
                    UserAddress: primaryAddress
                  }
                }));
              }
            }
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

  componentWillUnmount() {
    this._mounted = false;
  }

  getPreferenceList() {
    Utils.makeApiRequest(
      `category/${1}`,
      { id: 1 },
      this.props.appData.token,
      'GET',
      'preference',
    )
      .then(result => {
        if (result.status) {
        } else if (result.status == true && result.data.length > 0) {
          this.props.setScheduleOrderDataPreferencesNameList({ 1: result.data });
        } else {
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
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
            let differenceInDays = 0;

            for (let date = temp_pickup_date; date.isBefore(temp_delivery_date) || date.isSame(temp_delivery_date); date = date.add(1, 'day')) {
              // Check if the day is not Saturday (6) or Sunday (0)
              if (date.day() !== 6 && date.day() !== 0) {
                differenceInDays++; // Increment count for weekdays
              }
            }
            const filteredItems = result?.data?.filter(item => item.day === differenceInDays - 1);

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
                if (this.state.data.pickup_time_from !== '' && this.state.data.pickup_time_to !== '')
                  updatedData?.map((item) => {
                    const currentDate = moment();
                    const pickupStartTime = moment(`${currentDate.format('YYYY-MM-DD')} ${this.state.data.pickup_time_from}`, 'YYYY-MM-DD h:mm A');
                    const pickupEndTime = moment(`${currentDate.format('YYYY-MM-DD')} ${this.state.data.pickup_time_to}`, 'YYYY-MM-DD h:mm A');
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
                this.fetchTurnAroundTimes(this.state.data.pickup_date, date, result.data, isShowSameDay, time_slot_id)
              } else {
                this.setState({ timeslots: result.data, loadingTimeslots: false, });
                if (this.checkService() == 2) {
                  this.setState({ loadingDeliveryTimeslots: false, });
                }
              }
              // this.setState({ timeslots: result.data, loadingTimeslots: false });
              return true;
            } else {
              this.setState({ loadingTimeslots: false });
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  '',
                  result.msg ||
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
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
  // setDriverInstructions = () => {
  //     this.state.
  // }
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
                'Opps!',
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
            }
            return false;
          } else if (result.status == true) {
            let dateResult = result.data;
            this.setState({ autoHolidaysList: result.data })
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
              let deliveryNextDate = dayjs(this.oldDate).add(1, 'day');// Get tomorrow's date
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
                  _this.state.delivery_data.pickup_date = '';
                  _this.setState({
                    loadingBlockDates: false,
                    delivery_data: this.state.delivery_data,
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
              data: {
                delivery_pickup_date: this.oldDate,
                pickup_date: this.oldDate,
                delivery_pickup_time_from: '',
                delivery_pickup_time_to: '',
              },
              delivery_data: {
                delivery_pickup_date: this.oldDate,
                pickup_date: this.oldDate,
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

            _this.fetchTimeslots(this.oldDate, false, false, false)?.then(result => {
              if (result === false) {
                _this.state.data.delivery_pickup_date = '';
                _this.setState({
                  loadingBlockDates: false,
                  data: this.state.data,
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
            // this.fetchBlockByMonth(dateData);
            return true;
          } else {
            this.setState({ loadingBlockDates: false });
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
                result.msg ||
                'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
              );
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

  getDaysInMonth(month, year, days) {
    var weekday = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    let weekNames = [];
    days.forEach(number => {
      weekNames.push(weekday[number]);
    });
    let pivot = moment().month(month).year(year).startOf('month');
    const end = moment().month(month).year(year).endOf('month');

    let dates = [];
    const disabled = { disabled: true, disableTouchEvent: true };
    while (pivot.isBefore(end)) {
      weekNames.forEach(day => {
        dates.push({
          pickup_date: pivot.day(day).format('YYYY-MM-DD') + 'T00:00:00.000Z',
        });
      });
      pivot.add(7, 'days');
    }

    return dates;
  }

  datesDifferByMonthOrYear = (dateStr1, dateStr2) => {
    const [year1, month1, day1] = dateStr1.split('-').map(Number);
    const [year2, month2, day2] = dateStr2.split('-').map(Number);

    return month1 !== month2 || year1 !== year2;
  };

  handleSelectedDate(day) {
    this.setState({ turnAroundTimes: [] });

    if (!this.state.loadingTimeslots && !this.state.loadingDeliveryTimeslots) {
      this.setState({ loadingPickup: true, loadingDelivery: true })
      this.state.markedDate = {};
      this.state.markedDate = JSON.parse(JSON.stringify(this.blockDates));
      if (day.dateString !== this.oldDate) {
        this.state.markedDate[this.oldDate] = { selected: false, marked: false };
      }
      this.state.markedDate[day.dateString] = { selected: true, marked: true };
      this.setState({
        data: {
          pickup_date: day.dateString,
          pickup_time_from: '',
          pickup_time_to: '',
        },
        loadingTimeslots: true,
        loadingDeliveryTimeslots: true,
        timeslots: [],
        markedDate: this.state.markedDate,
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

        if (this.datesDifferByMonthOrYear(this.state.delivery_data.pickup_date, finalDeliveryNextDate)) {
          let month = {
            dateString: finalDeliveryNextDate,
            day: Number(deliveryNextDate.format('DD')),
            month: Number(deliveryNextDate.format('MM')),
            timestamp: dayjs(deliveryNextDate, 'DD-MM-YYYY').valueOf(),
            year: Number(deliveryNextDate.format('YYYY'))
          }
          this.setState({ loadingDelivery: true })
          this.handleDeliveryMonthChange(month, true)
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
        if (result.status === false) {
          this.state.data.pickup_date = '';
          this.setState({ data: this.state.data, markedDate: this.blockDates });
          this.setState({ loadingPickup: false, loadingDelivery: false })
        }
      });
      this.setState({ loadingPickup: false, loadingDelivery: false })
    }
  }

  handleSelectedDeliveryDate(day, isShowSameDay, time_slot_id) {
    this.setState({ turnAroundTimes: [] });
    if (!this.state.loadingDeliveryTimeslots || this.state.loadingTimeslots) {
      this.state.markedDeliveryDate = {};
      if (this.state.showSameDay) {
        delete this.blockDeliveryDates[this.state.data.pickup_date]
      }

      const filteredDisbleKeys = Object.keys(this.blockDeliveryDates).map(dateKey => {
        if (this.blockDeliveryDates[dateKey]?.selected && this.blockDeliveryDates[dateKey]?.marked) {
          delete this.blockDeliveryDates[dateKey]
        }
      });

      this.state.markedDeliveryDate = JSON.parse(JSON.stringify(this.blockDeliveryDates));
      // if (day.dateString !== this.oldDate) {
      //   this.state.markedDate[this.oldDate] = { selected: false, marked: false };
      // }
      this.state.markedDeliveryDate[day.dateString] = { selected: true, marked: true };
      this.setState({
        todaySelected: false,
        delivery_data: {
          pickup_date: day.dateString,
          pickup_time_from: '',
          pickup_time_to: '',
        },
        loadingDeliveryTimeslots: true,
        deliveytimeslots: [],
        loadingDelivery: true,
        markedDeliveryDate: this.state.markedDeliveryDate,
        // loadingTimeslots: true,
        // timeslots: [],
      });
      this.fetchTimeslots(day.dateString, null, true, false, isShowSameDay, time_slot_id).then(result => {
        if (result === true) {
          // this.state.delivery_data.pickup_date = '';
          this.setState({
            delivery_data: {
              pickup_date: day.dateString,
              pickup_time_from: '',
              pickup_time_to: '',
            },
            markedDeliveryDatArray: this.blockDeliveryDates,
            loadingDelivery: false, loadingPickup: false
          });
        }
      });
    }
  }

  daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  digits_count(n) {
    var count = 0;
    if (n >= 1) ++count;

    while (n / 10 >= 1) {
      n /= 10;
      ++count;
    }

    return count;
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
          if (result !== false || typeof result === 'object') {
            let { result: turnAroundTimes } = result;
            this.setState({
              turnAroundTimes,
              turnAroundTimesLoading: false,
            });
            // setTimeout(() => {
            // this.scrollView.scrollToEnd({ animated: true });
            // }, 50);
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
    console.warn(time_slot_id);
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
  //           sat.push({date: month.year + '-0' + month.month + '-0' + i});
  //         } else {
  //           sat.push({date: month.year + '-' + month.month + '-0' + i});
  //         }
  //       } else {
  //         if (countLengthm < 2) {
  //           sat.push({date: month.year + '-0' + month.month + '-' + i});
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
  //       if (resultSat.length === 0) {
  //         sun.forEach(element => {
  //           let date = element.date;
  //           this.state.markedDate[date] = {
  //             disabled: true,
  //             disableTouchEvent: true,
  //           };
  //           this.blockDates[date] = {disabled: true, disableTouchEvent: true};
  //         });
  //         this.setState({markedDate: this.blockDates});
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

  fetchTimeslots1(date = '') {
    if (date) {
      var d = new Date(date);
      var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
      return Utils.makeApiRequest(
        `day/${this.dayOrder[this.weekDaysName[new Date(date).getDay()]]}`,
        { pickup_date: date, current_time: time },
        this.props.appData.token,
        'GET',
        'pickup-days',
      )
        .then(result => {
          if (this._mounted) {
            if (result.status === false) {
              this.setState({ loadingTimeslots: false });
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  '',
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
              }
              return false;
            } else if (result.status == true) {
              //this.setState({ timeslots: result.result, loadingTimeslots: false });
              return result.data;
            } else {
              this.setState({ loadingTimeslots: false });
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

  onSelectTime(turn_around, from, to, delivery_day, time_slot_id, isDeliveryData) {
    const sameDayPreferences = this.fetchSameDayPreferences();

    if (isDeliveryData) {
      if (this.state.data.pickup_time_from != '' && this.state.data.pickup_time_to != '') {
        this.state.deliveytimeslots.map((item) => {
          const currentDate = moment();
          const pickupStartTime = moment(`${currentDate.format('YYYY-MM-DD')} ${this.state.data.pickup_time_from}`, 'YYYY-MM-DD h:mm A');
          const pickupEndTime = moment(`${currentDate.format('YYYY-MM-DD')} ${this.state.data.pickup_time_to}`, 'YYYY-MM-DD h:mm A');
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
      this.state.delivery_data.pickup_time_from = from;
      this.state.delivery_data.pickup_time_to = to;
    } else {
      this.state.deliveytimeslots.map((item) => {
        const currentDate = moment();
        const pickupStartTime = moment(`${currentDate.format('YYYY-MM-DD')} ${from}`, 'YYYY-MM-DD h:mm A');
        const pickupEndTime = moment(`${currentDate.format('YYYY-MM-DD')} ${to}`, 'YYYY-MM-DD h:mm A');
        const deliveryStartTime = moment(`${currentDate.format('YYYY-MM-DD')} ${item.from_slot}`, 'YYYY-MM-DD h:mm A');
        const deliveryEndTime = moment(`${currentDate.format('YYYY-MM-DD')} ${item.to_slot}`, 'YYYY-MM-DD h:mm A');
        const count = this.countHolidaysBetweenDates(this.state.data.pickup_date, this.state.delivery_data.pickup_date, this.state.autoHolidaysList);

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
      let isCheck = this.state.deliveytimeslots.some(item => item.from_slot === this.state.delivery_data.pickup_time_from && item.to_slot === this.state.delivery_data.pickup_time_to && item.status == 'inactive')

      if (isCheck) {
        this.state.delivery_data.pickup_time_from = '';
        this.state.delivery_data.pickup_time_to = '';
      }
      this.state.data.pickup_time_from = from;
      this.state.data.pickup_time_to = to;

      if ((delivery_day === 'SameDay' || this.state.data.pickup_date == this.state.delivery_data.pickup_date) && (this.checkService() == 3 || this.checkService() == 1)) {
        let deliveryNextDate = '';
        if (delivery_day === 'SameDay') {
          this.setState({ showSameDay: true, loadingDelivery: true });
          deliveryNextDate = dayjs(this.state.data.pickup_date);
        }
        else {
          this.setState({ showSameDay: false, loadingDelivery: true });
          deliveryNextDate = dayjs(this.state.data.pickup_date).add(1, 'day');
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
        this.blockDeliveryDates[this.state.data.pickup_date] = { disabled: true, disableTouchEvent: true }
      }


      if (this.checkService() == 1 || this.checkService() == 3) {
        setTimeout(() => {
          if (this.scrollView) {
            this.scrollView.scrollTo({ y: 1500, animated: true });
          }
          // this.scrollView.scrollToEnd({ animated: true });
        }, 500);
      }
    }

    this.setState({ data: this.state.data });
    // if (turn_around) {
    //   this.setState({
    //     turnAroundTimes: turn_around?.map(turnTime => {
    //       return turnTime.turn_time;
    //     }),
    //     turnAroundTimesLoading: false,
    //     deliveryDay: delivery_day,
    //   });
    // } else {
    //   this.setState({
    //     turnAroundTimes: [],
    //     turnAroundTimesLoading: false,
    //   });
    // }

    // if (turn_around) {
    //   this.setState({ showSameDay: true });
    //   setTimeout(() => {
    //     this.scrollView.scrollToEnd({ animated: true });
    //   }, 500);
    // } else {
    //   this.setState({ showSameDay: false });
    // }
  }

  verifyPromocode() {
    if (this.state.promocode == '') {
      return new Promise(function (resolve, reject) {
        return resolve(false);
      });
    }

    this.setState({ loading: true });

    return Utils.makeApiRequest(
      'coupon-code',
      { promo_code: this.state.promocode, user_id: this.props.appData.id },
      this.props.appData.token,
      'POST',
      'order/verify'
    )
      .then(result => {
        console.log("result -------------> ", result)
        if (this._mounted) {
          this.setState({ loading: false });
          if (result.status) {
            Utils.displayAlert('Promo Code Applied!');
            return result;
          } else {
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert('', result.error || 'Invalid Promo Code');
            }
            return null;
          }
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  // onSubmit() {
  //   this.setState({ showFullScreenLoader: true });
  //   if (!this.state.orderData.UserAddress) {
  //     Utils.displayAlert(
  //       '',
  //       'Please select primary pickup address in your account profile',
  //     );
  //     return;
  //   }
  //   if (Utils.isEmpty(this.state.orderData) || !this.state.orderData.id) {
  //     this.setState({ showFullScreenLoader: false });
  //     Utils.displayAlert(
  //       '',
  //       'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
  //       'OK',
  //       null,
  //       () => {
  //         this.props.navigation.goBack();
  //       },
  //       false,
  //       false,
  //     );
  //   } else if (
  //     this.state.data.pickup_date === '' ||
  //     this.state.data.pickup_date === undefined
  //   ) {
  //     this.setState({ showFullScreenLoader: false });
  //     Utils.displayAlert('', 'Please select date and timeslot to continue!!!');
  //   } else if (
  //     this.state.data.pickup_time_from === '' ||
  //     this.state.data.pickup_time_to === '' ||
  //     this.state.data.pickup_time_from === undefined ||
  //     this.state.data.pickup_time_to === undefined
  //   ) {
  //     this.setState({ showFullScreenLoader: false });
  //     Utils.displayAlert('', 'Please select timeslot to continue!!!');
  //   } else if ((this.checkService() == 1 || this.checkService() == 3) &&
  //     (this.state.delivery_data.pickup_date === '' ||
  //       this.state.delivery_data.pickup_date === undefined)) {
  //     this.setState({ showFullScreenLoader: false });
  //     Utils.displayAlert('', 'Please select date and timeslot to continue!!!');
  //   } else if ((this.checkService() == 1 || this.checkService() == 3) &&
  //     (this.state.delivery_data.pickup_time_from === '' ||
  //       this.state.delivery_data.pickup_time_to === '' ||
  //       this.state.delivery_data.pickup_time_from === undefined ||
  //       this.state.delivery_data.pickup_time_to === undefined)) {
  //     this.setState({ showFullScreenLoader: false });
  //     Utils.displayAlert('', 'Please select timeslot to continue!!!');
  //   } else if (
  //     this.state.tip &&
  //     (isNaN(parseFloat(this.state.tip)) || parseFloat(this.state.tip) <= 0)
  //   ) {
  //     this.setState({ showFullScreenLoader: false });
  //     Utils.displayAlert('', 'Please enter a valid amount for tip');
  //     return;
  //   } else {
  //     let promocodeData = null;
  //     if (!this.state.showSameDay) {
  //       const removedData =
  //         this.props.servicesAndPreferences?.preferences?.filter(
  //           pref => pref.preference_id !== 14,
  //         );
  //       this.props.setScheduleOrderDataServicesAndPreferences({
  //         ...this.props.servicesAndPreferences,
  //         preferences: removedData,
  //       });
  //     }
  //     if (this.state.promocode.length >= 1) {
  //       this.verifyPromocode()
  //         .then(promocode_data => {
  //           console.log("promocode_data ", promocode_data)
  //           // if (promocode_data !== true) {
  //           //   promocodeData = promocode_data;
  //           //   return;
  //           // }
  //           if (!promocode_data) {
  //             return;
  //           } else if (promocode_data !== true) {
  //             promocodeData = promocode_data;
  //           }

  //           let promo = {
  //             promo_code_id: '',
  //             promo_code: '',
  //             promo_code_type: '',
  //             promo_code_amount: '',
  //           };
  //           if (promocodeData) {
  //             promo = {
  //               promo_code_id: promocodeData.id,
  //               promo_code: promocodeData.code,
  //               promo_code_type: promocodeData.type,
  //               promo_code_amount: promocodeData.discount,
  //             };
  //           }
  //           this.setState({ showFullScreenLoader: true });
  //           const same_day_preference = this.state.same_day_preferences;
  //           let serviceDeatils = [];
  //           let serviceNames = [];
  //           if (this.state.orderData.services.split(',').length === 2) {
  //             serviceDeatils.push(1);
  //             serviceDeatils.push(2);
  //             // serviceNames.push('Wash & Fold');
  //             // serviceNames.push('Dry Cleaning / Wash & Press');
  //             serviceNames.push('Wash & Fold');
  //             serviceNames.push('Dry Cleaning / Wash & Press');
  //           }
  //           if (this.state.orderData.services === 'Wash & Fold') {
  //             serviceDeatils.push(1);
  //             serviceNames.push('Wash & Fold');
  //           }
  //           if (
  //             this.state.orderData.services === 'Dry Cleaning / Wash & Press'
  //           ) {
  //             serviceDeatils.push(2);
  //             serviceNames.push('Dry Cleaning / Wash & Press');
  //           }
  //           let data = {
  //             service: {
  //               express_order: true,
  //               // service: serviceDeatils,
  //               date: this.state.data.pickup_date,
  //               deliveryDate: this.state.delivery_data?.pickup_date,
  //               driverInstruction: this.state.driver_instructions,
  //               washInstruction: this.state.orderData.service_instructions,
  //               sameDayDelivery: this.state.selectedTurnAroundTimes[0],
  //               dryInstruction: this.state.dry_instructions,
  //               preference: this.state.orderData?.preferences?.map(
  //                 item => item.id,
  //               ),
  //               serviceDetail: serviceNames,
  //               timeSlotDetail: {
  //                 from_slot: this.state.data.pickup_time_from,
  //                 to_slot: this.state.data.pickup_time_to,
  //               },
  //               delivery_slot: {
  //                 // date: deliveryData?.delivery_pickup_date,
  //                 delivery_from_slot: this.state.delivery_data.pickup_time_from,
  //                 delivery_to_slot: this.state.delivery_data.pickup_time_to,
  //               }
  //             },
  //             userAddress: {
  //               user_id: this.props.appData.id,
  //               addressID: this.state.orderData?.UserAddress?.id,
  //             },
  //             userCard: {
  //               id: this.state.orderData?.UserCard?.id,
  //               billingZipcode: this.state.orderData?.UserCard?.zip_code,
  //               tip: this.state.tip,
  //               promoCode: this.state.promocode,
  //             },
  //           };

  //           this._validate_Card(data.userCard?.id, data)
  //           return;
  //         })
  //         .catch(err => {
  //           console.log(err);
  //         });
  //     } else {
  //       let promo = {
  //         promo_code_id: '',
  //         promo_code: '',
  //         promo_code_type: '',
  //         promo_code_amount: '',
  //       };
  //       if (promocodeData) {
  //         promo = {
  //           promo_code_id: promocodeData.id,
  //           promo_code: promocodeData.code,
  //           promo_code_type: promocodeData.type,
  //           promo_code_amount: promocodeData.discount,
  //         };
  //       }
  //       this.setState({ showFullScreenLoader: true });
  //       const same_day_preference = this.state.same_day_preferences;
  //       let serviceDeatils = [];
  //       let serviceNames = [];
  //       if (this.state.orderData.services.split(',').length === 2) {
  //         serviceDeatils.push(1);
  //         serviceDeatils.push(2);
  //         // serviceNames.push('Wash & Fold');
  //         // serviceNames.push('Dry Cleaning / Wash & Press');
  //         serviceNames.push('Wash & Fold');
  //         serviceNames.push('Dry Cleaning / Wash & Press');
  //       }
  //       if (this.state.orderData.services === 'Wash & Fold') {
  //         serviceDeatils.push(1);
  //         serviceNames.push('Wash & Fold');
  //       }
  //       if (this.state.orderData.services === 'Dry Cleaning / Wash & Press') {
  //         serviceDeatils.push(2);
  //         serviceNames.push('Dry Cleaning / Wash & Press');
  //       }
  //       let data = {
  //         service: {
  //           express_order: true,
  //           // service: serviceDeatils,
  //           date: this.state.data.pickup_date,
  //           deliveryDate: this.state.delivery_data?.pickup_date,
  //           driverInstruction: this.state.driver_instructions,
  //           washInstruction: this.state.orderData.service_instructions,
  //           sameDayDelivery: this.state.selectedTurnAroundTimes[0],
  //           dryInstruction: this.state.dry_instructions,
  //           preference: this.state.orderData?.preferences?.map(item => item.id),
  //           serviceDetail: serviceNames,
  //           timeSlotDetail: {
  //             from_slot: this.state.data.pickup_time_from,
  //             to_slot: this.state.data.pickup_time_to,
  //           },
  //           delivery_slot: {
  //             // date: deliveryData?.delivery_pickup_date,
  //             delivery_from_slot: this.state.delivery_data.pickup_time_from,
  //             delivery_to_slot: this.state.delivery_data.pickup_time_to,
  //           }
  //         },
  //         userAddress: {
  //           user_id: this.props.appData.id,
  //           addressID: this.state.orderData?.UserAddress?.id,
  //         },
  //         userCard: {
  //           id: this.state.orderData?.UserCard?.id,
  //           billingZipcode: this.state.orderData?.UserCard?.zip_code,
  //           tip: this.state.tip,
  //           promoCode: this.state.promocode,
  //         },
  //       };

  //       this._validate_Card(data.userCard?.id, data)
  //     }
  //   }
  // }

  onSubmit() {
    this.setState({ showFullScreenLoader: true });
    if (!this.state.orderData.UserAddress) {
      Utils.displayAlert(
        '',
        'Please select primary pickup address in your account profile',
      );
      return;
    }
    if (Utils.isEmpty(this.state.orderData) || !this.state.orderData.id) {
      this.setState({ showFullScreenLoader: false });
      Utils.displayAlert(
        '',
        'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
        'OK',
        null,
        () => {
          this.props.navigation.goBack();
        },
        false,
        false,
      );
    } else if (
      this.state.data.pickup_date === '' ||
      this.state.data.pickup_date === undefined
    ) {
      this.setState({ showFullScreenLoader: false });
      Utils.displayAlert('', 'Please select date and timeslot to continue!!!');
    } else if (
      this.state.data.pickup_time_from === '' ||
      this.state.data.pickup_time_to === '' ||
      this.state.data.pickup_time_from === undefined ||
      this.state.data.pickup_time_to === undefined
    ) {
      this.setState({ showFullScreenLoader: false });
      Utils.displayAlert('', 'Please select timeslot to continue!!!');
    } else if ((this.checkService() == 1 || this.checkService() == 3) &&
      (this.state.delivery_data.pickup_date === '' ||
        this.state.delivery_data.pickup_date === undefined)) {
      this.setState({ showFullScreenLoader: false });
      Utils.displayAlert('', 'Please select date and timeslot to continue!!!');
    } else if ((this.checkService() == 1 || this.checkService() == 3) &&
      (this.state.delivery_data.pickup_time_from === '' ||
        this.state.delivery_data.pickup_time_to === '' ||
        this.state.delivery_data.pickup_time_from === undefined ||
        this.state.delivery_data.pickup_time_to === undefined)) {
      this.setState({ showFullScreenLoader: false });
      Utils.displayAlert('', 'Please select timeslot to continue!!!');
    } else if (
      this.state.tip &&
      (isNaN(parseFloat(this.state.tip)) || parseFloat(this.state.tip) <= 0)
    ) {
      this.setState({ showFullScreenLoader: false });
      Utils.displayAlert('', 'Please enter a valid amount for tip');
      return;
    } else {
      let promocodeData = null;
      if (!this.state.showSameDay) {
        const removedData =
          this.props.servicesAndPreferences?.preferences?.filter(
            pref => pref.preference_id !== 14,
          );
        this.props.setScheduleOrderDataServicesAndPreferences({
          ...this.props.servicesAndPreferences,
          preferences: removedData,
        });
      }
      
      // Create a function to process the order
      const processOrder = (promoData) => {
        let promo = {
          promo_code_id: '',
          promo_code: '',
          promo_code_type: '',
          promo_code_amount: '',
        };
        
        if (promoData) {
          promo = {
            promo_code_id: promoData.id,
            promo_code: promoData.promo_code,
            promo_code_type: promoData.type,
            promo_code_amount: promoData.discount,
          };
        }
        
        this.setState({ showFullScreenLoader: true });
        const same_day_preference = this.state.same_day_preferences;
        let serviceDeatils = [];
        let serviceNames = [];
        if (this.state.orderData.services.split(',').length === 2) {
          serviceDeatils.push(1);
          serviceDeatils.push(2);
          serviceNames.push('Wash & Fold');
          serviceNames.push('Dry Cleaning / Wash & Press');
        }
        if (this.state.orderData.services === 'Wash & Fold') {
          serviceDeatils.push(1);
          serviceNames.push('Wash & Fold');
        }
        if (this.state.orderData.services === 'Dry Cleaning / Wash & Press') {
          serviceDeatils.push(2);
          serviceNames.push('Dry Cleaning / Wash & Press');
        }
        
        let data = {
          service: {
            express_order: true,
            date: this.state.data.pickup_date,
            deliveryDate: this.state.delivery_data?.pickup_date,
            driverInstruction: this.state.driver_instructions,
            washInstruction: this.state.service_instructions,
            sameDayDelivery: this.state.selectedTurnAroundTimes[0],
            dryInstruction: this.state.dry_instructions,
            preference: this.state.orderData?.preferences?.map(item => item.id),
            serviceDetail: serviceNames,
            timeSlotDetail: {
              from_slot: this.state.data.pickup_time_from,
              to_slot: this.state.data.pickup_time_to,
            },
            delivery_slot: {
              delivery_from_slot: this.state.delivery_data.pickup_time_from,
              delivery_to_slot: this.state.delivery_data.pickup_time_to,
            }
          },
          userAddress: {
            user_id: this.props.appData.id,
            addressID: this.state.orderData?.UserAddress?.id,
          },
          userCard: {
            id: this.state.orderData?.UserCard?.id,
            billingZipcode: this.state.orderData?.UserCard?.zip_code,
            tip: this.state.tip,
            promoCode: promo.promo_code,
          },
        };
        console.log("data -----------> ", data)
        this._validate_Card(data.userCard?.id, data);
      };
  
      // Handle promocode verification
      if (this.state.promocode.length >= 1) {
        this.verifyPromocode()
          .then(promocode_data => {
            console.log("promocode_data ", promocode_data);
            
            // If promocode_data is null (invalid promocode), set it to null and continue with order
            // If promocode_data is a result object (valid promocode), use that data
            if (!promocode_data) {
              processOrder(null);
            } else {
              processOrder(promocode_data);
            }
          })
          .catch(err => {
            console.log(err);
            // In case of error, continue with order but without promo code
            processOrder(null);
          });
      } else {
        // No promocode entered, continue with order
        processOrder(null);
      }
    }
  }

  _validate_Card(card_id, data) {
    return Utils.makeApiRequest(
      'validate-card',
      {
        card: card_id,
      },
      this.props.appData.token,
      'POST',
      'payment',
    )
      .then(result => {
        if (this._mounted) {
          this.setState({ loading: false });
          if (result.err) {
            this.setState({ showFullScreenLoader: false });
            Utils.displayAlert('Info!', result.err
              || 'Invalid Request');
            return false;
          } else {
            this._confirm_order(data)
          }
        }
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }

  async generateLink(orderId) {
    try {
      const link = await firebase.dynamicLinks().buildShortLink(
        {
          link: `https://onthegocleaners.page.link?open_app/${orderId}`,
          // link: `https://onthegocleaners.com?open_app/${orderId}`,
          domainUriPrefix: 'https://onthegocleaners.page.link',
          android: {
            packageName: 'com.otgc.onthegocleaners', // Android package name
            // fallbackUrl: 'https://mytogmaapp.com/fallback', // Fallback URL for non-app users
          },
          ios: {
            appStoreId: '1436606731',
            bundleId: 'com.onTheGoCleaners.app',
            // customScheme: 'com.Rate-It-now',
          },
          navigation: {
            forcedRedirectEnabled: true,
          },
        },
        firebase.dynamicLinks.ShortLinkType.SHORT,
      );
      return link
    }
    catch (error) {
      console.error('Error generating dynamic link:', error);
    }
  }

  _confirm_order(data) {
    console.log("_confirm_order ---------------> ", data)
    Utils.makeApiRequest(
      'confirm-order?orderVia=App',
      JSON.stringify(data),
      this.props.appData.token,
      'POST',
      'order',
      true,
    )
      .then(async result => {
        console.log("confirm-order?orderVia=App ----------> ", result)
        if (this._mounted) {
          this.setState({ showFullScreenLoader: false });
          if (result.status === false) {
            let message = result?.message || result?.msg;
            if (message) {
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert('', message);
              }
            } else {
              if (this.props.navigation.isFocused()) {
                Utils.displayAlert(
                  '',
                  'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
                );
              }
            }
          } else if (result.status) {
            let count = Number(this.props.isOrderSchedule?.isOrderSchedule) + 1
            this.props.setOderSchedule({ isOrderSchedule: count })
            if (count % 3 == 0) {
              store.dispatch(ActionCreators.setDoneRate({ isDoneRate: false }))
            }
            let params = {
              appURL: await this.generateLink(result.data.id),
              orderId: result.data.id
            }
            Utils.makeApiRequest(
              'app-url/update',
              JSON.stringify(params),
              this.props.appData.token,
              'PATCH',
              'order',
              true,
            ).then(result => {
              if (result.status) {
                Utils.displayAlert(
                  'Thank You!',
                  'Your order has been placed',
                  'CLOSE',
                  null,
                  () => {
                    this.props.clearScheduleOrderData();
                    this.props.navigation.goBack();
                    this.props.navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [
                          {
                            name: 'MyOrdersNav',
                          },
                        ],
                      }),
                    );
                  },
                  false,
                  false,
                );
              }
            })

          } else {
            if (this.props.navigation.isFocused()) {
              Utils.displayAlert(
                '',
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
      // if (day === 6) { // 0 for Sunday, 6 for Saturday
      //   const dateStr = `${year}-${month.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      //   sat.push({ dateStr });
      // }
    }

    const marked = {};


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

  handleMonthChange = (newMonth, isDayPress) => {
    this.setState({ loadingPickup: true })
    this.disableWeekends(newMonth.month, newMonth.year, newMonth.dateString, isDayPress);
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


    const marked = {};
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
            this.blockDeliveryDates[this.state.delivery_data.pickup_date] = {
              selected: true,
              marked: true
            };
          }
          this.setState({ markedDeliveryDate: this.blockDeliveryDates, loadingDelivery: false });
        }
      }
    });
  };
  handleDeliveryMonthChange = (newMonth, isDayPress) => {
    this.setState({ loadingDelivery: true })
    this.disableDeliveryWeekends(newMonth.month, newMonth.year, newMonth.dateString, isDayPress);
  };

  renderTimeslots() {
    // if (this.state.timeslots == '') {
    //   return (
    //     <View style={[styles.card, localStyle.calendarCard]}>
    //       <Text style={localStyle.noTimeslotAvailText}>
    //         Please select date!!!
    //       </Text>
    //     </View>
    //   );
    // }
    if (this.state.data.pickup_date == '') {
      return <View />;
    }
    if (!this.state.loadingTimeslots) {
      if (
        this.state.timeslots.filter(i => i.disable === true)?.length !==
        this.state.timeslots?.length
      ) {
        return (
          <RadioButtonScheduleOrder
            data={this.state.timeslots}
            selectedFrom={this.state.data.pickup_time_from}
            selectedTo={this.state.data.pickup_time_to}
            onPress={this.onSelectTime}
            addressData={this.state.addressData}
            appData={this.props.appData}
            selectedDate={this.state.data.pickup_date}
            isShowingDeliverySlot={false}
            checkService={(this.checkService() == 3 || this.checkService() == 1)}
          />
        );
      } else {
        return (
          <View style={[styles.card, localStyle.calendarCard]}>
            <Text style={localStyle.noTimeslotAvailText}>
              Sorry! No times left today - Please choose another date
            </Text>
          </View>
        );
      }
    } else {
      return (
        <View style={[styles.card, localStyle.calendarCard, localStyle.loader]}>
          <LoaderView loading={this.state.loadingTimeslots} />
        </View>
      );
    }
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

  renderDeliveryTimeslots() {
    if (this.state.delivery_data.pickup_date == '') {
      return <View />;
    }
    if (!this.state.loadingDeliveryTimeslots && !this.state.loadingTimeslots) {
      if (
        this.state.deliveytimeslots.filter(i => i.disable === true)?.length !==
        this.state.deliveytimeslots?.length
      ) {
        return (
          <RadioButtonScheduleOrder
            data={this.state.deliveytimeslots}
            selectedFrom={this.state.delivery_data.pickup_time_from}
            selectedTo={this.state.delivery_data.pickup_time_to}
            onPress={this.onSelectTime}
            addressData={this.state.addressData}
            appData={this.props.appData}
            selectedDate={this.state.deliveryNextDate}
            isShowingDeliverySlot={this.state.showSameDay}
            isDeliveryData={true}
            checkService={(this.checkService() == 3 || this.checkService() == 1)}
          />
        );
      } else {
        return (
          <View style={[styles.card, localStyle.calendarCard]}>
            <Text style={localStyle.noTimeslotAvailText}>
              Sorry! No times left today - Please choose another date
            </Text>
          </View>
        );
      }
    } else {
      return (
        <View style={[styles.card, localStyle.calendarCard, localStyle.loader]}>
          <LoaderView loading={this.state.loadingDeliveryTimeslots} />
        </View>
      );
    }
  }

  renderWashAndFoldPreferences(preferences = []) {
    if (preferences.length <= 0) {
      // return <Text style={localStyle.text}>   No preferences selected</Text>
      return;
    }
    return preferences.map((preference, index) => {
      return (
        <View key={index} style={localStyle.preferenceRow}>
          <Text style={[localStyle.text, localStyle.preferenceType]}>
            {'   '} {preference.name}
          </Text>
          <Text style={localStyle.preferenceHyphen}></Text>
          <Text style={[localStyle.text, localStyle.preferenceText]}></Text>
          {/* <Text style={[ localStyle.text, localStyle.preferenceType ]}>{'   '}{index+1}. {preference.name}</Text>
                    <Text style={ localStyle.preferenceHyphen }>-</Text>
                    <Text style={[ localStyle.text, localStyle.preferenceText ]}>{preference.option}</Text> */}
        </View>
      );
    });
  }

  renderDryCleaningPreferences(preferences = []) {
    if (preferences.length <= 0) {
      // return <Text style={localStyle.text}>   No preferences selected</Text>
      return;
    }
    return preferences.map((preference, index) => {
      return (
        <View key={index} style={localStyle.preferenceRow}>
          <Text style={[localStyle.text, localStyle.preferenceType]}>
            {'   '} {preference.name}
          </Text>
          <Text style={localStyle.preferenceHyphen}></Text>
          <Text style={[localStyle.text, localStyle.preferenceText]}></Text>
        </View>
      );
    });
  }

  renderServiesAndPrefernces(
    services = [],
    washAndFoldPreferences = [],
    dryCleaningPreferences = [],
  ) {
    if (services.length === 2) {
      return (
        <View>
          <View style={localStyle.firstRowOfTwoRows}>
            <Text style={[localStyle.text]}>1. Wash & Fold</Text>
            <Text style={[localStyle.label]}>{'   '}PREFERENCES</Text>
            <View>
              {this.renderWashAndFoldPreferences(washAndFoldPreferences)}
            </View>
          </View>
          <View style={localStyle.lastRowOfTwoRows}>
            <Text style={[localStyle.text]}>2. Dry Cleaning</Text>
            <Text style={[localStyle.label]}>{'   '}PREFERENCES</Text>
            <View>
              {this.renderDryCleaningPreferences(dryCleaningPreferences)}
            </View>
          </View>
        </View>
      );
    } else if (services.length == 1) {
      if (services[0] == 'Wash & Fold') {
        return (
          <View style={localStyle.firstRowOfTwoRows}>
            <Text style={[localStyle.text]}>Wash & Fold</Text>
            <Text style={[localStyle.label]}>{'   '}PREFERENCES</Text>
            <View>
              {this.renderWashAndFoldPreferences(washAndFoldPreferences)}
            </View>
          </View>
        );
      } else {
        return (
          <View style={localStyle.lastRowOfTwoRows}>
            <Text style={[localStyle.text]}>Dry Cleaning</Text>
            <Text style={[localStyle.label]}>{'   '}PREFERENCES</Text>
            <View>
              {this.renderDryCleaningPreferences(dryCleaningPreferences)}
            </View>
          </View>
        );
      }
    } else {
      return <Text>---</Text>;
    }
  }

  async fetchState() {
    try {
      const response = await Utils.makeApiRequest(
        ``,
        { country_id: 1 },
        this.props.appData.token,
        'GET',
        'state',
      );
      if (response.status) {
        this.setState({
          ...this.state,
          state: response.data,
        });
        return response.data;
      } else {
        Utils.displayAlert(
          '',
          'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
        );
        this.setState({ loading: false });
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async fetchCity(state_id) {
    try {
      const response = await Utils.makeApiRequest(
        `state/${state_id}`,
        { country_id: 1 },
        this.props.appData.token,
        'GET',
        'city',
      );
      if (response.status) {
        this.setState({
          ...this.state,
          city: response.data[0],
        });
        return response.data;
      } else {
        Utils.displayAlert(
          '',
          'Our app is currently under maintenance.  Please use our website OnTheGoCleaners.com or email Support@OnTheGoCleaners.com',
        );
        this.setState({ loading: false });
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
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
      this.setState({
        same_day_preferences: data,
      });
      this.props.setScheduleOrderDataServicesAndPreferences({
        ...this.props.servicesAndPreferences,
        preferences: [...this.props.servicesAndPreferences?.preferences, data],
      });
    } else {
      this.setState({
        same_day_preferences: data,
      });
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
  fetchSameDayPreferences = () => {
    const sameDayPrefencesData = this.props.preferencesNameList['1']?.filter(
      sameDay => sameDay.id === 14,
    );
    return sameDayPrefencesData[0];
  };

  checkService() {
    const ordersData = this.state.orderData;
    let service = this.state.orderData?.services?.split(', ')
    if (service.length == 1 && service?.includes(AppStrings.WASH_AND_FOLD)) {
      return 1;
    } else if (service.length == 1 && service?.includes(AppStrings.DRY_CLEANING_AND_WASH_PRESS)) {
      return 2;
    } else if (service.length == 2 && service?.includes(AppStrings.WASH_AND_FOLD) && service?.includes(AppStrings.DRY_CLEANING_AND_WASH_PRESS)) {
      return 3;
    } else {
      return null; // Handle other cases as needed
    }
  }

  render() {
    let {
      ordersCardData,
      ordersPickupAddressData,
      ordersItemData,
      ordersPreference_Data,
    } = this.state.orderData;
    const ordersData = this.state.orderData;

    ordersCardData = ordersData?.UserCard;
    ordersPickupAddressData = ordersData?.UserAddress;
    ordersPreference_Data = ordersData?.preferences;
    const sameDayPrefences = this.fetchSameDayPreferences();
    let pickup_date = '---',
      delivery_date = '---',
      timeslot = '---',
      card_no = '---',
      address = '---',
      services = [],
      washAndFoldPreferences = [],
      dryCleaningPreferences = [];
    if (this.state.loadingBlockDates) {
      return <LoaderView loading={this.state.loadingBlockDates} />;
    }

    if (ordersData) {
      if (ordersData.pickup_date) {
        pickup_date = new Date(ordersData.pickup_date);
        pickup_date =
          [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ][pickup_date.getMonth()] +
          ' ' +
          String(pickup_date.getDate()) +
          ', ' +
          String(pickup_date.getFullYear());
      }

      if (ordersData.delivery_date) {
        delivery_date = new Date(ordersData.delivery_date);
        delivery_date =
          [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ][delivery_date.getMonth()] +
          ' ' +
          String(delivery_date.getDate()) +
          ', ' +
          String(delivery_date.getFullYear());
      }

      timeslot = ordersData.from_slot + ' - ' + ordersData.to_slot;

      services = ordersData?.services?.split(',');
    }

    if (ordersCardData) {
      card_no = ordersCardData.card_no;
    }

    if (ordersPreference_Data) {
      for (let i = 0; i < ordersPreference_Data.length; i++) {
        if (ordersPreference_Data[i].preference_id !== 14) {
          if (ordersPreference_Data[i].category_id == 1) {
            washAndFoldPreferences.push({
              name: ordersPreference_Data[i].preference_name,
              option: 'Yes',
            });
          } else if (ordersPreference_Data[i].category_id == 2) {
            dryCleaningPreferences.push({
              name: ordersPreference_Data[i].preference_name,
              option: 'Yes',
            });
          }
        }
      }
    }
    if (ordersPickupAddressData) {
      address = ordersPickupAddressData.first_name
        ? ordersPickupAddressData.first_name.charAt(0).toUpperCase() +
        ordersPickupAddressData.first_name.substr(1).toLowerCase() +
        ' ' +
        ordersPickupAddressData.last_name.charAt(0).toUpperCase() +
        ordersPickupAddressData.last_name.substr(1).toLowerCase() +
        '\n' +
        ordersPickupAddressData.address2 +
        '\n' +
        ordersPickupAddressData.address1 +
        '\n' +
        this.state.city?.name +
        ', ' +
        this.state.state[0]?.name +
        ' ' +
        ordersPickupAddressData.zip_code +
        '\n' +
        '\n'
        : '---';
      address += ordersPickupAddressData.doorman_building
        ? ordersPickupAddressData.doorman_building.toLowerCase() == 'yes'
          ? 'Doorman Building: Yes'
          : 'Doorman Building: No'
        : '';
    }
    const markedDatArray = JSON.parse(JSON.stringify(this.state.markedDate));
    const markedDeliveryDatArray = JSON.parse(JSON.stringify(this.state.markedDeliveryDate));
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3b2eb6', '#21e381']}
          style={styles.container}>
          {this.state.loading && (
            <View style={localStyle.loaderContainer}>
              <LoaderView loading={this.state.loading} />
            </View>
          )}
          <LoaderFullScreen
            loading={this.state.showFullScreenLoader}
            message={this.state.message}
          />
          <ScrollView
            style={localStyle.scrollView}
            ref={view => {
              this.scrollView = view;
            }}
            onContentSizeChange={() => {
              // if (this.scrollView) {
              //   this.scrollView.scrollTo({ y: 700, animated: true });
              // }
            }}>
            <View style={[styles.card, localStyle.card, localStyle.topCard]}>
              <View style={localStyle.content}>
                <View style={localStyle.row}>
                  <Text style={localStyle.label}>NAME</Text>
                  <Text style={localStyle.text}>{this.props.appData.name}</Text>
                </View>
                <View style={localStyle.row}>
                  <Text style={localStyle.label}>SERVICES</Text>
                  {services?.length <= 0 ? (
                    <Text>---</Text>
                  ) : (
                    this.renderServiesAndPrefernces(
                      services,
                      washAndFoldPreferences,
                      dryCleaningPreferences,
                    )
                  )}
                </View>
                {/* <View style={localStyle.row}>
                                    <Text style={localStyle.label}>ADDITIONAL CLEANING INSTRUCTIONS</Text>
                                    <Text style={localStyle.text}>{ordersData && ordersData.service_instructions ? ordersData.service_instructions : '---'}</Text>
                                </View> */}

                {services?.includes('Wash & Fold') && (
                  <View style={localStyle.row}>
                    <View style={localStyle.editRow}>
                      <Text style={localStyle.label}>
                        ADDITIONAL WASH & FOLD INSTRUCTIONS
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          this.setState(prevState => ({
                            showServiceInstruction:
                              !prevState.showServiceInstruction,
                          }))
                        }>
                        <Image
                          source={Images.editReviewIcon}
                          style={localStyle.editIcon}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                    {!this.state.showServiceInstruction && (
                      <Text style={localStyle.text}>
                        {this.state.service_instructions
                          ? this.state.service_instructions
                          : '---'}
                      </Text>
                    )}
                  </View>
                )}

                {this.state.showServiceInstruction && (
                  <View style={localStyle.promocodeContainer}>
                    <View
                      style={[
                        styles.card,
                        localStyle.promocodeTipInputContainer,
                      ]}>
                      <TextInput
                        style={[localStyle.textInput]}
                        underlineColorAndroid="transparent"
                        returnKeyType="done"
                        autoCapitalize="none"
                        placeholder="We will try and honor but cannot guarantee"
                        autoCorrect={false}
                        value={this.state.service_instructions}
                        onChangeText={value => {
                          this.setState({ service_instructions: value });
                        }}
                      />
                    </View>
                  </View>
                )}
                {services?.includes('Dry Cleaning / Wash & Press') && (
                  <View style={localStyle.row}>
                    <View style={localStyle.editRow}>
                      <Text style={localStyle.label}>
                        ADDITIONAL DRY CLEANING / WASH & PRESS INSTRUCTIONS
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          this.setState(prevState => ({
                            showDryInstructions: !prevState.showDryInstructions,
                          }))
                        }>
                        <Image
                          source={Images.editReviewIcon}
                          style={localStyle.editIcon}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                    {!this.state.showDryInstructions && (
                      <Text style={localStyle.text}>
                        {this.state.dry_instructions
                          ? this.state.dry_instructions
                          : '---'}
                      </Text>
                    )}
                  </View>
                )}

                {this.state.showDryInstructions && (
                  <View style={localStyle.promocodeContainer}>
                    <View
                      style={[
                        styles.card,
                        localStyle.promocodeTipInputContainer,
                      ]}>
                      <TextInput
                        style={[localStyle.textInput]}
                        underlineColorAndroid="transparent"
                        returnKeyType="done"
                        autoCapitalize="none"
                        placeholder="We will try and honor but cannot guarantee"
                        autoCorrect={false}
                        value={this.state.dry_instructions}
                        onChangeText={value => {
                          this.setState({ dry_instructions: value });
                        }}
                      />
                    </View>
                  </View>
                )}

                <View style={localStyle.row}>
                  <View style={localStyle.editRow}>
                    <Text style={localStyle.label}>
                      DRIVER/DELIVERY INSTRUCTIONS
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        this.setState(prevState => ({
                          showDriverDetails: !prevState.showDriverDetails,
                        }))
                      }>
                      <Image
                        source={Images.editReviewIcon}
                        style={localStyle.editIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                  {!this.state.showDriverDetails && (
                    <Text style={localStyle.text}>
                      {this.state.driver_instructions
                        ? this.state.driver_instructions
                        : '---'}
                    </Text>
                  )}
                </View>
                {this.state.showDriverDetails && (
                  <View style={localStyle.promocodeContainer}>
                    <View
                      style={[
                        styles.card,
                        localStyle.promocodeTipInputContainer,
                      ]}>
                      <TextInput
                        style={[localStyle.textInput]}
                        underlineColorAndroid="transparent"
                        returnKeyType="done"
                        autoCapitalize="none"
                        placeholder="This box is not for scheduling delivery.  If you do not have a doorman, please schedule with your driver."
                        autoCorrect={false}
                        value={this.state.driver_instructions}
                        onChangeText={value => {
                          // console.log("value -------> ", value)
                          this.setState({ driver_instructions: value });
                        }}
                      />
                    </View>
                  </View>
                )}
                <View style={localStyle.row}>
                  <Text style={localStyle.label}>PICKUP ADDRESS</Text>
                  <Text style={localStyle.text}>{address}</Text>
                </View>
                <View style={localStyle.row}>
                  <Text style={localStyle.label}>PAYMENT TYPE</Text>
                  <Text style={localStyle.text}>
                    {card_no !== '---' ? 'Card (' + card_no + ')' : '---'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={localStyle.promocodeContainer}>
              <Text style={localStyle.headingTipAndPromocode}>PROMO CODE</Text>
              <View
                style={[
                  styles.card,
                  localStyle.card,
                  localStyle.promocodeTipInputContainer,
                ]}>
                <TextInput
                  style={[localStyle.textInput]}
                  underlineColorAndroid="transparent"
                  returnKeyType="done"
                  autoCapitalize="none"
                  placeholderTextColor={'silver'}
                  placeholder="Applied to any amount over $25 minimum"
                  autoCorrect={false}
                  value={this.state.promocode}
                  onChangeText={code => {
                    this.setState({ promocode: code });
                  }}
                />
              </View>
            </View>
            <View style={localStyle.promocodeContainer}>
              <Text style={localStyle.headingTipAndPromocode}>
                TIP (OPTIONAL)
              </Text>
              <View
                style={[
                  styles.card,
                  localStyle.card,
                  localStyle.promocodeTipInputContainer,
                ]}>
                <Text style={localStyle.dollarSign}>$ </Text>
                <TextInput
                  style={[localStyle.textInput]}
                  underlineColorAndroid="transparent"
                  returnKeyType="done"
                  keyboardType="numeric"
                  placeholderTextColor={'silver'}
                  placeholder="Enter Tip"
                  value={this.state.tip}
                  onChangeText={tip => {
                    this.setState({ tip: tip });
                  }}
                />
              </View>
            </View>
            <View style={localStyle.selectDate}>
              <Text style={localStyle.heading}>PICKUP DATE</Text>
              <Calendar
                key={this.state.data.pickup_date}
                current={this.state.data.pickup_date ? this.state.data.pickup_date : new Date()}
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
                  todayTextColor: 'black',
                  textDayFontSize: Utils.moderateScale(14),
                  textMonthFontSize: Utils.moderateScale(15),
                  textDayHeaderFontSize: Utils.moderateScale(12),
                  arrowColor: '#ced6d8',
                  selectedDayBackgroundColor: '#17114f',
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
            </View>
            <View style={localStyle.selectTime}>
              <Text style={localStyle.heading}>SELECT TIME</Text>
              {this.renderTimeslots()}
            </View>

            {this.checkService() == 3 && (
              <Text style={localStyle.centerMsg}>
                Please note, the delivery options below are for Wash & Fold services only. Dry Cleaning takes 1-3 business days and will be delivered as soon as possible.                </Text>
            )}

            {(this.state.data.pickup_date && this.state.data.pickup_time_from &&
              (this.checkService() == 1 || this.checkService() == 3)) ?
              <>
                <View style={[localStyle.selectDate, { marginTop: this.checkService() == 3 ? Utils.moderateScale(15) : Utils.moderateScale(30) }]}>
                  <Text style={[localStyle.text, localStyle.heading]}>
                    DELIVERY DATE
                  </Text>

                  <Calendar
                    key={this.state.delivery_data.pickup_date}
                    current={this.state.delivery_data.pickup_date}
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
                      todayTextColor: 'black',
                      textDayFontSize: Utils.moderateScale(14),
                      textMonthFontSize: Utils.moderateScale(15),
                      textDayHeaderFontSize: Utils.moderateScale(12),
                      arrowColor: '#ced6d8',
                      selectedDayBackgroundColor: '#17114f',
                    }}
                    style={[styles.card, localStyle.calendarContainer]}
                    onDayPress={day => {
                      this.setState({ loadingDelivery: true, showSameDay: false })
                      if (this.state.data.pickup_date == day.dateString) {
                        const matchingItem = this.state.timeslots.find(item => item.to_slot === this.state.data.pickup_time_to && item.from_slot === this.state.data.pickup_time_from);
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
                </View>

                <View style={localStyle.selectTime}>
                  <Text style={[localStyle.text, localStyle.heading]}>
                    DELIVERY TIME
                  </Text>
                  {this.renderDeliveryTimeslots()}
                </View>
              </> : null}
            {
              // this.state.turnAroundTimes?.length > 0 &&
              //   services?.includes('Wash & Fold') &&
              //   !this.state.turnAroundTimesLoading && 
              //   (
              <View style={[localStyle.selectTime, { marginTop: 0 }]}>
                {this.checkService() == 2 && (
                  <Text style={{ marginBottom: 15, textAlign: 'justify', marginHorizontal: 10 }}>
                    {/* Please note, the delivery options below are for Wash &
                        Fold service only.  */}
                    Dry cleaning takes 1-3 business days. We will contact you once your clothing is ready for delivery.
                  </Text>
                )}

                {/* <Text style={[localStyle.text, localStyle.heading]}>
                  Turn Around Times
                </Text> */}

              </View>
            }
            {/* {this.state.showSameDay && (
              <View style={localStyle.selectTime}>
                <Text style={[localStyle.text, localStyle.heading]}>
                  SAME DAY
                </Text>
                <View
                  key={sameDayPrefences?.id}
                  style={[styles.card, localStyle.cardsss]}>
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
          {/* <BlueButton
            disable={this.state.showFullScreenLoader}
            onPress={this.onSubmit}
            buttonText="PLACE EXPRESS ORDER"
            style={localStyle.button}
          /> */}
          <TouchableOpacity
            onPress={this.onSubmit}
            style={[localStyle.blueButton]}
            disabled={this.state.showFullScreenLoader}>
            <Text style={localStyle.blueButtonText}>
              PLACE EXPRESS ORDER
            </Text>
          </TouchableOpacity>

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
  },
  cardsss: {
    padding: Utils.scale(15),
  },
  scrollView: {},
  topCard: {
    marginTop: Utils.scale(20),
  },
  content: {
    margin: Utils.scale(15),
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
  twoCols: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  loaderContainer: {
    position: 'absolute',
    height: Utils.height,
    width: Utils.width,
    backgroundColor: 'rgba(150, 200, 200, 0.4)',
    zIndex: 100,
  },
  label: {
    color: '#657f8b',
    fontFamily: 'Poppins-Regular',
    letterSpacing: 1,
    fontSize: Utils.moderateScale(11),
    lineHeight: 22,
  },
  text: {
    fontFamily: 'Poppins-Regular',
    lineHeight: 22,
    color: 'black',
  },
  firstRowOfTwoRows: {
    marginBottom: Utils.scale(6),
  },
  lastRowOfTwoRows: {
    marginTop: Utils.scale(6),
  },
  row: {
    marginTop: Utils.moderateScale(10),
  },
  preferenceRow: {
    flexDirection: 'row',
  },
  preferenceType: {
    flex: 2,
  },
  preferenceText: {
    flex: 0.4,
  },
  preferenceHyphen: {
    flex: 0.2,
    textAlign: 'center',
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
    marginBottom: Utils.moderateScale(15),
  },
  calendarContainer: {
    padding: Utils.moderateScale(10),
  },
  calendarCard: {
    padding: Utils.scale(15),
  },
  button: {
    alignSelf: 'center',
    marginBottom: Utils.scale(5),
  },
  heading: {
    letterSpacing: 1,
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(14),
    marginBottom: Utils.moderateScale(15),
  },
  noTimeslotAvailText: {
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(13),
  },
  loader: {
    height: Utils.moderateVerticalScale(115),
  },
  thankyouImage: {
    height: Utils.moderateScale(150),
    width: Utils.moderateScale(150),
    alignSelf: 'center',
  },
  promocodeTipInputContainer: {
    height: Utils.moderateScale(50),
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  promocodeContainer: {
    marginTop: Utils.verticalScale(10),
  },
  headingTipAndPromocode: {
    alignSelf: 'center',
    marginTop: Utils.moderateScale(10),
    width: '90%',
    marginBottom: Utils.verticalScale(10),
    letterSpacing: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: Utils.moderateScale(14),
    color: 'black',
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
    color: '#17114f',
    fontSize: Utils.moderateScale(14, 0.5),
    width: '90%',
    height: '90%',
    alignSelf: 'center',
  },
  dollarSign: {
    fontFamily: 'Poppins-Regular',
    color: '#17114f',
    fontSize: Utils.moderateScale(14, 0.5),
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editIcon: {
    height: Utils.moderateScale(12),
    width: Utils.moderateScale(12),
    marginTop: 5,
  },
  centerMsg: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: Utils.moderateScale(13),
    color: '#ffff',
    marginBottom: 0,
    marginTop: Utils.moderateScale(10),
    textAlign: Platform.OS == 'android' ? 'left' : 'center',
    marginHorizontal: 20
  },
  blueButton: {
    backgroundColor: '#1a3163',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#171151',
    height: Utils.moderateVerticalScale(40, 0.5),
    width: "85%",
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#171151',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  blueButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Regular',
    letterSpacing: 2,
    fontSize: Utils.moderateScale(14),
  },
});

const mapStateToProps = state => {
  return {
    appData: state.appData.appData,
    servicesAndPreferences:
      state.appData?.scheduleOrderData?.servicesAndPreferences,
    preferences: state.appData?.scheduleOrderData,
    addressData: state.appData.addressData,
    preferencesNameList: state.appData.scheduleOrderData.preferencesNameList,
    //navigation: state.navigation,
    isOrderSchedule: state.appData.isOrderSchedule
  };
};

const mapDispatchToProps = dispatch => {
  return {
    //setPendingOrderList: data => dispatch(ActionCreators.setPendingOrderList(data)),
    setDrawerOpenState: data =>
      dispatch(ActionCreators.setDrawerOpenState(data)),
    setScheduleOrderDataServicesAndPreferences: data =>
      dispatch(ActionCreators.setScheduleOrderDataServicesAndPreferences(data)),
    setScheduleOrderDataPreferencesNameList: data =>
      dispatch(ActionCreators.setScheduleOrderDataPreferencesNameList(data)),
    clearScheduleOrderData: data =>
      dispatch(ActionCreators.clearScheduleOrderData(data)),
    setOderSchedule: data =>
      dispatch(ActionCreators.setOrderSchedule(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExpressOrderScreen);
