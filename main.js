const http = require('http');
const fs = require('fs');
const url = require('url');
const { program } = require('commander');
const { XMLBuilder } = require('fast-xml-parser');

program
    .option('-i, --input <path>', 'шлях до файлу, який даємо для читання')
    .option('-h, --host <address>', 'адреса сервера')
    .option('-p, --port <number>', 'порт сервера');

program.parse(process.argv);
const options = program.opts();

if (!options.input) {
    console.error("Помилка: не задано обов'язковий параметр --input");
    process.exit(1);
}
if (!options.host) {
    console.error("Помилка: не задано обов'язковий параметр --host");
    process.exit(1);
}
if (!options.port) {
    console.error("Помилка: не задано обов'язковий параметр --port");
    process.exit(1);
}

const inputFile = options.input;
const host = options.host;
const port = options.port;

const builder = new XMLBuilder({
    format: true,
});

const server = http.createServer((req, res) => {
    const queryObject = url.parse(req.url, true).query;

    fs.readFile(inputFile, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Помилка на сервері: неможливо прочитати файл.');
            return;
        }

        try {
            let banks = JSON.parse(data);

            if (queryObject.normal === 'true') {
                banks = banks.filter(bank => bank.COD_STATE === 1);
            }

            const processedBanks = banks.map(bank => {
                const bankData = {};

                if (queryObject.mfo === 'true') {
                    bankData.mfo_code = bank.MFO;
                }
                
                bankData.name = bank.SHORTNAME;
                bankData.state_code = bank.COD_STATE;
                
                return bankData;
            });

            const finalObjectForXml = {
                banks: {
                    bank: processedBanks
                }
            };
            
            const xmlData = builder.build(finalObjectForXml);

            res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
            res.end(xmlData);

        } catch (parseError) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Помилка на сервері: неможливо обробити JSON з файлу.');
        }
    });
});

fs.access(inputFile, (err) => {
    if (err) {
        console.error('Cannot find input file');
        process.exit(1);
    } else {
        server.listen(port, host, () => {
            console.log(`Сервер успішно запущено за адресою http://${host}:${port}`);
        });
    }
});