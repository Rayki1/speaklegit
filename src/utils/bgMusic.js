/**
 * Background music singleton.
 * Controls the global looping background track (bgmusic.m4a).
 * Provides pause/duck/resume helpers used by speech recognition.
 */

const bgMusic = {
  _audio: null,
  _userStarted: false,

  init() {
    if (this._audio) return;
    const audio = new Audio("/bgmusic.m4a");
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "auto";
    this._audio = audio;
  },

  /** Call on first user gesture to satisfy autoplay policy. */
  start() {
    if (!this._audio) this.init();
    if (this._userStarted) return;
    this._userStarted = true;
    this._audio.play().catch(() => {});
  },

  /** Lower volume while mic is active so it doesn't bleed into recognition. */
  duck() {
    if (this._audio) this._audio.volume = 0.05;
  },

  /** Restore normal volume after mic stops. */
  restore() {
    if (this._audio) this._audio.volume = 0.35;
  },

  pause() {
    if (this._audio && !this._audio.paused) this._audio.pause();
  },

  resume() {
    if (this._audio && this._userStarted && this._audio.paused) {
      this._audio.play().catch(() => {});
    }
  },
};

export default bgMusic;
