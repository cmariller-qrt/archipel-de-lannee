// ============================================================
// Client Supabase — connexion, chargement et sauvegarde de l'état
// ============================================================
// Stratégie retenue pour ce prototype : connexion ANONYME automatique
// (pas d'écran de login). Chaque navigateur obtient un identifiant
// Supabase réel (auth.uid()) dès sa première visite, ce qui permet de
// sauvegarder/recharger ses données sur CE navigateur.
//
// Limite actuelle : si la personne change de navigateur ou d'appareil,
// elle repart avec un nouvel identifiant (donc de nouvelles données
// vides). Pour un vrai compte partagé entre appareils, il faudra
// ajouter un écran de connexion par e-mail (voir README, section
// "Étape suivante : vrais comptes utilisateurs").
// ============================================================

let supabaseClient = null;
let supabaseReady = false;

async function initSupabase() {
  if (typeof SUPABASE_CONFIG === 'undefined') {
    console.warn(
      "[Supabase] config.js introuvable ou non chargé — l'app fonctionne " +
      "en mode local uniquement (rien n'est sauvegardé en ligne). " +
      "Voir js/config.example.js pour configurer Supabase."
    );
    return null;
  }

  supabaseClient = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
  );

  // Récupère la session existante, ou en crée une anonyme si première visite
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    const { error } = await supabaseClient.auth.signInAnonymously();
    if (error) {
      console.error('[Supabase] Échec de la connexion anonyme :', error.message);
      return null;
    }
  }

  supabaseReady = true;
  return supabaseClient;
}

async function loadState() {
  if (!supabaseReady) return null;
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabaseClient
    .from('app_state')
    .select('data')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[Supabase] Erreur de chargement :', error.message);
    return null;
  }
  return data ? data.data : null;
}

async function saveState(stateObject) {
  if (!supabaseReady) return false;
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return false;

  const { error } = await supabaseClient
    .from('app_state')
    .upsert({ user_id: user.id, data: stateObject }, { onConflict: 'user_id' });

  if (error) {
    console.error('[Supabase] Erreur de sauvegarde :', error.message);
    return false;
  }
  return true;
}

// Sauvegarde groupée avec anti-rebond : évite d'écrire à chaque frappe/clic,
// on attend une courte pause d'inactivité avant d'écrire réellement.
let saveDebounceTimer = null;
function scheduleSave(getStateFn, delay = 1000) {
  clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    saveState(getStateFn());
  }, delay);
}

// ============================================================
// Compte (lien magique par e-mail) — pour retrouver la même to-do
// sur plusieurs navigateurs/appareils, au lieu de rester coincé sur
// la session anonyme propre à chaque navigateur.
// ============================================================

// Transforme la session anonyme courante en compte permanent lié à cet e-mail,
// SANS changer d'identifiant utilisateur : la to-do déjà sauvegardée sur ce
// navigateur reste donc associée au compte. À utiliser une seule fois, sur le
// navigateur qui a déjà la "vraie" to-do.
async function linkEmailToCurrentAccount(email) {
  if (!supabaseReady) return { error: new Error('Supabase non connecté') };
  return await supabaseClient.auth.updateUser(
    { email },
    { emailRedirectTo: window.location.origin + window.location.pathname }
  );
}

// Envoie un lien de connexion pour rejoindre un compte déjà existant (créé via
// linkEmailToCurrentAccount ailleurs). À utiliser sur les autres navigateurs/appareils.
async function signInWithEmail(email) {
  if (!supabaseReady) return { error: new Error('Supabase non connecté') };
  return await supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname },
  });
}

async function signOutAccount() {
  if (!supabaseReady) return;
  await supabaseClient.auth.signOut();
}
