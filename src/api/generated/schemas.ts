/* eslint-disable */
// Auto-generated from qip-openapi-merged(2).json. Do not edit manually.

export type user_ResultVoid = {
  code?: number;
  message?: string;
  data?: Record<string, unknown>;
  success?: boolean;
}

export type user_ShippingAddressReqDTO = {
  contactName: string;
  contactPhone: string;
  region?: string;
  detailAddress: string;
  isDefault?: boolean;
}

export type user_SysRole = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  roleCode?: string;
  roleName?: string;
  description?: string;
  status?: number;
  isSystem?: number;
}

export type user_InvoiceInfoReqDTO = {
  invoiceType: number;
  title: string;
  taxNo?: string;
  bankName?: string;
  bankAccount?: string;
  registerAddress?: string;
  registerPhone?: string;
  isDefault?: boolean;
}

export type user_EnterpriseRegisterReqDTO = {
  enterpriseName: string;
  unifiedCreditCode?: string;
  businessLicense: string;
  legalPerson: string;
  contactName: string;
  contactPhone: string;
  enterpriseType: number;
  serviceRange?: string;
  qualification?: string;
  region?: string;
  address?: string;
  introduction?: string;
  authorizationLetter?: string;
  certFileUrl?: string;
  certNo?: string;
  certExpiry?: string;
  certScope?: string;
  email?: string;
  registeredCapital?: string;
  qualificationFiles?: Array<user_QualificationFileItem>;
}

export type user_QualificationFileItem = {
  fileUrl: string;
  fileName?: string;
  certNo?: string;
  certName?: string;
  expireDate?: string;
  remark?: string;
}

export type user_UpdateProfileReqDTO = {
  nickname?: string;
  avatar?: string;
}

export type user_ChangePhoneReqDTO = {
  newPhone: string;
  smsCode: string;
}

export type user_ChangePasswordReqDTO = {
  oldPassword?: string;
  newPassword: string;
}

export type user_ChangeEmailReqDTO = {
  newEmail: string;
  password: string;
}

export type user_ResultLong = {
  code?: number;
  message?: string;
  data?: number;
  success?: boolean;
}

export type user_FileUploadVO = {
  fileKey?: string;
  objectName?: string;
  url?: string;
  fileName?: string;
  fileType?: string;
  size?: number;
}

export type user_ResultFileUploadVO = {
  code?: number;
  message?: string;
  data?: user_FileUploadVO;
  success?: boolean;
}

export type user_EnterpriseCertReqDTO = {
  certType: string;
  certNo: string;
  certName?: string;
  certFile?: string;
  expireDate?: string;
}

export type user_EnterpriseRegisterResultVO = {
  id?: number;
  status?: number;
}

export type user_ResultEnterpriseRegisterResultVO = {
  code?: number;
  message?: string;
  data?: user_EnterpriseRegisterResultVO;
  success?: boolean;
}

export type user_BusinessLicenseOcrVO = {
  name?: string;
  enterpriseName?: string;
  registerNumber?: string;
  socialCreditCode?: string;
  type?: string;
  companyType?: string;
  legalPerson?: string;
  address?: string;
  registeredAddress?: string;
  capital?: string;
  registeredCapital?: string;
  business?: string;
  businessScope?: string;
  establishDate?: string;
  validPeriod?: string;
  imageObjectName?: string;
}

export type user_ResultBusinessLicenseOcrVO = {
  code?: number;
  message?: string;
  data?: user_BusinessLicenseOcrVO;
  success?: boolean;
}

export type user_WechatQrLoginReqDTO = {
  code: string;
  device?: string;
}

export type user_LoginVO = {
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  needResetPassword?: boolean;
  isNewUser?: boolean;
  accountId?: number;
  accountType?: number;
  userId?: number;
  username?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  userType?: number;
  enterpriseId?: number;
  enterpriseName?: string;
  certStatus?: number;
  enterpriseTags?: Array<string>;
  homeRoute?: string;
  roleCodes?: Array<string>;
  permissionCodes?: Array<string>;
  menuCodes?: Array<string>;
  canPublishDemand?: boolean;
  canAcceptOrder?: boolean;
  user?: user_UserVO;
}

export type user_ResultLoginVO = {
  code?: number;
  message?: string;
  data?: user_LoginVO;
  success?: boolean;
}

export type user_UserVO = {
  id?: number;
  accountId?: number;
  accountType?: number;
  username?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  userType?: number;
  status?: number;
  enterpriseId?: number;
  enterpriseName?: string;
  roleCodes?: Array<string>;
  enterpriseTags?: Array<string>;
  homeRoute?: string;
  permissionCodes?: Array<string>;
  menuCodes?: Array<string>;
  memberLevel?: number;
  points?: number;
  realNameStatus?: number;
  createTime?: string;
}

export type user_WechatLoginReqDTO = {
  code: string;
  device?: string;
  nickname?: string;
  avatarUrl?: string;
}

export type user_WechatPhoneBindReqDTO = {
  code: string;
}

export type user_SmsCodeReqDTO = {
  phone: string;
  scene?: string;
}

export type user_ResetPasswordReqDTO = {
  phone: string;
  smsCode: string;
  newPassword: string;
}

export type user_RegisterReqDTO = {
  phone: string;
  smsCode: string;
  password: string;
  nickname?: string;
  email?: string;
  username?: string;
  device?: string;
}

export type user_LoginReqDTO = {
  phone: string;
  smsCode: string;
  device?: string;
}

