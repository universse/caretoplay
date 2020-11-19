import { Browser, BrowserContext } from 'playwright'
import qawolf from 'qawolf'

let browser: Browser
let context: BrowserContext

beforeAll(async () => {
  browser = await qawolf.launch()
  context = await browser.newContext()
  await qawolf.register(context)
})

afterAll(async () => {
  await qawolf.stopVideos()
  await browser.close()
})

test('init', async () => {
  const page = await context.newPage()
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' })
  await page.click('text="New quiz"')
  await page.click('input')
  await page.fill('input', 'asfsaf')
  await page.click('text=Next')
  await page.click('text="Accomplishment in work"')
  await page.click('text=Confirm')
  await page.click('text="An umbrella"')
  await page.click('text=Confirm')
  await page.click('text="Taking a warm shower"')
  await page.click('text=Confirm')
  await page.click('text="Say “I love you.” to all his/her loved ones"')
  await page.click('html')
  await page.click('text=Confirm')
  await page.click('text="50 years with many regrets"')
  await page.click('text=Confirm')
  await page.click('text=Paris')
  await page.click('text=Confirm')
  await page.click('text="Financial concerns"')
  await page.click('text=Confirm')
  await page.click('div:nth-of-type(2)')
  await page.click('text="Being able to bathe"')
  await page.click('text=Confirm')
  await page.click('div:nth-of-type(4) button:nth-of-type(2)')
  await page.fill('input', 'Siblinsafsafg')
  await page.click('text=Confirm')
  await page.click('text=Siblinsafsafg')
  await page.click('text=Confirm')
  await page.click('text=Done')
})
