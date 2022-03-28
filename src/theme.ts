import {createTheme} from "@mui/material";

const primaryColor = '#05164d';
const secondaryColor = '#ff6a00';
export const theme = createTheme({
    palette: {
        primary: {
            main: primaryColor
        },
        secondary: {
            main: secondaryColor,
            contrastText: '#FFF'
        }
    },
    typography: {
        // allVariants: {
        //     fontFamily: 'Roboto, sans-serif'
        // },
    },
    components: {
        MuiLink: {
            styleOverrides: {
                root: {
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '0.9em',
                    cursor: 'pointer',
                    color: '#666'
                }
            }
        }
    }
});

export const styles = {
    primaryBg: {
        background: primaryColor
    },
    secondaryBg: {
        background: secondaryColor
    },
    textDanger: {
        color: theme.palette.error.main
    },
    textWarning: {
        color: theme.palette.warning.main
    },
    textSuccess: {
        color: theme.palette.success.main
    },
    paymentTitleIcon: {
        position: 'relative',
        marginRight: theme.spacing(1),
        top: 4
    },
    contentBoxed: {
        minWidth: 360
    },
    contentWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    }
};