export type user_PasswordLoginReqDTO = {
  account: string;
  password: string;
  device?: string;
}

export type user_RealNameAuthReqDTO = {
  realName: string;
  idCardNo: string;
  idCardFront: string;
  idCardBack: string;
}

export type user_ResultUserVO = {
  code?: number;
  message?: string;
  data?: user_UserVO;
  success?: boolean;
}

export type user_PageResultUserVO = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<user_UserVO>;
}

export type user_ResultPageResultUserVO = {
  code?: number;
  message?: string;
  data?: user_PageResultUserVO;
  success?: boolean;
}

export type user_ResultListMapStringObject = {
  code?: number;
  message?: string;
  data?: Array<{
  [key: string]: Record<string, unknown>;
}>;
  success?: boolean;
}

export type user_ResultMapStringLong = {
  code?: number;
  message?: string;
  data?: {
  [key: string]: number;
};
  success?: boolean;
}

export type user_EnterpriseShippingAddress = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  userId?: number;
  enterpriseId?: number;
  contactName?: string;
  contactPhone?: string;
  region?: string;
  detailAddress?: string;
  isDefault?: number;
}

export type user_ResultListEnterpriseShippingAddress = {
  code?: number;
  message?: string;
  data?: Array<user_EnterpriseShippingAddress>;
  success?: boolean;
}

export type user_ResultEnterpriseShippingAddress = {
  code?: number;
  message?: string;
  data?: user_EnterpriseShippingAddress;
  success?: boolean;
}

export type user_ResultListString = {
  code?: number;
  message?: string;
  data?: Array<string>;
  success?: boolean;
}

export type user_ResultListSysRole = {
  code?: number;
  message?: string;
  data?: Array<user_SysRole>;
  success?: boolean;
}

export type user_ResultInteger = {
  code?: number;
  message?: string;
  data?: number;
  success?: boolean;
}

export type user_ResultMapStringInteger = {
  code?: number;
  message?: string;
  data?: {
  [key: string]: number;
};
  success?: boolean;
}

export type user_PageResultPointsRecord = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<user_PointsRecord>;
}

export type user_PointsRecord = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  userId?: number;
  points?: number;
  ruleCode?: string;
  bizId?: number;
  bizType?: string;
  totalAfter?: number;
  remark?: string;
}

export type user_ResultPageResultPointsRecord = {
  code?: number;
  message?: string;
  data?: user_PageResultPointsRecord;
  success?: boolean;
}

export type user_EnterpriseInvoiceInfo = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  userId?: number;
  enterpriseId?: number;
  invoiceType?: number;
  title?: string;
  taxNo?: string;
  bankName?: string;
  bankAccount?: string;
  registerAddress?: string;
  registerPhone?: string;
  isDefault?: number;
}

export type user_ResultListEnterpriseInvoiceInfo = {
  code?: number;
  message?: string;
  data?: Array<user_EnterpriseInvoiceInfo>;
  success?: boolean;
}

export type user_ResultEnterpriseInvoiceInfo = {
  code?: number;
  message?: string;
  data?: user_EnterpriseInvoiceInfo;
  success?: boolean;
}

export type user_EnterpriseAuditRecordVO = {
  id?: number;
  enterpriseId?: number;
  operatorId?: number;
  operatorName?: string;
  action?: number;
  actionLabel?: string;
  remark?: string;
  createTime?: string;
}

export type user_EnterpriseCertVO = {
  id?: number;
  enterpriseId?: number;
  certType?: string;
  certNo?: string;
  certName?: string;
  certFile?: string;
  expireDate?: string;
  expireStatus?: number;
  createTime?: string;
}

export type user_EnterpriseQualificationFileVO = {
  id?: number;
  enterpriseId?: number;
  fileUrl?: string;
  fileName?: string;
  certNo?: string;
  certName?: string;
  expireDate?: string;
  remark?: string;
  createTime?: string;
}

export type user_EnterpriseVO = {
  id?: number;
  userId?: number;
  enterpriseName?: string;
  unifiedCreditCode?: string;
  legalPerson?: string;
  contactName?: string;
  contactPhone?: string;
  enterpriseType?: number;
  companyType?: string;
  certStatus?: number;
  rejectReason?: string;
  reviewerName?: string;
  email?: string;
  registeredCapital?: string;
  businessLicense?: string;
  serviceRange?: string;
  serviceTypes?: Array<string>;
  qualification?: string;
  region?: string;
  address?: string;
  introduction?: string;
  authorizationLetter?: string;
  certFileUrl?: string;
  certNo?: string;
  certExpiry?: string;
  certScope?: string;
  avgScore?: number;
  orderCount?: number;
  createTime?: string;
  auditRecords?: Array<user_EnterpriseAuditRecordVO>;
  qualificationFiles?: Array<user_EnterpriseQualificationFileVO>;
  qualifications?: Array<user_EnterpriseCertVO>;
}

export type user_ResultEnterpriseVO = {
  code?: number;
  message?: string;
  data?: user_EnterpriseVO;
  success?: boolean;
}

export type user_ResultListEnterpriseCertVO = {
  code?: number;
  message?: string;
  data?: Array<user_EnterpriseCertVO>;
  success?: boolean;
}

export type user_EnterpriseTodoVO = {
  pendingRespond?: number;
  pendingQuote?: number;
  pendingSign?: number;
  pendingInspect?: number;
  reportToUpload?: number;
  reportInvalid?: number;
  pendingReceive?: number;
  afterSale?: number;
  consultationPending?: number;
}

