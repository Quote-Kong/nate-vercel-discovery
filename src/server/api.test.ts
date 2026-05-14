import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/app'; 
import { MockDiscoveryRepository } from '../../server/repository/mockRepository';

describe('Project Discovery API', () => {
  let app: any;
  let mockRepo: MockDiscoveryRepository;

  beforeEach(() => {
    mockRepo = new MockDiscoveryRepository();
    mockRepo.seedData({
      1: {
        config: { WelcomeMessage: 'Welcome to Quote Kong', ThankYouMessage: 'Thanks!' },
        projectTypes: [{ ProjectTypeID: 1, ProjectTypeName: 'Kitchen' }]
      }
    });
    app = createApp(mockRepo);
  });

  it('should return 404 for an unknown company config', async () => {
    const response = await request(app).get('/api/discovery-config/999');
    expect(response.status).toBe(404);
  });

  it('should return the project discovery config for a specific company', async () => {
    const response = await request(app).get('/api/discovery-config/1');
    expect(response.status).toBe(200);
    expect(response.body.welcomeMessage).toBe('Welcome to Quote Kong');
    expect(response.body.projectTypes).toHaveLength(1);
    expect(response.body.projectTypes[0].ProjectTypeName).toBe('Kitchen');
  });

  it('should return admin config for a specific company', async () => {
    const response = await request(app).get('/api/admin/discovery-config/1');
    expect(response.status).toBe(200);
    expect(response.body.welcomeMessage).toBe('Welcome to Quote Kong');
    expect(response.body.projectTypes).toHaveLength(1);
    expect(response.body.projectTypes[0].ProjectTypeName).toBe('Kitchen');
  });

  it('should update admin config', async () => {
    const response = await request(app)
      .post('/api/admin/discovery-config/1')
      .send({ welcomeMessage: 'New Welcome Message' });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const getResponse = await request(app).get('/api/admin/discovery-config/1');
    expect(getResponse.body.welcomeMessage).toBe('New Welcome Message');
  });

  it('should add a new project type', async () => {
    const response = await request(app)
      .post('/api/admin/discovery-config/1/project-types')
      .send({ ProjectTypeName: 'Bathroom Remodel' });
    expect(response.status).toBe(200);
    expect(response.body.ProjectTypeName).toBe('Bathroom Remodel');

    const getResponse = await request(app).get('/api/admin/discovery-config/1');
    expect(getResponse.body.projectTypes.some((p: any) => p.ProjectTypeName === 'Bathroom Remodel')).toBe(true);
  });

  it('should get 404 for submissions export when no submissions', async () => {
    const response = await request(app).get('/api/admin/discovery-config/1/submissions/export');
    expect(response.status).toBe(404);
  });

  it('should create and fetch a budget config', async () => {
    const response = await request(app)
      .post('/api/admin/discovery-config/1/budget/1')
      .send({ min: 10000, max: 20000 });
    expect(response.status).toBe(200);

    const getResponse = await request(app).get('/api/discovery-config/1/budget-config/1');
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.min).toBe(10000);
  });

  it('should create and fetch story config', async () => {
    const response = await request(app)
      .post('/api/admin/discovery-config/1/story/1')
      .send([{ story: 'This is a story' }]);
    expect(response.status).toBe(200);

    const getResponse = await request(app).get('/api/discovery-config/1/story/1');
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual([{ story: 'This is a story' }]);
  });

  it('should add and fetch pain points', async () => {
    const response = await request(app)
      .post('/api/admin/discovery-config/1/pain-points/1')
      .send({ PainPointText: 'Everything is bad' });
    expect(response.status).toBe(200);

    const getResponse = await request(app).get('/api/discovery-config/1/pain-points/1');
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.some((p: any) => p.PainPointText === 'Everything is bad')).toBe(true);
  });

  it('should add and fetch photos', async () => {
    const response = await request(app)
      .post('/api/admin/discovery-config/1/photos/1')
      .send({ PhotoURL: 'http://example.com/photo.jpg' });
    expect(response.status).toBe(200);

    const getResponse = await request(app).get('/api/discovery-config/1/photos/1');
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.some((p: any) => p.PhotoURL === 'http://example.com/photo.jpg')).toBe(true);
  });
});
