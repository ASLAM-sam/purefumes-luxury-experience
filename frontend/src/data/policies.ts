export type PolicySection = {
  title: string;
  content?: readonly string[];
  items?: readonly string[];
};

export type PolicyPageContent = {
  title: string;
  eyebrow: string;
  description: string;
  lastUpdated: string;
  sections: readonly PolicySection[];
};

const lastUpdated = "May 17, 2026";

export const policies = {
  shipping: {
    title: "Shipping Policy",
    eyebrow: "Shipping and delivery",
    description:
      "Shipping timelines, dispatch handling, tracking support, and delivery expectations for orders placed with Purefumes Hyderabad.",
    lastUpdated,
    sections: [
      {
        title: "Order Processing",
        content: [
          "Purefumes Hyderabad processes confirmed ecommerce orders with careful packing and order verification before dispatch.",
        ],
        items: [
          "Orders are processed within 1–3 business days.",
          "Orders placed during weekends, public holidays, high-volume sale periods, or operational closures may begin processing on the next business day.",
          "Customers are responsible for sharing a complete and reachable delivery address, phone number, and any delivery instructions at checkout.",
        ],
      },
      {
        title: "Delivery Timeline Across India",
        content: [
          "Delivery time across India is approximately 5–12 business days after dispatch, depending on the destination PIN code and courier serviceability.",
        ],
        items: [
          "Metro and major city deliveries may arrive sooner depending on courier movement.",
          "Remote locations, restricted areas, or locations with limited courier access may require additional time.",
          "Delivery delays may occur during festivals, weather conditions, or courier delays.",
        ],
      },
      {
        title: "Tracking Details",
        content: [
          "Tracking details will be shared after dispatch through the contact details provided during checkout.",
          "Once tracking is shared, customers can follow courier movement directly with the logistics partner. Our support team can assist if tracking does not update for an unusual period.",
        ],
      },
      {
        title: "Delivery Attempts",
        content: [
          "Courier partners may contact the customer before delivery. Please keep the registered phone number reachable until the shipment is delivered.",
          "Failed delivery due to an incorrect address, unreachable phone number, unavailable recipient, or refusal to accept the package may lead to return-to-origin handling and additional review before any refund or reshipment decision.",
        ],
      },
      {
        title: "Shipping Charges",
        content: [
          "Shipping charges, free-shipping eligibility, and any cash-on-delivery charges are shown at checkout before payment confirmation.",
          "If a shipment is delayed by courier constraints, Purefumes Hyderabad will coordinate with the logistics partner and share available updates with the customer.",
        ],
      },
      {
        title: "Support",
        content: [
          "For shipping help, contact Purefumes Hyderabad at +91-8686 003 446.",
          "Support Hours: Monday to Saturday | 11:00 AM – 6:00 PM.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    eyebrow: "Privacy and data protection",
    description:
      "How Purefumes Hyderabad collects, uses, protects, and shares customer information for a secure fragrance shopping experience.",
    lastUpdated,
    sections: [
      {
        title: "Information We Collect",
        content: [
          "Purefumes Hyderabad collects the information required to run a reliable ecommerce store, process orders, deliver products, provide support, prevent misuse, and meet applicable business and legal requirements.",
        ],
        items: [
          "Customer details such as name, phone number, email address, billing address, shipping address, and order communication.",
          "Order details such as selected products, quantities, price, payment status, delivery status, coupons, returns, refunds, and support history.",
          "Technical details such as device type, browser, IP address, pages visited, session activity, and approximate location collected through standard website technologies.",
        ],
      },
      {
        title: "How We Use Information",
        items: [
          "To create and manage customer accounts, carts, wishlists, and order history.",
          "To confirm orders, collect payments, arrange delivery, share tracking details, and provide customer support.",
          "To improve website performance, product discovery, security, fraud prevention, and service quality.",
          "To send transactional messages, service updates, account alerts, and optional promotional communication where permitted.",
        ],
      },
      {
        title: "Payment Security",
        content: [
          "Payments are processed through authorized payment partners such as Razorpay and other approved payment methods. Purefumes Hyderabad does not store full card numbers, CVV, UPI PINs, banking passwords, or other sensitive payment credentials.",
          "We may retain transaction IDs, payment status, refund references, and payment confirmation details only for order processing, dispute resolution, reconciliation, and customer support.",
        ],
      },
      {
        title: "Cookies and Website Technologies",
        content: [
          "We use cookies and similar technologies to keep the website functional, remember cart activity, support login sessions, improve performance, and understand browsing behavior.",
          "Customers may disable cookies in browser settings, but some features such as login, cart persistence, and checkout may not work properly without them.",
        ],
      },
      {
        title: "Sharing With Service Providers",
        content: [
          "We may share limited information with trusted service providers who help us operate the store, including payment gateways, courier partners, hosting providers, analytics tools, customer support systems, fraud-prevention services, and email or messaging providers.",
          "These providers are expected to use customer information only for the services they perform for Purefumes Hyderabad and in accordance with applicable privacy and security obligations.",
        ],
      },
      {
        title: "Data Protection and Retention",
        content: [
          "We use reasonable administrative, technical, and operational safeguards to protect customer information from unauthorized access, misuse, alteration, loss, or disclosure.",
          "Order and account records may be retained for tax, audit, fraud prevention, dispute resolution, legal compliance, and legitimate business purposes.",
        ],
      },
      {
        title: "Customer Rights",
        content: [
          "Customers may request correction of inaccurate account details, clarification about data use, withdrawal from optional promotional communication, or deletion of eligible information.",
          "Some information may continue to be retained when required for completed orders, payment records, tax compliance, fraud prevention, legal obligations, or dispute handling.",
        ],
      },
      {
        title: "Contact for Privacy Requests",
        content: [
          "For privacy questions or account-data requests, contact Purefumes Hyderabad at +91-8686 003 446.",
          "Support Hours: Monday to Saturday | 11:00 AM – 6:00 PM.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    eyebrow: "Website terms",
    description:
      "The terms that govern browsing, ordering, payments, delivery, product use, and customer responsibilities on Purefumes Hyderabad.",
    lastUpdated,
    sections: [
      {
        title: "Acceptance of Terms",
        content: [
          "By accessing this website, creating an account, placing an order, making a payment, or contacting Purefumes Hyderabad through the website, you agree to these Terms & Conditions.",
          "If you do not agree with these terms, please do not use the website or place an order.",
        ],
      },
      {
        title: "Business and Website Use",
        content: [
          "Purefumes Hyderabad operates an ecommerce website for perfumes, deodorants, and personal care items. Customers must use the website only for lawful purchases and genuine communication.",
        ],
        items: [
          "Do not misuse offers, submit false details, attempt unauthorized access, interfere with website performance, or use the platform for fraudulent activity.",
          "Customers must provide accurate contact, delivery, and payment information while placing an order.",
          "Account holders are responsible for keeping login details confidential and for activity under their account.",
        ],
      },
      {
        title: "Product Information",
        content: [
          "Purefumes Hyderabad makes reasonable efforts to display product names, sizes, prices, descriptions, images, availability, and fragrance information accurately.",
          "Fragrance experience, longevity, projection, color, packaging, batch presentation, and bottle appearance may vary due to manufacturer updates, storage conditions, skin chemistry, photography, screen settings, and supplier batches.",
        ],
      },
      {
        title: "Pricing, Offers, and Availability",
        content: [
          "All prices are displayed in Indian Rupees unless stated otherwise. Prices, discounts, shipping charges, cash-on-delivery charges, and availability may change without prior notice.",
          "If a pricing error, stock mismatch, payment discrepancy, or technical issue is identified, Purefumes Hyderabad may contact the customer, revise the order, cancel the order, or issue an eligible refund.",
        ],
      },
      {
        title: "Order Acceptance",
        content: [
          "Order placement or payment success does not automatically confirm final dispatch. Orders are accepted after verification, stock confirmation, payment review, and operational checks.",
          "Purefumes Hyderabad may cancel, hold, or reject an order due to stock limitations, suspected fraud, payment failure, incorrect pricing, incomplete information, delivery restrictions, repeated failed deliveries, or operational constraints.",
        ],
      },
      {
        title: "Payments and Checkout",
        content: [
          "Online payments are handled through approved payment partners. Customers should complete checkout only through the official Purefumes Hyderabad website payment flow.",
          "If a payment is debited but order confirmation is not generated, customers should contact support with payment proof so the transaction can be reviewed.",
        ],
      },
      {
        title: "Customer Responsibilities",
        items: [
          "Review product details, size, quantity, price, and delivery address before placing an order.",
          "Keep the registered phone number reachable for delivery and support communication.",
          "Retain packaging, invoice, and proof of damage if a return or replacement claim is raised.",
          "Use products responsibly and follow storage and safety instructions where applicable.",
        ],
      },
      {
        title: "Intellectual Property",
        content: [
          "Website content, layout, graphics, product presentation, photographs, icons, brand styling, and user interface elements owned or licensed by Purefumes Hyderabad are protected by applicable intellectual property laws.",
          "Customers may not copy, scrape, reproduce, resell, distribute, modify, or commercially exploit website content without written permission.",
        ],
      },
      {
        title: "Limitation of Liability",
        content: [
          "To the maximum extent permitted by law, Purefumes Hyderabad will not be liable for indirect, incidental, consequential, special, punitive, or loss-of-profit damages arising from website use, delayed delivery, product unavailability, or customer misuse.",
          "For a confirmed order, our maximum liability is limited to the amount paid by the customer for that specific order, except where applicable law requires otherwise.",
        ],
      },
      {
        title: "Governing Law",
        content: [
          "These Terms & Conditions are governed by the laws of India. Courts and competent forums in Hyderabad, Telangana shall have jurisdiction, subject to applicable consumer protection laws.",
        ],
      },
    ],
  },
  refund: {
    title: "Refund & Cancellation Policy",
    eyebrow: "Refunds and cancellations",
    description:
      "Refund timelines, payment reversals, cancellation windows, and verification rules for orders placed with Purefumes Hyderabad.",
    lastUpdated,
    sections: [
      {
        title: "Order Cancellations",
        items: [
          "Orders can only be cancelled before dispatch.",
          "Orders cannot be cancelled after shipping.",
          "If cancellation occurs due to stock or operational issues, full refund will be issued.",
        ],
      },
      {
        title: "Refund Eligibility",
        content: [
          "Refunds may be approved for eligible cancellations before dispatch, unavailable products after payment, confirmed duplicate payments, failed payments where the amount was debited, or verified damaged, leaked, defective, wrong, or missing products.",
        ],
      },
      {
        title: "Refund Process",
        content: [
          "Once approved, refunds will be processed to the original payment method within 6–8 business days.",
          "For prepaid orders, refund amount will reflect directly in the customer account.",
          "Purefumes Hyderabad will not be liable for delays caused by banks, payment gateways, logistics, or technical issues.",
        ],
      },
      {
        title: "Payment Reversal Details",
        content: [
          "Refunds are issued to the original payment method wherever possible. Customers may be asked for additional information only when required to complete verification or resolve a payment issue.",
          "Payment gateway charges, shipping charges, or handling charges may be non-refundable where the order has already been packed, shipped, or where such charges are not returned by the service provider.",
        ],
      },
      {
        title: "Damaged or Missing Items",
        items: [
          "If item is damaged, leaking, or missing:",
          "Report within 48 hours.",
          "Share photos/videos for verification.",
        ],
      },
      {
        title: "Non-Refundable Situations",
        items: [
          "Used, opened, sprayed, tampered, or customer-damaged products.",
          "Change of mind after dispatch.",
          "Incorrect address, unavailable recipient, refused delivery, or repeated failed delivery attempts caused by customer-side issues.",
          "Products purchased during clearance or sale events, gift cards, free promotional items, fragrance samples, or miniature bottles unless eligible under the damaged, wrong, or missing item rules.",
        ],
      },
      {
        title: "Support",
        content: [
          "Phone: +91-8686 003 446.",
          "Support Hours: Monday to Saturday | 11:00 AM – 6:00 PM.",
        ],
      },
    ],
  },
  return: {
    title: "Return Policy",
    eyebrow: "Returns and cancellations",
    description:
      "Return eligibility, replacement handling, cancellation rules, inspection requirements, and support details for Purefumes Hyderabad customers.",
    lastUpdated,
    sections: [
      {
        title: "Customer Satisfaction",
        content: [
          "At Purefumes Hyderabad, customer satisfaction is our top priority.",
          "We take great care to ensure every product reaches you in perfect condition. However, if there’s ever an issue with your order, we’re here to help.",
        ],
      },
      {
        title: "Eligibility for Return or Replacement",
        content: [
          "Due to the nature of our products (perfumes, deodorants, and personal care items), returns are accepted only in the following cases:",
        ],
        items: [
          "You received a wrong product",
          "The product arrived damaged, leaked, or defective",
          "The product is missing from your order",
          "To be eligible:",
          "The request must be raised within 24 hours of delivery",
          "The product must be unused, unopened, and in its original packaging",
          "Any tampered or broken seal will make the product ineligible for return",
        ],
      },
      {
        title: "Non-Returnable Items",
        content: [
          "For hygiene and authenticity reasons, we cannot accept returns or exchanges for:",
        ],
        items: [
          "Used or opened perfumes and testers",
          "Fragrance samples or miniature bottles",
          "Products purchased during clearance or sale events",
          "Gift cards or free promotional items",
        ],
      },
      {
        title: "How to Raise a Return Request",
        content: ["To initiate a return or replacement:"],
        items: [
          "WhatsApp or call us at +91-8686 003 446 within 24 hours of receiving your order",
          "Include your order number, reason for return, and product images/videos",
          "Required images:",
          "Outer packaging",
          "Product label and condition",
          "Any visible damage or issue",
          "Once verified, our support team will guide you through the next steps.",
        ],
      },
      {
        title: "Return Pickup & Inspection",
        items: [
          "Reverse pickup will be arranged if applicable",
          "Product will be inspected after reaching our facility",
          "Refund or replacement will be processed after approval",
          "If the item fails inspection (used, tampered, or damaged after delivery), it will be returned without refund.",
        ],
      },
      {
        title: "Refund Process",
        content: [
          "Once approved, refunds will be processed to the original payment method within 6–8 business days.",
          "For prepaid orders, refund amount will reflect directly in the customer account.",
          "Purefumes Hyderabad will not be liable for delays caused by banks, payment gateways, logistics, or technical issues.",
        ],
      },
      {
        title: "Order Cancellations",
        items: [
          "Orders can only be cancelled before dispatch",
          "Orders cannot be cancelled after shipping",
          "If cancellation occurs due to stock or operational issues, full refund will be issued",
        ],
      },
      {
        title: "Exchange Policy",
        content: [
          "Currently direct exchanges are not available.",
          "If customer wants another product:",
        ],
        items: [
          "Request refund if eligible",
          "Place a new order separately",
        ],
      },
      {
        title: "Damaged or Missing Items",
        content: ["If item is damaged, leaking, or missing:"],
        items: [
          "Report within 48 hours",
          "Share photos/videos for verification",
        ],
      },
      {
        title: "Support",
        content: [
          "Phone:",
          "+91-8686 003 446",
          "Support Hours:",
          "Monday to Saturday | 11:00 AM – 6:00 PM",
        ],
      },
    ],
  },
} satisfies Record<string, PolicyPageContent>;
