import type { Page } from '@playwright/test';
import ExcelJS from 'exceljs';
import { SELECTORS, OUTPUT_FILE } from './xpath';
import type { StockData } from './xpath';

// ─── Scrape a single page table ─────────────────────────────────────────────
export async function scrapeTable(page: Page): Promise<StockData[]> {
  const tableRowsSelector = SELECTORS.TABLE_ROWS;

  return page.$$eval(tableRowsSelector, (rows) => {
    return rows
      .map((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 5) return null;

        const company = cells[0]?.textContent?.trim() || '';
        const group = cells[1]?.textContent?.trim() || '';
        const prevClose = cells[2]?.textContent?.trim() || '';
        const currentPrice = cells[3]?.textContent?.trim() || '';
        const percentChange = cells[4]?.textContent?.trim() || '';

        // Skip header-like or empty rows
        if (!company || company.toLowerCase() === 'company') return null;

        return { company, group, prevClose, currentPrice, percentChange };
      })
      .filter(Boolean) as {
        company: string;
        group: string;
        prevClose: string;
        currentPrice: string;
        percentChange: string;
      }[];
  });
}

// ─── Save data to Excel with styled sheets ───────────────────────────────────
export async function saveToExcel(gainers: StockData[], losers: StockData[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Rediff Scraper — Playwright';
  workbook.created = new Date();

  // ── Header style ──────────────────────────────────────────────────────
  const headerStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    },
  };

  const columns = [
    { header: 'Company', key: 'company', width: 35 },
    { header: 'Group', key: 'group', width: 12 },
    { header: 'Prev Close (Rs)', key: 'prevClose', width: 18 },
    { header: 'Current Price (Rs)', key: 'currentPrice', width: 20 },
    { header: '% Change', key: 'percentChange', width: 14 },
  ];

  // ── Gainers Sheet ─────────────────────────────────────────────────────
  const gainersSheet = workbook.addWorksheet('Gainers', {
    properties: { tabColor: { argb: 'FF00B050' } },
  });
  gainersSheet.columns = columns;

  // Style header row
  gainersSheet.getRow(1).eachCell((cell) => {
    Object.assign(cell, { style: { ...headerStyle, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B050' } } } });
  });
  gainersSheet.getRow(1).height = 24;

  // Add data rows
  gainers.forEach((row, idx) => {
    const dataRow = gainersSheet.addRow(row);
    // Alternate row colors for readability
    if (idx % 2 === 0) {
      dataRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
      });
    }
    dataRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      };
    });
  });

  // Auto-filter
  gainersSheet.autoFilter = { from: 'A1', to: 'E1' };

  // ── Losers Sheet ──────────────────────────────────────────────────────
  const losersSheet = workbook.addWorksheet('Losers', {
    properties: { tabColor: { argb: 'FFFF0000' } },
  });
  losersSheet.columns = columns;

  // Style header row
  losersSheet.getRow(1).eachCell((cell) => {
    Object.assign(cell, { style: { ...headerStyle, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF4444' } } } });
  });
  losersSheet.getRow(1).height = 24;

  // Add data rows
  losers.forEach((row, idx) => {
    const dataRow = losersSheet.addRow(row);
    if (idx % 2 === 0) {
      dataRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4EC' } };
      });
    }
    dataRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      };
    });
  });

  losersSheet.autoFilter = { from: 'A1', to: 'E1' };

  // ── Write file ────────────────────────────────────────────────────────
  await workbook.xlsx.writeFile(OUTPUT_FILE);
}

// ─── Print summary table to console ──────────────────────────────────────────
export function printSummary(label: string, data: StockData[]): void {
  const icon = label === 'GAINERS' ? '📈' : '📉';
  const divider = '─'.repeat(90);

  console.log(`\n${icon}  ${label} — Top 10 Preview`);
  console.log(divider);
  console.log(
    '  ' +
    'Company'.padEnd(30) +
    'Group'.padEnd(10) +
    'Prev Close'.padEnd(15) +
    'Curr Price'.padEnd(15) +
    '% Change'.padEnd(12)
  );
  console.log(divider);

  const preview = data.slice(0, 10);
  preview.forEach((row) => {
    console.log(
      '  ' +
      row.company.substring(0, 28).padEnd(30) +
      row.group.padEnd(10) +
      row.prevClose.padEnd(15) +
      row.currentPrice.padEnd(15) +
      row.percentChange.padEnd(12)
    );
  });

  console.log(divider);
  console.log(`  Total records: ${data.length}\n`);
}
