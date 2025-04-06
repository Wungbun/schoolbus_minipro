const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    announcements: [],
    showModal: false,
    selectedAnnouncement: {},
    campuses: [],
    startCampusIndex: 0,
    endCampusIndex: 0,
    routes: [],
    campusMap: {},
    schedules: [],
    showSchedules: false,
    selectedSchedule: null,
    seats: [],
    totalSeats: 0,
    availableSeats: 0,
    selectedSeatNumber: null,
    showSeatModal: false
  },

  onLoad() {
    this.loadAnnouncements();
    this.loadCampuses();
  },

  loadAnnouncements() {
    const role = app.globalData.userInfo ? app.globalData.userInfo.role : 'student';
    api.getAnnouncements({ role }).then(res => {
      this.setData({
        announcements: res
      });
    }).catch(err => {
      console.error('公告接口错误：', err);
      wx.showToast({
        title: '加载公告失败',
        icon: 'none'
      });
    });
  },

  loadCampuses() {
    api.getCampuses().then(res => {
      const campusMap = {};
      res.forEach(campus => {
        campusMap[campus.id] = campus.name;
      });
      this.setData({
        campuses: res,
        campusMap: campusMap
      });
    }).catch(err => {
      console.error('校区接口错误：', err);
      wx.showToast({
        title: '加载校区失败',
        icon: 'none'
      });
    });
  },

  bindStartCampusChange(e) {
    this.setData({
      startCampusIndex: e.detail.value
    });
  },

  bindEndCampusChange(e) {
    this.setData({
      endCampusIndex: e.detail.value
    });
  },

  searchRoutes() {
    const { campuses, startCampusIndex, endCampusIndex } = this.data;
    if (startCampusIndex === endCampusIndex) {
      wx.showToast({
        title: '起点和终点不能相同',
        icon: 'none'
      });
      return;
    }

    const startCampusId = campuses[startCampusIndex].id;
    const endCampusId = campuses[endCampusIndex].id;

    api.getRoutesByStartAndEnd({ startCampusId, endCampusId }).then(res => {
      if (res.length === 0) {
        wx.showToast({
          title: '未找到符合条件的线路',
          icon: 'none'
        });
        this.setData({
          routes: [],
          schedules: [],
          showSchedules: false
        });
        return;
      }

      this.setData({
        routes: res
      });

      const routeId = res[0].id;
      this.loadSchedules(routeId);
    }).catch(err => {
      console.error('线路查询错误：', err);
      wx.showToast({
        title: '查询线路失败',
        icon: 'none'
      });
    });
  },

  loadSchedules(routeId) {
    api.getSchedulesByRouteId({ routeId }).then(res => {
      if (res.length === 0) {
        wx.showToast({
          title: '该线路暂无班次',
          icon: 'none'
        });
      }
      this.setData({
        schedules: res,
        showSchedules: true,
        showSeatModal: false
      });
    }).catch(err => {
      console.error('班次查询错误：', err);
      wx.showToast({
        title: '查询班次失败',
        icon: 'none'
      });
    });
  },

  selectSchedule(e) {
    if (!app.globalData.userInfo) {
      wx.showModal({
        title: '提示',
        content: '您尚未登录，请先登录',
        confirmText: '去登录',
        cancelText: '取消',
        success: res => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
              success: () => {
                console.log('跳转到登录页面成功');
              },
              fail: err => {
                console.error('跳转到登录页面失败：', err);
                wx.showToast({
                  title: '跳转失败，请稍后重试',
                  icon: 'none'
                });
              }
            });
          }
        }
      });
      return;
    }

    const scheduleId = e.currentTarget.dataset.id;
    const schedule = this.data.schedules.find(item => item.id === scheduleId);
    if (schedule.status !== 'pending') {
      wx.showToast({
        title: '该班次不可预约',
        icon: 'none'
      });
      return;
    }

    this.setData({
      selectedSchedule: schedule,
      showSchedules: false,
      showSeatModal: true
    });

    api.getSeatsByScheduleId({ scheduleId }).then(res => {
      if (!res || !res.seats) {
        wx.showToast({
          title: '加载座位失败',
          icon: 'none'
        });
        this.setData({ showSeatModal: false, showSchedules: true, selectedSchedule: null });
        return;
      }

      const totalSeats = res.totalSeats;
      const seatsPerRow = 10;
      const rows = Math.ceil(totalSeats / seatsPerRow);
      let seats = [];
      let seatIndex = 1;
      for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < seatsPerRow; j++) {
          if (seatIndex <= totalSeats) {
            const seat = res.seats.find(s => s.seatNumber === seatIndex);
            row.push({
              seatNumber: seatIndex,
              isOccupied: seat ? seat.isOccupied : false
            });
            seatIndex++;
          }
        }
        seats.push(row);
      }

      this.setData({
        seats: seats,
        totalSeats: res.totalSeats,
        availableSeats: res.availableSeats,
        selectedSeatNumber: null
      });
    }).catch(err => {
      console.error('座位查询错误：', err);
      wx.showToast({
        title: '加载座位失败',
        icon: 'none'
      });
      this.setData({ showSeatModal: false, showSchedules: true, selectedSchedule: null });
    });
  },

  selectSeat(e) {
    if (!app.globalData.userInfo) {
      wx.showModal({
        title: '提示',
        content: '您尚未登录，请先登录',
        confirmText: '去登录',
        cancelText: '取消',
        success: res => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
              success: () => {
                console.log('跳转到登录页面成功');
              },
              fail: err => {
                console.error('跳转到登录页面失败：', err);
                wx.showToast({
                  title: '跳转失败，请稍后重试',
                  icon: 'none'
                });
              }
            });
          }
        }
      });
      return;
    }

    const seatNumber = parseInt(e.currentTarget.dataset.seatNumber);
    const seat = this.data.seats.flat().find(item => item.seatNumber === seatNumber);
    if (seat.isOccupied) {
      wx.showToast({
        title: '该座位已被占用',
        icon: 'none'
      });
      return;
    }

    this.setData({
      selectedSeatNumber: seatNumber
    });
  },

  confirmSeat() {
    if (!this.data.selectedSeatNumber) {
      wx.showToast({
        title: '请选择一个座位',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认预约',
      content: `您选择了座位 ${this.data.selectedSeatNumber}，是否确认预约？`,
      success: res => {
        if (res.confirm) {
          this.createReservation();
        }
      }
    });
  },

  createReservation() {
    if (!app.globalData.userInfo) {
      wx.showModal({
        title: '提示',
        content: '您尚未登录，请先登录',
        confirmText: '去登录',
        cancelText: '取消',
        success: res => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
              success: () => {
                console.log('跳转到登录页面成功');
              },
              fail: err => {
                console.error('跳转到登录页面失败：', err);
                wx.showToast({
                  title: '跳转失败，请稍后重试',
                  icon: 'none'
                });
              }
            });
          }
        }
      });
      return;
    }

    const { selectedSchedule, selectedSeatNumber } = this.data;
    const data = {
      userId: app.globalData.userInfo.userId,
      scheduleId: selectedSchedule.id,
      seatNumber: selectedSeatNumber
    };

    api.createReservation(data).then(res => {
      if (res.success) {
        wx.showToast({
          title: '预约成功',
          icon: 'success'
        });
        this.selectSchedule({ currentTarget: { dataset: { id: selectedSchedule.id } } });
      } else {
        wx.showToast({
          title: res.message || '预约失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('预约错误：', err);
      wx.showToast({
        title: '预约失败',
        icon: 'none'
      });
    });
  },

  backToSchedules() {
    this.setData({
      showSeatModal: false,
      showSchedules: true,
      selectedSchedule: null,
      seats: [],
      totalSeats: 0,
      availableSeats: 0,
      selectedSeatNumber: null
    });
  },

  showAnnouncementDetail(e) {
    const announcementId = e.currentTarget.dataset.id;
    const announcement = this.data.announcements.find(item => item.id === announcementId);
    if (announcement) {
      this.setData({
        showModal: true,
        selectedAnnouncement: announcement
      });
    }
  },

  hideAnnouncementDetail() {
    this.setData({
      showModal: false,
      selectedAnnouncement: {}
    });
  },

  closeSeatModal() {
    this.setData({
      showSeatModal: false,
      showSchedules: true,
      selectedSchedule: null,
      seats: [],
      totalSeats: 0,
      availableSeats: 0,
      selectedSeatNumber: null
    });
  }
});