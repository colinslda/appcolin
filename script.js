document.addEventListener('DOMContentLoaded', () => {
    // --- Initialisation de Supabase ---
    const supabaseUrl = 'https://sjznmcpbtmiqbaxthmbv.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqem5tY3BidG1pcWJheHRobWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzgwMjQsImV4cCI6MjA1OTcxNDAyNH0.aa5jbqApC-_9vb6NX-NSPIculxs8APHy0jx5-_MzQ4w';

    let supabase;
    try {
        // Vérifie que la librairie Supabase est chargée (depuis le CDN)
        if (!window.supabase) {
            throw new Error("La librairie Supabase n'a pas pu être chargée.");
        }
        supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        console.log('Supabase Client Initialized');
    } catch (error) {
        console.error('Erreur initialisation Supabase:', error);
        alert('Erreur critique : Impossible d\'initialiser la connexion au service. Veuillez vérifier votre connexion ou contacter le support.');
        // On pourrait désactiver les formulaires ici pour éviter des erreurs supplémentaires
        return; // Arrête l'exécution si Supabase n'est pas initialisé
    }

    // --- Références aux éléments DOM ---
    const pages = document.querySelectorAll('.page');
    const loginPage = document.getElementById('login-page');
    const signupPage = document.getElementById('signup-page');
    const mainPage = document.getElementById('main-page');
    const profilePage = document.getElementById('profile-page');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    const gotoSignupLink = document.getElementById('goto-signup');
    const gotoLoginLink = document.getElementById('goto-login');
    const profileIcon = document.getElementById('profile-icon');
    const backToMainIcon = document.getElementById('back-to-main');
    const logoutButton = document.getElementById('logout-button');

    const featureBtn1 = document.getElementById('feature-btn-1');
    const featureBtn2 = document.getElementById('feature-btn-2');
    const featureBtn3 = document.getElementById('feature-btn-3');

    const profileEmailDisplay = document.getElementById('profile-email-display');

    // --- Gestion de la Navigation ---
    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.remove('active');
        });
        const nextPage = document.getElementById(pageId);
        if (nextPage) {
            nextPage.classList.add('active');
        } else {
            console.error("Page not found:", pageId);
            if (supabase?.auth?.user()) { // Si connecté mais page non trouvée, aller à main
                 mainPage.classList.add('active');
            } else { // Sinon, retour login
                 loginPage.classList.add('active');
            }
        }
    }

    // --- Nettoyer les formulaires ---
    function clearForms() {
        loginForm.reset();
        signupForm.reset();
    }

     // --- Mettre à jour l'interface utilisateur en fonction de l'état d'authentification ---
    function updateUIBasedOnAuth(user) {
        if (user) {
            profileEmailDisplay.textContent = user.email || 'Email non disponible';
            // Ne navigue pas automatiquement ici, laisse onAuthStateChange gérer la navigation initiale
            // showPage('main-page'); // Déplacé vers onAuthStateChange
        } else {
            profileEmailDisplay.textContent = 'non.connecte@example.com';
            clearForms();
            showPage('login-page'); // Assure qu'on est sur la page login si déconnecté
        }
    }

    // --- Écouteurs d'événements ---

    gotoSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('signup-page');
    });

    gotoLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('login-page');
    });

    // Soumission Formulaire Connexion
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const button = loginForm.querySelector('button[type="submit"]');
        button.disabled = true; // Désactiver le bouton pendant la tentative
        button.textContent = 'Connexion...';

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Erreur de connexion:', error);
                alert(`Erreur de connexion : ${error.message}`);
            } else if (data.user) {
                console.log('Connexion réussie:', data.user);
                // L'UI sera mise à jour par onAuthStateChange qui détectera SIGNED_IN
                // Pas besoin de naviguer ici explicitement, mais on pourrait si on voulait
                // showPage('main-page');
            } else {
                 console.warn('Connexion: Aucune donnée utilisateur reçue sans erreur explicite.');
                 alert('Un problème est survenu lors de la connexion. Veuillez réessayer.');
            }
        } catch (error) {
            console.error('Erreur inattendue lors de la connexion:', error);
            alert('Une erreur inattendue est survenue. Veuillez réessayer.');
        } finally {
             button.disabled = false; // Réactiver le bouton
             button.textContent = 'Se connecter';
        }
    });

    // Soumission Formulaire Inscription
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const button = signupForm.querySelector('button[type="submit"]');

        if (password !== confirmPassword) {
            alert('Les mots de passe ne correspondent pas.');
            return;
        }

        button.disabled = true;
        button.textContent = 'Inscription...';

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                // options: { // Options utiles, ex: redirection après confirmation email
                //   emailRedirectTo: window.location.origin // Redirige ici après clic sur lien email
                // }
            });

            if (error) {
                console.error('Erreur d\'inscription:', error);
                alert(`Erreur d'inscription : ${error.message}`);
            } else if (data.user) {
                 console.log('Inscription réussie (utilisateur créé):', data.user);
                 // Vérifier si l'email de confirmation est activé dans Supabase
                 if (data.user.identities && data.user.identities.length === 0) {
                     // Peut indiquer que la confirmation par email est requise
                     alert('Inscription réussie ! Veuillez vérifier votre boîte mail pour confirmer votre compte avant de vous connecter.');
                 } else {
                      alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
                 }
                 showPage('login-page'); // Redirige vers la connexion après tentative d'inscription
            } else {
                 console.warn('Inscription: Aucune donnée utilisateur reçue sans erreur explicite.');
                 alert('Un problème est survenu lors de l\'inscription. Veuillez réessayer.');
            }
        } catch (error) {
            console.error('Erreur inattendue lors de l\'inscription:', error);
            alert('Une erreur inattendue est survenue. Veuillez réessayer.');
        } finally {
             button.disabled = false;
             button.textContent = 'S\'inscrire';
        }
    });

    // Aller à la page Profil
    profileIcon.addEventListener('click', () => {
        // Vérifier si l'utilisateur est connecté avant d'afficher
        const user = supabase.auth.user(); // Note: supabase.auth.user() est déprécié, utiliser supabase.auth.getSession()
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                 showPage('profile-page');
            } else {
                console.log("Accès profil refusé : utilisateur non connecté.");
                // Optionnel: rediriger vers login si clic profil sans être connecté
                showPage('login-page');
            }
        });

    });

    // Retourner à la page principale depuis le profil
    backToMainIcon.addEventListener('click', () => {
        showPage('main-page');
    });

    // Déconnexion
    logoutButton.addEventListener('click', async () => {
        const button = logoutButton;
        button.disabled = true;
        button.textContent = 'Déconnexion...';
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Erreur de déconnexion:', error);
                alert(`Erreur de déconnexion : ${error.message}`);
            } else {
                console.log('Déconnexion réussie.');
                // L'UI sera mise à jour par onAuthStateChange qui détectera SIGNED_OUT
                // clearForms(); // Déplacé vers updateUIBasedOnAuth
                // showPage('login-page'); // Géré par onAuthStateChange
            }
        } catch (error) {
             console.error('Erreur inattendue lors de la déconnexion:', error);
             alert('Une erreur inattendue est survenue lors de la déconnexion.');
        } finally {
             button.disabled = false;
             button.textContent = 'Déconnexion';
        }
    });

    // Clics sur les boutons de fonctionnalités (placeholder)
    featureBtn1.addEventListener('click', () => alert('Fonctionnalité 1 cliquée ! (Nécessite logique métier)'));
    featureBtn2.addEventListener('click', () => alert('Fonctionnalité 2 cliquée ! (Nécessite logique métier)'));
    featureBtn3.addEventListener('click', () => alert('Fonctionnalité 3 cliquée ! (Nécessite logique métier)'));

    // --- Gestion de l'état d'authentification ---
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session);
        const user = session?.user ?? null;

        updateUIBasedOnAuth(user); // Met à jour les infos (email, etc.)

        // Gère la navigation principale basée sur l'état
        if (event === 'SIGNED_IN') {
             clearForms(); // Nettoyer après connexion/inscription réussie
             showPage('main-page');
        } else if (event === 'SIGNED_OUT') {
             showPage('login-page');
        }
        // Si l'événement est INITIAL_SESSION, on met juste à jour l'UI mais on ne force pas la navigation
        // sauf si l'état initial est 'non connecté', auquel cas on va vers login (déjà géré par updateUI).
        // Si l'état initial est 'connecté', on reste où on est (ou on va à 'main-page' si c'est le premier chargement)
        // La ligne ci-dessous gère le cas du premier chargement où l'utilisateur a déjà une session valide.
        if (event === 'INITIAL_SESSION' && user) {
             showPage('main-page');
        }
    });


    // --- Initialisation de l'affichage ---
    // Au chargement, on ne sait pas encore si l'utilisateur est connecté.
    // onAuthStateChange s'en chargera. On commence par défaut sur login.
    // Si l'utilisateur a une session valide, onAuthStateChange ('INITIAL_SESSION' ou 'SIGNED_IN')
    // le redirigera vers 'main-page'.
    showPage('login-page');

    // --- Enregistrement du Service Worker ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }

});
