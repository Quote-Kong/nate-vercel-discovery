export function getProjectTypeId(projectTypeName: string): number {
  switch (projectTypeName) {
    case 'Kitchen Remodel': return 1;
    case 'Bathroom Remodel': return 2;
    case 'Basement Finishing': return 3;
    case 'Home Addition': return 4;
    case 'Whole Home': return 5;
    case 'Additional Dwelling Unit (ADU)': return 6;
    case 'Exterior Home': return 7;
    case 'Deck / Fence': return 8;
    default: return 1;
  }
}
