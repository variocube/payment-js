import React, {useCallback, useEffect, useState} from "react";
import StripeJs from "@stripe/stripe-js";
import {loadStripe, PaymentIntent, PaymentRequest, Stripe} from "@stripe/stripe-js";
import {Alert, Box, Button, Checkbox, FormControlLabel, Grid, Paper, TextField, Typography} from "@mui/material";
import {
    CardElement,
    IbanElement,
    Elements,
    ElementsConsumer,
    PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import {resources} from "../resources";
import {styles, theme} from "../theme";
import {PaymentStatus, StripeClientSecret} from "../types";
import {env, fetchStripeClientSecret} from "../request";
import {PaymentIcon} from "../icons";

const messages = resources.getStrings();
const stripeStyle = {
    style: {
        base: {
            fontSize: '16px',
            color: theme.palette.primary.main,
            '::placeholder': {
                color: theme.palette.primary.light,
            }
        },
        invalid: {
            color: theme.palette.error.main
        }
    }
};

/**
 *  CARD PAYMENT ELEMENT
 */
interface CardPaymentFormProps {
    stripe: Stripe;
    elements: StripeJs.StripeElements;
    stripeClientSecret: StripeClientSecret;
    onPaymentConfirmed: (paymentIntent: PaymentIntent, saveMethod: boolean) => void;
    onPaymentError: (error: StripeJs.StripeError) => void;
}

const CardPaymentForm = ({stripe, elements, stripeClientSecret, onPaymentConfirmed, onPaymentError}: CardPaymentFormProps) => {
    const [saveMethod, setSaveMethod] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string>();

    const handleSubmit = useCallback((event?: any) => {
        if (event) event.preventDefault();
        toggleProcessing();
        setError(undefined);
        let data;
        if (stripeClientSecret.paymentMethodId !== undefined) {
            data = { payment_method: stripeClientSecret.paymentMethodId };
        } else {
            data = {
                payment_method: {
                    card: elements.getElement(CardElement) as any
                },
                setup_future_usage: saveMethod ? 'off_session' : undefined
            };
        }
        stripe.confirmCardPayment(stripeClientSecret.clientSecret, data)
            .then(({error, paymentIntent}) => {
                toggleProcessing();
                let confirmed = false;
                if (paymentIntent && (paymentIntent.status === 'processing' || paymentIntent.status === 'succeeded')) {
                    confirmed = true;
                }
                if (error) {
                    if (error.payment_intent && (error.payment_intent.status === 'processing' || error.payment_intent.status === 'succeeded')) {
                        confirmed = true;
                        paymentIntent = error.payment_intent;
                    } else {
                        console.error('[error]', error);
                        setError(error.message);
                        onPaymentError(error);
                    }
                }
                if (confirmed && paymentIntent) {
                    onPaymentConfirmed(paymentIntent, saveMethod);
                }
            });
    }, [stripe, elements, stripeClientSecret, onPaymentError, onPaymentConfirmed])

    useEffect(() => {
        if (stripeClientSecret.paymentMethodId !== undefined) {
            handleSubmit();
        }
    }, []);

    const toggleProcessing = () => setProcessing(!processing);

    const toggleSaveMethod = () => setSaveMethod(!saveMethod);

    return (
        <div>
            <Typography variant="h6" align="center">
                <PaymentIcon style={styles.paymentTitleIcon as any}/>
                <strong>{messages.PaymentMethodCards}</strong>
            </Typography>
            <Box my={2}/>
            { stripeClientSecret.paymentMethodId === undefined && (
                <form onSubmit={handleSubmit}>
                    <Paper variant="outlined">
                        <Box p={2}>
                            <CardElement
                                options={{
                                    ...stripeStyle,
                                    hidePostalCode: true
                                }}
                            />
                        </Box>
                    </Paper>
                    <Box my={1}/>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={saveMethod}
                                onChange={toggleSaveMethod}
                                color="primary"
                            />
                        }
                        style={{ textAlign: 'center', display: 'flex' as any, marginRight: 0 }}
                        label={messages.PaymentFormSavePaymentMethod}
                    />
                    <Box mt={2} style={{ textAlign: 'center'}}>
                        <Button type="submit" style={{ minWidth: 150 }} size="large" variant="outlined" color="primary" disabled={!stripe || processing}>Pay</Button>
                    </Box>
                </form>
            )}
            { processing && (
                <Box mt={2}>
                    <Typography variant="body1" align="center">{messages.ProcessingPayment}</Typography>
                </Box>
            )}
            { error && (
                <Box mt={2}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            )}
        </div>
    )
}

