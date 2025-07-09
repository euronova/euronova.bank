// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import createMemoryStore from "memorystore";

// server/email.ts
import axios from "axios";
var emailTranslations = {
  fr: {
    // Général
    appName: "EuroNova",
    tagline: "Votre partenaire bancaire",
    buttonAccessAccount: "Acc\xE9der \xE0 mon compte",
    buttonContactSupport: "Contacter le support",
    footerAutomatedMsg: "Ce message est automatique, merci de ne pas y r\xE9pondre.",
    allRightsReserved: "Tous droits r\xE9serv\xE9s.",
    greeting: (firstName, lastName) => `Cher(e) <strong>${firstName} ${lastName}</strong>,`,
    // Transaction
    transactionNotification: "Notification de transaction",
    transactionCredit: "Cr\xE9dit",
    transactionDebit: "D\xE9bit",
    transactionInfo: "Nous vous informons qu'une transaction a \xE9t\xE9 effectu\xE9e sur votre compte.",
    transactionWarning: "Si vous n'\xEAtes pas \xE0 l'origine de cette transaction, veuillez contacter imm\xE9diatement notre service client.",
    transactionType: "Type:",
    transactionAmount: "Montant:",
    transactionDate: "Date:",
    transactionDescription: "Description:",
    noDescription: "Aucune description",
    dateNotAvailable: "Date non disponible",
    currentBalance: "Votre solde actuel est de",
    // Reminders
    paymentReminder: "Rappel de paiement",
    stepPaymentRequired: "Un paiement est requis pour avancer dans votre processus de v\xE9rification.",
    currentStep: "\xC9tape actuelle:",
    amountDue: "Montant d\xFB:",
    paymentInstructions: "Veuillez effectuer un virement bancaire avec les d\xE9tails suivants:",
    beneficiaryName: "Nom du b\xE9n\xE9ficiaire:",
    accountNumber: "Num\xE9ro de compte:",
    paymentReference: "R\xE9f\xE9rence:",
    paymentHelp: "Apr\xE8s avoir effectu\xE9 le paiement, veuillez nous envoyer une preuve de paiement pour acc\xE9l\xE9rer la validation.",
    // Status
    accountStatus: "Statut du compte",
    accountActivated: "Compte activ\xE9",
    accountDeactivated: "Compte d\xE9sactiv\xE9",
    accountActivatedMessage: "Vous pouvez maintenant profiter de tous les services d'EuroNova.",
    accountDeactivatedMessage: "Pour plus d'informations ou pour r\xE9activer votre compte, veuillez contacter notre service client.",
    accountStatusUpdate: "Mise \xE0 jour du statut de votre compte",
    accountActivationMsg: "Nous avons le plaisir de vous informer que votre compte a \xE9t\xE9 activ\xE9. Vous pouvez maintenant acc\xE9der \xE0 toutes les fonctionnalit\xE9s de notre plateforme.",
    accountDeactivationMsg: "Nous sommes au regret de vous informer que votre compte a \xE9t\xE9 d\xE9sactiv\xE9. Veuillez contacter notre service client pour plus d'informations.",
    // Welcome
    welcomeTitle: "Bienvenue chez EuroNova",
    welcomeSubject: "Vos informations confidentielles",
    welcomeMessage: "Bienvenue chez EuroNova ! Nous sommes ravis de vous compter parmi nos clients.",
    trustedBankingPartner: "Votre partenaire bancaire de confiance",
    accountCreated: "Votre compte a \xE9t\xE9 cr\xE9\xE9 avec succ\xE8s! Voici vos informations d'identification :",
    accessCredentials: "Voici vos identifiants d'acc\xE8s:",
    clientIdLabel: "ID Client :",
    passwordLabel: "Mot de passe :",
    accountNumberLabel: "RIB :",
    cardInfoLabel: "Informations de carte bancaire :",
    cardNumberLabel: "Num\xE9ro de carte :",
    cardExpiryDateLabel: "Date d'expiration :",
    cardCvvLabel: "CVV :",
    securityWarning: "Conservez ces informations pr\xE9cieusement et ne les partagez avec personne.",
    loginInvite: "Vous pouvez d\xE8s maintenant vous connecter \xE0 votre espace client pour d\xE9couvrir nos services.",
    confidentialInfo: "Ce message contient des informations confidentielles. Merci de ne pas y r\xE9pondre."
  },
  en: {
    // General
    appName: "EuroNova",
    tagline: "Your banking partner",
    buttonAccessAccount: "Access my account",
    buttonContactSupport: "Contact Support",
    footerAutomatedMsg: "This is an automated message, please do not reply.",
    allRightsReserved: "All rights reserved.",
    greeting: (firstName, lastName) => `Dear <strong>${firstName} ${lastName}</strong>,`,
    // Transaction
    transactionNotification: "Transaction Notification",
    transactionCredit: "Credit",
    transactionDebit: "Debit",
    transactionInfo: "We inform you that a transaction has been made on your account.",
    transactionWarning: "If you did not initiate this transaction, please contact our customer service immediately.",
    transactionType: "Type:",
    transactionAmount: "Amount:",
    transactionDate: "Date:",
    transactionDescription: "Description:",
    noDescription: "No description",
    dateNotAvailable: "Date not available",
    currentBalance: "Your current balance is",
    // Reminders
    paymentReminder: "Payment Reminder",
    stepPaymentRequired: "A payment is required to proceed with your verification process.",
    currentStep: "Current step:",
    amountDue: "Amount due:",
    paymentInstructions: "Please make a bank transfer with the following details:",
    beneficiaryName: "Beneficiary name:",
    accountNumber: "Account number:",
    paymentReference: "Reference:",
    paymentHelp: "After making the payment, please send us proof of payment to expedite the validation.",
    // Status
    accountStatus: "Account Status",
    accountActivated: "Account Activated",
    accountDeactivated: "Account Deactivated",
    accountActivatedMessage: "You can now enjoy all EuroNova services.",
    accountDeactivatedMessage: "For more information or to reactivate your account, please contact our customer service.",
    accountStatusUpdate: "Account Status Update",
    accountActivationMsg: "We are pleased to inform you that your account has been activated. You can now access all the features of our platform.",
    accountDeactivationMsg: "We regret to inform you that your account has been deactivated. Please contact our customer service for more information.",
    // Welcome
    welcomeTitle: "Welcome to EuroNova",
    welcomeSubject: "Your confidential information",
    welcomeMessage: "Welcome to EuroNova! We are delighted to have you as our customer.",
    trustedBankingPartner: "Your trusted banking partner",
    accountCreated: "Your account has been successfully created. Here is your identification information:",
    accessCredentials: "Here are your access credentials:",
    clientIdLabel: "Client ID:",
    passwordLabel: "Password:",
    accountNumberLabel: "Account Number:",
    cardInfoLabel: "Bank card information:",
    cardNumberLabel: "Card number:",
    cardExpiryDateLabel: "Expiry date:",
    cardCvvLabel: "CVV:",
    securityWarning: "Keep this information confidential and do not share it with anyone.",
    loginInvite: "You can now log in to your client area to discover our services.",
    confidentialInfo: "This message contains confidential information. Please do not reply."
  },
  es: {
    // General
    appName: "EuroNova",
    tagline: "Su socio bancario",
    buttonAccessAccount: "Acceder a mi cuenta",
    buttonContactSupport: "Contactar con soporte",
    footerAutomatedMsg: "Este es un mensaje autom\xE1tico, por favor no responda.",
    allRightsReserved: "Todos los derechos reservados.",
    greeting: (firstName, lastName) => `Estimado/a <strong>${firstName} ${lastName}</strong>,`,
    // Transaction
    transactionNotification: "Notificaci\xF3n de transacci\xF3n",
    transactionCredit: "Cr\xE9dito",
    transactionDebit: "D\xE9bito",
    transactionInfo: "Le informamos que se ha realizado una transacci\xF3n en su cuenta.",
    transactionWarning: "Si no inici\xF3 esta transacci\xF3n, p\xF3ngase en contacto con nuestro servicio de atenci\xF3n al cliente inmediatamente.",
    transactionType: "Tipo:",
    transactionAmount: "Importe:",
    transactionDate: "Fecha:",
    transactionDescription: "Descripci\xF3n:",
    noDescription: "Sin descripci\xF3n",
    dateNotAvailable: "Fecha no disponible",
    currentBalance: "Su saldo actual es",
    // Reminders
    paymentReminder: "Recordatorio de pago",
    stepPaymentRequired: "Se requiere un pago para continuar con su proceso de verificaci\xF3n.",
    currentStep: "Paso actual:",
    amountDue: "Importe a pagar:",
    paymentInstructions: "Por favor, realice una transferencia bancaria con los siguientes detalles:",
    beneficiaryName: "Nombre del beneficiario:",
    accountNumber: "N\xFAmero de cuenta:",
    paymentReference: "Referencia:",
    paymentHelp: "Despu\xE9s de realizar el pago, env\xEDenos un comprobante para acelerar la validaci\xF3n.",
    // Status
    accountStatus: "Estado de la cuenta",
    accountActivated: "Cuenta activada",
    accountDeactivated: "Cuenta desactivada",
    accountActivatedMessage: "Ahora puede disfrutar de todos los servicios de EuroNova.",
    accountDeactivatedMessage: "Para m\xE1s informaci\xF3n o para reactivar su cuenta, p\xF3ngase en contacto con nuestro servicio de atenci\xF3n al cliente.",
    accountStatusUpdate: "Actualizaci\xF3n del estado de la cuenta",
    accountActivationMsg: "Nos complace informarle que su cuenta ha sido activada. Ahora puede acceder a todas las funciones de nuestra plataforma.",
    accountDeactivationMsg: "Lamentamos informarle que su cuenta ha sido desactivada. Contacte con nuestro servicio de atenci\xF3n al cliente para m\xE1s informaci\xF3n.",
    // Welcome
    welcomeTitle: "Bienvenido a EuroNova",
    welcomeSubject: "Su informaci\xF3n confidencial",
    welcomeMessage: "Bienvenido a EuroNova! Estamos encantados de tenerle como cliente.",
    trustedBankingPartner: "Su socio bancario de confianza",
    accountCreated: "\xA1Su cuenta ha sido creada con \xE9xito! Aqu\xED est\xE1 su informaci\xF3n de identificaci\xF3n:",
    accessCredentials: "Aqu\xED est\xE1n sus credenciales de acceso:",
    clientIdLabel: "ID de cliente:",
    passwordLabel: "Contrase\xF1a:",
    accountNumberLabel: "N\xFAmero de cuenta:",
    cardInfoLabel: "Informaci\xF3n de la tarjeta bancaria:",
    cardNumberLabel: "N\xFAmero de tarjeta:",
    cardExpiryDateLabel: "Fecha de caducidad:",
    cardCvvLabel: "CVV:",
    securityWarning: "Mantenga esta informaci\xF3n confidencial y no la comparta con nadie.",
    loginInvite: "Ahora puede iniciar sesi\xF3n en su \xE1rea de cliente para descubrir nuestros servicios.",
    confidentialInfo: "Este mensaje contiene informaci\xF3n confidencial. Por favor, no responda."
  },
  de: {
    // General
    appName: "EuroNova",
    tagline: "Ihr Bankpartner",
    buttonAccessAccount: "Auf mein Konto zugreifen",
    buttonContactSupport: "Support kontaktieren",
    footerAutomatedMsg: "Dies ist eine automatische Nachricht, bitte antworten Sie nicht.",
    allRightsReserved: "Alle Rechte vorbehalten.",
    greeting: (firstName, lastName) => `Liebe/r <strong>${firstName} ${lastName}</strong>,`,
    // Transaction
    transactionNotification: "Transaktionsbenachrichtigung",
    transactionCredit: "Gutschrift",
    transactionDebit: "Lastschrift",
    transactionInfo: "Wir informieren Sie, dass eine Transaktion auf Ihrem Konto durchgef\xFChrt wurde.",
    transactionWarning: "Falls Sie diese Transaktion nicht veranlasst haben, kontaktieren Sie bitte sofort unseren Kundenservice.",
    transactionType: "Typ:",
    transactionAmount: "Betrag:",
    transactionDate: "Datum:",
    transactionDescription: "Beschreibung:",
    noDescription: "Keine Beschreibung",
    dateNotAvailable: "Datum nicht verf\xFCgbar",
    currentBalance: "Ihr aktueller Saldo betr\xE4gt",
    // Reminders
    paymentReminder: "Zahlungserinnerung",
    stepPaymentRequired: "Eine Zahlung ist erforderlich, um mit Ihrem Verifizierungsprozess fortzufahren.",
    currentStep: "Aktueller Schritt:",
    amountDue: "F\xE4lliger Betrag:",
    paymentInstructions: "Bitte f\xFChren Sie eine Bank\xFCberweisung mit folgenden Details durch:",
    beneficiaryName: "Name des Beg\xFCnstigten:",
    accountNumber: "Kontonummer:",
    paymentReference: "Referenz:",
    paymentHelp: "Nach der Zahlung senden Sie uns bitte einen Zahlungsnachweis zur Beschleunigung der Validierung.",
    // Status
    accountStatus: "Kontostatus",
    accountActivated: "Konto aktiviert",
    accountDeactivated: "Konto deaktiviert",
    accountActivatedMessage: "Sie k\xF6nnen nun alle EuroNova-Services nutzen.",
    accountDeactivatedMessage: "F\xFCr weitere Informationen oder zur Reaktivierung Ihres Kontos kontaktieren Sie bitte unseren Kundenservice.",
    accountStatusUpdate: "Kontostatus-Update",
    accountActivationMsg: "Wir freuen uns, Ihnen mitteilen zu k\xF6nnen, dass Ihr Konto aktiviert wurde. Sie k\xF6nnen nun auf alle Funktionen unserer Plattform zugreifen.",
    accountDeactivationMsg: "Wir bedauern, Ihnen mitteilen zu m\xFCssen, dass Ihr Konto deaktiviert wurde. Bitte kontaktieren Sie unseren Kundenservice f\xFCr weitere Informationen.",
    // Welcome
    welcomeTitle: "Willkommen bei EuroNova",
    welcomeSubject: "Ihre vertraulichen Informationen",
    welcomeMessage: "Willkommen bei EuroNova! Wir freuen uns, Sie als Kunden zu haben.",
    trustedBankingPartner: "Ihr vertrauensvoller Bankpartner",
    accountCreated: "Ihr Konto wurde erfolgreich erstellt! Hier sind Ihre Identifikationsinformationen:",
    accessCredentials: "Hier sind Ihre Zugangsdaten:",
    clientIdLabel: "Kunden-ID:",
    passwordLabel: "Passwort:",
    accountNumberLabel: "Kontonummer:",
    cardInfoLabel: "Bankkarten-Informationen:",
    cardNumberLabel: "Kartennummer:",
    cardExpiryDateLabel: "Ablaufdatum:",
    cardCvvLabel: "CVV:",
    securityWarning: "Bewahren Sie diese Informationen sicher auf und teilen Sie sie mit niemandem.",
    loginInvite: "Sie k\xF6nnen sich jetzt in Ihren Kundenbereich einloggen, um unsere Services zu entdecken.",
    confidentialInfo: "Diese Nachricht enth\xE4lt vertrauliche Informationen. Bitte antworten Sie nicht."
  },
  it: {
    // General
    appName: "EuroNova",
    tagline: "Il vostro partner bancario",
    buttonAccessAccount: "Accedi al mio conto",
    buttonContactSupport: "Contatta il supporto",
    footerAutomatedMsg: "Questo \xE8 un messaggio automatico, si prega di non rispondere.",
    allRightsReserved: "Tutti i diritti riservati.",
    greeting: (firstName, lastName) => `Caro/a <strong>${firstName} ${lastName}</strong>,`,
    // Transaction
    transactionNotification: "Notifica di transazione",
    transactionCredit: "Credito",
    transactionDebit: "Debito",
    transactionInfo: "Vi informiamo che \xE8 stata effettuata una transazione sul vostro conto.",
    transactionWarning: "Se non avete avviato questa transazione, contattate immediatamente il nostro servizio clienti.",
    transactionType: "Tipo:",
    transactionAmount: "Importo:",
    transactionDate: "Data:",
    transactionDescription: "Descrizione:",
    noDescription: "Nessuna descrizione",
    dateNotAvailable: "Data non disponibile",
    currentBalance: "Il vostro saldo attuale \xE8",
    // Reminders
    paymentReminder: "Promemoria di pagamento",
    stepPaymentRequired: "\xC8 richiesto un pagamento per procedere con il vostro processo di verifica.",
    currentStep: "Passo attuale:",
    amountDue: "Importo dovuto:",
    paymentInstructions: "Si prega di effettuare un bonifico bancario con i seguenti dettagli:",
    beneficiaryName: "Nome del beneficiario:",
    accountNumber: "Numero di conto:",
    paymentReference: "Riferimento:",
    paymentHelp: "Dopo aver effettuato il pagamento, inviateci una prova di pagamento per accelerare la validazione.",
    // Status
    accountStatus: "Stato del conto",
    accountActivated: "Conto attivato",
    accountDeactivated: "Conto disattivato",
    accountActivatedMessage: "Ora potete usufruire di tutti i servizi EuroNova.",
    accountDeactivatedMessage: "Per maggiori informazioni o per riattivare il vostro conto, contattate il nostro servizio clienti.",
    accountStatusUpdate: "Aggiornamento dello stato del conto",
    accountActivationMsg: "Siamo lieti di informarvi che il vostro conto \xE8 stato attivato. Ora potete accedere a tutte le funzionalit\xE0 della nostra piattaforma.",
    accountDeactivationMsg: "Ci dispiace informarvi che il vostro conto \xE8 stato disattivato. Contattate il nostro servizio clienti per maggiori informazioni.",
    // Welcome
    welcomeTitle: "Benvenuto in EuroNova",
    welcomeSubject: "Le vostre informazioni riservate",
    welcomeMessage: "Benvenuto in EuroNova! Siamo felici di avervi come cliente.",
    trustedBankingPartner: "Il vostro partner bancario di fiducia",
    accountCreated: "Il vostro conto \xE8 stato creato con successo! Ecco le vostre informazioni di identificazione:",
    accessCredentials: "Ecco le vostre credenziali di accesso:",
    clientIdLabel: "ID Cliente:",
    passwordLabel: "Password:",
    accountNumberLabel: "Numero di conto:",
    cardInfoLabel: "Informazioni della carta bancaria:",
    cardNumberLabel: "Numero di carta:",
    cardExpiryDateLabel: "Data di scadenza:",
    cardCvvLabel: "CVV:",
    securityWarning: "Conservate queste informazioni con cura e non condividetele con nessuno.",
    loginInvite: "Ora potete accedere alla vostra area clienti per scoprire i nostri servizi.",
    confidentialInfo: "Questo messaggio contiene informazioni riservate. Si prega di non rispondere."
  },
  ar: {
    // General
    appName: "EuroNova",
    tagline: "\u0634\u0631\u064A\u0643\u0643 \u0627\u0644\u0645\u0635\u0631\u0641\u064A",
    buttonAccessAccount: "\u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u062D\u0633\u0627\u0628\u064A",
    buttonContactSupport: "\u0627\u062A\u0635\u0644 \u0628\u0627\u0644\u062F\u0639\u0645",
    footerAutomatedMsg: "\u0647\u0630\u0647 \u0631\u0633\u0627\u0644\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0629\u060C \u064A\u0631\u062C\u0649 \u0639\u062F\u0645 \u0627\u0644\u0631\u062F \u0639\u0644\u064A\u0647\u0627.",
    allRightsReserved: "\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629.",
    greeting: (firstName, lastName) => `\u0639\u0632\u064A\u0632\u064A/\u0639\u0632\u064A\u0632\u062A\u064A <strong>${firstName} ${lastName}</strong>\u060C`,
    // Transaction
    transactionNotification: "\u0625\u0634\u0639\u0627\u0631 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629",
    transactionCredit: "\u0627\u0626\u062A\u0645\u0627\u0646",
    transactionDebit: "\u062E\u0635\u0645",
    transactionInfo: "\u0646\u062D\u064A\u0637\u0643\u0645 \u0639\u0644\u0645\u0627\u064B \u0628\u0623\u0646\u0647 \u062A\u0645 \u0625\u062C\u0631\u0627\u0621 \u0645\u0639\u0627\u0645\u0644\u0629 \u0639\u0644\u0649 \u062D\u0633\u0627\u0628\u0643\u0645.",
    transactionWarning: "\u0625\u0630\u0627 \u0644\u0645 \u062A\u0642\u0648\u0645\u0648\u0627 \u0628\u0628\u062F\u0621 \u0647\u0630\u0647 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0641\u0648\u0631\u0627\u064B.",
    transactionType: "\u0627\u0644\u0646\u0648\u0639:",
    transactionAmount: "\u0627\u0644\u0645\u0628\u0644\u063A:",
    transactionDate: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E:",
    transactionDescription: "\u0627\u0644\u0648\u0635\u0641:",
    noDescription: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0648\u0635\u0641",
    dateNotAvailable: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631",
    currentBalance: "\u0631\u0635\u064A\u062F\u0643\u0645 \u0627\u0644\u062D\u0627\u0644\u064A \u0647\u0648",
    // Reminders
    paymentReminder: "\u062A\u0630\u0643\u064A\u0631 \u0628\u0627\u0644\u062F\u0641\u0639",
    stepPaymentRequired: "\u0645\u0637\u0644\u0648\u0628 \u062F\u0641\u0639\u0629 \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0641\u064A \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0643\u0645.",
    currentStep: "\u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629:",
    amountDue: "\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0633\u062A\u062D\u0642:",
    paymentInstructions: "\u064A\u0631\u062C\u0649 \u0625\u062C\u0631\u0627\u0621 \u062A\u062D\u0648\u064A\u0644 \u0645\u0635\u0631\u0641\u064A \u0628\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062A\u0627\u0644\u064A\u0629:",
    beneficiaryName: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u0641\u064A\u062F:",
    accountNumber: "\u0631\u0642\u0645 \u0627\u0644\u062D\u0633\u0627\u0628:",
    paymentReference: "\u0627\u0644\u0645\u0631\u062C\u0639:",
    paymentHelp: "\u0628\u0639\u062F \u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u062F\u0641\u0639\u060C \u064A\u0631\u062C\u0649 \u0625\u0631\u0633\u0627\u0644 \u0625\u062B\u0628\u0627\u062A \u0627\u0644\u062F\u0641\u0639 \u0644\u062A\u0633\u0631\u064A\u0639 \u0627\u0644\u062A\u062D\u0642\u0642.",
    // Status
    accountStatus: "\u062D\u0627\u0644\u0629 \u0627\u0644\u062D\u0633\u0627\u0628",
    accountActivated: "\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062D\u0633\u0627\u0628",
    accountDeactivated: "\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062D\u0633\u0627\u0628",
    accountActivatedMessage: "\u064A\u0645\u0643\u0646\u0643\u0645 \u0627\u0644\u0622\u0646 \u0627\u0644\u0627\u0633\u062A\u0641\u0627\u062F\u0629 \u0645\u0646 \u062C\u0645\u064A\u0639 \u062E\u062F\u0645\u0627\u062A EuroNova.",
    accountDeactivatedMessage: "\u0644\u0645\u0632\u064A\u062F \u0645\u0646 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0623\u0648 \u0644\u0625\u0639\u0627\u062F\u0629 \u062A\u0641\u0639\u064A\u0644 \u062D\u0633\u0627\u0628\u0643\u0645\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621.",
    accountStatusUpdate: "\u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u062D\u0633\u0627\u0628",
    accountActivationMsg: "\u064A\u0633\u0631\u0646\u0627 \u0625\u0639\u0644\u0627\u0645\u0643\u0645 \u0628\u0623\u0646 \u062D\u0633\u0627\u0628\u0643\u0645 \u0642\u062F \u062A\u0645 \u062A\u0641\u0639\u064A\u0644\u0647. \u064A\u0645\u0643\u0646\u0643\u0645 \u0627\u0644\u0622\u0646 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u062C\u0645\u064A\u0639 \u0645\u064A\u0632\u0627\u062A \u0645\u0646\u0635\u062A\u0646\u0627.",
    accountDeactivationMsg: "\u0646\u0623\u0633\u0641 \u0644\u0625\u0639\u0644\u0627\u0645\u0643\u0645 \u0628\u0623\u0646 \u062D\u0633\u0627\u0628\u0643\u0645 \u0642\u062F \u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u062A\u0641\u0639\u064A\u0644\u0647. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0644\u0645\u0632\u064A\u062F \u0645\u0646 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A.",
    // Welcome
    welcomeTitle: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643\u0645 \u0641\u064A EuroNova",
    welcomeSubject: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A\u0643\u0645 \u0627\u0644\u0633\u0631\u064A\u0629",
    welcomeMessage: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643\u0645 \u0641\u064A EuroNova! \u0646\u062D\u0646 \u0633\u0639\u062F\u0627\u0621 \u0644\u0648\u062C\u0648\u062F\u0643\u0645 \u0643\u0639\u0645\u0644\u0627\u0621 \u0644\u062F\u064A\u0646\u0627.",
    trustedBankingPartner: "\u0634\u0631\u064A\u0643\u0643\u0645 \u0627\u0644\u0645\u0635\u0631\u0641\u064A \u0627\u0644\u0645\u0648\u062B\u0648\u0642",
    accountCreated: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628\u0643\u0645 \u0628\u0646\u062C\u0627\u062D! \u0625\u0644\u064A\u0643\u0645 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062A\u0639\u0631\u064A\u0641 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0643\u0645:",
    accessCredentials: "\u0625\u0644\u064A\u0643\u0645 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0648\u0635\u0648\u0644 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0643\u0645:",
    clientIdLabel: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0639\u0645\u064A\u0644:",
    passwordLabel: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631:",
    accountNumberLabel: "\u0631\u0642\u0645 \u0627\u0644\u062D\u0633\u0627\u0628:",
    cardInfoLabel: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u0635\u0631\u0641\u064A\u0629:",
    cardNumberLabel: "\u0631\u0642\u0645 \u0627\u0644\u0628\u0637\u0627\u0642\u0629:",
    cardExpiryDateLabel: "\u062A\u0627\u0631\u064A\u062E \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629:",
    cardCvvLabel: "CVV:",
    securityWarning: "\u0627\u062D\u062A\u0641\u0638\u0648\u0627 \u0628\u0647\u0630\u0647 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0628\u0639\u0646\u0627\u064A\u0629 \u0648\u0644\u0627 \u062A\u0634\u0627\u0631\u0643\u0648\u0647\u0627 \u0645\u0639 \u0623\u062D\u062F.",
    loginInvite: "\u064A\u0645\u0643\u0646\u0643\u0645 \u0627\u0644\u0622\u0646 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0625\u0644\u0649 \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0644\u0627\u0643\u062A\u0634\u0627\u0641 \u062E\u062F\u0645\u0627\u062A\u0646\u0627.",
    confidentialInfo: "\u062A\u062D\u062A\u0648\u064A \u0647\u0630\u0647 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0639\u0644\u0649 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0633\u0631\u064A\u0629. \u064A\u0631\u062C\u0649 \u0639\u062F\u0645 \u0627\u0644\u0631\u062F \u0639\u0644\u064A\u0647\u0627."
  },
  zh: {
    // General
    appName: "EuroNova",
    tagline: "\u60A8\u7684\u94F6\u884C\u5408\u4F5C\u4F19\u4F34",
    buttonAccessAccount: "\u8BBF\u95EE\u6211\u7684\u8D26\u6237",
    buttonContactSupport: "\u8054\u7CFB\u652F\u6301",
    footerAutomatedMsg: "\u8FD9\u662F\u4E00\u6761\u81EA\u52A8\u6D88\u606F\uFF0C\u8BF7\u52FF\u56DE\u590D\u3002",
    allRightsReserved: "\u7248\u6743\u6240\u6709\u3002",
    greeting: (firstName, lastName) => `\u4EB2\u7231\u7684 <strong>${firstName} ${lastName}</strong>\uFF0C`,
    // Transaction
    transactionNotification: "\u4EA4\u6613\u901A\u77E5",
    transactionCredit: "\u8D37\u8BB0",
    transactionDebit: "\u501F\u8BB0",
    transactionInfo: "\u6211\u4EEC\u901A\u77E5\u60A8\uFF0C\u60A8\u7684\u8D26\u6237\u5DF2\u8FDB\u884C\u4E86\u4E00\u7B14\u4EA4\u6613\u3002",
    transactionWarning: "\u5982\u679C\u60A8\u6CA1\u6709\u53D1\u8D77\u6B64\u4EA4\u6613\uFF0C\u8BF7\u7ACB\u5373\u8054\u7CFB\u6211\u4EEC\u7684\u5BA2\u6237\u670D\u52A1\u3002",
    transactionType: "\u7C7B\u578B\uFF1A",
    transactionAmount: "\u91D1\u989D\uFF1A",
    transactionDate: "\u65E5\u671F\uFF1A",
    transactionDescription: "\u63CF\u8FF0\uFF1A",
    noDescription: "\u65E0\u63CF\u8FF0",
    dateNotAvailable: "\u65E5\u671F\u4E0D\u53EF\u7528",
    currentBalance: "\u60A8\u7684\u5F53\u524D\u4F59\u989D\u4E3A",
    // Reminders
    paymentReminder: "\u4ED8\u6B3E\u63D0\u9192",
    stepPaymentRequired: "\u9700\u8981\u4ED8\u6B3E\u4EE5\u7EE7\u7EED\u60A8\u7684\u9A8C\u8BC1\u8FC7\u7A0B\u3002",
    currentStep: "\u5F53\u524D\u6B65\u9AA4\uFF1A",
    amountDue: "\u5E94\u4ED8\u91D1\u989D\uFF1A",
    paymentInstructions: "\u8BF7\u4F7F\u7528\u4EE5\u4E0B\u8BE6\u7EC6\u4FE1\u606F\u8FDB\u884C\u94F6\u884C\u8F6C\u8D26\uFF1A",
    beneficiaryName: "\u53D7\u76CA\u4EBA\u59D3\u540D\uFF1A",
    accountNumber: "\u8D26\u6237\u53F7\u7801\uFF1A",
    paymentReference: "\u53C2\u8003\uFF1A",
    paymentHelp: "\u4ED8\u6B3E\u540E\uFF0C\u8BF7\u5411\u6211\u4EEC\u53D1\u9001\u4ED8\u6B3E\u8BC1\u660E\u4EE5\u52A0\u5FEB\u9A8C\u8BC1\u3002",
    // Status
    accountStatus: "\u8D26\u6237\u72B6\u6001",
    accountActivated: "\u8D26\u6237\u5DF2\u6FC0\u6D3B",
    accountDeactivated: "\u8D26\u6237\u5DF2\u505C\u7528",
    accountActivatedMessage: "\u60A8\u73B0\u5728\u53EF\u4EE5\u4EAB\u53D7\u6240\u6709EuroNova\u670D\u52A1\u3002",
    accountDeactivatedMessage: "\u5982\u9700\u66F4\u591A\u4FE1\u606F\u6216\u91CD\u65B0\u6FC0\u6D3B\u60A8\u7684\u8D26\u6237\uFF0C\u8BF7\u8054\u7CFB\u6211\u4EEC\u7684\u5BA2\u6237\u670D\u52A1\u3002",
    accountStatusUpdate: "\u8D26\u6237\u72B6\u6001\u66F4\u65B0",
    accountActivationMsg: "\u6211\u4EEC\u5F88\u9AD8\u5174\u901A\u77E5\u60A8\uFF0C\u60A8\u7684\u8D26\u6237\u5DF2\u88AB\u6FC0\u6D3B\u3002\u60A8\u73B0\u5728\u53EF\u4EE5\u8BBF\u95EE\u6211\u4EEC\u5E73\u53F0\u7684\u6240\u6709\u529F\u80FD\u3002",
    accountDeactivationMsg: "\u6211\u4EEC\u5F88\u9057\u61BE\u5730\u901A\u77E5\u60A8\uFF0C\u60A8\u7684\u8D26\u6237\u5DF2\u88AB\u505C\u7528\u3002\u8BF7\u8054\u7CFB\u6211\u4EEC\u7684\u5BA2\u6237\u670D\u52A1\u4E86\u89E3\u66F4\u591A\u4FE1\u606F\u3002",
    // Welcome
    welcomeTitle: "\u6B22\u8FCE\u6765\u5230EuroNova",
    welcomeSubject: "\u60A8\u7684\u673A\u5BC6\u4FE1\u606F",
    welcomeMessage: "\u6B22\u8FCE\u6765\u5230EuroNova\uFF01\u6211\u4EEC\u5F88\u9AD8\u5174\u60A8\u6210\u4E3A\u6211\u4EEC\u7684\u5BA2\u6237\u3002",
    trustedBankingPartner: "\u60A8\u503C\u5F97\u4FE1\u8D56\u7684\u94F6\u884C\u5408\u4F5C\u4F19\u4F34",
    accountCreated: "\u60A8\u7684\u8D26\u6237\u5DF2\u6210\u529F\u521B\u5EFA\uFF01\u4EE5\u4E0B\u662F\u60A8\u7684\u8EAB\u4EFD\u4FE1\u606F\uFF1A",
    accessCredentials: "\u4EE5\u4E0B\u662F\u60A8\u7684\u8BBF\u95EE\u51ED\u636E\uFF1A",
    clientIdLabel: "\u5BA2\u6237ID\uFF1A",
    passwordLabel: "\u5BC6\u7801\uFF1A",
    accountNumberLabel: "\u8D26\u6237\u53F7\u7801\uFF1A",
    cardInfoLabel: "\u94F6\u884C\u5361\u4FE1\u606F\uFF1A",
    cardNumberLabel: "\u5361\u53F7\uFF1A",
    cardExpiryDateLabel: "\u5230\u671F\u65E5\u671F\uFF1A",
    cardCvvLabel: "CVV\uFF1A",
    securityWarning: "\u8BF7\u59A5\u5584\u4FDD\u7BA1\u8FD9\u4E9B\u4FE1\u606F\uFF0C\u4E0D\u8981\u4E0E\u4EFB\u4F55\u4EBA\u5206\u4EAB\u3002",
    loginInvite: "\u60A8\u73B0\u5728\u53EF\u4EE5\u767B\u5F55\u60A8\u7684\u5BA2\u6237\u533A\u57DF\u6765\u53D1\u73B0\u6211\u4EEC\u7684\u670D\u52A1\u3002",
    confidentialInfo: "\u6B64\u6D88\u606F\u5305\u542B\u673A\u5BC6\u4FE1\u606F\u3002\u8BF7\u52FF\u56DE\u590D\u3002"
  },
  ru: {
    // General
    appName: "EuroNova",
    tagline: "\u0412\u0430\u0448 \u0431\u0430\u043D\u043A\u043E\u0432\u0441\u043A\u0438\u0439 \u043F\u0430\u0440\u0442\u043D\u0435\u0440",
    buttonAccessAccount: "\u0414\u043E\u0441\u0442\u0443\u043F \u043A \u043C\u043E\u0435\u043C\u0443 \u0441\u0447\u0435\u0442\u0443",
    buttonContactSupport: "\u0421\u0432\u044F\u0437\u0430\u0442\u044C\u0441\u044F \u0441 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u043E\u0439",
    footerAutomatedMsg: "\u042D\u0442\u043E \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435, \u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043D\u0435 \u043E\u0442\u0432\u0435\u0447\u0430\u0439\u0442\u0435 \u043D\u0430 \u043D\u0435\u0433\u043E.",
    allRightsReserved: "\u0412\u0441\u0435 \u043F\u0440\u0430\u0432\u0430 \u0437\u0430\u0449\u0438\u0449\u0435\u043D\u044B.",
    greeting: (firstName, lastName) => `\u0423\u0432\u0430\u0436\u0430\u0435\u043C\u044B\u0439/\u0430\u044F <strong>${firstName} ${lastName}</strong>,`,
    // Transaction
    transactionNotification: "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0438",
    transactionCredit: "\u041A\u0440\u0435\u0434\u0438\u0442",
    transactionDebit: "\u0414\u0435\u0431\u0435\u0442",
    transactionInfo: "\u041C\u044B \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u044F\u0435\u043C \u0432\u0430\u0441 \u043E \u0442\u043E\u043C, \u0447\u0442\u043E \u043F\u043E \u0432\u0430\u0448\u0435\u043C\u0443 \u0441\u0447\u0435\u0442\u0443 \u0431\u044B\u043B\u0430 \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0430 \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u044F.",
    transactionWarning: "\u0415\u0441\u043B\u0438 \u0432\u044B \u043D\u0435 \u0438\u043D\u0438\u0446\u0438\u0438\u0440\u043E\u0432\u0430\u043B\u0438 \u044D\u0442\u0443 \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u044E, \u043D\u0435\u043C\u0435\u0434\u043B\u0435\u043D\u043D\u043E \u0441\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u0441 \u043D\u0430\u0448\u0435\u0439 \u0441\u043B\u0443\u0436\u0431\u043E\u0439 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438 \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432.",
    transactionType: "\u0422\u0438\u043F:",
    transactionAmount: "\u0421\u0443\u043C\u043C\u0430:",
    transactionDate: "\u0414\u0430\u0442\u0430:",
    transactionDescription: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435:",
    noDescription: "\u0411\u0435\u0437 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F",
    dateNotAvailable: "\u0414\u0430\u0442\u0430 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430",
    currentBalance: "\u0412\u0430\u0448 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u0431\u0430\u043B\u0430\u043D\u0441 \u0441\u043E\u0441\u0442\u0430\u0432\u043B\u044F\u0435\u0442",
    // Reminders
    paymentReminder: "\u041D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u043D\u0438\u0435 \u043E \u043F\u043B\u0430\u0442\u0435\u0436\u0435",
    stepPaymentRequired: "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u043F\u043B\u0430\u0442\u0435\u0436 \u0434\u043B\u044F \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0435\u043D\u0438\u044F \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0430 \u0432\u0435\u0440\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438.",
    currentStep: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0448\u0430\u0433:",
    amountDue: "\u0421\u0443\u043C\u043C\u0430 \u043A \u043E\u043F\u043B\u0430\u0442\u0435:",
    paymentInstructions: "\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0441\u043E\u0432\u0435\u0440\u0448\u0438\u0442\u0435 \u0431\u0430\u043D\u043A\u043E\u0432\u0441\u043A\u0438\u0439 \u043F\u0435\u0440\u0435\u0432\u043E\u0434 \u0441\u043E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u043C\u0438 \u0440\u0435\u043A\u0432\u0438\u0437\u0438\u0442\u0430\u043C\u0438:",
    beneficiaryName: "\u0418\u043C\u044F \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u0435\u043B\u044F:",
    accountNumber: "\u041D\u043E\u043C\u0435\u0440 \u0441\u0447\u0435\u0442\u0430:",
    paymentReference: "\u0421\u0441\u044B\u043B\u043A\u0430:",
    paymentHelp: "\u041F\u043E\u0441\u043B\u0435 \u0441\u043E\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u044F \u043F\u043B\u0430\u0442\u0435\u0436\u0430, \u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043E\u0442\u043F\u0440\u0430\u0432\u044C\u0442\u0435 \u043D\u0430\u043C \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043F\u043B\u0430\u0442\u0435\u0436\u0430 \u0434\u043B\u044F \u0443\u0441\u043A\u043E\u0440\u0435\u043D\u0438\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438.",
    // Status
    accountStatus: "\u0421\u0442\u0430\u0442\u0443\u0441 \u0441\u0447\u0435\u0442\u0430",
    accountActivated: "\u0421\u0447\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D",
    accountDeactivated: "\u0421\u0447\u0435\u0442 \u0434\u0435\u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D",
    accountActivatedMessage: "\u0422\u0435\u043F\u0435\u0440\u044C \u0432\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C\u0441\u044F \u0432\u0441\u0435\u043C\u0438 \u0443\u0441\u043B\u0443\u0433\u0430\u043C\u0438 EuroNova.",
    accountDeactivatedMessage: "\u0414\u043B\u044F \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u0438 \u0438\u043B\u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E\u0439 \u0430\u043A\u0442\u0438\u0432\u0430\u0446\u0438\u0438 \u0432\u0430\u0448\u0435\u0433\u043E \u0441\u0447\u0435\u0442\u0430, \u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0441\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u0441 \u043D\u0430\u0448\u0435\u0439 \u0441\u043B\u0443\u0436\u0431\u043E\u0439 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438 \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432.",
    accountStatusUpdate: "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u0441\u0447\u0435\u0442\u0430",
    accountActivationMsg: "\u041C\u044B \u0440\u0430\u0434\u044B \u0441\u043E\u043E\u0431\u0449\u0438\u0442\u044C \u0432\u0430\u043C, \u0447\u0442\u043E \u0432\u0430\u0448 \u0441\u0447\u0435\u0442 \u0431\u044B\u043B \u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D. \u0422\u0435\u043F\u0435\u0440\u044C \u0432\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0434\u043E\u0441\u0442\u0443\u043F \u043A\u043E \u0432\u0441\u0435\u043C \u0444\u0443\u043D\u043A\u0446\u0438\u044F\u043C \u043D\u0430\u0448\u0435\u0439 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B.",
    accountDeactivationMsg: "\u041C\u044B \u0441\u043E\u0436\u0430\u043B\u0435\u0435\u043C \u0441\u043E\u043E\u0431\u0449\u0438\u0442\u044C \u0432\u0430\u043C, \u0447\u0442\u043E \u0432\u0430\u0448 \u0441\u0447\u0435\u0442 \u0431\u044B\u043B \u0434\u0435\u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0441\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u0441 \u043D\u0430\u0448\u0435\u0439 \u0441\u043B\u0443\u0436\u0431\u043E\u0439 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438 \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432 \u0434\u043B\u044F \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u0438.",
    // Welcome
    welcomeTitle: "\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 EuroNova",
    welcomeSubject: "\u0412\u0430\u0448\u0430 \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F",
    welcomeMessage: "\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 EuroNova! \u041C\u044B \u0440\u0430\u0434\u044B \u0432\u0438\u0434\u0435\u0442\u044C \u0432\u0430\u0441 \u0432 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435 \u043D\u0430\u0448\u0435\u0433\u043E \u043A\u043B\u0438\u0435\u043D\u0442\u0430.",
    trustedBankingPartner: "\u0412\u0430\u0448 \u043D\u0430\u0434\u0435\u0436\u043D\u044B\u0439 \u0431\u0430\u043D\u043A\u043E\u0432\u0441\u043A\u0438\u0439 \u043F\u0430\u0440\u0442\u043D\u0435\u0440",
    accountCreated: "\u0412\u0430\u0448 \u0441\u0447\u0435\u0442 \u0431\u044B\u043B \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u043E\u0437\u0434\u0430\u043D! \u0412\u043E\u0442 \u0432\u0430\u0448\u0430 \u0438\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F:",
    accessCredentials: "\u0412\u043E\u0442 \u0432\u0430\u0448\u0438 \u0443\u0447\u0435\u0442\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u0434\u043B\u044F \u0434\u043E\u0441\u0442\u0443\u043F\u0430:",
    clientIdLabel: "ID \u043A\u043B\u0438\u0435\u043D\u0442\u0430:",
    passwordLabel: "\u041F\u0430\u0440\u043E\u043B\u044C:",
    accountNumberLabel: "\u041D\u043E\u043C\u0435\u0440 \u0441\u0447\u0435\u0442\u0430:",
    cardInfoLabel: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u0431\u0430\u043D\u043A\u043E\u0432\u0441\u043A\u043E\u0439 \u043A\u0430\u0440\u0442\u0435:",
    cardNumberLabel: "\u041D\u043E\u043C\u0435\u0440 \u043A\u0430\u0440\u0442\u044B:",
    cardExpiryDateLabel: "\u0414\u0430\u0442\u0430 \u0438\u0441\u0442\u0435\u0447\u0435\u043D\u0438\u044F:",
    cardCvvLabel: "CVV:",
    securityWarning: "\u0425\u0440\u0430\u043D\u0438\u0442\u0435 \u044D\u0442\u0443 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044E \u0432 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438 \u0438 \u043D\u0435 \u0434\u0435\u043B\u0438\u0442\u0435\u0441\u044C \u0435\u044E \u043D\u0438 \u0441 \u043A\u0435\u043C.",
    loginInvite: "\u0422\u0435\u043F\u0435\u0440\u044C \u0432\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u0432\u043E\u0439\u0442\u0438 \u0432 \u0441\u0432\u043E\u044E \u043A\u043B\u0438\u0435\u043D\u0442\u0441\u043A\u0443\u044E \u0437\u043E\u043D\u0443, \u0447\u0442\u043E\u0431\u044B \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u043D\u0430\u0448\u0438 \u0443\u0441\u043B\u0443\u0433\u0438.",
    confidentialInfo: "\u042D\u0442\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u0443\u044E \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044E. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043D\u0435 \u043E\u0442\u0432\u0435\u0447\u0430\u0439\u0442\u0435 \u043D\u0430 \u043D\u0435\u0433\u043E."
  },
  pt: {
    // General
    appName: "EuroNova",
    tagline: "Seu parceiro banc\xE1rio",
    buttonAccessAccount: "Acessar minha conta",
    buttonContactSupport: "Contatar suporte",
    footerAutomatedMsg: "Esta \xE9 uma mensagem autom\xE1tica, por favor n\xE3o responda.",
    allRightsReserved: "Todos os direitos reservados.",
    greeting: (firstName, lastName) => `Caro/a <strong>${firstName} ${lastName}</strong>,`,
    // Transaction
    transactionNotification: "Notifica\xE7\xE3o de transa\xE7\xE3o",
    transactionCredit: "Cr\xE9dito",
    transactionDebit: "D\xE9bito",
    transactionInfo: "Informamos que uma transa\xE7\xE3o foi realizada em sua conta.",
    transactionWarning: "Se voc\xEA n\xE3o iniciou esta transa\xE7\xE3o, entre em contato com nosso atendimento ao cliente imediatamente.",
    transactionType: "Tipo:",
    transactionAmount: "Valor:",
    transactionDate: "Data:",
    transactionDescription: "Descri\xE7\xE3o:",
    noDescription: "Sem descri\xE7\xE3o",
    dateNotAvailable: "Data n\xE3o dispon\xEDvel",
    currentBalance: "Seu saldo atual \xE9",
    // Reminders
    paymentReminder: "Lembrete de pagamento",
    stepPaymentRequired: "Um pagamento \xE9 necess\xE1rio para prosseguir com seu processo de verifica\xE7\xE3o.",
    currentStep: "Etapa atual:",
    amountDue: "Valor devido:",
    paymentInstructions: "Por favor, fa\xE7a uma transfer\xEAncia banc\xE1ria com os seguintes detalhes:",
    beneficiaryName: "Nome do benefici\xE1rio:",
    accountNumber: "N\xFAmero da conta:",
    paymentReference: "Refer\xEAncia:",
    paymentHelp: "Ap\xF3s fazer o pagamento, envie-nos um comprovante de pagamento para acelerar a valida\xE7\xE3o.",
    // Status
    accountStatus: "Status da conta",
    accountActivated: "Conta ativada",
    accountDeactivated: "Conta desativada",
    accountActivatedMessage: "Agora voc\xEA pode desfrutar de todos os servi\xE7os da EuroNova.",
    accountDeactivatedMessage: "Para mais informa\xE7\xF5es ou para reativar sua conta, entre em contato com nosso atendimento ao cliente.",
    accountStatusUpdate: "Atualiza\xE7\xE3o do status da conta",
    accountActivationMsg: "Temos o prazer de informar que sua conta foi ativada. Agora voc\xEA pode acessar todos os recursos de nossa plataforma.",
    accountDeactivationMsg: "Lamentamos informar que sua conta foi desativada. Entre em contato com nosso atendimento ao cliente para mais informa\xE7\xF5es.",
    // Welcome
    welcomeTitle: "Bem-vindo \xE0 EuroNova",
    welcomeSubject: "Suas informa\xE7\xF5es confidenciais",
    welcomeMessage: "Bem-vindo \xE0 EuroNova! Estamos felizes em t\xEA-lo como nosso cliente.",
    trustedBankingPartner: "Seu parceiro banc\xE1rio confi\xE1vel",
    accountCreated: "Sua conta foi criada com sucesso! Aqui est\xE3o suas informa\xE7\xF5es de identifica\xE7\xE3o:",
    accessCredentials: "Aqui est\xE3o suas credenciais de acesso:",
    clientIdLabel: "ID do Cliente:",
    passwordLabel: "Senha:",
    accountNumberLabel: "N\xFAmero da conta:",
    cardInfoLabel: "Informa\xE7\xF5es do cart\xE3o banc\xE1rio:",
    cardNumberLabel: "N\xFAmero do cart\xE3o:",
    cardExpiryDateLabel: "Data de validade:",
    cardCvvLabel: "CVV:",
    securityWarning: "Mantenha essas informa\xE7\xF5es seguras e n\xE3o as compartilhe com ningu\xE9m.",
    loginInvite: "Agora voc\xEA pode fazer login em sua \xE1rea do cliente para descobrir nossos servi\xE7os.",
    confidentialInfo: "Esta mensagem cont\xE9m informa\xE7\xF5es confidenciais. Por favor, n\xE3o responda."
  },
  ja: {
    // General
    appName: "EuroNova",
    tagline: "\u3042\u306A\u305F\u306E\u9280\u884C\u30D1\u30FC\u30C8\u30CA\u30FC",
    buttonAccessAccount: "\u30DE\u30A4\u30A2\u30AB\u30A6\u30F3\u30C8\u306B\u30A2\u30AF\u30BB\u30B9",
    buttonContactSupport: "\u30B5\u30DD\u30FC\u30C8\u306B\u9023\u7D61",
    footerAutomatedMsg: "\u3053\u308C\u306F\u81EA\u52D5\u30E1\u30C3\u30BB\u30FC\u30B8\u3067\u3059\u3002\u8FD4\u4FE1\u3057\u306A\u3044\u3067\u304F\u3060\u3055\u3044\u3002",
    allRightsReserved: "\u5168\u8457\u4F5C\u6A29\u6240\u6709\u3002",
    greeting: (firstName, lastName) => `<strong>${firstName} ${lastName}</strong> \u69D8`,
    // Transaction
    transactionNotification: "\u53D6\u5F15\u901A\u77E5",
    transactionCredit: "\u30AF\u30EC\u30B8\u30C3\u30C8",
    transactionDebit: "\u30C7\u30D3\u30C3\u30C8",
    transactionInfo: "\u304A\u5BA2\u69D8\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u3067\u53D6\u5F15\u304C\u884C\u308F\u308C\u305F\u3053\u3068\u3092\u304A\u77E5\u3089\u305B\u3057\u307E\u3059\u3002",
    transactionWarning: "\u3053\u306E\u53D6\u5F15\u3092\u958B\u59CB\u3057\u3066\u3044\u306A\u3044\u5834\u5408\u306F\u3001\u3059\u3050\u306B\u30AB\u30B9\u30BF\u30DE\u30FC\u30B5\u30FC\u30D3\u30B9\u306B\u304A\u554F\u3044\u5408\u308F\u305B\u304F\u3060\u3055\u3044\u3002",
    transactionType: "\u30BF\u30A4\u30D7\uFF1A",
    transactionAmount: "\u91D1\u984D\uFF1A",
    transactionDate: "\u65E5\u4ED8\uFF1A",
    transactionDescription: "\u8AAC\u660E\uFF1A",
    noDescription: "\u8AAC\u660E\u306A\u3057",
    dateNotAvailable: "\u65E5\u4ED8\u304C\u5229\u7528\u3067\u304D\u307E\u305B\u3093",
    currentBalance: "\u73FE\u5728\u306E\u6B8B\u9AD8\u306F",
    // Reminders
    paymentReminder: "\u652F\u6255\u3044\u30EA\u30DE\u30A4\u30F3\u30C0\u30FC",
    stepPaymentRequired: "\u8A8D\u8A3C\u30D7\u30ED\u30BB\u30B9\u3092\u7D9A\u884C\u3059\u308B\u305F\u3081\u306B\u652F\u6255\u3044\u304C\u5FC5\u8981\u3067\u3059\u3002",
    currentStep: "\u73FE\u5728\u306E\u30B9\u30C6\u30C3\u30D7\uFF1A",
    amountDue: "\u652F\u6255\u3044\u91D1\u984D\uFF1A",
    paymentInstructions: "\u4EE5\u4E0B\u306E\u8A73\u7D30\u3067\u9280\u884C\u632F\u8FBC\u3092\u884C\u3063\u3066\u304F\u3060\u3055\u3044\uFF1A",
    beneficiaryName: "\u53D7\u76CA\u8005\u540D\uFF1A",
    accountNumber: "\u30A2\u30AB\u30A6\u30F3\u30C8\u756A\u53F7\uFF1A",
    paymentReference: "\u53C2\u7167\uFF1A",
    paymentHelp: "\u652F\u6255\u3044\u5F8C\u3001\u691C\u8A3C\u3092\u8FC5\u901F\u5316\u3059\u308B\u305F\u3081\u306B\u652F\u6255\u3044\u8A3C\u660E\u3092\u304A\u9001\u308A\u304F\u3060\u3055\u3044\u3002",
    // Status
    accountStatus: "\u30A2\u30AB\u30A6\u30F3\u30C8\u30B9\u30C6\u30FC\u30BF\u30B9",
    accountActivated: "\u30A2\u30AB\u30A6\u30F3\u30C8\u304C\u6709\u52B9\u5316\u3055\u308C\u307E\u3057\u305F",
    accountDeactivated: "\u30A2\u30AB\u30A6\u30F3\u30C8\u304C\u7121\u52B9\u5316\u3055\u308C\u307E\u3057\u305F",
    accountActivatedMessage: "\u3053\u308C\u3067EuroNova\u306E\u3059\u3079\u3066\u306E\u30B5\u30FC\u30D3\u30B9\u3092\u3054\u5229\u7528\u3044\u305F\u3060\u3051\u307E\u3059\u3002",
    accountDeactivatedMessage: "\u8A73\u7D30\u60C5\u5831\u3084\u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u518D\u6709\u52B9\u5316\u306B\u3064\u3044\u3066\u306F\u3001\u30AB\u30B9\u30BF\u30DE\u30FC\u30B5\u30FC\u30D3\u30B9\u306B\u304A\u554F\u3044\u5408\u308F\u305B\u304F\u3060\u3055\u3044\u3002",
    accountStatusUpdate: "\u30A2\u30AB\u30A6\u30F3\u30C8\u30B9\u30C6\u30FC\u30BF\u30B9\u306E\u66F4\u65B0",
    accountActivationMsg: "\u304A\u5BA2\u69D8\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u304C\u6709\u52B9\u5316\u3055\u308C\u305F\u3053\u3068\u3092\u304A\u77E5\u3089\u305B\u3044\u305F\u3057\u307E\u3059\u3002\u3053\u308C\u3067\u5F53\u30D7\u30E9\u30C3\u30C8\u30D5\u30A9\u30FC\u30E0\u306E\u3059\u3079\u3066\u306E\u6A5F\u80FD\u306B\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u3059\u3002",
    accountDeactivationMsg: "\u304A\u5BA2\u69D8\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u304C\u7121\u52B9\u5316\u3055\u308C\u305F\u3053\u3068\u3092\u304A\u77E5\u3089\u305B\u3044\u305F\u3057\u307E\u3059\u3002\u8A73\u7D30\u306B\u3064\u3044\u3066\u306F\u3001\u30AB\u30B9\u30BF\u30DE\u30FC\u30B5\u30FC\u30D3\u30B9\u306B\u304A\u554F\u3044\u5408\u308F\u305B\u304F\u3060\u3055\u3044\u3002",
    // Welcome
    welcomeTitle: "EuroNova\u3078\u3088\u3046\u3053\u305D",
    welcomeSubject: "\u304A\u5BA2\u69D8\u306E\u6A5F\u5BC6\u60C5\u5831",
    welcomeMessage: "EuroNova\u3078\u3088\u3046\u3053\u305D\uFF01\u304A\u5BA2\u69D8\u3092\u5F53\u793E\u306E\u9867\u5BA2\u3068\u3057\u3066\u304A\u8FCE\u3048\u3067\u304D\u308B\u3053\u3068\u3092\u5B09\u3057\u304F\u601D\u3044\u307E\u3059\u3002",
    trustedBankingPartner: "\u4FE1\u983C\u3067\u304D\u308B\u9280\u884C\u30D1\u30FC\u30C8\u30CA\u30FC",
    accountCreated: "\u30A2\u30AB\u30A6\u30F3\u30C8\u304C\u6B63\u5E38\u306B\u4F5C\u6210\u3055\u308C\u307E\u3057\u305F\uFF01\u3053\u3061\u3089\u304C\u304A\u5BA2\u69D8\u306E\u8B58\u5225\u60C5\u5831\u3067\u3059\uFF1A",
    accessCredentials: "\u3053\u3061\u3089\u304C\u304A\u5BA2\u69D8\u306E\u30A2\u30AF\u30BB\u30B9\u8A8D\u8A3C\u60C5\u5831\u3067\u3059\uFF1A",
    clientIdLabel: "\u30AF\u30E9\u30A4\u30A2\u30F3\u30C8ID\uFF1A",
    passwordLabel: "\u30D1\u30B9\u30EF\u30FC\u30C9\uFF1A",
    accountNumberLabel: "\u30A2\u30AB\u30A6\u30F3\u30C8\u756A\u53F7\uFF1A",
    cardInfoLabel: "\u9280\u884C\u30AB\u30FC\u30C9\u60C5\u5831\uFF1A",
    cardNumberLabel: "\u30AB\u30FC\u30C9\u756A\u53F7\uFF1A",
    cardExpiryDateLabel: "\u6709\u52B9\u671F\u9650\uFF1A",
    cardCvvLabel: "CVV\uFF1A",
    securityWarning: "\u3053\u306E\u60C5\u5831\u3092\u5B89\u5168\u306B\u4FDD\u7BA1\u3057\u3001\u8AB0\u3068\u3082\u5171\u6709\u3057\u306A\u3044\u3067\u304F\u3060\u3055\u3044\u3002",
    loginInvite: "\u3053\u308C\u3067\u30AF\u30E9\u30A4\u30A2\u30F3\u30C8\u30A8\u30EA\u30A2\u306B\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u3001\u5F53\u793E\u306E\u30B5\u30FC\u30D3\u30B9\u3092\u3054\u5229\u7528\u3044\u305F\u3060\u3051\u307E\u3059\u3002",
    confidentialInfo: "\u3053\u306E\u30E1\u30C3\u30BB\u30FC\u30B8\u306B\u306F\u6A5F\u5BC6\u60C5\u5831\u304C\u542B\u307E\u308C\u3066\u3044\u307E\u3059\u3002\u8FD4\u4FE1\u3057\u306A\u3044\u3067\u304F\u3060\u3055\u3044\u3002"
  },
  ko: {
    // General
    appName: "EuroNova",
    tagline: "\uADC0\uD558\uC758 \uC740\uD589 \uD30C\uD2B8\uB108",
    buttonAccessAccount: "\uB0B4 \uACC4\uC815\uC5D0 \uC561\uC138\uC2A4",
    buttonContactSupport: "\uC9C0\uC6D0\uD300\uC5D0 \uBB38\uC758",
    footerAutomatedMsg: "\uC774\uAC83\uC740 \uC790\uB3D9 \uBA54\uC2DC\uC9C0\uC785\uB2C8\uB2E4. \uB2F5\uC7A5\uD558\uC9C0 \uB9C8\uC2ED\uC2DC\uC624.",
    allRightsReserved: "\uBAA8\uB4E0 \uAD8C\uB9AC \uBCF4\uC720.",
    greeting: (firstName, lastName) => `\uCE5C\uC560\uD558\uB294 <strong>${firstName} ${lastName}</strong>\uB2D8,`,
    // Transaction
    transactionNotification: "\uAC70\uB798 \uC54C\uB9BC",
    transactionCredit: "\uD06C\uB808\uB527",
    transactionDebit: "\uB370\uBE57",
    transactionInfo: "\uADC0\uD558\uC758 \uACC4\uC815\uC5D0\uC11C \uAC70\uB798\uAC00 \uC774\uB8E8\uC5B4\uC84C\uC74C\uC744 \uC54C\uB824\uB4DC\uB9BD\uB2C8\uB2E4.",
    transactionWarning: "\uC774 \uAC70\uB798\uB97C \uC2DC\uC791\uD558\uC9C0 \uC54A\uC73C\uC168\uB2E4\uBA74 \uC989\uC2DC \uACE0\uAC1D \uC11C\uBE44\uC2A4\uC5D0 \uBB38\uC758\uD558\uC2ED\uC2DC\uC624.",
    transactionType: "\uC720\uD615:",
    transactionAmount: "\uAE08\uC561:",
    transactionDate: "\uB0A0\uC9DC:",
    transactionDescription: "\uC124\uBA85:",
    noDescription: "\uC124\uBA85 \uC5C6\uC74C",
    dateNotAvailable: "\uB0A0\uC9DC\uB97C \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC74C",
    currentBalance: "\uD604\uC7AC \uC794\uC561\uC740",
    // Reminders
    paymentReminder: "\uACB0\uC81C \uC54C\uB9BC",
    stepPaymentRequired: "\uC778\uC99D \uD504\uB85C\uC138\uC2A4\uB97C \uACC4\uC18D\uD558\uB824\uBA74 \uACB0\uC81C\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.",
    currentStep: "\uD604\uC7AC \uB2E8\uACC4:",
    amountDue: "\uC9C0\uBD88 \uAE08\uC561:",
    paymentInstructions: "\uB2E4\uC74C \uC138\uBD80 \uC815\uBCF4\uB85C \uC740\uD589 \uC1A1\uAE08\uC744 \uD574\uC8FC\uC2ED\uC2DC\uC624:",
    beneficiaryName: "\uC218\uC775\uC790 \uC774\uB984:",
    accountNumber: "\uACC4\uC815 \uBC88\uD638:",
    paymentReference: "\uCC38\uC870:",
    paymentHelp: "\uACB0\uC81C \uD6C4 \uAC80\uC99D\uC744 \uC2E0\uC18D\uD788 \uCC98\uB9AC\uD558\uAE30 \uC704\uD574 \uACB0\uC81C \uC99D\uBA85\uC744 \uBCF4\uB0B4\uC8FC\uC2ED\uC2DC\uC624.",
    // Status
    accountStatus: "\uACC4\uC815 \uC0C1\uD0DC",
    accountActivated: "\uACC4\uC815\uC774 \uD65C\uC131\uD654\uB428",
    accountDeactivated: "\uACC4\uC815\uC774 \uBE44\uD65C\uC131\uD654\uB428",
    accountActivatedMessage: "\uC774\uC81C \uBAA8\uB4E0 EuroNova \uC11C\uBE44\uC2A4\uB97C \uC774\uC6A9\uD558\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    accountDeactivatedMessage: "\uC790\uC138\uD55C \uC815\uBCF4\uB098 \uACC4\uC815 \uC7AC\uD65C\uC131\uD654\uB97C \uC704\uD574 \uACE0\uAC1D \uC11C\uBE44\uC2A4\uC5D0 \uBB38\uC758\uD558\uC2ED\uC2DC\uC624.",
    accountStatusUpdate: "\uACC4\uC815 \uC0C1\uD0DC \uC5C5\uB370\uC774\uD2B8",
    accountActivationMsg: "\uADC0\uD558\uC758 \uACC4\uC815\uC774 \uD65C\uC131\uD654\uB418\uC5C8\uC74C\uC744 \uC54C\uB824\uB4DC\uB9BD\uB2C8\uB2E4. \uC774\uC81C \uC800\uD76C \uD50C\uB7AB\uD3FC\uC758 \uBAA8\uB4E0 \uAE30\uB2A5\uC5D0 \uC561\uC138\uC2A4\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    accountDeactivationMsg: "\uADC0\uD558\uC758 \uACC4\uC815\uC774 \uBE44\uD65C\uC131\uD654\uB418\uC5C8\uC74C\uC744 \uC54C\uB824\uB4DC\uB9BD\uB2C8\uB2E4. \uC790\uC138\uD55C \uC815\uBCF4\uB294 \uACE0\uAC1D \uC11C\uBE44\uC2A4\uC5D0 \uBB38\uC758\uD558\uC2ED\uC2DC\uC624.",
    // Welcome
    welcomeTitle: "EuroNova\uC5D0 \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4",
    welcomeSubject: "\uADC0\uD558\uC758 \uAE30\uBC00 \uC815\uBCF4",
    welcomeMessage: "EuroNova\uC5D0 \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4! \uADC0\uD558\uB97C \uC800\uD76C \uACE0\uAC1D\uC73C\uB85C \uBAA8\uC2DC\uAC8C \uB418\uC5B4 \uAE30\uC069\uB2C8\uB2E4.",
    trustedBankingPartner: "\uC2E0\uB8B0\uD560 \uC218 \uC788\uB294 \uC740\uD589 \uD30C\uD2B8\uB108",
    accountCreated: "\uACC4\uC815\uC774 \uC131\uACF5\uC801\uC73C\uB85C \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4! \uB2E4\uC74C\uC740 \uADC0\uD558\uC758 \uC2DD\uBCC4 \uC815\uBCF4\uC785\uB2C8\uB2E4:",
    accessCredentials: "\uB2E4\uC74C\uC740 \uADC0\uD558\uC758 \uC561\uC138\uC2A4 \uC790\uACA9 \uC99D\uBA85\uC785\uB2C8\uB2E4:",
    clientIdLabel: "\uD074\uB77C\uC774\uC5B8\uD2B8 ID:",
    passwordLabel: "\uBE44\uBC00\uBC88\uD638:",
    accountNumberLabel: "\uACC4\uC815 \uBC88\uD638:",
    cardInfoLabel: "\uC740\uD589 \uCE74\uB4DC \uC815\uBCF4:",
    cardNumberLabel: "\uCE74\uB4DC \uBC88\uD638:",
    cardExpiryDateLabel: "\uB9CC\uB8CC \uB0A0\uC9DC:",
    cardCvvLabel: "CVV:",
    securityWarning: "\uC774 \uC815\uBCF4\uB97C \uC548\uC804\uD558\uAC8C \uBCF4\uAD00\uD558\uACE0 \uB204\uAD6C\uC640\uB3C4 \uACF5\uC720\uD558\uC9C0 \uB9C8\uC2ED\uC2DC\uC624.",
    loginInvite: "\uC774\uC81C \uACE0\uAC1D \uC601\uC5ED\uC5D0 \uB85C\uADF8\uC778\uD558\uC5EC \uC800\uD76C \uC11C\uBE44\uC2A4\uB97C \uBC1C\uACAC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    confidentialInfo: "\uC774 \uBA54\uC2DC\uC9C0\uC5D0\uB294 \uAE30\uBC00 \uC815\uBCF4\uAC00 \uD3EC\uD568\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uB2F5\uC7A5\uD558\uC9C0 \uB9C8\uC2ED\uC2DC\uC624."
  }
};
function getTranslation(lang) {
  const supportedLang = lang === "fr" || lang === "en" || lang === "es" || lang === "de" || lang === "it" || lang === "ar" || lang === "zh" || lang === "ru" || lang === "pt" || lang === "ja" || lang === "ko" ? lang : "fr";
  return emailTranslations[supportedLang];
}
var apiKey = process.env.BREVO_API_KEY;
var BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
async function checkApiKey() {
  if (!apiKey) {
    console.error("\u274C Cl\xE9 API Brevo manquante");
    return false;
  }
  try {
    console.log("\u{1F511} V\xE9rification de la cl\xE9 API Brevo...");
    const response = await axios.get("https://api.brevo.com/v3/account", {
      headers: {
        "api-key": apiKey
      }
    });
    if (response.status === 200) {
      console.log("\u2705 Cl\xE9 API Brevo valide");
      console.log("\u{1F4E7} Infos du compte Brevo:", {
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        companyName: response.data.companyName
      });
      return true;
    } else {
      console.error("\u274C Cl\xE9 API Brevo invalide. Statut:", response.status);
      return false;
    }
  } catch (error) {
    console.error("\u274C Erreur lors de la v\xE9rification de la cl\xE9 API Brevo:");
    if (error instanceof Error) {
      console.error("- Message:", error.message);
    } else if (typeof error === "object" && error !== null && "response" in error) {
      const axiosError = error;
      if (axiosError.response) {
        console.error("- Statut:", axiosError.response.status);
        console.error("- Message:", axiosError.response.data);
      }
    } else {
      console.error("- Erreur inconnue:", error);
    }
    return false;
  }
}
async function sendEmail(to, subject, html, lang) {
  try {
    if (!to || !to.includes("@")) {
      console.error(`\u{1F4E7} Invalid email address: ${to}`);
      return false;
    }
    if (!apiKey) {
      console.log(`\u{1F4E7} ====== SIMULATION D'EMAIL (pas de cl\xE9 API Brevo) ======`);
      console.log(`\u{1F4E7} Email envoy\xE9 \xE0: ${to}`);
      console.log(`\u{1F4E7} Sujet: ${subject}`);
      console.log(`\u{1F4E7} Contenu: 
    ${html.length > 500 ? html.substring(0, 500) + "..." : html}`);
      console.log(`\u{1F4E7} ====== FIN SIMULATION ======`);
      return true;
    }
    const emailData = {
      sender: {
        name: "EuroNova Banking",
        email: "ecreditgroupe@gmail.com"
        // Utilisation de l'adresse email vérifiée dans Brevo
      },
      to: [
        {
          email: to
        }
      ],
      subject,
      htmlContent: html
    };
    console.log(`\u{1F4E7} Envoi d'email \xE0 ${to} via Brevo API...`);
    try {
      console.log(`\u{1F4E7} Envoi vers Brevo API avec les donn\xE9es:`, {
        to: emailData.to[0].email,
        from: emailData.sender.email,
        subject: emailData.subject
      });
      const response = await axios.post(BREVO_API_URL, emailData, {
        headers: {
          "accept": "application/json",
          "api-key": apiKey,
          "content-type": "application/json"
        }
      });
      console.log(`\u{1F4E7} Email envoy\xE9 avec succ\xE8s via Brevo (statut: ${response.status})`);
      console.log(`\u{1F4E7} R\xE9ponse Brevo:`, response.data);
      return true;
    } catch (err) {
      console.error(`\u{1F4E7} Erreur lors de l'envoi via Brevo:`);
      if (err.response) {
        console.error(`- Statut: ${err.response.status}`);
        console.error(`- Message: ${JSON.stringify(err.response.data)}`);
      } else {
        console.error(`- Message: ${err.message}`);
      }
      return false;
    }
  } catch (error) {
    console.error(`\u{1F4E7} Error sending email to ${to}:`);
    if (error instanceof Error) {
      console.error(`- Message: ${error.message}`);
    } else {
      console.error(`- Error: ${String(error)}`);
    }
    return false;
  }
}
async function sendTransactionEmail(user, transaction, account) {
  const userLang = user.language || "fr";
  const isCredit = transaction.toAccountId === account.id;
  const t = getTranslation(userLang);
  const transactionType = isCredit ? t.transactionCredit : t.transactionDebit;
  const subject = `${t.appName} - ${transactionType} ${isCredit ? "de" : "de"} ${Math.abs(transaction.amount)}\u20AC`;
  const transactionColor = isCredit ? "#28C76F" : "#EA5455";
  let formattedDate = t.dateNotAvailable;
  if (transaction.createdAt) {
    let locale = "fr-FR";
    if (userLang === "en") locale = "en-US";
    else if (userLang === "es") locale = "es-ES";
    else if (userLang === "de") locale = "de-DE";
    else if (userLang === "it") locale = "it-IT";
    else if (userLang === "ar") locale = "ar-SA";
    else if (userLang === "zh") locale = "zh-CN";
    else if (userLang === "ru") locale = "ru-RU";
    else if (userLang === "pt") locale = "pt-BR";
    else if (userLang === "ja") locale = "ja-JP";
    else if (userLang === "ko") locale = "ko-KR";
    if (transaction.createdAt instanceof Date) {
      formattedDate = transaction.createdAt.toLocaleString(locale);
    } else {
      formattedDate = new Date(transaction.createdAt).toLocaleString(locale);
    }
  }
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #191C33; margin: 0;"><span style="color: #7A73FF;">Euro</span>Nova</h1>
        <p style="color: #818181; margin-top: 5px;">${t.tagline}</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #191C33; margin-top: 0;">${t.transactionNotification}</h2>
        <p>${t.greeting(user.firstName, user.lastName)}</p>
        <p>${t.transactionInfo}</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: white; border-radius: 8px; border-left: 4px solid #7A73FF;">
          <p style="margin: 0 0 5px 0;"><strong>${t.transactionType}</strong> <span style="color: ${transactionColor};">${transactionType}</span></p>
          <p style="margin: 0 0 5px 0;"><strong>${t.transactionAmount}</strong> <span style="color: ${transactionColor};">${Math.abs(transaction.amount)} \u20AC</span></p>
          <p style="margin: 0 0 5px 0;"><strong>${t.transactionDate}</strong> ${formattedDate}</p>
          <p style="margin: 0;"><strong>${t.transactionDescription}</strong> ${transaction.description || t.noDescription}</p>
        </div>
        
        <p>${t.currentBalance} <strong>${account.balance} \u20AC</strong>.</p>
        <p>${t.transactionWarning}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.APP_URL || "http://localhost:5000"}/auth?username=${user.username}" style="display: inline-block; background-color: #7A73FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">${t.buttonAccessAccount}</a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e6e6; font-size: 12px; color: #818181; text-align: center;">
        <p>${t.footerAutomatedMsg}</p>
        <p>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} EuroNova. ${t.allRightsReserved}</p>
      </div>
    </div>
  `;
  return await sendEmail(user.email, subject, html, userLang);
}
async function sendPaymentReminderEmail(user, verificationStep, stepNumber) {
  const userLang = user.language || "fr";
  const t = getTranslation(userLang);
  const stepLabels = {
    fr: [
      "Frais d'enregistrement de cr\xE9dit",
      "Frais de virement international",
      "Frais de justice",
      "Frais d'assurance",
      "Frais d'autorisation de d\xE9caissement"
    ],
    en: [
      "Credit Registration Fee",
      "International Transfer Fee",
      "Legal Fee",
      "Insurance Fee",
      "Disbursement Authorization Fee"
    ],
    es: [
      "Tarifa de registro de cr\xE9dito",
      "Tarifa de transferencia internacional",
      "Tarifa legal",
      "Tarifa de seguro",
      "Tarifa de autorizaci\xF3n de desembolso"
    ],
    de: [
      "Kreditregistrierungsgeb\xFChr",
      "Internationale \xDCberweisungsgeb\xFChr",
      "Rechtsgeb\xFChr",
      "Versicherungsgeb\xFChr",
      "Auszahlungsautorisierungsgeb\xFChr"
    ],
    it: [
      "Commissione di registrazione credito",
      "Commissione di trasferimento internazionale",
      "Commissione legale",
      "Commissione di assicurazione",
      "Commissione di autorizzazione al prelievo"
    ],
    ar: [
      "\u0631\u0633\u0648\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0627\u0626\u062A\u0645\u0627\u0646",
      "\u0631\u0633\u0648\u0645 \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u062F\u0648\u0644\u064A",
      "\u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A\u0629",
      "\u0631\u0633\u0648\u0645 \u0627\u0644\u062A\u0623\u0645\u064A\u0646",
      "\u0631\u0633\u0648\u0645 \u062A\u0641\u0648\u064A\u0636 \u0627\u0644\u0635\u0631\u0641"
    ],
    zh: [
      "\u4FE1\u8D37\u6CE8\u518C\u8D39",
      "\u56FD\u9645\u8F6C\u8D26\u8D39",
      "\u6CD5\u5F8B\u8D39",
      "\u4FDD\u9669\u8D39",
      "\u652F\u4ED8\u6388\u6743\u8D39"
    ],
    ru: [
      "\u041A\u043E\u043C\u0438\u0441\u0441\u0438\u044F \u0437\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044E \u043A\u0440\u0435\u0434\u0438\u0442\u0430",
      "\u041A\u043E\u043C\u0438\u0441\u0441\u0438\u044F \u0437\u0430 \u043C\u0435\u0436\u0434\u0443\u043D\u0430\u0440\u043E\u0434\u043D\u044B\u0439 \u043F\u0435\u0440\u0435\u0432\u043E\u0434",
      "\u042E\u0440\u0438\u0434\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F",
      "\u0421\u0442\u0440\u0430\u0445\u043E\u0432\u0430\u044F \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F",
      "\u041A\u043E\u043C\u0438\u0441\u0441\u0438\u044F \u0437\u0430 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044E \u0432\u044B\u043F\u043B\u0430\u0442\u044B"
    ],
    pt: [
      "Taxa de registro de cr\xE9dito",
      "Taxa de transfer\xEAncia internacional",
      "Taxa legal",
      "Taxa de seguro",
      "Taxa de autoriza\xE7\xE3o de desembolso"
    ],
    ja: [
      "\u30AF\u30EC\u30B8\u30C3\u30C8\u767B\u9332\u624B\u6570\u6599",
      "\u56FD\u969B\u9001\u91D1\u624B\u6570\u6599",
      "\u6CD5\u7684\u624B\u6570\u6599",
      "\u4FDD\u967A\u624B\u6570\u6599",
      "\u652F\u6255\u3044\u627F\u8A8D\u624B\u6570\u6599"
    ],
    ko: [
      "\uC2E0\uC6A9 \uB4F1\uB85D \uC218\uC218\uB8CC",
      "\uAD6D\uC81C \uC1A1\uAE08 \uC218\uC218\uB8CC",
      "\uBC95\uC801 \uC218\uC218\uB8CC",
      "\uBCF4\uD5D8 \uC218\uC218\uB8CC",
      "\uC9C0\uAE09 \uC2B9\uC778 \uC218\uC218\uB8CC"
    ]
  };
  const currentStepLabels = stepLabels[userLang] || stepLabels.fr;
  const stepAmounts = [
    verificationStep.step1Amount,
    verificationStep.step2Amount,
    verificationStep.step3Amount,
    verificationStep.step4Amount,
    verificationStep.step5Amount
  ];
  const completedSteps = [
    verificationStep.step1Completed,
    verificationStep.step2Completed,
    verificationStep.step3Completed,
    verificationStep.step4Completed,
    verificationStep.step5Completed
  ].filter(Boolean).length;
  const deadlineDate = /* @__PURE__ */ new Date();
  deadlineDate.setDate(deadlineDate.getDate() + 3);
  const subject = `${t.appName} - ${t.paymentReminder}: ${currentStepLabels[stepNumber - 1]}`;
  let locale = "fr-FR";
  if (userLang === "en") locale = "en-US";
  else if (userLang === "es") locale = "es-ES";
  else if (userLang === "de") locale = "de-DE";
  else if (userLang === "it") locale = "it-IT";
  else if (userLang === "ar") locale = "ar-SA";
  else if (userLang === "zh") locale = "zh-CN";
  else if (userLang === "ru") locale = "ru-RU";
  else if (userLang === "pt") locale = "pt-BR";
  else if (userLang === "ja") locale = "ja-JP";
  else if (userLang === "ko") locale = "ko-KR";
  const progressText = `${t.currentStep} <strong>${completedSteps}/5</strong>`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #191C33; margin: 0;"><span style="color: #7A73FF;">Euro</span>Nova</h1>
        <p style="color: #818181; margin-top: 5px;">${t.tagline}</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #191C33; margin-top: 0;">${t.paymentReminder}</h2>
        <p>${t.greeting(user.firstName, user.lastName)}</p>
        <p>${t.stepPaymentRequired}</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: white; border-radius: 8px; border-left: 4px solid #FF9F43;">
          <p style="margin: 0 0 5px 0;"><strong>${t.currentStep}</strong> <span>${currentStepLabels[stepNumber - 1]}</span></p>
          <p style="margin: 0 0 5px 0;"><strong>${t.amountDue}</strong> <span>${stepAmounts[stepNumber - 1]} \u20AC</span></p>
          <p style="margin: 0;"><strong>${userLang === "en" ? "Deadline:" : userLang === "es" ? "Fecha l\xEDmite:" : userLang === "de" ? "Frist:" : userLang === "it" ? "Scadenza:" : userLang === "ar" ? "\u0627\u0644\u0645\u0648\u0639\u062F \u0627\u0644\u0646\u0647\u0627\u0626\u064A:" : userLang === "zh" ? "\u622A\u6B62\u65E5\u671F:" : userLang === "ru" ? "\u041A\u0440\u0430\u0439\u043D\u0438\u0439 \u0441\u0440\u043E\u043A:" : userLang === "pt" ? "Prazo:" : userLang === "ja" ? "\u671F\u9650:" : userLang === "ko" ? "\uB9C8\uAC10\uC77C:" : "Date limite:"}</strong> <span style="color: #EA5455;">${deadlineDate.toLocaleDateString(locale)}</span></p>
        </div>
        
        <p>${t.paymentInstructions}</p>
        <p>${progressText}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.APP_URL || "http://localhost:5000"}/auth?username=${user.username}&redirect=/client/payments" style="display: inline-block; background-color: #7A73FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">${t.buttonAccessAccount}</a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e6e6; font-size: 12px; color: #818181; text-align: center;">
        <p>${t.paymentHelp}</p>
        <p>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} EuroNova. ${t.allRightsReserved}</p>
      </div>
    </div>
  `;
  return await sendEmail(user.email, subject, html, userLang);
}
async function sendAccountStatusEmail(user, isActive) {
  const userLang = user.language || "fr";
  const t = getTranslation(userLang);
  const statusAction = isActive ? t.accountActivated : t.accountDeactivated;
  const subject = `${t.appName} - ${statusAction}`;
  const statusMessage = isActive ? `<strong style="color: #28C76F;">${t.accountActivated}</strong>. ${t.accountActivatedMessage}` : `<strong style="color: #EA5455;">${t.accountDeactivated}</strong>. ${t.accountDeactivatedMessage}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #191C33; margin: 0;"><span style="color: #7A73FF;">Euro</span>Nova</h1>
        <p style="color: #818181; margin-top: 5px;">${t.tagline}</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #191C33; margin-top: 0;">${t.accountStatus}</h2>
        <p>${t.greeting(user.firstName, user.lastName)}</p>
        
        <p>${statusMessage}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.APP_URL || "http://localhost:5000"}/auth?username=${user.username}&redirect=/client/support" style="display: inline-block; background-color: #7A73FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">${t.buttonContactSupport}</a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e6e6; font-size: 12px; color: #818181; text-align: center;">
        <p>${t.footerAutomatedMsg}</p>
        <p>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} EuroNova. ${t.allRightsReserved}</p>
      </div>
    </div>
  `;
  return await sendEmail(user.email, subject, html, userLang);
}
async function sendWelcomeEmail(user, accountNumber, clientId, password, cardNumber, cardExpiryDate, cardCvv) {
  const userLang = user.language || "fr";
  const t = getTranslation(userLang);
  const subject = `${t.appName} - ${t.welcomeSubject}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0c326f; margin: 0;"><span style="color: #0c326f;">Euro</span>Nova</h1>
        <p style="color: #818181; margin-top: 5px;">${t.trustedBankingPartner}</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #0c326f; margin-top: 0;">${t.welcomeTitle}</h2>
        <p>${t.greeting(user.firstName, user.lastName)}</p>
        <p>${t.welcomeMessage}</p>
        <p>${t.accountCreated}</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: white; border-radius: 8px; border-left: 4px solid #0c326f;">
          <p style="margin: 0 0 5px 0;"><strong>${t.clientIdLabel}</strong> <span>${clientId || user.username}</span></p>
          <p style="margin: 0 0 5px 0;"><strong>${t.passwordLabel}</strong> <span>${password || "********"}</span></p>
          <p style="margin: 0 0 5px 0;"><strong>${t.accountNumberLabel}</strong> <span>${accountNumber}</span></p>
          ${cardNumber ? `
          <hr style="margin: 10px 0; border: none; border-top: 1px solid #e6e6e6;" />
          <p style="margin: 10px 0 5px 0;"><strong>${t.cardInfoLabel}</strong></p>
          <p style="margin: 0 0 5px 0;"><strong>${t.cardNumberLabel}</strong> <span>${cardNumber}</span></p>
          <p style="margin: 0 0 5px 0;"><strong>${t.cardExpiryDateLabel}</strong> <span>${cardExpiryDate}</span></p>
          <p style="margin: 0 0 5px 0;"><strong>${t.cardCvvLabel}</strong> <span>${cardCvv}</span></p>
          ` : ""}
        </div>
        
        <p style="color: #EA5455; font-weight: bold;">${t.securityWarning}</p>
        <p>${t.loginInvite}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.APP_URL || "http://localhost:5000"}/auth?username=${user.username}&redirect=/client/dashboard" style="display: inline-block; background-color: #0c326f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">${t.buttonAccessAccount}</a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e6e6; font-size: 12px; color: #818181; text-align: center;">
        <p>${t.confidentialInfo}</p>
        <p>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} EuroNova. ${t.allRightsReserved}</p>
      </div>
    </div>
  `;
  return await sendEmail(user.email, subject, html, userLang);
}
async function sendEmailByType(type, user, data) {
  const userLanguage = user.language || "fr";
  switch (type) {
    case "transaction":
      return sendTransactionEmail(user, data.transaction, data.account);
    case "reminder":
      return sendPaymentReminderEmail(user, data.verificationStep, data.stepNumber);
    case "status":
      return sendAccountStatusEmail(user, data.isActive);
    case "welcome":
      return sendWelcomeEmail(
        user,
        data.accountNumber,
        data.clientId,
        data.password,
        data.cardNumber,
        data.cardExpiryDate,
        data.cardCvv
      );
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

// server/auth.ts
var MemoryStore = createMemoryStore(session);
var scryptAsync = promisify(scrypt);
function generateClientId() {
  return `CN-${Math.floor(1e3 + Math.random() * 9e3)}-${Math.floor(1e3 + Math.random() * 9e3)}`;
}
function generateRIB() {
  return `FR76 ${Math.floor(1e3 + Math.random() * 9e3)} ${Math.floor(1e3 + Math.random() * 9e3)} ${Math.floor(1e3 + Math.random() * 9e3)} ${Math.floor(1e3 + Math.random() * 9e3)} ${Math.floor(100 + Math.random() * 900)}`;
}
function generateCardNumber() {
  return `${Math.floor(1e3 + Math.random() * 9e3)} ${Math.floor(1e3 + Math.random() * 9e3)} ${Math.floor(1e3 + Math.random() * 9e3)} ${Math.floor(1e3 + Math.random() * 9e3)}`;
}
function generateExpiryDate() {
  const now = /* @__PURE__ */ new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String((now.getFullYear() + 4) % 100).padStart(2, "0");
  return `${month}/${year}`;
}
function generateCVV() {
  return String(Math.floor(100 + Math.random() * 900));
}
function generateSecurePassword() {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  if (!stored || !stored.includes(".")) {
    console.error("Format de mot de passe stock\xE9 invalide:", stored);
    return false;
  }
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) {
    console.error("Hash ou sel manquant dans le mot de passe stock\xE9");
    return false;
  }
  console.log(`Comparing password: supplied=${supplied}, salt=${salt}`);
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  const result = timingSafeEqual(hashedBuf, suppliedBuf);
  console.log(`Password comparison result: ${result}`);
  return result;
}
function setupAuth(app2) {
  const isProduction = process.env.NODE_ENV === "production";
  const sessionSecret = process.env.SESSION_SECRET || "euronova-session-secret-key-for-development";
  console.log("Setting up auth with session store...");
  const sessionSettings = {
    name: "euronova.sid",
    // Nom personnalisé du cookie pour plus de sécurité
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 864e5
      // 24 hours
    }),
    cookie: {
      secure: false,
      // Désactivé même en production pour les tests
      sameSite: false,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7 jours
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (user.isActive === false) {
          return done(null, false, { message: "Account is inactive or blocked." });
        }
        if (await comparePasswords(password, user.password)) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password." });
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/register", async (req, res) => {
    try {
      const {
        username: providedUsername,
        password: providedPassword,
        email,
        firstName,
        lastName,
        role = "client"
      } = req.body;
      const clientId = generateClientId();
      const username = providedUsername || clientId;
      let password = providedPassword;
      let generatedPassword = null;
      if (role === "client" && !providedPassword) {
        generatedPassword = generateSecurePassword();
        password = generatedPassword;
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        role,
        isActive: true
      });
      let accountNumber = "";
      let cardNumber = "";
      let cardExpiryDate = "";
      let cardCvv = "";
      if (role === "client") {
        accountNumber = generateRIB();
        const account = await storage.createAccount({
          userId: user.id,
          accountNumber,
          accountType: "current",
          balance: 0,
          currency: "EUR",
          isActive: true
        });
        cardNumber = generateCardNumber();
        cardExpiryDate = generateExpiryDate();
        cardCvv = generateCVV();
        await storage.createCard({
          userId: user.id,
          accountId: account.id,
          cardNumber,
          cardType: "visa",
          cardholderName: `${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}`,
          expiryDate: cardExpiryDate,
          cvv: cardCvv,
          isVirtual: false,
          isActive: true
        });
        await storage.createVerificationStep({
          userId: user.id,
          step1Completed: false,
          step1Amount: 100,
          // Montant par défaut pour l'étape 1
          step2Completed: false,
          step2Amount: 150,
          // Montant par défaut pour l'étape 2
          step3Completed: false,
          step3Amount: 200,
          // Montant par défaut pour l'étape 3
          step4Completed: false,
          step4Amount: 250,
          // Montant par défaut pour l'étape 4
          step5Completed: false,
          step5Amount: 300
          // Montant par défaut pour l'étape 5
        });
        try {
          console.log(`Tentative d'envoi d'email \xE0 ${user.email} pour l'utilisateur ${user.username}`);
          const emailResult = await sendEmailByType("welcome", user, {
            accountNumber,
            clientId,
            password: generatedPassword,
            cardNumber,
            cardExpiryDate,
            cardCvv
          });
          if (emailResult) {
            console.log(`\u2705 Credentials email sent successfully to ${user.email}`);
          } else {
            console.error(`\u274C Failed to send credentials email to ${user.email}`);
          }
        } catch (emailError) {
          console.error(`\u274C Error sending credentials email to ${user.email}:`, emailError);
        }
        try {
          await storage.createNotification({
            userId: user.id,
            title: "Bienvenue chez EuroNova",
            type: "welcome",
            message: "Votre compte a \xE9t\xE9 cr\xE9\xE9 avec succ\xE8s. V\xE9rifiez votre email pour vos informations d'identification.",
            isRead: false
          });
        } catch (notifError) {
          console.error("Error creating welcome notification:", notifError);
        }
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        const userResponse = { ...user };
        delete userResponse.password;
        if (role === "admin" && generatedPassword) {
          userResponse.generatedCredentials = {
            accountNumber,
            clientId,
            password: generatedPassword,
            cardNumber,
            cardExpiryDate,
            cardCvv
          };
        }
        return res.status(201).json(userResponse);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error during registration" });
    }
  });
  app2.post("/api/login", async (req, res, next) => {
    let { username, password } = req.body;
    console.log("Login attempt for:", username);
    if (username.includes("@")) {
      try {
        const userByEmail = await storage.getUserByEmail(username);
        if (userByEmail) {
          console.log(`Found user by email: ${username} -> username: ${userByEmail.username}`);
          username = userByEmail.username;
        }
      } catch (error) {
        console.error("Error finding user by email:", error);
      }
    }
    if (username.startsWith("BRV-")) {
      try {
        const userId = parseInt(username.replace("BRV-", ""));
        if (!isNaN(userId)) {
          const user = await storage.getUser(userId);
          if (user) {
            console.log(`Found user by BRV ID: ${username} -> username: ${user.username}`);
            username = user.username;
          }
        }
      } catch (error) {
        console.error("Error finding user by BRV ID:", error);
      }
    }
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      if (!user) {
        console.log("Authentication failed:", info?.message);
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      console.log("User authenticated:", user.username, "with role:", user.role);
      req.login(user, (err2) => {
        if (err2) {
          console.error("Session error:", err2);
          return next(err2);
        }
        const userResponse = { ...user };
        delete userResponse.password;
        console.log("Login successful for:", user.username);
        return res.status(200).json(userResponse);
      });
    })({ ...req, body: { username, password } }, res, next);
  });
  app2.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.status(200).json({ message: "Logout successful" });
    });
  });
  app2.get("/api/user", (req, res) => {
    console.log("GET /api/user - isAuthenticated:", req.isAuthenticated());
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    console.log("User data:", req.user);
    const userResponse = { ...req.user };
    delete userResponse.password;
    console.log("Sending user data:", userResponse);
    res.status(200).json(userResponse);
  });
  return app2;
}

