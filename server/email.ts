import { User, Transaction, Account, VerificationStep } from "@shared/schema";
import { EmailNotificationType } from "@shared/types";
import axios from 'axios';

// Dictionnaire de traductions pour les emails
const emailTranslations = {
  fr: {
    // Général
    appName: 'EuroNova',
    tagline: 'Votre partenaire bancaire',
    buttonAccessAccount: 'Accéder à mon compte',
    buttonContactSupport: 'Contacter le support',
    footerAutomatedMsg: 'Ce message est automatique, merci de ne pas y répondre.',
    allRightsReserved: 'Tous droits réservés.',
    greeting: (firstName: string, lastName: string) => `Cher(e) <strong>${firstName} ${lastName}</strong>,`,
    
    // Transaction
    transactionNotification: 'Notification de transaction',
    transactionCredit: 'Crédit',
    transactionDebit: 'Débit',
    transactionInfo: 'Nous vous informons qu\'une transaction a été effectuée sur votre compte.',
    transactionWarning: 'Si vous n\'êtes pas à l\'origine de cette transaction, veuillez contacter immédiatement notre service client.',
    transactionType: 'Type:',
    transactionAmount: 'Montant:',
    transactionDate: 'Date:',
    transactionDescription: 'Description:',
    noDescription: 'Aucune description',
    dateNotAvailable: 'Date non disponible',
    currentBalance: 'Votre solde actuel est de',
    
    // Reminders
    paymentReminder: 'Rappel de paiement',
    stepPaymentRequired: 'Un paiement est requis pour avancer dans votre processus de vérification.',
    currentStep: 'Étape actuelle:',
    amountDue: 'Montant dû:',
    paymentInstructions: 'Veuillez effectuer un virement bancaire avec les détails suivants:',
    beneficiaryName: 'Nom du bénéficiaire:',
    accountNumber: 'Numéro de compte:',
    paymentReference: 'Référence:',
    paymentHelp: 'Après avoir effectué le paiement, veuillez nous envoyer une preuve de paiement pour accélérer la validation.',
    
    // Status
    accountStatus: 'Statut du compte',
    accountActivated: 'Compte activé',
    accountDeactivated: 'Compte désactivé',
    accountActivatedMessage: 'Vous pouvez maintenant profiter de tous les services d\'EuroNova.',
    accountDeactivatedMessage: 'Pour plus d\'informations ou pour réactiver votre compte, veuillez contacter notre service client.',
    accountStatusUpdate: 'Mise à jour du statut de votre compte',
    accountActivationMsg: 'Nous avons le plaisir de vous informer que votre compte a été activé. Vous pouvez maintenant accéder à toutes les fonctionnalités de notre plateforme.',
    accountDeactivationMsg: 'Nous sommes au regret de vous informer que votre compte a été désactivé. Veuillez contacter notre service client pour plus d\'informations.',
    
    // Welcome
    welcomeTitle: 'Bienvenue chez EuroNova',
    welcomeSubject: 'Vos informations confidentielles',
    welcomeMessage: 'Bienvenue chez EuroNova ! Nous sommes ravis de vous compter parmi nos clients.',
    trustedBankingPartner: 'Votre partenaire bancaire de confiance',
    accountCreated: 'Votre compte a été créé avec succès! Voici vos informations d\'identification :',
    accessCredentials: 'Voici vos identifiants d\'accès:',
    clientIdLabel: 'ID Client :',
    passwordLabel: 'Mot de passe :',
    accountNumberLabel: 'RIB :',
    cardInfoLabel: 'Informations de carte bancaire :',
    cardNumberLabel: 'Numéro de carte :',
    cardExpiryDateLabel: 'Date d\'expiration :',
    cardCvvLabel: 'CVV :',
    securityWarning: 'Conservez ces informations précieusement et ne les partagez avec personne.',
    loginInvite: 'Vous pouvez dès maintenant vous connecter à votre espace client pour découvrir nos services.',
    confidentialInfo: 'Ce message contient des informations confidentielles. Merci de ne pas y répondre.',
  },
  en: {
    // General
    appName: 'EuroNova',
    tagline: 'Your banking partner',
    buttonAccessAccount: 'Access my account',
    buttonContactSupport: 'Contact Support',
    footerAutomatedMsg: 'This is an automated message, please do not reply.',
    allRightsReserved: 'All rights reserved.',
    greeting: (firstName: string, lastName: string) => `Dear <strong>${firstName} ${lastName}</strong>,`,
    
    // Transaction
    transactionNotification: 'Transaction Notification',
    transactionCredit: 'Credit',
    transactionDebit: 'Debit',
    transactionInfo: 'We inform you that a transaction has been made on your account.',
    transactionWarning: 'If you did not initiate this transaction, please contact our customer service immediately.',
    transactionType: 'Type:',
    transactionAmount: 'Amount:',
    transactionDate: 'Date:',
    transactionDescription: 'Description:',
    noDescription: 'No description',
    dateNotAvailable: 'Date not available',
    currentBalance: 'Your current balance is',
    
    // Reminders
    paymentReminder: 'Payment Reminder',
    stepPaymentRequired: 'A payment is required to proceed with your verification process.',
    currentStep: 'Current step:',
    amountDue: 'Amount due:',
    paymentInstructions: 'Please make a bank transfer with the following details:',
    beneficiaryName: 'Beneficiary name:',
    accountNumber: 'Account number:',
    paymentReference: 'Reference:',
    paymentHelp: 'After making the payment, please send us proof of payment to expedite the validation.',
    
    // Status
    accountStatus: 'Account Status',
    accountActivated: 'Account Activated',
    accountDeactivated: 'Account Deactivated',
    accountActivatedMessage: 'You can now enjoy all EuroNova services.',
    accountDeactivatedMessage: 'For more information or to reactivate your account, please contact our customer service.',
    accountStatusUpdate: 'Account Status Update',
    accountActivationMsg: 'We are pleased to inform you that your account has been activated. You can now access all the features of our platform.',
    accountDeactivationMsg: 'We regret to inform you that your account has been deactivated. Please contact our customer service for more information.',
    
    // Welcome
    welcomeTitle: 'Welcome to EuroNova',
    welcomeSubject: 'Your confidential information',
    welcomeMessage: 'Welcome to EuroNova! We are delighted to have you as our customer.',
    trustedBankingPartner: 'Your trusted banking partner',
    accountCreated: 'Your account has been successfully created. Here is your identification information:',
    accessCredentials: 'Here are your access credentials:',
    clientIdLabel: 'Client ID:',
    passwordLabel: 'Password:',
    accountNumberLabel: 'Account Number:',
    cardInfoLabel: 'Bank card information:',
    cardNumberLabel: 'Card number:',
    cardExpiryDateLabel: 'Expiry date:',
    cardCvvLabel: 'CVV:',
    securityWarning: 'Keep this information confidential and do not share it with anyone.',
    loginInvite: 'You can now log in to your client area to discover our services.',
    confidentialInfo: 'This message contains confidential information. Please do not reply.',
  },
  es: {
    // General
    appName: 'EuroNova',
    tagline: 'Su socio bancario',
    buttonAccessAccount: 'Acceder a mi cuenta',
    buttonContactSupport: 'Contactar con soporte',
    footerAutomatedMsg: 'Este es un mensaje automático, por favor no responda.',
    allRightsReserved: 'Todos los derechos reservados.',
    greeting: (firstName: string, lastName: string) => `Estimado/a <strong>${firstName} ${lastName}</strong>,`,
    
    // Transaction
    transactionNotification: 'Notificación de transacción',
    transactionCredit: 'Crédito',
    transactionDebit: 'Débito',
    transactionInfo: 'Le informamos que se ha realizado una transacción en su cuenta.',
    transactionWarning: 'Si no inició esta transacción, póngase en contacto con nuestro servicio de atención al cliente inmediatamente.',
    transactionType: 'Tipo:',
    transactionAmount: 'Importe:',
    transactionDate: 'Fecha:',
    transactionDescription: 'Descripción:',
    noDescription: 'Sin descripción',
    dateNotAvailable: 'Fecha no disponible',
    currentBalance: 'Su saldo actual es',
    
    // Reminders
    paymentReminder: 'Recordatorio de pago',
    stepPaymentRequired: 'Se requiere un pago para continuar con su proceso de verificación.',
    currentStep: 'Paso actual:',
    amountDue: 'Importe a pagar:',
    paymentInstructions: 'Por favor, realice una transferencia bancaria con los siguientes detalles:',
    beneficiaryName: 'Nombre del beneficiario:',
    accountNumber: 'Número de cuenta:',
    paymentReference: 'Referencia:',
    paymentHelp: 'Después de realizar el pago, envíenos un comprobante para acelerar la validación.',
    
    // Status
    accountStatus: 'Estado de la cuenta',
    accountActivated: 'Cuenta activada',
    accountDeactivated: 'Cuenta desactivada',
    accountActivatedMessage: 'Ahora puede disfrutar de todos los servicios de EuroNova.',
    accountDeactivatedMessage: 'Para más información o para reactivar su cuenta, póngase en contacto con nuestro servicio de atención al cliente.',
    accountStatusUpdate: 'Actualización del estado de la cuenta',
    accountActivationMsg: 'Nos complace informarle que su cuenta ha sido activada. Ahora puede acceder a todas las funciones de nuestra plataforma.',
    accountDeactivationMsg: 'Lamentamos informarle que su cuenta ha sido desactivada. Contacte con nuestro servicio de atención al cliente para más información.',
    
    // Welcome
    welcomeTitle: 'Bienvenido a EuroNova',
    welcomeSubject: 'Su información confidencial',
    welcomeMessage: 'Bienvenido a EuroNova! Estamos encantados de tenerle como cliente.',
    trustedBankingPartner: 'Su socio bancario de confianza',
    accountCreated: '¡Su cuenta ha sido creada con éxito! Aquí está su información de identificación:',
    accessCredentials: 'Aquí están sus credenciales de acceso:',
    clientIdLabel: 'ID de cliente:',
    passwordLabel: 'Contraseña:',
    accountNumberLabel: 'Número de cuenta:',
    cardInfoLabel: 'Información de la tarjeta bancaria:',
    cardNumberLabel: 'Número de tarjeta:',
    cardExpiryDateLabel: 'Fecha de caducidad:',
    cardCvvLabel: 'CVV:',
    securityWarning: 'Mantenga esta información confidencial y no la comparta con nadie.',
    loginInvite: 'Ahora puede iniciar sesión en su área de cliente para descubrir nuestros servicios.',
    confidentialInfo: 'Este mensaje contiene información confidencial. Por favor, no responda.',
  }
};

