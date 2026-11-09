import type {
  AuthSession,
  BusinessSummary,
  SessionUser,
  User,
} from "@/features/auth/schemas/auth.schema";
import type { Dashboard } from "@/features/dashboard/schemas/dashboard.schema";
import type {
  PlatformBusiness,
  PlatformBusinessPage,
  PlatformOverview,
} from "@/features/platform/schemas/platform.schema";
import type { Report } from "@/features/reports/schemas/report.schema";
import type { Service } from "@/features/services/schemas/service.schema";
import type { BusinessSettings } from "@/features/settings/schemas/settings.schema";
import type { StaffMember } from "@/features/staff/schemas/staff.schema";
import type {
  Transaction,
  TransactionList,
} from "@/features/transactions/schemas/transaction.schema";

/**
 * Typed fixtures shaped exactly like the contract in carwash-api/docs/api (the prototype's demo
 * business). Tests copy and override them; they never reach a real API.
 */

export const BUSINESS_ID = "64b7f0c2a1b2c3d4e5f60301";
export const PENDING_BUSINESS_ID = "64b7f0c2a1b2c3d4e5f60302";
export const ADMIN_ID = "64b7f0c2a1b2c3d4e5f60001";
export const CASHIER_ID = "64b7f0c2a1b2c3d4e5f60002";
export const SUPER_ADMIN_ID = "64b7f0c2a1b2c3d4e5f60003";
export const FULL_WASH_ID = "64b7f0c2a1b2c3d4e5f60101";
export const EXTERIOR_WASH_ID = "64b7f0c2a1b2c3d4e5f60102";
export const TRANSACTION_ID = "64b7f0c2a1b2c3d4e5f60201";

export const adminUser = {
  id: ADMIN_ID,
  businessId: BUSINESS_ID,
  name: "Adaeze Okafor",
  email: "adaeze@cartorywash.ng",
  role: "admin",
  isActive: true,
  mustChangePassword: false,
  lastLoginAt: "2026-10-19T07:58:00.000Z",
  createdAt: "2026-09-01T09:00:00.000Z",
  updatedAt: "2026-10-19T07:58:00.000Z",
} satisfies User;

export const cashierUser = {
  ...adminUser,
  id: CASHIER_ID,
  name: "Tunde Bello",
  email: "tunde@cartorywash.ng",
  role: "cashier",
} satisfies User;

export const superAdminUser = {
  ...adminUser,
  id: SUPER_ADMIN_ID,
  businessId: null,
  name: "Ifeoma Nwosu",
  email: "ifeoma@cartory.app",
  role: "super_admin",
} satisfies User;

export const activeBusiness = {
  id: BUSINESS_ID,
  name: "Cartory Wash",
  status: "active",
} satisfies BusinessSummary;

/** Signed-in accounts as `GET /auth/me` returns them (the desk and platform sessions). */
export const adminSessionUser = { ...adminUser, business: activeBusiness } satisfies SessionUser;
export const cashierSessionUser = {
  ...cashierUser,
  business: activeBusiness,
} satisfies SessionUser;
export const superAdminSessionUser = { ...superAdminUser, business: null } satisfies SessionUser;
/** The owner of a business still waiting for approval. */
export const pendingOwnerSessionUser = {
  ...adminUser,
  businessId: PENDING_BUSINESS_ID,
  business: { id: PENDING_BUSINESS_ID, name: "Splash Point", status: "pending" },
} satisfies SessionUser;

export const authSession = {
  accessToken: "header.payload.signature",
  accessTokenExpiresAt: "2026-10-19T09:15:00.000Z",
  refreshToken: "refresh.payload.signature",
  refreshTokenExpiresAt: "2026-10-26T09:00:00.000Z",
  user: adminSessionUser,
} satisfies AuthSession;

export const staffMember = { ...cashierUser, todayCount: 14 } satisfies StaffMember;

export const fullWash = {
  id: FULL_WASH_ID,
  name: "Full wash",
  priceKobo: 600_000,
  isActive: true,
  sortOrder: 3,
  soldLast30Days: 118,
  createdAt: "2026-09-01T09:00:00.000Z",
  updatedAt: "2026-09-01T09:00:00.000Z",
} satisfies Service;

export const exteriorWash = {
  ...fullWash,
  id: EXTERIOR_WASH_ID,
  name: "Exterior wash",
  priceKobo: 300_000,
  sortOrder: 1,
  soldLast30Days: 160,
} satisfies Service;

export const businessSettings = {
  name: "Cartory Wash",
  phone: "0803 412 7790",
  address: "14 Admiralty Way, Lekki Phase 1, Lagos",
  receiptFooter: "Clean car. Clear impression.",
  currency: "NGN",
  requirePaymentConfirmation: true,
  showMenuPrices: true,
  updatedAt: "2026-10-01T09:00:00.000Z",
} satisfies BusinessSettings;

export const paidTransaction = {
  id: TRANSACTION_ID,
  reference: "CW-261019-024",
  service: { id: FULL_WASH_ID, name: "Full wash" },
  listPriceKobo: 600_000,
  amountKobo: 600_000,
  isAdjusted: false,
  adjustmentReason: null,
  method: "transfer",
  paymentConfirmed: true,
  vehicle: { plate: "KJA 482 FX", makeModel: "Toyota Corolla" },
  status: "paid",
  recordedBy: { id: CASHIER_ID, name: "Tunde Bello" },
  cancellation: null,
  businessDate: "2026-10-19",
  createdAt: "2026-10-19T09:30:00.000Z",
} satisfies Transaction;

