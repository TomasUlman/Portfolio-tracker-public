'use strict';

class UI {
    constructor() {
        this.trackerContent = document.querySelectorAll('.tracker-content'); // Všechny elementy zobrazující obsah aplikace
        this._hideTrackerContent(); // Skryje aplikaci
        this.loader = document.querySelector('.loader'); // Načítací spinner
        this.logoutBtn = document.getElementById('log-out'); // Tlačítko pro log out
        this.portfolioTable = document.querySelector('.portfolio-list'); // Tabulka s instrumenty 
        this.totalInvestedUSDSpan = document.getElementById('total-invested'); // Celková investice USD v přehledu 
        this.totalCurrentUSDSpan = document.getElementById('portfolio-value'); // Celková aktuální hodnota USD v přehledu
        this.totalInvestedCZKSpan = document.getElementById('total-invested-czk'); // Celková investice CZK v přehledu
        this.totalCurrentCZKSpan = document.getElementById('portfolio-value-czk'); // Celková aktuální hodnota CZK v přehledu
        this.profitUSDPercentageSpan = document.getElementById('profit-usd-percentage'); // Výnos v % v přehledu
        this.profitUSDSpan = document.getElementById('profit-usd'); // Výnos USD v přehledu
        this.profitCZKSpan = document.getElementById('profit-czk'); // Výnos CZK v přehledu
        this.usdToCzkSpan = document.getElementById('usd-czk'); // Kurz dolaru a koruny
        this.addInstrumentModal = new Modal(document.querySelector('.add-instrument-modal')); // Modál přidání instrumentu
        this.addInstrumentBtn = document.getElementById('add-instrument-btn') // Tlačítko přidat instrument v modálu
            .addEventListener('click', this.addInstrumentModal.openModal.bind(this.addInstrumentModal)); // Kliknutí na tlačítko výše
        this.addInstrumentTypeSelect = document.getElementById('type-select'); // Select typu instrumentu  
        this.addInstrumentTypeSelect
            .addEventListener('change', this._handleAddInstrumentTypeChange.bind(this)); // Změna typu instrumentu v selectu výše
        this.addInstrumentForm = document.getElementById('add-instrument-form'); // Formulář přidání instrumentu
        this.editInstrumentModal = new Modal(document.querySelector('.edit-instrument-modal')); // Modál úpravy instrumentu
        this.editInstrumentForm = document.getElementById('edit-instrument-form'); // Formulář úpravy instrumentu
    }

    // Zobrazí elementy zobrazující obsah aplikace
    displayTrackerContent() {
        this.loader.style.display = "none";
        this.trackerContent.forEach(content => content.style.display = "");
    }

    // Skryje elementy zobrazující obsah aplikace
    _hideTrackerContent() {
        this.trackerContent.forEach(content => content.style.display = "none");
    }

    // Vytvoří element řádku do tabulky
    renderInstrumentToList(instrument) {
        const html =
            `<tr class="instrument" scope="row">
                <td class="instrument-name">${instrument.name}</td>
                <td class="ticker-symbol">${instrument.ticker}</td>
                <td class="volume">${instrument.volume}</td>
                <td class="invested-value">${instrument.investment} $</td>
                <td class="current-value">${instrument.currentInvestmentValue.toFixed(2)} $</td>
                <td class="market-price">${instrument.price.toFixed(2)} $</td>
                <td class="net-profit">${instrument.profit.toFixed(2)} $</td>
                <td class="profit-percentage">${instrument.profitPercentage.toFixed(2)} %</td>
                <td><i class="fa-regular fa-pen-to-square table-btn" data-ticker-edit="${instrument.ticker}"></i></i></td>
                <td><i class="fa-regular fa-trash-can table-btn" data-ticker-remove="${instrument.ticker}"></i></td>
            </tr>`;
        this.portfolioTable.insertAdjacentHTML('beforeend', html);
    }

