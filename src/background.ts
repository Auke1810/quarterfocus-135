// Background script voor QuarterFocus Chrome extensie
chrome.runtime.onInstalled.addListener(() => {
  console.log('QuarterFocus Extension installed');
});

// Handle extensie icon click
chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: 'index.html',
    type: 'popup',
    width: 400,
    height: 600
  });
});

// Luister naar alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroTimer') {
    // Stuur een notificatie wanneer de timer klaar is
    chrome.notifications.create('pomodoroComplete', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title: 'Pomodoro Voltooid!',
      message: 'Tijd voor een pauze!'
    });
  }
});

// Luister naar berichten van de popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Hier komt de message handling logica
  console.log('Bericht ontvangen:', request);
  sendResponse({ status: 'OK' });
});
