'use strict';

class CurrencyConverter {
    constructor() { }

    // Fetch kurzu převodu měny (Rapid API)
    async _fetchCurrencyRate(from, to) {
        const url = `https://alpha-vantage.p.rapidapi.com/query?to_currency=${to}&function=CURRENCY_EXCHANGE_RATE&from_currency=${from}`;
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': '80e39cd8a3mshe8e1c65ad704213p197b58jsn901b1f69d038',
                'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Error fetching currency rate: ", error.message);
        }
    }

    // Vrátí kurz dolaru vůči koruně
    async getUsdToCzkRate() {
        try {
            const data = await this._fetchCurrencyRate('USD', 'CZK');
            const rate = +data["Realtime Currency Exchange Rate"]["5. Exchange Rate"];
            return rate;
        } catch (error) {
            console.error("Error converting USD to CZK:", error.message);
            return null;
        }
    }
}