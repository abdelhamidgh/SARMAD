--CREATE DATABASE ExoQuestDB;

-- ExoQuest Researcher Database Setup
-- SQL Server Database Script

-- Create Database
GO

USE ExoQuestDB;
GO

-- Create Researchers Table
CREATE TABLE Researchers (
    ResearcherID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    LastLogin DATETIME2 NULL,
    IsActive BIT DEFAULT 1,
    CONSTRAINT CHK_Username_Length CHECK (LEN(Username) >= 3),
    CONSTRAINT CHK_Username_Format CHECK (Username NOT LIKE '%[^a-zA-Z0-9_]%')
);
GO

-- Create Index for faster username lookups
CREATE NONCLUSTERED INDEX IX_Researchers_Username 
ON Researchers(Username);
GO

-- Create Research Sessions Table (to track login history)
CREATE TABLE ResearchSessions (
    SessionID INT IDENTITY(1,1) PRIMARY KEY,
    ResearcherID INT NOT NULL,
    LoginTime DATETIME2 DEFAULT GETDATE(),
    LogoutTime DATETIME2 NULL,
    IPAddress NVARCHAR(45) NULL,
    CONSTRAINT FK_Sessions_Researcher FOREIGN KEY (ResearcherID) 
        REFERENCES Researchers(ResearcherID) ON DELETE CASCADE
);
GO

-- Create Stored Procedure for User Registration
CREATE PROCEDURE sp_RegisterResearcher
    @Username NVARCHAR(50),
    @PasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Check if username already exists
        IF EXISTS (SELECT 1 FROM Researchers WHERE Username = @Username)
        BEGIN
            RAISERROR('Username already exists', 16, 1);
            RETURN -1;
        END
        
        -- Insert new researcher
        INSERT INTO Researchers (Username, PasswordHash)
        VALUES (@Username, @PasswordHash);
        
        -- Return the new researcher ID
        SELECT SCOPE_IDENTITY() AS ResearcherID;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END;
GO

-- Create Stored Procedure for User Login
CREATE PROCEDURE sp_LoginResearcher
    @Username NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ResearcherID,
        Username,
        PasswordHash,
        IsActive,
        LastLogin
    FROM Researchers
    WHERE Username = @Username AND IsActive = 1;
    
    -- Update last login time
    UPDATE Researchers
    SET LastLogin = GETDATE()
    WHERE Username = @Username;
END;
GO

-- Create Stored Procedure for Session Tracking
CREATE PROCEDURE sp_CreateSession
    @ResearcherID INT,
    @IPAddress NVARCHAR(45) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO ResearchSessions (ResearcherID, IPAddress)
    VALUES (@ResearcherID, @IPAddress);
    
    SELECT SCOPE_IDENTITY() AS SessionID;
END;
GO

-- Create View for Active Researchers
CREATE VIEW vw_ActiveResearchers AS
SELECT 
    ResearcherID,
    Username,
    CreatedAt,
    LastLogin,
    DATEDIFF(DAY, CreatedAt, GETDATE()) AS DaysSinceRegistration
FROM Researchers
WHERE IsActive = 1;
GO

-- Insert sample data (for testing - remove in production)
-- Password for 'testuser' is 'password123' (you should hash this properly)
INSERT INTO Researchers (Username, PasswordHash, IsActive)
VALUES ('testuser', 'hashed_password_here', 1);
GO

-- Create function to get researcher statistics
CREATE FUNCTION fn_GetResearcherStats()
RETURNS TABLE
AS
RETURN
(
    SELECT 
        COUNT(*) AS TotalResearchers,
        SUM(CASE WHEN LastLogin >= DATEADD(DAY, -7, GETDATE()) THEN 1 ELSE 0 END) AS ActiveLastWeek,
        SUM(CASE WHEN LastLogin >= DATEADD(DAY, -30, GETDATE()) THEN 1 ELSE 0 END) AS ActiveLastMonth
    FROM Researchers
    WHERE IsActive = 1
);
GO

-- Grant permissions (adjust based on your security requirements)
-- GRANT EXECUTE ON sp_RegisterResearcher TO YourApplicationUser;
-- GRANT EXECUTE ON sp_LoginResearcher TO YourApplicationUser;
-- GRANT EXECUTE ON sp_CreateSession TO YourApplicationUser;
-- GRANT SELECT ON vw_ActiveResearchers TO YourApplicationUser;

PRINT 'ExoQuest Database setup completed successfully!';
GO


---------------------------
---------------------------
---------------------------


-- Create Research Posts Table
CREATE TABLE ResearchPosts (
    PostID INT IDENTITY(1,1) PRIMARY KEY,
    ResearcherID INT NOT NULL,
    Title NVARCHAR(500) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Category NVARCHAR(50) NOT NULL,
    Tags NVARCHAR(1000) NULL, -- Store as comma-separated values
    Likes INT DEFAULT 0,
    Comments INT DEFAULT 0,
    Shares INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Posts_Researcher FOREIGN KEY (ResearcherID) 
        REFERENCES Researchers(ResearcherID) ON DELETE CASCADE,
    CONSTRAINT CHK_Category CHECK (Category IN ('AI_MODEL', 'OBSERVATION', 'ANALYSIS', 'DISCUSSION'))
);
GO

-- Index for faster queries
CREATE NONCLUSTERED INDEX IX_ResearchPosts_Researcher 
ON ResearchPosts(ResearcherID);
GO

