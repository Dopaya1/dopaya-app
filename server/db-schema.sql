-- Schema for Dopaya database

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "email" TEXT,
  "firstName" TEXT,
  "lastName" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table (combined with all related data in a single table)
CREATE TABLE IF NOT EXISTS "projects" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "summary" TEXT,
  "missionStatement" TEXT,
  "keyImpact" TEXT,
  "aboutUs" TEXT,
  "impactAchievements" TEXT,
  "fundUsage" TEXT,
  
  -- Main project image
  "imageUrl" TEXT NOT NULL,
  
  -- Additional media (up to 6 images/videos)
  "image1" TEXT,
  "image2" TEXT,
  "image3" TEXT,
  "image4" TEXT,
  "image5" TEXT,
  "image6" TEXT,
  "imageType1" TEXT, -- 'image' or 'video'
  "imageType2" TEXT,
  "imageType3" TEXT,
  "imageType4" TEXT,
  "imageType5" TEXT,
  "imageType6" TEXT,
  
  -- Project info
  "category" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "founderName" TEXT,
  "impactPointsMultiplier" INTEGER DEFAULT 10,
  "primarySdg" TEXT,
  "sdgGoals" TEXT[],
  
  -- Contact info
  "website" TEXT,
  "email" TEXT,
  "instagramUrl" TEXT,
  "youtubeUrl" TEXT,
  "facebookUrl" TEXT,
  "linkedinUrl" TEXT,
  "tiktokUrl" TEXT,
  
  -- Impact tracking system
  "impact_unit" TEXT,
  "impact_noun" TEXT,
  "impact_verb" TEXT,
  "donation_1" INTEGER,
  "donation_2" INTEGER,
  "donation_3" INTEGER,
  "donation_4" INTEGER,
  "donation_5" INTEGER,
  "donation_6" INTEGER,
  "donation_7" INTEGER,
  "impact_1" NUMERIC,
  "impact_2" NUMERIC,
  "impact_3" NUMERIC,
  "impact_4" NUMERIC,
  "impact_5" NUMERIC,
  "impact_6" NUMERIC,
  "impact_7" NUMERIC,
  
  -- Project status and metrics
  "goal" INTEGER,
  "raised" INTEGER DEFAULT 0,
  "donors" INTEGER DEFAULT 0,
  "featured" BOOLEAN DEFAULT FALSE,
  "percentCompleted" INTEGER DEFAULT 0,
  "impactPoints" INTEGER DEFAULT 0,
  "status" TEXT DEFAULT 'active',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Donations table
CREATE TABLE IF NOT EXISTS "donations" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
  "projectId" INTEGER REFERENCES "projects"("id") ON DELETE CASCADE,
  "amount" INTEGER NOT NULL,
  "status" TEXT NOT NULL,
  "paymentMethod" TEXT,
  "impactPoints" INTEGER DEFAULT 0,
  "anonymous" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rewards table
CREATE TABLE IF NOT EXISTS "rewards" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "featured" BOOLEAN DEFAULT FALSE,
  "partnerLevel" TEXT NOT NULL,
  "pointsCost" INTEGER NOT NULL,
);

-- Redemptions table
CREATE TABLE IF NOT EXISTS "redemptions" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
  "rewardId" INTEGER REFERENCES "rewards"("id") ON DELETE CASCADE,
  "status" TEXT NOT NULL,
  "pointsSpent" INTEGER NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sample data for Projects (with all details in a single table)
