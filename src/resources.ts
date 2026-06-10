export enum Language {
    EN = 'en',
    DE = 'de',
    EE = "et",
    PL = "pl",
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
        if (l.substring(0, 2).indexOf(lang) > -1) {
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
        [Language.PL]: "Inicjowanie płatności. Proszę czekać...",
    },
    InvalidPayment: {
        [Language.EN]: "Could not start payment. Please contact support!",
        [Language.DE]: "Fehler beim Starten der Zahlung. Bitte kontaktieren Sie uns.",
        [Language.EE]: "Makseid ei saanud alustada. Palun võtke ühendust klienditoega!",
        [Language.PL]: "Nie udało się rozpocząć płatności. Skontaktuj się z pomocą techniczną!",
    },
    SelectPaymentMethod: {
        [Language.EN]: "Please select a payment method:",
        [Language.DE]: "Bitte wählen Sie eine Zahlungsmethode aus:",
        [Language.EE]: "Palun valige oma makseviis:",
        [Language.PL]: "Wybierz metodę płatności:"
    },
    LoadingPayment: {
        [Language.EN]: "Loading payment. Please wait...",
        [Language.DE]: "Zahlung wird geladen. Bitte warten... ",
        [Language.EE]: "Makse laadimine. Palun oodake...",
        [Language.PL]: "Ładowanie płatności. Proszę czekać...",
    },
    StorePaymentMethodCards: {
        [Language.EN]: "Stored Credit Card",
        [Language.DE]: "Gespeicherte Kreditkarte",
        [Language.EE]: "Salvestatud krediitkaart",
        [Language.PL]: "Zapisana karta kredytowa"
    },
    StorePaymentMethodSepaDirectDebit: {
        [Language.EN]: "Stored SEPA Direct Debit",
        [Language.DE]: "Gespeichertes SEPA-Lastschriftverfahren",
        [Language.EE]: "Salvestatud SEPA otsekorraldus",
        [Language.PL]: "Zapisane polecenie zapłaty SEPA"
    },
    PaymentMethodCards: {
        [Language.EN]: "Credit Card",
        [Language.DE]: "Kreditkarte",
        [Language.EE]: "Krediitkaart",
        [Language.PL]: "Karta kredytowa",
    },
    PaymentMethodCardsDescription: {
        [Language.EN]: "Mastercard, VISA, Diners Club, etc.",
        [Language.DE]: "Mastercard, VISA, Diners Club, usw.",
        [Language.EE]: 'Mastercard, VISA, Diners Club jne.',
        [Language.PL]: "Mastercard, VISA, Diners Club itp."
    },
    PaymentMethodSepaDirectDebit: {
        [Language.EN]: "SEPA Direct Debit",
        [Language.DE]: "SEPA-Lastschriftverfahren",
        [Language.EE]: 'SEPA otsekorraldus',
        [Language.PL]: "Polecenie zapłaty SEPA"
    },
    PaymentMethodSepaDirectDebitDescription: {
        [Language.EN]: "For customers in the Single Euro Payments Area.",
        [Language.DE]: "Für Kunden im einheitlichen Euro-Zahlungsraum.",
        [Language.EE]: 'Ühtse euromaksete piirkonna klientidele.',
        [Language.PL]: "Dla klientów w jednolitym obszarze płatności w euro."
    },
    PaymentMethodBlik: {
        [Language.EN]: "BLIK",
        [Language.DE]: "BLIK",
        [Language.EE]: "BLIK",
        [Language.PL]: "BLIK"
    },
    PaymentMethodBlikDescription: {
        [Language.EN]: "Pay with a BLIK code from your banking app (Poland).",
        [Language.DE]: "Zahlen Sie mit einem BLIK-Code aus Ihrer Banking-App (Polen).",
        [Language.EE]: "Maksa oma pangarakenduse BLIK-koodiga (Poola).",
        [Language.PL]: "Zapłać kodem BLIK z aplikacji bankowej."
    },
    PaymentFormBlikCode: {
        [Language.EN]: "BLIK code (6 digits)",
        [Language.DE]: "BLIK-Code (6 Ziffern)",
        [Language.EE]: "BLIK-kood (6 numbrit)",
        [Language.PL]: "Kod BLIK (6 cyfr)"
    },
    PaymentFormBlikCodeInvalid: {
        [Language.EN]: "Please enter a valid 6-digit BLIK code.",
        [Language.DE]: "Bitte geben Sie einen gültigen 6-stelligen BLIK-Code ein.",
        [Language.EE]: "Palun sisestage kehtiv 6-kohaline BLIK-kood.",
        [Language.PL]: "Wprowadź prawidłowy 6-cyfrowy kod BLIK."
    },
    PaymentFormBlikHint: {
        [Language.EN]: "After submitting, confirm the payment in your banking app.",
        [Language.DE]: "Bestätigen Sie die Zahlung nach dem Absenden in Ihrer Banking-App.",
        [Language.EE]: "Pärast esitamist kinnitage makse oma pangarakenduses.",
        [Language.PL]: "Po zatwierdzeniu potwierdź płatność w aplikacji bankowej."
    },
    PaymentMethodNotSupported: {
        [Language.EN]: "Sorry! We don't support the selected payment method yet. Please try again with a different one.",
        [Language.DE]: "Leider unterstützen wir die gewählte Zahlungsmethode noch nicht. Bitte versuchen Sie es noch einmal mit einer anderen Zahlungsmethode.",
        [Language.EE]: 'Vabandust! Me ei toeta veel teie valitud makseviisi. Palun proovige uuesti teise meetodiga.',
        [Language.PL]: "Przepraszamy! Nie obsługujemy jeszcze wybranej metody płatności. Spróbuj ponownie z inną."
    },
    PaymentFormCardsDescription: {
        [Language.EN]: "Please provide your card information:",
        [Language.DE]: "Bitte geben Sie Ihre Karteninformationen ein:",
        [Language.EE]: 'Palun andke meile oma kaardi andmed:',
        [Language.PL]: "Podaj dane swojej karty:"
    },
    PaymentFormSavePaymentMethod: {
        [Language.EN]: "Save my current payment method for next checkout.",
        [Language.DE]: "Zahlungsmethode für weitere Zahlungen speichern.",
        [Language.EE]: 'Salvesta minu praegune makseviis järgmiseks maksekorraks.',
        [Language.PL]: "Zapisz moją obecną metodę płatności na następny zakup."
    },
    PaymentFormSepaDirectDebitAcceptance: {
        [Language.EN]: "By providing the IBAN and confirming this payment, I authorize/ We authorize (A) %PAYEE% to collect payments from my/our bank account by SEPA Direct Debit. At the same time (B) I/we instruct my/our credit institution to honour the direct debits drawn by %PAYEE% to my/our bank account.",
        [Language.DE]: "Durch Angabe der IBAN und Bestätigung dieser Zahlung, ermächtige/n ich/wir (A) %PAYEE%, Zahlungen von meinem/ unserem Konto mittels Lastschrift einzuziehen. Zugleich (B) weise ich mein/ weisen wir unser Kreditinstitut an, die von %PAYEE% auf mein/ unser Konto gezogenen Lastschriften einzulösen.",
        [Language.EE]: 'IBANi esitades ja seda makset kinnitades volitan/ volitame (A) %PAYEE% koguma makseid minu/meie pangakontolt SEPA otsekorralduse teel. Samal ajal (B) annan/esitame oma krediidiasutusele korralduse täita %PAYEE% poolt minu/meie pangakontole tehtud otsekorraldusi.',
        [Language.PL]: "Podając numer IBAN i potwierdzając tę płatność, upoważniam/upoważniamy (A) %PAYEE% do pobierania płatności z mojego/naszego rachunku bankowego w drodze polecenia zapłaty SEPA. Jednocześnie (B) polecam/polecamy mojej/naszej instytucji kredytowej realizację poleceń zapłaty obciążających mój/nasz rachunek bankowy wystawionych przez %PAYEE%."
    },
    ProcessingPayment: {
        [Language.EN]: "Processing your payment. Please wait...",
        [Language.DE]: "Ihre Zahlung wird bearbeitet. Bitte warten...",
        [Language.EE]: 'Teie makse töötlemine. Palun oodake...',
        [Language.PL]: "Przetwarzanie płatności. Proszę czekać..."
    },
    PaymentCanceled: {
        [Language.EN]: "Payment canceled.",
        [Language.DE]: "Die Zahlung wurde storniert.",
        [Language.EE]: 'Maksmine tühistatud.',
        [Language.PL]: "Płatność anulowana."
    },
    PaymentSucceeded: {
        [Language.EN]: "Payment succeeded. Thank you very much.",
        [Language.DE]: "Zahlung erfolgreich. Vielen Dank.",
        [Language.EE]: 'Maksmine õnnestus. Tänan teid väga.',
        [Language.PL]: "Płatność zakończona sukcesem. Dziękujemy bardzo."
    },
    PaymentInProcessing: {
        [Language.EN]: "Your payment is being processed...",
        [Language.DE]: "Ihre Zahlung wird bearbeitet...",
        [Language.EE]: 'Teie makset töödeldakse...',
        [Language.PL]: "Twoja płatność jest przetwarzana..."
    },
    PaymentFailed: {
        [Language.EN]: "There was a failure when charging your payment method.",
        [Language.DE]: "Bei der Bearbeitung Ihrer Zahlung ist ein Fehler aufgetreten.",
        [Language.EE]: 'Teie makse laadimisel oli ebaõnnestunud katse.',
        [Language.PL]: "Wystąpił błąd podczas obciążania Twojej metody płatności."
    },
    PaypalFailedToLoad: {
        [Language.EN]: "Could not load PayPal payment method. Please try a different method.",
        [Language.DE]: "Leider können wir die Zahlungsmethode PayPal nicht laden. Bitte versuchen Sie eine andere Zahlungsmethode.",
        [Language.EE]: 'Ei saanud laadida PayPal makseviisi. Palun proovige teist meetodit.',
        [Language.PL]: "Nie udało się załadować metody płatności PayPal. Spróbuj innej metody."
    },
    PaypalFailedToCreateOrder: {
        [Language.EN]: 'Could not create order for PayPal payment.',
        [Language.DE]: 'Leider können wir keine Bestellung bei PayPal anlegen.',
        [Language.EE]: 'Ei saanud luua tellimust PayPal-makse jaoks.',
        [Language.PL]: "Nie udało się utworzyć zamówienia dla płatności PayPal."
    },
    PaypalFailedToCaptureOrder: {
        [Language.EN]: 'Could not capture PayPal payment.',
        [Language.DE]: 'Leider konnten wir Ihre PayPal-Zahlung nicht verarbeiten.',
        [Language.EE]: 'PayPal-makseid ei õnnestunud sisestada.',
        [Language.PL]: "Nie udało się zrealizować płatności PayPal."
    },
    Amount: {
        [Language.EN]: "Amount",
        [Language.DE]: "Betrag",
        [Language.EE]: 'Summa',
        [Language.PL]: "Kwota"
    },
    Name: {
        [Language.EN]: "Name",
        [Language.DE]: "Name",
        [Language.EE]: 'Nimi',
        [Language.PL]: "Imię i nazwisko"
    },
    Email: {
        [Language.EN]: "Email Address",
        [Language.DE]: "E-Mail-Adresse",
        [Language.EE]: 'E-posti aadress',
        [Language.PL]: "Adres e-mail"
    },
    Loading: {
        [Language.EN]: "Loading...",
        [Language.DE]: "Laden...",
        [Language.EE]: 'Laadimine...',
        [Language.PL]: "Ładowanie..."
    },
    Finish: {
        [Language.EN]: "Finish",
        [Language.DE]: "Beenden",
        [Language.EE]: 'Lõpeta',
        [Language.PL]: "Zakończ"
    },
    Back: {
        [Language.EN]: "Back",
        [Language.DE]: "Zurück",
        [Language.EE]: 'Tagasi',
        [Language.PL]: "Wstecz"
    },
    Cancel: {
        [Language.EN]: "Cancel",
        [Language.DE]: "Abbrechen",
        [Language.EE]: 'Tühista',
        [Language.PL]: "Anuluj"
    },
    ReturnToMerchant: {
        [Language.EN]: "Return to merchant.",
        [Language.DE]: "Zurück zum Händler.",
        [Language.EE]: 'Tagasi kaupmehe juurde.',
        [Language.PL]: "Powrót do sprzedawcy."
    },
    CancelAndReturnToMerchant: {
        [Language.EN]: "Cancel and return to merchant.",
        [Language.DE]: "Abbrechen und zurück zum Händler.",
        [Language.EE]: 'Tühistage ja tagastage kaupmehele.',
        [Language.PL]: "Anuluj i wróć do sprzedawcy."
    },
    ErrorCodeInvalidPayee: {
        [Language.EN]: 'Payment contains an invalid payee.',
        [Language.DE]: 'Die Zahlung enthält einen ungültigen Zahlungsempfänger.',
        [Language.EE]: 'Makse sisaldab kehtetut makse saajat.',
        [Language.PL]: "Płatność zawiera nieprawidłowego odbiorcę."
    },
    ErrorCodePayeeNotConfiguredForStripe: {
        [Language.EN]: 'Payment methods (Cards) not supported.',
        [Language.DE]: 'Zahlungsmethode (Kreditkarten) wird nicht unterstützt.',
        [Language.EE]: '',
        [Language.PL]: "Metody płatności (karty) nie są obsługiwane."
    },
    ErrorCodePayeeNotConfiguredForPayPal: {
        [Language.EN]: 'Payment method (PayPal) not supported.',
        [Language.DE]: 'Zahlungsmethode (PayPal) wird nicht unterstützt.',
        [Language.EE]: 'Makseviisid (kaardid) ei ole toetatud.',
        [Language.PL]: "Metoda płatności (PayPal) nie jest obsługiwana."
    },
    ErrorCodePayeeRetrieveError: {
        [Language.EN]: 'Payee does not exist.',
        [Language.DE]: 'Zahlungsempfänger existiert nicht.',
        [Language.EE]: 'Makse saaja ei ole olemas.',
        [Language.PL]: "Odbiorca nie istnieje."
    },
    ErrorCodeInvalidPayer: {
        [Language.EN]: 'Invalid payer.',
        [Language.DE]: 'Ungültiger Bezahler.',
        [Language.EE]: 'Invaliidne maksja.',
        [Language.PL]: "Nieprawidłowy płatnik."
    },
    ErrorCodePayerRetrieveError: {
        [Language.EN]: 'Payer does not exist.',
        [Language.DE]: 'Bezahler exisitert nicht.',
        [Language.EE]: 'Maksja ei ole olemas.',
        [Language.PL]: "Płatnik nie istnieje."
    },
    ErrorCodePayerSaveMethodError: {
        [Language.EN]: 'Failed to store payment method.',
        [Language.DE]: 'Die Zahlungsmethode konnte nicht gespeichert werden.',
        [Language.EE]: 'Makseviisi salvestamine ebaõnnestus.',
        [Language.PL]: "Nie udało się zapisać metody płatności."
    },
    ErrorCodeInvalidMinimumAmount: {
        [Language.EN]: 'Payment amount falls below minimum amount.',
        [Language.DE]: 'Der Zahlungsbetrag fällt unter den Mindestbetrag.',
        [Language.EE]: 'Maksesumma jääb alla miinimumsumma.',
        [Language.PL]: "Kwota płatności jest niższa od kwoty minimalnej."
    },
    ErrorCodeInvalidEmail: {
        [Language.EN]: 'Invalid email address. Please check your user data.',
        [Language.DE]: 'Ungültige E-Mail-Adresse. Bitte überprüfen Sie Ihre Benutzerdaten.',
        [Language.EE]: 'Vale e-posti aadress. Palun kontrollige oma kasutajaandmeid.',
        [Language.PL]: "Nieprawidłowy adres e-mail. Sprawdź swoje dane użytkownika."
    },
    ErrorCodePaymentUseStoredMethodError: {
        [Language.EN]: 'Failed to use stored payment method.',
        [Language.DE]: 'Die gespeicherte Zahlungsmethode konnte nicht benutzt werden.',
        [Language.EE]: 'Ei õnnestunud kasutada salvestatud makseviisi.',
        [Language.PL]: "Nie udało się użyć zapisanej metody płatności."
    },
    ErrorCodePaymentRetrieveError: {
        [Language.EN]: 'Payment does not exist.',
        [Language.DE]: 'Zahlung existiert nicht.',
        [Language.EE]: 'Makse ei ole olemas.',
        [Language.PL]: "Płatność nie istnieje."
    },
    ErrorCodePaymentCreationError: {
        [Language.EN]: 'Failed to create payment.',
        [Language.DE]: 'Die Zahlung konnte nicht erstellt werden.',
        [Language.EE]: 'Makset ei õnnestunud luua.',
        [Language.PL]: "Nie udało się utworzyć płatności."
    },
    ErrorCodePaymentCreateStripeMethodError: {
        [Language.EN]: 'Failed to initiate payment (Cards). Please contact support.',
        [Language.DE]: 'Die Zahlung konnte nicht gestartet werden (Kreditkarte). Bitte kontaktieren Sie den Support.',
        [Language.EE]: 'Makset ei õnnestunud algatada (Cards). Palun võtke ühendust klienditoega.',
        [Language.PL]: "Nie udało się zainicjować płatności (karty). Skontaktuj się z pomocą techniczną."
    },
    ErrorCodePaymentCreatePayPalMethodError: {
        [Language.EN]: 'Failed to initiate payment (PayPal). Please contact support.',
        [Language.DE]: 'Die Zahlung konnte nicht gestartet werden (PayPal). Bitte kontaktieren Sie den Support.',
        [Language.EE]: 'Makset ei õnnestunud algatada (PayPal). Palun võtke ühendust klienditoega.',
        [Language.PL]: "Nie udało się zainicjować płatności (PayPal). Skontaktuj się z pomocą techniczną."
    },
    ErrorCodePaymentCapturePayPalError: {
        [Language.EN]: 'Failed to captured PayPal amount. Please contact support.',
        [Language.DE]: 'Die PayPal-Zahlung konnte nicht verarbeitet werden. Bitte kontaktieren Sie den Support.',
        [Language.EE]: 'Ei õnnestunud jäädvustada PayPal summa. Palun võtke ühendust klienditoega.',
        [Language.PL]: "Nie udało się zrealizować kwoty PayPal. Skontaktuj się z pomocą techniczną."
    },
    ErrorCodePaymentCreateWalleeMethodError: {
        [Language.EN]: 'Failed to initiate payment (Wallee). Please contact support.',
        [Language.DE]: 'Die Zahlung konnte nicht gestartet werden (Wallee). Bitte kontaktieren Sie den Support.',
        [Language.EE]: 'Makset ei õnnestunud algatada (Wallee). Palun võtke ühendust klienditoega.',
        [Language.PL]: "Nie udało się zainicjować płatności (Wallee). Skontaktuj się z pomocą techniczną."
    },
    ErrorOccurred: {
        [Language.EN]: "An error occurred. Code:",
        [Language.DE]: "Ein Fehler ist aufgetreten. Code:",
        [Language.EE]: 'Tekkis viga. Kood:',
        [Language.PL]: "Wystąpił błąd. Kod:"
    },
    Warning: {
        [Language.EN]: "Warning",
        [Language.DE]: "Warnung",
        [Language.EE]: 'Hoiatus',
        [Language.PL]: "Ostrzeżenie"
    },
    WalleePaymentRenewal: {
        [Language.EN]: "Restart Payment",
        [Language.DE]: "Zahlung erneut starten",
        [Language.EE]: 'Uuenda makse',
        [Language.PL]: "Uruchom płatność ponownie"
    },
    WalleePaymentRenewalHint: {
        [Language.EN]: 'If you have accidentally close the payment processing page in TWINT or your payment method got rejected, you can use the "Restart Payment" button to retry the payment process again.',
        [Language.DE]: 'Wenn Sie versehentlich die Seite zur Zahlungsabwicklung bei TWINT geschlossen haben oder Ihre Zahlungsmethode abgelehnt wurde, können Sie die Schaltfläche "Zahlung erneut starten" verwenden, um den Zahlungsvorgang erneut zu versuchen.',
        [Language.EE]: 'Kui sulgesite kogemata maksetöötluslehe TWINTis või teie makseviis lükati tagasi, saate makseprotsessi uuesti proovimiseks kasutada nuppu "Uuenda makse".',
        [Language.PL]: 'Jeśli przypadkowo zamknąłeś stronę przetwarzania płatności w TWINT lub Twoja metoda płatności została odrzucona, możesz użyć przycisku "Uruchom płatność ponownie", aby spróbować ponownie.'
    },
    WalleePaymentRenewalError: {
        [Language.EN]: 'Failed to restart payment.',
        [Language.DE]: 'Die Zahlung konnte nicht erneut gestartet werden.',
        [Language.EE]: 'Makse uuendamine ebaõnnestus.',
        [Language.PL]: "Nie udało się ponownie uruchomić płatności."
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