// Types pour les traductions
type SupportedLanguages = 'fr' | 'en' | 'es'; 

// Type pour définir le schéma des traductions
interface EmailTranslation {
  // Général
  appName: string;
  tagline: string;
  buttonAccessAccount: string;
  buttonContactSupport: string;
  footerAutomatedMsg: string;
  allRightsReserved: string;
  greeting: (firstName: string, lastName: string) => string;
  
  // Transaction
  transactionNotification: string;
  transactionCredit: string;
  transactionDebit: string;
  transactionInfo: string;
  transactionWarning: string;
  transactionType: string;
  transactionAmount: string;
  transactionDate: string;
  transactionDescription: string;
  noDescription: string;
  dateNotAvailable: string;
  currentBalance: string;
  
  // Reminders
  paymentReminder: string;
  stepPaymentRequired: string;
  currentStep: string;
  amountDue: string;
  paymentInstructions: string;
  beneficiaryName: string;
  accountNumber: string;
  paymentReference: string;
  paymentHelp: string;
  
  // Status
  accountStatus: string;
  accountActivated: string;
  accountDeactivated: string;
  accountActivatedMessage: string;
  accountDeactivatedMessage: string;
  accountStatusUpdate: string;
  accountActivationMsg: string;
  accountDeactivationMsg: string;
  
