const app = getApp();

const request = (url, method, data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBaseUrl}${url}`,
      method: method,
      data: data,
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
};

module.exports = {
  getAnnouncements: (params) => request(`/api/public/announcements?role=${params.role}`, 'GET'),
  getSchedules: () => request('/api/admin/schedules', 'GET'),
  getRoutes: () => request('/api/admin/routes', 'GET'),
  createReservation: (data) => request('/api/reservations', 'POST', data),
  getReservations: (userId) => request(`/api/reservations?userId=${userId}`, 'GET'),
  deleteReservation: (id) => request(`/api/reservations/${id}`, 'DELETE'),
  getCampuses: () => request('/api/public/campuses', 'GET'),
  getRoutesByStartAndEnd: (params) => request(`/api/public/routes?startCampusId=${params.startCampusId}&endCampusId=${params.endCampusId}`, 'GET'),
  getSchedulesByRouteId: (params) => request(`/api/public/schedules?routeId=${params.routeId}`, 'GET'),
  getSeatsByScheduleId: (params) => request(`/api/public/seats?scheduleId=${params.scheduleId}`, 'GET'),
  createReservation: (data) => request('/api/public/reservations', 'POST', data),
  login: (data) => request('/login', 'POST', data) // 新增登录接口
};