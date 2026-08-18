/**
 * Shared types between frontend and backend
 * Keep these in sync with backend DTOs
 */

// ============================================
// User & Authentication Types
// ============================================

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "PRODUCT" | "OPERATOR" | "CUSTOMER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ============================================
// Operator Registration Types
// ============================================

export enum OperatorType {
  TOW_TRUCK = "TOW_TRUCK",
  MECHANIC = "MECHANIC",
  FUEL_DELIVERY = "FUEL_DELIVERY",
  TYRE_REPAIR = "TYRE_REPAIR",
  BATTERY_JUMPSTART = "BATTERY_JUMPSTART",
}

export const OPERATOR_TYPES: Record<OperatorType, string> = {
  [OperatorType.TOW_TRUCK]: "Tow Truck",
  [OperatorType.MECHANIC]: "Mechanic",
  [OperatorType.FUEL_DELIVERY]: "Fuel Delivery",
  [OperatorType.TYRE_REPAIR]: "Tyre Repair",
  [OperatorType.BATTERY_JUMPSTART]: "Battery Jumpstart",
};

export enum TruckClass {
  LIGHT_DUTY = "LIGHT_DUTY",
  TEN_TYRE = "TEN_TYRE",
  LOW_BED = "LOW_BED",
  HIAB = "HIAB",
}

export const TRUCK_CLASSES: Record<TruckClass, string> = {
  [TruckClass.LIGHT_DUTY]: "Light Duty",
  [TruckClass.TEN_TYRE]: "10-Tyre",
  [TruckClass.LOW_BED]: "Low Bed",
  [TruckClass.HIAB]: "Hiab",
};

export interface RegisterOperatorRequest {
  name: string;
  businessName: string;
  contactName: string;
  phoneNumber: string;
  businessPhoneNumber: string;
  email: string;
  password: string;
  type: OperatorType;
  address: string;
  latitude: number;
  longitude: number;
  truckClasses: TruckClass[];
  serviceRadius: number;
}

export interface OperatorResponse {
  id: string;
  businessName: string;
  contactName: string;
  phoneNumber: string;
  email: string;
  type: string;
  truckClasses: TruckClass[];
  address: string;
  latitude: number;
  longitude: number;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Rescue Request Types
// ============================================

export type RescueRequestStatus =
  | "PENDING"
  | "WAITING_FOR_DEPOSIT"
  | "OPERATOR_ASSIGNED"
  | "IN_PROGRESS"
  | "ARRIVED"
  | "COMPLETED"
  | "CANCELLED"
  | "STALLED"
  | "DISPATCHING";

export type IssueType = 
  | "BREAKDOWN" 
  | "ACCIDENT" 
  | "FUEL" 
  | "TYRE" 
  | "BATTERY" 
  | "OTHER";

export interface Customer {
  id: string;
  phoneNumber: string;
  name?: string;
}

export interface AssignedOperator {
  id: string;
  businessName: string;
  phoneNumber?: string;
}

export interface PaymentInfo {
  depositPaid: boolean;
  balancePaid: boolean;
  depositAmount?: number;
  balanceAmount?: number;
  totalAmount?: number;
}

export interface RescueRequestListItem {
  id: string;
  status: RescueRequestStatus;
  issueType: IssueType;
  latitude: string;
  longitude: string;
  depositPaid: boolean;
  balancePaid: boolean;
  customer: Customer;
  assignedOperator?: AssignedOperator;
  createdAt: string;
  updatedAt: string;
}

export interface DispatchOfferAdmin {
  operatorId: string;
  businessName: string;
  status: string;
  quotedPrice?: number;
  motoristFacingTotal?: number;
  offeredAt: string;
  respondedAt?: string;
}

export interface RescueRequestDetail extends RescueRequestListItem {
  description?: string;
  adminNotes?: string;
  vehicleType?: string;
  destination?: string;
  mediaLinks: string[];
  offers?: DispatchOfferAdmin[];
  depositAmount?: number;
  balanceAmount?: number;
  timeline?: {
    status: RescueRequestStatus;
    timestamp: string;
    updatedBy?: string;
  }[];
}

// Unified response type for both Admin and Operator
export interface RescueRequestListResponse {
  data: RescueRequestListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

// Query options for fetching rescue requests
export interface FetchListOptions {
  status?: string;
  issueType?: string;
  operatorId?: string;
  depositPaid?: boolean;
  balancePaid?: boolean;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Request payloads
export interface AssignOperatorRequest {
  operatorId: string;
}

export interface StatusUpdateRequest {
  status: RescueRequestStatus;
}

export interface CancelRequest {
  reason: string;
}

// Legacy simple type kept for compatibility
export interface RescueRequest {
  id: string;
  title: string;
  description: string;
  status: RescueRequestStatus;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  requesterId: string;
  operatorId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API Error Response
// ============================================

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

// ============================================
// Pagination Types
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ============================================
// Dashboard Stats Types
// ============================================

export interface DashboardStats {
  label: string;
  value: string | number;
  trend: string;
}

export interface SuperAdminStats {
  totalRequests: number;
  activeRequests: number;
  completedToday: number;
  availableOperators: number;
  revenue: string;
}

export interface AdminStats {
  activeRequests: number;
  pendingApproval: number;
  completedToday: number;
  availableOperators: number;
  payments: string;
}

export interface OperatorStats {
  newJobOffers: number;
  activeJobs: number;
  completedToday: number;
  earnings: string;
  status: "ONLINE" | "OFFLINE";
}
