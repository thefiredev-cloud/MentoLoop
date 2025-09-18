import { test } from '@playwright/test'
import fs from 'fs'
import path from 'path'

test('Inspect live homepage, screenshot, and console logs', async ({ page }) => {
  const outDir = path.join(process.cwd(), 'tmp', 'browser-inspect')
  await fs.promises.mkdir(outDir, { recursive: true })

  const logLines: string[] = []

  page.on('console', (msg) => {
    logLines.push(`[${msg.type()}] ${msg.text()}`)
  })

  page.on('pageerror', (error) => {
    logLines.push(`[pageerror] ${error?.message || String(error)}`)
  })

  page.on('requestfailed', (request) => {
    const failure = request.failure()
    logLines.push(`[requestfailed] ${request.method()} ${request.url()} ${failure ? failure.errorText : ''}`)
  })

  await page.goto('https://sandboxmentoloop.online', { waitUntil: 'networkidle', timeout: 120000 })
  await page.waitForTimeout(2000)

  const screenshotPath = path.join(outDir, 'homepage.png')
  await page.screenshot({ path: screenshotPath, fullPage: true })

  const logPath = path.join(outDir, 'console.log')
  await fs.promises.writeFile(logPath, logLines.join('\n'), 'utf8')

  console.log(`Saved screenshot to: ${screenshotPath}`)
  console.log(`Saved console logs to: ${logPath}`)
  console.log('--- Console log preview (first 50 lines) ---')
  console.log(logLines.slice(0, 50).join('\n'))
})


