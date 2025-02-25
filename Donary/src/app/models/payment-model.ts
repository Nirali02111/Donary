export class RetryRequestData {
    "PaymentId": number;
    "UpdatedBy": number;
    "WalletId": number;
}

export class RetryResponseData {
    errorResponse: string;
    gatewayRefNum: string;
    isDBTransSucceed: boolean;
    isGatewayTransSucceed: boolean;
    isPaymentExist: boolean;
    paymentStatus: string;
    responseTitle: string;
}