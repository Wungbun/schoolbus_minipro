const app = getApp();

Page({
  data: {
    userInfo: null,
    reservations: [],
    showModal: false,
    selectedSchedule: null,
    routeInfo: {
      startCampusName: '',
      endCampusName: ''
    }
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
    if (app.globalData.userInfo) {
      this.loadReservations();
    }
  },

  checkLoginStatus() {
    const userInfo = app.globalData.userInfo;
    this.setData({
      userInfo: userInfo
    });
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
    }
  },

  goToLogin() {
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
  },

  loadReservations() {
    const userId = app.globalData.userInfo.userId;
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/reservations?userId=${userId}`,
      method: 'GET',
      success: res => {
        if (res.data) {
          const reservations = res.data.map(item => ({
            ...item,
            createdAt: this.formatDateTime(item.createdAt),
            updatedAt: this.formatDateTime(item.updatedAt)
          }));
          this.setData({
            reservations: reservations
          });
        } else {
          wx.showToast({
            title: '获取预约记录失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('获取预约记录失败：', err);
        wx.showToast({
          title: '获取预约记录失败',
          icon: 'none'
        });
      }
    });
  },

  showDetails(e) {
    const reservationId = e.currentTarget.dataset.id;
    const reservation = this.data.reservations.find(item => item.id === reservationId);
    if (!reservation) {
      wx.showToast({
        title: '预约记录不存在',
        icon: 'none'
      });
      return;
    }

    // 获取车次信息
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/schedules/${reservation.scheduleId}`,
      method: 'GET',
      success: res => {
        if (res.data) {
          const schedule = {
            ...res.data,
            departureTime: this.formatDateTime(res.data.departureTime)
          };
          this.setData({
            selectedSchedule: schedule,
            showModal: true
          });

          // 获取线路信息
          this.loadRouteInfo(schedule.routeId);
        } else {
          wx.showToast({
            title: '获取车次信息失败',
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('获取车次信息失败：', err);
        wx.showToast({
          title: '获取车次信息失败',
          icon: 'none'
        });
      }
    });
  },

  loadRouteInfo(routeId) {
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/routes/${routeId}`,
      method: 'GET',
      success: res => {
        if (res.data) {
          const route = res.data;
          // 获取起点和终点校园名称
          this.loadCampusInfo(route.startCampusId, route.endCampusId);
        } else {
          this.setData({
            routeInfo: { startCampusName: '未知', endCampusName: '未知' }
          });
        }
      },
      fail: err => {
        console.error('获取线路信息失败：', err);
        this.setData({
          routeInfo: { startCampusName: '未知', endCampusName: '未知' }
        });
      }
    });
  },

  loadCampusInfo(startCampusId, endCampusId) {
    // 获取起点校园
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/campuses/${startCampusId}`,
      method: 'GET',
      success: res => {
        if (res.data) {
          this.setData({
            'routeInfo.startCampusName': res.data.name
          });
        } else {
          this.setData({
            'routeInfo.startCampusName': '未知'
          });
        }
      },
      fail: err => {
        console.error('获取起点校园信息失败：', err);
        this.setData({
          'routeInfo.startCampusName': '未知'
        });
      }
    });

    // 获取终点校园
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/campuses/${endCampusId}`,
      method: 'GET',
      success: res => {
        if (res.data) {
          this.setData({
            'routeInfo.endCampusName': res.data.name
          });
        } else {
          this.setData({
            'routeInfo.endCampusName': '未知'
          });
        }
      },
      fail: err => {
        console.error('获取终点校园信息失败：', err);
        this.setData({
          'routeInfo.endCampusName': '未知'
        });
      }
    });
  },

  hideDetails() {
    this.setData({
      showModal: false,
      selectedSchedule: null,
      routeInfo: { startCampusName: '', endCampusName: '' }
    });
  },

  cancelReservation(e) {
    const reservationId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要取消此预约吗？',
      success: res => {
        if (res.confirm) {
          wx.request({
            url: `${app.globalData.apiBaseUrl}/api/reservations/${reservationId}/cancel`,
            method: 'PUT',
            success: res => {
              if (res.data) {
                wx.showToast({
                  title: '取消成功',
                  icon: 'success'
                });
                this.loadReservations();
              } else {
                wx.showToast({
                  title: '取消失败',
                  icon: 'none'
                });
              }
            },
            fail: err => {
              console.error('取消预约失败：', err);
              wx.showToast({
                title: '取消失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  formatDateTime(dateTime) {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  }
});