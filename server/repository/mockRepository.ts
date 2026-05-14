import { IDiscoveryRepository, DiscoveryConfig, ProjectType, PainPoint, BudgetConfig, Photo, StoryConfig } from './repository';

export class MockDiscoveryRepository implements IDiscoveryRepository {
  private db: any = {
    configs: {},
    projectTypes: {},
    painPoints: {},
    budgetConfigs: {},
    photos: {},
    storyConfigs: {}
  };

  seedData(data: any) {
    for (const companyId of Object.keys(data)) {
      this.db.configs[companyId] = data[companyId].config;
      this.db.projectTypes[companyId] = data[companyId].projectTypes || [];
      if (data[companyId].storyConfigs) {
         Object.assign(this.db.storyConfigs, data[companyId].storyConfigs);
      }
    }
  }

  async getConfig(companyId: number): Promise<DiscoveryConfig | null> {
    return this.db.configs[companyId] || null;
  }

  async getProjectTypes(companyId: number): Promise<ProjectType[]> {
    return this.db.projectTypes[companyId] || [];
  }

  async addProjectType(companyId: number, name: string, subAreas?: string): Promise<ProjectType> {
    const pTypes = this.db.projectTypes[companyId] || [];
    const newId = Date.now();
    const newProjectType: ProjectType = { ProjectTypeID: newId, ProjectTypeName: name, SubAreas: subAreas };
    this.db.projectTypes[companyId] = [...pTypes, newProjectType];
    return newProjectType;
  }

  async updateProjectType(projectTypeId: number, updates: Partial<ProjectType>): Promise<void> {
    for (const companyId in this.db.projectTypes) {
      const idx = this.db.projectTypes[companyId].findIndex((p: ProjectType) => p.ProjectTypeID === projectTypeId);
      if (idx !== -1) {
        this.db.projectTypes[companyId][idx] = { ...this.db.projectTypes[companyId][idx], ...updates };
        break;
      }
    }
  }

  async deleteProjectType(projectTypeId: number): Promise<void> {
    for (const companyId in this.db.projectTypes) {
      this.db.projectTypes[companyId] = this.db.projectTypes[companyId].filter((p: ProjectType) => p.ProjectTypeID !== projectTypeId);
    }
  }

  async getPainPoints(projectTypeId: number): Promise<PainPoint[]> {
    return this.db.painPoints[projectTypeId] || [];
  }

  async getBudgetConfig(projectTypeId: number): Promise<BudgetConfig | null> {
    return this.db.budgetConfigs[projectTypeId] || null;
  }

  async getPhotos(projectTypeId: number): Promise<Photo[]> {
    return this.db.photos[projectTypeId] || [];
  }

  async getStoryConfig(projectTypeId: number): Promise<StoryConfig[]> {
    return this.db.storyConfigs[projectTypeId] || [];
  }

  async getSubmissions(companyId: number): Promise<any[]> {
    return [];
  }

