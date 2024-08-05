import React, {Fragment, useEffect, useState} from "react";
import {env, fetchWalleeLightboxUrl} from "../request";
import {Alert, Typography} from "@mui/material";
import {resources} from "../resources";

export function WalleePayment({onLoaded}: { onLoaded: (active: boolean) => void }) {
    const [error, setError] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            console.log('awaiting loading lightbox library...');
            if (window['LightboxCheckoutHandler']) {
                console.log('Found lightbox library');
                window['LightboxCheckoutHandler'].startPayment(1, () => {
                    setError(true);
                    onLoaded(false);
                });
                onLoaded(true);
                clearInterval(interval);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [])

    useEffect(() => {
        const url = window.location.href;
        fetchWalleeLightboxUrl(env.paymentId, url, url, resources.language)
            .then(({lightBoxUrl}) => {
                if (lightBoxUrl) {
                    console.log('Wallee lightbox URL', lightBoxUrl);
                    const script = document.createElement('script');
                    script.src = lightBoxUrl;
                    document.getElementsByTagName('head').item(0)!.append(script);
                }
            })
            .catch(err => {
                console.error('Failed to fetch Wallee lightbox url', err);
                setError(true);
            });
    }, [])

    const messages = resources.getStrings();
    return (
        <Fragment>
            {!error && <Typography variant="body1" align="center">{messages.LoadingPayment}</Typography>}
            {error && <Alert severity="error">{messages.ErrorCodePaymentCreateWalleeMethodError}</Alert>}
        </Fragment>
    )
}