export type user_ResultEnterpriseTodoVO = {
  code?: number;
  message?: string;
  data?: user_EnterpriseTodoVO;
  success?: boolean;
}

export type user_EnterpriseSummaryVO = {
  todayOrders?: number;
  pendingDemands?: number;
  pendingConsultations?: number;
  completedReports?: number;
  todayIncome?: number;
}

export type user_ResultEnterpriseSummaryVO = {
  code?: number;
  message?: string;
  data?: user_EnterpriseSummaryVO;
  success?: boolean;
}

export type user_ResultServiceOverviewVO = {
  code?: number;
  message?: string;
  data?: user_ServiceOverviewVO;
  success?: boolean;
}

export type user_ServiceOverviewVO = {
  totalOrders?: number;
  inProgressOrders?: number;
  completedOrders?: number;
  pendingBids?: number;
}

export type user_ResultListServiceDistributionVO = {
  code?: number;
  message?: string;
  data?: Array<user_ServiceDistributionVO>;
  success?: boolean;
}

export type user_ServiceDistributionVO = {
  serviceType?: string;
  serviceTypeLabel?: string;
  count?: number;
}

export type user_OrderTrendPointVO = {
  date?: string;
  receivedDemands?: number;
  quotedDemands?: number;
  dealOrders?: number;
}

export type user_ResultListOrderTrendPointVO = {
  code?: number;
  message?: string;
  data?: Array<user_OrderTrendPointVO>;
  success?: boolean;
}

export type user_IncomeStructureVO = {
  paidAmount?: number;
  pendingAmount?: number;
  refundAmount?: number;
}

export type user_ResultIncomeStructureVO = {
  code?: number;
  message?: string;
  data?: user_IncomeStructureVO;
  success?: boolean;
}

export type user_DeliveryTrendPointVO = {
  date?: string;
  inProgressTasks?: number;
  completedTasks?: number;
  reportsUploaded?: number;
}

export type user_ResultListDeliveryTrendPointVO = {
  code?: number;
  message?: string;
  data?: Array<user_DeliveryTrendPointVO>;
  success?: boolean;
}

export type user_CustomerTrendPointVO = {
  date?: string;
  consultations?: number;
  activeCustomers?: number;
  newCustomers?: number;
}

export type user_ResultListCustomerTrendPointVO = {
  code?: number;
  message?: string;
  data?: Array<user_CustomerTrendPointVO>;
  success?: boolean;
}

export type user_PageResultEnterpriseVO = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<user_EnterpriseVO>;
}

export type user_ResultPageResultEnterpriseVO = {
  code?: number;
  message?: string;
  data?: user_PageResultEnterpriseVO;
  success?: boolean;
}

export type user_RealNameAuthVO = {
  userId?: number;
  realName?: string;
  idCardNo?: string;
  realNameStatus?: number;
}

export type user_ResultRealNameAuthVO = {
  code?: number;
  message?: string;
  data?: user_RealNameAuthVO;
  success?: boolean;
}

export type admin_Dict = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  dictType?: string;
  dictCode?: string;
  dictLabel?: string;
  sortOrder?: number;
  status?: number;
  remark?: string;
}

export type admin_ResultVoid = {
  code?: number;
  message?: string;
  data?: Record<string, unknown>;
  success?: boolean;
}

export type admin_ResultLong = {
  code?: number;
  message?: string;
  data?: number;
  success?: boolean;
}

export type admin_ResultListString = {
  code?: number;
  message?: string;
  data?: Array<string>;
  success?: boolean;
}

export type admin_ResultListDict = {
  code?: number;
  message?: string;
  data?: Array<admin_Dict>;
  success?: boolean;
}

export type admin_ResultObject = {
  code?: number;
  message?: string;
  data?: Record<string, unknown>;
  success?: boolean;
}

export type admin_AuditLog = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  operatorId?: number;
  operatorName?: string;
  module?: string;
  action?: string;
  targetId?: number;
  targetType?: string;
  before?: string;
  after?: string;
  remark?: string;
}

export type admin_PageResultAuditLog = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<admin_AuditLog>;
}

export type admin_ResultPageResultAuditLog = {
  code?: number;
  message?: string;
  data?: admin_PageResultAuditLog;
  success?: boolean;
}

export type admin_ResultListTradeTrendPointVO = {
  code?: number;
  message?: string;
  data?: Array<admin_TradeTrendPointVO>;
  success?: boolean;
}

export type admin_TradeTrendPointVO = {
  date?: string;
  dealAmount?: number;
  completedAmount?: number;
  platformIncome?: number;
}

export type admin_ResultWorkbenchSummaryVO = {
  code?: number;
  message?: string;
  data?: admin_WorkbenchSummaryVO;
  success?: boolean;
}

export type admin_WorkbenchSummaryVO = {
  todayOrders?: number;
  yesterdayOrders?: number;
  todayNewEnterprises?: number;
  yesterdayNewEnterprises?: number;
  todayNewUsers?: number;
  yesterdayNewUsers?: number;
  todayDemands?: number;
  yesterdayDemands?: number;
  todayReports?: number;
  yesterdayReports?: number;
  serverTime?: string;
}

export type admin_ResultListServiceDistributionVO = {
  code?: number;
  message?: string;
  data?: Array<admin_ServiceDistributionVO>;
  success?: boolean;
}

export type admin_ServiceDistributionVO = {
  serviceType?: string;
  serviceTypeDesc?: string;
  count?: number;
}