// server/storage.ts
var MemStorage = class {
  constructor() {
    // Payment Account operations
    this.paymentAccounts = /* @__PURE__ */ new Map();
    this.users = global.users || /* @__PURE__ */ new Map();
    this.accounts = global.accounts || /* @__PURE__ */ new Map();
    this.cards = global.cards || /* @__PURE__ */ new Map();
    this.transactions = global.transactions || /* @__PURE__ */ new Map();
    this.verificationSteps = global.verificationSteps || /* @__PURE__ */ new Map();
    this.notifications = global.notifications || /* @__PURE__ */ new Map();
    this.systemSettings = global.systemSettings || /* @__PURE__ */ new Map();
    global.users = this.users;
    global.accounts = this.accounts;
    global.cards = this.cards;
    global.transactions = this.transactions;
    global.verificationSteps = this.verificationSteps;
    global.notifications = this.notifications;
    global.systemSettings = this.systemSettings;
    this.currentId = global.currentId || {
      users: 1,
      accounts: 1,
      cards: 1,
      transactions: 1,
      verificationSteps: 1,
      notifications: 1,
      systemSettings: 1
    };
    global.currentId = this.currentId;
    this.createDefaultUsers();
  }
  async createDefaultUsers() {
    try {
      const adminExists = await this.getUserByUsername("admin");
      if (!adminExists) {
        const hashedAdminPassword = await hashPassword("admin123");
        const admin = {
          id: this.currentId.users++,
          username: "admin",
          password: hashedAdminPassword,
          email: "admin@euronova.com",
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          // Rôle admin pour les opérations administratives
          isActive: true,
          createdAt: /* @__PURE__ */ new Date(),
          phone: null,
          address: null,
          dateOfBirth: null,
          idType: null,
          idNumber: null,
          profileImage: null
        };
        this.users.set(admin.id, admin);
        console.log("Admin created with ID:", admin.id);
      }
      const clientExists = await this.getUserByUsername("client1");
      if (!clientExists) {
        const hashedClientPassword = "c1507c63632cea7bf18c26c82e06f80f9db75f7a904000682be5ef986ae603d45c6db08a11c3ccc5d77e5b58d93773fea4ce1913b5a20ff20ed20e817b6109bd.0037633161e6948c5dac494581ea7e9b";
        const client = {
          id: this.currentId.users++,
          username: "client1",
          password: hashedClientPassword,
          email: "client1@example.com",
          firstName: "Client",
          lastName: "One",
          role: "client",
          isActive: true,
          createdAt: /* @__PURE__ */ new Date(),
          phone: null,
          address: null,
          dateOfBirth: null,
          idType: null,
          idNumber: null,
          profileImage: null
        };
        this.users.set(client.id, client);
        console.log("Client created with ID:", client.id);
        const account = {
          id: this.currentId.accounts++,
          userId: client.id,
          accountNumber: this.generateAccountNumber(),
          accountType: "current",
          balance: 1e3,
          // Solde initial pour faciliter les tests
          currency: "EUR",
          isActive: true,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.accounts.set(account.id, account);
        const card = {
          id: this.currentId.cards++,
          userId: client.id,
          accountId: account.id,
          cardNumber: this.generateCardNumber(),
          cardType: "visa",
          cardholderName: `${client.firstName.toUpperCase()} ${client.lastName.toUpperCase()}`,
          expiryDate: this.generateExpiryDate(),
          cvv: this.generateCVV(),
          isVirtual: false,
          isActive: true,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.cards.set(card.id, card);
        const verificationStep = {
          id: this.currentId.verificationSteps++,
          userId: client.id,
          transactionId: null,
          step1Completed: false,
          step1Amount: 75,
          step1Date: null,
          step2Completed: false,
          step2Amount: 150,
          step2Date: null,
          step3Completed: false,
          step3Amount: 225,
          step3Date: null,
          step4Completed: false,
          step4Amount: 180,
          step4Date: null,
          step5Completed: false,
          step5Amount: 95,
          step5Date: null,
          notes: null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.verificationSteps.set(verificationStep.id, verificationStep);
      }
    } catch (error) {
      console.error("Error creating default users:", error);
    }
  }
  // Helper functions
  generateAccountNumber() {
    return `FR76 ${Math.floor(1e3 + Math.random() * 9e3)} ${Math.floor(1e3 + Math.random() * 9e3)} ${Math.floor(1e3 + Math.random() * 9e3)} ${Math.floor(1e3 + Math.random() * 9e3)} ${Math.floor(100 + Math.random() * 900)}`;
  }
  generateCardNumber() {
    return `${Math.floor(1e3 + Math.random() * 9e3)} ${Math.floor(1e3 + Math.random() * 9e3)} ${Math.floor(1e3 + Math.random() * 9e3)} ${Math.floor(1e3 + Math.random() * 9e3)}`;
  }
  generateExpiryDate() {
    const now = /* @__PURE__ */ new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String((now.getFullYear() + 4) % 100).padStart(2, "0");
    return `${month}/${year}`;
  }
  generateCVV() {
    return String(Math.floor(100 + Math.random() * 900));
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }
  async getAllUsers() {
    return Array.from(this.users.values());
  }
  async createUser(userData) {
    const id = this.currentId.users++;
    const now = /* @__PURE__ */ new Date();
    const user = { ...userData, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, data) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  // Account operations
  async getAccount(id) {
    return this.accounts.get(id);
  }
  async getAccountByNumber(accountNumber) {
    return Array.from(this.accounts.values()).find(
      (account) => account.accountNumber === accountNumber
    );
  }
  async getAccountsByUserId(userId) {
    return Array.from(this.accounts.values()).filter(
      (account) => account.userId === userId
    );
  }
  async createAccount(accountData) {
    const id = this.currentId.accounts++;
    const now = /* @__PURE__ */ new Date();
    const accountNumber = accountData.accountNumber || this.generateAccountNumber();
    const account = {
      ...accountData,
      id,
      accountNumber,
      createdAt: now
    };
    this.accounts.set(id, account);
    return account;
  }
  async updateAccount(id, data) {
    const account = this.accounts.get(id);
    if (!account) return void 0;
    const updatedAccount = { ...account, ...data };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }
  // Card operations
  async getCard(id) {
    return this.cards.get(id);
  }
  async getCardsByAccountId(accountId) {
    return Array.from(this.cards.values()).filter(
      (card) => card.accountId === accountId
    );
  }
  async getCardsByUserId(userId) {
    return Array.from(this.cards.values()).filter(
      (card) => card.userId === userId
    );
  }
  async createCard(cardData) {
    const id = this.currentId.cards++;
    const now = /* @__PURE__ */ new Date();
    const cardNumber = cardData.cardNumber || this.generateCardNumber();
    const expiryDate = cardData.expiryDate || this.generateExpiryDate();
    const cvv = cardData.cvv || this.generateCVV();
    const card = {
      ...cardData,
      id,
      cardNumber,
      expiryDate,
      cvv,
      createdAt: now
    };
    this.cards.set(id, card);
    return card;
  }
  async updateCard(id, data) {
    const card = this.cards.get(id);
    if (!card) return void 0;
    const updatedCard = { ...card, ...data };
    this.cards.set(id, updatedCard);
    return updatedCard;
  }
  // Transaction operations
  async getTransaction(id) {
    return this.transactions.get(id);
  }
  async getTransactionsByAccountId(accountId) {
    console.log(`Recherche des transactions pour le compte ${accountId}, il y a ${this.transactions.size} transactions au total`);
    const transactions2 = Array.from(this.transactions.values()).filter(
      (tx) => {
        const isFromAccount = tx.fromAccountId === accountId;
        const isToAccount = tx.toAccountId === accountId;
        if (isFromAccount || isToAccount) {
          console.log(`Transaction trouv\xE9e: ID=${tx.id}, Type=${tx.type}, Montant=${tx.amount}, De=${tx.fromAccountId}, Vers=${tx.toAccountId}`);
        }
        return isFromAccount || isToAccount;
      }
    );
    console.log(`${transactions2.length} transactions trouv\xE9es pour le compte ${accountId}`);
    return transactions2.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }
  async createTransaction(transactionData) {
    const id = this.currentId.transactions++;
    const now = /* @__PURE__ */ new Date();
    const transaction = {
      ...transactionData,
      id,
      createdAt: now
    };
    this.transactions.set(id, transaction);
    if (transaction.fromAccountId) {
      const fromAccount = await this.getAccount(transaction.fromAccountId);
      if (fromAccount) {
        await this.updateAccount(fromAccount.id, {
          balance: fromAccount.balance - transaction.amount
        });
      }
    }
    if (transaction.toAccountId) {
      const toAccount = await this.getAccount(transaction.toAccountId);
      if (toAccount) {
        await this.updateAccount(toAccount.id, {
          balance: toAccount.balance + transaction.amount
        });
      }
    }
    return transaction;
  }
  // Verification steps operations
  async getVerificationStep(id) {
    return this.verificationSteps.get(id);
  }
  async getVerificationStepByUserId(userId) {
    return Array.from(this.verificationSteps.values()).find(
      (step) => step.userId === userId
    );
  }
  async createVerificationStep(stepData) {
    const id = this.currentId.verificationSteps++;
    const now = /* @__PURE__ */ new Date();
    const step = {
      ...stepData,
      id,
      createdAt: now
    };
    this.verificationSteps.set(id, step);
    return step;
  }
  async updateVerificationStep(id, data) {
    const step = this.verificationSteps.get(id);
    if (!step) return void 0;
    const updatedStep = { ...step, ...data };
    this.verificationSteps.set(id, updatedStep);
    return updatedStep;
  }
  // Notification operations
  async getNotificationsByUserId(userId) {
    return Array.from(this.notifications.values()).filter((notification) => notification.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async createNotification(notificationData) {
    const id = this.currentId.notifications++;
    const now = /* @__PURE__ */ new Date();
    const notification = {
      ...notificationData,
      id,
      createdAt: now
    };
    this.notifications.set(id, notification);
    return notification;
  }
  async markNotificationAsRead(id) {
    const notification = this.notifications.get(id);
    if (!notification) return void 0;
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
  async getPaymentAccountForStep(stepNumber) {
    return this.paymentAccounts.get(stepNumber);
  }
  async updatePaymentAccountForStep(stepNumber, data) {
    this.paymentAccounts.set(stepNumber, data);
    return data;
  }
  // System Settings operations
  async getSystemSetting(key) {
    return Array.from(this.systemSettings.values()).find(
      (setting) => setting.settingKey === key
    );
  }
  async getAllSystemSettings() {
    return Array.from(this.systemSettings.values());
  }
  async createSystemSetting(settingData) {
    const id = this.currentId.systemSettings++;
    const now = /* @__PURE__ */ new Date();
    const setting = {
      ...settingData,
      id,
      updatedAt: now
    };
    this.systemSettings.set(setting.settingKey, setting);
    return setting;
  }
  async updateSystemSetting(key, value, userId) {
    const setting = Array.from(this.systemSettings.values()).find((s) => s.settingKey === key);
    if (!setting) return void 0;
    const now = /* @__PURE__ */ new Date();
    const updatedSetting = {
      ...setting,
      settingValue: value,
      updatedAt: now,
      updatedBy: userId
    };
    this.systemSettings.set(key, updatedSetting);
    return updatedSetting;
  }
};
var storage = new MemStorage();

// server/routes.ts
import { z } from "zod";

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("client"),
  // client or admin
  phone: text("phone"),
  address: text("address"),
  dateOfBirth: text("date_of_birth"),
  idType: text("id_type"),
  idNumber: text("id_number"),
  language: text("language").default("fr"),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  profileImage: text("profile_image")
});
var accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  accountNumber: text("account_number").notNull().unique(),
  accountType: text("account_type").notNull(),
  // current, savings, etc.
  balance: doublePrecision("balance").notNull().default(0),
  currency: text("currency").notNull().default("EUR"),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true)
});
var cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  cardNumber: text("card_number").notNull().unique(),
  cardType: text("card_type").notNull(),
  // visa, mastercard, etc.
  cardholderName: text("cardholder_name").notNull(),
  expiryDate: text("expiry_date").notNull(),
  cvv: text("cvv").notNull(),
  isVirtual: boolean("is_virtual").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  fromAccountId: integer("from_account_id").references(() => accounts.id),
  toAccountId: integer("to_account_id").references(() => accounts.id),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").notNull().default("EUR"),
  type: text("type").notNull(),
  // deposit, withdrawal, transfer, etc.
  status: text("status").notNull().default("completed"),
  // completed, pending, failed
  reference: text("reference"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  category: text("category")
  // salary, groceries, etc.
});
var verificationSteps = pgTable("verification_steps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  transactionId: integer("transaction_id").references(() => transactions.id),
  step1Completed: boolean("step1_completed").default(false),
  step1Amount: doublePrecision("step1_amount").default(75),
  step1Date: timestamp("step1_date"),
  step2Completed: boolean("step2_completed").default(false),
  step2Amount: doublePrecision("step2_amount").default(150),
  step2Date: timestamp("step2_date"),
  step3Completed: boolean("step3_completed").default(false),
  step3Amount: doublePrecision("step3_amount").default(225),
  step3Date: timestamp("step3_date"),
  step4Completed: boolean("step4_completed").default(false),
  step4Amount: doublePrecision("step4_amount").default(180),
  step4Date: timestamp("step4_date"),
  step5Completed: boolean("step5_completed").default(false),
  step5Amount: doublePrecision("step5_amount").default(95),
  step5Date: timestamp("step5_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  // transaction, verification, etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata")
});
var systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id)
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true
});
var insertCardSchema = createInsertSchema(cards).omit({
  id: true,
  createdAt: true
});
var insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true
});
var insertVerificationStepSchema = createInsertSchema(verificationSteps).omit({
  id: true,
  createdAt: true
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});
var insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true
});

