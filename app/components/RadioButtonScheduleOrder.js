import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  FlatList,
} from 'react-native';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import * as Utils from '../lib/utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import styles from '../screens/styles';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');
dayjs.locale('en');

export default class RadioButtonScheduleOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeButton: -1,
      addressData: [],
    };
  }

  // componentWillMount() {
  //   for (let i = 0; i < this.props.data.length; i++) {
  //     if (
  //       this.state.activeButton == -1 &&
  //       this.props.selectedFrom == this.props.data[i].from_slot &&
  //       this.props.selectedTo == this.props.data[i].to_slot
  //     ) {
  //       this.setState({activeButton: i});
  //       break;
  //     }
  //   }
  // }

  componentDidMount() {
    for (let i = 0; i < this.props.data.length; i++) {
      if (this.state.activeButton == -1) {
        if (
          this.props.isShowingDeliverySlot &&
          this.props.selectedFrom == this.props.data[i].delivery_from_slot &&
          this.props.selectedTo == this.props.data[i].delivery_to_slot
        ) {
          this.setState({ activeButton: i });
          break;
        } else if (
          this.props.selectedFrom == this.props.data[i].from_slot &&
          this.props.selectedTo == this.props.data[i].to_slot
        ) {
          this.setState({ activeButton: i });
          break;
        }
      }
    }
  }

  // checkZipExist = blockedZip => {
  //   if (this.props?.addressData?.length > 0) {
  //     let addressZipArray = [];
  //     this.props.addressData
  //       ?.filter(zip => zip.primary === 'yes')
  //       ?.map(zip => addressZipArray.push(zip.zip_code));
  //     const zipCodess = blockedZip
  //       ? blockedZip.split(',')?.map(zipCode => zipCode?.trim())
  //       : null;
  //     if (zipCodess) {
  //       const intersection = addressZipArray.filter(element =>
  //         zipCodess?.includes(element?.trim()),
  //       );
  //       if (intersection.length > 0) {
  //         return true;
  //       } else {
  //         return false;
  //       }
  //     } else {
  //       return false;
  //     }
  //   } else {
  //     return false;
  //   }
  // };

  checkZipExist = blockedZip => {
    if (!this.props?.addressData?.length || !blockedZip) {
      return false;
    }
    const addressZipArray = this.props.addressData
      .filter(zip => zip.primary === 'yes')
      .map(zip => zip.zip_code?.trim());

    const zipCodesList = blockedZip.split(',').map(zipCode => zipCode?.trim());
    return addressZipArray.some(element => zipCodesList.includes(element));
  };

  // checkZipExist = blockedZip => {
  //   if (!blockedZip) return false; // If no blocked zip codes, return false

  //   const zipCodess = blockedZip.split(',').map(zipCode => zipCode.trim());
  //   return zipCodess.length > 0; // Return true if any zip codes exist
  // };

  convertTo24HourFormat = time => {
    const [hour, minutes, ampm] = time.match(/(\d+):(\d+) (AM|PM)/).slice(1);
    let hours = parseInt(hour, 10);
    const isPM = ampm === 'PM';

    if (isPM && hours !== 12) {
      hours += 12;
    } else if (!isPM && hours === 12) {
      hours = 0;
    }

    return { hours, minutes: parseInt(minutes, 10) };
  };

  render() {
    let items = [],
      current = [];
    this.props.data.map(item => {
      const currentTime = dayjs().format('h:mm A');
      const appTimeFrame = this.props.isShowingDeliverySlot
        ? item.delivery_from_slot
        : item.from_slot;

      if (appTimeFrame) {
        const t1 = this.convertTo24HourFormat(currentTime);
        const t2 = this.convertTo24HourFormat(appTimeFrame);

        const selectedDate = dayjs(this.props?.selectedDate).date();
        const currentDate = dayjs().date();
        if (t1.hours >= t2.hours && selectedDate === currentDate) {
          item.status = 'inactive';
        }
      } else {
      }
    });
    // for (let i = 0; i < this.props.data.length;) {
    //   console.log('Loop--->I', i)
    //   current = [];
    //   for (let j = 0; i < this.props.data.length && j < 2; i++, j++) {
    //     console.log('Loop--->J', j)
    //     const currentTime = dayjs().format('h:mm A');
    //     const appTimeFrame = this.props.data[i].from_slot;

    //     const t1 = this.convertTo24HourFormat(currentTime);
    //     const t2 = this.convertTo24HourFormat(appTimeFrame);

    //     const selectedDate = dayjs(this.props?.selectedDate).date();
    //     const currentDate = dayjs().date();

    //     if (t1.hours >= t2.hours && selectedDate === currentDate) {
    //       console.log('DATATA_LENGTH-->Time', { selectedDate, t1, t2, ITEM: this.props.data[i] })
    //       this.props.data[i].status = 'inactive';
    //     }

    //     console.log(currentTime?.split(' ')[0]?.split(':')[0]);

    //     current.push(this.props.data[i]);
    //   }
    //   items.push(current);
    // }

    return (
      <View>
        <FlatList
          data={this.props.data}
          // numColumns={2}
          renderItem={({ item, index }) => {
            return (
              <View style={{ flex: 1, padding: 4 }}>
                {(this.props.isShowingDeliverySlot &&
                  item.delivery_from_slot) ||
                (!this.props.isShowingDeliverySlot && item.from_slot) ? (
                  <TouchableOpacity
                    disabled={
                      this.checkZipExist(
                        item.delivery_day !== 'SameDay'
                          ? item.blocked_zips
                          : item.delivery_blocked_zip,
                      ) || item.status === 'inactive'
                    }
                    onPress={() => {
                      this.setState({ activeButton: index * 2 });
                      this.props.onPress(
                        item.turn_around,
                        this.props.isShowingDeliverySlot
                          ? item.delivery_from_slot
                          : item.from_slot,
                        this.props.isShowingDeliverySlot
                          ? item.delivery_to_slot
                          : item.to_slot,
                        item.delivery_day,
                        item.id,
                        this.props.isDeliveryData,
                        item.delivery_day === 'SameDay' ? true : false,
                      );
                    }}
                    style={[
                      styles.card,
                      style.card,
                      style.button,
                      {
                        backgroundColor:
                          this.checkZipExist(
                            item.delivery_day !== 'SameDay'
                              ? item.blocked_zips
                              : item.delivery_blocked_zip,
                          ) || item.status === 'inactive'
                            ? '#b8b8b8'
                            : 'white',
                      },
                    ]}
                  >
                    <View style={style.blockedText}>
                      <Text
                        style={[
                          this.checkZipExist(
                            item.delivery_day !== 'SameDay'
                              ? item.blocked_zips
                              : item.delivery_blocked_zip,
                          ) || item.status === 'inactive'
                            ? style.blockedTextColor
                            : this.state.activeButton === index * 2
                            ? style.activeText
                            : style.inactiveText,
                          {
                            width: item.cost
                              ? Utils.moderateScale(220)
                              : Utils.moderateScale(280),
                          },
                        ]}
                      >
                        {this.props.isShowingDeliverySlot
                          ? item.delivery_from_slot +
                            '-' +
                            item.delivery_to_slot
                          : item.from_slot + '-' + item.to_slot}
                        {!this.props.isDeliveryData &&
                          item.message &&
                          this.props.checkService &&
                          item.status !== 'inactive' && (
                            <Text style={{ color: '#b8b8b8' }}>
                              {' '}
                              {'(' + item.message + ')'}
                            </Text>
                          )}
                      </Text>
                      {/* {this.checkZipExist(item.blocked_zips) &&  */}

                      {/* } */}
                    </View>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      {this.props.isDeliveryData && item.cost ? (
                        <Text
                          style={
                            (this.state.activeButton === index * 2
                              ? style.activeText
                              : this.checkZipExist(
                                  item.delivery_day !== 'SameDay'
                                    ? item.blocked_zips
                                    : item.delivery_blocked_zip,
                                ) || item.status === 'inactive'
                              ? styles.blockedTextColor
                              : style.inactiveText,
                            { marginRight: 10 })
                          }
                        >
                          ${item.cost}
                        </Text>
                      ) : null}
                      <View
                        style={
                          this.checkZipExist(
                            item.delivery_day !== 'SameDay'
                              ? item.blocked_zips
                              : item.delivery_blocked_zip,
                          ) || item.status === 'inactive'
                            ? {
                                width: Utils.moderateScale(14),
                                height: Utils.moderateScale(14),
                              }
                            : this.state.activeButton === index * 2
                            ? style.activeRadio
                            : style.inactiveRadio
                        }
                      />
                    </View>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          }}
        />
      </View>
    );
  }
}

const style = StyleSheet.create({
  card: {
    padding: Utils.moderateScale(15),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: Utils.scale(5),
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondButton: {
    marginLeft: Utils.scale(5),
  },
  activeRadio: {
    backgroundColor: '#171151',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#171151',
    width: Utils.moderateScale(14),
    height: Utils.moderateScale(14),
  },
  inactiveRadio: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#b1b6bb',
    width: Utils.moderateScale(14),
    height: Utils.moderateScale(14),
  },
  activeText: {
    fontFamily: 'Poppins-Regular',
    color: '#171151',
    fontSize: Utils.moderateScale(14),
  },
  inactiveText: {
    fontFamily: 'Poppins-Regular',
    color: '#b1b6bb',
    fontSize: Utils.moderateScale(14),
  },
  blockedTextColor: {
    fontFamily: 'Poppins-Regular',
    color: 'grey',
    fontSize: Utils.moderateScale(14),
  },
  blockedText: {
    flexDirection: 'column',
  },
});
