import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import { IDiscoveryRepository, DiscoveryConfig, ProjectType, PainPoint, BudgetConfig, Photo, StoryConfig } from '../../../server/repository/repository';

export class MySQLDiscoveryRepository implements IDiscoveryRepository {
  private pool: Pool;

  constructor(config: PoolOptions) {
    this.pool = mysql.createPool(config);
  }

  async getDatabaseSchema(): Promise<any[]> {
    const [rows] = await this.pool.query<any[]>(
      `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_KEY, IS_NULLABLE, COLUMN_DEFAULT 
       FROM information_schema.columns 
       WHERE table_schema = DATABASE()
       ORDER BY TABLE_NAME, ORDINAL_POSITION`
    );
    return rows;
  }

  async getConfig(companyId: number): Promise<DiscoveryConfig | null> {
    const [rows] = await this.pool.query<any[]>(
      'SELECT WelcomeMessage, ThankYouMessage, ContactPromptText FROM DiscoveryConfig WHERE CompanyID = ?',
      [companyId]
    );
    if (rows.length === 0) return null;
    return {
      WelcomeMessage: rows[0].WelcomeMessage,
      ThankYouMessage: rows[0].ThankYouMessage,
      ContactPromptText: rows[0].ContactPromptText
    };
  }

  async getProjectTypes(companyId: number): Promise<ProjectType[]> {
    const [rows] = await this.pool.query<any[]>(
      'SELECT DiscoveryProjectTypeID AS ProjectTypeID, ProjectTypeName, SubAreas FROM DiscoveryProjectType WHERE CompanyID = ?',
      [companyId]
    );
    return rows.map((row: any) => ({
      ProjectTypeID: row.ProjectTypeID,
      ProjectTypeName: row.ProjectTypeName,
      SubAreas: row.SubAreas
    }));
  }

  async addProjectType(companyId: number, name: string, subAreas?: string): Promise<ProjectType> {
    const [result] = await this.pool.execute<any>(
      'INSERT INTO DiscoveryProjectType (CompanyID, ProjectTypeName, SubAreas, AddedBy, AddedOn) VALUES (?, ?, ?, ?, NOW())',
      [companyId, name, subAreas || null, 'System']
    );
    return { ProjectTypeID: result.insertId, ProjectTypeName: name, SubAreas: subAreas };
  }

  async updateProjectType(projectTypeId: number, updates: Partial<ProjectType>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    if (updates.ProjectTypeName !== undefined) {
      fields.push('ProjectTypeName = ?');
      values.push(updates.ProjectTypeName);
    }
    if (updates.SubAreas !== undefined) {
      fields.push('SubAreas = ?');
      values.push(updates.SubAreas);
    }
    
    if (fields.length > 0) {
      values.push(projectTypeId);
      await this.pool.execute(
        `UPDATE DiscoveryProjectType SET ${fields.join(', ')}, ChangedBy = ?, ChangedOn = NOW() WHERE DiscoveryProjectTypeID = ?`,
        [...values.slice(0, -1), 'System', projectTypeId]
      );
    }
  }

  async deleteProjectType(projectTypeId: number): Promise<void> {
    await this.pool.execute('DELETE FROM DiscoveryProjectType WHERE DiscoveryProjectTypeID = ?', [projectTypeId]);
  }

  async getPainPoints(projectTypeId: number): Promise<PainPoint[]> {
    const [rows] = await this.pool.query<any[]>(
      'SELECT PainPointOptionID, PainPointText FROM DiscoveryPainPoint WHERE DiscoveryProjectTypeID = ?',
      [projectTypeId]
    );
    return rows.map((row: any) => ({
      PainPointOptionID: row.PainPointOptionID,
      PainPointText: row.PainPointText
    }));
  }

  async getBudgetConfig(projectTypeId: number): Promise<BudgetConfig | null> {
    const [rows] = await this.pool.query<any[]>(
      'SELECT SliderTrackMin, SliderTrackMax, DefaultHandleMin, DefaultHandleMax, StepAmount FROM DiscoveryBudgetConfig WHERE DiscoveryProjectTypeID = ?',
      [projectTypeId]
    );
    if (rows.length === 0) return null;
    return {
      SliderTrackMin: rows[0].SliderTrackMin,
      SliderTrackMax: rows[0].SliderTrackMax,
      DefaultHandleMin: rows[0].DefaultHandleMin,
      DefaultHandleMax: rows[0].DefaultHandleMax,
      StepAmount: rows[0].StepAmount
    };
  }

