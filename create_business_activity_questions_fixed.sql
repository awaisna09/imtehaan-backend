-- Create business_activity_questions table
CREATE TABLE IF NOT EXISTS business_activity_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id INTEGER NOT NULL,
  context TEXT NOT NULL,
  question TEXT NOT NULL,
  marks INTEGER NOT NULL DEFAULT 1,
  skill TEXT NOT NULL,
  hint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by topic_id
CREATE INDEX IF NOT EXISTS idx_business_activity_questions_topic_id ON business_activity_questions(topic_id);

-- Insert sample business activity questions for different topics
INSERT INTO business_activity_questions (topic_id, context, question, marks, skill, hint) VALUES
-- Marketing (topic_id: 1)
(1, 'Market Research and Segmentation', 'Explain how a business can use market segmentation to target different customer groups effectively. Provide examples of segmentation criteria.', 8, 'Analysis and Application', 'Consider demographic, geographic, psychographic, and behavioral factors. Think about how different customer groups have different needs and preferences.'),
(1, 'Marketing Mix (4Ps)', 'Analyze how the 4Ps of marketing work together to create an effective marketing strategy. Use a real business example to illustrate your points.', 10, 'Critical Thinking and Application', 'Remember the 4Ps: Product, Price, Place, and Promotion. Consider how they must be coordinated and aligned with target market needs.'),
(1, 'Digital Marketing', 'Evaluate the effectiveness of social media marketing compared to traditional advertising methods for a small business.', 6, 'Evaluation and Comparison', 'Consider cost, reach, targeting capabilities, engagement, and measurable results. Think about different business types and target audiences.'),

-- Finance (topic_id: 2)
(2, 'Cash Flow Management', 'A business has monthly cash inflows of $50,000 and outflows of $45,000. Calculate the net cash flow and explain what this means for the business.', 5, 'Calculation and Interpretation', 'Net cash flow = Cash inflows - Cash outflows. Positive cash flow means the business has surplus cash available.'),
(2, 'Financial Statements', 'Explain the difference between a profit and loss statement and a balance sheet. What information does each provide to business owners?', 7, 'Understanding and Explanation', 'P&L shows performance over time, balance sheet shows financial position at a point in time. Think about what stakeholders need to know.'),
(2, 'Investment Appraisal', 'A business is considering investing $100,000 in new equipment that will generate $25,000 annually for 5 years. Calculate the payback period and discuss its limitations.', 8, 'Calculation and Analysis', 'Payback period = Initial investment ÷ Annual cash inflow. Consider what happens after payback and other factors like risk.'),

-- Operations Management (topic_id: 3)
(3, 'Quality Control', 'Describe three quality control methods a manufacturing business can use to ensure product quality. Explain the benefits and limitations of each method.', 9, 'Knowledge and Analysis', 'Consider inspection, sampling, and statistical process control. Think about costs, effectiveness, and practical implementation.'),
(3, 'Supply Chain Management', 'Explain how a business can improve its supply chain efficiency. Include both upstream and downstream considerations.', 7, 'Understanding and Application', 'Consider supplier relationships, inventory management, logistics, and customer service. Think about cost vs. service level trade-offs.'),
(3, 'Production Planning', 'A business needs to produce 1000 units per week. The production line operates 8 hours per day, 5 days per week. Calculate the required production rate per hour.', 4, 'Calculation and Problem Solving', 'Weekly production ÷ (hours per day × days per week) = units per hour. Consider efficiency and downtime.'),

-- Human Resources (topic_id: 4)
(4, 'Recruitment and Selection', 'Compare internal and external recruitment methods. What are the advantages and disadvantages of each approach?', 6, 'Comparison and Analysis', 'Internal: faster, cheaper, known quality. External: fresh perspectives, wider talent pool, but more expensive and time-consuming.'),
(4, 'Training and Development', 'Explain how a business can measure the effectiveness of its employee training programs. Provide specific examples of measurement methods.', 8, 'Evaluation and Application', 'Consider pre/post testing, performance improvement, feedback surveys, and return on investment. Think about both quantitative and qualitative measures.'),
(4, 'Employee Motivation', 'Analyze how different motivational theories (Maslow, Herzberg, etc.) can be applied in a business setting to improve employee performance.', 9, 'Analysis and Application', 'Consider individual needs, job design, recognition, and work environment. Think about practical implementation strategies.'),

