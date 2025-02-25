export class PledgePaymentModel {
    pledgeId: number;
    accountId: number;
    campaignName: string;
    pledgeTotalAmount: number;
    pledgePaidAmount: number;
    pledgeRemainingAmount: number;
    orgRemainingAmount:number;
    pledgeDefaultDisplayAmount:number;
    refNum: string;
    description: string;
    fullName: string;
    pledgeNum: string;
    reasonName: string;
    paymentReasonId:string;
    locationName: string;
    pledgeDate: string;   
    createdDate: string;
    promiseDate: string;
    isRecurring: boolean;
    scheduleRepeatType: string;
    colectorName: string;
    isSelected: boolean;
    apiType:string;
    ccAPIKey:string;
    gateway:string;
    eventReasonId:string;
    pin:string;
    externalNote: string;
}

export interface Pledge {
    pledgeId: number;
    pledgeNum: string;
    status: string;
    pledgeDate: string;
    pledgeJewishDate: string;
    accountId: number;
    donor: string;
    donorJewishName: string;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    campaign: string;
    reason: string | null;
    location: string | null;
    collector: string | null;
    createdBy: string;
    deviceName: string;
    deviceId: string;
    source: string;
    refNum: string | null;
    createdDate: string;
    emails: string | null;
    phones: string;
    pledgePayments: string | null;
    address: string | null;
    cityStateZip: string | null;
    phoneLabels: string;
    description: string | null;
    changeLog: string;
    externalNote: string;
    latitude: number | null;
    longitude: number | null;
    groupNum: number | null;
    groupDate: string;
    aliyaTypeId: number;
    aliyaNameId: number;
    lstRelatedReceiptLogs: RelatedReceiptLog[];
    lstRelatedNotifications: string | null;
    accountNum: string;
    seatSaleId: number | null;
    seatId: number | null;
    emailLabels: string | null;
    aliyaGroupId: number;
}

interface RelatedReceiptLog {
    source: string;
    sentTo: string | null;
    createdDate: string;
    status: boolean;
    documentPath: string | null;
}
