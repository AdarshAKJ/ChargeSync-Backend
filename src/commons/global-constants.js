export const ERROR = {
  PRIVATE_KEY_MISS: "Private key not found.",
  PRIVATE_KEY_MISS_MATCH: "Please provide a valid private key.",
  PROVIDE_TOKEN_ERROR: "Please provide a valid token.",
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again.",
  TOKEN_EXPIRED: "Token expired. Please login again.",
  PROVIDE_SERVICE_KEY: "Please provide a service API key.",
  INVALID_SERVICE_KEY: "Invalid service API key.",
  PROVIDE_TOKEN_SERVICE_ERROR: "Please provide a valid redirection token.",
  SERVER_DOWN:
    "WE are encountering some issues from our end please try after sometime.",
};

export const USER = {
  LOGIN_OTP: "To the registered mobile number, an OTP has been issued.",
  ALREADY_EXIST: "User already exists with the email or phone number supplied.",
  REGISTER_SUCCESS: "User registered successfully.",
  LOGIN_SUCCESS: "User logged in successfully.",
  LOGIN_FAILED: "Login failed.",
  LOGOUT_SUCCESS: "User logged out successfully.",
  LOGOUT_FAILED: "Logout failed.",
  USER_NOT_FOUND: "User not found.",
  JWT_TOKEN_GENERATED: "JWT token generated successfully.",
  INFO_UPDATED: "User Info Updated successfully",
};

export const FILE_MESSAGE = {
  ATTACHMENT_FILE_ERROR: `Please provide valid file.`,
  NOT_VALID: `Please provide valid file type.`,
  FILE_SIZE_EXCEED: `File is too large.`,
  UPLOADED: `Upload successfully.`,
  FILE_VIEW: `Presigned URL is generated.`,
  FILE_DELETED: `File deleted successfully.`,
};

export const PROJECT_MESSAGE = {
  PROJECT_NOT_FOUND: "Project not found.",
  PROJECT_ALREADY_EXISTS: "Project already exists.",
  PROJECT_CREATED: "Project created successfully.",
  PROJECT_UPDATED: "Project updated successfully.",
  PROJECT_DELETED: "Project deleted successfully.",
  PROJECT_FOUND: "Project found.",
};

export const COMMON_MESSAGE = {
  SUBSCRIPTION_SUCCESS: `Subscription added successfully.`,
  REFUND_SUCCESS: `Refund initiated successfully.`,
  STRIP_PLAN: `Stripe plan found successfully.`,
  SUBSCRIPTION_Details_FOUND: `Subscription details found for the user.`,
};

export const PAYMENT_MESSAGE = {
  COMPLETED: `Payment completed successfully.`,
};

export const TEMPLATE_MESSAGE = {
  TEMPLATE_CREATED: "Template created successfully.",
  TEMPLATE_UPDATED: "Template updated successfully.",
  TEMPLATE_DELETED: "Template deleted successfully.",
  TEMPLATE_FOUND: "Template data found.",
};

export const DOCUMENT_MESSAGE = {
  DOCUMENT_CREATED: "Document created successfully.",
  DOCUMENT_UPDATED: "Document updated successfully.",
  DOCUMENT_DELETED: "Document deleted successfully.",
  DOCUMENT_FOUND: "Document data found.",
};

export const DOCUMENTHISTORY_MESSAGE = {
  DOCUMENTHISTORY_CREATED: "Document History created successfully.",
  DOCUMENTHISTORY_UPDATED: "Document History updated successfully.",
  DOCUMENTHISTORY_DELETED: "Document History deleted successfully.",
  DOCUMENTHISTORY_FOUND: "Document History data found.",
};

export const CHAT_MESSAGE = {
  CHAT_CREATED: "Chat created successfully.",
  CHAT_UPDATED: "Chat updated successfully.",
  CHAT_DELETED: "Chat deleted successfully.",
  CHAT_FOUND: "Chat data found.",
};

export const OTP = {
  SUCCESS: "OTP sent successfully",
  NO_OTP: `No Pending OTP Found.`,
  INVALID_OTP: `Invalid OTP.`,
  USED_OTP: `OTP has already been used.`,
  EXPIRED_OTP: `OTP has expired.`,
  VERIFIED_OTP: `OTP verified successfully.`,
  MAX_OUT: `Maximum OTP attempted, Please generated new OTP.`,
  INVALID_OTP_INFO: `Invalid OTP INFO provide to function.`,
  RESEND_OTP_SUCCESS: `OTP has been regenerated.`,
};

