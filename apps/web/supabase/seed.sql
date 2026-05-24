-- ================================================================
-- newmarket.co.in — Sample / Seed Data
-- Run in: Supabase Dashboard → SQL Editor → New query
-- Provides realistic sample content so the platform feels alive.
-- ================================================================

-- ── News Articles ─────────────────────────────────────────────────

insert into news_articles (
  title, slug, content, excerpt, category, submitter_name, submitter_email,
  status, is_featured, published_at, view_count
) values

(
  'नई मार्केट में दीपावली मेगा सेल — 30% तक की छूट',
  'new-market-diwali-mega-sale-2025',
  'नई मार्केट, भोपाल के व्यापारियों ने इस दीपावली पर एक बड़ी मेगा सेल का आयोजन किया है। कपड़ों से लेकर इलेक्ट्रॉनिक्स तक, सभी दुकानों पर 10% से 30% तक की छूट दी जा रही है। यह सेल 25 अक्टूबर से 5 नवंबर तक चलेगी।

मार्केट एसोसिएशन के अध्यक्ष रामेश्वर गुप्ता ने बताया कि इस बार पहली बार QR कोड स्कैन करके अतिरिक्त 5% की छूट भी मिलेगी। नई मार्केट में लगभग 500 से अधिक दुकानें हैं और यह भोपाल का सबसे बड़ा शॉपिंग डेस्टिनेशन है।',
  'नई मार्केट में दीपावली पर 30% तक की छूट। 25 अक्टूबर से 5 नवंबर तक सेल चलेगी।',
  'EVENTS', 'Rameshwar Gupta', 'rameshwar@newmarket.co.in',
  'APPROVED', true, now() - interval '2 days', 312
),

(
  'New Market Gets New Footpath — Construction Begins This Week',
  'new-market-footpath-construction-2025',
  'The Bhopal Municipal Corporation has finally started the long-awaited footpath renovation project in New Market. The work began on Monday and is expected to be completed within 45 days.

Shopkeepers and customers have welcomed the move, saying the existing footpaths were broken and hazardous. The ₹1.2 crore project will also include better drainage and LED streetlights.

"This has been pending for three years. We are glad the corporation finally acted," said Suresh Maheshwari, a cloth merchant on the main street.',
  'BMC starts ₹1.2 crore footpath renovation in New Market. Work expected to finish in 45 days.',
  'GENERAL', 'Suresh Maheshwari', 'suresh@example.com',
  'APPROVED', false, now() - interval '4 days', 187
),

(
  'Traffic Diversion Near New Market Square — Avoid Hamidia Road During Peak Hours',
  'traffic-diversion-new-market-hamidia-road',
  'Due to ongoing road repair work near New Market Square, traffic has been diverted. Vehicles coming from Hamidia Road towards New Market will have to take the Bittan Market route.

The diversion is in effect from 9 AM to 7 PM daily until further notice. Commuters are advised to plan their routes accordingly. Traffic police will be stationed at key intersections to assist.

Auto-rickshaw routes have also been modified. Passengers heading to New Market can board from the Bittan Market junction.',
  'Traffic diverted near New Market Square. Avoid Hamidia Road 9AM–7PM until further notice.',
  'TRAFFIC', 'City Desk', 'news@newmarket.co.in',
  'APPROVED', false, now() - interval '1 day', 543
),

(
  'Zayaka Restaurant Opens in New Market Food Street',
  'zayaka-restaurant-opens-new-market',
  'A new restaurant, Zayaka, has opened in the popular Food Street area of New Market. The restaurant specializes in authentic Madhya Pradesh cuisine including dal bafla, bhutte ka kees, and poha.

The restaurant has a seating capacity of 60 and is open from 8 AM to 10 PM. The owners, the Sharma family, have been in the food business in Bhopal for over 20 years.

"We wanted to bring authentic MP flavors to New Market. Everything is homemade and fresh," said owner Priya Sharma.',
  'Zayaka restaurant opens in New Market Food Street, serving authentic Madhya Pradesh cuisine.',
  'BUSINESS', 'Priya Sharma', 'zayaka@example.com',
  'APPROVED', false, now() - interval '6 days', 98
),