INSERT INTO "projects" (
  "title", "slug", "description", "summary", "missionStatement", "keyImpact", "aboutUs", 
  "impactAchievements", "fundUsage", "imageUrl", 
  "image1", "image2", "image3", "image4", "image5", "image6",
  "imageType1", "imageType2", "imageType3", "imageType4", "imageType5", "imageType6",
  "category", "country", "founderName", "impactPointsMultiplier", "primarySdg", "sdgGoals", 
  "website", "email", "instagramUrl", "youtubeUrl", "facebookUrl", "linkedinUrl", "tiktokUrl",
  "goal", "featured", "impactPoints"
)
VALUES 
(
  'Panjurli Labs', 'panjurli-labs', 
  'Revolutionizing rural energy with sustainable biogas solutions that empower communities and create clean energy independence',
  'Clean energy solutions for rural communities in India using innovative biogas technology',
  'Our mission is to provide clean, renewable energy to rural communities while reducing environmental impact and creating local employment opportunities.',
  'Reduced CO2 emissions by 1500 tons and provided clean energy to over 200 households in rural Karnataka',
  'Panjurli Labs was founded in 2020 by a team of engineers and environmental scientists dedicated to solving energy poverty through innovative biogas solutions. We work directly with rural communities to implement sustainable energy systems that leverage local resources and create lasting impact.',
  'Since our founding, we have successfully installed biogas systems in 12 villages, trained 150 local residents in system maintenance, and created 35 full-time jobs in green energy. Our systems have eliminated the need for harmful kerosene lamps in over 200 households.',
  'Your contributions fund biogas system installations, community training programs, and ongoing maintenance support. Each installation costs approximately ₹50,000 and serves 15-20 households with clean energy for cooking and lighting.',
  'https://placehold.co/600x400?text=PanjurliLabs',
  'https://placehold.co/600x400?text=BiogasSystem', 
  'https://placehold.co/600x400?text=CommunityTraining', 
  'https://placehold.co/600x400?text=Installation', 
  'https://placehold.co/600x400?text=Village', 
  NULL, 
  NULL,
  'image', 'image', 'image', 'image', NULL, NULL,
  'Energy', 'India', 'Dr. Kamal Patel', 15, '7', ARRAY['7', '11', '13'],
  'https://www.panjurlilabs.com', 'info@panjurlilabs.com', 
  'https://instagram.com/panjurlilabs', 'https://youtube.com/panjurlilabs', 
  'https://facebook.com/panjurlilabs', 'https://linkedin.com/company/panjurlilabs', NULL,
  75000, TRUE, 150
),
(
  'Ignis Careers', 'ignis-careers', 
  'Transforming education with life skills and English language training for underprivileged students across India',
  'Ignis empowers children from low-income families in India by teaching life skills and English through participatory, non-rote learning in schools where families earn less than $5 a day.',
  'Our mission is to bridge the educational inequality gap by providing essential life skills and English language training to students from low-income backgrounds, empowering them to pursue higher education and meaningful careers.',
  'Reached over 50,000 students across 150 schools with transformative education programs',
  'Ignis Careers was established in 2015 with a vision to revolutionize education for underprivileged students. Our team of dedicated educators develops innovative curricula that focus on communication skills, critical thinking, and career readiness. We partner with government and low-income private schools to implement our programs where they're needed most.',
  'We have successfully trained over 2,000 teachers in modern teaching methodologies, established programs in 150 schools across 5 states, and seen an average 40% improvement in English language proficiency among participating students. Our career counseling initiatives have helped thousands of students make informed decisions about their educational paths.',
  'Donations support curriculum development, teacher training programs, learning materials for classrooms, and program monitoring. For every ₹1,000 contributed, we can provide quality education materials for 5 students for an entire academic year.',
  'https://placehold.co/600x400?text=IgnisCareers',
  'https://placehold.co/600x400?text=Classroom', 
  'https://placehold.co/600x400?text=TeacherTraining', 
  'https://placehold.co/600x400?text=Students', 
  'https://placehold.co/600x400?text=LearningMaterials', 
  'https://placehold.co/600x400?text=Workshop', 
  NULL,
  'image', 'image', 'image', 'image', 'image', NULL,
  'Education', 'India', 'Rennis Joseph', 12, '4', ARRAY['4', '8', '10'],
  'https://www.igniscareers.com', 'contact@igniscareers.org', 
  'https://instagram.com/igniscareers', NULL, 
  'https://facebook.com/igniscareersorg', 'https://linkedin.com/company/igniscareers', NULL,
  60000, TRUE, 120
),
(
  'Women Empowerment Program', 'women-empowerment', 
  'Empowering women entrepreneurs through training, resources, and mentorship',
  'Our program aims to create economic independence for women through entrepreneurship support',
  'We strive to build a world where women have equal access to economic opportunities and resources to achieve financial independence.',
  'Launched over 50 women-owned businesses generating sustainable income for families',
  'The Women Empowerment Program was founded in 2019 to address the economic disparities faced by women, particularly in urban communities. We provide comprehensive support including business skills training, access to microloans, and ongoing mentorship to help women establish and grow sustainable enterprises.',
  'Since our inception, we have trained 350+ women in business development, facilitated access to over $75,000 in microloans, and established a mentorship network connecting entrepreneurs with experienced business leaders. Our program graduates have a 70% success rate in establishing profitable businesses within the first year.',
  'Your support funds business skills workshops, seed capital for entrepreneurs, mentorship program coordination, and childcare support to allow mothers to participate in training sessions. Each entrepreneur requires approximately $1,200 in comprehensive support during their first year.',
  'https://placehold.co/600x400?text=WomenEmpowerment',
  'https://placehold.co/600x400?text=BusinessTraining', 
  'https://placehold.co/600x400?text=Mentorship', 
  'https://placehold.co/600x400?text=Workshop', 
  'https://placehold.co/600x400?text=Success', 
  NULL, 
  NULL,
  'image', 'image', 'image', 'image', NULL, NULL,
  'Education', 'Kenya', 'Sarah Mugo', 10, '5', ARRAY['5', '8', '1'],
  'https://www.womenempowerment.org', 'info@womenempowerment.org', 
  'https://instagram.com/womenempowerment_program', 'https://youtube.com/womenempowerment', 
  'https://facebook.com/womenempowermentprogram', NULL, NULL,
  35000, TRUE, 100
),
(
  'Green Earth Initiative', 'green-earth-initiative', 
  'Restoring degraded land through community-based reforestation and sustainable agriculture practices',
  'A project focused on environmental restoration and sustainable farming in rural communities',
  'Our mission is to heal the earth through large-scale reforestation while creating sustainable livelihoods for rural communities affected by environmental degradation.',
  'Planted over 100,000 native trees and restored 500 hectares of degraded land',
  'Green Earth Initiative began in 2018 when a group of environmental scientists partnered with local farmers to address the growing problem of soil erosion and deforestation. We work with communities to implement agroforestry systems that combine native tree species with sustainable food crops, creating both environmental and economic benefits.',
  'We have successfully established 15 community nurseries, trained 300 farmers in sustainable agriculture techniques, and introduced 10 drought-resistant crop varieties that improve food security. Our monitoring shows a 30% increase in biodiversity in restored areas and improved soil quality in 85% of project sites.',
  'Funds support native seed collection, nursery operations, farmer training programs, and monitoring activities. Every $10 contributed plants and maintains 15 trees and provides training for local caretakers to ensure long-term survival.',
  'https://placehold.co/600x400?text=GreenEarth',
  'https://placehold.co/600x400?text=TreePlanting', 
  'https://placehold.co/600x400?text=CommunityNursery', 
  'https://placehold.co/600x400?text=Agroforestry', 
  'https://placehold.co/600x400?text=FarmerTraining', 
  'https://placehold.co/600x400?text=RestoredLand', 
  NULL,
  'image', 'image', 'image', 'image', 'image', NULL,
  'Environment', 'Brazil', 'Maria Oliveira', 14, '15', ARRAY['15', '13', '2'],
  'https://www.greenearthinitiative.org', 'contact@greenearthinitiative.org', 
  'https://instagram.com/greenearthinitiative', 'https://youtube.com/greenearthorg', 
  'https://facebook.com/greenearthinitiative', 'https://linkedin.com/company/green-earth-initiative', NULL,
  90000, TRUE, 140
)
ON CONFLICT (slug) DO NOTHING;

-- Sample data for Rewards (optional)
INSERT INTO "rewards" ("title", "description", "imageUrl", "category", "featured", "partnerLevel", "pointsCost")
VALUES 
('Eco-friendly Water Bottle', 'A sustainable water bottle made from recycled materials', 'https://placehold.co/300x300', 'Merchandise', TRUE, 'Bronze', 500),
('Virtual Meeting with Founder', 'A 30-minute virtual meeting with the project founder', 'https://placehold.co/300x300', 'Experience', TRUE, 'Gold', 2000),
('Organic Food Basket', 'A basket of organic food items from local farmers', 'https://placehold.co/300x300', 'Food', TRUE, 'Silver', 1000),
('Digital Gift Card', 'A digital gift card for online shopping', 'https://placehold.co/300x300', 'Gift Card', FALSE, 'Bronze', 750)
ON CONFLICT DO NOTHING;

-- Brands table (for sustainable brand partners)
CREATE TABLE IF NOT EXISTS "brands" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "logo_path" TEXT,
  "website_url" TEXT,
  "description" TEXT,
  "category" TEXT,
  "featured" BOOLEAN DEFAULT FALSE,
  "display_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);