// The phone's buzz under the big moments: the taptic engine in the iOS app, through Capacitor's
// Haptics plugin (the app's native side puts window.Capacitor on the page). In a browser there is
// no Capacitor and this does nothing, so the website plays as it always did.
const haptics = window.Capacitor?.isNativePlatform?.() ? window.Capacitor.Plugins?.Haptics : null;

// tap: a pickup, a landing, a bump; knock: a hit or a thrown item landing; crash: a crash;
// win and lose: the end of a race or a quest
const KINDS = {
  tap: h => h.impact({ style: 'LIGHT' }),
  knock: h => h.impact({ style: 'MEDIUM' }),
  crash: h => h.impact({ style: 'HEAVY' }),
  win: h => h.notification({ type: 'SUCCESS' }),
  lose: h => h.notification({ type: 'ERROR' }),
};

export const buzz = kind => {
  if (haptics) KINDS[kind](haptics).catch(() => { /* no taptic engine (iPad): nothing to feel */ });
};
