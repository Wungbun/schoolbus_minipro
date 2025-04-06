const app = getApp();

Page({
  data: {
    formData: {
      username: '',
      password: '',
      name: ''
    },
    showRegister: false // 控制显示登录还是注册表单
  },

  bindUsernameInput(e) {
    this.setData({
      'formData.username': e.detail.value
    });
  },

  bindPasswordInput(e) {
    this.setData({
      'formData.password': e.detail.value
    });
  },

  bindNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    });
  },

  toggleForm() {
    this.setData({
      showRegister: !this.data.showRegister,
      formData: {
        username: '',
        password: '',
        name: ''
      }
    });
  },

  login() {
    const { username, password } = this.data.formData;
    if (!username || !password) {
      wx.showToast({
        title: '请填写用户名和密码',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/public/login`,
      method: 'POST',
      data: {
        username: username,
        password: password
      },
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        if (res.data.success) {
          wx.setStorageSync('userId', res.data.userId);
          wx.setStorageSync('role', res.data.role);
          wx.setStorageSync('name', res.data.name);
          app.globalData.userInfo = {
            userId: res.data.userId,
            role: res.data.role,
            name: res.data.name
          };

          if (res.data.role === 'student' || res.data.role === 'teacher') {
            wx.switchTab({
              url: '/pages/index/index'
            });
          } else if (res.data.role === 'driver') {
            wx.navigateTo({
              url: '/pages/driver/index'
            });
          } else {
            wx.showToast({
              title: '未知角色',
              icon: 'none'
            });
          }

          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      }
    });
  },

  register() {
    const { username, password, name } = this.data.formData;
    if (!username || !password || !name) {
      wx.showToast({
        title: '请填写所有字段',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/public/register`,
      method: 'POST',
      data: {
        username: username,
        password: password,
        name: name,
        role: 'student'
      },
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        if (res.data.success) {
          wx.setStorageSync('userId', res.data.userId);
          wx.setStorageSync('role', 'student');
          wx.setStorageSync('name', name);
          app.globalData.userInfo = {
            userId: res.data.userId,
            role: 'student',
            name: name
          };
          wx.switchTab({
            url: '/pages/index/index'
          });
          wx.showToast({
            title: '注册成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.showToast({
          title: '注册失败',
          icon: 'none'
        });
      }
    });
  }
});