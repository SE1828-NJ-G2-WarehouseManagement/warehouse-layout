import React from 'react';
import { Form, Input, Button } from 'antd';
import { Link, Navigate } from 'react-router-dom';
import loginImage from "../../../assets/banner_login_3.png";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "../../../hooks/useAuth";
import CenteredSpinner from '../../common/SpinnerLoading';
import { ROLE } from '../../../constant/key';

const LoginForm = () => {
  const { login, user, loading,fetchUserProfile } = useAuth();

  if (loading) {
    return <CenteredSpinner />;
  }

  if (user) {
    if (![ROLE.STAFF_WAREHOUSE, ROLE.MANAGER_WAREHOUSE].includes(user.role)) {
      toast.error("You do not have permission to access this page.");
    }

    return <Navigate to="/dashboard" replace />;
  }


  const onFinish = async (values) => {
    try {
      const result = await login(values);
       await fetchUserProfile();

      if (result?.success) {
        toast.success("Login successful!");
      } else {
        toast.error(result?.message || "Login failed. Please try again.");
      }
    } catch (error) {
      toast.error(error?.message || "An error occurred during login.");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.error('Login failed:', errorInfo);
    toast.error("Please fill in all required fields.");
  };

  return (
    <div className="flex max-h-screen p-4 bg-slate-50 ">
      {/* login image */}
      <div className="w-[60%] max-h-full rounded-lg">
        <img
          src={loginImage}
          className="w-full rounded-xl h-full object-cover"
          alt="login"
        />
      </div>

      {/* login form */}
      <div className="w-[40%] p-5 text-center max-h-screen rounded-lg flex items-center justify-center">
        <div className="w-[80%] bg-white p-8 rounded-2xl shadow-2xl">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-500 to-purple-600 text-transparent bg-clip-text">
            Welcome
          </h3>

          <p className="text-[12px] my-4 text-slate-500 font-light">
            Empowering both Managers and Staff to take control of warehouse operations – smarter, faster, and together.
          </p>

          {/* form */}
          <Form
            name="basic"
            style={{ maxWidth: 600, width: "100%" }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please input your email" }]}
            >
              <Input size="large" placeholder="abc@admin.com..." />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please input your password" }]}
            >
              <Input.Password size="large" />
            </Form.Item>

            <Link to={"/forgot-password"}>Forgot password ?</Link>

            <Form.Item label={null}>
              <Button
                htmlType="submit"
                size="large"
                className="mt-4 !bg-gradient-to-r from-slate-500 to-purple-600 !font-bold !text-white"
                style={{ width: "100%" }}
              >
                Login
              </Button>
            </Form.Item>
          </Form>

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

export default LoginForm;