CREATE NONCLUSTERED INDEX IX_ResearchPosts_CreatedAt 
ON ResearchPosts(CreatedAt DESC);
GO

-- Stored Procedure to Create Post
CREATE PROCEDURE sp_CreateResearchPost
    @ResearcherID INT,
    @Title NVARCHAR(500),
    @Content NVARCHAR(MAX),
    @Category NVARCHAR(50),
    @Tags NVARCHAR(1000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO ResearchPosts (ResearcherID, Title, Content, Category, Tags)
    VALUES (@ResearcherID, @Title, @Content, @Category, @Tags);
    
    SELECT SCOPE_IDENTITY() AS PostID;
END;
GO

-- Stored Procedure to Get All Posts
CREATE PROCEDURE sp_GetAllResearchPosts
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        p.PostID,
        p.ResearcherID,
        r.Username,
        p.Title,
        p.Content,
        p.Category,
        p.Tags,
        p.Likes,
        p.Comments,
        p.Shares,
        p.CreatedAt
    FROM ResearchPosts p
    INNER JOIN Researchers r ON p.ResearcherID = r.ResearcherID
    ORDER BY p.CreatedAt DESC;
END;
GO

-- Stored Procedure to Update Post Interactions
CREATE PROCEDURE sp_UpdatePostInteraction
    @PostID INT,
    @LikesIncrement INT = 0,
    @CommentsIncrement INT = 0,
    @SharesIncrement INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE ResearchPosts
    SET 
        Likes = Likes + @LikesIncrement,
        Comments = Comments + @CommentsIncrement,
        Shares = Shares + @SharesIncrement
    WHERE PostID = @PostID;
END;
GO

PRINT 'Research Posts tables and procedures created successfully!';
GO


---------------------------
---------------------------
---------------------------


-- Seed Data for Research Posts
-- Add this after creating the ResearchPosts table

USE ExoQuestDB;
GO

-- First, create some sample researchers if they don't exist
-- Note: You'll need to replace these with actual hashed passwords in production


-- Insert sample research posts
INSERT INTO ResearchPosts (ResearcherID, Title, Content, Category, Tags, Likes, Comments, Shares, CreatedAt)
VALUES
-- Post 1: Dr_Abdelhamid
(
    (SELECT ResearcherID FROM Researchers WHERE Username = 'Dr_Abdelhamid'),
    'Improved Transit Detection Using Convolutional Neural Networks',
    'Our team has developed a novel CNN architecture that achieves 97.3% accuracy in detecting exoplanet transits in Kepler light curves. The model incorporates attention mechanisms to focus on subtle flux variations...',
    'AI_MODEL',
    'AI Models,Kepler,Transit Detection,Deep Learning',
    234,
    45,
    67,
    '2024-03-15T10:30:00'
),

-- Post 2: Dr_Tala
(
    (SELECT ResearcherID FROM Researchers WHERE Username = 'Dr_Tala'),
    'New Classification System for Hot Jupiters Using Machine Learning',
    'We propose a comprehensive ML-based classification framework for hot Jupiter exoplanets based on atmospheric composition, orbital parameters, and host star characteristics. Initial results show promising categorization of 342 known hot Jupiters...',
    'ANALYSIS',
    'Classification,Hot Jupiters,ML,Atmospheres',
    189,
    32,
    41,
    '2024-03-14T14:20:00'
),

-- Post 3: Dr_Lujain
(
    (SELECT ResearcherID FROM Researchers WHERE Username = 'Dr_Lujain'),
    'Question: Best Practices for Handling Light Curve Noise in AI Training?',
    'I''m working on training a transformer model for exoplanet detection. What are your recommended preprocessing steps for dealing with systematic noise and stellar variability in Kepler/TESS light curves? Any successful augmentation strategies?',
    'DISCUSSION',
    'Discussion,Light Curves,Data Preprocessing,Training',
    156,
    78,
    23,
    '2024-03-13T09:15:00'
),

-- Post 4: Dr_Yousef
(
    (SELECT ResearcherID FROM Researchers WHERE Username = 'Dr_Yousef'),
    'Open Dataset: 50,000 Labeled Light Curves for Training',
    'Excited to share our curated dataset of 50,000 Kepler light curves with ground truth labels for transit events. Includes metadata on stellar parameters, SNR, and transit characteristics. Link in comments. Feedback welcome!',
    'OBSERVATION',
    'Open Data,Dataset,Kepler,Community Resource',
    412,
    94,
    203,
    '2024-03-12T16:45:00'
),

-- Post 5: Dr_Mosa
(
    (SELECT ResearcherID FROM Researchers WHERE Username = 'Dr_Mosa'),
    'Transfer Learning Approach for Multi-Mission Exoplanet Detection',
    'We''ve successfully applied transfer learning from Kepler-trained models to TESS and future Roman Space Telescope data. The key insight: mission-agnostic feature representations in the latent space. Preprint available soon...',
    'AI_MODEL',
    'Transfer Learning,Multi-Mission,TESS,Roman Telescope',
    298,
    56,
    89,
    '2024-03-11T11:00:00'
);


GO

-- Verify the data was inserted
SELECT 
    p.PostID,
    r.Username,
    p.Title,
    p.Category,
    p.Likes,
    p.CreatedAt
FROM ResearchPosts p
INNER JOIN Researchers r ON p.ResearcherID = r.ResearcherID
ORDER BY p.CreatedAt DESC;

PRINT 'Sample research posts seeded successfully!';
GO








