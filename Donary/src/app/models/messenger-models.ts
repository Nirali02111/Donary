export interface ReceiptObj {
    Id: number,
    EmailAddresses: Array<string>,
    PhoneNumbers: Array<string>
}

export interface BulkSMSRequestData {
    Type: string;
    MacAddress: string;
    FromDate: string;
    ToDate: string;
    BulkEmailReceiptIds: Array<ReceiptObj>;
}

export interface BulkSMSResponseData {}

export interface ErrorObj {
    Description: string;
    HelpContext: string;
    HelpFile: string;
    Number: string;
    Source: string;
}
export interface AddressObj {
    Address2: string;
    City: string;
    State: string;
    Zip4: string;
    Zip5: string;
    ReturnText: string;
    Error: ErrorObj;
}

export interface AddressValidateResponse {
    Address: AddressObj
}

export interface MailResponseData {
    AddressValidateResponse: AddressValidateResponse
}


export interface MultipleAddressObj {
    ID: string;
    Address2: string;
    City: string;
    State: string;
    Zip4: string;
    Zip5: string;
    ReturnText: string;
    Error: ErrorObj;
}

export interface MultipleAddressValidateResponse {
    Address: Array<MultipleAddressObj>
}

export interface MultipleMailResponseData {
    AddressValidateResponse: MultipleAddressValidateResponse
}
