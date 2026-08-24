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
