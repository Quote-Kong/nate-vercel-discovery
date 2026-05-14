export interface DiscoveryConfig {
  WelcomeMessage: string;
  ThankYouMessage: string;
  ContactPromptText?: string;
  DisabledSteps?: string;
  DisabledProjectTypes?: string;
}

export interface ProjectType {
  ProjectTypeID: number;
  ProjectTypeName: string;
  SubAreas?: string;
}

export interface PainPoint {
  PainPointOptionID: number;
  PainPointText: string;
}

export interface BudgetConfig {
  SliderTrackMin: number;
  SliderTrackMax: number;
  DefaultHandleMin: number;
  DefaultHandleMax: number;
  StepAmount: number;
}

export interface Photo {
  CompanyDiscoveryPhotoID: number;
  PhotoURL: string;
}

export interface StoryConfig {
  StoryText: string;
  AuthorName?: string;
  AuthorPhotoUrl?: string;
  RenovationPhotoUrl?: string;
}

export interface IDiscoveryRepository {
  getConfig(companyId: number): Promise<DiscoveryConfig | null>;
  getProjectTypes(companyId: number): Promise<ProjectType[]>;
  addProjectType(companyId: number, name: string, subAreas?: string): Promise<ProjectType>;
  updateProjectType(projectTypeId: number, updates: Partial<ProjectType>): Promise<void>;
  deleteProjectType(projectTypeId: number): Promise<void>;
  getPainPoints(projectTypeId: number): Promise<PainPoint[]>;
  getBudgetConfig(projectTypeId: number): Promise<BudgetConfig | null>;
  getPhotos(projectTypeId: number): Promise<Photo[]>;
  getStoryConfig(projectTypeId: number): Promise<StoryConfig[]>;
  getSubmissions(companyId: number): Promise<any[]>;
  getDatabaseSchema?(): Promise<any[]>;
  saveSubmission(companyId: number, projectTypeId: number, payload: any): Promise<number>;
  
  // Admin Methods
  updateConfig(companyId: number, config: DiscoveryConfig): Promise<void>;
  updateBudgetConfig(projectTypeId: number, config: BudgetConfig): Promise<void>;
  updateStoryConfig(projectTypeId: number, config: StoryConfig[]): Promise<void>;
  addPainPoint(projectTypeId: number, text: string): Promise<PainPoint>;
  deletePainPoint(id: number): Promise<void>;
  addPhoto(projectTypeId: number, url: string): Promise<Photo>;
  deletePhoto(id: number): Promise<void>;
}
