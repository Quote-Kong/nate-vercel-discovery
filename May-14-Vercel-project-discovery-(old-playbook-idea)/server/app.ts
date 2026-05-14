import express from 'express';
import { IDiscoveryRepository } from './repository/repository';
import { Resend } from 'resend';
import multer from 'multer';
import { put } from '@vercel/blob';

const resend = new Resend('re_RDjLPc2o_7NrpnjyYFvAX2KyShUzK1MNF');
const upload = multer({ storage: multer.memoryStorage() });

export function createApp(repository: IDiscoveryRepository) {
  const app = express();
  app.use(express.json());

  app.get('/api/discovery-config/:companyId', async (req, res) => {
    const companyId = parseInt(req.params.companyId, 10);
    const config = await repository.getConfig(companyId);
    
    if (!config) return res.status(404).json({ error: 'Configuration not found' });
    const projectTypes = await repository.getProjectTypes(companyId);
    
    res.json({
      welcomeMessage: config.WelcomeMessage,
      thankYouMessage: config.ThankYouMessage,
      disabledSteps: config.DisabledSteps,
      disabledProjectTypes: config.DisabledProjectTypes,
      projectTypes
    });
  });

  app.get('/api/discovery-config/:companyId/pain-points/:projectTypeId', async (req, res) => {
    const projectTypeId = parseInt(req.params.projectTypeId, 10);
    res.json(await repository.getPainPoints(projectTypeId));
  });

  app.get('/api/discovery-config/:companyId/budget-config/:projectTypeId', async (req, res) => {
    const projectTypeId = parseInt(req.params.projectTypeId, 10);
    const config = await repository.getBudgetConfig(projectTypeId);
    res.json(config);
  });

  app.get('/api/discovery-config/:companyId/photos/:projectTypeId', async (req, res) => {
    const projectTypeId = parseInt(req.params.projectTypeId, 10);
    res.json(await repository.getPhotos(projectTypeId));
  });

  app.get('/api/discovery-config/:companyId/story/:projectTypeId', async (req, res) => {
    const projectTypeId = parseInt(req.params.projectTypeId, 10);
    const config = await repository.getStoryConfig(projectTypeId);
    res.json(config || []);
  });

  app.get('/api/discovery-config/:companyId/contact-prompt', async (req, res) => {
    const companyId = parseInt(req.params.companyId, 10);
    const config = await repository.getConfig(companyId);
    res.json({ promptText: config?.ContactPromptText || "What would you like to let us know about?" });
  });

  app.post('/api/discovery-config/submit', async (req, res) => {
    const { companyId, projectTypeId, ...payload } = req.body;
    const id = await repository.saveSubmission(companyId, projectTypeId, payload);

    try {
      const { contactInfo, projectType, subAreas, budget, timeline, priorities, aiStoryValues, additionalNotes } = payload as any;

      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Project Lead: ${projectType || 'Unknown Project'}</h2>
          
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #1e40af;">Contact Information</h3>
            <p><strong>Name:</strong> ${contactInfo?.firstName || ''} ${contactInfo?.lastName || ''}</p>
            <p><strong>Email:</strong> ${contactInfo?.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${contactInfo?.phone || 'N/A'}</p>
            <p><strong>Address:</strong> ${contactInfo?.streetAddress || ''} ${contactInfo?.city || ''}, ${contactInfo?.stateProvince || ''} ${contactInfo?.country || ''}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Project Details</h3>
            <p><strong>Type:</strong> ${projectType || 'N/A'}</p>
            ${subAreas?.length ? `<p><strong>Sub Areas:</strong> ${subAreas.join(', ')}</p>` : ''}
            <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
            <p><strong>Timeline:</strong> ${timeline || 'Not specified'}</p>
          </div>
          
          ${priorities?.length ? `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Top Priorities</h3>
            <ol style="margin-top: 8px;">
              ${priorities.map((p: string) => `<li>${p}</li>`).join('')}
            </ol>
          </div>` : ''}

          ${aiStoryValues && Object.keys(aiStoryValues).length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Project Questionnaire</h3>
            <ul style="margin-top: 8px; padding-left: 20px;">
              ${Object.entries(aiStoryValues).map(([key, val]) => `<li style="margin-bottom: 6px;"><strong>${key}:</strong> ${val}</li>`).join('')}
            </ul>
          </div>` : ''}

          <div style="margin-bottom: 20px;">
            <h3 style="color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Additional Notes</h3>
            <p>${additionalNotes || 'No additional notes provided.'}</p>
          </div>
        </div>
      `;

      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'nate@quotekong.com',
        subject: `New Lead: ${contactInfo?.firstName || 'Someone'} - ${projectType || 'Project'}`,
        html: htmlContent
      });
    } catch (error) {
      console.error("Failed to send email:", error);
    }

    res.status(201).json({ success: true, projectDiscoveryId: id });
  });

  app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.warn("BLOB_READ_WRITE_TOKEN is missing. Returning a simulated URL for development.");
      // For demonstration if token is missing
      return res.json({ url: `https://fake-blob.vercel-storage.com/${req.file.originalname}` });
    }

    try {
      const blob = await put(req.file.originalname, req.file.buffer, {
        access: 'public',
        token,
      });
      res.json(blob);
    } catch (err) {
      console.error('Error uploading to Vercel Blob:', err);
      res.status(500).json({ error: 'Failed to upload photo' });
    }
  });

  // Admin Routes
  app.get('/api/admin/discovery-config/:companyId', async (req, res) => {
    const companyId = parseInt(req.params.companyId, 10);
    const config = await repository.getConfig(companyId);
    if (!config) return res.status(404).json({ error: 'Not found' });
    res.json({ 
      welcomeMessage: config.WelcomeMessage, 
      thankYouMessage: config.ThankYouMessage,
      contactPromptText: config.ContactPromptText,
      disabledSteps: config.DisabledSteps,
      disabledProjectTypes: config.DisabledProjectTypes,
      projectTypes: await repository.getProjectTypes(companyId)
    });
  });

  app.get('/api/admin/discovery-config/:companyId/submissions/export', async (req, res) => {
    const companyId = parseInt(req.params.companyId, 10);
    const submissions = await repository.getSubmissions(companyId);
    
    if (submissions.length === 0) {
      return res.status(404).send('No submissions found');
    }
    
    // Flatten the payload and convert to CSV
    const csvRows = [];
    const headers = new Set(['SubmissionID', 'ProjectTypeID', 'CreatedAt']);
    
    // First pass: collect all headers
    submissions.forEach(sub => {
      if (sub.Payload) {
        if (sub.Payload.contactInfo) {
           Object.keys(sub.Payload.contactInfo).forEach(k => headers.add(`contactInfo_${k}`));
        }
        Object.keys(sub.Payload).forEach(k => {
          if (k !== 'contactInfo' && typeof sub.Payload[k] !== 'object') {
             headers.add(k);
          } else if (Array.isArray(sub.Payload[k])) {
             headers.add(k); // We can just join arrays
          }
        });
      }
    });
    
    const headerList = Array.from(headers);
    csvRows.push(headerList.join(','));
    
    submissions.forEach(sub => {
      const row = [];
      headerList.forEach(header => {
        let val;
        if (header === 'SubmissionID') val = sub.SubmissionID;
        else if (header === 'ProjectTypeID') val = sub.ProjectTypeID;
        else if (header === 'CreatedAt') val = sub.CreatedAt;
        else if (header.startsWith('contactInfo_')) {
           val = sub.Payload?.contactInfo?.[header.replace('contactInfo_', '')];
        } else {
           val = sub.Payload?.[header];
        }
        
        if (Array.isArray(val)) val = val.join(';');
        
        // Escape quotes and wrap in quotes if there's a comma
        let valStr = val === undefined || val === null ? '' : String(val);
        if (valStr.includes(',') || valStr.includes('"') || valStr.includes('\n')) {
          valStr = `"${valStr.replace(/"/g, '""')}"`;
        }
        row.push(valStr);
      });
      csvRows.push(row.join(','));
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="submissions_${companyId}.csv"`);
    res.send(csvRows.join('\n'));
  });

  app.get('/api/admin/database-schema/export', async (req, res) => {
    if (!repository.getDatabaseSchema) {
      return res.status(501).send('Database schema export is not supported by the current repository');
    }
    
    try {
      const schemaData = await repository.getDatabaseSchema();
      
      if (!schemaData || schemaData.length === 0) {
        return res.status(404).send('No database schema found');
      }
      
      const headers = Object.keys(schemaData[0]);
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      schemaData.forEach(row => {
        const csvRow = headers.map(header => {
          let valStr = String(row[header] ?? '');
          if (valStr.includes(',') || valStr.includes('"') || valStr.includes('\n')) {
            valStr = `"${valStr.replace(/"/g, '""')}"`;
          }
          return valStr;
        });
        csvRows.push(csvRow.join(','));
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="database_structure.csv"`);
      res.send(csvRows.join('\n'));
    } catch (e) {
      console.error('Failed to export DB schema', e);
      res.status(500).send('Failed to export database schema');
    }
  });

  app.post('/api/admin/discovery-config/:companyId', async (req, res) => {
    const companyId = parseInt(req.params.companyId, 10);
    await repository.updateConfig(companyId, { 
      WelcomeMessage: req.body.welcomeMessage, 
      ThankYouMessage: req.body.thankYouMessage,
      ContactPromptText: req.body.contactPromptText,
      DisabledSteps: req.body.disabledSteps,
      DisabledProjectTypes: req.body.disabledProjectTypes
    });
    res.json({ success: true });
  });

  app.post('/api/admin/discovery-config/:companyId/project-types', async (req, res) => {
    const companyId = parseInt(req.params.companyId, 10);
    const { ProjectTypeName, SubAreas } = req.body;
    if (!ProjectTypeName) return res.status(400).json({ error: 'ProjectTypeName required' });
    const newPt = await repository.addProjectType(companyId, ProjectTypeName, SubAreas);
    res.json(newPt);
  });

  app.put('/api/admin/discovery-config/:companyId/project-types/:projectTypeId', async (req, res) => {
    const projectTypeId = parseInt(req.params.projectTypeId, 10);
    const updates = req.body;
    await repository.updateProjectType(projectTypeId, updates);
    res.json({ success: true });
  });

  app.delete('/api/admin/discovery-config/:companyId/project-types/:projectTypeId', async (req, res) => {
    const projectTypeId = parseInt(req.params.projectTypeId, 10);
    await repository.deleteProjectType(projectTypeId);
    res.json({ success: true });
  });

  app.post('/api/admin/discovery-config/:companyId/budget/:projectTypeId', async (req, res) => {
    const projectTypeId = parseInt(req.params.projectTypeId, 10);
    await repository.updateBudgetConfig(projectTypeId, req.body);
    res.json({ success: true });
  });

  app.post('/api/admin/discovery-config/:companyId/story/:projectTypeId', async (req, res) => {
    const projectTypeId = parseInt(req.params.projectTypeId, 10);
    await repository.updateStoryConfig(projectTypeId, req.body);
    res.json({ success: true });
  });

  app.post('/api/admin/discovery-config/:companyId/pain-points/:projectTypeId', async (req, res) => {
    const projectTypeId = parseInt(req.params.projectTypeId, 10);
    const text = req.body.PainPointText;
    if (!text) return res.status(400).json({ error: 'Text required' });
    const newPoint = await repository.addPainPoint(projectTypeId, text);
    res.json(newPoint);
  });

  app.delete('/api/admin/discovery-config/:companyId/pain-points/:projectTypeId/:painPointId', async (req, res) => {
    const painPointId = parseInt(req.params.painPointId, 10);
    await repository.deletePainPoint(painPointId);
    res.json({ success: true });
  });

  app.post('/api/admin/discovery-config/:companyId/photos/:projectTypeId', async (req, res) => {
    const projectTypeId = parseInt(req.params.projectTypeId, 10);
    const photoUrl = req.body.PhotoURL;
    if (!photoUrl) return res.status(400).json({ error: 'PhotoURL required' });
    const newPhoto = await repository.addPhoto(projectTypeId, photoUrl);
    res.json(newPhoto);
  });

  app.delete('/api/admin/discovery-config/:companyId/photos/:projectTypeId/:photoId', async (req, res) => {
    const photoId = parseInt(req.params.photoId, 10);
    await repository.deletePhoto(photoId);
    res.json({ success: true });
  });

  app.post('/api/send-magic-link', async (req, res) => {
    const { email } = req.body;
    // TODO: In a real Vercel app, use a service like Resend or SendGrid here!
    // Example: await resend.emails.send({ to: email, subject: 'Your Magic Link', text: '...' })
    console.log(`Sending magic link to ${email}`);
    res.json({ success: true, message: `Magic link sent to ${email}` });
  });

  app.post('/api/send-report', async (req, res) => {
    const { email, payload } = req.body;
    console.log(`Sending final report to ${email}`, payload);
    // TODO: Connect to email provider to send summary report
    res.json({ success: true, message: 'Report sent successfully' });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}
