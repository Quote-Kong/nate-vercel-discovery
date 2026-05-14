import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MySQLDiscoveryRepository } from './mysqlRepository';
import mysql from 'mysql2/promise';

// Mock the mysql2 module
vi.mock('mysql2/promise', () => ({
  default: {
    createPool: vi.fn(),
  }
}));

describe('MySQLDiscoveryRepository', () => {
  let repository: MySQLDiscoveryRepository;
  let mockPool: any;

  beforeEach(() => {
    mockPool = {
      query: vi.fn(),
      execute: vi.fn(),
      getConnection: vi.fn()
    };
    mockPool.getConnection.mockResolvedValue({
      beginTransaction: vi.fn(),
      commit: vi.fn(),
      rollback: vi.fn(),
      release: vi.fn(),
      execute: mockPool.execute
    });
    (mysql.createPool as any).mockReturnValue(mockPool);
    
    repository = new MySQLDiscoveryRepository({
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'quote_kong'
    });
  });

  describe('getConfig', () => {
    it('returns null if company config is not found', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);
      const config = await repository.getConfig(999);
      expect(config).toBeNull();
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT WelcomeMessage, ThankYouMessage, ContactPromptText FROM DiscoveryConfig WHERE CompanyID = ?', 
        [999]
      );
    });

    it('returns the config if found', async () => {
      mockPool.query.mockResolvedValueOnce([[{ WelcomeMessage: 'Hello', ThankYouMessage: 'Bye' }]]);
      const config = await repository.getConfig(1);
      expect(config).toEqual({ WelcomeMessage: 'Hello', ThankYouMessage: 'Bye' });
    });
  });

  describe('getProjectTypes', () => {
    it('returns an empty array if none found', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);
      const result = await repository.getProjectTypes(1);
      expect(result).toEqual([]);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT DiscoveryProjectTypeID AS ProjectTypeID, ProjectTypeName, SubAreas FROM DiscoveryProjectType WHERE CompanyID = ?',
        [1]
      );
    });

    it('returns project types', async () => {
      mockPool.query.mockResolvedValueOnce([[{ ProjectTypeID: 1, ProjectTypeName: 'Kitchen Remodel', SubAreas: null }]]);
      const result = await repository.getProjectTypes(1);
      expect(result).toEqual([{ ProjectTypeID: 1, ProjectTypeName: 'Kitchen Remodel', SubAreas: null }]);
    });
  });

  describe('getPainPoints', () => {
    it('returns pain points for a project type', async () => {
      mockPool.query.mockResolvedValueOnce([[{ PainPointOptionID: 1, PainPointText: 'Outdated' }]]);
      const result = await repository.getPainPoints(1);
      expect(result).toEqual([{ PainPointOptionID: 1, PainPointText: 'Outdated' }]);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT PainPointOptionID, PainPointText FROM DiscoveryPainPoint WHERE DiscoveryProjectTypeID = ?',
        [1]
      );
    });
  });

  describe('getBudgetConfig', () => {
    it('returns budget config for a project type', async () => {
      mockPool.query.mockResolvedValueOnce([[{ SliderTrackMin: 500, SliderTrackMax: 1000, DefaultHandleMin: 600, DefaultHandleMax: 900, StepAmount: 10 }]]);
      const result = await repository.getBudgetConfig(1);
      expect(result).toEqual({ SliderTrackMin: 500, SliderTrackMax: 1000, DefaultHandleMin: 600, DefaultHandleMax: 900, StepAmount: 10 });
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT SliderTrackMin, SliderTrackMax, DefaultHandleMin, DefaultHandleMax, StepAmount FROM DiscoveryBudgetConfig WHERE DiscoveryProjectTypeID = ?',
        [1]
      );
    });
  });

  describe('getPhotos', () => {
    it('returns photos for a project type', async () => {
      mockPool.query.mockResolvedValueOnce([[{ CompanyDiscoveryPhotoID: 1, PhotoURL: 'http://example.com/photo.jpg' }]]);
      const result = await repository.getPhotos(1);
      expect(result).toEqual([{ CompanyDiscoveryPhotoID: 1, PhotoURL: 'http://example.com/photo.jpg' }]);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT DocumentID as CompanyDiscoveryPhotoID, DocumentURL as PhotoURL FROM Document WHERE ReferenceID = ? AND Tag = "DiscoveryPhoto"',
        [1]
      );
    });
  });

  describe('addProjectType', () => {
    it('RED: should fail if addProjectType is not implemented', async () => {
      // In TDD this test is written first and would fail with "not a function" before implementation.
      // We will test our updated implementation here.
      mockPool.execute.mockResolvedValueOnce([{ insertId: 5 }]);
      
      const newPt = await repository.addProjectType(1, 'ADU', 'Kitchen,Bathroom');
      expect(newPt.ProjectTypeID).toBe(5);
      expect(newPt.ProjectTypeName).toBe('ADU');
      expect(newPt.SubAreas).toBe('Kitchen,Bathroom');
      expect(mockPool.execute).toHaveBeenCalledWith(
        'INSERT INTO DiscoveryProjectType (CompanyID, ProjectTypeName, SubAreas, AddedBy, AddedOn) VALUES (?, ?, ?, ?, NOW())',
        [1, 'ADU', 'Kitchen,Bathroom', 'System']
      );
    });
  });

  describe('saveSubmission', () => {
    it('inserts a submission and returns the insertId', async () => {
      mockPool.execute.mockResolvedValueOnce([{ insertId: 44 }]); // Submission
      mockPool.execute.mockResolvedValueOnce([{ insertId: 2 }]);  // User
      mockPool.execute.mockResolvedValueOnce([{ insertId: 3 }]);  // ClientProperty
      
      const mockPayload = { notes: "test" };
      const result = await repository.saveSubmission(1, 2, mockPayload);
      expect(result).toBe(44);
      expect(mockPool.execute).toHaveBeenCalledWith(
        'INSERT INTO Submissions (CompanyID, DiscoveryProjectTypeID, PayloadJSON, AddedBy, AddedOn) VALUES (?, ?, ?, ?, NOW())',
        [1, 2, JSON.stringify(mockPayload), 'Public Intake']
      );
    });
  });
});