  // Welcome
  welcomeTitle: string;
  welcomeSubject: string;
  welcomeMessage: string;
  trustedBankingPartner: string;
  accountCreated: string;
  accessCredentials: string;
  clientIdLabel: string;
  passwordLabel: string;
  accountNumberLabel: string;
  cardInfoLabel: string;
  cardNumberLabel: string;
  cardExpiryDateLabel: string;
  cardCvvLabel: string;
  securityWarning: string;
  loginInvite: string;
  confidentialInfo: string;
}

// Fonction d'aide pour obtenir les traductions selon la langue
function getTranslation(lang: string): EmailTranslation {
  // Vérifier si la langue est supportée
  const supportedLang = (lang === 'fr' || lang === 'en' || lang === 'es') ? 
    lang as SupportedLanguages : 'fr';
  
  // Retourner les traductions pour cette langue
  return emailTranslations[supportedLang];
}

// Configuration de l'API Brevo
const apiKey = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Fonction pour vérifier la validité de la clé API
export async function checkApiKey(): Promise<boolean> {
  if (!apiKey) {
    console.error("❌ Clé API Brevo manquante");
    return false;
  }
  
  try {
    console.log("🔑 Vérification de la clé API Brevo...");
    
    const response = await axios.get('https://api.brevo.com/v3/account', {
      headers: {
        'api-key': apiKey
      }
    });
    
    if (response.status === 200) {
      console.log("✅ Clé API Brevo valide");
      console.log("📧 Infos du compte Brevo:", {
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        companyName: response.data.companyName,
      });
      return true;
    } else {
      console.error("❌ Clé API Brevo invalide. Statut:", response.status);
      return false;
    }
  } catch (error: unknown) {
    console.error("❌ Erreur lors de la vérification de la clé API Brevo:");
    if (error instanceof Error) {
      // Si c'est une erreur standard
      console.error("- Message:", error.message);
    } else if (typeof error === 'object' && error !== null && 'response' in error) {
      // Si c'est une erreur Axios
      const axiosError = error as { response?: { status?: number, data?: any } };
      if (axiosError.response) {
        console.error("- Statut:", axiosError.response.status);
        console.error("- Message:", axiosError.response.data);
      }
    } else {
      // Autre type d'erreur
      console.error("- Erreur inconnue:", error);
    }
    return false;
  }
}