// server/routes.ts
var requireRole = (role) => (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.user && req.user.role !== role) {
    console.log(`Role check failed: User role is ${req.user.role}, required role is ${role}`);
    return res.status(403).json({ message: "Not authorized" });
  }
  next();
};
var isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};
async function registerRoutes(app2) {
  const isApiKeyValid = await checkApiKey();
  console.log(`Cl\xE9 API Brevo v\xE9rifi\xE9e. Valide: ${isApiKeyValid}`);
  setupAuth(app2);
  app2.get("/api/init-admin", async (req, res) => {
    try {
      const existingAdmin = await storage.getUserByUsername("admin");
      if (existingAdmin) {
        return res.status(200).json({ message: "Admin existe d\xE9j\xE0", id: existingAdmin.id });
      }
      const hashedPassword = await hashPassword("admin123");
      const admin = await storage.createUser({
        username: "admin",
        password: hashedPassword,
        email: "admin@euronova.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        isActive: true
      });
      res.status(201).json({ message: "Admin cr\xE9\xE9 avec succ\xE8s", id: admin.id });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Error creating admin" });
    }
  });
  app2.get("/api/users", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const safeUsers = users2.map((user) => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      res.status(200).json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  app2.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (req.user.role !== "admin" && req.user.id !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...safeUser } = user;
      res.status(200).json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Error fetching user" });
    }
  });
  app2.get("/api/users/:id/details", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const accounts2 = await storage.getAccountsByUserId(userId);
      const cards2 = [];
      for (const account of accounts2) {
        const accountCards = await storage.getCardsByAccountId(account.id);
        cards2.push(...accountCards);
      }
      const userDetails = {
        ...user,
        accounts: accounts2,
        cards: cards2
      };
      res.status(200).json(userDetails);
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ message: "Error fetching user details" });
    }
  });
  app2.post("/api/users/:id/resend-credentials", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouv\xE9" });
      }
      const accounts2 = await storage.getAccountsByUserId(userId);
      if (!accounts2 || accounts2.length === 0) {
        return res.status(404).json({ message: "Aucun compte bancaire trouv\xE9 pour cet utilisateur" });
      }
      const account = accounts2[0];
      const cards2 = await storage.getCardsByAccountId(account.id);
      const card = cards2 && cards2.length > 0 ? cards2[0] : null;
      const generateNewPassword = req.body.generateNewPassword === true;
      let newPassword = null;
      if (generateNewPassword) {
        newPassword = generateSecurePassword();
        const hashedPassword = await hashPassword(newPassword);
        await storage.updateUser(userId, { password: hashedPassword });
      }
      const transactions2 = await storage.getTransactionsByAccountId(account.id);
      if (transactions2.length === 0 && account.balance > 0) {
        console.log(`Aucune transaction trouv\xE9e pour le compte ${account.id} avec un solde de ${account.balance}. Cr\xE9ation d'une transaction de d\xE9p\xF4t initial.`);
        const depositTransaction = {
          type: "deposit",
          amount: account.balance,
          status: "completed",
          description: "D\xE9p\xF4t initial",
          currency: "EUR",
          toAccountId: account.id,
          reference: `DEP-${Date.now()}`,
          category: "deposit",
          fromAccountId: null
        };
        try {
          const transaction = await storage.createTransaction(depositTransaction);
          console.log(`Transaction de d\xE9p\xF4t initial cr\xE9\xE9e avec ID ${transaction.id} pour le montant ${account.balance}\u20AC`);
          await storage.createNotification({
            userId: user.id,
            type: "transaction",
            title: "D\xE9p\xF4t initial effectu\xE9",
            message: `Un d\xE9p\xF4t initial de ${account.balance}\u20AC a \xE9t\xE9 effectu\xE9 sur votre compte.`,
            isRead: false
          });
          await sendEmailByType("transaction", user, {
            transaction,
            account
          });
        } catch (error) {
          console.error("Erreur lors de la cr\xE9ation de la transaction initiale:", error);
        }
      }
      console.log(`Renvoi des identifiants \xE0 ${user.email}`);
      const emailResult = await sendEmailByType("welcome", user, {
        accountNumber: account.accountNumber,
        clientId: user.username,
        password: newPassword,
        // Sera null si aucun nouveau mot de passe n'est généré
        cardNumber: card ? card.cardNumber : void 0,
        cardExpiryDate: card ? card.expiryDate : void 0,
        cardCvv: card ? card.cvv : void 0
      });
      await storage.createNotification({
        userId: user.id,
        title: "Informations d'identification renvoy\xE9es",
        type: "welcome",
        message: "Vos informations d'identification ont \xE9t\xE9 renvoy\xE9es par email.",
        isRead: false
      });
      if (emailResult) {
        return res.status(200).json({
          message: "Identifiants renvoy\xE9s avec succ\xE8s",
          emailSent: true,
          newPasswordGenerated: generateNewPassword
        });
      } else {
        return res.status(500).json({
          message: "Erreur lors de l'envoi de l'email, mais les informations ont \xE9t\xE9 trait\xE9es",
          emailSent: false,
          newPasswordGenerated: generateNewPassword
        });
      }
    } catch (error) {
      console.error("Error resending credentials:", error);
      res.status(500).json({ message: "Erreur lors du renvoi des identifiants" });
    }
  });
  app2.patch("/api/users/:id/language", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (req.user.role !== "admin" && req.user.id !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const { language } = req.body;
      if (!language) {
        return res.status(400).json({ message: "Language is required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.updateUser(userId, { language });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...safeUser } = updatedUser;
      res.status(200).json(safeUser);
    } catch (error) {
      console.error("Error updating user language:", error);
      res.status(500).json({ message: "Error updating user language" });
    }
  });
  app2.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (req.user.role !== "admin" && req.user.id !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (req.body.role && req.user.role !== "admin") {
        delete req.body.role;
      }
      delete req.body.password;
      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      if (req.body.isActive !== void 0 && user.isActive !== req.body.isActive) {
        await sendEmailByType("status", user, { isActive: req.body.isActive });
        await storage.createNotification({
          userId: user.id,
          type: "status",
          title: `Compte ${req.body.isActive ? "activ\xE9" : "d\xE9sactiv\xE9"}`,
          message: `Votre compte a \xE9t\xE9 ${req.body.isActive ? "activ\xE9" : "d\xE9sactiv\xE9"}.`,
          isRead: false
        });
      }
      const { password, ...safeUser } = updatedUser;
      res.status(200).json(safeUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  });
  app2.get("/api/accounts", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const accountsPromises = users2.map(async (user) => {
        const accounts2 = await storage.getAccountsByUserId(user.id);
        for (const account of accounts2) {
          const transactions2 = await storage.getTransactionsByAccountId(account.id);
          if (transactions2.length === 0 && account.balance > 0) {
            console.log(`No transactions found for account ${account.id} with balance ${account.balance}. Creating initial deposit transaction.`);
            const depositTransaction = {
              type: "deposit",
              amount: account.balance,
              status: "completed",
              description: "D\xE9p\xF4t initial",
              currency: "EUR",
              toAccountId: account.id,
              reference: `DEP-${Date.now()}`,
              category: "deposit",
              fromAccountId: null
            };
            const transactionId = storage.currentId.transactions++;
            const transaction = {
              ...depositTransaction,
              id: transactionId,
              createdAt: /* @__PURE__ */ new Date()
            };
            storage.transactions.set(transactionId, transaction);
            console.log(`Initial deposit transaction created with ID ${transactionId} for amount ${account.balance}\u20AC`);
          }
        }
        return accounts2.map((account) => ({
          ...account,
          user: {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
        }));
      });
      const accountsByUser = await Promise.all(accountsPromises);
      const allAccounts = accountsByUser.flat();
      res.status(200).json(allAccounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ message: "Error fetching accounts" });
    }
  });
  app2.get("/api/accounts/user", isAuthenticated, async (req, res) => {
    try {
      console.log(`R\xE9cup\xE9ration des comptes pour l'utilisateur ${req.user.id}`);
      const accounts2 = await storage.getAccountsByUserId(req.user.id);
      console.log(`${accounts2.length} comptes trouv\xE9s`);
      for (const account of accounts2) {
        console.log(`V\xE9rification des transactions pour le compte ${account.id} avec solde ${account.balance}`);
        const transactions2 = await storage.getTransactionsByAccountId(account.id);
        console.log(`${transactions2.length} transactions trouv\xE9es pour le compte ${account.id}`);
        if (transactions2.length === 0 && account.balance > 0) {
          console.log(`Aucune transaction trouv\xE9e pour un compte avec solde. Cr\xE9ation d'une transaction de d\xE9p\xF4t initial pour le compte ${account.id} avec solde ${account.balance}`);
          try {
            const depositTransaction = await storage.createTransaction({
              type: "deposit",
              amount: account.balance,
              status: "completed",
              description: "D\xE9p\xF4t initial",
              currency: "EUR",
              toAccountId: account.id,
              reference: `DEP-${Date.now()}`,
              category: "deposit",
              fromAccountId: null
            });
            console.log(`Transaction de d\xE9p\xF4t initial cr\xE9\xE9e avec ID ${depositTransaction.id}`);
            await storage.createNotification({
              userId: req.user.id,
              type: "transaction",
              title: "D\xE9p\xF4t initial effectu\xE9",
              message: `Un d\xE9p\xF4t initial de ${account.balance}\u20AC a \xE9t\xE9 effectu\xE9 sur votre compte.`,
              isRead: false
            });
          } catch (error) {
            console.error("Erreur lors de la cr\xE9ation de la transaction initiale:", error);
          }
        }
      }
      res.status(200).json(accounts2);
    } catch (error) {
      console.error("Error fetching user accounts:", error);
      res.status(500).json({ message: "Error fetching user accounts" });
    }
  });
  app2.get("/api/users/:userId/accounts", requireRole("admin"), async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      console.log(`[ADMIN] R\xE9cup\xE9ration des comptes pour l'utilisateur ${userId}`);
      const accounts2 = await storage.getAccountsByUserId(userId);
      console.log(`[ADMIN] ${accounts2.length} comptes trouv\xE9s pour l'utilisateur ${userId}`);
      res.status(200).json(accounts2);
    } catch (error) {
      console.error(`Error fetching accounts for user ${req.params.userId}:`, error);
      res.status(500).json({ message: "Error fetching user accounts" });
    }
  });
  app2.get("/api/accounts/:id", isAuthenticated, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const account = await storage.getAccount(accountId);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      if (req.user.role !== "admin" && req.user.id !== account.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      res.status(200).json(account);
    } catch (error) {
      console.error("Error fetching account:", error);
      res.status(500).json({ message: "Error fetching account" });
    }
  });
  app2.post("/api/accounts", isAuthenticated, async (req, res) => {
    try {
      const accountData = insertAccountSchema.parse(req.body);
      console.log("Creating account with data:", JSON.stringify(accountData));
      if (typeof accountData.balance === "string") {
        accountData.balance = parseFloat(accountData.balance);
      }
      const account = await storage.createAccount(accountData);
      console.log("Account created:", JSON.stringify(account));
      if (account.balance > 0) {
        const depositTransaction = {
          type: "deposit",
          amount: account.balance,
          status: "completed",
          description: "D\xE9p\xF4t initial",
          currency: "EUR",
          toAccountId: account.id,
          reference: `DEP-${Date.now()}`,
          category: "deposit"
        };
        console.log("Creating initial deposit transaction:", JSON.stringify(depositTransaction));
        const transactionId = storage.currentId.transactions++;
        const transaction = {
          ...depositTransaction,
          id: transactionId,
          createdAt: /* @__PURE__ */ new Date(),
          fromAccountId: null
        };
        storage.transactions.set(transactionId, transaction);
        console.log("Initial deposit transaction created:", JSON.stringify(transaction));
      }
      const user = await storage.getUser(account.userId);
      if (user) {
        await sendEmailByType("welcome", user, { accountNumber: account.accountNumber });
      }
      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating account:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating account" });
    }
  });
  app2.patch("/api/accounts/:id", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const account = await storage.getAccount(accountId);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      const updatedAccount = await storage.updateAccount(accountId, req.body);
      if (!updatedAccount) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.status(200).json(updatedAccount);
    } catch (error) {
      console.error("Error updating account:", error);
      res.status(500).json({ message: "Error updating account" });
    }
  });
  app2.get("/api/cards", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const cardsPromises = users2.map(async (user) => {
        const cards2 = await storage.getCardsByUserId(user.id);
        return cards2.map((card) => ({
          ...card,
          user: {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
        }));
      });
      const cardsByUser = await Promise.all(cardsPromises);
      const allCards = cardsByUser.flat();
      res.status(200).json(allCards);
    } catch (error) {
      console.error("Error fetching all cards:", error);
      res.status(500).json({ message: "Error fetching all cards" });
    }
  });
  app2.get("/api/cards/user", isAuthenticated, async (req, res) => {
    try {
      const cards2 = await storage.getCardsByUserId(req.user.id);
      res.status(200).json(cards2);
    } catch (error) {
      console.error("Error fetching user cards:", error);
      res.status(500).json({ message: "Error fetching user cards" });
    }
  });
  app2.get("/api/cards/account/:accountId", isAuthenticated, async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const account = await storage.getAccount(accountId);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      if (req.user.role !== "admin" && req.user.id !== account.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const cards2 = await storage.getCardsByAccountId(accountId);
      res.status(200).json(cards2);
    } catch (error) {
      console.error("Error fetching account cards:", error);
      res.status(500).json({ message: "Error fetching account cards" });
    }
  });
  app2.post("/api/cards", isAuthenticated, async (req, res) => {
    try {
      const cardData = insertCardSchema.parse(req.body);
      if (req.user.role !== "admin") {
        const account = await storage.getAccount(cardData.accountId);
        if (!account || account.userId !== req.user.id) {
          return res.status(403).json({ message: "Not authorized" });
        }
        cardData.userId = req.user.id;
      }
      const card = await storage.createCard(cardData);
      res.status(201).json(card);
    } catch (error) {
      console.error("Error creating card:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid card data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating card" });
    }
  });
  app2.patch("/api/cards/:id", isAuthenticated, async (req, res) => {
    try {
      const cardId = parseInt(req.params.id);
      const card = await storage.getCard(cardId);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      if (req.user.role !== "admin" && req.user.id !== card.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const updatedCard = await storage.updateCard(cardId, req.body);
      if (!updatedCard) {
        return res.status(404).json({ message: "Card not found" });
      }
      res.status(200).json(updatedCard);
    } catch (error) {
      console.error("Error updating card:", error);
      res.status(500).json({ message: "Error updating card" });
    }
  });
  app2.get("/api/transactions/account/:accountId", isAuthenticated, async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      if (!accountId || isNaN(accountId)) {
        console.log(`ID de compte invalide fourni: ${req.params.accountId}`);
        return res.status(200).json([]);
      }
      console.log(`Recherche du compte avec ID: ${accountId} par l'utilisateur ${req.user.id} (${req.user.role})`);
      const account = await storage.getAccount(accountId);
      if (!account) {
        console.log(`Compte introuvable pour ID: ${accountId}`);
        return res.status(200).json([]);
      }
      console.log(`Compte trouv\xE9: ${account.id}, UserId: ${account.userId}, Balance: ${account.balance}, Type: ${account.accountType}`);
      if (req.user.role !== "admin" && req.user.id !== account.userId) {
        console.log(`Acc\xE8s refus\xE9: l'utilisateur ${req.user.id} n'est pas autoris\xE9 \xE0 voir les transactions du compte ${accountId}`);
        return res.status(403).json({ message: "Not authorized" });
      }
      const transactions2 = await storage.getTransactionsByAccountId(accountId);
      console.log(`R\xE9cup\xE9ration de ${transactions2.length} transactions pour le compte ${accountId} avec balance ${account.balance}`);
      if (transactions2.length === 0 && account.balance > 0) {
        console.log(`Aucune transaction trouv\xE9e pour un compte avec solde. Cr\xE9ation d'une transaction de d\xE9p\xF4t initial pour le compte ${accountId} avec un solde de ${account.balance}`);
        try {
          const depositTransaction = await storage.createTransaction({
            type: "deposit",
            amount: account.balance,
            status: "completed",
            description: "D\xE9p\xF4t initial",
            currency: "EUR",
            toAccountId: account.id,
            reference: `DEP-${Date.now()}`,
            category: "deposit",
            fromAccountId: null
          });
          console.log(`Transaction de d\xE9p\xF4t initial cr\xE9\xE9e avec ID ${depositTransaction.id}`);
          const checkTransaction = await storage.getTransaction(depositTransaction.id);
          console.log(`V\xE9rification de la transaction cr\xE9\xE9e: ${checkTransaction ? "Trouv\xE9e" : "Non trouv\xE9e"}`);
          const allTransactions = await storage.getTransactionsByAccountId(accountId);
          console.log(`Apr\xE8s cr\xE9ation, compte ${accountId} a ${allTransactions.length} transactions`);
          return res.status(200).json([depositTransaction]);
        } catch (error) {
          console.error("Erreur lors de la cr\xE9ation de la transaction initiale:", error);
          return res.status(200).json([]);
        }
      }
      res.status(200).json(transactions2);
    } catch (error) {
      console.error("Error fetching account transactions:", error);
      res.status(500).json({ message: "Error fetching account transactions" });
    }
  });
  app2.post("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      console.log("Transaction request body:", req.body);
      if (!req.body.fromAccountId && !req.body.toAccountId) {
        return res.status(400).json({ message: "At least one account ID (from or to) is required" });
      }
      if (typeof req.body.amount !== "number" || req.body.amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      const transactionData = {
        ...req.body,
        status: req.body.status || "completed",
        currency: req.body.currency || "EUR",
        reference: req.body.reference || null,
        description: req.body.description || null,
        category: req.body.category || null
      };
      try {
        insertTransactionSchema.parse(transactionData);
      } catch (error) {
        console.error("Transaction validation error:", error);
        return res.status(400).json({ message: "Invalid transaction data", errors: error });
      }
      console.log("Validated transaction data:", transactionData);
      if (req.user.role !== "admin" && transactionData.fromAccountId) {
        const fromAccount = await storage.getAccount(transactionData.fromAccountId);
        if (!fromAccount || fromAccount.userId !== req.user.id) {
          return res.status(403).json({ message: "Not authorized" });
        }
      }
      const transaction = await storage.createTransaction(transactionData);
      if (transaction.fromAccountId) {
        const fromAccount = await storage.getAccount(transaction.fromAccountId);
        if (fromAccount) {
          const fromUser = await storage.getUser(fromAccount.userId);
          if (fromUser) {
            await sendEmailByType("transaction", fromUser, {
              transaction,
              account: fromAccount
            });
            await storage.createNotification({
              userId: fromUser.id,
              type: "transaction",
              title: `D\xE9bit de ${transaction.amount}\u20AC`,
              message: transaction.description || "Aucune description",
              isRead: false,
              metadata: { transactionId: transaction.id }
            });
          }
        }
      }
      if (transaction.toAccountId) {
        const toAccount = await storage.getAccount(transaction.toAccountId);
        if (toAccount) {
          const toUser = await storage.getUser(toAccount.userId);
          if (toUser) {
            await sendEmailByType("transaction", toUser, {
              transaction,
              account: toAccount
            });
            await storage.createNotification({
              userId: toUser.id,
              type: "transaction",
              title: `Cr\xE9dit de ${transaction.amount}\u20AC`,
              message: transaction.description || "Aucune description",
              isRead: false,
              metadata: { transactionId: transaction.id }
            });
          }
        }
      }
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating transaction" });
    }
  });
  app2.get("/api/verification-steps/user", isAuthenticated, async (req, res) => {
    try {
      const verificationStep = await storage.getVerificationStepByUserId(req.user.id);
      res.status(200).json(verificationStep || null);
    } catch (error) {
      console.error("Error fetching verification steps:", error);
      res.status(500).json({ message: "Error fetching verification steps" });
    }
  });
  app2.get("/api/verification-steps/user/:userId", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const verificationStep = await storage.getVerificationStepByUserId(userId);
      res.status(200).json(verificationStep || null);
    } catch (error) {
      console.error("Error fetching verification steps:", error);
      res.status(500).json({ message: "Error fetching verification steps" });
    }
  });
  app2.post("/api/verification-steps", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const stepData = insertVerificationStepSchema.parse(req.body);
      const step = await storage.createVerificationStep(stepData);
      res.status(201).json(step);
    } catch (error) {
      console.error("Error creating verification step:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid verification step data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating verification step" });
    }
  });
  app2.patch("/api/verification-steps/:id", isAuthenticated, async (req, res) => {
    try {
      const stepId = parseInt(req.params.id);
      const step = await storage.getVerificationStep(stepId);
      if (!step) {
        return res.status(404).json({ message: "Verification step not found" });
      }
      if (req.user.role !== "admin" && req.user.id !== step.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      if (req.user.role !== "admin") {
        let currentStep = 1;
        if (step.step1Completed) currentStep = 2;
        if (step.step2Completed) currentStep = 3;
        if (step.step3Completed) currentStep = 4;
        if (step.step4Completed) currentStep = 5;
        const allowedFields = [`step${currentStep}Completed`];
        const filteredData = {};
        for (const field of allowedFields) {
          if (req.body[field] !== void 0) {
            filteredData[field] = req.body[field];
          }
        }
        if (filteredData[`step${currentStep}Completed`] === true) {
          filteredData[`step${currentStep}Date`] = /* @__PURE__ */ new Date();
        }
        req.body = filteredData;
      } else {
        const amountFields = ["step1Amount", "step2Amount", "step3Amount", "step4Amount", "step5Amount"];
        const statusFields = ["step1Completed", "step2Completed", "step3Completed", "step4Completed", "step5Completed"];
        const dateFields = ["step1Date", "step2Date", "step3Date", "step4Date", "step5Date"];
        const isUpdatingAmounts = amountFields.some((field) => req.body[field] !== void 0);
        for (let i = 0; i < statusFields.length; i++) {
          const statusField = statusFields[i];
          const dateField = dateFields[i];
          if (req.body[statusField] === true && !step[dateField]) {
            req.body[dateField] = /* @__PURE__ */ new Date();
          }
        }
        if (isUpdatingAmounts) {
          console.log(
            `Admin updating custom amounts for verification step ${stepId}: `,
            amountFields.filter((f) => req.body[f] !== void 0).reduce((acc, field) => {
              acc[field] = req.body[field];
              return acc;
            }, {})
          );
        }
      }
      const updatedStep = await storage.updateVerificationStep(stepId, req.body);
      if (!updatedStep) {
        return res.status(404).json({ message: "Verification step not found" });
      }
      if (req.user.role === "admin") {
        const stepFields = ["step1Completed", "step2Completed", "step3Completed", "step4Completed", "step5Completed"];
        for (let i = 0; i < stepFields.length; i++) {
          const field = stepFields[i];
          if (req.body[field] !== void 0 && req.body[field] !== step[field]) {
            const user = await storage.getUser(step.userId);
            if (user) {
              const stepNumber = i + 1;
              const stepNames = [
                "Frais d'enregistrement de cr\xE9dit",
                "Frais de virement international",
                "Frais de justice",
                "Frais d'assurance",
                "Frais d'autorisation de d\xE9caissement"
              ];
              if (req.body[field] === true) {
                await storage.createNotification({
                  userId: user.id,
                  type: "verification",
                  title: `\xC9tape ${stepNumber} valid\xE9e`,
                  message: `L'\xE9tape "${stepNames[i]}" a \xE9t\xE9 valid\xE9e.`,
                  isRead: false
                });
              } else {
                await storage.createNotification({
                  userId: user.id,
                  type: "verification",
                  title: `\xC9tape ${stepNumber} annul\xE9e`,
                  message: `La validation de l'\xE9tape "${stepNames[i]}" a \xE9t\xE9 annul\xE9e.`,
                  isRead: false
                });
              }
            }
          }
        }
      }
      res.status(200).json(updatedStep);
    } catch (error) {
      console.error("Error updating verification step:", error);
      res.status(500).json({ message: "Error updating verification step" });
    }
  });
  app2.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const notifications2 = await storage.getNotificationsByUserId(req.user.id);
      res.status(200).json(notifications2);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });
  app2.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(notificationId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.status(200).json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Error marking notification as read" });
    }
  });
  app2.get("/api/payment-account/:stepNumber", isAuthenticated, async (req, res) => {
    try {
      const stepNumber = parseInt(req.params.stepNumber);
      if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 5) {
        return res.status(400).json({ message: "Invalid step number" });
      }
      const paymentAccount = await storage.getPaymentAccountForStep(stepNumber);
      if (!paymentAccount) {
        return res.status(404).json({ message: "Payment account not found for this step" });
      }
      res.status(200).json(paymentAccount);
    } catch (error) {
      console.error("Error fetching payment account:", error);
      res.status(500).json({ message: "Failed to fetch payment account" });
    }
  });
  app2.post("/api/payment-account/:stepNumber", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const stepNumber = parseInt(req.params.stepNumber);
      if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 5) {
        return res.status(400).json({ message: "Invalid step number" });
      }
      const paymentAccountSchema = z.object({
        accountOwner: z.string().min(1),
        accountNumber: z.string().min(1),
        description: z.string().optional(),
        stepNumber: z.number()
      });
      const validatedData = paymentAccountSchema.parse({
        ...req.body,
        stepNumber
      });
      const paymentAccount = await storage.updatePaymentAccountForStep(stepNumber, validatedData);
      res.status(200).json(paymentAccount);
    } catch (error) {
      console.error("Error updating payment account:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment account data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update payment account" });
    }
  });
  app2.get("/api/system-settings", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const settings = await storage.getAllSystemSettings();
      res.status(200).json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "Error fetching system settings" });
    }
  });
  app2.get("/api/system-settings/:key", isAuthenticated, async (req, res) => {
    try {
      const key = req.params.key;
      const setting = await storage.getSystemSetting(key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.status(200).json(setting);
    } catch (error) {
      console.error("Error fetching system setting:", error);
      res.status(500).json({ message: "Error fetching system setting" });
    }
  });
  app2.post("/api/system-settings", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const settingData = req.body;
      const validatedData = insertSystemSettingSchema.parse(settingData);
      const existingSetting = await storage.getSystemSetting(validatedData.settingKey);
      if (existingSetting) {
        return res.status(400).json({ message: "Setting already exists" });
      }
      if (!validatedData.updatedBy && req.user) {
        validatedData.updatedBy = req.user.id;
      }
      const setting = await storage.createSystemSetting(validatedData);
      res.status(201).json(setting);
    } catch (error) {
      console.error("Error creating system setting:", error);
      res.status(500).json({ message: "Error creating system setting" });
    }
  });
  app2.put("/api/system-settings/:key", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const key = req.params.key;
      const { settingValue } = req.body;
      if (!settingValue) {
        return res.status(400).json({ message: "Setting value is required" });
      }
      const setting = await storage.updateSystemSetting(key, settingValue, req.user ? req.user.id : void 0);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.status(200).json(setting);
    } catch (error) {
      console.error("Error updating system setting:", error);
      res.status(500).json({ message: "Error updating system setting" });
    }
  });
  app2.get("/api/get-payment-account/:step", isAuthenticated, async (req, res) => {
    try {
      const step = req.params.step;
      if (!/^step[1-5]$/.test(step)) {
        return res.status(400).json({ message: "Invalid step parameter" });
      }
      const paymentAccountSetting = await storage.getSystemSetting(`payment_account_${step}`);
      if (!paymentAccountSetting) {
        return res.status(404).json({
          message: "Payment account not configured",
          accountNumber: null
        });
      }
      const account = await storage.getAccountByNumber(paymentAccountSetting.settingValue);
      if (!account) {
        return res.status(404).json({
          message: "Payment account not found",
          accountNumber: paymentAccountSetting.settingValue
        });
      }
      const owner = await storage.getUser(account.userId);
      if (!owner) {
        return res.status(404).json({
          message: "Account owner not found",
          accountNumber: account.accountNumber
        });
      }
      res.status(200).json({
        accountNumber: account.accountNumber,
        accountOwner: `${owner.firstName} ${owner.lastName}`,
        description: paymentAccountSetting.description || null
      });
    } catch (error) {
      console.error("Error fetching payment account:", error);
      res.status(500).json({ message: "Error fetching payment account" });
    }
  });
  app2.get("/api/test-email", async (req, res) => {
    try {
      const email = req.query.email || "dorellso930@gmail.com";
      console.log(`\u{1F9EA} Test d'envoi d'email \xE0 ${email} avec l'adresse d'exp\xE9diteur: ecreditgroupe@gmail.com`);
      const result = await sendEmail(
        email,
        "EuroNova - Test d'envoi d'email",
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0c326f; margin: 0;"><span style="color: #0c326f;">Euro</span>Nova</h1>
            <p style="color: #818181; margin-top: 5px;">Votre partenaire bancaire</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #0c326f; margin-top: 0;">Test d'envoi d'email</h2>
            <p>Ceci est un test d'envoi d'email via l'API Brevo.</p>
            <p>Si vous recevez cet email, cela signifie que la configuration de l'API d'envoi d'emails fonctionne correctement !</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e6e6; font-size: 12px; color: #818181; text-align: center;">
            <p>Ce message est un test, merci de ne pas y r\xE9pondre.</p>
            <p>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} EuroNova. Tous droits r\xE9serv\xE9s.</p>
          </div>
        </div>
        `
      );
      if (result) {
        res.json({ success: true, message: "Email envoy\xE9 avec succ\xE8s." });
      } else {
        res.status(500).json({ success: false, message: "\xC9chec de l'envoi de l'email." });
      }
    } catch (error) {
      console.error("Erreur lors du test d'envoi d'email:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
  app2.get("/api/test-all-emails", isAuthenticated, requireRole("admin"), async (req, res) => {
    try {
      const email = req.query.email || "dorellso930@gmail.com";
      const results = [];
      const testUser = {
        id: 999,
        username: "client_test",
        email,
        firstName: "Jean",
        lastName: "Dupont",
        role: "client",
        status: "active",
        phone: "+33612345678",
        address: "123 Rue de Paris, 75001 Paris",
        dateOfBirth: "1980-01-01",
        nationality: "Fran\xE7aise",
        occupation: "Ing\xE9nieur",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        lastLogin: /* @__PURE__ */ new Date(),
        profileImage: null
      };
      const testAccount = {
        id: 999,
        userId: 999,
        accountNumber: "FR7612345678901234567890123",
        accountType: "current",
        balance: 5e3,
        currency: "EUR",
        isActive: true,
        createdAt: /* @__PURE__ */ new Date()
      };
      const testTransaction = {
        id: 999,
        amount: 250,
        type: "transfer",
        fromAccountId: null,
        toAccountId: 999,
        currency: "EUR",
        status: "completed",
        description: "Virement SEPA re\xE7u",
        reference: "VIR123456",
        category: "salary",
        createdAt: /* @__PURE__ */ new Date()
      };
      const testVerificationStep = {
        id: 999,
        userId: 999,
        transactionId: 999,
        step1Amount: 100,
        step2Amount: 150,
        step3Amount: 200,
        step4Amount: 250,
        step5Amount: 300,
        step1Completed: true,
        step2Completed: false,
        step3Completed: false,
        step4Completed: false,
        step5Completed: false,
        step1Date: /* @__PURE__ */ new Date(),
        step2Date: null,
        step3Date: null,
        step4Date: null,
        step5Date: null,
        notes: "Processus de v\xE9rification en cours",
        createdAt: /* @__PURE__ */ new Date()
      };
      console.log(`\u{1F9EA} Test de tous les emails \xE0 ${email}`);
      console.log("1. Envoi d'un email de bienvenue...");
      const welcomeResult = await sendWelcomeEmail(
        testUser,
        testAccount.accountNumber,
        "CL-123456",
        "Mot2Passe!Securise",
        "4111 1111 1111 1111",
        "12/25",
        "123"
      );
      results.push({ type: "welcome", success: welcomeResult });
      console.log("2. Envoi d'un email de notification de transaction...");
      const transactionResult = await sendTransactionEmail(
        testUser,
        testTransaction,
        testAccount
      );
      results.push({ type: "transaction", success: transactionResult });
      console.log("3. Envoi d'un email de rappel de paiement...");
      const reminderResult = await sendPaymentReminderEmail(
        testUser,
        testVerificationStep,
        2
      );
      results.push({ type: "reminder", success: reminderResult });
      console.log("4. Envoi d'un email de statut de compte (activation)...");
      const activationResult = await sendAccountStatusEmail(
        testUser,
        true
      );
      results.push({ type: "status_active", success: activationResult });
      console.log("5. Envoi d'un email de statut de compte (d\xE9sactivation)...");
      const deactivationResult = await sendAccountStatusEmail(
        testUser,
        false
      );
      results.push({ type: "status_inactive", success: deactivationResult });
      const allSuccess = results.every((r) => r.success);
      if (allSuccess) {
        res.json({
          success: true,
          message: "Tous les emails ont \xE9t\xE9 envoy\xE9s avec succ\xE8s.",
          results
        });
      } else {
        const failedEmails = results.filter((r) => !r.success).map((r) => r.type);
        res.status(500).json({
          success: false,
          message: `\xC9chec de l'envoi de certains emails: ${failedEmails.join(", ")}`,
          results
        });
      }
    } catch (error) {
      console.error("Erreur lors du test d'envoi des emails:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
