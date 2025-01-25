'use strict';

class Portfolio {
    constructor(instruments, exchangeRate) {
        this.instruments = instruments; // Pole instrumentů
        this.exchangeRate = exchangeRate; // Kurz měny
        this._updateTotalsAndProfit(); // Nastaví / updatuje všechny metriky portfolia 
    }

    // Updatuje portfolio
    updatePortfolio(instruments) {
        this.instruments = instruments;
        this._updateTotalsAndProfit();
    }

    // Nastavení / update metrik portfolia
    _updateTotalsAndProfit() {
        this.totalInvestedUSD = this._setTotalsUSD('investment'); // Celková investovaná částka v USD
        this.totalCurrentUSD = this._setTotalsUSD('currentInvestmentValue'); // Celková aktuální hodnota portfolia v USD
        this.totalInvestedCZK = this._setTotalsCZK(this.totalInvestedUSD); // Celková investovaná částka v CZK
        this.totalCurrentCZK = this._setTotalsCZK(this.totalCurrentUSD); // Celková aktuální hodnota portfolia v CZK
        this.profitUSD = this._setProfit(this.totalCurrentUSD, this.totalInvestedUSD); // Výnos v USD
        this.profitCZK = this._setProfit(this.totalCurrentCZK, this.totalInvestedCZK); // Výnos v CZK
        this.profitPercentage = this._setProfitPercentage(this.profitUSD, this.totalInvestedUSD); // Výnos v procentech
    }

    // Nastaví celkovou hodnotu v dolarech podle vlastnosti
    _setTotalsUSD(property) {
        return this.instruments.reduce((sum, instrument) => sum + instrument[property], 0);
    }

    // Nastaví celkovou hodnotu v CZK
    _setTotalsCZK(totalUSD) {
        return totalUSD * this.exchangeRate;
    }

    // Nastaví výnos
    _setProfit(currentValue, investedValue) {
        return currentValue - investedValue;
    }

    // Nastaví výnos v procentech
    _setProfitPercentage(profit, investedValue) {
        return profit / investedValue * 100;
    }

    // Vypočítá a vrátí celkovou investovanou částku podle typu
    _calcTypeTotalInvestment(type) {
        // Vyfiltruje z pole instrumentů jen instrumenty s daným typem
        const instrumentsByType = this.instruments.filter(instrument => instrument.type === `${type}`);

        return instrumentsByType.reduce((sum, instrument) => sum + instrument.investment, 0);
    }

    // Vrátí objekt obsahující typy instrumentů (klíč) a celkové investované částky dle typu (hodnota)
    getInstrumentTypeTotalsArr() {
        const stocksTotalInvested = this._calcTypeTotalInvestment('Stock');
        const etfTotalInvested = this._calcTypeTotalInvestment('ETF');
        const cryptoTotalInvested = this._calcTypeTotalInvestment('Crypto');
        return [['Akcie', 'ETF', 'Kryptoměny'], [stocksTotalInvested, etfTotalInvested, cryptoTotalInvested]];
    }

    // Vrátí tickery a investované částky podle zadaného typu instrumentu
    getTypeArr(type) {
        const sortedInstruments = this.instruments.filter(instrument => instrument.type === `${type}`);
        const tickers = sortedInstruments.map(instrument => instrument.ticker);
        const investments = sortedInstruments.map(instrument => instrument.investment);
        return [tickers, investments];
    }
}