// src/components/auth/SetNewPasswordForm.jsx

import React, { useState, useEffect } from 'react';
import { Form, Input, Button } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import loginImage from "../../../assets/banner_login_3.png";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import CenteredSpinner from '../../common/SpinnerLoading';
import UserService from '../../../services/userService'; // Import class UserService

const SetNewPasswordForm = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation(); // Hook để lấy state từ navigate
    const [form] = Form.useForm(); // Để có thể set giá trị mặc định cho email

    // Lấy email và OTP từ state khi navigate từ VerifyOtpForm
    const email = location.state?.email;
    const otp = location.state?.otp; // Có thể cần hoặc không, tùy thuộc vào API change-password của backend

    // Tạo instance của UserService
    const userService = new UserService();

    useEffect(() => {
        // Đảm bảo có email và otp (hoặc ít nhất email) trước khi hiển thị form này
        if (!email || !otp) { // Hoặc chỉ !email nếu API change-password chỉ cần email
            toast.warn("Unauthorized access. Please start from forgot password.");
            navigate('/forgot-password', { replace: true });
        } else {
            form.setFieldsValue({ email: email });
        }
    }, [email, otp, form, navigate]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Gọi API changePassword từ UserService
            // Backend có thể yêu cầu email, newPassword, và có thể cả OTP hoặc một token tạm thời
            const result = await userService.changePassword(values.newPassword, values.email); // Chỉnh lại theo API của bạn

            if (result.isSuccess) {
                toast.success(result.message || "Password changed successfully! Please log in with your new password.");
                navigate('/login'); // Chuyển hướng về trang đăng nhập
            } else {
                toast.error(result.message || "Failed to change password. Please try again.");
            }
        } catch (error) {
            toast.error(error.message || "An error occurred while changing password.");
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.error('Form submission failed:', errorInfo);
        toast.error("Please ensure passwords match and meet requirements.");
    };

    if (loading) {
        return <CenteredSpinner />;
    }

    return (
        <div className="flex max-h-screen p-4 bg-slate-50">
            {/* Image Section */}
            <div className="w-[60%] max-h-full rounded-lg">
                <img
                    src={loginImage}
                    className="w-full rounded-xl h-full object-cover"
                    alt="Set New Password"
                />
            </div>

            {/* Set New Password Form Section */}
            <div className="w-[40%] p-5 text-center max-h-screen rounded-lg flex items-center justify-center">
                <div className="w-[80%] bg-white p-8 rounded-2xl shadow-2xl">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-500 to-purple-600 text-transparent bg-clip-text">
                        Set New Password
                    </h3>

                    <p className="text-[12px] my-4 text-slate-500 font-light">
                        Please enter your new password.
                    </p>

                    <Form
                        form={form}
                        name="set_new_password"
                        style={{ maxWidth: 600, width: "100%" }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        layout="vertical"
                    >
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[{ required: true, message: "Email is required!" }]}
                        >
                            <Input size="large" placeholder="your.email@example.com" disabled />
                        </Form.Item>

                        <Form.Item
                            name="newPassword"
                            label="New Password"
                            rules={[
                                { required: true, message: "Please input your new password!" },
                                { min: 6, message: "Password must be at least 6 characters." }
                            ]}
                            hasFeedback
                        >
                            <Input.Password size="large" />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Confirm New Password"
                            dependencies={['newPassword']}
                            hasFeedback
                            rules={[
                                { required: true, message: 'Please confirm your password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password size="large" />
                        </Form.Item>

                        <Form.Item label={null}>
                            <Button
                                htmlType="submit"
                                size="large"
                                className="mt-4 !bg-gradient-to-r from-slate-500 to-purple-600 !font-bold !text-white"
                                style={{ width: "100%" }}
                            >
                                Change Password
                            </Button>
                        </Form.Item>
                    </Form>

                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar
                        pauseOnHover
                        closeOnClick
                        theme="colored"
                    />
                </div>
            </div>
        </div>
    );
};

export default SetNewPasswordForm;