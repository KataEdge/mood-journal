import { getRandomQuote, QUOTES } from '../messages';

describe('messages utility', () => {
  it('QUOTES array should not be empty', () => {
    expect(QUOTES.length).toBeGreaterThan(0);
  });

  it('getRandomQuote should return a valid Quote object', () => {
    const quote = getRandomQuote();
    expect(quote).toHaveProperty('text');
    expect(quote).toHaveProperty('author');
    expect(quote).toHaveProperty('authorTitle');
    expect(typeof quote.text).toBe('string');
    expect(typeof quote.author).toBe('string');
    expect(typeof quote.authorTitle).toBe('string');
    expect(QUOTES).toContainEqual(quote);
  });
});
