// Audio service for notification sounds

// Create a singleton audio player
const AudioService = (function() {
  let instance;

  function createInstance() {
    // Private variables
    const sounds = {
      alarm: new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'),
      notification: new Audio('https://assets.mixkit.co/active_storage/sfx/953/953-preview.mp3'),
      warning: new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
    };

    // Initialize all sounds
    Object.values(sounds).forEach(sound => {
      sound.preload = 'auto';
      sound.load();
    });

    return {
      // Play a single sound
      playSound: function(soundName) {
        if (sounds[soundName]) {
          sounds[soundName].currentTime = 0;
          sounds[soundName].play().catch(e => console.log(`Error playing ${soundName}:`, e));
        } else {
          console.log(`Sound ${soundName} not found`);
        }
      },

      // Play a sound rapidly multiple times
      playRapidSound: function(soundName, count = 5, interval = 300) {
        let counter = 0;
        
        const rapidInterval = setInterval(() => {
          this.playSound(soundName);
          counter++;
          
          if (counter >= count) {
            clearInterval(rapidInterval);
          }
        }, interval);
        
        return rapidInterval;
      },

      // Stop all sounds
      stopAllSounds: function() {
        Object.values(sounds).forEach(sound => {
          sound.pause();
          sound.currentTime = 0;
        });
      },

      // Add a new sound
      addSound: function(name, url) {
        sounds[name] = new Audio(url);
        sounds[name].preload = 'auto';
        sounds[name].load();
      }
    };
  }

  return {
    getInstance: function() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

export default AudioService;