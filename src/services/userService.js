import axiosInstance from "../config/axios";
import { message } from 'antd'; // Make sure Ant Design message is imported

class UserService {
  constructor() {
    this.url = "/users";
  }

  resetPassword = async (email) => {
    try {
      const response = await axiosInstance.post(`${this.url}/reset-password`, {
        email,
      });
      const data = response.data;

      if (data && !data.isSuccess) {
        throw new Error(data.message || "Reset password failed");
      }
      return data;
    } catch (error) {
        console.error("Error in UserService.resetPassword:", error);
        let errorMessage = "An unknown error occurred during password reset.";
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        message.error(errorMessage);
        throw error;
    }
  };

  changePasswordSetting = async (currentPassword, newPassword, email) => {
    try {
      const response = await axiosInstance.post(`${this.url}/change-password-setting`, {
        currentPassword, 
        newPassword,
        email,
      });
      const data = response.data;

      if (data && !data.isSuccess) {
        throw new Error(data.message || "Change password failed");
      }
      return data;
    } catch (error) {
        console.error("Error in UserService.changePassword:", error);
        let errorMessage = "An unknown error occurred during password change.";
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        message.error(errorMessage);
        throw error;
    }
  };

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

  updateProfile = async (data) => {
    try {
        const response = await axiosInstance.put(`${this.url}/update-profile`, data, {
            requiresAuth: true,
        });
        const result = response.data;

        if (result && !result.isSuccess) {
            throw new Error(result.message || "Update profile failed");
        }
        return result;
    } catch (error) {
        console.error("Error in UserService.updateProfile:", error);
        let errorMessage = "An unknown error occurred.";
        if (error.response && error.response.data) {
            errorMessage = error.response.data.message || errorMessage;
            if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
                const zodErrors = error.response.data.errors.map(err => `${err.path}: ${err.message}`).join(', ');
                errorMessage += ` Details: ${zodErrors}`;
            } else if (error.response.data.error) {
                errorMessage = error.response.data.error;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        message.error(errorMessage);
        throw error;
    }
  };

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