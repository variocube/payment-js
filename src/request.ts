import {CPayPaymentData, PaymentMethod, PaymentStatus, PublicPayment, StripeClientSecret} from "./types";

class Environment {

    private _stage: 'dev' | 'live' = 'dev';
    private _paymentId: string = '';

    get stage() {
        return this._stage;
    }

    set stage(stage) {
        this._stage = stage;
    }

    get url() {
        return (this.stage === 'live') ? 'https://payment-api-app.variocube.com' : 'https://payment-api-dev.variocube.com';
    }

    get paymentId() {
        return this._paymentId;
    }

    set paymentId(id: string) {
        this._paymentId = id;
    }
}

export const env = new Environment();

export async function retrievePayment(id: string): Promise<PublicPayment> {
    const response = await request(`${env.url}/public/${id}`);
    return getJsonResult<PublicPayment>(response);
}

export async function listPaymentMethods(id: string): Promise<PaymentMethod[]> {
    const response = await request(`${env.url}/public/${id}/payment-methods`);
    return getJsonResult<PaymentMethod[]>(response);
}

export async function fetchStripeClientSecret(id: string, useStoredMethodId?: string): Promise<StripeClientSecret> {
    const response = await request(`${env.url}/public/${id}/stripe-client-secret`, {
        method: 'post',
        body: JSON.stringify({ useStoredMethodId })
    });
    return getJsonResult(response);
}

export async function saveStripePaymentMethod(id: string): Promise<string> {
    const response = await request(`${env.url}/public/${id}/save-stripe-payment-method`, {
        method: 'post'
    });
    return getJsonResult(response);
}

export async function fetchPaypalOrderId(id: string): Promise<string> {
    const response = await request(`${env.url}/public/${id}/paypal-order`, {
        method: 'post'
    });
    return getJsonResult(response);
}

export async function capturePaypalOrder(id: string): Promise<PaymentStatus> {
    const response = await request(`${env.url}/public/${id}/paypal-capture`, {
        method: 'post'
    });
    return getJsonResult(response);
}

export async function fetchWalleeLightboxUrl(id: string, successUrl: string, failedUrl: string, language?: string): Promise<{ lightBoxUrl: string }> {
    const response = await request(`${env.url}/public/${id}/wallee-lightbox-url`, {
        method: 'post',
        body: JSON.stringify({
            successUrl,
            failedUrl,
            language
        })
    });
    return getJsonResult(response);
}

export async function renewWalleePayment(id: string): Promise<PublicPayment> {
    const response = await request(`${env.url}/public/${id}/wallee-renew-payment`, {
        method: 'post'
    });
    return getJsonResult(response);
}

export async function fetchCPayPaymentData(id: string, redirectUrl: string): Promise<CPayPaymentData> {
    const response = await request(`${env.url}/public/${id}/cpay-payment-data`, {
        method: 'post',
        body: JSON.stringify({
            redirectUrl
        })
    });
    return getJsonResult(response);
}

export async function getPayeeName(id: string): Promise<string> {
    const response = await request(`${env.url}/public/${id}/payee-name`);
    return getJsonResult<string>(response);
}

export async function getPayeeCountry(id: string): Promise<string> {
    const response = await request(`${env.url}/public/${id}/payee-country`);
    return getJsonResult<string>(response);
}

async function request(info: RequestInfo, init?: RequestInit) {
    let response, message;
    try {
        response = await window.fetch(info, init);
        if (response.ok) {
            return response;
        }
    } catch (error: any) {
        message = error.message;
    }
    message = (await response.json()).message || await response.text();
    throw new Error((message) ? message : `Failed to fetch resource, server returns status ${response.status}.`);
}

async function getJsonResult<T>(response: Response) {
    return await response.json() as T;
}