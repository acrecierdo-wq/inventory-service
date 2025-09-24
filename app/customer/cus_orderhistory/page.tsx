"use client";

import React from "react";
import { CustomerHeader } from "@/components/header-customer";
import Image from "next/image";

export default function Page() {
  const orders = [
    {
      id: "ORD-1001",
      item: "Product 1",
      status: "Pending",
      image: "/images/mouse.jpg",
    },
    {
      id: "ORD-1002",
      item: "Product 2",
      status: "Processing",
      image: "/images/keyboard.jpg",
    },
    {
      id: "ORD-1003",
      item: "Product 3",
      status: "Shipped",
      image: "/images/hub.jpg",
    },
    {
      id: "ORD-1004",
      item: "Product 4",
      status: "Delivered",
      image: "/images/stand.jpg",
    },
    {
      id: "ORD-1005",
      item: "Product 5",
      status: "Cancelled",
      image: "/images/headphones.jpg",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Processing":
        return "bg-blue-100 text-blue-700";
      case "Shipped":
        return "bg-purple-100 text-purple-700";
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <CustomerHeader />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Order History</h1>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 border rounded-2xl shadow-sm bg-white flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={order.image}
                  alt={order.item}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>

              {/* Order Details */}
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{order.item}</p>
                <p className="text-sm text-gray-500">Order ID: {order.id}</p>
              </div>

              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
