import * as React from 'react';
import {useState} from 'react';
import {
    Avatar,
    Box,
    Button,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Typography
} from "@mui/material";
import {resources} from "../resources";
import {PaypalPayment} from "./paypal";
import {StripeCardPayment, StripePaymentRequest, StripeSepaPayment} from "./stripe";
import {PaymentMethod, PaymentStatus, PaymentType, StripeClientSecret} from "../types";
import {styles} from "../theme";
import {EuroIcon, ImageIcon, LayersIcon, PaymentIcon, RefreshIcon} from "../icons";
import {PayPalIcon} from "../assets/PayPalIcon";

const messages = resources.getStrings();

interface PaymentMethodListProps {
    paymentMethods: PaymentMethod[];
    payeeName: string;
    currency: string;
    amount: number;
    country: string;
    onPaymentError: (error: Error) => void;
    onPaymentConfirmed: (status: PaymentStatus) => void;
    onSelect: (paymentMethod: PaymentMethod, useStoredMethod: boolean) => void;
}

export function PaymentMethodList({paymentMethods, currency, onPaymentError, onPaymentConfirmed, onSelect, payeeName, country, amount}: PaymentMethodListProps) {
    const [disabled, setDisabled] = useState(false);
    const [canPR, setCanPR] = useState(true);

    const handleMethodSelection = (method: PaymentMethod, useStoredMethod: boolean) => {
        setDisabled(true);
        onSelect(method, useStoredMethod);
        window.setTimeout(() => {
            setDisabled(false);
        }, 3000);
    };

    return (
        <div>
            <Typography variant="body1" align="center">{messages.SelectPaymentMethod}</Typography>
            <Box my={2}/>
            <Paper variant="outlined" style={{ position: 'relative' }}>
                { disabled && <div style={{ position: 'absolute', zIndex: 9999, width: '100%', height: '100%' }}/> }
                <List style={{ padding: 0 }}>
                    {
                        paymentMethods
                            .map((method, i) => (
                                <div key={'payment-method-' + i}>
                                    { (method?.stripe?.last4Digits !== undefined) && (
                                        <ListItem button disabled={disabled} onClick={() => handleMethodSelection(method, true)}>
                                            <ListItemAvatar>
                                                <Avatar style={styles.primaryBg}><RefreshIcon style={{ color: '#fff' }}/></Avatar>
                                            </ListItemAvatar>
                                            <ListItemText primary={(messages as any)['StorePaymentMethod' + method.stripe.type]}
                                                          secondary={method.stripe?.last4Digits} />
                                        </ListItem>
                                    )}
                                    { (method.stripe && method.stripe.last4Digits === undefined && [PaymentType.Cards, PaymentType.SepaDirectDebit].indexOf(method.stripe.type) > -1) && (
                                        <ListItem button disabled={disabled} onClick={() => handleMethodSelection(method, false)}>
                                            <ListItemAvatar>
                                                <Avatar style={styles.primaryBg}>
                                                    { renderPaymentTypeIcon(method.stripe.type) }
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText primary={(messages as any)['PaymentMethod' + method.stripe.type]}
                                                          secondary={(messages as any)['PaymentMethod' + method.stripe.type + 'Description']} />
                                        </ListItem>
                                    )}
                                    { (method.stripe && method.publicKey && method.stripe.type === PaymentType.PaymentRequest && canPR) && (
                                        <ListItem disabled={disabled}>
                                            <ListItemAvatar>
                                                <Avatar style={styles.primaryBg}>
                                                    { renderPaymentTypeIcon(PaymentType.PaymentRequest) }
                                                </Avatar>
                                            </ListItemAvatar>
                                            <StripePaymentRequest publicKey={method.publicKey} currency={currency} amount={amount} country={country} payeeName={payeeName}
                                                                  onCanceled={() => setDisabled(false)}
                                                                  onSelected={() => handleMethodSelection(method, false)}
                                                                  onPaymentError={e => onPaymentError(e as any)} onPaymentConfirmed={onPaymentConfirmed}
                                                                  onNotSupported={() => setCanPR(false)}/>
                                        </ListItem>
                                    )}
                                    { (method.paypal && method.publicKey !== undefined) && (
                                        <ListItem disabled={disabled}>
                                            <ListItemAvatar>
                                                <Avatar style={styles.primaryBg}>
                                                    { renderPaymentTypeIcon(PaymentType.PayPal) }
                                                </Avatar>
                                            </ListItemAvatar>
                                            <PaypalPayment publicKey={method.publicKey} currency={currency}
                                                           onCanceled={() => setDisabled(false)}
                                                           onSelected={() => handleMethodSelection(method, false)}
                                                           onError={onPaymentError}
                                                           onPaymentConfirmed={onPaymentConfirmed} />
                                        </ListItem>
                                    )}
                                    { i < (paymentMethods.length - 1) && (
                                        <Divider/>
                                    )}
                                </div>
                            ))
                    }
                </List>
            </Paper>
        </div>
    );
}

function renderPaymentTypeIcon(type: PaymentType) {
    switch (type) {
        case PaymentType.Cards:
            return <PaymentIcon style={{ color: '#fff' }}/>;
        case PaymentType.SepaDirectDebit:
            return <EuroIcon style={{ color: '#fff' }}/>;
        case PaymentType.PayPal:
            return <PayPalIcon style={{ height: '50%', overflow: 'hidden' }} />;
        case PaymentType.PaymentRequest:
            return <LayersIcon style={{ color: '#fff' }}/>;
        default:
            return <ImageIcon style={{ color: '#fff' }}/>;
    }
}

interface PaymentViewProps {
    payeeName: string;
    paymentMethod: PaymentMethod;
    onPaymentBack: () => void;
    onPaymentError: (error: Error) => void;
    onPaymentConfirmed: (status: PaymentStatus, saveMethod?: boolean) => void;
    stripeClientSecret?: StripeClientSecret;
}

export function PaymentView(props: PaymentViewProps) {
    const {payeeName, paymentMethod, onPaymentBack, onPaymentError, onPaymentConfirmed, stripeClientSecret} = props;
    let method;
    if (paymentMethod.stripe && paymentMethod.publicKey && stripeClientSecret) {
        switch (paymentMethod.stripe.type) {
            case PaymentType.Cards:
                method = <StripeCardPayment stripeClientSecret={stripeClientSecret}
                                            onPaymentError={e => onPaymentError(new Error('Failed to make Stripe Card Payment, error: ' + e.message))}
                                            onPaymentConfirmed={onPaymentConfirmed}
                                            publicKey={paymentMethod.publicKey}/>;
                break;
            case PaymentType.SepaDirectDebit:
                method = <StripeSepaPayment payeeName={payeeName}
                                            stripeClientSecret={stripeClientSecret}
                                            onPaymentError={e => onPaymentError(new Error('Failed to make Stripe Sepa Payment, error: ' + e.message))}
                                            onPaymentConfirmed={onPaymentConfirmed}
                                            publicKey={paymentMethod.publicKey}/>;
                break;
            default:
                method = renderPaymentTypeNotSupported();
                break;
        }
    }
    return (
        <div>
            { method }
            <Box mt={2} style={{ textAlign: 'center'}}>
                <Button onClick={() => onPaymentBack()}>{messages.Back}</Button>
            </Box>
        </div>
    );
}

function renderPaymentTypeNotSupported() {
    return <Typography variant="body1" align="center">{messages.PaymentMethodNotSupported}</Typography>;
}


