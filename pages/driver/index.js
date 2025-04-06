const api = require('../../utils/api');

Page({
  data: {
    announcements: [],
    showModal: false,
    selectedAnnouncement: {}
  },
  onLoad() {
    this.loadAnnouncements();
  },
  loadAnnouncements() {
    const role = wx.getStorageSync('role') || 'driver';
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
  }
});