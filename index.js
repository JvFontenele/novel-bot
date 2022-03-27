const puppeteer = require("puppeteer");
const fs = require("fs");
const cliProgress = require("cli-progress");
const colors = require("ansi-colors");

(async () => {
  const capitulos =[]
  //const capitulos = require("./RTWRW.json");
  const total = 100;

  const b1 = new cliProgress.SingleBar(
    {
      format:
        "Baixando Capitulos |" +
        colors.cyan("{bar}") +
        "| {percentage}% | {value}/{total}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    },
    cliProgress.Presets.react
  );

  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();
  await page.goto(
    "https://www.google.com.br/"
  );
  await page.goto(
    "https://translate.google.com/translate?sl=pt&tl=en&hl=pt-BR&u=https://www.novelcool.com/chapter/I-m-the-King-Of-Technology-Chapter-498-Success-/5876474/&client=webapp"
  );

  b1.start(total, 0, { titulo: "iniciando..." });

  for (let index = 0; index <= total; index++) {
    await autoScroll(page);

    const capitulo = await page.evaluate(() => {
      //pegar o titulo do capitulo
      const titulo = document.querySelectorAll(".chapter-title")[0].innerText;

      //pegar a lista de paragrafos
      const listaParagrafos = document.querySelectorAll(
        ".chapter-reading-section p"
      );

      //transformar os nodes em array
      const listaArray = [...listaParagrafos];

      //transformar para obj
      const capitulo = listaArray.map(({ innerText }) => ({
        p: innerText,
      }));

      const url = document.querySelectorAll(".chapter-reading-pageitem a")[1]
        .href;
      //console.log(url)

      return {
        url: url,
        titulo: titulo,
        paragrafos: capitulo,
      };
    });

    b1.increment();
    b1.update(index, { titulo: capitulo.titulo });

    capitulos.push(capitulo);

    //console.log(capitulos)
    fs.writeFile("tec.json", JSON.stringify(capitulos, null, 2), (err) => {
      if (err) throw new Error("erro");
    });
    await page.goto(capitulo.url);
  }

  await browser.close();

  await b1.stop();
})();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
