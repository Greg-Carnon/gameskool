import { beforeEach, describe, expect, it, vi } from 'vitest';
import { load, save } from './storage';

describe('storage', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    });
  });

  it('liefert fallback, wenn nichts gespeichert ist', () => {
    expect(load('x', 5)).toBe(5);
  });
  it('speichert und lädt Objekte', () => {
    save('s', { best: 12 });
    expect(load('s', { best: 0 })).toEqual({ best: 12 });
  });
  it('bricht nicht, wenn localStorage wirft', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('denied'); },
      setItem: () => { throw new Error('denied'); },
    });
    expect(load('x', 'fb')).toBe('fb');
    expect(() => save('x', 1)).not.toThrow();
  });
});
