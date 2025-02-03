// Background script voor QuarterFocus Chrome extensie
chrome.runtime.onInstalled.addListener(() => {
  console.log('QuarterFocus Extension installed');
});

// Handle extensie icon click
chrome.action.onClicked.addListener(() => {
  // Get the screen width to position the window on the right
  chrome.system.display.getInfo((displays) => {
    const display = displays[0]; // Primary display
    const left = display.workArea.width - 450; // Window width is 450
    
    chrome.windows.create({
      url: 'index.html',
      type: 'popup',
      width: 450,
      height: 800,
      left,
      top: 50 // A bit of padding from the top
    });
  });
});

// Luister naar alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroTimer') {
    // Stuur een notificatie wanneer de timer klaar is
    chrome.notifications.create('pomodoroComplete', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title: 'Pomodoro done!',
      message: 'Well done! Time for a break!'
    });
  }
});

// Luister naar berichten van de popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Hier komt de message handling logica
  console.log('Message received:', request);
  sendResponse({ status: 'OK' });
});