export type admin_ResultWorkbenchPendingAuditsVO = {
  code?: number;
  message?: string;
  data?: admin_WorkbenchPendingAuditsVO;
  success?: boolean;
}

export type admin_WorkbenchPendingAuditsVO = {
  enterpriseCertPending?: number;
  demandPending?: number;
  orderException?: number;
  refundPending?: number;
  contentPending?: number;
  reportPending?: number;
  consultationPending?: number;
  systemPending?: number;
}

export type admin_OnlineStatsVO = {
  onlineUsers?: number;
  onlineEnterprises?: number;
  onlineExperts?: number;
}

export type admin_ResultOnlineStatsVO = {
  code?: number;
  message?: string;
  data?: admin_OnlineStatsVO;
  success?: boolean;
}

export type admin_HotCategoryVO = {
  name?: string;
  weight?: number;
}

export type admin_ResultListHotCategoryVO = {
  code?: number;
  message?: string;
  data?: Array<admin_HotCategoryVO>;
  success?: boolean;
}

export type admin_BusinessTrendPointVO = {
  date?: string;
  publishedDemands?: number;
  respondedDemands?: number;
  completedOrders?: number;
}

export type admin_ResultListBusinessTrendPointVO = {
  code?: number;
  message?: string;
  data?: Array<admin_BusinessTrendPointVO>;
  success?: boolean;
}

export type admin_DashboardOverviewVO = {
  totalAuditLogs?: number;
  todayAuditLogs?: number;
  timestamp?: string;
}

export type admin_ResultDashboardOverviewVO = {
  code?: number;
  message?: string;
  data?: admin_DashboardOverviewVO;
  success?: boolean;
}

export type base_ResultVoid = {
  code?: number;
  message?: string;
  data?: Record<string, unknown>;
  success?: boolean;
}

export type base_TrainingCourse = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  title?: string;
  category?: string;
  instructor?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  capacity?: number;
  enrolled?: number;
  fee?: number;
  outline?: string;
  coverUrl?: string;
  materialUrl?: string;
  status?: number;
  courseType?: string;
  certInfo?: string;
  registrationDeadline?: string;
  hostUnit?: string;
  contactInfo?: string;
}

export type base_Standard = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  standardNo?: string;
  title?: string;
  standardType?: string;
  issueOrg?: string;
  issueDate?: string;
  implementDate?: string;
  expireDate?: string;
  category?: string;
  keyword?: string;
  summary?: string;
  attachmentUrl?: string;
  status?: number;
  viewCount?: number;
  followCount?: number;
}

export type base_Policy = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  policyNo?: string;
  title?: string;
  issueOrg?: string;
  issueDate?: string;
  effectDate?: string;
  category?: string;
  region?: string;
  content?: string;
  attachmentUrl?: string;
  viewCount?: number;
  status?: number;
}

export type base_MeasurementInstrument = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  name?: string;
  instrumentNo?: string;
  category?: string;
  verificationStd?: string;
  cycleMonths?: number;
  description?: string;
  status?: number;
}

export type base_Knowledge = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  authorId?: number;
  title?: string;
  summary?: string;
  content?: string;
  coverUrl?: string;
  category?: string;
  tags?: string;
  contentType?: number;
  viewCount?: number;
  likeCount?: number;
  status?: number;
}

export type base_InspectionItem = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  category: string;
  itemName: string;
  defaultStd?: string;
  unitPrice: number;
  cycleDays: number;
  sampleType?: string;
  description?: string;
  status?: number;
}

export type base_DiagnosisQuestionnaire = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  title?: string;
  description?: string;
  industry?: string;
  questionCount?: number;
  status?: number;
}

export type base_DiagnosisQuestion = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  questionnaireId?: number;
  sortOrder?: number;
  content?: string;
  questionType?: string;
  options?: string;
  maxScore?: number;
}

export type base_DiagnosisCase = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  agencyId?: number;
  title?: string;
  industry?: string;
  problem?: string;
  solution?: string;
  result?: string;
  coverUrl?: string;
  viewCount?: number;
  status?: number;
}

export type base_DiagnosisAgency = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  name?: string;
  expertCount?: number;
  serviceScope?: string;
  region?: string;
  contactPhone?: string;
  introduction?: string;
  avgScore?: number;
  status?: number;
}

export type base_CertGuide = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  certType?: string;
  title?: string;
  content?: string;
  duration?: string;
  costRange?: string;
  status?: number;
}

export type base_CertificationAgency = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  name?: string;
  shortName?: string;
  logo?: string;
  certTypes?: string;
  qualification?: string;
  region?: string;
  address?: string;
  contactPhone?: string;
  website?: string;
  introduction?: string;
  avgScore?: number;
  status?: number;
}

export type base_ResultLong = {
  code?: number;
  message?: string;
  data?: number;
  success?: boolean;
}

export type base_TrainingEnrollment = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  courseId?: number;
  userId?: number;
  realName?: string;
  phone?: string;
  company?: string;
  status?: number;
  remark?: string;
}

export type base_ResultBoolean = {
  code?: number;
  message?: string;
  data?: boolean;
  success?: boolean;
}

export type base_InspectionItemApply = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  institutionId?: number;
  institutionName?: string;
  applicantId?: number;
  category?: string;
  itemName?: string;
  defaultStd?: string;
  unitPrice?: number;
  cycleDays?: number;
  sampleType?: string;
  description?: string;
  applyReason?: string;
  status?: number;
  auditRemark?: string;
  itemId?: number;
}