(
  'Community Cleanliness Drive This Sunday at New Market',
  'community-cleanliness-drive-new-market-sunday',
  'The New Market Traders Association is organising a community cleanliness drive this Sunday from 7 AM to 10 AM. All shopkeepers, residents, and volunteers are invited to participate.

Cleaning supplies will be provided. The drive will cover the main market street, food lane, and parking areas. Last month''s drive saw over 200 participants and removed 2 tonnes of waste.

"A clean market is good for everyone — for business and for pride," said association secretary Kapil Joshi. Contact 9826XXXXXX to register as a volunteer.',
  'Community cleanliness drive at New Market this Sunday 7AM–10AM. All are welcome to join.',
  'COMMUNITY', 'Kapil Joshi', 'kapil@newmarket.co.in',
  'APPROVED', false, now() - interval '3 days', 76
)
ON CONFLICT (slug) DO NOTHING;


-- ── Job Listings ──────────────────────────────────────────────────

insert into job_listings (
  title, description, requirements, benefits,
  job_type, category, shop_name, shop_address,
  salary_min, salary_max, salary_label,
  application_mode, contact_name, contact_email, contact_phone,
  openings, experience_years, timing,
  status, is_featured, view_count
) values

(
  'Sales Associate — Electronics',
  'We are looking for an energetic sales associate to help customers with mobile phones, accessories, and home appliances. You will assist walk-in customers, explain product features, and process sales.

Day-to-day responsibilities include maintaining the display, handling billing, and keeping track of stock.',
  'Basic knowledge of electronics preferred. Good communication skills in Hindi. Friendly attitude.',
  'PF + ESI. Incentive on targets. Diwali bonus.',
  'FULL_TIME', 'ELECTRONICS', 'Krishna Electronics', 'Shop 14, Block B, New Market, Bhopal',
  10000, 15000, null,
  'WALK_IN', 'Rajesh Verma', 'krishna.electronics@example.com', '9826100001',
  2, 0, '10am – 8pm, Mon–Sat',
  'APPROVED', true, 89
),

(
  'Cook / Chef — Madhya Pradesh Cuisine',
  'Zayaka Restaurant is hiring a cook experienced in traditional MP dishes — dal bafla, poha, sabudana khichdi, bhutte ka kees, and snacks. Full kitchen experience preferred.

Must maintain hygiene and can work in a fast-paced kitchen environment.',
  'Minimum 2 years kitchen experience. Knowledge of MP cuisine mandatory.',
  'Free meals during shift. Sunday off (or compensatory leave). Accommodation available for outstation candidates.',
  'FULL_TIME', 'FOOD_BEVERAGE', 'Zayaka Restaurant', 'Food Street, New Market, Bhopal',
  12000, 18000, null,
  'WALK_IN', 'Priya Sharma', 'zayaka@example.com', '9826100002',
  1, 2, '7am – 11pm (shifts)',
  'APPROVED', false, 54
),

(
  'Experienced Tailor — Ladies Suits & Sarees',
  'Bombay Tailors is looking for a skilled tailor specializing in ladies suits, salwar-kameez, and blouses. Must be able to take measurements and deliver quality stitching on time.',
  'Minimum 3 years tailoring experience. Machine stitching + hand finishing both required.',
  null,
  'FULL_TIME', 'TAILORING', 'Bombay Tailors', 'Shop 7, Cloth Market Lane, New Market',
  8000, 12000, null,
  'WALK_IN', 'Mohammad Salim', 'bombay.tailors@example.com', '9826100003',
  1, 3, '10am – 8pm, Mon–Sun',
  'APPROVED', false, 41
),

(
  'Security Guard — Night Shift',
  'New Market Complex requires security guards for night shift duty. Responsibilities include patrolling the premises, monitoring CCTV, and maintaining an entry/exit log.',
  'Must be physically fit. Ex-army/ex-police preferred but not mandatory. Basic Hindi literacy required.',
  'Uniform provided. ESI. Overtime pay available.',
  'FULL_TIME', 'SECURITY', 'New Market Complex Association', 'Main Gate, New Market, Bhopal',
  9000, 11000, null,
  'PHONE', 'Suresh Yadav', 'security@newmarketcomplex.com', '9826100004',
  3, 0, '9pm – 7am',
  'APPROVED', false, 67
),

