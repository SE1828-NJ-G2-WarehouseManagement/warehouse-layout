import axiosInstance from "../config/axios";

class UserService {
  constructor() {
    this.url = "/users";
  }

  // @route   POST /api/v1/users/reset-password
  // @desc    reset password
  resetPassword = async (email) => {
    const response = await axiosInstance.post(`${this.url}/reset-password`, {
      email,
    });
    const data = response.data;

    if (data && !data.isSuccess) {
      throw new Error("Reset password failed");
    }

    return data;
  };
  // @route   POST /api/v1/users/verify-otp
  // @desc    verify otp  
  verifyOtp = async (otp, email) => {
    const response = await axiosInstance.post(`${this.url}/verify-otp`, {
      otp,
      email,
    });
    const data = response.data;

    if (data && !data.isSuccess) {
      throw new Error("Verify OTP failed");
    }

    return data;
  };
  // @route   POST /api/v1/users/change-password
  // @desc    change password
  changePassword = async (newPassword, email) => {
    const response = await axiosInstance.post(`${this.url}/change-password`, {
      newPassword,
      email,
    });
    const data = response.data;

    if (data && !data.isSuccess) {
      throw new Error("Change password failed");
    }

    return data;
  };
  // @route   GET /api/v1/users/view-profile
  // @desc    view profile
  viewProfile = async () => {
    const response = await axiosInstance.get(`${this.url}/view-profile`, {
      requiresAuth: true
    });
    const data = response.data;

    if (data && !data.isSuccess) {
      throw new Error("View profile failed");
    }

    return data;
  };
  // @route   GET /api/v1/users/get-manager-available
  // @desc    list manager available
  getManagerAvailable = async () => {
    const response = await axiosInstance.get(`${this.url}/get-manager-available`, {
      requiresAuth: true
    });
    const data = response.data;

    if (data && !data.isSuccess) {
      throw new Error("Get manager available failed");
    }

    return data;
  };

  // @route   GET /api/v1/users/get-staff-available
  // @desc    list staff available
  getStaffAvailable = async () => {
    const response = await axiosInstance.get(`${this.url}/get-staff-available`, {
      requiresAuth: true
    });
    const data = response.data;

    if (data && !data.isSuccess) {
      throw new Error("Get staff available failed");
    }

    return data;
  };

  // @route   POST /api/v1/users/update-profile
  // @desc    update profile
  updateProfile = async (data) => {
    const response = await axiosInstance.post(`${this.url}/update-profile`, data, {
      requiresAuth: true
    });
    const result = response.data;

    if (result && !result.isSuccess) {
      throw new Error("Update profile failed");
    }

    return result;
  };

  // @route   POST /api/v1/users/login
  // @desc    login
  login = async (email, password) => {
    const response = await axiosInstance.post(`${this.url}/login`, {
      email,
      password,
    });
    const data = response.data;

    if (data && !data.isSuccess) {
      throw new Error("Invalid password or email");
    }

    return data;
  };

  // @route   POST /api/v1/users/register
  // @desc    register
  register = async (email, password, role) => {
    const response = await axiosInstance.post(`${this.url}/register`, {
      email,
      password,
      role
    });
    const data = response.data;

    if (data && !data.isSuccess) {
      throw new Error("Register failed");
    }

    return data;
  };

  // @route   GET /api/v1/users/
  // @desc    get list users
  getUsers = async () => {
    const response = await axiosInstance.get(`${this.url}/`, {
      requiresAuth: true
    });
    const data = response.data;

    if (data && !data.isSuccess) {
      throw new Error("Get list failed");
    }

    return data;
  }
}

export default UserService;