    // Zobrazí portfolio přehled
    displayPortfolioSummary(portfolio) {
        this._setFormattedText(this.totalInvestedUSDSpan, portfolio.totalInvestedUSD, '$');
        this._setFormattedText(this.totalCurrentUSDSpan, portfolio.totalCurrentUSD, '$');
        this._setFormattedText(this.totalInvestedCZKSpan, portfolio.totalInvestedCZK, 'CZK');
        this._setFormattedText(this.totalCurrentCZKSpan, portfolio.totalCurrentCZK, 'CZK');
        this._setFormattedText(this.profitUSDPercentageSpan, portfolio.profitPercentage, '%');
        this._setFormattedText(this.profitUSDSpan, portfolio.profitUSD, '$');
        this._setFormattedText(this.profitCZKSpan, portfolio.profitCZK, 'CZK');
        this._setFormattedText(this.usdToCzkSpan, portfolio.exchangeRate, '$');
    }

    // Naformátuje text do přehledu 
    _setFormattedText(element, value, suffix = '') {
        element.textContent = `${this._formatNumberWithSpace(value.toFixed(2))} ${suffix} `;
    };

    // Naformátuje číslo, aby byla mezi tisíci mezera 
    _formatNumberWithSpace(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    // Odstraní element řádku z tabulky podle tickeru
    removeInstrumentFromList(ticker) {
        const escapedTicker = ticker.replace(/\./g, '\\.'); // Nahradí tečku v tickeru za podtržítko

        // Vybere element (řádek tabulky), který má v datasetu data-ticker-remove daný ticker (ikona koše)
        const element = document.querySelector(`[data-ticker-remove=${escapedTicker}]`).parentElement.parentElement;

        // Smaže element
        element.innerHTML = '';
    }

    // Aktualizuje element řádku tabulky 
    updateInstrumentInList(instrument) {
        const escapedTicker = instrument.ticker.replace(/\./g, '\\.'); // Nahradí tečku v tickeru za podtržítko

        // Vybere element (řádek tabulky), který má v datasetu data-ticker-edit daný ticker (ikona tužky)
        const element = document.querySelector(`[data-ticker-edit=${escapedTicker}]`).parentElement.parentElement;

        element.querySelector('.volume').textContent = instrument.volume; // Počet ks v řádku tabulky
        element.querySelector('.invested-value').textContent = `${instrument.investment} $`; // Investovaná částka v řádku tabulky
        element.querySelector('.current-value').textContent = `${instrument.currentInvestmentValue.toFixed(2)} $`; // Aktuální hodnota v řádku tabulky
        element.querySelector('.market-price').textContent = `${instrument.price.toFixed(2)} $`; // Cena v řádku tabulky
        element.querySelector('.net-profit').textContent = `${instrument.profit.toFixed(2)} $`; // Výnos v řádku tabulky
        element.querySelector('.profit-percentage').textContent = `${instrument.profitPercentage.toFixed(2)} %`; // Výnos v % v řádku tabulky
    }

    // Zobrazí data upravovaného instrumentu v modálu úpravy instrumentu
    renderEditInstrumentFormData(instrument) {
        document.getElementById('edit-name-span').textContent = instrument.name; // Název
        document.getElementById('edit-ticker-span').textContent = `(${instrument.ticker}) :`; // Ticker
        document.getElementById('edit-ticker-input').value = instrument.ticker; // Ticker input (skrytý)
        document.getElementById('edit-investment-input').value = instrument.investment; // Investovaná částka input
        document.getElementById('edit-volume-input').value = instrument.volume; // Počet kusů input
    }

    // Reaguje na změnu typu instrumentu v selectu modálu přidání instrumentu
    _handleAddInstrumentTypeChange() {
        const symbolInput = document.getElementById('add-symbol-input'); // Symbol input
        const tickerInput = document.getElementById('add-ticker-input'); // Ticker input
        symbolInput.value = tickerInput.value; // Zkopíruje hodnotu z tickeru do symbolu

        // Pokud je instrument typ kryptoměna zobrazí input pro zadání symbolu
        if (this.addInstrumentTypeSelect.value === 'Crypto') {
            symbolInput.parentElement.style.display = 'flex';
            symbolInput.value = '';
        } else {
            symbolInput.parentElement.style.display = 'none'; // Pokud není typ kryptoměna, skryje input pro symbol
        }
    }

    // Vrátí data z formuláře
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            data[key] = value;
        });

        return data;
    }

    // Vyčistí všechny inputy formuláře
    clearForm(form) {
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
        });

        // Pokud formulář obsahuje select, resetuje na možnost 0
        const select = form.querySelector('select');
        if (select) {
            select.selectedIndex = 0;
        }
    }
}