import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import loginImage from "../../../assets/banner_login_3.png";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import CenteredSpinner from '../../common/SpinnerLoading';
import UserService from '../../../services/userService';

const ForgotPasswordForm = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const userService = new UserService(); 

    const onFinish = async (values) => {
        setLoading(true);
        let emailSentSuccessfully = false; 
        try {
            const result = await userService.resetPassword(values?.email); 
            toast.success(result.message || "Password reset link sent to your email!");
            emailSentSuccessfully = true; 
        } catch (error) {
            console.error("Lỗi khi gọi API resetPassword:", error);
            toast.error(error.message || "Failed to send reset link. Please try again.");
            emailSentSuccessfully = true; 
        } finally {
            setLoading(false);
            if (emailSentSuccessfully) {
                navigate('/verify-otp', { state: { email: values?.email } });
            }
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.error('Form submission failed:', errorInfo);
        toast.error("Please enter a valid email address.");
    };

    if (loading) {
        return <CenteredSpinner />;
    }
    return (
        <div className="flex max-h-screen p-4 bg-slate-50">
            {/* Image Section (re-used from login) */}
            <div className="w-[60%] max-h-full rounded-lg">
                <img
                    src={loginImage}
                    className="w-full rounded-xl h-full object-cover"
                    alt="Forgot Password"
                />
            </div>

            {/* Forgot Password Form Section */}
            <div className="w-[40%] p-5 text-center max-h-screen rounded-lg flex items-center justify-center">
                <div className="w-[80%] bg-white p-8 rounded-2xl shadow-2xl">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-500 to-purple-600 text-transparent bg-clip-text">
                        Forgot Password?
                    </h3>

                    <p className="text-[12px] my-4 text-slate-500 font-light">
                        Enter your email address below and we'll send you a link to reset your password.
                    </p>

                    {/* Form for Email Input */}
                    <Form
                        name="forgot_password"
                        style={{ maxWidth: 600, width: "100%" }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        layout="vertical"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: "Please input your email!" },
                                { type: 'email', message: "Please enter a valid email address!" }
                            ]}
                        >
                            <Input size="large" placeholder="your.email@example.com" />
                        </Form.Item>

                        <Form.Item label={null}>
                            <Button
                                htmlType="submit"
                                size="large"
                                className="mt-4 !bg-gradient-to-r from-slate-500 to-purple-600 !font-bold !text-white"
                                style={{ width: "100%" }}
                            >
                                Send Reset Link
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="mt-4 text-sm text-slate-600">
                        Remember your password? <Link to="/login" className="text-purple-600 font-medium">Log In</Link>
                    </div>

                    {/* ToastContainer */}
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

export default ForgotPasswordForm;