export type base_ResultMapStringObject = {
  code?: number;
  message?: string;
  data?: {
  [key: string]: Record<string, unknown>;
};
  success?: boolean;
}

export type base_ServiceConsultation = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  reqType?: string;
  content?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  attachmentUrl?: string;
  userId?: number;
  status?: number;
  replyContent?: string;
  replyTime?: string;
  operatorId?: number;
}

export type base_ResultListTrainingEnrollment = {
  code?: number;
  message?: string;
  data?: Array<base_TrainingEnrollment>;
  success?: boolean;
}

export type base_ResultTrainingCourse = {
  code?: number;
  message?: string;
  data?: base_TrainingCourse;
  success?: boolean;
}

export type base_PageResultTrainingCourse = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<base_TrainingCourse>;
}

export type base_ResultPageResultTrainingCourse = {
  code?: number;
  message?: string;
  data?: base_PageResultTrainingCourse;
  success?: boolean;
}

export type base_ResultStandard = {
  code?: number;
  message?: string;
  data?: base_Standard;
  success?: boolean;
}

export type base_PageResultStandard = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<base_Standard>;
}

export type base_ResultPageResultStandard = {
  code?: number;
  message?: string;
  data?: base_PageResultStandard;
  success?: boolean;
}

export type base_PageResultStandardFollow = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<base_StandardFollow>;
}

export type base_ResultPageResultStandardFollow = {
  code?: number;
  message?: string;
  data?: base_PageResultStandardFollow;
  success?: boolean;
}

export type base_StandardFollow = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  userId?: number;
  standardId?: number;
  standardNo?: string;
  standardTitle?: string;
}

export type base_ResultPolicy = {
  code?: number;
  message?: string;
  data?: base_Policy;
  success?: boolean;
}

export type base_PageResultPolicy = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<base_Policy>;
}

export type base_ResultPageResultPolicy = {
  code?: number;
  message?: string;
  data?: base_PageResultPolicy;
  success?: boolean;
}

export type base_Measurement = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  name?: string;
  shortName?: string;
  logo?: string;
  orgType?: string;
  serviceScope?: string;
  qualification?: string;
  contactPhone?: string;
  region?: string;
  address?: string;
  website?: string;
  introduction?: string;
  status?: number;
}

export type base_ResultMeasurement = {
  code?: number;
  message?: string;
  data?: base_Measurement;
  success?: boolean;
}

export type base_PageResultMeasurement = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<base_Measurement>;
}

export type base_ResultPageResultMeasurement = {
  code?: number;
  message?: string;
  data?: base_PageResultMeasurement;
  success?: boolean;
}

export type base_ResultMeasurementInstrument = {
  code?: number;
  message?: string;
  data?: base_MeasurementInstrument;
  success?: boolean;
}

export type base_PageResultMeasurementInstrument = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<base_MeasurementInstrument>;
}

export type base_ResultPageResultMeasurementInstrument = {
  code?: number;
  message?: string;
  data?: base_PageResultMeasurementInstrument;
  success?: boolean;
}

export type base_ResultKnowledge = {
  code?: number;
  message?: string;
  data?: base_Knowledge;
  success?: boolean;
}

export type base_PageResultKnowledge = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<base_Knowledge>;
}

export type base_ResultPageResultKnowledge = {
  code?: number;
  message?: string;
  data?: base_PageResultKnowledge;
  success?: boolean;
}

export type base_Institution = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  enterpriseId?: number;
  name?: string;
  shortName?: string;
  logo?: string;
  institutionType?: number;
  qualification?: string;
  serviceRange?: string;
  region?: string;
  address?: string;
  contactPhone?: string;
  website?: string;
  introduction?: string;
  avgScore?: number;
  orderCount?: number;
  status?: number;
}

export type base_ResultInstitution = {
  code?: number;
  message?: string;
  data?: base_Institution;
  success?: boolean;
}

export type base_InstitutionEsDoc = {
  id?: number;
  name?: string;
  shortName?: string;
  institutionType?: number;
  qualification?: string;
  serviceRange?: string;
  region?: string;
  address?: string;
  introduction?: string;
  avgScore?: number;
  orderCount?: number;
  status?: number;
}

export type base_ResultListInstitutionEsDoc = {
  code?: number;
  message?: string;
  data?: Array<base_InstitutionEsDoc>;
  success?: boolean;
}

export type base_PageResultInstitution = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<base_Institution>;
}

export type base_ResultPageResultInstitution = {
  code?: number;
  message?: string;
  data?: base_PageResultInstitution;
  success?: boolean;
}

export type base_ResultInspectionItem = {
  code?: number;
  message?: string;
  data?: base_InspectionItem;
  success?: boolean;
}

export type base_PageResultInspectionItem = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<base_InspectionItem>;
}

export type base_ResultPageResultInspectionItem = {
  code?: number;
  message?: string;
  data?: base_PageResultInspectionItem;
  success?: boolean;
}

export type base_ResultListInspectionItem = {
  code?: number;
  message?: string;
  data?: Array<base_InspectionItem>;
  success?: boolean;
}

export type base_PageResultInspectionItemApply = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<base_InspectionItemApply>;
}

export type base_ResultPageResultInspectionItemApply = {
  code?: number;
  message?: string;
  data?: base_PageResultInspectionItemApply;
  success?: boolean;
}

export type base_PageResultDiagnosisQuestionnaire = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<base_DiagnosisQuestionnaire>;
}

export type base_ResultPageResultDiagnosisQuestionnaire = {
  code?: number;
  message?: string;
  data?: base_PageResultDiagnosisQuestionnaire;
  success?: boolean;
}

