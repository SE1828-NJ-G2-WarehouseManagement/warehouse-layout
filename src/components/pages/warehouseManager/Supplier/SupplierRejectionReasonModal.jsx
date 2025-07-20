import React from 'react';
import { Modal, Form, Input, Space, Button, Typography } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SupplierRejectionReasonModal = ({
  visible,
  onCancel,
  onSubmit,
  loading,
  form
}) => {
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
        onFinish={onSubmit}
      >
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

export default SupplierRejectionReasonModal;