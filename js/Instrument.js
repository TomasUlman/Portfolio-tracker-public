'use strict';

// BTC uuid (symbol): Qwsogvtv82FCd 
// ETH uuid (symbol): razxDUgYGNAdQ 

//Apple (AAPL): 10 akcií za celkem 1 371,50 USD
//Microsoft (MSFT): 8 akcií za celkem 3 008 USD
//Bitcoin (BTC): 0,089458 jednotek za celkem 2 353,70 USD
//SPDR Portfolio S&P 500 ETF (SPLG): 20 kusů za celkem 1 100 USD
//Palantir Technologies (PLTR): 35 akcií za celkem 559,30 USD

class Instrument {
    constructor(symbol, ticker, name, investment, volume, type) {
        this.symbol = symbol; // Ticker, od tickeru se liší u kryptoměn viz. výše
        this.ticker = ticker; // Ticker
        this.name = name; // Název instrumentu
        this.investment = investment; // Investovaná částka
        this.volume = volume; // Počet kusů
        this.type = type; // Typ instrumentu
        this.price = null; // Cena
        this.currentInvestmentValue = null; // Aktuální hodnota instrumentu
        this.profit = null; // Zisk
        this.profitPercentage = null; // Zisk v procentech
    }

    // Fetch data akcie/ETF (Rapid API)
    async _fetchStockData(symbol) {
        const url = `https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/history?symbol=${symbol}&interval=1mo&diffandsplits=false`;
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': '80e39cd8a3mshe8e1c65ad704213p197b58jsn901b1f69d038',
                'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error(`Chyba při získávání dat pro ${symbol}:`, error.message);
            return null;
        }
    }

    // Fetch data kryptoměny (Rapid API)
    async _fetchCryptoData(symbol) {
        const url = `https://coinranking1.p.rapidapi.com/coin/${symbol}?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=24h`;
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': '80e39cd8a3mshe8e1c65ad704213p197b58jsn901b1f69d038',
                'x-rapidapi-host': 'coinranking1.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error(`Chyba při získávání dat pro ${symbol}:`, error);
            return null;
        }
    }

    // Ze získaných dat o instrumentu vrátí cenu
    async _getInstrumentPrice() {
        // Pokud je typ instrumentu akcie/ETF získá data o akcii/ETF a vrátí jeho cenu  
        if (this.type.toLowerCase() === 'stock' || this.type.toLowerCase() === 'etf') {
            const stockData = await this._fetchStockData(this.symbol);

            if (!stockData || !stockData.meta || stockData.meta.regularMarketPrice === undefined) {
                alert(`Chyba: Ticker ${this.symbol} neexistuje`);
                return null;
            }

            return +stockData.meta.regularMarketPrice;
        }

        // Pokud je typ instrumentu kryptroměna získá data o kryptoměně a vrátí její cenu
        if (this.type.toLowerCase() === 'crypto') {
            const cryptoData = await this._fetchCryptoData(this.symbol);

            if (!cryptoData || !cryptoData.data || cryptoData.data.coin.price === undefined) {
                alert(`Chyba: Symbol ${this.symbol} neexistuje`);
                return null;
            }

            return +cryptoData.data.coin.price;
        }
    }

    // Nastaví aktuální hodnotu investice (počet ks * cena)
    _setCurrentInvestmentValue() {
        this.currentInvestmentValue = this.volume * this.price;
    }

    // Nastaví výnos (Aktuální hodnota investice - investovaná částka)
    _setProfit() {
        this.profit = this.currentInvestmentValue - this.investment;
    }

    // Nastaví výnos v procentech (výnos / investovaná částka * 100)
    _setProfitPercentage() {
        this.profitPercentage = this.profit / this.investment * 100;
    }

    // Nastaví investovanou částku a počet ks
    setInvestmentAndVolume(investment, volume) {
        this.investment = +investment;
        this.volume = +volume;
    }

    // Získá cenu instrumentu a provede výpočty pro instrument
    async setInstrumentMetrics() {
        this.price = await this._getInstrumentPrice();
        if (this.price) {
            this._setCurrentInvestmentValue();
            this._setProfit();
            this._setProfitPercentage();
        }
    }

    // Test function
    // setInstrumentMetrics() {
    //     this.price = 100;
    //     if (this.price) {
    //         this._setCurrentInvestmentValue();
    //         this._setProfit();
    //         this._setProfitPercentage();
    //     }
    // }
}