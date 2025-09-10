-- Create the vector similarity search function for support articles
CREATE OR REPLACE FUNCTION match_support_articles(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    support_articles.id,
    support_articles.title,
    support_articles.content,
    1 - (support_articles.embedding <=> query_embedding) as similarity
  FROM support_articles
  WHERE 1 - (support_articles.embedding <=> query_embedding) > match_threshold
  ORDER BY support_articles.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enable RLS on support tables
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_articles ENABLE ROW LEVEL SECURITY;

-- RLS policies for support_conversations
CREATE POLICY "Users can view their own conversations" ON support_conversations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own conversations" ON support_conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversations" ON support_conversations
  FOR UPDATE USING (user_id = auth.uid());

-- RLS policies for support_messages
CREATE POLICY "Users can view their own messages" ON support_messages
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own messages" ON support_messages
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS policies for support_articles (read-only for authenticated users)
CREATE POLICY "Authenticated users can read support articles" ON support_articles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin policy for support articles
CREATE POLICY "System can manage support articles" ON support_articles
  FOR ALL USING (true);

-- Insert some basic support articles for the chatbot to reference
INSERT INTO support_articles (title, content, embedding) VALUES
('Getting Started', 'Welcome to HomeReportPro! This is a comprehensive home inspection reporting platform. You can create reports, manage appointments, and organize your contacts. Start by exploring the dashboard where you can see your recent reports and upcoming appointments.', array_fill(0.001, ARRAY[1536])),
('Creating Reports', 'To create a new report, navigate to the Reports section and click "New Report". You can choose from various report types including Home Inspection, Wind Mitigation, Four Point, and more. Each report type has specialized sections and templates to help you document your findings efficiently.', array_fill(0.001, ARRAY[1536])),
('Managing Appointments', 'Use the Calendar section to view and manage your appointments. You can create new appointments, update existing ones, and see your schedule at a glance. The calendar integrates with your reports - you can link appointments to specific inspection reports.', array_fill(0.001, ARRAY[1536])),
('Contact Management', 'The Contacts section allows you to manage your clients and other contacts. You can add new contacts, edit existing information, and organize contacts with tags. Contacts can be linked to both appointments and reports for better organization.', array_fill(0.001, ARRAY[1536])),
('Report Templates', 'HomeReportPro includes various report templates for different inspection types. You can customize these templates or create your own. Templates help ensure consistency in your reports and save time by providing pre-built sections and common defect descriptions.', array_fill(0.001, ARRAY[1536]));