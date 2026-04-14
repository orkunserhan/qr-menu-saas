/**
 * Clean Architecture Aggregator - Fix
 * Next.js Server Actions require explicit function exports.
 * We removed 'use server' from here and explicitly export functions 
 * to avoid exporting constants like MAX_SIZE which cause errors.
 */

export {
    createRestaurant,
    updateRestaurantDailyStatus,
    updateRestaurantBrand,
    updateRestaurantCorporate,
    updateRestaurantCampaign,
    updateLiteMode,
    updateRestaurantMenuAppearance,
    updateRestaurantSystem,
    deleteRestaurant,
    toggleRestaurantActiveStatus,
    restoreRestaurant,
    hardDeleteRestaurant
} from './actions/restaurant';

export {
    createCategory,
    createProduct,
    updateProduct,
    toggleProductAvailability,
    deleteCategory,
    deleteProduct
} from './actions/menu';

export {
    archiveOldOrders,
    sendMonthlyReportEmail
} from './actions/analytics';

export {
    toggleFeedbackRead,
    deleteFeedback
} from './actions/feedback';

export {
    createRestaurantWithInvite
} from './actions/super-admin';

