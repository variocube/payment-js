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
        [Language.DE]: "Fehler beim starten der Zahlung. Bitte kontaktieren Sie uns.",
        [Language.EE]: "Makseid ei saanud alustada. Palun võtke ühendust klienditoega!",
    },
    SelectPaymentMethod: {
        [Language.EN]: "Please select your payment method:",
        [Language.DE]: "Bitte wählen Sie Ihre Zahlungsmethode aus:",
        [Language.EE]: "Palun valige oma makseviis:"
    },
    LoadingPayment: {
        [Language.EN]: "Loading payment. Please wait...",
        [Language.DE]: "Zahlung wird gelädt. Bitte warten... ",
        [Language.EE]: "Makse laadimine. Palun oodake...",
    },
    StorePaymentMethodCards: {
        [Language.EN]: "Stored Credit Card",
        [Language.DE]: "Gespeicherte Kreditkarte",
        [Language.EE]: "Salvestatud krediitkaart"
    },
    StorePaymentMethodSepaDirectDebit: {
        [Language.EN]: "Stored SEPA Direct Debit",
        [Language.DE]: "Gespeicherte SEPA-Lastschriftverfahren",
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
        [Language.EN]: "Sorry! We don't support your selected payment method yet. Please try again with a different one.",
        [Language.DE]: "Leider unterstützen wir Ihre gewählte Zahlungsmethode noch nicht. Bitte versuchen Sie noch einmal mit einer andere Zahlungsmethode.",
        [Language.EE]: 'Vabandust! Me ei toeta veel teie valitud makseviisi. Palun proovige uuesti teise meetodiga.'
    },
    PaymentFormCardsDescription: {
        [Language.EN]: "Please provider us your card information:",
        [Language.DE]: "Bitte geben Sie uns Ihre Karteninformationen:",
        [Language.EE]: 'Palun andke meile oma kaardi andmed:'
    },
    PaymentFormSavePaymentMethod: {
        [Language.EN]: "Save my current payment method for next checkout.",
        [Language.DE]: "Bitte meine Zahlungsmethode speichern für die nächsten Zahlungen.",
        [Language.EE]: 'Salvesta minu praegune makseviis järgmiseks maksekorraks.'
    },
    PaymentFormSepaDirectDebitAcceptance: {
        [Language.EN]: "By providing the IBAN and confirming this payment, I authorize/ We authorize (A) %PAYEE% to collect payments from my/our bank account by SEPA Direct Debit. At the same time (B) I/we instruct my/our credit institution to honour the direct debits drawn by %PAYEE% to my/our bank account.",
        [Language.DE]: "Durch Angabe der IBAN und Bestätigung dieser Zahlung, ich ermächtige/ Wir ermächtigen (A) %PAYEE%, Zahlungen von meinem/ unserem Konto mittels Lastschrift einzuziehen. Zugleich (B) weise ich mein/ weisen wir unser Kreditinstitut an, die von %PAYEE% auf mein/ unser Konto gezogenen Lastschriften einzulösen.",
        [Language.EE]: 'IBANi esitades ja seda makset kinnitades volitan/ volitame (A) %PAYEE% koguma makseid minu/meie pangakontolt SEPA otsekorralduse teel. Samal ajal (B) annan/esitame oma krediidiasutusele korralduse täita %PAYEE% poolt minu/meie pangakontole tehtud otsekorraldusi.'
    },
    ProcessingPayment: {
        [Language.EN]: "Processing your payment. Please wait...",
        [Language.DE]: "Ihrer Zahlung wird bearbeiten. Bitte warten...",
        [Language.EE]: 'Teie makse töötlemine. Palun oodake...'
    },
    PaymentCanceled: {
        [Language.EN]: "Payment canceled.",
        [Language.DE]: "Die Zahlung wurde storniert.",
        [Language.EE]: 'Maksmine tühistatud.'
    },
    PaymentSucceeded: {
        [Language.EN]: "Payment succeeded. Thank you very much.",
        [Language.DE]: "Zahlung erfolgt. Vielen Dank.",
        [Language.EE]: 'Maksmine õnnestus. Tänan teid väga.'
    },
    PaymentInProcessing: {
        [Language.EN]: "Your payment is being processed...",
        [Language.DE]: "Ihre Zahlung wird bearbeitet...",
        [Language.EE]: 'Teie makset töödeldakse...'
    },
    PaymentFailed: {
        [Language.EN]: "There was a fail attempt when charging your payment.",
        [Language.DE]: "Es gab einen Fehlversuch bei der Bearbeitung Ihrer Zahlung.",
        [Language.EE]: 'Teie makse laadimisel oli ebaõnnestunud katse.'
    },
    PaypalFailedToLoad: {
        [Language.EN]: "Could not load PayPal payment method. Please try a different method.",
        [Language.DE]: "Leider können wir die PayPal-Zahlungsmethode nicht laden. Bitte versuchen Sie eine andere Methode.",
        [Language.EE]: 'Ei saanud laadida PayPal makseviisi. Palun proovige teist meetodit.'
    },
    PaypalFailedToCreateOrder: {
        [Language.EN]: 'Could not create order for PayPal payment.',
        [Language.DE]: 'Leider können wir keine Bestellung mit PayPal-Zahlung erstellen.',
        [Language.EE]: 'Ei saanud luua tellimust PayPal-makse jaoks.'
    },
    PaypalFailedToCaptureOrder: {
        [Language.EN]: 'Could not capture PayPal payment.',
        [Language.DE]: 'Leider können wir Ihre PayPal-Zahlung nicht bearbeiten.',
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
        [Language.DE]: "Abrechen",
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
        [Language.DE]: 'Zahlungsmethoden (Cards) werden nicht unterstützt.',
        [Language.EE]: ''
    },
    ErrorCodePayeeNotConfiguredForPayPal: {
        [Language.EN]: 'Payment method (PayPal) not supported.',
        [Language.DE]: 'Zahlungsmethode (PayPal) wird nicht unterstützt.',
        [Language.EE]: 'Makseviisid (kaardid) ei ole toetatud.'
    },
    ErrorCodePayeeRetrieveError: {
        [Language.EN]: 'Payee not existed.',
        [Language.DE]: 'Zahlungsempfänger nicht existiert.',
        [Language.EE]: 'Makse saaja ei ole olemas.'
    },
    ErrorCodeInvalidPayer: {
        [Language.EN]: 'Invalid payer.',
        [Language.DE]: 'Ungültiger Zahler.',
        [Language.EE]: 'Invaliidne maksja.'
    },
    ErrorCodePayerRetrieveError: {
        [Language.EN]: 'Payer not existed.',
        [Language.DE]: 'Zahler nicht existiert.',
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
        [Language.DE]: 'Die gespeicherte Zahlungsmethode konnte nicht verwendet werden.',
        [Language.EE]: 'Ei õnnestunud kasutada salvestatud makseviisi.'
    },
    ErrorCodePaymentRetrieveError: {
        [Language.EN]: 'Payment not existed.',
        [Language.DE]: 'Zahlung nicht existiert.',
        [Language.EE]: 'Makse ei ole olemas.'
    },
    ErrorCodePaymentCreationError: {
        [Language.EN]: 'Failed to create payment.',
        [Language.DE]: 'Die Zahlung konnte nicht erstellt werden.',
        [Language.EE]: 'Makset ei õnnestunud luua.'
    },
    ErrorCodePaymentCreateStripeMethodError: {
        [Language.EN]: 'Failed to initiate payment (Cards). Please contact support.',
        [Language.DE]: 'Die Zahlung könnte nicht starten (Cards). Bitte kontaktieren Sie den Support.',
        [Language.EE]: 'Makset ei õnnestunud algatada (Cards). Palun võtke ühendust klienditoega.'
    },
    ErrorCodePaymentCreatePayPalMethodError: {
        [Language.EN]: 'Failed to initiate payment (PayPal). Please contact support.',
        [Language.DE]: 'Die Zahlung könnte nicht starten (PayPal). Bitte kontaktieren Sie den Support.',
        [Language.EE]: 'Makset ei õnnestunud algatada (PayPal). Palun võtke ühendust klienditoega.'
    },
    ErrorCodePaymentCapturePayPalError: {
        [Language.EN]: 'Failed to captured PayPal amount. Please contact support.',
        [Language.DE]: 'Der PayPal-Betrag konnte nicht erfasst werden. Bitte kontaktieren Sie den Support.',
        [Language.EE]: 'Ei õnnestunud jäädvustada PayPal summa. Palun võtke ühendust klienditoega.'
    },
    ErrorCodePaymentCreateWalleeMethodError: {
        [Language.EN]: 'Failed to initiate payment (Wallee). Please contact support.',
        [Language.DE]: 'Die Zahlung könnte nicht starten (Wallee). Bitte kontaktieren Sie den Support.',
        [Language.EE]: 'Makset ei õnnestunud algatada (Wallee). Palun võtke ühendust klienditoega.'
    },
    ErrorOccurred: {
        [Language.EN]: "An error occurred. Code:",
        [Language.DE]: "Ein Fehler ist aufgetreten. Code:",
        [Language.EE]: 'Tekkis viga. Kood:'
    },
    TwintPaymentRenewal: {
        [Language.EN]: "Renew TWINT Payment",
        [Language.DE]: "TWINT-Zahlung erneuern",
        [Language.EE]: 'TWINT makse uuendamine'
    },
    TwintPaymentRenewalNote: {
        [Language.EN]: "For TWINT Payment Only",
        [Language.DE]: "Nur für TWINT-Zahlung",
        [Language.EE]: 'Ainult TWINT-maksete puhul'
    },
    TwintPaymentRenewalHint: {
        [Language.EN]: 'If you have accidentally close the payment processing page in TWINT. You can use the "Renew TWINT Payment" button to retry the payment process again.',
        [Language.DE]: 'Wenn Sie versehentlich die Seite für die Zahlungsabwicklung in TWINT geschlossen haben. Sie können auf "TWINT-Zahlung erneuern" klicken, um den Zahlungsvorgang erneut zu versuchen.',
        [Language.EE]: 'Kui olete kogemata sulgenud makse töötlemise lehe TWINT. Võite kasutada nuppu "TWINT makse uuendamine", et uuesti proovida makseprotsessi.'
    },
    TwintPaymentRenewalError: {
        [Language.EN]: 'Failed to renew TWINT payment.',
        [Language.DE]: 'Die TWINT-Zahlung wurde nicht verlängert.',
        [Language.EE]: 'TWINT-makse uuendamine ebaõnnestus.'
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