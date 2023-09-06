export enum Language {
    EN = 'en',
    DE = 'de',
    EE = "et",
}

export type MultiLingualString = {
    [L in Language]?: string;
}

export type ResourceDefinition = {
    [key: string]: MultiLingualString
}

export type LanguageSpecificStrings<D extends ResourceDefinition> = {
    [K in keyof D]: string;
}

export class Resources<D extends ResourceDefinition> {

    public language: Language;
    private readonly map: Map<Language, LanguageSpecificStrings<D>>;

    constructor(private defaultLanguage: Language, definition: D) {
        this.language = defaultLanguage;
        this.map = new Map();

        // create an object with language specific strings per language and store them to our map
        for (let key of Object.keys(definition)) {
            for (let lang of Object.keys(definition[key])) {
                const value = definition[key][lang as Language];
                if (value) {
                    let languageSpecificStrings = this.map.get(lang as Language);
                    if (!languageSpecificStrings) {
                        languageSpecificStrings = {} as LanguageSpecificStrings<D>;
                        this.map.set(lang as Language, languageSpecificStrings);
                    }
                    (languageSpecificStrings[key] as any) = value;
                }
            }
        }
    }

    getStrings() {
        return this.map.get(this.language) || this.map.get(this.defaultLanguage) as LanguageSpecificStrings<D>;
    }

    get supportedLanguages() {
        return [...this.map.keys()];
    }
}

