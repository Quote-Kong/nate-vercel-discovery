import { describe, it, expect } from 'vitest';
import { getProjectTypeId } from './projectTypeMapper';

describe('projectTypeMapper', () => {
  it('should return correct ID for all basic project types', () => {
    expect(getProjectTypeId('Kitchen Remodel')).toBe(1);
    expect(getProjectTypeId('Bathroom Remodel')).toBe(2);
    expect(getProjectTypeId('Basement Finishing')).toBe(3);
    expect(getProjectTypeId('Home Addition')).toBe(4);
    expect(getProjectTypeId('Whole Home')).toBe(5);
    expect(getProjectTypeId('Additional Dwelling Unit (ADU)')).toBe(6);
  });

  it('should return correct ID for new project types (Exterior Home, Deck / Fence)', () => {
    expect(getProjectTypeId('Exterior Home')).toBe(7);
    expect(getProjectTypeId('Deck / Fence')).toBe(8);
  });

  it('should return fallback ID for unknown types', () => {
    expect(getProjectTypeId('Unknown')).toBe(1);
  });
});
