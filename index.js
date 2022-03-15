const puppeteer = require('puppeteer');
const fs = require('fs');
const cliProgress = require('cli-progress');
const  colors  =  require ( 'ansi-colors' );





(async () => {
    //const capitulos =[]
    const capitulos= require("./RTWRW.json");
    const total = 1000;
    
    const b1 = new cliProgress.SingleBar({
        format: 'Baixando Capitulos |' + colors.cyan('{bar}') + '| {percentage}% | {value}/{total}' ,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    },cliProgress.Presets.react);

    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www-novelcool-com.translate.goog/chapter/Rebirth-of-the-Thief-Who-Roamed-The-World-Chapter-112/163403/?_x_tr_sl=en&_x_tr_tl=pt&_x_tr_hl=pt-BR&_x_tr_pto=wapp");
    
    
     b1.start(total, 0,{titulo:"iniciando..."});

    for (let index = 0; index <= total; index++) {

       await autoScroll(page);
        
        const capitulo = await page.evaluate(() => {


            //pegar o titulo do capitulo
            const titulo = document.querySelectorAll('.chapter-title')[0].innerText;


            //pegar a lista de paragrafos
            const listaParagrafos = document.querySelectorAll('.chapter-reading-section p');


            //transformar os nodes em array
            const listaArray = [...listaParagrafos];


            //transformar para obj
            const capitulo = listaArray.map(({ innerText }) => ({
                p: innerText
            }))

            const url = document.querySelectorAll(".chapter-reading-pageitem a")[1].href
            //console.log(url)

            
            return {
                url: url,
                titulo: titulo,
                paragrafos: capitulo
            }
            
            
        });
        
        b1.increment();
        b1.update(index,{titulo: capitulo.titulo});
       


        capitulos.push(capitulo)

       
       
       //console.log(capitulos)
       fs.writeFile('RTWRW.json', JSON.stringify(capitulos, null, 2), err => {
           if (err) throw new Error('erro')
       })
        await page.goto(capitulo.url);
        

    }

    
    await browser.close();

    await b1.stop();
})();


async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
};