interface StripeCardPaymentProps {
    publicKey: string;
    stripeClientSecret: StripeClientSecret;
    onPaymentConfirmed: (status: PaymentStatus, saveMethod?: boolean) => void;
    onPaymentError: (error: StripeJs.StripeError) => void;
}

export const StripeCardPayment = ({publicKey, stripeClientSecret, onPaymentError, onPaymentConfirmed}: StripeCardPaymentProps) => {
    const [stripe, setStripe] = useState<Stripe>();

    useEffect(() => {
        loadStripe(publicKey)
            .then(s => setStripe(s || undefined));
    }, []);

    return (
        (!stripe) ?
            <Typography>Loading...</Typography> :
            <Elements stripe={stripe}>
                <ElementsConsumer>
                    {({elements, stripe}: any) => (
                        <CardPaymentForm elements={elements} stripe={stripe} stripeClientSecret={stripeClientSecret}
                                         onPaymentError={onPaymentError}
                                         onPaymentConfirmed={(paymentIntent, saveMethod) => handlePaymentConfirmed(paymentIntent, saveMethod, onPaymentConfirmed)}/>
                    )}
                </ElementsConsumer>
            </Elements>
    )
}


/**
 * SEPA PAYMENT ELEMENT
 */
interface SepaPaymentFormProps {
    stripe: Stripe;
    elements: StripeJs.StripeElements;
    payeeName: string;
    stripeClientSecret: StripeClientSecret;
    onPaymentError: (error: StripeJs.StripeError) => void;
    onPaymentConfirmed: (paymentIntent: PaymentIntent, saveMethod: boolean) => void;
}

const SepaPaymentForm = ({stripe, elements, stripeClientSecret, payeeName, onPaymentError, onPaymentConfirmed}: SepaPaymentFormProps) => {
    const [billingDetails, setBillingDetails] = useState<{ name: string, email: string}>({ name: '', email: '' });
    const [saveMethod, setSaveMethod] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string>();

    useEffect(() => {
        if (stripeClientSecret.paymentMethodId !== undefined) {
            handleSubmit();
        }
    }, []);

    const handleSubmit = useCallback((event?: any) => {
        if (event) event.preventDefault();
        setProcessing(true);
        setError(undefined);
        let data;
        if (stripeClientSecret.paymentMethodId !== undefined) {
            data = { payment_method: stripeClientSecret.paymentMethodId };
        } else {
            if (billingDetails.name.trim().length === 0 || billingDetails.email.trim().length === 0) {
                const top = document.getElementById('payment-flow-box');
                if(top) {
                    top.scrollIntoView();
                }
                setProcessing(false);
                console.log('missing info', billingDetails);
                return;
            }
            data = {
                payment_method: {
                    sepa_debit: elements.getElement(IbanElement),
                    billing_details: billingDetails
                },
                setup_future_usage: saveMethod ? 'off_session' : undefined
            };
        }
        stripe.confirmSepaDebitPayment(stripeClientSecret.clientSecret, data)
            .then(({error, paymentIntent}) => {
                setProcessing(true);
                let confirmed = false;
                if (paymentIntent && (paymentIntent.status === 'processing' || paymentIntent.status === 'succeeded')) {
                    confirmed = true;
                }
                if (error) {
                    if (error.payment_intent && (error.payment_intent.status === 'processing' || error.payment_intent.status === 'succeeded')) {
                        confirmed = true;
                        paymentIntent = error.payment_intent;
                    } else {
                        console.error('[error]', error);
                        setError(error.message);
                        onPaymentError(error);
                    }
                    setProcessing(false);
                }
                if (confirmed && paymentIntent) {
                    onPaymentConfirmed(paymentIntent, saveMethod);
                }
            });
    }, [stripe, elements, stripeClientSecret, onPaymentError, onPaymentConfirmed, billingDetails, setProcessing])

    const toggleSaveMethod = () => setSaveMethod(!saveMethod);

    const onBillingDetailsChange = (event: any) => {
        setBillingDetails({
            ...billingDetails,
            [event.target.name]: event.target.value
        });
    };

    return (
        <div>
            <Typography variant="h6" align="center">
                <PaymentIcon style={styles.paymentTitleIcon as any}/>
                <strong>{messages.PaymentMethodSepaDirectDebit}</strong>
            </Typography>
            <Box my={2}/>
            { stripeClientSecret.paymentMethodId === undefined && (
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={1}>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth required
                                       label={messages.Name} variant="outlined"
                                       name="name" value={billingDetails.name}
                                       onChange={onBillingDetailsChange}/>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth required
                                       label={messages.Email} variant="outlined" type="email"
                                       name="email" value={billingDetails.email}
                                       onChange={onBillingDetailsChange}/>
                        </Grid>
                    </Grid>
                    <Box my={1}/>
                    <Paper variant="outlined">
                        <Box p={2}>
                            <IbanElement
                                options={{
                                    ...stripeStyle,
                                    supportedCountries: ['SEPA'],
                                    placeholderCountry: 'AT'
                                }}
                            />
                        </Box>
                    </Paper>
                    <Box my={1}/>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={saveMethod}
                                onChange={toggleSaveMethod}
                                color="primary"
                            />
                        }
                        style={{ textAlign: 'center', display: 'flex' as any, marginRight: 0 }}
                        label={messages.PaymentFormSavePaymentMethod}
                    />
                    <Box my={1}/>
                    <Typography variant="body2" align="center" style={{ fontSize: '0.8rem' }}>
                        {messages.PaymentFormSepaDirectDebitAcceptance.replace(/%PAYEE%/g, payeeName)}
                    </Typography>
                    <Box mt={2} style={{ textAlign: 'center'}}>
                        <Button type="submit" style={{ minWidth: 150 }} size="large" variant="outlined" color="primary" disabled={!stripe || processing}>Pay</Button>
                    </Box>
                </form>
            )}
            { processing && (
                <Box mt={2}>
                    <Typography variant="body1" align="center">{messages.ProcessingPayment}</Typography>
                </Box>
            )}
            { error && (
                <Box mt={2}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            )}
        </div>
    )
}

interface StripeSepaPaymentProps {
    publicKey: string;
    payeeName: string;
    stripeClientSecret: StripeClientSecret;
    onPaymentError: (error: StripeJs.StripeError) => void;
    onPaymentConfirmed: (status: PaymentStatus, saveMethod?: boolean) => void;
}

export const StripeSepaPayment = ({publicKey, payeeName, stripeClientSecret, onPaymentConfirmed, onPaymentError}: StripeSepaPaymentProps) => {
    const [stripe, setStripe] = useState<Stripe>();

    useEffect(() => {
        loadStripe(publicKey)
            .then(s => setStripe(s || undefined));
    }, []);

    return (
        (!stripe) ?
            <Typography>Loading...</Typography> :
            <Elements stripe={stripe}>
                <ElementsConsumer>
                    {({elements, stripe}: any) => (
                        <SepaPaymentForm elements={elements} stripe={stripe} stripeClientSecret={stripeClientSecret}
                                         payeeName={payeeName} onPaymentError={onPaymentError}
                                         onPaymentConfirmed={(paymentIntent, saveMethod) => handlePaymentConfirmed(paymentIntent, saveMethod, onPaymentConfirmed)}/>
                    )}
                </ElementsConsumer>
            </Elements>
    )
}


/**
 * PAYMENT REQUEST
 * For Apple Pay, Google Pay and Microsoft Pay
 */
interface PaymentRequestFormProps {
    stripe: Stripe;
    country: string;
    currency: string;
    payeeName: string;
    amount: number;
    onNotSupported: () => void;
    onPaymentSelect: () => void;
    onPaymentCancel: () => void;
    onPaymentError: (error: StripeJs.StripeError) => void;
    onPaymentConfirmed: (paymentIntent?: PaymentIntent) => void;
}

const PaymentRequestForm = ({stripe, country, currency, payeeName, amount, onPaymentSelect, onPaymentCancel, onPaymentError, onPaymentConfirmed, onNotSupported}: PaymentRequestFormProps) => {
    const [paymentRequest, setPaymentRequest] = useState<PaymentRequest>();

    useEffect(() => {
        const pr = stripe.paymentRequest({
            country: country,
            currency: currency.toLowerCase(),
            total: {
                label: payeeName,
                amount: Math.ceil(amount * 100),
            }
        });
        pr.canMakePayment()
            .then(result => {
                if (result) {
                    setPaymentRequest(pr);
                } else {
                    onNotSupported();
                }
            });

        pr.on('paymentmethod', async (ev) => {
            const {clientSecret} = await fetchStripeClientSecret(env.paymentId);
            onPaymentSelect();
            // Confirm the PaymentIntent without handling potential next actions (yet).
            const {paymentIntent, error: confirmError} = await stripe.confirmCardPayment(
                clientSecret,
                {payment_method: ev.paymentMethod.id},
                {handleActions: false}
            );

            if (confirmError) {
                // Report to the browser that the payment failed, prompting it to
                // re-show the payment interface, or show an error message and close
                // the payment interface.
                ev.complete('fail');
                onPaymentError(confirmError);
            } else {
                // Report to the browser that the confirmation was successful, prompting
                // it to close the browser payment method collection interface.
                ev.complete('success');
                // Check if the PaymentIntent requires any actions and if so let Stripe.js
                // handle the flow. If using an API version older than "2019-02-11"
                // instead check for: `paymentIntent.status === "requires_source_action"`.
                if (paymentIntent) {
                    if (paymentIntent.status === "requires_action") {
                        // Let Stripe.js handle the rest of the payment flow.
                        const {error} = await stripe.confirmCardPayment(clientSecret);
                        if (error) {
                            // The payment failed -- ask your customer for a new payment method.
                            onPaymentError(error);
                            return;
                        }
                    }
                    // The payment has succeeded.
                    onPaymentConfirmed(paymentIntent);
                } else {
                    // The payment has succeeded.
                    onPaymentConfirmed();
                }
            }
        })
        pr.on('cancel', onPaymentCancel);
    }, []);

    return (
        <div style={{ width: '100%' }}>
            {paymentRequest && (
                <PaymentRequestButtonElement options={{ paymentRequest }} />
            )}
        </div>
    )
}

interface StripePaymentRequestProps {
    publicKey: string;
    currency: string;
    amount: number;
    country: string;
    payeeName: string;
    onNotSupported: () => void;
    onSelected: () => void;
    onCanceled: () => void;
    onPaymentError: (error: StripeJs.StripeError) => void;
    onPaymentConfirmed: (status: PaymentStatus) => void;
}

export const StripePaymentRequest = ({publicKey, currency, amount, country, payeeName, onPaymentError, onPaymentConfirmed, onNotSupported, onSelected, onCanceled}: StripePaymentRequestProps) => {
    const [stripe, setStripe] = useState<Stripe>();

    useEffect(() => {
        loadStripe(publicKey)
            .then(s => setStripe(s || undefined));
    }, []);

    return (
        (!stripe) ?
            <Typography>Loading...</Typography> :
            <Elements stripe={stripe}>
                <ElementsConsumer>
                    {({stripe}: any) => (
                        <PaymentRequestForm stripe={stripe}
                                            currency={currency} amount={amount} country={country}
                                            onPaymentSelect={onSelected} onPaymentCancel={onCanceled}
                                            onPaymentError={onPaymentError} onPaymentConfirmed={paymentIntent => handlePaymentConfirmed(paymentIntent || {status: 'succeeded'} as any, false, onPaymentConfirmed)}
                                            payeeName={payeeName}
                                            onNotSupported={onNotSupported}/>
                    )}
                </ElementsConsumer>
            </Elements>
    )
}


function handlePaymentConfirmed(paymentIntent: PaymentIntent, saveMethod: boolean, onPaymentConfirmed: (status: PaymentStatus, saveMethod?: boolean) => void) {
    let status;
    switch (paymentIntent.status) {
        case 'processing':
            status = PaymentStatus.Processing;
            break;
        case 'canceled':
            status = PaymentStatus.Canceled;
            break;
        case 'succeeded':
            status = PaymentStatus.Succeeded;
            break;
        default:
            status = PaymentStatus.Failed;
            break;
    }
    onPaymentConfirmed(status, saveMethod);
}