-- Entrepreneurship (topic_id: 5)
(5, 'Business Planning', 'Create a basic business plan outline for a new coffee shop. Include key sections and explain why each is important.', 10, 'Planning and Organization', 'Consider executive summary, market analysis, marketing strategy, operations, financial projections, and risk assessment.'),
(5, 'Risk Management', 'Identify and analyze the main risks facing a new technology startup. Suggest strategies to mitigate each risk.', 8, 'Risk Assessment and Strategy', 'Consider market, financial, operational, and technological risks. Think about insurance, diversification, and contingency planning.'),
(5, 'Funding Sources', 'Compare different sources of funding for a new business venture. What are the advantages and disadvantages of each?', 7, 'Analysis and Comparison', 'Consider personal savings, bank loans, venture capital, crowdfunding, and government grants. Think about control, cost, and availability.'),

-- Business Environment (topic_id: 6)
(6, 'External Factors', 'Analyze how PESTEL factors (Political, Economic, Social, Technological, Environmental, Legal) affect a retail business.', 9, 'Environmental Analysis', 'Consider current events, economic conditions, social trends, technological changes, environmental concerns, and legal requirements.'),
(6, 'Competitive Environment', 'Use Porter''s Five Forces model to analyze the competitive environment of the smartphone industry.', 8, 'Strategic Analysis', 'Consider threat of new entrants, bargaining power of suppliers and buyers, threat of substitutes, and competitive rivalry.'),
(6, 'Globalization', 'Explain how globalization affects small businesses. What opportunities and challenges does it present?', 7, 'Understanding and Analysis', 'Consider access to new markets, increased competition, supply chain opportunities, and cultural challenges.'),

-- Business Strategy (topic_id: 7)
(7, 'Strategic Planning', 'Explain the difference between corporate, business, and functional strategies. How do they relate to each other?', 8, 'Strategic Understanding', 'Corporate: overall direction, Business: competitive advantage, Functional: operational excellence. They must be aligned and coordinated.'),
(7, 'Competitive Advantage', 'Analyze how a business can achieve sustainable competitive advantage. Provide examples of different types of advantage.', 9, 'Strategic Analysis', 'Consider cost leadership, differentiation, focus, innovation, and brand loyalty. Think about sustainability and imitation barriers.'),
(7, 'Strategic Implementation', 'What are the key challenges in implementing a new business strategy? How can these challenges be overcome?', 7, 'Implementation and Problem Solving', 'Consider resistance to change, resource constraints, communication, and monitoring. Think about change management and stakeholder engagement.'),

-- Business Ethics (topic_id: 8)
(8, 'Ethical Decision Making', 'A business discovers that a supplier is using child labor. What should the business do? Use an ethical decision-making framework to analyze this situation.', 10, 'Ethical Analysis and Decision Making', 'Consider stakeholders, consequences, rights, and justice. Think about immediate actions and long-term relationships.'),
(8, 'Corporate Social Responsibility', 'Explain how a business can balance profit objectives with social responsibility. Provide examples of CSR initiatives.', 8, 'Understanding and Application', 'Consider environmental impact, community involvement, fair labor practices, and ethical sourcing. Think about long-term sustainability.'),
(8, 'Ethical Leadership', 'Describe the characteristics of an ethical leader. How can ethical leadership contribute to business success?', 7, 'Leadership and Ethics', 'Consider integrity, transparency, accountability, and fairness. Think about trust, reputation, and employee engagement.');

-- Enable Row Level Security
ALTER TABLE business_activity_questions ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to business activity questions" ON business_activity_questions
  FOR SELECT USING (true);

-- Create policy for authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to manage business activity questions" ON business_activity_questions
  FOR ALL USING (auth.role() = 'authenticated');

-- Verify the table creation and data insertion
SELECT 
  t.topic,
  COUNT(baq.id) as question_count,
  AVG(baq.marks) as avg_marks
FROM topics t
LEFT JOIN buisness_activity_questions baq ON t.topic_id = baq.topic_id
WHERE t.subject_id = 101
GROUP BY t.topic_id, t.topic
ORDER BY t.topic_id;
