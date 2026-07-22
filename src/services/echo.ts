import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window { Pusher: any; Echo: any; }
}

window.Pusher = Pusher;

const KEY = import.meta.env.VITE_REVERB_APP_KEY;
const HOST = import.meta.env.VITE_REVERB_HOST;
const PORT = import.meta.env.VITE_REVERB_PORT ?? 8080;
const SCHEME = import.meta.env.VITE_REVERB_SCHEME ?? 'https';

let echo: any;

if (!KEY || !HOST) {
    console.warn('Reverb/Pusher key missing: set VITE_REVERB_APP_KEY in your .env. Echo disabled.');
    echo = null;
} else {
    echo = new Echo({
        broadcaster: 'reverb',
        key: KEY,
        wsHost: HOST,
        wsPort: Number(PORT),
        wssPort: Number(PORT),
        forceTLS: SCHEME === 'https',
        enabledTransports: ['ws', 'wss'],
    });
}

export default echo;