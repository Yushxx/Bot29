const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
// Token du bot
const token = '7427176024:AAGxRhSeien7siUpycr8FnZ5qDnIsBUOsjs';

// ID du canal Telegram où les signaux seront envoyés
const channelId = '-1002077280025';  // Remplacez par l'ID de votre canal

// Initialisation du bot
const bot = new TelegramBot(token, { polling: true });

// Liste des paires de devises disponibles
const pairs = [
  '🇪🇺 EUR/JPY 🇯🇵 OTC',
  '🇬🇧 GBP/USD 🇺🇸 OTC',
  '🇺🇸 USD/CNH 🇨🇳 OTC',
  '🇬🇧 GBP/AUD 🇦🇺 OTC',
  '🇺🇸 USD/CHF 🇨🇭 OTC',
  '🇺🇸 USD/CAD 🇨🇦 OTC',
  '🇪🇺 EUR/GBP 🇬🇧 OTC',
  '🇺🇸 USD/JPY 🇯🇵 OTC'
];

// Horaires des signaux pour chaque session
const schedule = {
  morning: ['06:35', '06:55', '07:10', '07:25', '07:55', '08:10', '08:40', '08:55', '09:15', '10:25'],
  afternoon: ['12:35', '12:55', '13:25', '13:45', '14:05', '14:25', '14:55', '15:10', '15:35', '15:50'],
  evening: ['18:35', '18:55', '19:15', '19:35', '20:00', '20:15', '20:30', '20:45', '21:00', '21:25'],
  night: ['00:35', '00:45', '00:55', '01:20', '01:35', '01:50', '02:05', '02:30', '02:45', '03:00']
};

// Fonction utilitaire pour ajouter des minutes à une heure donnée (format HH:MM)
function addMinutes(time, minutesToAdd) {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes + minutesToAdd);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// Fonction pour formater les signaux avec le template et le lien hypertexte
function formatSignal(time, entry, direction, pair) {
  const emoji = direction === 'BUY' ? '🟩' : '🟥';
  return `
${pair}
🕘 Expiration 5M
⏺ Entry at ${entry}
${emoji} ${direction}

🔼 Martingale levels 
1️⃣ level at ${addMinutes(entry, 5)}  
2️⃣ level at ${addMinutes(entry, 10)}  
3️⃣ level at ${addMinutes(entry, 15)}

💥 <a href="https://bit.ly/4cAu9yg">GET THIS SIGNAL HERE!</a>
💰 < href="https://telegra.ph/INSTRUCTIONS-08-25">HOW TO START?</a>
  `;
}

// Fonction pour envoyer un signal à une heure donnée
function sendSignal(session, index) {
  const time = schedule[session][index];
  const direction = Math.random() > 0.5 ? 'BUY' : 'SELL'; // Direction aléatoire
  const pair = pairs[Math.floor(Math.random() * pairs.length)]; // Choisir une paire aléatoire
  const signalMessage = formatSignal(time, time, direction, pair);

  // Envoi du message avec le mode HTML
  bot.sendMessage(channelId, signalMessage, { parse_mode: 'HTML' });
}

// Planification des sessions de signaux pour chaque jour
function scheduleSignals() {
  const sessions = ['morning', 'afternoon', 'evening', 'night'];
  
  sessions.forEach((session) => {
    schedule[session].forEach((time, index) => {
      const [hours, minutes] = time.split(':').map(Number);
      const now = new Date();
      const sendDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
      
      if (sendDate > now) {
        const delay = sendDate - now;  // Délai en millisecondes
        setTimeout(() => sendSignal(session, index), delay);
      }
    });
  });
}

// Lancer la planification des signaux tous les jours
scheduleSignals();

// Commande pour envoyer un signal manuel avec /send
bot.onText(/\/send/, (msg) => {
  const chatId = msg.chat.id;

  // Signal aléatoire pour une session donnée
  const randomSession = ['morning', 'afternoon', 'evening', 'night'][Math.floor(Math.random() * 4)];
  const randomIndex = Math.floor(Math.random() * schedule[randomSession].length);

  const time = schedule[randomSession][randomIndex];
  const direction = Math.random() > 0.5 ? 'BUY' : 'SELL'; // Direction aléatoire
  const pair = pairs[Math.floor(Math.random() * pairs.length)]; // Choisir une paire aléatoire
  const manualSignal = formatSignal(time, time, direction, pair);

  bot.sendMessage(channelId, manualSignal, { parse_mode: 'HTML' });  // Envoi au canal avec le lien
  bot.sendMessage(chatId, 'Signal manuel envoyé !');  // Confirmation pour l'utilisateur
});

// Message d'annonce avant chaque session
function announceSession(sessionName, sessionIcon) {
  const message = `
${sessionIcon} ${sessionName.toUpperCase()} SESSION
🟢 STARTED

🟡 ⚠️⚠️⚠️
🕘 Expiration 5M
🌐 TIMEZONE (UTC +00 ) London
`;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'OPEN BROKER', url: 'https://bit.ly/4cAu9yg' }],
        [{ text: 'HOW TO START', url: 'https://telegra.ph/INSTRUCTIONS-08-25' }]
      ]
    },
    parse_mode: 'HTML'
  };

  bot.sendMessage(channelId, message, options);
}

// Simuler les annonces de sessions (peut être ajusté selon les besoins)
bot.onText(/\/announce_morning/, () => announceSession('morning', '🌤'));
bot.onText(/\/announce_afternoon/, () => announceSession('afternoon', '☀️'));
bot.onText(/\/announce_evening/, () => announceSession('evening', '🌙'));
bot.onText(/\/announce_night/, () => announceSession('night', '🌑'));

console.log('Bot demarer');
// Code keep_alive pour Ã©viter que le bot ne s'endorme
http.createServer(function (req, res) {
    res.write("I'm alive");
    res.end();
}).listen(8080);
