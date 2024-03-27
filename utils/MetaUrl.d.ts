function addMeta(name: string, json: JSON): void;
function getMeta(name: string): JSON;
function parseSearches(searches: {name: string, data: JSON}[]): string;
function addORChange(name: string, data: JSON): string;
function restoreSearches(search: string): {name: string, data: JSON}[];

interface exWindow {
  addMeta(name: string, json: JSON): void;
  parseSearches(searches: {name: string, data: JSON}[]): string;
  addORChange(name: string, data: JSON): string;
  restoreSearches(search: string): {name: string, data: JSON}[];
  getMeta(name: string): JSON;
}

window = window & exWindow;