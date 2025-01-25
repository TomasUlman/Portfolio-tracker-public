'use strict';

class Modal {
    constructor(modal) {
        this.modal = modal; // Element modálního okna 
        this.overlay = document.querySelector('.overlay'); // Overlay pro všechny modální okna
        this.closeBtn = this.modal.querySelector('.close-modal'); // Tlačítko zavření modálního okna
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.overlay.addEventListener('click', () => this.closeModal());
        document.addEventListener('keydown', (e) => this._handleEscape(e));
    }

    // Otevření modálního okna
    openModal() {
        this.modal.classList.remove('hidden');
        this.overlay.classList.remove('hidden');
    }

    // Zavření modálního okna
    closeModal() {
        this.modal.classList.add('hidden');
        this.overlay.classList.add('hidden');
    }

    // Zavření modálního okna klávesou escape
    _handleEscape(e) {
        if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
            this.closeModal();
        }
    }
}