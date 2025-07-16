import React, { useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Button, message, Flex } from 'antd'; // Bỏ Space, Divider, Switch, Select, Row, Col
import { SettingOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'; // Bỏ BulbOutlined, TranslationOutlined
import UserService from '../../services/userService'; // Đảm bảo đường dẫn đúng
import { toast } from 'react-toastify';
// import { useTheme } from '../context/ThemeContext'; // Bỏ import nếu không dùng theme/language
// import { useAuth } from '../context/AuthContext'; // Bỏ import useAuth nếu chỉ dùng email từ localStorage

const { Title, Text } = Typography;

const Settings = () => {
  const [changePasswordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(''); 
  const userService = new UserService(); 

  // Nếu bạn đã bỏ ThemeContext và AuthContext:
  // const { currentTheme, setCurrentTheme, currentLanguage, setCurrentLanguage } = useTheme(); // Bỏ dòng này
  // const { user } = useAuth(); // Bỏ dòng này
  // const userEmail = user?.email; // Bỏ dòng này

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
        setUserEmail(storedEmail);
    } else {
        message.warning("User email not found in localStorage. Change Password feature may not work as expected. Please log in again.");
    }
  }, []);

  const handleChangePassword = async (values) => { 
    setLoading(true);
    try {
      const { currentPassword, newPassword, confirmNewPassword } = values;

      if (!userEmail) {
        toast.error("User email not available. Cannot change password. Please log in again.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        toast.error("New password and confirmation do not match!");
        return;
      }

      // Gọi API changePassword với currentPassword, newPassword và userEmail
      const result = await userService.changePasswordSetting(currentPassword, newPassword, userEmail); 

      if (result.isSuccess) {
        message.success("Password changed successfully! Please remember your new password.");
        changePasswordForm.resetFields();
      } else {
        toast.error(result.message || "Failed to change password.");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while changing password.");
      console.error("Error in handleChangePassword:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6" style={{ maxWidth: '500px' }}> 
      <Card
        title={<Title level={4} style={{ margin: 0 }}><LockOutlined /> Change Password</Title>}
        className="shadow-xl rounded-lg border border-gray-100"
        styles={{ body: { padding: '30px' } }}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>
          Update your account password for <Text strong>{userEmail || 'N/A'}</Text>.
        </Text>
        <Form
          form={changePasswordForm}
          name="change_password_form"
          onFinish={handleChangePassword}
          layout="vertical"
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[{ required: true, message: 'Please input your current password!' }]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 8, message: 'Password must be at least 8 characters!' }
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmNewPassword"
            dependencies={['newPassword']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your new password!' },
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
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block // Làm nút rộng hết chiều ngang
            >
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;