export function getNavigatorLanguages() {
    if (typeof navigator != "undefined") {
        return navigator.languages || [navigator.language || (navigator as any).userLanguage];
    }
}
const language = getNavigatorLanguages()?.map(l => {
    let result: Language|null = null;
    for (let lang of Object.values(Language)) {
        if (l.indexOf(lang) > -1) {
            result = lang;
            break;
        }
    }
    return result;
}).filter(l => l !== null).shift();
export const resources = new Resources(language || Language.DE, {
    InitiatePayment: {
        [Language.EN]: "Initiate payment. Please wait...",
        [Language.DE]: "Zahlung wird vorbereiten. Bitte warten... ",
        [Language.EE]: "Algatage makse. Palun oodake...",
    },
    InvalidPayment: {
        [Language.EN]: "Could not start payment. Please contact support!",
        [Language.DE]: "Fehler beim Starten der Zahlung. Bitte kontaktieren Sie uns.",
        [Language.EE]: "Makseid ei saanud alustada. Palun võtke ühendust klienditoega!",
    },
    SelectPaymentMethod: {
        [Language.EN]: "Please select a payment method:",
        [Language.DE]: "Bitte wählen Sie eine Zahlungsmethode aus:",
        [Language.EE]: "Palun valige oma makseviis:"
    },
    LoadingPayment: {
        [Language.EN]: "Loading payment. Please wait...",
        [Language.DE]: "Zahlung wird geladen. Bitte warten... ",
        [Language.EE]: "Makse laadimine. Palun oodake...",
    },
    StorePaymentMethodCards: {
        [Language.EN]: "Stored Credit Card",
        [Language.DE]: "Gespeicherte Kreditkarte",
        [Language.EE]: "Salvestatud krediitkaart"
    },
    StorePaymentMethodSepaDirectDebit: {
        [Language.EN]: "Stored SEPA Direct Debit",
        [Language.DE]: "Gespeichertes SEPA-Lastschriftverfahren",
        [Language.EE]: "Salvestatud SEPA otsekorraldus"
    },
    PaymentMethodCards: {
        [Language.EN]: "Credit Card",
        [Language.DE]: "Kreditkarte",
        [Language.EE]: "Krediitkaart",
    },
    PaymentMethodCardsDescription: {
        [Language.EN]: "Mastercard, VISA, Diners Club, etc.",
        [Language.DE]: "Mastercard, VISA, Diners Club, usw.",
        [Language.EE]: 'Mastercard, VISA, Diners Club jne.'
    },
    PaymentMethodSepaDirectDebit: {
        [Language.EN]: "SEPA Direct Debit",
        [Language.DE]: "SEPA-Lastschriftverfahren",
        [Language.EE]: 'SEPA otsekorraldus'
    },
    PaymentMethodSepaDirectDebitDescription: {
        [Language.EN]: "For customers in the Single Euro Payments Area.",
        [Language.DE]: "Für Kunden im einheitlichen Euro-Zahlungsraum.",
        [Language.EE]: 'Ühtse euromaksete piirkonna klientidele.'
    },
    PaymentMethodNotSupported: {
        [Language.EN]: "Sorry! We don't support the selected payment method yet. Please try again with a different one.",
        [Language.DE]: "Leider unterstützen wir die gewählte Zahlungsmethode noch nicht. Bitte versuchen Sie es noch einmal mit einer anderen Zahlungsmethode.",
        [Language.EE]: 'Vabandust! Me ei toeta veel teie valitud makseviisi. Palun proovige uuesti teise meetodiga.'
    },
    PaymentFormCardsDescription: {
        [Language.EN]: "Please provide your card information:",
        [Language.DE]: "Bitte geben Sie Ihre Karteninformationen ein:",
        [Language.EE]: 'Palun andke meile oma kaardi andmed:'
    },
    PaymentFormSavePaymentMethod: {
        [Language.EN]: "Save my current payment method for next checkout.",
        [Language.DE]: "Zahlungsmethode für weitere Zahlungen speichern.",
        [Language.EE]: 'Salvesta minu praegune makseviis järgmiseks maksekorraks.'
    },
    PaymentFormSepaDirectDebitAcceptance: {
        [Language.EN]: "By providing the IBAN and confirming this payment, I authorize/ We authorize (A) %PAYEE% to collect payments from my/our bank account by SEPA Direct Debit. At the same time (B) I/we instruct my/our credit institution to honour the direct debits drawn by %PAYEE% to my/our bank account.",
        [Language.DE]: "Durch Angabe der IBAN und Bestätigung dieser Zahlung, ermächtige/n ich/wir (A) %PAYEE%, Zahlungen von meinem/ unserem Konto mittels Lastschrift einzuziehen. Zugleich (B) weise ich mein/ weisen wir unser Kreditinstitut an, die von %PAYEE% auf mein/ unser Konto gezogenen Lastschriften einzulösen.",
        [Language.EE]: 'IBANi esitades ja seda makset kinnitades volitan/ volitame (A) %PAYEE% koguma makseid minu/meie pangakontolt SEPA otsekorralduse teel. Samal ajal (B) annan/esitame oma krediidiasutusele korralduse täita %PAYEE% poolt minu/meie pangakontole tehtud otsekorraldusi.'
    },
    ProcessingPayment: {
        [Language.EN]: "Processing your payment. Please wait...",
        [Language.DE]: "Ihre Zahlung wird bearbeitet. Bitte warten...",
        [Language.EE]: 'Teie makse töötlemine. Palun oodake...'
    },
    PaymentCanceled: {
        [Language.EN]: "Payment canceled.",
        [Language.DE]: "Die Zahlung wurde storniert.",
        [Language.EE]: 'Maksmine tühistatud.'
    },
    PaymentSucceeded: {
        [Language.EN]: "Payment succeeded. Thank you very much.",
        [Language.DE]: "Zahlung erfolgreich. Vielen Dank.",
        [Language.EE]: 'Maksmine õnnestus. Tänan teid väga.'
    },
    PaymentInProcessing: {
        [Language.EN]: "Your payment is being processed...",
        [Language.DE]: "Ihre Zahlung wird bearbeitet...",
        [Language.EE]: 'Teie makset töödeldakse...'
    },
    PaymentFailed: {
        [Language.EN]: "There was a failure when charging your payment method.",
        [Language.DE]: "Bei der Bearbeitung Ihrer Zahlung ist ein Fehler aufgetreten.",
        [Language.EE]: 'Teie makse laadimisel oli ebaõnnestunud katse.'
    },
    PaypalFailedToLoad: {
        [Language.EN]: "Could not load PayPal payment method. Please try a different method.",
        [Language.DE]: "Leider können wir die Zahlungsmethode PayPal nicht laden. Bitte versuchen Sie eine andere Zahlungsmethode.",
        [Language.EE]: 'Ei saanud laadida PayPal makseviisi. Palun proovige teist meetodit.'
    },
    PaypalFailedToCreateOrder: {
        [Language.EN]: 'Could not create order for PayPal payment.',
        [Language.DE]: 'Leider können wir keine Bestellung bei PayPal anlegen.',
        [Language.EE]: 'Ei saanud luua tellimust PayPal-makse jaoks.'
    },
    PaypalFailedToCaptureOrder: {
        [Language.EN]: 'Could not capture PayPal payment.',
        [Language.DE]: 'Leider konnten wir Ihre PayPal-Zahlung nicht verarbeiten.',
        [Language.EE]: 'PayPal-makseid ei õnnestunud sisestada.'
    },
    Amount: {
        [Language.EN]: "Amount",
        [Language.DE]: "Betrag",
        [Language.EE]: 'Summa'
    },
    Name: {
        [Language.EN]: "Name",
        [Language.DE]: "Name",
        [Language.EE]: 'Nimi'
    },
    Email: {
        [Language.EN]: "Email Address",
        [Language.DE]: "E-Mail-Adresse",
        [Language.EE]: 'E-posti aadress'
    },
    Loading: {
        [Language.EN]: "Loading...",
        [Language.DE]: "Laden...",
        [Language.EE]: 'Laadimine...'
    },
    Finish: {
        [Language.EN]: "Finish",
        [Language.DE]: "Beenden",
        [Language.EE]: 'Lõpeta'
    },
    Back: {
        [Language.EN]: "Back",
        [Language.DE]: "Zurück",
        [Language.EE]: 'Tagasi'
    },
    Cancel: {
        [Language.EN]: "Cancel",
        [Language.DE]: "Abbrechen",
        [Language.EE]: 'Tühista'
    },
    ReturnToMerchant: {
        [Language.EN]: "Return to merchant.",
        [Language.DE]: "Zurück zum Händler.",
        [Language.EE]: 'Tagasi kaupmehe juurde.'
    },
    CancelAndReturnToMerchant: {
        [Language.EN]: "Cancel and return to merchant.",
        [Language.DE]: "Abbrechen und zurück zum Händler.",
        [Language.EE]: 'Tühistage ja tagastage kaupmehele.'
    },
    ErrorCodeInvalidPayee: {
        [Language.EN]: 'Payment contains an invalid payee.',
        [Language.DE]: 'Die Zahlung enthält einen ungültigen Zahlungsempfänger.',
        [Language.EE]: 'Makse sisaldab kehtetut makse saajat.'
    },
    ErrorCodePayeeNotConfiguredForStripe: {
        [Language.EN]: 'Payment methods (Cards) not supported.',
        [Language.DE]: 'Zahlungsmethode (Kreditkarten) wird nicht unterstützt.',
        [Language.EE]: ''
    },
    ErrorCodePayeeNotConfiguredForPayPal: {
        [Language.EN]: 'Payment method (PayPal) not supported.',
        [Language.DE]: 'Zahlungsmethode (PayPal) wird nicht unterstützt.',
        [Language.EE]: 'Makseviisid (kaardid) ei ole toetatud.'
    },
    ErrorCodePayeeRetrieveError: {
        [Language.EN]: 'Payee does not exist.',
        [Language.DE]: 'Zahlungsempfänger existiert nicht.',
        [Language.EE]: 'Makse saaja ei ole olemas.'
    },
    ErrorCodeInvalidPayer: {
        [Language.EN]: 'Invalid payer.',
        [Language.DE]: 'Ungültiger Bezahler.',
        [Language.EE]: 'Invaliidne maksja.'
    },
    ErrorCodePayerRetrieveError: {
        [Language.EN]: 'Payer does not exist.',
        [Language.DE]: 'Bezahler exisitert nicht.',
        [Language.EE]: 'Maksja ei ole olemas.'
    },
    ErrorCodePayerSaveMethodError: {
        [Language.EN]: 'Failed to store payment method.',
        [Language.DE]: 'Die Zahlungsmethode konnte nicht gespeichert werden.',
        [Language.EE]: 'Makseviisi salvestamine ebaõnnestus.'
    },
    ErrorCodeInvalidMinimumAmount: {
        [Language.EN]: 'Payment amount falls below minimum amount.',
        [Language.DE]: 'Der Zahlungsbetrag fällt unter den Mindestbetrag.',
        [Language.EE]: 'Maksesumma jääb alla miinimumsumma.'
    },
    ErrorCodeInvalidEmail: {
        [Language.EN]: 'Invalid email address. Please check your user data.',
        [Language.DE]: 'Ungültige E-Mail-Adresse. Bitte überprüfen Sie Ihre Benutzerdaten.',
        [Language.EE]: 'Vale e-posti aadress. Palun kontrollige oma kasutajaandmeid.'
    },
    ErrorCodePaymentUseStoredMethodError: {
        [Language.EN]: 'Failed to use stored payment method.',
        [Language.DE]: 'Die gespeicherte Zahlungsmethode konnte nicht benutzt werden.',
        [Language.EE]: 'Ei õnnestunud kasutada salvestatud makseviisi.'
    },
    ErrorCodePaymentRetrieveError: {
        [Language.EN]: 'Payment does not exist.',
        [Language.DE]: 'Zahlung existiert nicht.',
        [Language.EE]: 'Makse ei ole olemas.'
    },
    ErrorCodePaymentCreationError: {
        [Language.EN]: 'Failed to create payment.',
        [Language.DE]: 'Die Zahlung konnte nicht erstellt werden.',
        [Language.EE]: 'Makset ei õnnestunud luua.'
    },
    ErrorCodePaymentCreateStripeMethodError: {
        [Language.EN]: 'Failed to initiate payment (Cards). Please contact support.',
        [Language.DE]: 'Die Zahlung konnte nicht gestartet werden (Kreditkarte). Bitte kontaktieren Sie den Support.',
        [Language.EE]: 'Makset ei õnnestunud algatada (Cards). Palun võtke ühendust klienditoega.'
    },
    ErrorCodePaymentCreatePayPalMethodError: {
        [Language.EN]: 'Failed to initiate payment (PayPal). Please contact support.',
        [Language.DE]: 'Die Zahlung konnte nicht gestartet werden (PayPal). Bitte kontaktieren Sie den Support.',
        [Language.EE]: 'Makset ei õnnestunud algatada (PayPal). Palun võtke ühendust klienditoega.'
    },
    ErrorCodePaymentCapturePayPalError: {
        [Language.EN]: 'Failed to captured PayPal amount. Please contact support.',
        [Language.DE]: 'Die PayPal-Zahlung konnte nicht verarbeitet werden. Bitte kontaktieren Sie den Support.',
        [Language.EE]: 'Ei õnnestunud jäädvustada PayPal summa. Palun võtke ühendust klienditoega.'
    },
    ErrorCodePaymentCreateWalleeMethodError: {
        [Language.EN]: 'Failed to initiate payment (Wallee). Please contact support.',
        [Language.DE]: 'Die Zahlung konnte nicht gestartet werden (Wallee). Bitte kontaktieren Sie den Support.',
        [Language.EE]: 'Makset ei õnnestunud algatada (Wallee). Palun võtke ühendust klienditoega.'
    },
    ErrorOccurred: {
        [Language.EN]: "An error occurred. Code:",
        [Language.DE]: "Ein Fehler ist aufgetreten. Code:",
        [Language.EE]: 'Tekkis viga. Kood:'
    },
    Warning: {
        [Language.EN]: "Warning",
        [Language.DE]: "Warnung",
        [Language.EE]: 'Hoiatus'
    },
    WalleePaymentRenewal: {
        [Language.EN]: "Restart Payment",
        [Language.DE]: "Zahlung erneut starten",
        [Language.EE]: 'Uuenda makse'
    },
    WalleePaymentRenewalHint: {
        [Language.EN]: 'If you have accidentally close the payment processing page in TWINT or your payment method got rejected, you can use the "Restart Payment" button to retry the payment process again.',
        [Language.DE]: 'Wenn Sie versehentlich die Seite zur Zahlungsabwicklung bei TWINT geschlossen haben oder Ihre Zahlungsmethode abgelehnt wurde, können Sie die Schaltfläche "Zahlung erneut starten" verwenden, um den Zahlungsvorgang erneut zu versuchen.',
        [Language.EE]: 'Kui sulgesite kogemata maksetöötluslehe TWINTis või teie makseviis lükati tagasi, saate makseprotsessi uuesti proovimiseks kasutada nuppu "Uuenda makse".'
    },
    WalleePaymentRenewalError: {
        [Language.EN]: 'Failed to restart payment.',
        [Language.DE]: 'Die Zahlung konnte nicht erneut gestartet werden.',
        [Language.EE]: 'Makse uuendamine ebaõnnestus.'
    }
});

// try to push preferred user language
const languages = navigator.languages || [navigator.language || (navigator as any).userLanguage];
for (let language of languages) {
    const langCode = language.substr(0, 2);
    const index = resources.supportedLanguages.indexOf(langCode as Language);
    if (index >= 0) {
        resources.language = resources.supportedLanguages[index];
        break;
    }
}