export type base_ResultDiagnosisCase = {
  code?: number;
  message?: string;
  data?: base_DiagnosisCase;
  success?: boolean;
}

export type base_PageResultDiagnosisCase = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<base_DiagnosisCase>;
}

export type base_ResultPageResultDiagnosisCase = {
  code?: number;
  message?: string;
  data?: base_PageResultDiagnosisCase;
  success?: boolean;
}

export type base_ResultDiagnosisAgency = {
  code?: number;
  message?: string;
  data?: base_DiagnosisAgency;
  success?: boolean;
}

export type base_PageResultDiagnosisAgency = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<base_DiagnosisAgency>;
}

export type base_ResultPageResultDiagnosisAgency = {
  code?: number;
  message?: string;
  data?: base_PageResultDiagnosisAgency;
  success?: boolean;
}

export type base_ResultServiceConsultation = {
  code?: number;
  message?: string;
  data?: base_ServiceConsultation;
  success?: boolean;
}

export type base_ResultListServiceConsultation = {
  code?: number;
  message?: string;
  data?: Array<base_ServiceConsultation>;
  success?: boolean;
}

export type base_PageResultServiceConsultation = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<base_ServiceConsultation>;
}

export type base_ResultPageResultServiceConsultation = {
  code?: number;
  message?: string;
  data?: base_PageResultServiceConsultation;
  success?: boolean;
}

export type base_ResultCertGuide = {
  code?: number;
  message?: string;
  data?: base_CertGuide;
  success?: boolean;
}

export type base_ResultListCertGuide = {
  code?: number;
  message?: string;
  data?: Array<base_CertGuide>;
  success?: boolean;
}

export type base_ResultCertificationAgency = {
  code?: number;
  message?: string;
  data?: base_CertificationAgency;
  success?: boolean;
}

export type base_PageResultCertificationAgency = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<base_CertificationAgency>;
}

export type base_ResultPageResultCertificationAgency = {
  code?: number;
  message?: string;
  data?: base_PageResultCertificationAgency;
  success?: boolean;
}

export type trade_ResultVoid = {
  code?: number;
  message?: string;
  data?: Record<string, unknown>;
  success?: boolean;
}

export type trade_DemandPublishReqDTO = {
  enterpriseName?: string;
  contactName?: string;
  contactPhone?: string;
  title: string;
  sampleName: string;
  sampleType?: string;
  sampleSize?: string;
  sampleDesc?: string;
  additionalReq?: string;
  testItemIds?: Array<number>;
  testProject?: string;
  testStandard?: string;
  sampleCount: number;
  expectedFinishDate?: string;
  remark?: string;
  attachments?: string;
  category?: string;
  region?: string;
  budgetAmount?: number;
}

export type trade_Report = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  reportNo?: string;
  orderId?: number;
  demandId?: number;
  institutionId?: number;
  title?: string;
  sampleName?: string;
  testResult?: string;
  conclusion?: string;
  fileUrl?: string;
  fileHash?: string;
  qrCodeContent?: string;
  status?: number;
}

export type trade_ResultReport = {
  code?: number;
  message?: string;
  data?: trade_Report;
  success?: boolean;
}

export type trade_ResultLong = {
  code?: number;
  message?: string;
  data?: number;
  success?: boolean;
}

export type trade_RefundApplyReqDTO = {
  orderId: number;
  amount: number;
  reason?: string;
  voucherUrl?: string;
}

export type trade_ShippingReqDTO = {
  orderId: number;
  shippingMethod: number;
  expressCompany?: string;
  expressNo?: string;
  shippingVoucher?: string;
  pickupAddress?: string;
  pickupContact?: string;
  pickupPhone?: string;
  pickupTime?: string;
}

export type trade_ReceiveReqDTO = {
  orderId: number;
  normal: boolean;
  receivePhotos?: string;
  receiveRemark?: string;
}

export type trade_EvaluationReqDTO = {
  orderId: number;
  score: number;
  content?: string;
}

export type trade_DirectOrderReqDTO = {
  serviceType: "CALIBRATION" | "CERTIFICATION" | "STANDARD_WRITING";
  institutionId: number;
  title: string;
  sampleDesc?: string;
  requirement?: string;
  attachments?: string;
  amount?: number;
  estimatedDays?: number;
  shippingMethod?: number;
}

export type trade_OrderConfirmReqDTO = {
  bidId: number;
  shippingAddressId: number;
  invoiceInfoId?: number;
  shippingMethod: number;
  orderRemark?: string;
  serviceAgreementAgreed: boolean;
  ndaAgreed: boolean;
}

export type trade_InvoiceApply = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  orderId?: number;
  userId?: number;
  invoiceType?: number;
  invoiceTitle?: string;
  taxNo?: string;
  amount?: number;
  email?: string;
  status?: number;
  remark?: string;
}

export type trade_BidReqDTO = {
  demandId: number;
  institutionId?: number;
  quoteAmount: number;
  estimatedDays: number;
  testPlan?: string;
  remark?: string;
}

export type trade_QuoteItem = {
  itemId?: number;
  quantity?: number;
  feeType?: string;
}

export type trade_BidFeeItem = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  bidId?: number;
  feeType?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
}

export type trade_ResultListBidFeeItem = {
  code?: number;
  message?: string;
  data?: Array<trade_BidFeeItem>;
  success?: boolean;
}

