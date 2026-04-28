import { test, expect } from '@playwright/test';
import { scrapeTable, saveToExcel, printSummary } from '../extra/func1';
import {
  SELECTORS,
  PAGES_TO_SCRAPE,
  GAINERS_PAGES,
  LOSERS_PAGES,
  OUTPUT_FILE,
  TIMEOUTS,
} from '../extra/xpath';
import type { StockData } from '../extra/xpath';

// ─── Test ────────────────────────────────────────────────────────────────────
test('Scrape Rediff Money Gainers & Losers and save to Excel', async ({ page }) => {
  // Increase timeout since we're scraping multiple pages
  test.setTimeout(TIMEOUTS.TEST);

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     Rediff Money — Gainers & Losers Web Scraper            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ── Scrape Gainers ──────────────────────────────────────────────────────
  console.log('📈  Scraping GAINERS data ...');
  const gainersData: StockData[] = [];

  for (let i = 0; i < PAGES_TO_SCRAPE; i++) {
    const url = GAINERS_PAGES[i];
    console.log(`   → Page ${i + 1}: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.NAVIGATION });
    await page.waitForSelector(SELECTORS.DATA_TABLE, { timeout: TIMEOUTS.SELECTOR });

    const rows = await scrapeTable(page);
    console.log(`     ✓ Extracted ${rows.length} rows`);
    gainersData.push(...rows);
  }

  console.log(`\n   ✅  Total Gainers scraped: ${gainersData.length}\n`);

  // ── Scrape Losers ───────────────────────────────────────────────────────
  console.log('📉  Scraping LOSERS data ...');
  const losersData: StockData[] = [];

  for (let i = 0; i < PAGES_TO_SCRAPE; i++) {
    const url = LOSERS_PAGES[i];
    console.log(`   → Page ${i + 1}: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.NAVIGATION });
    await page.waitForSelector(SELECTORS.DATA_TABLE, { timeout: TIMEOUTS.SELECTOR });

    const rows = await scrapeTable(page);
    console.log(`     ✓ Extracted ${rows.length} rows`);
    losersData.push(...rows);
  }

  console.log(`\n   ✅  Total Losers scraped: ${losersData.length}\n`);

  // ── Save to Excel ──────────────────────────────────────────────────────
  console.log('💾  Saving to Excel ...');
  await saveToExcel(gainersData, losersData);
  console.log(`   ✅  File saved: ${OUTPUT_FILE}\n`);

  // ── Print summary tables ──────────────────────────────────────────────
  printSummary('GAINERS', gainersData);
  printSummary('LOSERS', losersData);

  // ── Assertions ────────────────────────────────────────────────────────
  expect(gainersData.length).toBeGreaterThan(0);
  expect(losersData.length).toBeGreaterThan(0);
});
