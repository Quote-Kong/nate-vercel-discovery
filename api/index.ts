import { createApp } from '../server/app';
import { MockDiscoveryRepository } from '../server/repository/mockRepository';

let repo;

if (process.env.DATABASE_URL) {
  throw new Error("MySQL support not fully implemented.");
} else {
  const mockRepo = new MockDiscoveryRepository();
  mockRepo.seedData({
    1: {
      config: { WelcomeMessage: 'Welcome to our custom Project Discovery!', ThankYouMessage: 'Thanks for your submission, someone from Quote Kong will be in touch in the next 2 business days. You will also get an email of this report.' },
      projectTypes: [
        { ProjectTypeID: 1, ProjectTypeName: 'Kitchen Remodel' },
        { ProjectTypeID: 2, ProjectTypeName: 'Bathroom Remodel' },
        { ProjectTypeID: 3, ProjectTypeName: 'Basement Finishing' },
        { ProjectTypeID: 4, ProjectTypeName: 'Home Addition' },
        { ProjectTypeID: 5, ProjectTypeName: 'Whole Home', SubAreas: 'Kitchen,Bathroom,Basement,Addition,Living areas,Bedrooms,Hallways,Other' },
        { ProjectTypeID: 6, ProjectTypeName: 'Additional Dwelling Unit (ADU)', SubAreas: 'Kitchen,Bathroom,Bedroom,Laundry Room,Garage,Workshop,Basement,Other' },
        { ProjectTypeID: 7, ProjectTypeName: 'Exterior Home', SubAreas: 'Siding,Roofing,Windows,Doors,Painting' },
        { ProjectTypeID: 8, ProjectTypeName: 'Deck / Fence', SubAreas: 'Deck,Fence,Patio,Pergola' }
      ],
      storyConfigs: {
        1: [
          { 
            StoryText: "We had a fantastic experience with our kitchen remodel! The team was professional, clean, and finished right on time. We finally have the open concept layout we always dreamed of, and the custom island has completely changed how our family gathers in the evenings. Highly recommend them for any major home renovation.",
            AuthorName: "Sarah & Mark Reynolds",
            AuthorPhotoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200",
            RenovationPhotoUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200&h=800"
          }
        ]
      }
    }
  });
  repo = mockRepo;
}

const app = createApp(repo);

export default app;
