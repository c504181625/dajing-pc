export interface UploadedFileInfo {
  fileKey?: string
  objectName?: string
  url: string
  fileName?: string
  fileType?: string
  size?: number
}

export interface AccountProfileForm {
  nickname?: string
  avatar?: string
}

export interface ChangePhonePayload {
  newPhone: string
  smsCode: string
}

export interface ChangeEmailPayload {
  newEmail: string
  password: string
}

export interface RealNameAuthStatus {
  userId?: string
  realName?: string
  idCardNo?: string
  realNameStatus?: number
}

export interface RealNameAuthPayload {
  realName: string
  idCardNo: string
  idCardFront: string
  idCardBack: string
}

export interface ShippingAddressForm {
  contactName: string
  contactPhone: string
  region?: string
  detailAddress: string
  isDefault?: boolean
}

export interface ShippingAddressItem extends ShippingAddressForm {
  id: string
  fullAddress: string
  createTime?: string
  updateTime?: string
}

export interface InvoiceInfoForm {
  invoiceType: number
  title: string
  taxNo?: string
  bankName?: string
  bankAccount?: string
  registerAddress?: string
  registerPhone?: string
  isDefault?: boolean
}

export interface InvoiceInfoItem extends InvoiceInfoForm {
  id: string
  createTime?: string
  updateTime?: string
}
