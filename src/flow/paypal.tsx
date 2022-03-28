import React, {useEffect, useState} from "react";
import {Typography} from "@mui/material";
import {resources} from "../resources";
import {PaymentStatus} from "../types";
import {capturePaypalOrder, env, fetchPaypalOrderId} from "../request";

const messages = resources.getStrings();

interface PaypalFormProperties {
    clientId: string;
    currency: string;
    onPaymentSelected: () => void;
    onPaymentCanceled: () => void;
    onPaymentError: (error: Error) => void;
    onPaymentConfirmed: (status: PaymentStatus) => void;
}

const PaypalForm = ({clientId, currency, onPaymentSelected, onPaymentCanceled, onPaymentError, onPaymentConfirmed}: PaypalFormProperties) => {
    const [loaded, setLoaded] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string>();

    useEffect(() => {
        let sdkUrl = 'https://www.paypal.com/sdk/js?currency='+ currency +'&client-id=' + clientId;
        sdkUrl += '&disable-funding=card,credit,venmo,sepa,bancontact,eps,giropay,ideal,mybank,p24,sofort';

        const paypalScript = document.createElement('script');
        paypalScript.setAttribute('type', 'text/javascript');
        paypalScript.setAttribute('src', sdkUrl);

        const head = document.getElementsByTagName('head').item(0);
        if (head) { head.appendChild(paypalScript); }

        let tries = 0;
        const loadInterval = setInterval(() => {
            tries += 1;
            if ((window as any)['paypal']) {
                clearInterval(loadInterval);
                const paypal = (window as any)['paypal'];
                paypal.Buttons({
                    style: {
                        color: 'silver'
                    },
                    createOrder: async () => {
                        try {
                            setProcessing(true);
                            onPaymentSelected();
                            return await fetchPaypalOrderId(env.paymentId);
                        } catch (error: any) {
                            console.error(error);
                            setError(messages.PaypalFailedToCreateOrder);
                            onPaymentError(error);
                        }
                    },
                    onApprove: async () => {
                        try {
                            const status = await capturePaypalOrder(env.paymentId);
                            setProcessing(false);
                            onPaymentConfirmed(status);
                        } catch (error: any) {
                            console.error(error);
                            setError(messages.PaypalFailedToCaptureOrder);
                            onPaymentError(error);
                        }
                    },
                    onCancel: () => {
                        setProcessing(false);
                        onPaymentCanceled();
                    }
                }).render('#paypal-button-container');
                setLoaded(true);
            }
            if (tries > 10) {
                setError(messages.PaypalFailedToLoad);
                clearInterval(loadInterval);
            }
        }, 1000);
    }, []);

    return (
        <div style={{ flexGrow: 1 }}>
            { (!loaded && !error) && (
                <Typography variant="body1" color="textSecondary"><i>{messages.Loading}</i></Typography>
            )}
            { (error) && (
                <Typography variant="body1" color="textSecondary">{error}</Typography>
            )}
            <div id="paypal-button-container" style={{ display: (processing) ? 'none' : 'block' }}/>
            { processing && (
                <Typography variant="body1" align="center">{messages.ProcessingPayment}</Typography>
            )}
        </div>
    )
}

interface PaypalPaymentProps {
    publicKey: string;
    currency: string;
    onPaymentConfirmed: (status: PaymentStatus) => void;
    onCanceled: () => void;
    onSelected: () => void;
    onError: (error: Error) => void;
}

export function PaypalPayment(props: PaypalPaymentProps) {

    return (
        <PaypalForm clientId={props.publicKey}
                    currency={props.currency}
                    onPaymentSelected={props.onSelected}
                    onPaymentCanceled={props.onCanceled}
                    onPaymentError={props.onError}
                    onPaymentConfirmed={props.onPaymentConfirmed}/>
    );
}