export const adjustedTransaction = {
  ...paidTransaction,
  id: "64b7f0c2a1b2c3d4e5f60202",
  reference: "CW-261019-025",
  amountKobo: 550_000,
  isAdjusted: true,
  adjustmentReason: "Regular customer discount",
  method: "cash",
  paymentConfirmed: false,
} satisfies Transaction;

export const cancelledTransaction = {
  ...paidTransaction,
  id: "64b7f0c2a1b2c3d4e5f60203",
  reference: "CW-261019-026",
  status: "cancelled",
  cancellation: {
    by: { id: ADMIN_ID, name: "Adaeze Okafor" },
    reason: "Duplicate entry",
    at: "2026-10-19T10:02:00.000Z",
  },
} satisfies Transaction;

export const transactionList = {
  items: [paidTransaction, adjustedTransaction, cancelledTransaction],
  pageInfo: { page: 1, limit: 40, total: 3, totalPages: 1 },
  summary: { count: 3, paidCount: 2, paidTotalKobo: 1_150_000 },
} satisfies TransactionList;

export const dashboard = {
  period: "today",
  from: "2026-10-19",
  to: "2026-10-19",
  revenueKobo: 1_150_000,
  carsWashed: 2,
  averageKobo: 575_000,
  cancelledCount: 1,
  methods: [
    { method: "cash", count: 1, totalKobo: 550_000, share: 0.478 },
    { method: "transfer", count: 1, totalKobo: 600_000, share: 0.522 },
    { method: "pos", count: 0, totalKobo: 0, share: 0 },
  ],
  topServices: [{ serviceId: FULL_WASH_ID, name: "Full wash", count: 2, revenueKobo: 1_150_000 }],
  staff: [{ userId: CASHIER_ID, name: "Tunde Bello", count: 2, revenueKobo: 1_150_000 }],
  recent: [cancelledTransaction, adjustedTransaction, paidTransaction],
} satisfies Dashboard;

export const report = {
  range: "week",
  from: "2026-10-19",
  to: "2026-10-20",
  dayCount: 2,
  kpis: {
    revenueKobo: 19_750_000,
    carsWashed: 41,
    averageCarsPerDay: 21,
    dailyAverageKobo: 9_875_000,
    adjustedCount: 2,
    adjustmentTotalKobo: 150_000,
    cancelledCount: 2,
  },
  days: [
    {
      date: "2026-10-19",
      count: 18,
      cashKobo: 3_000_000,
      transferKobo: 4_000_000,
      posKobo: 1_450_000,
      totalKobo: 8_450_000,
      cancelledCount: 1,
    },
    {
      date: "2026-10-20",
      count: 23,
      cashKobo: 4_000_000,
      transferKobo: 5_000_000,
      posKobo: 2_300_000,
      totalKobo: 11_300_000,
      cancelledCount: 1,
    },
  ],
  peakDay: { date: "2026-10-20", totalKobo: 11_300_000, count: 23 },
  services: [
    { serviceId: FULL_WASH_ID, name: "Full wash", count: 11, revenueKobo: 6_600_000, share: 0.33 },
  ],
  staff: [
    {
      userId: CASHIER_ID,
      name: "Tunde Bello",
      count: 19,
      adjustedCount: 0,
      revenueKobo: 10_400_000,
    },
  ],
} satisfies Report;

export const activePlatformBusiness = {
  id: BUSINESS_ID,
  name: "Cartory Wash",
  phone: "0803 412 7790",
  address: "14 Admiralty Way, Lekki Phase 1, Lagos",
  status: "active",
  statusReason: null,
  statusChangedAt: "2026-09-01T10:00:00.000Z",
  approvedAt: "2026-09-01T10:00:00.000Z",
  registeredBy: { id: ADMIN_ID, name: "Adaeze Okafor", email: "adaeze@cartorywash.ng" },
  createdAt: "2026-09-01T09:00:00.000Z",
  activeStaffCount: 3,
  last30Days: { carsWashed: 412, revenueKobo: 241_500_000 },
  lastSaleAt: "2026-10-19T09:30:00.000Z",
} satisfies PlatformBusiness;

export const pendingPlatformBusiness = {
  ...activePlatformBusiness,
  id: PENDING_BUSINESS_ID,
  name: "Splash Point",
  phone: "0812 555 0101",
  address: "",
  status: "pending",
  statusChangedAt: null,
  approvedAt: null,
  registeredBy: { id: "64b7f0c2a1b2c3d4e5f60011", name: "Chidi Obi", email: "chidi@splash.ng" },
  createdAt: "2026-10-18T15:20:00.000Z",
  activeStaffCount: 1,
  last30Days: { carsWashed: 0, revenueKobo: 0 },
  lastSaleAt: null,
} satisfies PlatformBusiness;

export const suspendedPlatformBusiness = {
  ...activePlatformBusiness,
  id: "64b7f0c2a1b2c3d4e5f60303",
  name: "Shine Hub",
  status: "suspended",
  statusReason: "Unpaid subscription",
  statusChangedAt: "2026-10-10T08:00:00.000Z",
} satisfies PlatformBusiness;

export const platformBusinessPage = {
  items: [pendingPlatformBusiness, suspendedPlatformBusiness, activePlatformBusiness],
  pageInfo: { page: 1, limit: 40, total: 3, totalPages: 1 },
} satisfies PlatformBusinessPage;

export const platformOverview = {
  businesses: { total: 3, pending: 1, active: 1, suspended: 1 },
  last30Days: { carsWashed: 412, revenueKobo: 241_500_000 },
  platformFees: {
    last30DaysKobo: 4_120_000,
    perTransactionKobo: 10_000,
    payer: "customer",
  },
} satisfies PlatformOverview;
