import {describe,it,expect} from 'vitest';
import {navamshaSign,vimshottari,wholeSignHouse,manglik,kaalSarp} from '../src/lib/astrology/core';
describe('astrology helpers',()=>{
it('maps Libra 23°17′ to Aries Navamsha',()=>expect(navamshaSign(203.2844)).toBe(1));
it('maps Aquarius Moon example to Capricorn Navamsha',()=>expect(navamshaSign(311.8597)).toBe(10));
it('returns Rahu as birth dasha lord for reference longitude',()=>expect(vimshottari(311.859722,new Date('2000-05-26T12:17:00Z')).birthLord).toBe('Rahu'));
it('maps whole-sign house',()=>expect(wholeSignHouse(1,7)).toBe(7));
it('returns null for unavailable Mars house',()=>expect(manglik(null)).toBeNull());
it('does not infer Kaal Sarp from missing chart',()=>expect(kaalSarp(null)).toBe('UNDETERMINED'));
});
