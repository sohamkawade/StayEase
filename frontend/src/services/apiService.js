import axios from "axios";

// const API_URL = "http://localhost:8081/api";
const API_URL = import.meta.env.VITE_API_BASE_URL;

console.log(API_URL)


const axiosInstance = axios.create({
  withCredentials: true,
  maxRedirects: 5,
  validateStatus: function (status) {
    return true;
  },
  transformResponse: [
    function (data) {
      if (typeof data === 'string') {
        try {
          return JSON.parse(data);
        } catch (e) {
          return data;
        }
      }
      return data;
    }
  ]
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const signupUser = async (userData) => {
  return await axiosInstance.post(`${API_URL}/auth/user/signup`, userData);
};

const loginUser = async (userData) => {
  return await axiosInstance.post(`${API_URL}/auth/login`, userData);
};

const googleOAuth = async (googleData) => {
  return await axiosInstance.post(`${API_URL}/auth/google`, googleData);
};

const getUserProfile = async (userId) => {
  return await axiosInstance.get(`${API_URL}/user/${userId}`);
};

const getAdminProfile = async (adminId) => {
  return await axiosInstance.get(`${API_URL}/admin/${adminId}`);
};

const getManagerProfile = async (managerId) => {
  return await axiosInstance.get(`${API_URL}/manager/${managerId}`);
};

const updateManagerProfile = async (managerData, managerId) => {
  return await axiosInstance.patch(`${API_URL}/manager/${managerId}`, managerData);
};

const changeManagerPassword = async (passwordData, managerId) => {
  return await axiosInstance.put(`${API_URL}/manager/${managerId}/password`, passwordData);
};

const getHotelProfile = async (hotelId) => {
  return await axiosInstance.get(`${API_URL}/hotels/${hotelId}`);
};

const updateUserProfile = async (userData, userId, imageFile) => {
  const formData = new FormData();
  const userDataWithPassword = {
    ...userData,
    password: userData.password || "NO_CHANGE_PASSWORD"
  };
  formData.append("user", JSON.stringify(userDataWithPassword));
  if (imageFile) {
    formData.append("profilePicture", imageFile);
  } else if (userData.profilePicture === "") {
    formData.append("profilePicture", new Blob([], { type: 'image/png' }), "");
  }
  return await axiosInstance.patch(`${API_URL}/auth/user/${userId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

const updateAdminProfile = async (adminData, adminId) => {
  return await axiosInstance.patch(`${API_URL}/auth/admin/${adminId}`, adminData);
};

const addHotel = async (hotelData, imageFile) => {
  const formData = new FormData();
  formData.append("hotel", JSON.stringify(hotelData));
  if (imageFile) {
    formData.append("image", imageFile);
  }
  return await axiosInstance.post(`${API_URL}/hotels/add`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

const updateHotelProfile = async (hotelId, hotelData, imageFile) => {
  const formData = new FormData();
  formData.append("hotel", JSON.stringify(hotelData));
  if (imageFile) {
    formData.append("image", imageFile);
  }
  return await axiosInstance.patch(`${API_URL}/hotels/${hotelId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

const changeAdminPassword = async (passwordData, adminId) => {
  return await axiosInstance.put(`${API_URL}/auth/admin/${adminId}/password`, passwordData);
};


const addRoom = async (hotelId, roomData) => {
  return await axiosInstance.post(`${API_URL}/rooms/add/${hotelId}`, roomData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const getAllRoomsByHotelId = async (hotelId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.status) params.append("status", filters.status);
  if (filters.roomType) params.append("roomType", filters.roomType);
  if (filters.minPrice) params.append("minPrice", filters.minPrice);
  if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.sortDirection) params.append("sortDirection", filters.sortDirection);
  const queryString = params.toString();
  return await axiosInstance.get(`${API_URL}/rooms/${hotelId}${queryString ? `?${queryString}` : ""}`);
};

const getAllHotels = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.status) params.append("status", filters.status);
  if (filters.location) params.append("location", filters.location);
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.sortDirection) params.append("sortDirection", filters.sortDirection);
  const queryString = params.toString();
  return await axiosInstance.get(`${API_URL}/hotels${queryString ? `?${queryString}` : ""}`);
};

const getHotelById = async (hotelId) => {
  return await axiosInstance.get(`${API_URL}/hotels/${hotelId}`);
};

const getRoomByRoomId = async (roomId) => {
  return await axiosInstance.get(`${API_URL}/room/${roomId}`);
};

const bookRoom = async (roomId, userId, totalGuests, checkInDate, checkOutDate) => {
  return await axiosInstance.post(`${API_URL}/bookroom`, {
    roomId,
    userId,
    totalGuests,
    checkInDate,
    checkOutDate
  });
};

const getUserBookings = async (userId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.bookingStatus) params.append("bookingStatus", filters.bookingStatus);
  const queryString = params.toString();
  return await axiosInstance.get(`${API_URL}/bookings/user/${userId}${queryString ? `?${queryString}` : ""}`);
};

const getHotelBookings = async (hotelId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  const queryString = params.toString();
  return await axiosInstance.get(`${API_URL}/bookings/hotel/${hotelId}${queryString ? `?${queryString}` : ""}`);
};

const updateBookingStatus = async (bookingId, status) => {
  return await axiosInstance.patch(`${API_URL}/bookings/${bookingId}/status`, { 
    bookingStatus:status 
  });
};

const deleteBooking = async (bookingId) => {
  return await axiosInstance.delete(`${API_URL}/bookings/${bookingId}`);
};

const cancelBooking = async (bookingId, userId) => {
  return await axiosInstance.post(`${API_URL}/bookings/${bookingId}/cancel?userId=${userId}`);
};

const cancelBookingByUser = async (bookingId, userId) => {
  return await axiosInstance.patch(`${API_URL}/bookings/${bookingId}/cancel/user/${userId}`);
};

const getGuestsByHotel = async (hotelId) => {
  return await axiosInstance.get(`${API_URL}/guests/${hotelId}`);
};

const sendEmailToGuest = async (emailData) => {
  return await axiosInstance.post(`${API_URL}/guests/send-email`, emailData);
};

const getStats = async () => {
  return await axiosInstance.get(`${API_URL}/stats`);
};

const sendContactMessage = async (contactData) => {
  return await axiosInstance.post(`${API_URL}/send-message`, contactData);
};

const getAllContactMessages = async () => {
  return await axiosInstance.get(`${API_URL}/get-messages`);
};

const deleteContactMessage = async (id) => {
  return await axiosInstance.delete(`${API_URL}/message/${id}`);
};

const addToWishlist = async (userId, roomId) => {
  return await axiosInstance.post(`${API_URL}/add-to-wishlist/${userId}/${roomId}`);
};

const getUserWishlist = async (userId) => {
  const response = await axiosInstance.get(`${API_URL}/get-wishlist/${userId}`);
  if (response?.status === 404) {
    return { data: { data: [], message: "No wishlist items found" }, status: 200 };
  }
  return response;
};

const removeFromWishlist = async (wishListId) => {
  return await axiosInstance.delete(`${API_URL}/remove-wishlist/${wishListId}`);
};

const submitFeedback = async (userId, hotelId, rating, comment) => {
  return await axiosInstance.post(`${API_URL}/feedback/submit`, {
    userId,
    hotelId,
    rating,
    comment
  });
};

const getFeedbackByHotelId = async (hotelId) => {
  return await axiosInstance.get(`${API_URL}/feedback/hotel/${hotelId}`);
};

const getFeedbackByUserId = async (userId) => {
  return await axiosInstance.get(`${API_URL}/feedback/user/${userId}`);
};

const getAllBookings = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.bookingStatus) params.append("bookingStatus", filters.bookingStatus);
  if (filters.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
  if (filters.hotelId) params.append("hotelId", filters.hotelId);
  if (filters.userId) params.append("userId", filters.userId);
  if (filters.checkInStart) params.append("checkInStart", filters.checkInStart);
  if (filters.checkInEnd) params.append("checkInEnd", filters.checkInEnd);
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.sortDirection) params.append("sortDirection", filters.sortDirection);
  const queryString = params.toString();
  return await axiosInstance.get(`${API_URL}/bookings${queryString ? `?${queryString}` : ""}`);
};

