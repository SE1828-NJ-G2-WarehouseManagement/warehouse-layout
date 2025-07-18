import React, { useEffect, useState } from "react";
import {
  Form,
  Select,
  InputNumber,
  Button,
  message,
  Card,
  Typography,
  Space,
  Alert,
} from "antd";
import { Warehouse, ChevronRight } from "lucide-react";
import axiosInstance from "../../../config/axios";

const { Title } = Typography;

const TransferZone = () => {
  const [form] = Form.useForm();
  const [zones, setZones] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sourceZone, setSourceZone] = useState(null);
  const [destinationZone, setDestinationZone] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [capacityInfo, setCapacityInfo] = useState(null);
  const [isDestinationValid, setIsDestinationValid] = useState(false);
  const [tempError, setTempError] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/zones/without-pagination")
      .then((res) => {
        const data = res.data || [];
        const activeZones = Array.isArray(data)
          ? data.filter((zone) => zone.status === "ACTIVE")
          : [];
        setZones(activeZones);
      })
      .catch(() => {
        message.error("Failed to load zone list");
      });
  }, []);

  const handleSourceZoneChange = (zoneId) => {
    setSourceZone(zoneId);
    setDestinationZone(null);
    setSelectedItem(null);
    setApiError(null);
    setCapacityInfo(null);
    setIsDestinationValid(false);
    setTempError(null);
    form.setFieldsValue({
      itemId: null,
      destinationZoneId: null,
      quantity: null,
    });

    if (!zoneId) return;

    axiosInstance
      .get(`/zone-items/${zoneId}/items`)
      .then((res) => {
        const rawItems = res.data?.data || [];
        const mappedItems = rawItems.map((item) => {
          const itemId = item?.itemId?._id;
          const product = item?.itemId?.productId;
          const productName = product?.name || "Unknown product";
          const expiredDate = item?.itemId?.expiredDate;
          const formattedDate = expiredDate
            ? new Date(expiredDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : "";
          const quantity = item?.quantity ?? 0;
          const productTemp = product?.storageTemperature || {};
          const density = product?.density || 1;
          const weight = item?.itemId?.weights || 0; // unit: kg

          return {
            label: `${productName} (Qty: ${quantity})${
              formattedDate ? ` - Exp: ${formattedDate}` : ""
            } - Weight: ${weight}kg`,
            value: itemId,
            productTemp,
            rawItem: item,
            density,
            weights: weight,
          };
        });
        setItems(mappedItems);
      })
      .catch(() => {
        message.error("Failed to load items from source zone");
      });
  };

  const handleItemChange = (itemId) => {
    const item = items.find((i) => i.value === itemId);
    setSelectedItem(item);
    setApiError(null);
    setCapacityInfo(null);
    setIsDestinationValid(false);
    setTempError(null);
  };

  const handleDestinationZoneChange = (zoneId) => {
    const zone = zones.find((z) => z._id === zoneId);
    setDestinationZone(zone);
    setApiError(null);
    setCapacityInfo(null);
    setTempError(null);

    let isValid = true;

    if (selectedItem && zone) {
      const productTemp = selectedItem.productTemp;

      if (zone.storageTemperature && productTemp) {
        const zoneMin = zone.storageTemperature.min;
        const zoneMax = zone.storageTemperature.max;
        const productMin = productTemp.min;
        const productMax = productTemp.max;

        isValid = zoneMin >= productMin && zoneMax <= productMax;

        if (!isValid) {
          setTempError(
            `Destination zone temperature (${zoneMin}°C - ${zoneMax}°C) does not match product requirements (${productMin}°C - ${productMax}°C)`
          );
        }
      }
    }

    setIsDestinationValid(isValid);
  };

  const handleQuantityChange = (value) => {
    if (selectedItem && destinationZone && value > 0) {
      const weightInKg = selectedItem.weights || 0; // Item weight (kg)
      const volumePerUnit = weightInKg / selectedItem.density;
      const totalVolume = volumePerUnit * value;

      const availableCapacity =
        destinationZone.totalCapacity - destinationZone.currentCapacity;

      const isCapacityEnough = availableCapacity >= totalVolume;

      setCapacityInfo({
        required: totalVolume,
        available: availableCapacity,
        isEnough: isCapacityEnough,
      });

      if (!isCapacityEnough) {
        setApiError(
          `Destination zone has insufficient capacity. Required: ${totalVolume.toFixed(
            2
          )}, Available: ${availableCapacity.toFixed(2)}`
        );
      } else {
        setApiError(null);
      }

      setIsDestinationValid(isCapacityEnough && !tempError);
    }
  };

  const getZoneTemperature = (zone) => {
    if (!zone || !zone.storageTemperature) return null;
    const { min, max } = zone.storageTemperature;
    return `Zone temperature: ${min}°C - ${max}°C`;
  };

  const getProductTemperature = () => {
    if (!selectedItem || !selectedItem.productTemp) return null;
    const { min, max } = selectedItem.productTemp;
    return `Product storage requirements: ${min}°C - ${max}°C`;
  };

  const onFinish = async (values) => {
    setLoading(true);
    setApiError(null);

    try {
      await axiosInstance.post("/zone-items/transferZone", values);
      message.success("Transfer completed successfully");
      form.resetFields();
      setItems([]);
      setSelectedItem(null);
      setSourceZone(null);
      setDestinationZone(null);
      setCapacityInfo(null);
      setIsDestinationValid(false);
      setTempError(null);
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || "Transfer failed";

      message.error(msg);
      setApiError(msg);

      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach((err) => {
          fieldErrors[err.path] = err.msg;
        });
        form.setFields(
          Object.entries(fieldErrors).map(([name, errors]) => ({
            name,
            errors: [errors],
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 lg:p-10 border border-gray-100">
      <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
        <Warehouse className="text-blue-700 size-10 md:size-12" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          Internal Zone Transfer Request
        </h1>
      </div>

      <Card
        style={{
          maxWidth: 800,
          margin: "40px auto",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
      

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            label={
              <span style={{ fontSize: "16px", fontWeight: "500" }}>
                Source Zone
              </span>
            }
            name="sourceZoneId"
            rules={[{ required: true, message: "Please select source zone" }]}
          >
            <Select
              placeholder="Select source zone"
              onChange={handleSourceZoneChange}
              options={zones.map((zone) => ({
                label: zone.name,
                value: zone._id,
              }))}
              style={{ height: "48px", fontSize: "16px" }}
            />
          </Form.Item>

          {sourceZone && (
            <Alert
              message={getZoneTemperature(
                zones.find((z) => z._id === sourceZone)
              )}
              type="info"
              showIcon
              style={{
                marginBottom: "24px",
                fontSize: "16px",
                padding: "12px 16px",
              }}
            />
          )}

          <Form.Item
            label={
              <span style={{ fontSize: "16px", fontWeight: "500" }}>Item</span>
            }
            name="itemId"
            rules={[{ required: true, message: "Please select an item" }]}
          >
            <Select
              placeholder="Select item"
              options={items}
              disabled={!sourceZone}
              onChange={handleItemChange}
              style={{ height: "48px", fontSize: "16px" }}
            />
          </Form.Item>

          {selectedItem && (
            <Alert
              message={getProductTemperature()}
              type="warning"
              showIcon
              style={{
                marginBottom: "24px",
                fontSize: "16px",
                padding: "12px 16px",
              }}
            />
          )}

          <Form.Item
            label={
              <span style={{ fontSize: "16px", fontWeight: "500" }}>
                Destination Zone
              </span>
            }
            name="destinationZoneId"
            rules={[
              { required: true, message: "Please select destination zone" },
            ]}
          >
            <Select
              placeholder="Select destination zone"
              onChange={handleDestinationZoneChange}
              disabled={!sourceZone}
              options={zones
                .filter((z) => z._id !== sourceZone)
                .map((zone) => ({
                  label: zone.name,
                  value: zone._id,
                }))}
              style={{ height: "48px", fontSize: "16px" }}
            />
          </Form.Item>

          {destinationZone && (
            <>
              <Alert
                message={getZoneTemperature(destinationZone)}
                type={isDestinationValid ? "success" : "error"}
                showIcon
                style={{
                  marginBottom: "24px",
                  fontSize: "16px",
                  padding: "12px 16px",
                }}
              />
              {tempError && (
                <Alert
                  message={tempError}
                  type="error"
                  showIcon
                  style={{
                    marginBottom: "24px",
                    fontSize: "16px",
                    padding: "12px 16px",
                  }}
                />
              )}
              {capacityInfo && (
                <Alert
                  message={`Capacity required: ${capacityInfo.required.toFixed(
                    2
                  )} | Available: ${capacityInfo.available.toFixed(2)}`}
                  type={capacityInfo.isEnough ? "success" : "error"}
                  showIcon
                  style={{
                    marginBottom: "24px",
                    fontSize: "16px",
                    padding: "12px 16px",
                  }}
                />
              )}
            </>
          )}

          <Form.Item
            label={
              <span style={{ fontSize: "16px", fontWeight: "500" }}>
                Quantity to transfer
              </span>
            }
            name="quantity"
            rules={[
              { required: true, message: "Please enter quantity" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value <= 0) {
                    return Promise.reject("Quantity must be greater than 0");
                  }

                  const itemId = getFieldValue("itemId");
                  if (itemId) {
                    const item = items.find((i) => i.value === itemId);
                    if (item && value > item.rawItem.quantity) {
                      return Promise.reject(
                        `Quantity cannot exceed ${item.rawItem.quantity}`
                      );
                    }
                  }

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber
              min={1}
              style={{
                width: "100%",
                height: "48px",
                fontSize: "16px",
              }}
              onChange={handleQuantityChange}
              disabled={!isDestinationValid}
            />
          </Form.Item>

          {apiError && (
            <Alert
              message={apiError}
              type="error"
              showIcon
              style={{
                marginBottom: "24px",
                fontSize: "16px",
                padding: "12px 16px",
              }}
            />
          )}

          <Form.Item style={{ marginTop: "32px" }}>
            <Space size="large">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={!!apiError || !isDestinationValid}
                style={{
                  height: "48px",
                  fontSize: "16px",
                  padding: "0 24px",
                  fontWeight: "500",
                }}
              >
                Transfer Items
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  setSelectedItem(null);
                  setApiError(null);
                  setCapacityInfo(null);
                  setIsDestinationValid(false);
                  setTempError(null);
                }}
                style={{
                  height: "48px",
                  fontSize: "16px",
                  padding: "0 24px",
                  fontWeight: "500",
                }}
              >
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TransferZone;