// Fonction d'envoi d'email avec Brevo
export async function sendEmail(to: string, subject: string, html: string, lang?: string): Promise<boolean> {
  try {
    // Vérifier que l'adresse email est valide
    if (!to || !to.includes('@')) {
      console.error(`📧 Invalid email address: ${to}`);
      return false;
    }

    // Si pas de clé API configurée, on utilise le mode simulation
    if (!apiKey) {
      console.log(`📧 ====== SIMULATION D'EMAIL (pas de clé API Brevo) ======`);
      console.log(`📧 Email envoyé à: ${to}`);
      console.log(`📧 Sujet: ${subject}`);
      console.log(`📧 Contenu: \n    ${html.length > 500 ? html.substring(0, 500) + '...' : html}`);
      console.log(`📧 ====== FIN SIMULATION ======`);
      return true;
    }

    // Création du message pour Brevo
    const emailData = {
      sender: {
        name: "EuroNova Banking",
        email: "ecreditgroupe@gmail.com"  // Utilisation de l'adresse email vérifiée dans Brevo
      },
      to: [
        {
          email: to
        }
      ],
      subject: subject,
      htmlContent: html
    };

    // Envoi du message
    console.log(`📧 Envoi d'email à ${to} via Brevo API...`);
    
    try {
      console.log(`📧 Envoi vers Brevo API avec les données:`, {
        to: emailData.to[0].email,
        from: emailData.sender.email,
        subject: emailData.subject,
      });
      
      const response = await axios.post(BREVO_API_URL, emailData, {
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json'
        }
      });
      
      console.log(`📧 Email envoyé avec succès via Brevo (statut: ${response.status})`);
      console.log(`📧 Réponse Brevo:`, response.data);
      
      return true;
    } catch (err: any) {
      console.error(`📧 Erreur lors de l'envoi via Brevo:`);
      if (err.response) {
        console.error(`- Statut: ${err.response.status}`);
        console.error(`- Message: ${JSON.stringify(err.response.data)}`);
      } else {
        console.error(`- Message: ${err.message}`);
      }
      return false;
    }
  } catch (error: unknown) {
    console.error(`📧 Error sending email to ${to}:`);
    if (error instanceof Error) {
      console.error(`- Message: ${error.message}`);
    } else {
      console.error(`- Error: ${String(error)}`);
    }
    return false;
  }
}

