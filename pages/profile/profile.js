const app = getApp();

Page({
  data: {
    userInfo: null
  },

  onLoad() {
    this.checkUserInfo();
  },

  onShow() {
    // 每次页面显示时重新检查登录状态
    this.checkUserInfo();
  },

  checkUserInfo() {
    const userInfo = app.globalData.userInfo;
    this.setData({
      userInfo: userInfo
    });
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

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: res => {
        if (res.confirm) {
          wx.removeStorageSync('userId');
          wx.removeStorageSync('role');
          wx.removeStorageSync('name');
          app.globalData.userInfo = null;
          this.setData({
            userInfo: null
          });
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  }
});