import React, { useEffect } from 'react';
import { Modal, Form, Input, Space, Button, Typography, message } from 'antd';
import { useCategory } from '../../../../hooks/useCategory';
import { useAuth } from '../../../../hooks/useAuth';

const { Title, Text } = Typography;

const CategoryRejectionReasonModal = ({
  visible,
  onCancel,
  currentRequest,
  onSuccess,
  form
}) => {
  const { rejectCategory, loading } = useCategory(); // Lấy loading từ useCategory
  const { user } = useAuth();

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, currentRequest, form]);

  const handleFormSubmit = async (values) => {
    if (!currentRequest?._id) {
      message.error("No category request selected for rejection.");
      return;
    }

    if (!user?._id) {
      message.error("User ID not found. Please log in again.");
      return;
    }

    try {
      await rejectCategory(currentRequest._id, user._id, values.reason);
      onSuccess();
      onCancel();
    } catch (error) {
      message.error("Failed to reject category: " + (error.response?.data?.message || error.message || "Unknown error"));
    }
  };

  return (
    <Modal
      title={<Title level={4} className="text-center mb-6">Enter Rejection Reason</Title>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={500}
      className="rounded-lg"
      centered
    >
      <Form
        form={form}
        layout="vertical"
        name="rejection_reason_form"
        onFinish={handleFormSubmit}
      >
        {currentRequest && (
          <div className="mb-4 text-center">
            <Text strong>Rejecting Category:</Text> <Text>{currentRequest?.name || 'N/A'}</Text>
            {currentRequest?.rejectedNote && (
              <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-md">
                <Text strong className="text-red-700">Previous Rejection Note:</Text>
                <Text className="text-red-800 ml-2">{currentRequest?.rejectedNote}</Text>
              </div>
            )}
          </div>
        )}
        <Form.Item
          label={<Text strong>Reason for Rejection</Text>}
          name="reason"
          rules={[
            { required: true, message: 'Please enter a reason for rejection.' },
            { min: 10, message: 'Reason must be at least 10 characters.' }
          ]}
        >
          <Input.TextArea rows={4} placeholder="Enter reason for rejecting this request (min 10 characters)" className="rounded-md" />
        </Form.Item>
        <Form.Item className="flex justify-end mt-4">
          <Space>
            <Button onClick={onCancel} className="rounded-md">Cancel</Button>
            <Button type="primary" danger htmlType="submit" loading={loading} className="rounded-md">
              Submit Rejection
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryRejectionReasonModal;