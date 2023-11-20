import React, {Fragment, useEffect, useState} from "react";
import {Alert, AlertTitle, Box, Button, Dialog, DialogContent, Divider, Typography} from "@mui/material";
import {makeStyles} from "@mui/styles";
import {styles} from "./theme";
import {Language, resources} from "./resources";
import {
    ErrorCode,
    PaymentMethod,
    PaymentProvider,
    PaymentStatus,
    PaymentType,
    PublicPayment,
    StripeClientSecret
} from "./types";
import {
    env, fetchStripeClientSecret,
    getPayeeCountry,
    getPayeeName,
    listPaymentMethods, renewWalleePayment,
    retrievePayment,
    saveStripePaymentMethod
} from "./request";
import {CheckCircleOutlineRoundedIcon, HighlightOffIcon, HourglassEmptyRoundedIcon} from "./icons";
import {PaymentMethodList, PaymentView} from "./flow/payment";

const useStyles = makeStyles({
    dialogContent: {
        overflowY: 'visible'
    }
})

type PaymentFlowProps = {
    paymentId: string,
    onClose: () => void,
    onSucceeded: (payment: PublicPayment) => void,
    onProcessing?: (payment: PublicPayment) => void,
    onError?: (error: Error) => void,
    live?: boolean,
    smallDevice?: boolean,
    language?: string,
}

export const PaymentFlow = ({paymentId, onClose, onSucceeded, onProcessing, onError, live, smallDevice, language}: PaymentFlowProps) => {
    const smallDisplay = window.innerWidth <= 480 || smallDevice;
    env.stage = (live) ? 'live' : 'dev';
    env.paymentId = paymentId;
    const classes = useStyles();

    return (
        <Dialog open={true}
                keepMounted
                fullScreen={smallDisplay}
                maxWidth="sm"
        >
            <DialogContent id="payment-flow-box" style={(smallDisplay ? styles.contentWrapper : styles.contentBoxed) as any} classes={{ root: classes.dialogContent }}>
                <Box px={smallDisplay ? 0 : 2} py={2} style={{ flexGrow: 1 }}>
                    <PaymentShell
                        onClose={onClose}
                        onError={(onError) ? onError : () => {}}
                        onProcessing={(onProcessing) ? onProcessing : (_p) => {}}
                        onSucceeded={onSucceeded}
                        language={language}
                    />
                </Box>
            </DialogContent>
        </Dialog>
    );
}

enum PaymentStateMachine {
    InitiatePayment,
    InvalidPayment,
    AwaitPaymentMethodSelection,
    RenderPaymentView,
    PaymentResult
}

type PaymentShellProps = {
    onClose: () => void,
    onProcessing: (payment: PublicPayment) => void,
    onSucceeded: (payment: PublicPayment) => void,
    onError: (error: Error) => void;
    language?: string
}

export const PaymentShell = ({onClose, onProcessing, onSucceeded, onError, language}: PaymentShellProps) => {
    const [stateMachine, setStateMachine] = useState<PaymentStateMachine>(PaymentStateMachine.InitiatePayment);
    const [payment, setPayment] = useState<PublicPayment>();
    const [error, setError] = useState<string>();
    const [payeeName, setPayeeName] = useState('');
    const [payeeCountry, setPayeeCountry] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [stripeClientSecret, setStripeClientSecret] = useState<StripeClientSecret>();
    const [busy, setBusy] = useState(false);

    const [walleePaymentRenewalError, setWalleePaymentRenewalError] = useState(false);
    const [inProgress, setInProgress] = useState(false);

    const sendError = (error: Error) => {
        onError(error);
        setError(error.message);
    }

    const getPayment = async () => {
        try {
            return await retrievePayment(env.paymentId);
        } catch (error) {
            console.error("An error occurred: ", error);
            sendError(error as any);
        }
        return null;
    }

    useEffect(() => {
        if (!!language) {
            let parsed = language.substring(0, 2).toLowerCase();
            if (Object.values(Language).map(l => l.toString()).includes(parsed))
            resources.language = parsed as Language;
        }
        getPayment()
            .then(async (p) => {
                if (p) {
                    const payeeName = await getPayeeName(env.paymentId);
                    const payeeCountry = await getPayeeCountry(env.paymentId);
                    setPayeeName(payeeName);
                    setPayeeCountry(payeeCountry);
                    await handlePayment(p);
                    if (p.status === PaymentStatus.Processing) {
                        await reloadPayment();
                    }
                    return;
                }
                setStateMachine(PaymentStateMachine.InvalidPayment);
            });
    }, []);

    const reloadPayment = () => {
        const interval = setInterval(() => {
            getPayment()
                .then(p => {
                    if (p && p.status !== PaymentStatus.Processing) {
                        clearInterval(interval);
                        handlePayment(p)
                            .then();
                    }
                })
        }, 5000);
    }

    const handlePayment = async (payment: PublicPayment) => {
        const stateMachine = (payment.status === PaymentStatus.Pending || payment.status === PaymentStatus.Failed) ?
            PaymentStateMachine.AwaitPaymentMethodSelection :
            PaymentStateMachine.PaymentResult;
        if (stateMachine === PaymentStateMachine.AwaitPaymentMethodSelection) {
            const paymentMethods = await listPaymentMethods(env.paymentId);
            setPaymentMethods(paymentMethods);
        }
        setPayment(payment);
        setStateMachine(stateMachine);
        if (payment.status === PaymentStatus.Processing) {
            onProcessing(payment);
        } else if (payment.status === PaymentStatus.Succeeded) {
            onSucceeded(payment);
        }
    }

    const handlePaymentMethodSelected = async (paymentMethod: PaymentMethod, useStoredMethod: boolean) => {
        if (paymentMethod.stripe && paymentMethod.stripe.type !== PaymentType.PaymentRequest) {
            try {
                const stripeClientSecret = await fetchStripeClientSecret(env.paymentId, (useStoredMethod) ? paymentMethod.stripe.methodId : undefined);
                setStripeClientSecret(stripeClientSecret);
                setStateMachine(PaymentStateMachine.RenderPaymentView);
            } catch (error) {
                console.error("An error occurred: ", error);
                sendError(error as any);
                return;
            }
        }
        setPaymentMethod(paymentMethod);
    }

    const handlePaymentConfirmed = async (status: PaymentStatus, saveMethod?: boolean) => {
        if (payment && paymentMethod) {
            if (paymentMethod.stripe) {
                payment.type = paymentMethod.stripe.type;
            } else if (paymentMethod.paypal) {
                payment.type = PaymentType.PayPal;
            }
            payment.status = status;
            setPayment(payment);
            setStateMachine(PaymentStateMachine.PaymentResult);
            if (saveMethod) {
                try {
                    await saveStripePaymentMethod(env.paymentId);
                } catch (error) {
                    console.error('Failed save Stripe payment method, error: ', error);
                    sendError(error as any);
                }
            }
            switch (status) {
                case PaymentStatus.Succeeded:
                    // Give the backend enough time to catch and execute VCP Callback
                    window.setTimeout(() => {
                        onSucceeded(payment);
                    }, 2000);
                    break;
                case PaymentStatus.Processing:
                    onProcessing(payment);
                    await reloadPayment();
                    break;
                default:
                    break;
            }
        }
    }

    const handlePaymentBack = () => {
        setStateMachine(PaymentStateMachine.AwaitPaymentMethodSelection);
    }

    async function handleWalleePaymentRenewal() {
        if (payment) {
            setInProgress(true);
            try {
                const newPayment = await renewWalleePayment(env.paymentId);
                await handlePayment(newPayment);
            } catch (err) {
                console.error('Failed to renew wallee payment', err);
                setWalleePaymentRenewalError(true);
            }
            setInProgress(false);
        }
    }

    const renderAmount = (payment: PublicPayment) => {
        let currencySymbol;
        switch (payment.currency) {
            case 'EUR':
                currencySymbol = '€';
                break;
            case 'USD':
                currencySymbol = '$';
                break;
            case 'CHF':
                currencySymbol = 'CHF';
                break;
            default:
                currencySymbol = payment.currency;
                break;
        }
        const [number, decimal] = payment.amount.toFixed(2).split('.');
        return `${currencySymbol} ${number},${decimal}`;
    }

    const renderCloseButton = () => {
        const messages = resources.getStrings();
        let cancelText = (stateMachine === PaymentStateMachine.InvalidPayment || stateMachine === PaymentStateMachine.PaymentResult) ?
            'OK' :
            messages.Cancel;
        return (
            <Box style={{ textAlign: 'center'}} mt={2}>
                <Button onClick={onClose} variant="contained" color="primary" disabled={busy}>{cancelText}</Button>
            </Box>
        )
    }

    const renderErrorCode = (errorCode: string) => {
        const messages = resources.getStrings();
        const error = Object.values(ErrorCode).findIndex(c => c === errorCode);
        const errorMessage = (error) ? messages['ErrorCode' + Object.keys(ErrorCode)[error]] : (messages.ErrorOccurred + ' ' + errorCode);
        if (!errorMessage) return <div />;
        return (
            <Alert severity="error" style={{ textAlign: 'center' }}>
                {errorMessage}
            </Alert>
        );
    }

    const messages = resources.getStrings();
    return (
        <div>
            { stateMachine === PaymentStateMachine.InitiatePayment && (
                <Typography variant="body1" align="center">{messages.InitiatePayment}</Typography>
            )}
            { stateMachine === PaymentStateMachine.InvalidPayment && (
                <div>
                    <Typography variant="body1" align="center">{messages.InvalidPayment}</Typography>
                    { renderCloseButton() }
                </div>

            )}
            { payment && (
                <div>
                    <Typography variant="h6" align="center">{messages.Amount}: {renderAmount(payment)} </Typography>
                    <Box my={2} children={<Divider/>}/>
                </div>
            )}
            { stateMachine === PaymentStateMachine.AwaitPaymentMethodSelection && (
                <div>
                    { payment && (
                        <Fragment>
                            <PaymentMethodList
                                paymentMethods={paymentMethods}
                                payeeName={payeeName} country={payeeCountry}
                                amount={payment.amount}
                                currency={payment.currency}
                                onPaymentError={sendError}
                                onPaymentConfirmed={handlePaymentConfirmed}
                                onSelect={handlePaymentMethodSelected}
                                onBusy={setBusy}
                            />
                            { (payment.status === PaymentStatus.Failed) && (
                                <Box mt={2}>
                                    <Alert severity="warning" style={{ textAlign: 'center' }}>
                                        {messages.PaymentFailed}
                                    </Alert>
                                </Box>
                            )}
                        </Fragment>
                    )}
                    { renderCloseButton() }
                </div>
            )}
            { (stateMachine === PaymentStateMachine.RenderPaymentView && paymentMethod) && (
                <PaymentView
                    payeeName={payeeName}
                    paymentMethod={paymentMethod}
                    onPaymentBack={handlePaymentBack}
                    onPaymentError={sendError}
                    onPaymentConfirmed={handlePaymentConfirmed}
                    stripeClientSecret={stripeClientSecret}
                />
            )}
            { stateMachine === PaymentStateMachine.PaymentResult && (
                payment && (
                    <div>
                        { payment.status === PaymentStatus.Processing && (
                            <div>
                                <Box my={2} style={{ textAlign: 'center' }}>
                                    <HourglassEmptyRoundedIcon fontSize="large"/>
                                </Box>
                                <Typography variant="body1" align="center">{messages.PaymentInProcessing}</Typography>
                            </div>
                        )}
                        { payment.status === PaymentStatus.Succeeded && (
                            <div>
                                <Box my={2} style={{ textAlign: 'center' }}>
                                    <CheckCircleOutlineRoundedIcon fontSize="large" style={styles.textSuccess}/>
                                </Box>
                                <Typography variant="body1" align="center">{messages.PaymentSucceeded}</Typography>
                            </div>
                        )}
                        { payment.status === PaymentStatus.Canceled && (
                            <div>
                                <Box my={2} style={{ textAlign: 'center' }}>
                                    <HighlightOffIcon fontSize="large" style={styles.textDanger}/>
                                </Box>
                                <Typography variant="body1" align="center">{messages.PaymentCanceled}</Typography>
                            </div>
                        )}
                        {PaymentProvider.Wallee === payment.provider && (payment.status === PaymentStatus.Processing || payment.status === PaymentStatus.Canceled) && (
                            <Fragment>
                                <Box my={2} />
                                <Alert severity="warning">
                                    <AlertTitle>{messages.Warning}</AlertTitle>
                                    <Typography>{messages.WalleePaymentRenewalHint}</Typography>
                                    <Box my={2}/>
                                    <Button size="small" variant="contained" onClick={handleWalleePaymentRenewal} disabled={inProgress}>{messages.WalleePaymentRenewal}</Button>
                                </Alert>
                                <Box my={1} />
                                {walleePaymentRenewalError && (
                                    <Alert severity="error">
                                        {messages.WalleePaymentRenewalError}
                                    </Alert>
                                )}
                            </Fragment>
                        )}

                        {renderCloseButton()}
                    </div>
                )
            )}
            { error && (
                <Box mt={3}>
                    { renderErrorCode(error) }
                </Box>
            )}
        </div>
    )
}