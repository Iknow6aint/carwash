/**
 * Illustrative data shown in the landing page's mock screens (Splash Point Car Wash), verbatim
 * from the design. Nothing here is real or comes from the API.
 */

/** The landing design shows transfer and POS only. */
export type MockMethod = "Transfer" | "POS";

/** Swatch classes from the payment-method data tokens: transfer cyan, POS orange. */
export const MOCK_METHOD_SWATCH: Record<MockMethod, string> = {
  Transfer: "bg-transfer",
  POS: "bg-pos",
};

export interface MockService {
  name: string;
  price: string;
}

/** The uploaded price list and the customer's QR menu. */
export const MENU_SERVICES: readonly MockService[] = [
  { name: "Exterior wash", price: "₦3,000" },
  { name: "Interior cleaning", price: "₦4,000" },
  { name: "Full wash", price: "₦6,000" },
  { name: "Engine wash", price: "₦5,000" },
  { name: "Premium detail", price: "₦12,000" },
  { name: "Tyre shine", price: "₦1,500" },
];

/** "How it works" browser address and phone tag per step. */
export const HOW_URLS = [
  "app.cartorywash.ng/services/upload",
  "app.cartorywash.ng/services/qr-menu",
  "app.cartorywash.ng/new",
  "app.cartorywash.ng/dashboard",
] as const;

export const HOW_PHONE_TAGS = ["Admin", "Customer", "Customer receipt", "Owner"] as const;

export interface MockSale {
  time: string;
  service: string;
  method: MockMethod;
  amount: string;
}

/** "You see it, anywhere": today's latest sales on the dashboard. */
export const DASHBOARD_SALES: readonly MockSale[] = [
  { time: "5:42 PM", service: "Full wash + Engine wash", method: "Transfer", amount: "₦11,000" },
  { time: "5:31 PM", service: "Exterior wash", method: "POS", amount: "₦3,000" },
  { time: "5:18 PM", service: "Premium detail", method: "POS", amount: "₦12,000" },
  { time: "5:02 PM", service: "Full wash", method: "Transfer", amount: "₦5,000" },
  { time: "4:47 PM", service: "Interior", method: "Transfer", amount: "₦4,000" },
];

export const TOUR_KPIS = [
  { label: "Today revenue", value: "₦184,500" },
  { label: "Cars washed", value: "30" },
  { label: "Average per car", value: "₦6,150" },
] as const;

export const TOUR_BEST_SELLERS = [
  { name: "Exterior wash", sold: "12 sold", share: 1 },
  { name: "Full wash", sold: "9 sold", share: 0.75 },
  { name: "Interior", sold: "5 sold", share: 0.42 },
  { name: "Premium detail", sold: "4 sold", share: 0.33 },
] as const;

export const TOUR_STAFF = [
  { name: "Tunde Bello", cars: "16 cars", revenue: "₦97,500" },
  { name: "Grace Eze", cars: "11 cars", revenue: "₦66,000" },
  { name: "Adaeze Okafor", cars: "3 cars", revenue: "₦21,000" },
] as const;

export type MockStatus = "Paid" | "Adjusted" | "Cancelled";

export interface MockTransaction extends MockSale {
  plate: string;
  status: MockStatus;
}

export const TOUR_TRANSACTIONS: readonly MockTransaction[] = [
  {
    time: "5:42 PM",
    service: "Full wash",
    plate: "KJA 482 FX",
    method: "Transfer",
    amount: "₦6,000",
    status: "Paid",
  },
  {
    time: "5:31 PM",
    service: "Exterior wash",
    plate: "LSR 115 AB",
    method: "POS",
    amount: "₦3,000",
    status: "Paid",
  },
  {
    time: "5:18 PM",
    service: "Premium detail",
    plate: "EKY 903 KD",
    method: "POS",
    amount: "₦12,000",
    status: "Paid",
  },
  {
    time: "5:02 PM",
    service: "Full wash",
    plate: "—",
    method: "Transfer",
    amount: "₦5,000",
    status: "Adjusted",
  },
  {
    time: "4:47 PM",
    service: "Interior",
    plate: "APP 270 GH",
    method: "Transfer",
    amount: "₦4,000",
    status: "Paid",
  },
  {
    time: "4:40 PM",
    service: "Engine wash",
    plate: "FST 661 MN",
    method: "Transfer",
    amount: "₦5,000",
    status: "Cancelled",
  },
  {
    time: "4:22 PM",
    service: "Exterior wash",
    plate: "GGE 348 TR",
    method: "POS",
    amount: "₦3,000",
    status: "Paid",
  },
];

/** Revenue by day, last 14 days: [transfer, POS] in arbitrary units. */
export const REPORT_DAYS: readonly (readonly [number, number])[] = [
  [0.3, 0.15],
  [0.4, 0.2],
  [0.35, 0.1],
  [0.5, 0.25],
  [0.45, 0.2],
  [0.6, 0.3],
  [0.3, 0.12],
  [0.45, 0.2],
  [0.4, 0.22],
  [0.38, 0.15],
  [0.55, 0.25],
  [0.5, 0.3],
  [0.65, 0.35],
  [0.42, 0.18],
];

export const REPORT_STATS = [
  { label: "Revenue", value: "₦2.41M" },
  { label: "Cars", value: "402" },
  { label: "Daily avg", value: "₦172,000" },
  { label: "Adjusted", value: "₦18,500" },
] as const;
