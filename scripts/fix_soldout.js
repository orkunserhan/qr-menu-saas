const fs = require('fs');
const path = require('path');

const updates = {
    'en.json': 'Sold Out',
    'tr.json': 'Tükendi',
    'de.json': 'Ausverkauft',
    'it.json': 'Esaurito',
    'fr.json': 'Épuisé',
    'sk.json': 'Vypredané'
};

Object.entries(updates).forEach(([file, translation]) => {
    const filePath = path.join('messages', file);
    if (fs.existsSync(filePath)) {
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (!data.client) data.client = {};
            data.client.soldOut = translation;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
            console.log(`Added soldOut to ${file}: ${translation}`);
        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    }
});
