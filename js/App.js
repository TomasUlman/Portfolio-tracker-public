'use strict';

class App {
    constructor() {
        this.loginManager = new LoginManager();
        this.databaseManager = new DatabaseManager();
        this.chartManager = new ChartManager();
        this.converter = new CurrencyConverter();
        this.ui = new UI();
        this.ui.logoutBtn.addEventListener('click', this.loginManager.logout.bind(this.loginManager)); // Kliknutí na ikonu logout
        this.ui.addInstrumentForm.addEventListener('submit', this._addInstrument.bind(this)); // Odeslání formuláře pro přidání instrumentu
        this.ui.portfolioTable.addEventListener('click', this._removeInstrument.bind(this)); // Kliknutí na ikonu koše v tabulce
        this.ui.portfolioTable.addEventListener('click', this._openEditInstrument.bind(this)); // Kliknutí na ikonu tužky v tabulce
        this.ui.editInstrumentForm.addEventListener('submit', this._editInstrument.bind(this)); // Odeslání formuláře úpravy instrumentu
        this.instrumentsArr = []; // Globální pole instrumentů
        this.portfolio = null; // Portfolio 
    }

    async init() {
        // Načtení instrumentů z databáze
        const instruments = await this.databaseManager.getData('instruments');

        // Získání kurzu USD na CZK
        const rate = await this.converter.getUsdToCzkRate();
        // const rate = 22.5; // Test rate

        // Inicializace instrumentů
        if (instruments) {
            for (const item of Object.values(instruments)) {
                const instrument = new Instrument(item.symbol, item.ticker, item.name, item.investment, item.volume, item.type);
                await instrument.setInstrumentMetrics() // Načtení ceny a provedení výpočtů pro instrument
                this.instrumentsArr.push(instrument); // Vložení instrumentu do globálního pole
                this.ui.renderInstrumentToList(instrument); // Zobrazení instrumentu v UI tabulce
            }
        }

        // Vytvoření portfolia
        this.portfolio = new Portfolio(this.instrumentsArr, rate);

        // Zobrazení souhrnu portfolia
        this.ui.displayPortfolioSummary(this.portfolio);

        // Vykreslení grafů
        await this._renderYieldChart();
        this._renderBarCharts();

        // Zobrazení tracker contentu
        this.ui.displayTrackerContent();
    }

    // Vykreslení grafu výnosu
    async _renderYieldChart() {
        // Načtení výnosů z databáze
        const interests = await this.databaseManager.getData('interests');

        // Aktuální datum
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const dateNow = `${year}_${month}`;

        // Získání posledního klíče (datumu)
        const lastDate = Object.keys(interests).pop();

        // Porovnání posledního a aktuálního datumu v databázi, pokud je nový měsíc, uloží výnos do databáze
        if (dateNow !== lastDate) {
            const interest = this.portfolio.profitPercentage.toFixed(2);
            this.databaseManager.saveInterest(dateNow, interest);
        }

        // Vytvoření grafu výnosu
        this.chartManager.createYieldChart(interests, this.portfolio.profitPercentage.toFixed(2));
    }

    // Vykreslení sloupcových grafů
    _renderBarCharts() {
        // Vytvoření pole s daty pro každý graf
        const instrumentTypeTotalsArr = this.portfolio.getInstrumentTypeTotalsArr(); // Pole typů a investovaných částek
        const stocksArr = this.portfolio.getTypeArr('Stock'); // Pole akcií a investovaných částek
        const etfArr = this.portfolio.getTypeArr('ETF'); // Pole ETF a investovaných částek
        const cryptoArr = this.portfolio.getTypeArr('Crypto'); // Pole kryptoměn a investovaných částek

        // Vytvoření sloupcových grafů
        this.chartManager.createBarChart(instrumentTypeTotalsArr, 'typeChart');
        this.chartManager.createBarChart(stocksArr, 'stockChart');
        this.chartManager.createBarChart(etfArr, 'etfChart');
        this.chartManager.createBarChart(cryptoArr, 'cryptoChart');
    }

