import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button } from 'antd'; 
import { Link, useNavigate, useLocation } from 'react-router-dom';
import loginImage from "../../../assets/banner_login_3.png";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import CenteredSpinner from '../../common/SpinnerLoading';
import UserService from '../../../services/userService'; 

const VerifyOtpForm = () => {
    const [loading, setLoading] = useState(false);
    const [otpResendLoading, setOtpResendLoading] = useState(false); 
    const [timer, setTimer] = useState(600); 
    const [isTimerActive, setIsTimerActive] = useState(false); 
    
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();

    const email = location.state?.email;
    

    const userService = new UserService();

    const intervalRef = useRef(null);

    useEffect(() => {
        if (!email) {
            toast.warn("Please enter your email first to verify OTP.");
            navigate('/forgot-password', { replace: true });
            return;
        }

        form.setFieldsValue({ email: email }); 

        if (!isTimerActive) {
            setIsTimerActive(true);
            setTimer(600);
            startTimer();
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [email, form, navigate, isTimerActive]);

    const startTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current); 
        }
        intervalRef.current = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(intervalRef.current);
                    setIsTimerActive(false); 
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleResendOtp = async () => {
        setOtpResendLoading(true);
        try {
            const result = await userService.resetPassword(email);
            if (result.isSuccess) {
                toast.success(result.message || "New OTP sent to your email!");
                setTimer(600);
                setIsTimerActive(true); 
                startTimer();
            } else {
                toast.error(result.message || "Failed to resend OTP. Please try again.");
            }
        } catch (error) {
            console.error("Error resending OTP:", error);
            toast.error(error.message || "Failed to resend OTP. An error occurred.");
        } finally {
            setOtpResendLoading(false);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const result = await userService.verifyOtp(values.otp, values.email);

            if (result.isSuccess) {
                toast.success(result.message || "OTP verified successfully!");
                navigate('/set-new-password', { state: { email: values.email, otp: values.otp } });
            } else {
                toast.error(result.message || "Invalid OTP. Please try again.");
            }
        } catch (error) {
            console.error("Lỗi xác thực OTP:", error);
            toast.error(error.message || "An error occurred during OTP verification.");
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.error('Form submission failed:', errorInfo);
        toast.error("Please enter the correct OTP.");
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
                    alt="Verify OTP"
                />
            </div>

            {/* Verify OTP Form Section */}
            <div className="w-[40%] p-5 text-center max-h-screen rounded-lg flex items-center justify-center">
                <div className="w-[80%] bg-white p-8 rounded-2xl shadow-2xl">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-500 to-purple-600 text-transparent bg-clip-text">
                        Verify OTP
                    </h3>

                    <p className="text-[12px] my-4 text-slate-500 font-light">
                        Please enter the 4-digit OTP sent to your email address: <span className="font-bold">{email}</span>
                    </p>

                    <Form
                        form={form}
                        name="verify_otp"
                        style={{ maxWidth: 600, width: "100%" }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        layout="vertical"
                    >
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: "Email is required!" },
                                { type: 'email', message: "Please enter a valid email address!" }
                            ]}
                        >
                            <Input size="large" placeholder="your.email@example.com" disabled={!!email} />
                        </Form.Item>

                        {/* --- ODP Input Component --- */}
                        <Form.Item
                            name="otp"
                            label="OTP Code"
                            rules={[
                                { required: true, message: "Please input the OTP!" },
                                { len: 4, message: "OTP must be 4 digits." } 
                            ]}
                            className="text-center" 
                        >
                            
                            <Input.OTP size="large" length={4} /> 
                        </Form.Item>

                        <div className="flex justify-between items-center mt-2 mb-4 text-sm text-slate-600">
                            {timer > 0 ? (
                                <span>OTP expires in: <span className="font-bold text-purple-600">{formatTime(timer)}</span></span>
                            ) : (
                                <span className="text-red-500 font-bold">OTP Expired!</span>
                            )}
                            <Button
                                type="link"
                                onClick={handleResendOtp}
                                loading={otpResendLoading}
                                disabled={isTimerActive && timer > 0}
                                className="!text-purple-600 !font-medium"
                            >
                                Resend OTP
                            </Button>
                        </div>

                        <Form.Item label={null}>
                            <Button
                                htmlType="submit"
                                size="large"
                                className="!bg-gradient-to-r from-slate-500 to-purple-600 !font-bold !text-white"
                                style={{ width: "100%" }}
                                disabled={!isTimerActive && timer === 0} 
                            >
                                Verify OTP
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="mt-4 text-sm text-slate-600">
                        <Link to="/forgot-password" className="text-purple-600 font-medium">Go back to Forgot Password</Link>
                    </div>

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

export default VerifyOtpForm;