  async getDatabaseSchema(): Promise<any[]> {
    return [
      { TABLE_NAME: 'DiscoveryConfig', COLUMN_NAME: 'CompanyID', DATA_TYPE: 'int', COLUMN_KEY: 'PRI', IS_NULLABLE: 'NO', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryConfig', COLUMN_NAME: 'WelcomeMessage', DATA_TYPE: 'text', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryConfig', COLUMN_NAME: 'ThankYouMessage', DATA_TYPE: 'text', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryConfig', COLUMN_NAME: 'ContactPromptText', DATA_TYPE: 'text', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryConfig', COLUMN_NAME: 'DisabledSteps', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryConfig', COLUMN_NAME: 'DisabledProjectTypes', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryConfig', COLUMN_NAME: 'AddedBy', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'NO', COLUMN_DEFAULT: "'Public Intake'" },
      { TABLE_NAME: 'DiscoveryConfig', COLUMN_NAME: 'AddedOn', DATA_TYPE: 'datetime', COLUMN_KEY: '', IS_NULLABLE: 'NO', COLUMN_DEFAULT: 'CURRENT_TIMESTAMP' },
      { TABLE_NAME: 'DiscoveryConfig', COLUMN_NAME: 'ChangedBy', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryConfig', COLUMN_NAME: 'ChangedOn', DATA_TYPE: 'datetime', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },
      
      { TABLE_NAME: 'DiscoveryProjectType', COLUMN_NAME: 'DiscoveryProjectTypeID', DATA_TYPE: 'int', COLUMN_KEY: 'PRI', IS_NULLABLE: 'NO', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryProjectType', COLUMN_NAME: 'CompanyID', DATA_TYPE: 'int', COLUMN_KEY: 'MUL', IS_NULLABLE: 'NO', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryProjectType', COLUMN_NAME: 'ProjectTypeName', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'NO', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryProjectType', COLUMN_NAME: 'AddedBy', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'NO', COLUMN_DEFAULT: "'Public Intake'" },
      { TABLE_NAME: 'DiscoveryProjectType', COLUMN_NAME: 'AddedOn', DATA_TYPE: 'datetime', COLUMN_KEY: '', IS_NULLABLE: 'NO', COLUMN_DEFAULT: 'CURRENT_TIMESTAMP' },
      { TABLE_NAME: 'DiscoveryProjectType', COLUMN_NAME: 'ChangedBy', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryProjectType', COLUMN_NAME: 'ChangedOn', DATA_TYPE: 'datetime', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },

      { TABLE_NAME: 'DiscoveryPainPoint', COLUMN_NAME: 'PainPointOptionID', DATA_TYPE: 'int', COLUMN_KEY: 'PRI', IS_NULLABLE: 'NO', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryPainPoint', COLUMN_NAME: 'DiscoveryProjectTypeID', DATA_TYPE: 'int', COLUMN_KEY: 'MUL', IS_NULLABLE: 'NO', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryPainPoint', COLUMN_NAME: 'PainPointText', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'NO', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryPainPoint', COLUMN_NAME: 'AddedBy', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'NO', COLUMN_DEFAULT: "'Public Intake'" },
      { TABLE_NAME: 'DiscoveryPainPoint', COLUMN_NAME: 'AddedOn', DATA_TYPE: 'datetime', COLUMN_KEY: '', IS_NULLABLE: 'NO', COLUMN_DEFAULT: 'CURRENT_TIMESTAMP' },
      { TABLE_NAME: 'DiscoveryPainPoint', COLUMN_NAME: 'ChangedBy', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryPainPoint', COLUMN_NAME: 'ChangedOn', DATA_TYPE: 'datetime', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },

      { TABLE_NAME: 'DiscoveryBudgetConfig', COLUMN_NAME: 'BudgetConfigID', DATA_TYPE: 'int', COLUMN_KEY: 'PRI', IS_NULLABLE: 'NO', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryBudgetConfig', COLUMN_NAME: 'DiscoveryProjectTypeID', DATA_TYPE: 'int', COLUMN_KEY: 'MUL', IS_NULLABLE: 'NO', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryBudgetConfig', COLUMN_NAME: 'SliderTrackMin', DATA_TYPE: 'int', COLUMN_KEY: '', IS_NULLABLE: 'NO', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryBudgetConfig', COLUMN_NAME: 'SliderTrackMax', DATA_TYPE: 'int', COLUMN_KEY: '', IS_NULLABLE: 'NO', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryBudgetConfig', COLUMN_NAME: 'StepAmount', DATA_TYPE: 'int', COLUMN_KEY: '', IS_NULLABLE: 'NO', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryBudgetConfig', COLUMN_NAME: 'AddedBy', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'NO', COLUMN_DEFAULT: "'Public Intake'" },
      { TABLE_NAME: 'DiscoveryBudgetConfig', COLUMN_NAME: 'AddedOn', DATA_TYPE: 'datetime', COLUMN_KEY: '', IS_NULLABLE: 'NO', COLUMN_DEFAULT: 'CURRENT_TIMESTAMP' },
      { TABLE_NAME: 'DiscoveryBudgetConfig', COLUMN_NAME: 'ChangedBy', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'DiscoveryBudgetConfig', COLUMN_NAME: 'ChangedOn', DATA_TYPE: 'datetime', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },

      { TABLE_NAME: 'CompanyStory', COLUMN_NAME: 'CompanyStoryID', DATA_TYPE: 'int', COLUMN_KEY: 'PRI', IS_NULLABLE: 'NO', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'CompanyStory', COLUMN_NAME: 'DiscoveryProjectTypeID', DATA_TYPE: 'int', COLUMN_KEY: 'MUL', IS_NULLABLE: 'NO', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'CompanyStory', COLUMN_NAME: 'StoryText', DATA_TYPE: 'text', COLUMN_KEY: '', IS_NULLABLE: 'NO', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'CompanyStory', COLUMN_NAME: 'AuthorName', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'CompanyStory', COLUMN_NAME: 'AuthorPhotoUrl', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'CompanyStory', COLUMN_NAME: 'RenovationPhotoUrl', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'CompanyStory', COLUMN_NAME: 'AddedBy', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'NO', COLUMN_DEFAULT: "'Public Intake'" },
      { TABLE_NAME: 'CompanyStory', COLUMN_NAME: 'AddedOn', DATA_TYPE: 'datetime', COLUMN_KEY: '', IS_NULLABLE: 'NO', COLUMN_DEFAULT: 'CURRENT_TIMESTAMP' },
      { TABLE_NAME: 'CompanyStory', COLUMN_NAME: 'ChangedBy', DATA_TYPE: 'varchar', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null },
      { TABLE_NAME: 'CompanyStory', COLUMN_NAME: 'ChangedOn', DATA_TYPE: 'datetime', COLUMN_KEY: '', IS_NULLABLE: 'YES', COLUMN_DEFAULT: null }
    ];
  }

  async saveSubmission(companyId: number, projectTypeId: number, payload: any): Promise<number> {
    return Date.now();
  }

  async updateConfig(companyId: number, config: DiscoveryConfig): Promise<void> {
    this.db.configs[companyId] = config;
  }

  async updateBudgetConfig(projectTypeId: number, config: BudgetConfig): Promise<void> {
    this.db.budgetConfigs[projectTypeId] = config;
  }

  async updateStoryConfig(projectTypeId: number, config: StoryConfig[]): Promise<void> {
    this.db.storyConfigs[projectTypeId] = config;
  }

  async addPainPoint(projectTypeId: number, text: string): Promise<PainPoint> {
    if (!this.db.painPoints[projectTypeId]) this.db.painPoints[projectTypeId] = [];
    const newPoint = { PainPointOptionID: Date.now(), PainPointText: text };
    this.db.painPoints[projectTypeId].push(newPoint);
    return newPoint;
  }

  async deletePainPoint(id: number): Promise<void> {
    for (const key of Object.keys(this.db.painPoints)) {
      this.db.painPoints[key] = this.db.painPoints[key].filter((p: any) => p.PainPointOptionID !== id);
    }
  }

  async addPhoto(projectTypeId: number, url: string): Promise<Photo> {
    if (!this.db.photos[projectTypeId]) this.db.photos[projectTypeId] = [];
    const newPhoto = { CompanyDiscoveryPhotoID: Date.now(), PhotoURL: url };
    this.db.photos[projectTypeId].push(newPhoto);
    return newPhoto;
  }

  async deletePhoto(id: number): Promise<void> {
    for (const key of Object.keys(this.db.photos)) {
      this.db.photos[key] = this.db.photos[key].filter((p: any) => p.CompanyDiscoveryPhotoID !== id);
    }
  }
}