(
  'Delivery Partner — Part Time (Evening)',
  'QuickDelivery is hiring part-time delivery partners for evening hours in New Market and surrounding areas. Own two-wheeler required. Smartphone with internet needed.',
  'Must have valid driving licence and own bike/scooter. Smartphone with GPS. 18+ years.',
  'Fuel allowance. Flexible hours. Weekly payment.',
  'PART_TIME', 'LOGISTICS_DELIVERY', 'QuickDelivery Bhopal', 'New Market Hub, Bhopal',
  null, null, '₹500–800/day',
  'ONLINE', 'Deepak Soni', 'hr@quickdelivery.in', '9826100005',
  5, 0, '5pm – 10pm',
  'APPROVED', true, 112
);


-- ── Shops ─────────────────────────────────────────────────────────

insert into shops (
  name, description, category, address,
  phone, email, website,
  opening_hours, tags,
  status, is_verified, is_featured, view_count
) values

(
  'Krishna Electronics',
  'One of New Market''s most trusted electronics shops since 1998. We stock mobile phones, laptops, TVs, home appliances, and all major accessories. Authorized service center for Samsung and Realme.

Our team of trained technicians also provides repair and maintenance services for all brands.',
  'ELECTRONICS', 'Shop 14, Block B, New Market, Bhopal',
  '9826100001', 'krishna.electronics@example.com', null,
  '10am – 8:30pm, Mon–Sat; 11am – 7pm Sun',
  ARRAY['mobile phones', 'laptops', 'TV', 'appliances', 'repairs', 'Samsung authorized'],
  'APPROVED', true, true, 234
),

(
  'Bombay Tailors',
  'Expert tailoring for ladies suits, sarees, salwar-kameez, and blouses. We specialize in bridal wear and heavy embroidery work. Custom designs available. Over 25 years of experience serving New Market customers.',
  'TAILORING', 'Shop 7, Cloth Market Lane, New Market, Bhopal',
  '9826100003', null, null,
  '10am – 8pm, Mon–Sun',
  ARRAY['ladies suits', 'bridal wear', 'sarees', 'salwar kameez', 'custom stitching', 'blouses'],
  'APPROVED', true, false, 145
),

(
  'Zayaka Restaurant',
  'Authentic Madhya Pradesh home-style cuisine. Fresh dal bafla, poha, jalebi, sabudana khichdi, and bhutte ka kees made daily. Family-run restaurant with 60-seat capacity.

Perfect for breakfast, lunch, and evening snacks. Everything is made fresh with no preservatives.',
  'FOOD_BEVERAGE', 'Food Street, New Market, Bhopal',
  '9826100002', 'zayaka@example.com', null,
  '8am – 10pm, All days',
  ARRAY['MP cuisine', 'dal bafla', 'poha', 'jalebi', 'family restaurant', 'vegetarian'],
  'APPROVED', false, true, 178
),

(
  'Radha Saree House',
  'Premium saree collection from across India — Banarasi, Kanjivaram, Chanderi, Maheshwari, and Bhagalpuri. Blouse stitching also available. Special Diwali and wedding collections every season.',
  'CLOTHING', 'Shop 22, Main Street, New Market, Bhopal',
  '9826100006', null, null,
  '10am – 9pm, Mon–Sun',
  ARRAY['sarees', 'Banarasi', 'Kanjivaram', 'Chanderi', 'Maheshwari', 'bridal', 'lehenga'],
  'APPROVED', true, false, 201
),

(
  'New Market Medical & General Store',
  'Full-service pharmacy and general store. All prescription and OTC medicines available. Also stocks baby care products, cosmetics, first aid, and household essentials. Home delivery available within 2km.',
  'PHARMACY', 'Shop 3, Near Main Gate, New Market, Bhopal',
  '9826100007', null, null,
  '8am – 10pm, All days',
  ARRAY['medicines', 'pharmacy', 'baby care', 'cosmetics', 'home delivery', 'medical store'],
  'APPROVED', true, false, 89
),