export const CHANGEPASSWORD = {
  USER_NOT_FOUND: `User Not found.`,
  PASSWORD_MISMATCH: `Invalid Current password.`,
  PASSWORD_CHANGED: `Password change successfully.`,
};

export const CHANGEEMAIL = {
  USER_NOT_FOUND: `User Not found.`,
  EMAIL_NEW_OLD_SAME: `Old Email and New Email are same.`,
  OTP_SENT_SUCCESS: `OTP sent to new email address.`,
  NO_OTP: `Unfounded OTP that is Pending.`,
  MAX_OUT: `Maximum OTP attempted, Please generate new OTP.`,
  INVALID_OTP: `Invalid OTP.`,
  EXPIRED_OTP: `OTP has expired.`,
};

export const PASSWORD = {
  UPDATED_SUCCESSFULLY: `Password updated successfully.`,
};

export const CHANGE_PHONE = {
  USER_NOT_FOUND: `User Not found.`,
  PHONE_NEW_OLD_SAME: `Both the new and old phone numbers are identical.`,
  OTP_SENT_SUCCESS: `OTP was successfully delivered to the new email address.`,
  NO_OTP: `Unfounded OTP that is Pending.`,
  MAX_OUT: `Maximum OTP attempted, Please generate new OTP.`,
  INVALID_OTP: `Invalid OTP.`,
  EXPIRED_OTP: `OTP has expired.`,
};

export const TEAMMESSAGE = {
  TEAM_CREATED: `Team created successfully.`,
  TEAMS_FOUND: `Teams Found.`,
  TEAM_FOUND: `Team Found.`,
};

export const TEAMUSER_MESSAGE = {
  TEAM_MEMBER_CREATED: `Team Member created successfully.`,
  TEAM_MEMBER_DELETED: `Team Member Deleted successfully.`,
  TEAM_MEMBER_UPDATED: `Team Member Updated successfully.`,
  TEAM_MEMBER_FOUND: `Team Member Found.`,
};

export const DEV_APIS = {
  LOGIN: `http://localhost:8001/api/user/auth/login`,
  SIGNUP: `http://localhost:8001/api/user/auth/register`,
};

export const PROD_APIS = {
  LOGIN: `http://localhost:8001/api/user/auth/login`,
  SIGNUP: `http://localhost:8001/api/user/auth/register`,
};

export const maxFileSize = 1024 * 1024 * 2;
export const maxScanFileSize = 1024 * 1024 * 2;

export const REGISTER = {
  LOGIN_TYPE_EMAIL: "EMAIL",
  LOGIN_TYPE_PHONE_NUMBER: "PHONE",
};

export const defaultProfileURL = "";

export const CUSTOMER_MESSAGE = {
  LOGIN_SUCCESS: "Login success",
};

export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

export const CONNECTOR_MESSAGE = {
  NOT_FOUND: "Connector not found.",
  NOT_ACTIVE: "Connector is not active.",
  ALREADY_INUSE: "Connection is already in use.",
  WATT_OR_TIME_MISSING: "Please provide requestedWatts or requiredTime",
};

export const MENTANENCE_MESSAGE = {
  UNDER_MENTANANCE: "Sorry, We are under maintenance till ",
};

export const NOTIFICATION_MESSAGE = {
  chargerOfflineWhileTransaction: function (chargerId) {
    return `Customer trying to start the transaction  but, ${chargerId} is offline.`;
  },
  transactionStarted: function (transactionId) {
    return `Transaction started for ${transactionId}.`;
  },
  transactionStopped: function (transactionId) {
    return `Transaction stopped for ${transactionId}.`;
  },
  transactionAPIFailingFor: function (serialNumber) {
    return `Transaction Start API failing for ${serialNumber} charger, Please contact admin.`;
  },
  stopTransactionFailed: function (serialNumber) {
    return `Transaction Stop API failing for ${serialNumber} charger, Please contact admin.`;
  },
};

export const NOTIFICATION_TITLE = {
  chargerOffline: "Charger offline",
  transactionStarted: "Transaction started notification",
  transactionStopped: "Transaction stopped notification",
  transactionAPIFailed: "Transaction API failing",
  stopTransactionFailed: "Stop transaction Failed",
};