const getAllUsers = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  const queryString = params.toString();
  return await axiosInstance.get(`${API_URL}/users${queryString ? `?${queryString}` : ""}`);
};

const submitStayEaseFeedback = async (userId, rating, message) => {
  return await axiosInstance.post(
    `${API_URL}/submit/${userId}`,
    null,
    { params: { rating, message } }
  );
};

const getAllStayEaseFeedbacks = async () => {
  return await axiosInstance.get(`${API_URL}/feedbacks`);
};

const sendForgotPasswordOTP = async (email) => {
  return await axiosInstance.post(`${API_URL}/auth/forgot-password/send-otp`, { email });
};

const verifyOTP = async (email, otp) => {
  return await axiosInstance.post(`${API_URL}/auth/forgot-password/verify-otp`, {
    email,
    otp
  });
};

const verifyOTPAndResetPassword = async (email, otp, newPassword) => {
  return await axiosInstance.post(`${API_URL}/auth/forgot-password/reset`, {
    email,
    otp,
    newPassword
  });
};

const deleteRoomById = async (roomId) => {
  return await axiosInstance.delete(`${API_URL}/rooms/${roomId}`);
};

const deleteHotelById = async (hotelId) => {
  return await axiosInstance.delete(`${API_URL}/hotels/${hotelId}`);
};

const deleteUser = async (userId) => {
  return await axiosInstance.delete(`${API_URL}/user/${userId}`);
};

const updateRoomById = async (roomId, formData) => {
  return await axiosInstance.patch(`${API_URL}/rooms/${roomId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export {
  API_URL,
  signupUser,
  loginUser,
  googleOAuth,
  updateUserProfile,
  getUserProfile,
  getAdminProfile,
  getManagerProfile,
  updateManagerProfile,
  changeManagerPassword,
  getHotelProfile,
  updateHotelProfile,
  updateAdminProfile,
  changeAdminPassword,
  addHotel,
  addRoom,
  getAllRoomsByHotelId,
  getAllHotels,
  getHotelById,
  getRoomByRoomId,
  bookRoom,
  getUserBookings,
  getHotelBookings,
  updateBookingStatus,
  deleteBooking,
  cancelBooking,
  cancelBookingByUser,
  getGuestsByHotel,
  addToWishlist,
  getUserWishlist,
  removeFromWishlist,
  submitFeedback,
  deleteUser,
  getFeedbackByHotelId,
  getFeedbackByUserId,
  getAllBookings,
  getAllUsers,
  submitStayEaseFeedback,
  getAllStayEaseFeedbacks,
  sendForgotPasswordOTP,
  verifyOTP,
  verifyOTPAndResetPassword,
  deleteRoomById,
  updateRoomById,
  deleteHotelById,
  sendEmailToGuest,
  getStats,
  sendContactMessage,
  getAllContactMessages,
  deleteContactMessage
};



