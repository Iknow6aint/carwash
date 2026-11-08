/**
 * Landing page copy, verbatim from the Claude Design file (`landing-v2`). Mock screen data lives
 * in `demo-data.ts`.
 */

export interface LandingLink {
  href: string;
  label: string;
}

/** In-page anchors in the sticky nav. */
export const NAV_LINKS: readonly LandingLink[] = [
  { href: "#problem", label: "Why" },
  { href: "#platform", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#tour", label: "Product tour" },
  { href: "#faq", label: "FAQ" },
];

export const MARQUEE_ITEMS = [
  "Bank transfer",
  "POS",
  "Multiple services per car",
  "Service search",
  "Bulk price upload",
  "QR service menu",
  "Numbered receipts",
  "Admin and cashier roles",
  "Daily reports",
  "CSV export",
] as const;

export const PROBLEMS = [
  {
    number: "01",
    title: "Cars that never reach the book",
    body: "On a paper log, a missed line is invisible. On Cartory Wash every car gets a reference number and a receipt.",
  },
  {
    number: "02",
    title: "Transfers that didn't arrive",
    body: "Before a transfer or POS payment can be saved, the cashier confirms it landed. That check is stored with their name.",
  },
  {
    number: "03",
    title: "Discounts with no story",
    body: "Cashiers can adjust a price, but only with a reason. You see every adjustment, by whom, in your reports.",
  },
] as const;

/** One step of an auto-advancing tab list ("How it works", "Product tour"). */
export interface TabStep {
  title: string;
  description: string;
}

export const HOW_STEPS: readonly TabStep[] = [
  {
    title: "Upload your price list",
    description:
      "Drop in a spreadsheet of services and prices. Cartory Wash reads each row and builds your QR menu.",
  },
  {
    title: "Customers scan the menu",
    description:
      "The QR poster at your gate opens your services and prices on any phone. No app to install.",
  },
  {
    title: "Cashier records the sale",
    description:
      "Search, add every service the car needs, pick the payment method and save. The receipt is ready.",
  },
  {
    title: "You see it, anywhere",
    description:
      "The sale lands on your dashboard the moment it is saved, on the web or on your phone.",
  },
];

export const TOUR_STEPS: readonly TabStep[] = [
  {
    title: "Dashboard",
    description:
      "Revenue, cars washed and the transfer and POS split for today, this week or this month.",
  },
  {
    title: "Record a payment",
    description: "Adjust a price with a reason, and confirm transfers and POS slips before saving.",
  },
  {
    title: "Transactions",
    description: "Search by plate or reference. Cancelled entries stay visible, struck through.",
  },
  {
    title: "Reports",
    description:
      "Daily totals by payment method, best-selling services and staff, ready to export.",
  },
];

export interface Faq {
  question: string;
  answer: string;
}

export const FAQS: readonly Faq[] = [
  {
    question: "Can one car get more than one service?",
    answer:
      "Yes. Search or tap to add as many services as the customer wants. Each one shows on the receipt and counts toward your best-sellers.",
  },
  {
    question: "How does the QR menu work?",
    answer:
      "Cartory Wash creates a QR code for your service list. Print it for the gate or the waiting area; customers scan it with their phone camera to see services and prices. When you change a price, the menu updates.",
  },
  {
    question: "Can I upload my price list in one go?",
    answer:
      "Yes. Upload a spreadsheet with service names and prices, check the preview and confirm. You can still edit any service afterwards.",
  },
  {
    question: "Does Cartory Wash confirm bank transfers automatically?",
    answer:
      "No. The cashier ticks a confirmation after checking the bank app or POS slip, and that tick is stored with their name on the transaction.",
  },
  {
    question: "Can a cashier change a price?",
    answer:
      "Yes, on a single transaction and only with a reason. The reason appears on the receipt and in your reports. Only admins change the price list.",
  },
  {
    question: "Do customers get a receipt?",
    answer:
      "Every sale gets a numbered receipt with the services, payment method and cashier. Print it or copy it to send by WhatsApp.",
  },
  {
    question: "What do I need to run it?",
    answer:
      "A laptop, tablet or phone with a web browser and an internet connection. Receipts print on any printer the device can reach.",
  },
  {
    question: "Can I export my records?",
    answer:
      "Yes. Transactions and daily totals download as CSV files you can hand to your accountant.",
  },
];

export const FOOTER_GROUPS: readonly { title: string; links: readonly LandingLink[] }[] = [
  {
    title: "Product",
    links: [
      { href: "#platform", label: "Features" },
      { href: "#how", label: "How it works" },
      { href: "#tour", label: "Product tour" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "#demo", label: "Book a demo" },
      { href: "/register", label: "Register your car wash" },
      { href: "#faq", label: "FAQ" },
      { href: "/login", label: "Sign in" },
    ],
  },
];
