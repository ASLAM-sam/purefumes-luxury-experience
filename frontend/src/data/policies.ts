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

const lastUpdated = "May 14, 2026";

export const policies = {
  privacy: {
    title: "Privacy Policy",
    eyebrow: "Privacy and data care",
    description:
      "How Purefumes Hyderabad collects, uses, protects, and shares customer information for a secure perfume shopping experience.",
    lastUpdated,
    sections: [
      {
        title: "Information We Collect",
        content: [
          "Purefumes Hyderabad collects information that helps us process orders, provide customer support, deliver fragrances, improve the website, and comply with applicable legal and payment requirements.",
        ],
        items: [
          "Name, mobile number, email address, billing address, delivery address, and order preferences.",
          "Order details including products purchased, quantity, value, payment status, shipping status, and support requests.",
          "Device, browser, IP address, approximate location, pages visited, and usage data collected through standard website technologies.",
        ],
      },
      {
        title: "Account Information",
        content: [
          "When you create an account or place an order, we may store profile details, saved addresses, wishlist activity, cart information, and order history so you can manage purchases and receive service updates.",
          "You are responsible for keeping your account login details confidential and for notifying us promptly if you suspect unauthorized access.",
        ],
      },
      {
        title: "Payment Security",
        content: [
          "Payments are handled through authorized payment partners such as Razorpay and other permitted payment methods. Purefumes Hyderabad does not store full card numbers, CVV, UPI PINs, internet banking passwords, or other sensitive payment credentials.",
          "Payment confirmations, transaction IDs, refund references, and payment status updates may be stored only to complete orders, support refunds, and resolve payment disputes.",
        ],
      },
      {
        title: "Cookies Usage",
        content: [
          "We use cookies and similar technologies to keep the website functional, remember cart activity, support login sessions, understand shopping behavior, and improve performance.",
          "You may disable cookies in your browser settings, but some website features such as cart persistence, account login, and checkout may not work properly.",
        ],
      },
      {
        title: "Third-Party Services",
        content: [
          "We may share limited information with service providers that help us operate the store, including payment gateways, courier partners, hosting providers, analytics tools, email services, fraud-prevention systems, and customer support tools.",
          "These providers are expected to use information only for the services they perform for Purefumes Hyderabad and in accordance with applicable privacy and security obligations.",
        ],
      },
      {
        title: "Data Protection",
        content: [
          "We use reasonable administrative, technical, and operational safeguards to protect customer information from unauthorized access, misuse, alteration, disclosure, or loss.",
          "No digital platform can guarantee absolute security. If we become aware of a data incident that materially affects your information, we will take appropriate steps based on the nature of the incident and applicable law.",
        ],
      },
      {
        title: "User Rights",
        content: [
          "You may request access to your personal information, correction of inaccurate details, deletion of eligible data, withdrawal of optional marketing consent, or clarification about how your information is used.",
          "Certain information may be retained when required for order records, tax compliance, fraud prevention, dispute resolution, legal obligations, or legitimate business purposes.",
        ],
      },
      {
        title: "Contact Details",
        content: [
          "For privacy questions, data requests, or account concerns, contact Purefumes Hyderabad at purefumes.hyderabad@gmail.com or +91 8686003446.",
          "Business location: Hyderabad, Telangana, India.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    eyebrow: "Website terms",
    description:
      "The terms that govern browsing, ordering, payment, delivery, and customer responsibilities on Purefumes Hyderabad.",
    lastUpdated,
    sections: [
      {
        title: "Website Usage Terms",
        content: [
          "By accessing or using this website, creating an account, placing an order, or contacting us through the website, you agree to these Terms & Conditions.",
          "You must use the website only for lawful purposes and must not attempt to disrupt the platform, misuse promotions, submit false information, or interfere with other customers.",
        ],
      },
      {
        title: "Product Information Disclaimer",
        content: [
          "Purefumes Hyderabad makes reasonable efforts to display product names, sizes, fragrance notes, images, ingredients, descriptions, and availability accurately.",
          "Fragrance perception, projection, longevity, color, packaging, batch presentation, and bottle appearance may vary by skin chemistry, storage conditions, manufacturer updates, photography, screen settings, and supplier batches.",
        ],
      },
      {
        title: "Pricing and Availability",
        content: [
          "All prices are displayed in Indian Rupees unless stated otherwise. Prices, discounts, offers, delivery charges, and product availability may change without prior notice.",
          "If a pricing error, stock error, technical issue, or payment discrepancy is identified, we may contact you for confirmation, revise the order, or cancel and refund the affected order.",
        ],
      },
      {
        title: "Intellectual Property",
        content: [
          "All website content, including text, layout, product presentation, graphics, photographs, brand styling, icons, and user interface elements owned or licensed by Purefumes Hyderabad are protected by intellectual property laws.",
          "You may not copy, reproduce, distribute, scrape, modify, resell, or commercially exploit website content without written permission from Purefumes Hyderabad.",
        ],
      },
      {
        title: "User Responsibilities",
        content: [
          "You agree to provide accurate contact, address, and payment information and to ensure someone is available to receive the order at the delivery address.",
          "You are responsible for checking product details before ordering, reviewing order confirmations, responding to support requests, and following care instructions for perfumes.",
        ],
      },
      {
        title: "Order Acceptance and Rejection",
        content: [
          "An order confirmation or payment success message does not automatically mean an order has been accepted for dispatch. Final acceptance occurs when the order is verified and prepared for shipment.",
          "We may accept, reject, hold, or cancel an order due to stock limitations, suspected fraud, payment failure, incorrect pricing, delivery restrictions, incomplete information, repeated failed deliveries, or operational limitations.",
        ],
      },
      {
        title: "Limitation of Liability",
        content: [
          "To the maximum extent permitted by law, Purefumes Hyderabad will not be liable for indirect, incidental, special, consequential, punitive, or loss-of-profit damages arising from website use, delayed delivery, product unavailability, or customer misuse.",
          "Our total liability for a confirmed order is limited to the amount paid by the customer for that specific order, except where applicable law requires otherwise.",
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
    eyebrow: "Refund and cancellation care",
    description:
      "Clear guidance on order cancellation, refund eligibility, damaged product handling, and payment reversals at Purefumes Hyderabad.",
    lastUpdated,
    sections: [
      {
        title: "Order Cancellation Window",
        content: [
          "Cancellation requests are accepted only before an order has been dispatched. Because fragrance orders may move quickly to packing, please contact support as soon as possible after placing the order.",
          "Once an order is shipped, it cannot be cancelled and will be handled under the applicable return or replacement rules.",
        ],
        items: [
          "For the fastest review, share your order ID, registered phone number, and reason for cancellation.",
          "If cancellation is approved before dispatch, any eligible refund will be processed to the original payment method.",
        ],
      },
      {
        title: "Refund Eligibility",
        content: [
          "Refunds may be approved when an order is cancelled before dispatch, a product is unavailable after payment, a duplicate payment is confirmed, a payment fails but the amount is debited, or a damaged, defective, or incorrect product claim is verified.",
        ],
      },
      {
        title: "Refund Processing Time",
        content: [
          "Approved refunds are usually initiated within 5 to 7 business days after verification. The final credit timeline depends on the issuing bank, card network, UPI provider, wallet, or payment gateway.",
          "If a refund is initiated successfully but not visible in your account, we will share available transaction or refund reference details for follow-up with your bank or payment provider.",
        ],
      },
      {
        title: "Non-Refundable Situations",
        items: [
          "Opened, sprayed, used, altered, damaged, or tampered products.",
          "Change of mind after dispatch, personal dislike of fragrance profile, projection, longevity, or dry-down.",
          "Incorrect address, unavailable recipient, refused delivery, or repeated failed delivery attempts caused by customer-side issues.",
          "Products purchased under clearly marked final-sale, clearance, custom request, decant, sample, or discovery formats unless damaged or incorrect on delivery.",
        ],
      },
      {
        title: "Damaged Product Handling",
        content: [
          "If you receive a damaged, leaked, defective, or incorrect product, contact support within 48 hours of delivery. Please share your order ID, clear photos, and an unboxing video where available.",
          "After verification, we may offer replacement, store credit, partial refund, or full refund depending on product condition, stock availability, and the nature of the issue.",
        ],
      },
      {
        title: "Payment Reversal Details",
        content: [
          "Refunds are issued to the original payment source wherever possible. Cash on Delivery adjustments, if offered, may be processed through bank transfer, UPI, store credit, or another mutually agreed method after verification.",
          "Payment gateway fees, shipping charges, and handling charges may be non-refundable where the order has already been packed, shipped, or where such charges are not returned by the service provider.",
        ],
      },
    ],
  },
  return: {
    title: "Return Policy",
    eyebrow: "Returns and replacements",
    description:
      "Return eligibility, condition requirements, timelines, replacements, and shipping rules for perfume purchases from Purefumes Hyderabad.",
    lastUpdated,
    sections: [
      {
        title: "Return Eligibility",
        content: [
          "Due to the personal and hygiene-sensitive nature of perfumes, returns are accepted only for eligible issues such as damaged, leaked, defective, missing, or incorrect products received on delivery.",
          "A return request must pass verification before any pickup, replacement, store credit, or refund is approved.",
        ],
      },
      {
        title: "Return Request Timeline",
        content: [
          "Customers must raise a return request within 48 hours of delivery by contacting Purefumes Hyderabad support with the order ID, phone number, photos, and an unboxing video where available.",
          "Requests raised after the timeline may be declined unless the issue is clearly attributable to transit or fulfillment and can be verified.",
        ],
      },
      {
        title: "Product Condition Requirements",
        items: [
          "The product must be unused, unopened, unsprayed, and in original condition unless the issue is leakage, breakage, or wrong product received.",
          "Original packaging, invoice, tags, seals, accessories, free gifts, and outer shipping material should be retained for verification.",
          "Do not dispose of the product or packaging until the support team confirms the next step.",
        ],
      },
      {
        title: "Non-Returnable Items",
        items: [
          "Opened, used, sprayed, tampered, or customer-damaged perfumes.",
          "Products returned without original packaging, invoice, batch details, or required verification evidence.",
          "Decants, samples, discovery sets, custom orders, special requests, clearance items, and final-sale products unless incorrect or damaged on arrival.",
          "Returns requested for fragrance preference, longevity, projection, personal allergy, or skin reaction after product use.",
        ],
      },
      {
        title: "Replacement Process",
        content: [
          "Once your claim is reviewed, we may arrange a replacement for the same product if stock is available. If the same item is unavailable, we may offer an alternate product, store credit, or refund as applicable.",
          "Replacement dispatch begins only after the original product is received and inspected, unless support approves an exception based on the evidence provided.",
        ],
      },
      {
        title: "Return Shipping Rules",
        content: [
          "For verified damaged, defective, leaked, missing, or incorrect products, return shipping or pickup will be guided by Purefumes Hyderabad wherever serviceable.",
          "If a return is approved for an exception that is not caused by our fulfillment or transit error, return shipping charges may be deducted or borne by the customer.",
        ],
      },
    ],
  },
} satisfies Record<string, PolicyPageContent>;
