import React, {Fragment, useState} from "react";
import {resources} from "../resources";
import {Alert, Button, Typography} from "@mui/material";
import {useAsync} from "react-async-hook";
import {env, fetchCPayPaymentData} from "../request";

export function CPayPayment() {
    const {result, error, loading} = useAsync(async () => {
        const url = window.location.href;
        return fetchCPayPaymentData(env.paymentId, url);
    }, [])

    const messages = resources.getStrings();
    return (
        <Fragment>
            {loading && <Typography variant="body1" align="center">{messages.LoadingPayment}</Typography>}
            {result && (
                <form action={result.url} method="post" style={{ flexGrow: 1 }}>
                    {Object.entries(result.params).map(([key, value]) => (
                        <input key={key} type="hidden" name={key} value={value} />
                    ))}
                    <input type="hidden" name="CheckSumHeader" value={result.checksumHeader} />
                    <input type="hidden" name="CheckSum" value={result.checksum} />
                    <input type="hidden" name="xml_id" value={result.xml_id} />
                    <Button fullWidth type="submit" variant="contained" color="primary" disableElevation>Pay</Button>
                </form>
            )}
            {error && <Alert severity="error">{messages.ErrorCodePaymentCreateWalleeMethodError}</Alert>}
        </Fragment>
    )
}