// Generate transaction notification email
export async function sendTransactionEmail(
  user: User, 
  transaction: Transaction, 
  account: Account
): Promise<boolean> {
  // Utiliser la langue préférée de l'utilisateur, avec français par défaut
  const userLang = user.language || 'fr';
  const isCredit = transaction.toAccountId === account.id;
  
  // Récupérer les traductions pour la langue de l'utilisateur
  const t = getTranslation(userLang);
  
  // Déterminer le type de transaction (crédit ou débit)
  const transactionType = isCredit ? t.transactionCredit : t.transactionDebit;
  
  // Créer le sujet de l'email
  const subject = `${t.appName} - ${transactionType} ${isCredit ? 'de' : 'de'} ${Math.abs(transaction.amount)}€`;
  
  const transactionColor = isCredit ? "#28C76F" : "#EA5455";
  
  // Gérer les dates potentiellement nulles
  let formattedDate = t.dateNotAvailable;
  if (transaction.createdAt) {
    // Définir la locale en fonction de la langue
    let locale = 'fr-FR'; // Par défaut
    if (userLang === 'en') locale = 'en-US';
    else if (userLang === 'es') locale = 'es-ES';
    else if (userLang === 'de') locale = 'de-DE';
    else if (userLang === 'it') locale = 'it-IT';
    
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
          <p style="margin: 0 0 5px 0;"><strong>${t.transactionAmount}</strong> <span style="color: ${transactionColor};">${Math.abs(transaction.amount)} €</span></p>
          <p style="margin: 0 0 5px 0;"><strong>${t.transactionDate}</strong> ${formattedDate}</p>
          <p style="margin: 0;"><strong>${t.transactionDescription}</strong> ${transaction.description || t.noDescription}</p>
        </div>
        
        <p>${t.currentBalance} <strong>${account.balance} €</strong>.</p>
        <p>${t.transactionWarning}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.APP_URL || 'http://localhost:5000'}/auth?username=${user.username}" style="display: inline-block; background-color: #7A73FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">${t.buttonAccessAccount}</a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e6e6; font-size: 12px; color: #818181; text-align: center;">
        <p>${t.footerAutomatedMsg}</p>
        <p>© ${new Date().getFullYear()} EuroNova. ${t.allRightsReserved}</p>
      </div>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html, userLang);
}

// Generate payment reminder email
export async function sendPaymentReminderEmail(
  user: User, 
  verificationStep: VerificationStep, 
  stepNumber: number
): Promise<boolean> {
  // Utiliser la langue préférée de l'utilisateur, avec français par défaut
  const userLang = user.language || 'fr';
  
  // Récupérer les traductions pour la langue de l'utilisateur
  const t = getTranslation(userLang);
  
  // Définir les textes selon la langue des étapes
  const stepLabels = {
    fr: [
      "Frais d'enregistrement de crédit",
      "Frais de virement international",
      "Frais de justice",
      "Frais d'assurance",
      "Frais d'autorisation de décaissement"
    ],
    en: [
      "Credit Registration Fee",
      "International Transfer Fee",
      "Legal Fee",
      "Insurance Fee",
      "Disbursement Authorization Fee"
    ],
    es: [
      "Tarifa de registro de crédito",
      "Tarifa de transferencia internacional",
      "Tarifa legal",
      "Tarifa de seguro",
      "Tarifa de autorización de desembolso"
    ]
  };
  
  // Sélectionner les labels selon la langue
  const currentStepLabels = stepLabels[userLang as 'fr' | 'en' | 'es'] || stepLabels.fr;
  
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
  
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + 3);
  
  // Créer le sujet de l'email
  const subject = `${t.appName} - ${t.paymentReminder}: ${currentStepLabels[stepNumber - 1]}`;
  
  // Définir la locale en fonction de la langue
  let locale = 'fr-FR'; // Par défaut
  if (userLang === 'en') locale = 'en-US';
  else if (userLang === 'es') locale = 'es-ES';
  else if (userLang === 'de') locale = 'de-DE';
  else if (userLang === 'it') locale = 'it-IT';
  
  // Format pour le texte de progression
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
          <p style="margin: 0 0 5px 0;"><strong>${t.amountDue}</strong> <span>${stepAmounts[stepNumber - 1]} €</span></p>
          <p style="margin: 0;"><strong>${userLang === 'en' ? 'Deadline:' : 'Date limite:'}</strong> <span style="color: #EA5455;">${deadlineDate.toLocaleDateString(locale)}</span></p>
        </div>
        
        <p>${t.paymentInstructions}</p>
        <p>${progressText}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.APP_URL || 'http://localhost:5000'}/auth?username=${user.username}&redirect=/client/payments" style="display: inline-block; background-color: #7A73FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">${t.buttonAccessAccount}</a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e6e6; font-size: 12px; color: #818181; text-align: center;">
        <p>${t.paymentHelp}</p>
        <p>© ${new Date().getFullYear()} EuroNova. ${t.allRightsReserved}</p>
      </div>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html, userLang);
}

