import path from 'path';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface StockData {
  company: string;
  group: string;
  prevClose: string;
  currentPrice: string;
  percentChange: string;
}

// ─── Selectors / XPaths ──────────────────────────────────────────────────────
export const SELECTORS = {
  /** Main data table on the Gainers / Losers page */
  DATA_TABLE: 'table.dataTable',

  /** All data rows inside the table body */
  TABLE_ROWS: 'table.dataTable tbody tr',

  /** Individual cell within a row */
  TABLE_CELL: 'td',
};

// ─── Column Indices ──────────────────────────────────────────────────────────
export const COLUMNS = {
  COMPANY: 0,
  GROUP: 1,
  PREV_CLOSE: 2,
  CURRENT_PRICE: 3,
  PERCENT_CHANGE: 4,
  MIN_REQUIRED: 5,  // minimum number of cells for a valid data row
};

// ─── Page URLs ───────────────────────────────────────────────────────────────
export const PAGES_TO_SCRAPE = 3;

export const GAINERS_PAGES: string[] = [
  'https://money.rediff.com/gainers/bse/daily/groupall',
  'https://money.rediff.com/gainers/bse/daily/groupall?start=101&end=200',
  'https://money.rediff.com/gainers/bse/daily/groupall?start=201&end=300',
];

export const LOSERS_PAGES: string[] = [
  'https://money.rediff.com/losers/bse/daily/groupall',
  'https://money.rediff.com/losers/bse/daily/groupall?start=101&end=200',
  'https://money.rediff.com/losers/bse/daily/groupall?start=201&end=300',
];

// ─── Output File Path ────────────────────────────────────────────────────────
export const OUTPUT_FILE = path.resolve(__dirname, '..', 'Rediff_Gainers_Losers.xlsx');

// ─── Timeouts ────────────────────────────────────────────────────────────────
export const TIMEOUTS = {
  TEST: 120_000,
  NAVIGATION: 30_000,
  SELECTOR: 15_000,
};
