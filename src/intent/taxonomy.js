const taxonomy = {
  version: 1,
  brand: "AmazonHelp",
  intents: [
    {
      name: "package_not_received",
      description: "Customer reports that an ordered package has not been received or was delivered to the wrong place.",
      keywords: ["not arrived", "haven't received", "missing", "where is my package", "not received", "didn't receive", "hasn't arrived", "not delivered", "wrong country", "wrong address", "not been delivered", "never arrived", "where is it", "lost", "stolen"],
      include_when: ["Customer says the package has not arrived.", "Customer says the order is missing.", "Customer reports delivery to wrong address/country."],
      exclude_when: ["Customer only asks for tracking information."],
      examples: []
    },
    {
      name: "delivery_delay",
      description: "Customer reports that a delivery is late or delayed.",
      keywords: ["late", "delay", "waiting for", "when will it arrive", "still waiting", "taking too long", "over a month", "delayed", "not yet arrived", "still not here", "slow delivery", "slow", "long time", "expected", "promised", "behind schedule", "delivered issue", "delivery issue", "product delivered"],
      include_when: ["Customer says delivery is late but the package may still be in transit."],
      exclude_when: ["Customer says the package is completely missing."],
      examples: []
    },
    {
      name: "tracking_issue",
      description: "Customer has problems with tracking information or status updates.",
      keywords: ["tracking", "status", "update", "tracking number", "not updating", "tracking info", "track my order", "shipping info", "where is my order"],
      include_when: ["Customer specifically has a problem with tracking information."],
      exclude_when: ["Customer reports package as missing."],
      examples: []
    },
    {
      name: "refund_issue",
      description: "Customer is asking for a refund or complaining about a refund.",
      keywords: ["refund", "money back", "pay for", "refunded", "charge back", "get my money", "refund status"],
      include_when: ["Customer asks for their money back."],
      exclude_when: ["Customer only asks to return an item."],
      examples: []
    },
    {
      name: "return_request",
      description: "Customer wants to return an item.",
      keywords: ["return", "send back", "return process", "return label", "how to return", "devuelvo"],
      include_when: ["Customer wants to return a product."],
      exclude_when: ["Customer wants a refund without returning."],
      examples: []
    },
    {
      name: "wrong_item",
      description: "Customer received an item different from what they ordered.",
      keywords: ["wrong item", "incorrect item", "not what i ordered", "different product", "wrong thing", "received something else"],
      include_when: ["Customer says the item is not what they ordered."],
      exclude_when: ["Customer received a damaged item."],
      examples: []
    },
    {
      name: "damaged_item",
      description: "Customer received a damaged or broken item.",
      keywords: ["damaged", "broken", "smashed", "cracked", "not working", "leaking", "defective", "damaged item", "broken product", "product issue", "leaked", "open"],
      include_when: ["Customer reports the item is physically damaged or defective."],
      exclude_when: ["Customer received the wrong item."],
      examples: []
    },
    {
      name: "cancellation",
      description: "Customer wants to cancel an order or a membership.",
      keywords: ["cancel", "cancellation", "stop order", "cancel membership", "cancel my order", "stop", "end", "terminate", "withdraw"],
      include_when: ["Customer requests to cancel a transaction or service."],
      exclude_when: ["Customer wants to return an item already received."],
      examples: []
    },
    {
      name: "payment_issue",
      description: "Issues related to payments, billing, or charges.",
      keywords: ["payment", "charge", "billing", "credit card", "overcharged", "payment failed", "invoice", "charged twice"],
      include_when: ["Customer reports a billing error or payment failure."],
      exclude_when: ["Customer asks for a refund."],
      examples: []
    },
    {
      name: "account_issue",
      description: "Problems with account access, login, or profile settings.",
      keywords: ["account", "login", "password", "sign in", "access my account", "account on hold", "my account", "can't login"],
      include_when: ["Customer cannot access their account or has account restrictions."],
      exclude_when: ["Customer asks about order status."],
      examples: []
    },
    {
      name: "app_issue",
      description: "Technical problems with the Amazon app or website.",
      keywords: ["app", "not working", "crash", "application", "glitch", "website", "error", "sign in error", "site", "design", "experimenting"],
      include_when: ["Customer reports a technical bug in the app/site."],
      exclude_when: ["Customer has an account login issue."],
      examples: []
    },
    {
      name: "product_question",
      description: "General questions about products or features.",
      keywords: ["how to", "does it", "feature", "question", "available in", "supported", "compatible", "info about", "product", "item"],
      include_when: ["Customer asks for information about a product."],
      exclude_when: ["Customer reports a product defect."],
      examples: []
    },
    {
      name: "seller_issue",
      description: "Issues with third-party sellers on the marketplace.",
      keywords: ["seller", "third party", "merchant", "marketplace seller", "third party seller"],
      include_when: ["Customer complains about a third-party seller."],
      exclude_when: ["Customer complains about Amazon directly."],
      examples: []
    },
    {
      name: "subscription_issue",
      description: "Issues with Amazon Prime, memberships, or recurring fees.",
      keywords: ["prime", "membership", "monthly fee", "subscription", "prime benefit", "prime membership"],
      include_when: ["Customer asks about Prime benefits, membership fees, or subscription issues."],
      exclude_when: ["Customer only asks to cancel membership."],
      examples: []
    },
    {
      name: "digital_content_issue",
      description: "Issues with digital products like Kindle, Prime Video, or Echo skills.",
      keywords: ["echo", "kindle", "prime video", "skill", "digital", "ebook", "streaming", "playback", "video"],
      include_when: ["Customer reports issues with digital services or devices."],
      exclude_when: ["General app/site bugs."],
      examples: []
    },
    {
      name: "promotion_issue",
      description: "Issues with pre-orders, bonuses, discounts, or Prime benefits.",
      keywords: ["preorder", "bonus", "discount", "prime member", "prime benefit", "promo", "promotion", "pre-ordered"],
      include_when: ["Customer asks about pre-order bonuses or Prime-specific discounts."],
      exclude_when: ["General product questions."],
      examples: []
    },
    {
      name: "general_complaint",
      description: "General dissatisfaction with service or company, including legal threats.",
      keywords: ["worst", "terrible", "frustrated", "disappointed", "poor service", "pissed", "ashamed", "hate", "credibility", "humiliate", "legal", "complaint", "lawyer", "sue", "court"],
      include_when: ["Customer expresses overall frustration without a specific request.", "Customer threatens legal action."],
      exclude_when: ["Customer reports a specific delivery/product issue."],
      examples: []
    },
    {
      name: "general_feedback",
      description: "Greetings, thank-yous, and non-actionable acknowledgements.",
      keywords: ["thank you", "thanks", "hello", "hi", "hey", "appreciate", "ありがとうございます", "gracias"],
      include_when: ["Customer sends a greeting or thank-you message."],
      exclude_when: ["Message contains a specific support request."],
      examples: []
    },
    {
      name: "other",
      description: "Messages that do not fit into any other category, including non-English tweets and noise.",
      keywords: [],
      include_when: ["Ambiguous or unusual requests."],
      exclude_when: ["Fits any other defined intent."],
      examples: []
    }
  ]
};

module.exports = taxonomy;
