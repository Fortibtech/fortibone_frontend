// API Services - Central exports

// Auth
export {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    resendOtp,
    verifyEmail,
    getProfile,
    type RegisterPayload,
    type LoginResponse,
    type ResetPasswordPayload
} from './auth';

// Wallet
export {
    getWallet,
    createDeposit,
    createWithdraw,
    getWalletTransactions,
    transferMoney,
    type Wallet,
    type WalletTransaction,
    type WalletTransactionResponse,
    type DepositPayload,
    type WithdrawPayload,
    type TransactionType,
    type TransactionStatus
} from './wallet';

// Orders
export {
    createOrder,
    getMyOrders,
    getOrderById,
    getBusinessOrders,
    updateOrderStatus,
    payOrder,
    type Order,
    type OrderStatus,
    type OrderType,
    type OrderLine,
    type Customer,
    type OrdersPaginatedResponse,
    type CreateOrderPayload
} from './orders';

// Products
export {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createVariant,
    updateVariant,
    searchProducts,
    type Product,
    type ProductVariant,
    type ProductSearchFilters,
    type CreateProductData,
    type CreateVariantData
} from './products';

// Business
export {
    getMyBusinesses,
    getBusinessById,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    searchBusinesses,
    getBusinessMembers,
    addBusinessMember,
    removeBusinessMember,
    getOpeningHours,
    updateOpeningHours,
    type CreateBusinessData,
    type BusinessFilters,
    type BusinessMember,
    type OpeningHour,
    type PaginatedResponse,
    type CommerceType,
    type PriceRange
} from './business';

// Analytics (aligné mobile api/analytics.ts)
export {
    getAnalyticsOverview,
    getSales,
    getInventory,
    getTopCustomers,
    getOrders,
    getPendingOrdersCount,
    getProcessingPurchasesCount,
    getRestaurantAnalytics,
    type AnalyticsOverview,
    type SalesResponse,
    type SalesByPeriod,
    type TopSellingProduct,
    type InventoryResponse,
    type TopCustomer,
    type TopCustomersResponse,
    type RestaurantAnalyticsResponse
} from './analytics';

// Permissions (aligné mobile api/permissions.ts)
export {
    BusinessPermissions,
    type BusinessPermission,
    type UserPermissions
} from './permissions';

// Favorites
export {
    getFavorites,
    addToFavorites,
    deleteFavorite,
    type UserFavorite,
    type GetFavoritesResponse,
    type GetFavoritesParams
} from './favorites';

export { default as axiosInstance } from './axiosInstance';

