"use client";

import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";

interface OrderTimelineProps {
  status: string;
  createdAt: string;
  deliveredAt?: string | null;
  trackingNumber?: string | null;
  courierName?: string | null;
  estimatedDelivery?: string | null;
}

export default function OrderTimeline({
  status,
  createdAt,
  deliveredAt,
  trackingNumber,
  courierName,
  estimatedDelivery,
}: OrderTimelineProps) {
  const getStatusSteps = () => {
    const baseSteps = [
      {
        label: "Order Placed",
        icon: Package,
        completed: true,
        date: new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      },
      {
        label: "Processing",
        icon: Clock,
        completed: ["processing", "shipped", "delivered"].includes(status),
        date: status === "processing" ? "In progress" : "",
      },
      {
        label: "Shipped",
        icon: Truck,
        completed: ["shipped", "delivered"].includes(status),
        date: status === "shipped" ? "In transit" : "",
      },
      {
        label: "Delivered",
        icon: CheckCircle,
        completed: status === "delivered",
        date: deliveredAt ? new Date(deliveredAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "",
      },
    ];

    if (status === "cancelled") {
      return [
        baseSteps[0],
        {
          label: "Cancelled",
          icon: XCircle,
          completed: true,
          date: "Order cancelled",
          isError: true,
        },
      ];
    }

    return baseSteps;
  };

  const steps = getStatusSteps();

  return (
    <div className="space-y-6">
      {/* Tracking Info */}
      {trackingNumber && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Truck className="text-blue-600 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Tracking Information
              </h4>
              {courierName && (
                <p className="text-sm text-gray-600 mb-1">
                  Courier: <span className="font-medium">{courierName}</span>
                </p>
              )}
              <p className="text-sm text-gray-600 mb-1">
                Tracking Number:{" "}
                <span className="font-mono font-medium">{trackingNumber}</span>
              </p>
              {estimatedDelivery && (
                <p className="text-sm text-gray-600">
                  Estimated Delivery:{" "}
                  <span className="font-medium">
                    {new Date(estimatedDelivery).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          const isError = "isError" in step && step.isError;

          return (
            <div key={index} className="relative flex items-start gap-4 pb-8">
              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`absolute left-5 top-10 w-0.5 h-full ${
                    step.completed && !isError ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}

              {/* Icon */}
              <div
                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isError
                    ? "bg-red-100 border-red-500 text-red-600"
                    : step.completed
                      ? "bg-green-100 border-green-500 text-green-600"
                      : "bg-gray-100 border-gray-300 text-gray-400"
                }`}
              >
                <Icon size={20} />
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <h4
                  className={`font-semibold ${
                    isError
                      ? "text-red-600"
                      : step.completed
                        ? "text-gray-900"
                        : "text-gray-500"
                  }`}
                >
                  {step.label}
                </h4>
                {step.date && (
                  <p className="text-sm text-gray-600 mt-1">{step.date}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
