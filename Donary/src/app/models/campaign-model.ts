export interface Column {
    colName: string;
    isVisible: boolean;
    colId: string;
    width: string;
    sortName: string;
}

export interface CampaignListRequestData {
    EventGuId: string;
    FromDate: string;
    ToDate: string;
}


export interface CampaignData {
    collector:string;    
    device:string;    
    donor:string;
    location:string;    
    reason:string; 
    parentId: number | null;
    campaignId: number;
    campaignNumber: number;
    campaign: string;
    friendlyName: string;
    reasonId?:Array<any>;
    locationId?:Array<any>;
    accountId?:Array<any>;
    collectorId?:Array<any>;
    deviceId?:Array<any>;
    paymentsCount:number;
    pledgesCount:number;
    schedulesCount:number;
    children: Array<CampaignData>;
    payments:number;
    openPledges:number;
    scheduled:number;
    raised:number;
    status:string;
    visibility?:boolean,
    level?: number
}




export interface listTypes {
    id: any;
    openPledges: number;
    paymentCount: number;
    payments: number;
    raised: number;
    scheduled: number;
    type: string;
}


export interface CampaignListResponseData {
    campaignMasters: Array<CampaignData>;
    grandTotal: number;
    paid: number;
    pending: number;
    balance: number;


    campaignCardPayments?: Array<listTypes>;
    collectorCardPayments?: Array<listTypes>;
    deviceCardPayments?: Array<listTypes>;
    donorCardPayments?: Array<listTypes>;
    locationCardPayments?: Array<listTypes>;
    reasonCardPayments?: Array<listTypes>;

}
export interface TotalPanelObj {
    payments: number;
    openPledges: number;
    scheduled: number;
    raised: number;
}

export interface CampaignCardDataResponse {
    campaignId: number;
    campaignNumber: number;
    campaignName: string;
    friendlyName: string;
    parentCampaign: string;
    createdDate: string;
    totalPanel: TotalPanelObj
}
