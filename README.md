# Sistema di Monitoraggio Integrato - Oleificio Cima di Bitonto

Questo progetto implementa un sistema di monitoraggio completo per l'Oleificio Cooperativo Cima di Bitonto, consentendo il tracciamento in tempo reale della produzione, qualità, condizioni ambientali e stato dei macchinari attraverso quattro dashboard specializzate.

## 🌟 Caratteristiche Principali

- Dashboard di Produzione per monitorare rese e consumi
- Dashboard di Qualità per l'analisi dei parametri dell'olio
- Dashboard Ambiente per il tracciamento delle condizioni meteorologiche
- Dashboard Macchine per la gestione della manutenzione
- Simulatore integrato per la generazione di dati realistici
- Interfaccia responsive con temi chiaro/scuro
- Filtri temporali per l'analisi storica

## 🔧 Prerequisiti

Prima di iniziare, assicurati di avere installato:

- Node.js (versione 18.0.0 o superiore)
- npm (versione 9.0.0 o superiore)
- Git

## 🚀 Installazione

1. Clona il repository:
```bash
git clone https://github.com/tuousername/oleificio-dashboard.git
cd oleificio-dashboard
```

2. Installa le dipendenze:
```bash
npm install
```

3. Avvia il server di sviluppo:
```bash
npm run dev
```

4. Apri il browser e naviga su:
```
http://localhost:5173
```

## 📦 Struttura del Progetto

```
src/
├── components/        # Componenti React riutilizzabili
├── hooks/            # Custom hooks
├── lib/             # Utility e configurazioni
├── pages/           # Componenti pagina
├── simulator/       # Logica di simulazione dati
│   ├── environmental/
│   ├── machine/
│   ├── processing/
│   └── quality/
├── types/           # Definizioni TypeScript
└── styles/         # Stili globali e temi
```

## 🛠️ Tecnologie Utilizzate

- React 18
- TypeScript
- Tailwind CSS
- Recharts
- Lucide Icons
- shadcn/ui

## 📊 Simulatore

Il sistema include un simulatore che genera dati realistici per:

- Condizioni ambientali (temperatura, umidità, precipitazioni)
- Parametri di processo (temperature di lavorazione, rese)
- Analisi qualità (acidità, perossidi, panel test)
- Stati dei macchinari e manutenzione

Per utilizzare dati reali anziché simulati, modifica il file `.env` impostando:

```env
VITE_USE_REAL_DATA=true
VITE_API_ENDPOINT=your_api_endpoint
```

## 🎨 Personalizzazione Temi

Il progetto utilizza Tailwind CSS per la gestione dei temi. Per modificare i colori e altri aspetti visivi, edita il file `tailwind.config.ts`.

## 📝 Script Disponibili

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Crea la build di produzione
- `npm run preview` - Visualizza la build di produzione in locale
- `npm run lint` - Esegue il linting del codice
- `npm run test` - Esegue i test

## 🤝 Contributing

Le contribuzioni sono benvenute! Per favore:

1. Fai il fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Committa i tuoi cambiamenti (`git commit -m 'Add some AmazingFeature'`)
4. Pusha sul branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

## ✍️ Autori

- Nome Cognome - [GitHub](https://github.com/tuousername)

## 🙏 Ringraziamenti

- Oleificio Cooperativo Cima di Bitonto per la collaborazione
- shadcn/ui per i componenti React
- Il team di Recharts per la libreria di visualizzazione dati