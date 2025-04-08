document.addEventListener('DOMContentLoaded', () => {
    // Références aux éléments DOM
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
            loginPage.classList.add('active'); // Fallback to login
        }
    }

    // --- Écouteurs d'événements ---

    // Aller à l'inscription depuis connexion
    gotoSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('signup-page');
    });

    // Aller à la connexion depuis inscription
    gotoLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('login-page');
    });

    // Soumission Formulaire Connexion
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Empêche l'envoi classique du formulaire
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        console.log('Tentative de connexion:', { email }); // Log pour debug

        // TODO: Intégrer la logique de connexion SUPABASE ici
        // Exemple : supabase.auth.signInWithPassword({ email, password })
        //          .then(response => { ... si succès ...})
        //          .catch(error => { ... si erreur ... });

        // Simulation de succès pour l'instant
        if (email && password) {
            console.log('Connexion réussie (simulation)');
            // Stocker l'email (ou mieux, les infos user de Supabase)
            // localStorage.setItem('userEmail', email); // Exemple simple, pas sécurisé pour des tokens
            profileEmailDisplay.textContent = email; // Mettre à jour l'affichage profil
            showPage('main-page');
        } else {
            alert('Veuillez remplir tous les champs.');
        }
    });

    // Soumission Formulaire Inscription
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        console.log('Tentative d\'inscription:', { email }); // Log pour debug

        if (password !== confirmPassword) {
            alert('Les mots de passe ne correspondent pas.');
            return;
        }

        // TODO: Intégrer la logique d'inscription SUPABASE ici
        // Exemple : supabase.auth.signUp({ email, password })
        //          .then(response => { ... si succès ...})
        //          .catch(error => { ... si erreur ... });

        // Simulation de succès pour l'instant
        if (email && password) {
             console.log('Inscription réussie (simulation)');
            alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
            showPage('login-page'); // Redirige vers la connexion après inscription
        } else {
            alert('Veuillez remplir tous les champs.');
        }
    });

    // Aller à la page Profil
    profileIcon.addEventListener('click', () => {
        // Idéalement, re-vérifier si l'utilisateur est connecté
        // ou charger les données utilisateur ici avant d'afficher
        showPage('profile-page');
    });

    // Retourner à la page principale depuis le profil
    backToMainIcon.addEventListener('click', () => {
        showPage('main-page');
    });

    // Déconnexion
    logoutButton.addEventListener('click', () => {
        console.log('Tentative de déconnexion');

        // TODO: Intégrer la logique de déconnexion SUPABASE ici
        // Exemple: supabase.auth.signOut()
        //         .then(() => { ... après succès ...})
        //         .catch(error => { ... si erreur ...});

        // Nettoyage local (simulation)
        // localStorage.removeItem('userEmail');
        profileEmailDisplay.textContent = 'non.connecte@example.com'; // Réinitialiser affichage
        document.getElementById('login-email').value = ''; // Vider champs
        document.getElementById('login-password').value = '';
        document.getElementById('signup-email').value = '';
        document.getElementById('signup-password').value = '';
        document.getElementById('signup-confirm-password').value = '';

        showPage('login-page'); // Retour à la page de connexion
    });

    // Clics sur les boutons de fonctionnalités (placeholder)
    featureBtn1.addEventListener('click', () => alert('Fonctionnalité 1 cliquée !'));
    featureBtn2.addEventListener('click', () => alert('Fonctionnalité 2 cliquée !'));
    featureBtn3.addEventListener('click', () => alert('Fonctionnalité 3 cliquée !'));

    // --- Initialisation ---
    // Vérifier si un utilisateur est déjà connecté (simulation TRES basique)
    // TODO: Remplacer par une vraie vérification de session Supabase au chargement
    // const storedEmail = localStorage.getItem('userEmail');
    // if (storedEmail) {
    //     profileEmailDisplay.textContent = storedEmail;
    //     showPage('main-page');
    // } else {
    //     showPage('login-page'); // Affiche la page de connexion au démarrage
    // }
     showPage('login-page'); // Toujours commencer par la connexion pour ce squelette

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
