const TelegramBot = require('node-telegram-bot-api');
const token = '7038981201:AAHmbzgSCypqPMKVyvId2KFRu9bWaV3ZFkM';
const bot = new TelegramBot(token, { polling: true });

const channelId = -1002077280025; // Remplacez avec l'ID de votre canal

// Planification des signaux pour chaque session
const schedule = {
  morning: ['6:35', '6:55', '7:10', '7:55', '8:10', '8:55', '9:15', '9:55', '10:10', '10:55'],
  afternoon: ['12:36', '13:12', '13:48', '14:24', '15:00', '15:36', '16:12', '16:48', '17:24', '18:00'],
  evening: ['18:36', '19:12', '19:48', '20:24', '21:00', '21:36', '22:12', '22:48', '23:24', '00:00'],
  night: ['00:36', '01:12', '01:48', '02:24', '03:00', '03:36', '04:12', '04:48', '05:24', '06:00']
};

// Fonction pour formater les signaux avec les templates
// Fonction pour formater les signaux avec les templates et lien hypertexte
function formatSignal(time, entry, direction) {
  const emoji = direction === 'BUY' ? 'ðŸŸ©' : 'ðŸŸ¥';
  return `
ðŸ‡ªðŸ‡º EUR/GBP ðŸ‡¬ðŸ‡§ OTC
ðŸ•˜ Expiration 5M
âº Entry at ${entry}
${emoji} ${direction}

ðŸ”¼ Martingale levels 
1ï¸âƒ£ level at ${addMinutes(entry, 5)}  
2ï¸âƒ£ level at ${addMinutes(entry, 10)}  
3ï¸âƒ£ level at ${addMinutes(entry, 15)}


  `;
}

// Fonction pour ajouter des minutes Ã  une heure (format HH:MM)
function addMinutes(time, minsToAdd) {
  let [hours, minutes] = time.split(':').map(Number);
  minutes += minsToAdd;
  if (minutes >= 60) {
    hours += Math.floor(minutes / 60);
    minutes %= 60;
  }
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Fonction pour envoyer un signal Ã  une heure donnÃ©e
function sendSignal(session, index) {
  const time = schedule[session][index];
  const direction = Math.random() > 0.5 ? 'BUY' : 'SELL'; // Random direction
  const signalMessage = formatSignal(time, time, direction);
  
  bot.sendMessage(channelId, signalMessage);
}

// Planifier les signaux pour toutes les sessions
function scheduleSignals() {
  // Morning session
  schedule.morning.forEach((time, index) => {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const signalTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    
    const delay = signalTime.getTime() - now.getTime();
    if (delay > 0) {
      setTimeout(() => sendSignal('morning', index), delay);
    }
  });

  // Afternoon session
  schedule.afternoon.forEach((time, index) => {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const signalTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    
    const delay = signalTime.getTime() - now.getTime();
    if (delay > 0) {
      setTimeout(() => sendSignal('afternoon', index), delay);
    }
  });

  // Evening session
  schedule.evening.forEach((time, index) => {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const signalTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    
    const delay = signalTime.getTime() - now.getTime();
    if (delay > 0) {
      setTimeout(() => sendSignal('evening', index), delay);
    }
  });

  // Night session
  schedule.night.forEach((time, index) => {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const signalTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    
    const delay = signalTime.getTime() - now.getTime();
    if (delay > 0) {
      setTimeout(() => sendSignal('night', index), delay);
    }
  });
}

// Commande pour envoyer un signal manuel avec /send
bot.onText(/\/send/, (msg) => {
  const chatId = msg.chat.id;

  // Signal alÃ©atoire pour une session donnÃ©e
  const randomSession = ['morning', 'afternoon', 'evening', 'night'][Math.floor(Math.random() * 4)];
  const randomIndex = Math.floor(Math.random() * 10);
  
  const time = schedule[randomSession][randomIndex];
  const direction = Math.random() > 0.5 ? 'BUY' : 'SELL'; // Direction alÃ©atoire
  const manualSignal = formatSignal(time, time, direction);
  
  bot.sendMessage(channelId, manualSignal);  // Envoi au canal
  bot.sendMessage(chatId, 'Signal manuel envoyÃ© !');  // Confirmation pour l'utilisateur
});

// DÃ©marrer la planification des signaux
scheduleSignals();
