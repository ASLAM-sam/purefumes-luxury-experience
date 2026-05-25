export const SUCCESSFUL_PAYMENT_STATUSES = ["paid", "completed", "success"];

const FAILED_PAYMENT_STATUSES = ["failed", "refunded"];

const PAID_RAZORPAY_CLAUSE = {
  paymentGateway: { $in: ["Razorpay", "razorpay"] },
  paymentId: { $type: "string", $gt: "" },
  paymentStatus: { $nin: FAILED_PAYMENT_STATUSES },
};

export const isSuccessfulPaymentStatus = (status) =>
  SUCCESSFUL_PAYMENT_STATUSES.includes(
    String(status || "")
      .trim()
      .toLowerCase(),
  );

export const buildSuccessfulPaymentFilter = () => ({
  $or: [
    { paymentStatus: { $in: SUCCESSFUL_PAYMENT_STATUSES } },
    PAID_RAZORPAY_CLAUSE,
  ],
});

export const buildSuccessfulOrderFilter = (...clauses) => ({
  $and: [
    { status: { $ne: "Cancelled" } },
    { orderStatus: { $ne: "Cancelled" } },
    buildSuccessfulPaymentFilter(),
    ...clauses.filter((clause) => clause && Object.keys(clause).length > 0),
  ],
});

export const buildOrderStatusFilter = (status) => {
  const normalizedStatus = String(status || "").trim();

  if (!normalizedStatus) return {};

  if (normalizedStatus === "Pending") {
    return {
      status: "Pending",
      $nor: [
        { paymentStatus: { $in: SUCCESSFUL_PAYMENT_STATUSES } },
        PAID_RAZORPAY_CLAUSE,
      ],
    };
  }

  if (normalizedStatus === "Confirmed") {
    return {
      $or: [
        { status: "Confirmed" },
        { orderStatus: "Confirmed" },
        {
          status: "Pending",
          paymentStatus: { $in: SUCCESSFUL_PAYMENT_STATUSES },
        },
        {
          orderStatus: "Pending",
          paymentStatus: { $in: SUCCESSFUL_PAYMENT_STATUSES },
        },
        { status: "Pending", ...PAID_RAZORPAY_CLAUSE },
        { orderStatus: "Pending", ...PAID_RAZORPAY_CLAUSE },
      ],
    };
  }

  return { status: normalizedStatus };
};