export type trade_ResultMapStringLong = {
  code?: number;
  message?: string;
  data?: {
  [key: string]: number;
};
  success?: boolean;
}

export type trade_ResultMapStringObject = {
  code?: number;
  message?: string;
  data?: {
  [key: string]: Record<string, unknown>;
};
  success?: boolean;
}

export type trade_ResultListMapStringObject = {
  code?: number;
  message?: string;
  data?: Array<{
  [key: string]: Record<string, unknown>;
}>;
  success?: boolean;
}

export type trade_ResultMapStringBigDecimal = {
  code?: number;
  message?: string;
  data?: {
  [key: string]: number;
};
  success?: boolean;
}

export type trade_DownloadUrlVO = {
  downloadUrl?: string;
}

export type trade_ResultDownloadUrlVO = {
  code?: number;
  message?: string;
  data?: trade_DownloadUrlVO;
  success?: boolean;
}

export type trade_PageResultReport = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<trade_Report>;
}

export type trade_ResultPageResultReport = {
  code?: number;
  message?: string;
  data?: trade_PageResultReport;
  success?: boolean;
}

export type trade_RefundApply = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  orderId?: number;
  userId?: number;
  institutionId?: number;
  amount?: number;
  reason?: string;
  voucherUrl?: string;
  status?: number;
  remark?: string;
  refundVoucherUrl?: string;
}

export type trade_ResultListRefundApply = {
  code?: number;
  message?: string;
  data?: Array<trade_RefundApply>;
  success?: boolean;
}

export type trade_PageResultRefundApply = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<trade_RefundApply>;
}

export type trade_ResultPageResultRefundApply = {
  code?: number;
  message?: string;
  data?: trade_PageResultRefundApply;
  success?: boolean;
}

export type trade_OrderVO = {
  id?: number;
  orderNo?: string;
  demandId?: number;
  demandTitle?: string;
  demandUserId?: number;
  institutionId?: number;
  institutionName?: string;
  amount?: number;
  estimatedDays?: number;
  status?: number;
  statusDesc?: string;
  shippingMethod?: number;
  expressCompany?: string;
  expressNo?: string;
  shippingVoucher?: string;
  pickupAddress?: string;
  pickupContact?: string;
  pickupPhone?: string;
  pickupTime?: string;
  receivePhotos?: string;
  receiveRemark?: string;
  escrowStatus?: number;
  escrowStatusDesc?: string;
  payTime?: string;
  finishTime?: string;
  createTime?: string;
}

export type trade_ResultOrderVO = {
  code?: number;
  message?: string;
  data?: trade_OrderVO;
  success?: boolean;
}

export type trade_PageResultOrderVO = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<trade_OrderVO>;
}

export type trade_ResultPageResultOrderVO = {
  code?: number;
  message?: string;
  data?: trade_PageResultOrderVO;
  success?: boolean;
}

export type trade_Evaluation = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  orderId?: number;
  demandUserId?: number;
  institutionId?: number;
  score?: number;
  content?: string;
  status?: number;
}

export type trade_ResultEvaluation = {
  code?: number;
  message?: string;
  data?: trade_Evaluation;
  success?: boolean;
}

export type trade_PageResultEvaluation = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<trade_Evaluation>;
}

export type trade_ResultPageResultEvaluation = {
  code?: number;
  message?: string;
  data?: trade_PageResultEvaluation;
  success?: boolean;
}

export type trade_PageResultTradeOrder = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<trade_TradeOrder>;
}

export type trade_ResultPageResultTradeOrder = {
  code?: number;
  message?: string;
  data?: trade_PageResultTradeOrder;
  success?: boolean;
}

export type trade_TradeOrder = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  orderNo?: string;
  demandId?: number;
  bidId?: number;
  demandUserId?: number;
  institutionId?: number;
  institutionUserId?: number;
  amount?: number;
  estimatedDays?: number;
  status?: number;
  shippingMethod?: number;
  expressCompany?: string;
  expressNo?: string;
  shippingVoucher?: string;
  pickupAddress?: string;
  pickupContact?: string;
  pickupPhone?: string;
  pickupTime?: string;
  receivePhotos?: string;
  receiveRemark?: string;
  escrowStatus?: number;
  escrowReleaseTime?: string;
  payChannel?: string;
  outTradeNo?: string;
  payTime?: string;
  finishTime?: string;
  cancelReason?: string;
  offlinePaymentVoucher?: string;
  offlinePaymentConfirmed?: number;
  serviceAgreementAgreed?: number;
  ndaAgreed?: number;
  shippingAddressId?: number;
  buyerContactName?: string;
  buyerContactPhone?: string;
  buyerRegion?: string;
  buyerAddress?: string;
  invoiceInfoId?: number;
  invoiceType?: number;
  invoiceTitle?: string;
  invoiceTaxNo?: string;
  invoiceBankName?: string;
  invoiceBankAccount?: string;
  invoiceRegisterAddress?: string;
  invoiceRegisterPhone?: string;
  orderRemark?: string;
}

export type trade_OrderProgress = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  orderId?: number;
  node?: string;
  operatorId?: number;
  remark?: string;
  photos?: string;
}

export type trade_ResultListOrderProgress = {
  code?: number;
  message?: string;
  data?: Array<trade_OrderProgress>;
  success?: boolean;
}

export type trade_ResultListInvoiceApply = {
  code?: number;
  message?: string;
  data?: Array<trade_InvoiceApply>;
  success?: boolean;
}

