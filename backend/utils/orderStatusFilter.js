export const buildOrderStatusFilter = (status) => {
  const normalizedStatus = String(status || "").trim();
  const paidRazorpayClause = {
    paymentGateway: { $in: ["Razorpay", "razorpay"] },
    paymentId: { $type: "string", $gt: "" },
  };

  if (!normalizedStatus) return {};

  if (normalizedStatus === "Pending") {
    return {
      status: "Pending",
      $nor: [{ paymentStatus: "paid" }, paidRazorpayClause],
    };
  }

  if (normalizedStatus === "Confirmed") {
    return {
      $or: [
        { status: "Confirmed" },
        { orderStatus: "Confirmed" },
        { status: "Pending", paymentStatus: "paid" },
        { orderStatus: "Pending", paymentStatus: "paid" },
        { status: "Pending", ...paidRazorpayClause },
        { orderStatus: "Pending", ...paidRazorpayClause },
      ],
    };
  }

  return { status: normalizedStatus };
};
