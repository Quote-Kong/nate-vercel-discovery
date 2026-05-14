-- Quote Kong Discovery App Data Export
-- Run this script to populate your main database with the initial discovery configuration

-- DiscoveryConfig
INSERT INTO DiscoveryConfig (CompanyID, WelcomeMessage, ThankYouMessage, AddedBy) 
VALUES 
(1, 'Welcome to our custom Project Discovery!', 'Thanks for your submission, someone from Quote Kong will be in touch in the next 2 business days. You will also get an email of this report.', 'System');

-- DiscoveryProjectType
INSERT INTO DiscoveryProjectType (DiscoveryProjectTypeID, CompanyID, ProjectTypeName, SubAreas, AddedBy)
VALUES 
(1, 1, 'Kitchen Remodel', NULL, 'System'),
(2, 1, 'Bathroom Remodel', NULL, 'System'),
(3, 1, 'Basement Finishing', NULL, 'System'),
(4, 1, 'Home Addition', NULL, 'System'),
(5, 1, 'Whole Home', 'Kitchen,Bathroom,Living areas,Bedrooms,Hallways,Other', 'System'),
(6, 1, 'Additional Dwelling Unit (ADU)', 'Kitchen,Bathroom,Bedroom,Laundry Room,Garage,Workshop', 'System'),
(7, 1, 'Exterior Home', 'Siding,Roofing,Windows,Doors,Painting', 'System'),
(8, 1, 'Deck / Fence', 'Deck,Fence,Patio,Pergola', 'System');

-- CompanyStory
INSERT INTO CompanyStory (DiscoveryProjectTypeID, StoryText, AuthorName, AuthorPhotoUrl, RenovationPhotoUrl, AddedBy)
VALUES
(1, 'We had a fantastic experience with our kitchen remodel! The team was professional, clean, and finished right on time. We finally have the open concept layout we always dreamed of, and the custom island has completely changed how our family gathers in the evenings. Highly recommend them for any major home renovation.', 'Sarah & Mark Reynolds', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200&h=800', 'System'),
(1, 'They completely transformed our outdated kitchen into a modern masterpiece. The attention to detail is incredible and the process was so smooth.', 'David Lee', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1200&h=800', 'System');