// Generate account status email
export async function sendAccountStatusEmail(
  user: User, 
  isActive: boolean
): Promise<boolean> {
  // Utiliser la langue préférée de l'utilisateur, avec français par défaut
  const userLang = user.language || 'fr';
  
  // Récupérer les traductions pour la langue de l'utilisateur
  const t = getTranslation(userLang);
  
  // Préparer le sujet selon le statut
  const statusAction = isActive ? t.accountActivated : t.accountDeactivated;
  const subject = `${t.appName} - ${statusAction}`;
  
  // Préparer le message de statut selon l'état
  const statusMessage = isActive ? 
    `<strong style="color: #28C76F;">${t.accountActivated}</strong>. ${t.accountActivatedMessage}` : 
    `<strong style="color: #EA5455;">${t.accountDeactivated}</strong>. ${t.accountDeactivatedMessage}`;
  
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
        <a href="${process.env.APP_URL || 'http://localhost:5000'}/auth?username=${user.username}&redirect=/client/support" style="display: inline-block; background-color: #7A73FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">${t.buttonContactSupport}</a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e6e6; font-size: 12px; color: #818181; text-align: center;">
        <p>${t.footerAutomatedMsg}</p>
        <p>© ${new Date().getFullYear()} EuroNova. ${t.allRightsReserved}</p>
      </div>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html, userLang);
}

// Generate welcome email with credentials
export async function sendWelcomeEmail(
  user: User, 
  accountNumber: string,
  clientId?: string,
  password?: string,
  cardNumber?: string,
  cardExpiryDate?: string,
  cardCvv?: string
): Promise<boolean> {
  // Utiliser la langue préférée de l'utilisateur, avec français par défaut
  const userLang = user.language || 'fr';
  
  // Récupérer les traductions pour la langue de l'utilisateur
  const t = getTranslation(userLang);
  
  // Définir le sujet de l'email
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
          <p style="margin: 0 0 5px 0;"><strong>${t.passwordLabel}</strong> <span>${password || '********'}</span></p>
          <p style="margin: 0 0 5px 0;"><strong>${t.accountNumberLabel}</strong> <span>${accountNumber}</span></p>
          ${cardNumber ? `
          <hr style="margin: 10px 0; border: none; border-top: 1px solid #e6e6e6;" />
          <p style="margin: 10px 0 5px 0;"><strong>${t.cardInfoLabel}</strong></p>
          <p style="margin: 0 0 5px 0;"><strong>${t.cardNumberLabel}</strong> <span>${cardNumber}</span></p>
          <p style="margin: 0 0 5px 0;"><strong>${t.cardExpiryDateLabel}</strong> <span>${cardExpiryDate}</span></p>
          <p style="margin: 0 0 5px 0;"><strong>${t.cardCvvLabel}</strong> <span>${cardCvv}</span></p>
          ` : ''}
        </div>
        
        <p style="color: #EA5455; font-weight: bold;">${t.securityWarning}</p>
        <p>${t.loginInvite}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.APP_URL || 'http://localhost:5000'}/auth?username=${user.username}&redirect=/client/dashboard" style="display: inline-block; background-color: #0c326f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">${t.buttonAccessAccount}</a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e6e6; font-size: 12px; color: #818181; text-align: center;">
        <p>${t.confidentialInfo}</p>
        <p>© ${new Date().getFullYear()} EuroNova. ${t.allRightsReserved}</p>
      </div>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html, userLang);
}

// Send generic email by type
export async function sendEmailByType(
  type: EmailNotificationType, 
  user: User, 
  data: any
): Promise<boolean> {
  // Utiliser la langue de l'utilisateur s'il en a une définie, sinon français par défaut
  const userLanguage = user.language || 'fr';
  
  switch (type) {
    case 'transaction':
      return sendTransactionEmail(user, data.transaction, data.account);
    case 'reminder':
      return sendPaymentReminderEmail(user, data.verificationStep, data.stepNumber);
    case 'status':
      return sendAccountStatusEmail(user, data.isActive);
    case 'welcome':
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
