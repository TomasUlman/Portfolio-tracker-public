'use strict';

// https://firebase.google.com/docs/web/setup#available-libraries

class DatabaseManager {

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
        this.database = firebase.database(); // Inicializace databáze
    }

    // Uložení instrumentu do databáze
    saveInstrument(instrument) {
        // Nahrazení tečky podržítkem, pokud ji ticker obsahuje (Firebase nepodporuje tečku v klíči)
        const key = instrument.ticker.includes('.') ? instrument.ticker.replace(/\./g, '_') : instrument.ticker;

        const dbRef = this.database.ref('instruments/' + key);
        dbRef.set({
            symbol: instrument.symbol,
            ticker: instrument.ticker,
            name: instrument.name,
            investment: instrument.investment,
            volume: instrument.volume,
            type: instrument.type,
        }).then(() => {
            console.log("Data saved successfully!");
        }).catch((error) => {
            console.error("Error saving data: ", error);
        });
    }

    // Smazání instrumentu z databáze
    removeInstrument(ticker) {
        // Nahrazení podržítka tečkou, pokud ho ticker obsahuje (Firebase nepodporuje tečku v klíči)
        const key = ticker.includes('.') ? ticker.replace(/\./g, '_') : ticker;

        const dbRef = this.database.ref('instruments/' + key);
        dbRef.remove()
            .then(() => {
                console.log("Data deleted successfully!");
            })
            .catch((error) => {
                console.error("Error deleting data: ", error);
            });
    }

    // Uložení výnosu do databáze 
    saveInterest(date, interest) {
        const dbRef = this.database.ref('interests');

        // Inicializace objektu pro uložení do databáze
        const interestData = {
            [date]: interest
        };

        dbRef.update(interestData)
            .then(() => {
                console.log("Data saved successfully!");
            })
            .catch((error) => {
                console.error("Error saving data: ", error);
            });
    }

    // Získání dat z databáze podle cesty v databázi (reference)
    async getData(reference) {
        const dbRef = this.database.ref(`${reference}`); // Cesta v databázi

        try {
            const snapshot = await dbRef.once('value'); // Čekání na získání dat
            if (snapshot.exists()) {
                const data = snapshot.val(); // Získání všech dat
                return data; // Vrátí načtená data
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error loading data: ", error);
            return null;
        }
    }
}