    // Přidá instrument do portfolia, aktualizuje aplikaci a uloží instrument do databáze
    async _addInstrument(e) {
        e.preventDefault();

        // Získání dat z formuláře modálního okna
        const formData = this.ui.getFormData(this.ui.addInstrumentForm);

        if (!formData) return;

        const instrument = new Instrument(formData.symbol, formData.ticker, formData.name, +formData.investment, +formData.volume, formData.type);
        await instrument.setInstrumentMetrics(); // Inicializace ceny a provedení výpočtů pro instrument
        if (instrument.price === null) return;
        this.databaseManager.saveInstrument(instrument); // Uložení instrumentu do databáze
        this.instrumentsArr.push(instrument); // Uložení instrumentu do globálního pole

        this.ui.renderInstrumentToList(instrument); // Zobrazí instrument v UI tabulce
        this.ui.addInstrumentModal.closeModal(); // Zavře modální okno pro přidání instrumentu
        this.ui.clearForm(this.ui.addInstrumentForm); // Vymaže obsah inputů ve formuláři modálního okna

        this.portfolio.updatePortfolio(this.instrumentsArr); // Aktualizuje portfolio přehled
        this.ui.displayPortfolioSummary(this.portfolio); // Zobrazí portfolio přehled

        this._renderBarCharts(); // Aktualizuje sloupcové grafy
    }

    // Odstraní instrument z portfolia, aktualizuje aplikaci a smaže instrument z databáze
    _removeInstrument(e) {
        // Kontrola kliknutí na ikonu koše v tabulce
        if (e.target.classList.contains('fa-trash-can')) {
            // Získá ticker řádky u které bylo kliknuto na ikonu koše
            const dataTicker = e.target.getAttribute('data-ticker-remove');

            // Aktualizuje globální pole instrumentů bez výše zvoleného tickeru
            this.instrumentsArr = this.instrumentsArr.filter(instrument => instrument.ticker !== dataTicker);

            // Smaže instrument z UI tabulky
            this.ui.removeInstrumentFromList(dataTicker);

            // Smaže instrument z databáze
            this.databaseManager.removeInstrument(dataTicker);

            this.portfolio.updatePortfolio(this.instrumentsArr); // Aktualizuje portfolio
            this.ui.displayPortfolioSummary(this.portfolio); // Zobrazí portfolio 

            this._renderBarCharts(); // Aktualizuje sloupcové grafy
        }
    }

    // Otevírá modální okno úpravy instrumentu
    _openEditInstrument(e) {
        // Kontrola zda bylo kliknuto na ikonu tužky
        if (e.target.classList.contains('fa-pen-to-square')) {
            // Získá ticker řádky ve které bylo kliknuto na ikonu tužky
            const dataTicker = e.target.getAttribute('data-ticker-edit');

            // Vyhledá instrument dle tickeru získaného výše v globálním poli instrumentů
            const instrument = this.instrumentsArr.find(instrument => instrument.ticker === dataTicker);

            // Zobrazí název a ticker upravovaného instrumentu
            this.ui.renderEditInstrumentFormData(instrument);

            // Otevře modální okno úpravy instrumentu
            this.ui.editInstrumentModal.openModal();
        }
    }

    // Upraví instrument v portfoliu, aktualizuje aplikaci a aktualizuje data instrumentu v databázi
    async _editInstrument(e) {
        e.preventDefault();

        // Získá data z formuláře modálního okna
        const formData = this.ui.getFormData(this.ui.editInstrumentForm);

        // Vybere instrument podle tickeru z formuláře úpravy instrumentu
        const instrument = this.instrumentsArr.find(instrument => instrument.ticker === formData.ticker);

        // Nastaví instrumentu novou investovanou částku a počet kusů
        instrument.setInvestmentAndVolume(formData.investment, formData.volume);
        await instrument.setInstrumentMetrics(); // Inicializuje cenu a provede výpočty pro instrument

        this.databaseManager.saveInstrument(instrument); // Aktualizuje instrument v databázi

        this.ui.editInstrumentModal.closeModal(); // Zavře modální okno
        this.ui.clearForm(this.ui.editInstrumentForm); // Vyčistí inputy ve formuláři modálního okna
        this.ui.updateInstrumentInList(instrument); // Aktualizuje data instrumentu v UI tabulce 

        this.portfolio.updatePortfolio(this.instrumentsArr); // Aktualizuje portfolio
        this.ui.displayPortfolioSummary(this.portfolio); // Zobrazí portfolio souhrn v UI
    }
}

// Inicializace aplikace
const app = new App();
app.loginManager.checkAuth().then((isLoggedIn) => {
    if (isLoggedIn) {
        app.init(); // Spustí inicializaci pouze, pokud je uživatel přihlášený
    }
});