export type trade_DemandVO = {
  id?: number;
  userId?: number;
  enterpriseId?: number;
  title?: string;
  sampleName?: string;
  sampleType?: string;
  sampleSize?: string;
  sampleDesc?: string;
  entrustNo?: string;
  additionalReq?: string;
  testProject?: string;
  testStandard?: string;
  sampleCount?: number;
  expectedFinishDate?: string;
  remark?: string;
  attachments?: string;
  category?: string;
  region?: string;
  budgetAmount?: number;
  status?: number;
  statusDesc?: string;
  bidCount?: number;
  createTime?: string;
}

export type trade_ResultDemandVO = {
  code?: number;
  message?: string;
  data?: trade_DemandVO;
  success?: boolean;
}

export type trade_BidVO = {
  id?: number;
  demandId?: number;
  institutionId?: number;
  institutionName?: string;
  quoteAmount?: number;
  estimatedDays?: number;
  testPlan?: string;
  remark?: string;
  status?: number;
  createTime?: string;
}

export type trade_ResultListBidVO = {
  code?: number;
  message?: string;
  data?: Array<trade_BidVO>;
  success?: boolean;
}

export type trade_PageResultDemandVO = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<trade_DemandVO>;
}

export type trade_ResultPageResultDemandVO = {
  code?: number;
  message?: string;
  data?: trade_PageResultDemandVO;
  success?: boolean;
}

export type community_ResultVoid = {
  code?: number;
  message?: string;
  data?: Record<string, unknown>;
  success?: boolean;
}

export type community_Article = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  authorId?: number;
  title?: string;
  summary?: string;
  content?: string;
  coverUrl?: string;
  category?: string;
  tags?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  status?: number;
  isTop?: number;
  standardId?: number;
  videoUrl?: string;
}

export type community_Question = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  authorId?: number;
  title?: string;
  content?: string;
  category?: string;
  tags?: string;
  viewCount?: number;
  answerCount?: number;
  acceptedAnswerId?: number;
  status?: number;
}

export type community_ResultLong = {
  code?: number;
  message?: string;
  data?: number;
  success?: boolean;
}

export type community_Answer = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  questionId?: number;
  authorId?: number;
  content?: string;
  likeCount?: number;
  isAccepted?: number;
  status?: number;
}

export type community_ResultBoolean = {
  code?: number;
  message?: string;
  data?: boolean;
  success?: boolean;
}

export type community_Expert = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  userId?: number;
  name?: string;
  avatar?: string;
  title?: string;
  organization?: string;
  expertise?: string;
  introduction?: string;
  answerCount?: number;
  likeCount?: number;
  status?: number;
}

export type community_ExpertAppointment = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  expertId?: number;
  userId?: number;
  contactName?: string;
  contactPhone?: string;
  consultTopic?: string;
  preferredTime?: string;
  status?: number;
  remark?: string;
}

export type community_ResultMapStringLong = {
  code?: number;
  message?: string;
  data?: {
  [key: string]: number;
};
  success?: boolean;
}

export type community_ResultQuestion = {
  code?: number;
  message?: string;
  data?: community_Question;
  success?: boolean;
}

export type community_ResultListAnswer = {
  code?: number;
  message?: string;
  data?: Array<community_Answer>;
  success?: boolean;
}

export type community_PageResultQuestion = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<community_Question>;
}

export type community_ResultPageResultQuestion = {
  code?: number;
  message?: string;
  data?: community_PageResultQuestion;
  success?: boolean;
}

export type community_QuestionFollow = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  questionId?: number;
  userId?: number;
}

export type community_ResultListQuestionFollow = {
  code?: number;
  message?: string;
  data?: Array<community_QuestionFollow>;
  success?: boolean;
}

export type community_PageResultUserFavorite = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<community_UserFavorite>;
}

export type community_ResultPageResultUserFavorite = {
  code?: number;
  message?: string;
  data?: community_PageResultUserFavorite;
  success?: boolean;
}

export type community_UserFavorite = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  userId?: number;
  targetType?: string;
  targetId?: number;
  remark?: string;
}

export type community_ResultExpert = {
  code?: number;
  message?: string;
  data?: community_Expert;
  success?: boolean;
}

export type community_PageResultExpert = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<community_Expert>;
}

export type community_ResultPageResultExpert = {
  code?: number;
  message?: string;
  data?: community_PageResultExpert;
  success?: boolean;
}

export type community_ResultListExpertAppointment = {
  code?: number;
  message?: string;
  data?: Array<community_ExpertAppointment>;
  success?: boolean;
}

export type community_PageResultExpertAppointment = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<community_ExpertAppointment>;
}

export type community_ResultPageResultExpertAppointment = {
  code?: number;
  message?: string;
  data?: community_PageResultExpertAppointment;
  success?: boolean;
}

export type community_Comment = {
  id?: number;
  createTime?: string;
  updateTime?: string;
  isDeleted?: number;
  targetType?: string;
  targetId?: number;
  authorId?: number;
  parentId?: number;
  content?: string;
  likeCount?: number;
  status?: number;
}

export type community_ResultListComment = {
  code?: number;
  message?: string;
  data?: Array<community_Comment>;
  success?: boolean;
}

export type community_ResultArticle = {
  code?: number;
  message?: string;
  data?: community_Article;
  success?: boolean;
}

export type community_PageResultArticle = {
  total?: number;
  pages?: number;
  current?: number;
  size?: number;
  records?: Array<community_Article>;
}

export type community_ResultPageResultArticle = {
  code?: number;
  message?: string;
  data?: community_PageResultArticle;
  success?: boolean;
}