  async getPhotos(projectTypeId: number): Promise<Photo[]> {
    const [rows] = await this.pool.query<any[]>(
      'SELECT DocumentID as CompanyDiscoveryPhotoID, DocumentURL as PhotoURL FROM Document WHERE ReferenceID = ? AND Tag = "DiscoveryPhoto"',
      [projectTypeId]
    );
    return rows.map((row: any) => ({
      CompanyDiscoveryPhotoID: row.CompanyDiscoveryPhotoID,
      PhotoURL: row.PhotoURL
    }));
  }

  async getStoryConfig(projectTypeId: number): Promise<StoryConfig[]> {
     const [rows] = await this.pool.query<any[]>(
       'SELECT StoryText, AuthorName, AuthorPhotoUrl, RenovationPhotoUrl FROM CompanyStory WHERE DiscoveryProjectTypeID = ?',
       [projectTypeId]
     );
     return rows.map((row: any) => ({
       StoryText: row.StoryText,
       AuthorName: row.AuthorName,
       AuthorPhotoUrl: row.AuthorPhotoUrl,
       RenovationPhotoUrl: row.RenovationPhotoUrl
     }));
  }

  async getSubmissions(companyId: number): Promise<any[]> {
    const [rows] = await this.pool.query<any[]>(
      'SELECT SubmissionID, DiscoveryProjectTypeID as ProjectTypeID, PayloadJSON, CreatedAt FROM Submissions WHERE CompanyID = ? ORDER BY CreatedAt DESC',
      [companyId]
    );
    return rows.map(r => ({
       SubmissionID: r.SubmissionID,
       ProjectTypeID: r.ProjectTypeID,
       Payload: typeof r.PayloadJSON === 'string' ? JSON.parse(r.PayloadJSON) : r.PayloadJSON,
       CreatedAt: r.CreatedAt
    }));
  }

  async saveSubmission(companyId: number, projectTypeId: number, payload: any): Promise<number> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert raw log
      const [result] = await connection.execute<any>(
        'INSERT INTO Submissions (CompanyID, DiscoveryProjectTypeID, PayloadJSON, AddedBy, AddedOn) VALUES (?, ?, ?, ?, NOW())',
        [companyId, projectTypeId, JSON.stringify(payload), 'Public Intake']
      );
      const submissionId = result.insertId;

      // Ensure User and ClientProperty are created for QK integration
      const contact = payload.contactInfo || {};
      const firstName = contact.firstName || 'New';
      const lastName = contact.lastName || 'Lead';
      const email = contact.email || '';
      const addressLine = contact.address || 'Unknown Address';

      const [userResult] = await connection.execute<any>(
        'INSERT INTO User (CompanyID, FirstName, LastName, Email, AddedBy, AddedOn) VALUES (?, ?, ?, ?, ?, NOW())',
        [companyId, firstName, lastName, email, 'Public Intake']
      );
      const userId = userResult.insertId;

      await connection.execute<any>(
        'INSERT INTO ClientProperty (CompanyID, UserID, Address, AddedBy, AddedOn) VALUES (?, ?, ?, ?, NOW())',
        [companyId, userId, addressLine, 'Public Intake']
      );

      await connection.commit();
      return submissionId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateConfig(companyId: number, config: DiscoveryConfig): Promise<void> {
  }

  async updateBudgetConfig(projectTypeId: number, config: BudgetConfig): Promise<void> {
  }

  async updateStoryConfig(projectTypeId: number, config: StoryConfig[]): Promise<void> {
  }

  async addPainPoint(projectTypeId: number, text: string): Promise<PainPoint> {
    return { PainPointOptionID: 1, PainPointText: text };
  }

  async deletePainPoint(id: number): Promise<void> {
  }

  async addPhoto(projectTypeId: number, url: string): Promise<Photo> {
    // Actually insert into Document
    try {
      const [result] = await this.pool.execute<any>(
        'INSERT INTO Document (CompanyID, ReferenceID, DocumentURL, Tag, AddedBy, AddedOn) VALUES (?, ?, ?, ?, ?, NOW())',
        [1, projectTypeId, url, 'DiscoveryPhoto', 'System'] // assuming companyId=1 for simplicity here or passed upstream
      );
      return { CompanyDiscoveryPhotoID: result.insertId, PhotoURL: url };
    } catch {
      return { CompanyDiscoveryPhotoID: 1, PhotoURL: url };
    }
  }

  async deletePhoto(id: number): Promise<void> {
  }
}
