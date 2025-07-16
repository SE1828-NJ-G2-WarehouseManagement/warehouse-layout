import React, { useState, useEffect } from 'react';
import { Card, Button, Avatar, Typography, Space, message, Tag, Row, Col, Divider, Flex, Modal, Form, Input, Upload } from 'antd';
import { UserOutlined, EditOutlined, MailOutlined, PhoneOutlined, SolutionOutlined, GlobalOutlined, CheckCircleOutlined, CloseCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

const Profile = () => {
  const { user, updateProfile, fetchUserProfile } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    getDataProfile();
  }, []);

  const getDataProfile = async () => {
    try {
      await fetchUserProfile();
    } catch (error) {
      console.log(error);
      message.error("Failed to fetch user profile.");
    }
  };

  useEffect(() => {
    if (user && user.avatar) {
      setFileList([{
        uid: '-1',
        name: 'avatar.png',
        status: 'done',
        url: user.avatar,
      }]);
    } else if (user) {
      setFileList([]);
    }
  }, [user]);

  if (!user) {
    return (
      <Flex justify="center" align="center" style={{ height: 'calc(100vh - 150px)' }}>
        <Text type="secondary">Loading user information...</Text>
      </Flex>
    );
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const displayName = fullName || user.email || 'User';

  const showEditModal = () => {
    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    });
    if (user.avatar) {
      setFileList([{
        uid: '-1',
        name: 'avatar.png',
        status: 'done',
        url: user.avatar,
      }]);
    } else {
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const updatedData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
      };

   if (fileList.length > 0 && fileList[0]?.originFileObj) {
      updatedData.avatarFile = fileList[0].originFileObj;
    }

      const result = await updateProfile(updatedData);
      if (result.isSuccess) {
        await fetchUserProfile();
        setIsModalVisible(false);
        message.success("Profile updated successfully!");
      } else {
        message.error(result.message || "Failed to update profile.");
      }
    } catch (errorInfo) {
      console.log('Validation/Submission Failed:', errorInfo);
      let errorMessage = "Failed to update profile due to invalid input.";
      if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
        errorMessage = `Please check the following fields: ${errorInfo.errorFields.map(field => field.name.join(', ')).join('; ')}`;
      } else if (errorInfo.message) {
        errorMessage = errorInfo.message;
      }
      message.error(errorMessage);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    if (user.avatar) {
      setFileList([{ uid: '-1', name: 'avatar.png', status: 'done', url: user.avatar }]);
    } else {
      setFileList([]);
    }
  };

  const handleImageChange = ({ fileList: newFileList }) => {
    const latestFile = newFileList.length > 0 ? [newFileList[newFileList.length - 1]] : [];
    setFileList(latestFile);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M ? false : Upload.LIST_IGNORE;
  };

  const labelMinWidth = '140px';
  const isUserActive = user.status && user.status.toUpperCase() === 'ACTIVE';

  return (
    <div className="container mx-auto p-6" style={{ maxWidth: '900px' }}>
      <Card
        className="shadow-xl rounded-lg border border-gray-100"
        styles={{ body: { padding: '40px' } }}
      >
        <Flex justify="space-between" align="flex-start" wrap="wrap" className="mb-8">
          <Flex vertical align="center" gap="small" className="w-full md:w-auto">
            {user.avatar ? (
              <Avatar size={120} src={user.avatar} alt="User Avatar" className="shadow-md" />
            ) : (
              <Avatar size={120} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} className="shadow-md" />
            )}
            <Title level={3} style={{ marginBottom: 4, marginTop: 16 }}>
              {displayName}
            </Title>
          </Flex>
          <div className="mt-6 md:mt-0">
            <Button
              type="primary"
              size="large"
              icon={<EditOutlined />}
              onClick={showEditModal}
            >
              Edit Profile
            </Button>
          </div>
        </Flex>

        <Divider className="my-8" />

        <Title level={4} className="mb-4 text-gray-800">Personal Information</Title>
        <Row gutter={[24, 16]} className="mb-8">
          <Col xs={24} sm={12}>
            <Flex align="baseline">
              <Text type="secondary" style={{ minWidth: labelMinWidth, fontWeight: 'normal' }}>First Name:</Text>
              <Text>{user.firstName || 'N/A'}</Text>
            </Flex>
          </Col>
          <Col xs={24} sm={12}>
            <Flex align="baseline">
              <Text type="secondary" style={{ minWidth: labelMinWidth, fontWeight: 'normal' }}>Last Name:</Text>
              <Text>{user.lastName || 'N/A'}</Text>
            </Flex>
          </Col>
          <Col xs={24} sm={12}>
            <Flex align="baseline">
              <Text type="secondary" style={{ minWidth: labelMinWidth, fontWeight: 'normal' }}>Email:</Text>
              <Text>
                <Space>
                  <MailOutlined /> {user.email || 'N/A'}
                </Space>
              </Text>
            </Flex>
          </Col>
          <Col xs={24} sm={12}>
            <Flex align="baseline">
              <Text type="secondary" style={{ minWidth: labelMinWidth, fontWeight: 'normal' }}>Phone Number:</Text>
              <Text>
                <Space>
                  <PhoneOutlined /> {user.phone || 'N/A'}
                </Space>
              </Text>
            </Flex>
          </Col>
        </Row>

        <Divider className="my-8" />

        <Title level={4} className="mb-4 text-gray-800">System Information</Title>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Flex align="baseline">
              <Text type="secondary" style={{ minWidth: labelMinWidth, fontWeight: 'normal' }}>Role:</Text>
              <Tag icon={<SolutionOutlined />} color="blue">
                {user.role || 'Undefined'}
              </Tag>
            </Flex>
          </Col>
          <Col xs={24} sm={12}>
            <Flex align="baseline">
              <Text type="secondary" style={{ minWidth: labelMinWidth, fontWeight: 'normal' }}>Assigned Warehouse:</Text>
              <Tag icon={<GlobalOutlined />} color="green">
                {user.assignedWarehouse || 'N/A'}
              </Tag>
            </Flex>
          </Col>
          <Col xs={24} sm={12}>
            <Flex align="baseline">
              <Text type="secondary" style={{ minWidth: labelMinWidth, fontWeight: 'normal' }}>Status:</Text>
              <Tag
                icon={isUserActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                color={isUserActive ? 'success' : 'error'}
              >
                {user.status || 'N/A'}
              </Tag>
            </Flex>
          </Col>
        </Row>
      </Card>

      <Modal
        title="Edit Profile"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Save Changes"
        cancelText="Cancel"
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          name="edit_profile_form"
        >
          <Form.Item label="Avatar">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleImageChange}
              beforeUpload={beforeUpload}
              maxCount={1}
              showUploadList={{ showPreviewIcon: false, showRemoveIcon: true }}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please input your first name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="First Name" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please input your last name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Last Name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ pattern: /^[0-9]{10,11}$/, message: 'Please enter a valid phone number!' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
          </Form.Item>

          <Form.Item label="Role">
            <Input value={user.role || 'Undefined'} disabled prefix={<SolutionOutlined />} />
          </Form.Item>
          <Form.Item label="Assigned Warehouse">
            <Input value={user.assignedWarehouse || 'N/A'} disabled prefix={<GlobalOutlined />} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;