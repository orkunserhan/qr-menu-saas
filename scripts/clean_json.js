const fs = require('fs');
const path = require('path');

const locales = ['en.json', 'tr.json', 'de.json', 'it.json', 'fr.json', 'sk.json'];

locales.forEach(file => {
    const filePath = path.join(__dirname, 'messages', file);
    if (fs.existsSync(filePath)) {
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            // 1. Delete admin.reports object
            if (data.admin && data.admin.reports) {
                delete data.admin.reports;
            }
            
            // 2. Delete restAdmin.reports string
            if (data.restAdmin && data.restAdmin.reports) {
                delete data.restAdmin.reports;
            }
            
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
            console.log(`Cleaned unused reports keys from ${file}`);
        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    }
});
