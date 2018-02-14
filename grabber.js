const puppeteer = require('puppeteer');
const argv = require('minimist')(process.argv.slice(2));

const url = argv.url;
const outdir = argv.outdir || '.';
let offset = url.indexOf('.com');

let filename = url.substring(offset + 5).replace(/\//g,'-');

if (filename.endsWith('.php')) {
    filename = filename.slice(0,-4);
}

(async () => {
    const browser = await puppeteer.launch({ignoreHTTPSErrors:true});
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({'Accept-Charset': 'utf-8'});

	await page.setJavaScriptEnabled(false);
    
    try {
        const res = await page.goto(url, {'waitUntil':'networkidle'});
        if (res.ok !== true) {
            console.log('Server returned status code ' + res.code);
            process.exitCode = 1;
            await browser.close();
            return;
        }
    } catch (e) {
        console.log(e);
        process.exitCode = 1;
        await browser.close();
        return;
    }

    if (url.includes('dnainfo.com')) {
        await page.addStyleTag({path: 'dnainfotweaks.css'})
    }

    await page.emulateMedia('screen');

    let pdf_options = {displayHeaderFooter: true, margin: {top: '.5in', bottom: '.5in', left: '.5in', right: '.5in'}, printBackground: true, path: outdir + '/' + filename + '.pdf'}

    if (url.includes('laweekly.com')) {
		await page.setViewport({width: 500, height: 800})
        pdf_options.scale = .75;
        pdf_options.printBackground = false;
    }

    try {
    await page.pdf(pdf_options);
    } catch (e) {
        console.log(e);
        process.exitCode = 1;
        await browser.close();
        return;
    }

    await browser.close();
})();
