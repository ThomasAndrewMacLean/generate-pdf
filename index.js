const puppeteer = require('puppeteer');
const express = require('express');
const bodyParser = require('body-parser');
var favicon = require('serve-favicon');
const path = require('path');

const app = express();
app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(express.static('public'));

// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/pdf', (req, res) => {
    console.log(req.body.site);

    const { site } = req.body;

    res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename="website.pdf"'
    });
    createPdf(site).then(pdf => {
        res.end(pdf);
    });
});
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, 'views', 'index.html'))
);

const createPdf = async site => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const options = {
        //path: 'pdf/web.pdf',
        format: 'A4',
        printBackground: true
    };

    await page.goto(site, {
        waitUntil: 'networkidle0'
    });
    await page.addStyleTag(        {'content': '@page {size: auto}'}      );
    //await page.waitFor('.CompareItem-sc-19g055x-0')
    const pdf = await page.pdf(options);
    await browser.close();
    return pdf;
};

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
