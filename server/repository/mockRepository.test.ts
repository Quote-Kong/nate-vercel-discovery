import { describe, it, expect, beforeEach } from 'vitest';
import { MockDiscoveryRepository } from './mockRepository';

describe('MockDiscoveryRepository - TDD Cycle', () => {
  let repo: MockDiscoveryRepository;

  beforeEach(() => {
    repo = new MockDiscoveryRepository();
    repo.seedData({
      1: {
        config: {},
        projectTypes: [
          { ProjectTypeID: 1, ProjectTypeName: 'Kitchen Remodel' }
        ]
      }
    });
  });

  it('RED: should fail if the new feature is not implemented', async () => {
    // We expect to be able to add a project type with sub-areas
    const companyId = 1;
    const newType = await repo.addProjectType(companyId, 'ADU', 'Kitchen,Bathroom');
    
    expect(newType.ProjectTypeName).toBe('ADU');
    expect(newType.SubAreas).toBe('Kitchen,Bathroom');
  });

  it('GREEN/REFACTOR: verify we can update project types tracking sub areas correctly', async () => {
    const pTypes = await repo.getProjectTypes(1);
    expect(pTypes).toHaveLength(1);

    await repo.updateProjectType(1, { SubAreas: 'Updated Area 1' });
    
    const updatedTypes = await repo.getProjectTypes(1);
    expect(updatedTypes[0].SubAreas).toBe('Updated Area 1');
  });
});
