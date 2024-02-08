import { register } from 'register-service-worker'
import { OrgNoteApi } from '../src/api';

declare global {
  interface Window {
    orgnote: OrgNoteApi;
  }
}
// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (/* registration */) {
    console.log('Service worker is active.')
  },

  registered (reg) {
    console.log('Service worker has been registered.')
    setInterval(() => {
      reg.update()
    }, 5000)
  },

  cached (/* registration */) {
    console.log('Content has been cached for offline use.')
  },

  updatefound (/* registration */) {
    console.log('New content is downloading.')
  },

  updated (/* reg */) {
    if (!navigator.onLine) {
      return;
    }
    window.orgnote.interaction
      .confirm('new version available!', 'please, restart the app!')
      .then((res) => {
        if (res) {
          window.location.reload();
        }
      })
  },

  offline () {
    console.log('No internet connection found. App is running in offline mode.')
  },

  error (err) {
    console.error('Error during service worker registration:', err)
  }
})