(
  'Sharma Footwear',
  'Wide range of footwear for men, women, and children. Formal shoes, casual sandals, sports shoes, and traditional footwear all in one place. Brands: Bata, Liberty, Paragon, and local handcrafted chappal.',
  'FOOTWEAR', 'Shop 18, Block A, New Market, Bhopal',
  '9826100008', null, null,
  '10am – 8pm, Mon–Sat',
  ARRAY['shoes', 'sandals', 'sports shoes', 'chappal', 'Bata', 'Liberty', 'formal shoes'],
  'APPROVED', false, false, 63
),

(
  'Geetanjali Jewellers',
  'Trusted gold and silver jewellery shop established in 1985. BIS hallmarked gold, certified diamonds, and silver items. Custom jewellery and repair services available. Bridal sets our specialty.',
  'JEWELRY', 'Shop 2, Jewellery Row, New Market, Bhopal',
  '9826100009', null, null,
  '10am – 7:30pm, Mon–Sat',
  ARRAY['gold', 'silver', 'diamonds', 'BIS hallmark', 'bridal jewellery', 'repair', 'custom design'],
  'APPROVED', true, true, 167
),

(
  'City Mobile & Accessories',
  'Latest mobile phones at competitive prices plus all accessories — covers, chargers, earphones, screen guards, power banks. All brands available. Quick screen replacement and charging port repair.',
  'MOBILE_ACCESSORIES', 'Shop 11, Block C, New Market, Bhopal',
  '9826100010', null, null,
  '10am – 9pm, All days',
  ARRAY['mobile accessories', 'phone covers', 'chargers', 'screen repair', 'power banks', 'earphones'],
  'APPROVED', false, false, 92
),

(
  'Annapurna Sweet & Snacks',
  'Popular snack and sweet shop serving fresh namkeen, samosa, kachori, and traditional Indian sweets. Known for our special Indori poha and jalebi in the morning. Catering orders accepted for events.',
  'FOOD_BEVERAGE', 'Near Parking, New Market, Bhopal',
  '9826100011', null, null,
  '7am – 9pm, All days',
  ARRAY['sweets', 'namkeen', 'samosa', 'poha', 'jalebi', 'catering', 'snacks'],
  'APPROVED', false, false, 134
),

(
  'New Market Book House',
  'Books for all ages and subjects — school textbooks, competitive exam guides (UPSC, MPPSC, SSC), fiction, and children''s books. Also stocks stationery, art supplies, and gift wrapping.',
  'BOOKS_STATIONERY', 'Shop 29, Near Entrance, New Market, Bhopal',
  '9826100012', null, null,
  '9am – 8pm, Mon–Sat',
  ARRAY['books', 'textbooks', 'UPSC', 'MPPSC', 'stationery', 'children books', 'art supplies'],
  'APPROVED', false, false, 58
);


-- ── Property Listings ─────────────────────────────────────────────

insert into property_listings (
  title, description, property_type, listing_type,
  address, floor, area_sqft,
  price, deposit,
  is_furnished, amenities,
  contact_name, contact_email, contact_phone,
  status, is_featured, view_count
) values

(
  'Prime Ground Floor Shop — Main Street New Market',
  'Excellent location on the main commercial street of New Market. Ideal for retail, showroom, or franchise outlet. High footfall area with established customer traffic.

The space is currently unoccupied and ready for immediate fit-out. Clear title, no disputes.',
  'SHOP', 'RENT',
  '21, Main Street, New Market, Bhopal',
  'Ground Floor', 350,
  35000, 105000,
  false, ARRAY['Main Road Facing', 'Parking', 'Power Backup', '24/7 Security', 'Corner Shop'],
  'Ajay Khanna', 'ajay.khanna@example.com', '9826200001',
  'APPROVED', true, 198
),

(
  'First Floor Office Space — Modern Build',
  'Well-maintained first-floor office space in the New Market complex. Suitable for a small business office, coaching institute, or professional services firm (CA, lawyer, insurance).

Previously used as a travel agency office. Electrical fittings and AC units in place.',
  'OFFICE', 'RENT',
  'Block D, First Floor, New Market Complex, Bhopal',
  'First Floor', 480,
  22000, 66000,
  true, ARRAY['AC', 'Lift', 'Washroom', 'Power Backup', 'CCTV', 'Parking'],
  'Meena Bajpai', 'meena.property@example.com', '9826200002',
  'APPROVED', false, 87 
);
