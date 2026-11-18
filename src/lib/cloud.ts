import { snapshot, useStore, type Snapshot } from '../store';

/**
 * Optional cloud backup with Firebase (anonymous sign-in + Cloud Firestore).
 * The app works fully without it: data is always saved in the browser. When
 * the VITE_FIREBASE_* values are set (see .env.example), each browser also
 * keeps a private backup document at users/{uid}.
 */
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const cloudConfigured = Boolean(config.apiKey && config.projectId && config.appId);

export async function startCloudSync() {
  if (!cloudConfigured) return;
  const { setCloud } = useStore.getState();
  setCloud('connecting');
  try {
    const [{ initializeApp }, { getAuth, signInAnonymously }, { getFirestore, doc, getDoc, setDoc }] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]);
    const app = initializeApp(config);
    const { user } = await signInAnonymously(getAuth(app));
    const ref = doc(getFirestore(app), 'users', user.uid);

    // Restore from the backup only when this browser has no local data.
    const remote = await getDoc(ref);
    const saved = remote.exists() ? (remote.data().state as string | undefined) : undefined;
    if (saved && !useStore.getState().user) {
      useStore.getState().hydrate(JSON.parse(saved) as Snapshot);
    }
    setCloud('on');

    let last = '';
    let timer: ReturnType<typeof setTimeout> | undefined;
    const push = () => {
      const json = JSON.stringify(snapshot(useStore.getState()));
      if (json === last) return;
      last = json;
      setDoc(ref, { state: json, updatedAt: Date.now() })
        .then(() => setCloud('on'))
        .catch(() => setCloud('error'));
    };
    useStore.subscribe(() => {
      clearTimeout(timer);
      timer = setTimeout(push, 1500);
    });
    push();
  } catch (err) {
    console.error('Cloud backup failed to start', err);
    setCloud('error');
  }
}
