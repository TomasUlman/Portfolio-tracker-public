'use strict';

class ChartManager {

    // Objekt pozadí grafu
    #backgroundPlugin = {
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart) => {
            const ctx = chart.ctx;
            ctx.save();
            ctx.fillStyle = 'rgba(33, 37, 41, 1)';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        }
    };

    constructor() {
        this.charts = {}; // Sloupcové grafy
        this.yieldChartInstance = null; // Graf výnosu (čárový)
    }

    _formatDates(interests) {
        const formattedDates = []; // Pole datumů

        Object.keys(interests).forEach(key => {
            const [year, month] = key.split('_'); // Rozdělení klíče na rok a měsíc
            formattedDates.push(`${month}-${year}`); // Přidání formátovaného data do pole
        })

        return formattedDates;
    }

    // Graf výnosu
    createYieldChart(interests, actualInterest) {
        const labels = this._formatDates(interests);
        const values = Object.values(interests);

        // Aktuální výnos 
        labels.push('TODAY');
        values.push(actualInterest);

        const ctx = document.getElementById('yieldChart').getContext('2d');

        // Pokud již existuje instance grafu, aktualizuje ji
        if (this.yieldChartInstance) {
            this.yieldChartInstance.data.labels = labels; // Aktualizuje popisky
            this.yieldChartInstance.data.datasets[0].data = values; // Aktualizuje data
            this.yieldChartInstance.update(); // Překresli graf
        } else {
            // Pokud instance neexistuje, vytvoří ji
            this.yieldChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Výkonnost portfolia (%)',
                        data: values,
                        borderColor: '#2192FF',
                        backgroundColor: 'rgba(81, 181, 247, 0.5)',
                        borderWidth: 1.5
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            ticks: {
                                color: '#cbcaca',
                                callback: function (value) {
                                    return value + '%';
                                },
                                padding: 10,
                                stepSize: 10
                            },
                            grid: {
                                display: false
                            },
                            border: {
                                display: false
                            },
                        },
                        x: {
                            ticks: {
                                color: '#cbcaca',
                                padding: 10,
                                maxTicksLimit: 50,
                            },
                            grid: {
                                display: true,
                                color: '#2194ff31'
                            },
                            border: {
                                display: false
                            },
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function (tooltipItem) {
                                    return tooltipItem.raw + '%';
                                },
                                title: function () {
                                    return '';
                                }
                            },
                            displayColors: false
                        }
                    }
                },
                plugins: [this.#backgroundPlugin]
            });
        }
    }

    // Sloupcový graf
    createBarChart(arr, elementID) {
        const labels = arr[0];
        const values = arr[1];
        const total = values.reduce((acc, value) => acc + value, 0);

        const ctx = document.getElementById(`${elementID}`).getContext('2d');

        // Zkontroluje, zda již existuje instance grafu pro daný elementID
        if (this.charts[elementID]) {
            // Aktualizuje data stávajícího grafu
            this.charts[elementID].data.labels = labels;
            this.charts[elementID].data.datasets[0].data = values;
            this.charts[elementID].update(); // Překresli graf
        } else {
            // Vytvoří nový graf a uloží jeho instanci do objektu this.charts
            this.charts[elementID] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: '#2194ff58',
                        borderColor: '#2192FF',
                        borderWidth: 1.5
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#cbcaca',
                                padding: 10,
                                stepSize: 500
                            },
                            grid: {
                                display: true,
                                color: '#2194ff31'
                            },
                            border: {
                                display: false
                            }
                        },
                        x: {
                            ticks: {
                                color: '#cbcaca',
                                padding: 10
                            },
                            grid: {
                                display: true,
                                color: '#2194ff31'
                            },
                            border: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function (tooltipItem) {
                                    const value = tooltipItem.raw;
                                    const percentage = ((value / total) * 100).toFixed(2);
                                    return percentage + '%';
                                }
                            },
                            displayColors: false
                        }
                    },
                },
                plugins: [this.#backgroundPlugin]
            });
        }
    }
}