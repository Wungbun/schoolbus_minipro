App({
  onLaunch() {
    // 模拟用户登录（后续会替换为微信登录）
    wx.setStorageSync('userId', 1);
  },
  globalData: {
    apiBaseUrl: 'http://localhost:8080'
  }
});