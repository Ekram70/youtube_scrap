import { writeFile } from 'fs/promises';
import puppeteer from 'puppeteer';
import { setTimeout } from 'timers/promises';

const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();

await page.goto('https://youtube.com');

await page.waitForSelector('.ytd-searchbox input');
await page.type('.ytd-searchbox input', 'data structure & algorithm', {
  delay: 100,
});

await page.waitForSelector('#search-icon-legacy');
await page.click('#search-icon-legacy');

await setTimeout(200);

await page.waitForSelector(
  '#filter-button > ytd-button-renderer > yt-button-shape > button'
);

await setTimeout(200);
await page.click(
  '#filter-button > ytd-button-renderer > yt-button-shape > button'
);

const link = await page.evaluate(
  () =>
    document.querySelector("a#endpoint:has(div[title='Search for Video'])").href
);

await setTimeout(200);
await page.goto(link);

await setTimeout(1000);

let links = await page.evaluate(() =>
  [...document.querySelectorAll('a#video-title')].map((e) => e.href)
);

links = links.filter((e) => e.startsWith('https://www.youtube.com/watch'));
links.length = 5;

const data = [];

for (let link of links) {
  const page = await browser.newPage();
  await page.goto(link);

  await setTimeout(2000);

  await page.evaluate(() => {
    window.scrollBy(0, 2000);
  });

  await setTimeout(500);

  await page.evaluate(() => {
    window.scrollBy(0, 4000);
  });

  await page.waitForSelector('h2#count');

  const commmentCount = await page.evaluate(
    () => document.querySelector('h2#count span').innerText
  );
  const videoTitle = await page.evaluate(
    () => document.querySelector('h1 .ytd-watch-metadata').innerText
  );

  const channelName = await page.evaluate(
    () => document.querySelector('#top-row .ytd-channel-name a').innerText
  );

  const numberSubscriber = await page.evaluate(
    () => document.querySelector('#owner-sub-count').innerText.split(' ')[0]
  );

  data.push({
    'video link': link,
    'video title': videoTitle,
    'channel name': channelName,
    'number of subscriber': numberSubscriber,
    'number of comments': commmentCount,
  });

  page.close();
}

await writeFile('data.json', JSON.stringify(data, null, 2));

await browser.close();
