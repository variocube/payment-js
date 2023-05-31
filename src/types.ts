export interface PublicPayment {
    uuid: string;
    amount: number;
    currency: string;
    providerId?: string;
    info?: string;
    type?: PaymentType;
    provider?: PaymentProvider;
    status: PaymentStatus;
    metadata?: { [key: string]: any };
    description?: string;
    createdAt: string;
    paidAt?: string;
}

export enum PaymentProvider {
    PayPal = 'PayPal',
    Stripe = 'Stripe',
    Wallee = 'Wallee',
}

export enum PaymentStatus {
    Pending = 'Pending',
    Processing = 'Processing',
    Succeeded = 'Succeeded',
    Failed = 'Failed',
    Canceled = 'Canceled'
}

export enum PaymentType {
    Cards = 'Cards',
    SepaDirectDebit = 'SepaDirectDebit',
    PayPal = 'PayPal',
    PaymentRequest = 'PaymentRequest'
}

export interface PaymentMethod {
    stripe?: StripePaymentMethod;
    paypal?: PaypalPaymentMethod;
    wallee?: WalleePaymentMethod;
    publicKey?: string;
}

export type StripePaymentMethod = {
    type: PaymentType,
    last4Digits?: string
    methodId?: string;
}

export type PaypalPaymentMethod = {
    type: PaymentType
}

export type WalleePaymentMethod = {
    type: PaymentType
}

export interface StripeClientSecret {
    clientSecret: string;
    paymentMethodId?: string;
}

export enum ErrorCode {
    // Payee
    InvalidPayee = 'E400101',
    PayeeNotConfiguredForStripe = 'E400202',
    PayeeNotConfiguredForPayPal = 'E400203',
    PayeeRetrieveError = 'E404141',

    // Payer
    InvalidPayer = 'E400201',
    PayerRetrieveError = 'E404201',
    PayerSaveMethodError = 'E500262',

    // Payment
    InvalidMinimumAmount = 'E400301',
    InvalidEmail = 'E400302',
    PaymentUseStoredMethodError = 'E400361',
    PaymentRetrieveError = 'E404341',
    PaymentCreationError = 'E500351',
    PaymentCreateStripeMethodError = 'E500371',
    PaymentCreatePayPalMethodError = 'E500381',
    PaymentCapturePayPalError = 'E500382',
}