const http = require('http');
const fs = require('fs');
const { program } = require('commander');

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

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Сервер працює. Готовий до виконання Частини 2.');
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