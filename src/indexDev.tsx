import * as React from "react";
import * as ReactDOM from "react-dom";
import {Button} from "@mui/material";
import {PaymentFlow} from "./PaymentFlow";

const getQueryParams = (params) => {
    // @ts-ignore
    let href = window.location.href;
    let reg = new RegExp( '[?&]' + params + '=([^&#]*)', 'i' );
    let queryString = reg.exec(href);
    return queryString ? queryString[1] : null;
};

const AppView = function(_props) {
    const [open, setOpen] = React.useState(false);
    const toggleOpen = () => setOpen(!open);
    const paymentId = getQueryParams('paymentId') || '';
    return (
        <div>
            <Button color="primary" onClick={toggleOpen}>Show payment</Button>
            { open && (
                <PaymentFlow paymentId={paymentId}
                             onClose={toggleOpen}
                             onError={(e) => console.error('PAYMENT ERROR', e)}
                             onProcessing={() => console.log('PAYMENT IN PROCESSING')}
                             onSucceeded={() => console.log('PAYMENT SUCCEEDED!')}
                             language={"de-CH"}
                             live={false}
                />
            )}

        </div>
    );
};

// @ts-ignore
const appView = document.getElementById('content');
if (appView) {
    ReactDOM.render(<AppView/>, appView);
}