'use strict';

class LoginManager {
    constructor() {
        // Firebase configurace
        this.firebaseConfig = {
            apiKey: "AIzaSyDNMsfVaCqCkmiotWWG2MVg9CdsGuSTQks",
            authDomain: "portfolio-tracker-public.firebaseapp.com",
            databaseURL: "https://portfolio-tracker-public-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "portfolio-tracker-public",
            storageBucket: "portfolio-tracker-public.firebasestorage.app",
            messagingSenderId: "152110538514",
            appId: "1:152110538514:web:0cda9a9ac71df6d23addcb",
            measurementId: "G-PZY34DLYD6"
        };

        // Kontrola, zda byla již firebase aplikace inicializiována
        if (!firebase.apps.length) {
            firebase.initializeApp(this.firebaseConfig); // Inicializace firebase aplikace
        } else {
            firebase.app(); // Použití existující firebase aplikace
        }
        this.auth = firebase.auth(); // Inicializace Authentikace

        // Kontrola, zda jsme na stránce login.html
        if (window.location.pathname.endsWith("portfolio-tracker-login.html")) {
            this.loginForm = document.getElementById("form-login"); // Formulář pro login
            this.loginForm.addEventListener('submit', this._submitLogin.bind(this)); // Odeslání login formuláře
        }
    }

    // Funkce pro přihlášení uživatele
    _login(email, password) {
        this.auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                window.location.href = "portfolio-tracker.html";
            })
            .catch((error) => {
                document.getElementById('error-login').style.display = 'block';
            });
    }

    // Funkce odeslání formuláře pro login
    _submitLogin(e) {
        e.preventDefault();
        const email = document.getElementById("email").value; // Email input
        const password = document.getElementById("password").value; // Heslo input
        this._login(email, password); // Login
    }

    // Kontrola zda je přihlášený uživatel
    checkAuth() {
        return new Promise((resolve) => {
            this.auth.onAuthStateChanged((user) => {
                if (!user) {
                    window.location.href = "portfolio-tracker-login.html"; // Pokud není uživatel přihlášen, přesměruje na přihlašovací stránku
                    resolve(false); // Vrátí false, pokud uživatel není přihlášen
                } else {
                    resolve(true); // Vrátí true, pokud uživatel je přihlášen
                }
            });
        });
    }

    // Odhlášení uživatele
    logout() {
        this.auth.signOut()
            .then(() => {
                window.location.href = "portfolio-tracker-login.html"; // Přesměrování na login po odhlášení
            })
            .catch((error) => {
                console.error("Chyba při odhlašování: ", error);
            });
    }
}

// Po načtení stránky vytvoření instance Login managera
document.addEventListener("DOMContentLoaded", () => {
    new LoginManager();
});
