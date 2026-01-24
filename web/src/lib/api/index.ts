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

// Currency
export {
    getCurrencies,
    getCurrencySymbolById,
    type Currency
} from './currency';

// Reviews (aligné mobile api/Reviews.ts)
export {
    getAllReviews,
    createReview,
    type ProductReview,
    type ReviewAuthor,
    type ReviewsResponse,
    type CreateReviewPayload
} from './reviews';

// Customers (aligné mobile api/customers.ts)
export {
    getCustomerDetailById,
    type CustomerDetailResponse,
    type CustomerInfo,
    type CustomerStats,
    type CustomerOrder
} from './customers';

// Transactions (aligné mobile api/transactions.ts)
export {
    getTransactions,
    getTransactionsByBusiness,
    type Transaction,
    type TransactionOrder,
    type TransactionsResponse
} from './transactions';

// Members (aligné mobile api/members.ts)
export {
    getMembers,
    getMemberOverview,
    getMemberSales,
    getMemberInventoryMovements,
    getMemberOrders,
    type Member,
    type MemberUser,
    type MemberOverview,
    type MemberSales,
    type MemberInventoryMovements,
    type MemberOrders
} from './members';

// Helpers (aligné mobile api/helpers.ts)
export { getVariantById } from './helpers';

// Cloudinary (adapté du mobile pour le web)
export {
    uploadImageToCloudinary,
    uploadBase64ToCloudinary,
    compressImage,
    uploadCompressedImageToCloudinary
} from './cloudinary';

// Validation (aligné mobile api/validation.ts)
export {
    BusinessValidation,
    type ValidationError,
    type ValidationResult,
    type CreateBusinessData as ValidationCreateBusinessData,
    type AddMemberData as ValidationAddMemberData,
    type OpeningHour as ValidationOpeningHour,
    type UpdateOpeningHoursData as ValidationUpdateOpeningHoursData
} from './validation';

// Cache (adapté du mobile pour le web - localStorage)
export { cacheManager } from './cache';

// Hooks (adapté du mobile pour le web)
export {
    useBusiness,
    useBusinessMembers,
    useBusinesses,
    useSelectedBusiness,
    useBusinessActions
} from './hooks';

export { default as axiosInstance } from './axiosInstance';
