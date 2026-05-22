-- ================================================================
-- newmarket.co.in — Additional Sample Content
-- Run AFTER seed.sql in: Supabase Dashboard → SQL Editor
-- ================================================================

-- ── Additional News Articles ──────────────────────────────────────

insert into news_articles (
  title, slug, content, excerpt, category, submitter_name, submitter_email,
  status, is_featured, published_at, view_count
) values

(
  'New Market Association Announces Free Wi-Fi for Entire Market Premises',
  'new-market-free-wifi-announcement-2025',
  'The New Market Traders Association has announced the rollout of free public Wi-Fi across the entire market complex. The project, funded jointly by the association and Bhopal Smart City Mission, will provide 100 Mbps connectivity to shopkeepers and customers alike.

"We want New Market to be the most modern and connected market in MP," said association president Rameshwar Gupta. The Wi-Fi will go live in the first week of December and will be free for 30 minutes per session.

Shopkeepers will also receive a dedicated business login for uninterrupted connectivity. A total of 45 Wi-Fi hotspot nodes will be installed across all blocks.',
  'New Market Traders Association launches free Wi-Fi for all shops and customers. 100 Mbps, 45 hotspot nodes.',
  'BUSINESS', 'Vijay Sharma', 'vijay@newmarket.co.in',
  'APPROVED', true, now() - interval '5 hours', 421
),

(
  'नई मार्केट में नया पार्किंग प्लाज़ा बनेगा — 500 गाड़ियों की जगह',
  'new-market-parking-plaza-construction-2025',
  'नई मार्केट में बढ़ती भीड़ और पार्किंग की समस्या से निपटने के लिए नगर निगम ने 500 वाहनों की क्षमता वाले मल्टी-लेवल पार्किंग प्लाज़ा की मंजूरी दी है। यह पार्किंग मुख्य प्रवेश द्वार के पास बनाई जाएगी।

निर्माण कार्य अगले वर्ष फरवरी में शुरू होगा और 18 महीनों में पूरा होने की उम्मीद है। इसमें दोपहिया वाहनों के लिए अलग मंजिल और इलेक्ट्रिक वाहन चार्जिंग पॉइंट भी होंगे।

व्यापारियों ने इस निर्णय का स्वागत किया है और कहा कि पार्किंग की कमी से ग्राहकों को काफी परेशानी होती थी।',
  'नई मार्केट में 500 वाहन क्षमता का मल्टी-लेवल पार्किंग प्लाज़ा बनेगा।',
  'GENERAL', 'City Desk', 'news@newmarket.co.in',
  'APPROVED', false, now() - interval '8 hours', 289
),

(
  'Winter Festival at New Market: 3-Day Cultural Programme Starting Dec 20',
  'new-market-winter-festival-december-2025',
  'New Market is hosting a 3-day Winter Cultural Festival from December 20 to 22. The event will feature live folk music, handicraft exhibitions, food stalls, and a special children''s zone.

Entry is free for all. Local artisans from the Chanderi and Maheshwari weaving communities will display and sell their products at special stalls. The festival is expected to draw over 20,000 visitors.

Evening shows will feature Malwa folk performances, Bhopal''s famous street food, and a lucky draw with prizes sponsored by local businesses.',
  'New Market Winter Festival Dec 20–22. Free entry. Folk music, handicrafts, food stalls, children zone.',
  'EVENTS', 'Sunita Patel', 'sunita@newmarketfest.in',
  'APPROVED', false, now() - interval '12 hours', 567
),

(
  'Alert: Fake QR Code Scam Being Reported in New Market',
  'fake-qr-code-scam-new-market-alert',
  'Several shopkeepers in New Market have reported incidents of fake QR codes being pasted over legitimate payment codes. Customers have unknowingly sent payments to unknown accounts.

Police and the Traders Association have urged all shopkeepers to regularly check their UPI QR codes and keep them covered when not in use. If you suspect fraud, immediately call the cybercrime helpline at 1930.

"Always confirm the name shown after scanning before making any payment," warned SHO Hamidia Road Police Station. The association has also advised installing tamper-evident covers over QR code stands.',
  'Fake QR code scam alert in New Market. Check your UPI QR codes. Report fraud at cybercrime helpline 1930.',
  'SAFETY', 'Hamidia Road Police Station', 'police@bhopal.gov.in',
  'APPROVED', false, now() - interval '2 days', 892
),

(
  'बड़ी खबर: नई मार्केट रोड चौड़ीकरण परियोजना को मिली मंजूरी',
  'new-market-road-widening-project-approved-2025',
  'नई मार्केट की मुख्य सड़क के चौड़ीकरण प्रोजेक्ट को राज्य सरकार से मंजूरी मिल गई है। सड़क को 12 मीटर से 20 मीटर चौड़ा किया जाएगा। इसके साथ ही साइड में साइकिल ट्रैक और फुटपाथ भी बनाए जाएंगे।

परियोजना पर अनुमानित 8.5 करोड़ रुपये खर्च होंगे। काम अगले 6 महीनों में शुरू होगा। जिन दुकानदारों की दुकानें प्रभावित होंगी, उन्हें उचित मुआवज़ा दिया जाएगा।

यह परियोजना नई मार्केट में ट्रैफिक जाम की समस्या को काफी हद तक कम करेगी।',
  'नई मार्केट रोड 12 से 20 मीटर चौड़ी होगी। 8.5 करोड़ की परियोजना को मंजूरी।',
  'GENERAL', 'City Desk', 'news@newmarket.co.in',
  'APPROVED', false, now() - interval '3 days', 634
),

(
  'Diwali Sales Cross ₹12 Crore in New Market — Record for Third Year Running',
  'new-market-diwali-sales-record-2025',
  'New Market Bhopal recorded its highest-ever Diwali sales this year, crossing ₹12 crore in the 15-day festive period. The achievement marks the third consecutive year of record-breaking sales, a testament to the market''s growing popularity.

Cloth and saree shops led the surge, followed by electronics and jewellery. The introduction of digital payments and QR-based offers this year brought in a large number of younger shoppers.

"The footfall was simply incredible this season. We ran out of stock on three occasions," said Rajesh Agarwal, owner of Agarwal Cloth House. The association plans to replicate the model for the upcoming New Year sales event.',
  'New Market Diwali sales hit record ₹12 crore for the third year running. Electronics and sarees led the surge.',
  'BUSINESS', 'Market Desk', 'market@newmarket.co.in',
  'APPROVED', true, now() - interval '7 days', 743
);


-- ── Additional Job Listings ───────────────────────────────────────

insert into job_listings (
  title, description, requirements, benefits,
  job_type, category, shop_name, shop_address,
  salary_min, salary_max, salary_label,
  application_mode, contact_name, contact_email, contact_phone,
  openings, experience_years, timing,
  status, is_featured, view_count
) values

(
  'Cashier / Billing Executive',
  'Radha Saree House is looking for a cashier to handle billing, daily accounts, and customer transactions. Familiarity with POS systems and Tally preferred.',
  'Basic computer literacy. Tally knowledge a plus. Class 12 passed.',
  'Weekly off. Festival bonus.',
  'FULL_TIME', 'RETAIL', 'Radha Saree House', 'Shop 22, Main Street, New Market',
  9000, 12000, null,
  'WALK_IN', 'Radha Agarwal', 'radha.saree@example.com', '9826100006',
  1, 0, '10am – 9pm, Mon–Sun',
  'APPROVED', false, 38
),

(
  'Smartphone Repair Technician',
  'City Mobile is hiring a skilled smartphone repair technician for screen replacement, motherboard repair, and software troubleshooting. All major brands handled.',
  '2+ years repair experience. Knowledge of iPhone and Android motherboard repair preferred.',
  'Incentive per repair. Tools provided.',
  'FULL_TIME', 'ELECTRONICS', 'City Mobile & Accessories', 'Shop 11, Block C, New Market',
  12000, 20000, null,
  'WALK_IN', 'Ravi Gupta', 'citymobile@example.com', '9826100010',
  1, 2, '10am – 9pm, All days',
  'APPROVED', false, 71
),

(
  'Salesperson — Footwear (Female Preferred)',
  'Sharma Footwear is looking for a friendly, presentable salesperson for women''s footwear section. Must be fluent in Hindi and able to assist customers confidently.',
  'Good communication. No prior experience needed — training provided.',
  null,
  'FULL_TIME', 'RETAIL', 'Sharma Footwear', 'Shop 18, Block A, New Market',
  8000, 10000, null,
  'WALK_IN', 'Vinod Sharma', 'sharma.footwear@example.com', '9826100008',
  1, 0, '10am – 8pm, Mon–Sat',
  'APPROVED', false, 29
),

(
  'Jewellery Sales Executive',
  'Geetanjali Jewellers requires an experienced sales executive for gold, silver, and diamond jewellery. Must be presentable, knowledgeable about jewellery, and able to build customer relationships.',
  'Minimum 2 years jewellery sales experience. Hindi + basic English required.',
  'Commission on sales. Festival incentives. PF.',
  'FULL_TIME', 'RETAIL', 'Geetanjali Jewellers', 'Shop 2, Jewellery Row, New Market',
  15000, 22000, null,
  'WALK_IN', 'Geeta Agarwal', 'geetanjali.jewellers@example.com', '9826100009',
  1, 2, '10am – 7:30pm, Mon–Sat',
  'APPROVED', true, 93
),

(
  'Intern — Digital Marketing (Work From Market)',
  'New Market Association is looking for a part-time digital marketing intern to manage WhatsApp broadcast, Instagram posts, and website content. Must have smartphone and basic social media skills.',
  'Class 12 or graduate student. Instagram/Facebook skills required. Own smartphone.',
  'Stipend ₹3000–5000/month. Certificate provided.',
  'INTERNSHIP', 'MANAGEMENT', 'New Market Traders Association', 'Association Office, New Market, Bhopal',
  null, null, '₹3000–5000/month stipend',
  'EMAIL', 'Kapil Joshi', 'association@newmarket.co.in', '9826100013',
  1, 0, '4 hrs/day, flexible',
  'APPROVED', false, 56
);


-- ── Additional Property Listings ──────────────────────────────────

insert into property_listings (
  title, description, property_type, listing_type,
  address, floor, area_sqft,
  price, deposit,
  is_furnished, amenities,
  contact_name, contact_email, contact_phone,
  status, is_featured, view_count
) values

(
  'Corner Kiosk Available — Food Court Area',
  'Prime kiosk space in the busy food court area of New Market. Perfect for a juice counter, snacks stall, or fast-food outlet. Very high foot traffic, especially evenings and weekends.',
  'KIOSK', 'RENT',
  'Food Court, New Market, Bhopal',
  'Ground Floor', 80,
  8000, 24000,
  false, ARRAY['High Footfall', 'Electricity Connection', 'Water Supply', 'Waste Disposal'],
  'Suresh Jain', 'suresh.property@example.com', '9826200003',
  'APPROVED', false, 64
),

(
  'Showroom Space for Sale — Main Road Facing',
  'Rare opportunity to purchase a commercial showroom on the main road of New Market. Ideal for a branded retail outlet, automobile accessories, or electronics showroom. Ready for immediate possession.',
  'SHOWROOM', 'SALE',
  '5, Main Road, New Market, Bhopal',
  'Ground Floor', 750,
  7500000, null,
  false, ARRAY['Main Road Facing', 'Wide Frontage', 'High Ceiling', 'Three-Phase Power', 'Basement Available'],
  'Ajay Khanna', 'ajay.khanna@example.com', '9826200001',
  'APPROVED', true, 231
),

(
  'Warehouse Space — Near New Market Back Entrance',
  'Large warehouse/storage space available for rent near the back entrance of New Market. Suitable for wholesale businesses, distributors, or logistics hubs. Loading/unloading access available.',
  'WAREHOUSE', 'RENT',
  'Back Gate Area, New Market, Bhopal',
  'Ground Floor', 1200,
  25000, 50000,
  false, ARRAY['Loading Dock', 'Three-Phase Power', 'CCTV', '24/7 Access', 'Large Door'],
  'Prakash Patel', 'prakash.warehouse@example.com', '9826200004',
  'APPROVED', false, 45
),

(
  'Small Office Available on Long-Term Lease',
  'Compact, well-maintained office space available on a long-term lease in the commercial complex above New Market. Ideal for a professional services firm, travel agent, or small coaching centre.',
  'OFFICE', 'LEASE',
  'Commercial Complex, Second Floor, New Market, Bhopal',
  'Second Floor', 280,
  null, 180000,
  true, ARRAY['AC', 'Furnished', 'Broadband Ready', 'Washroom', 'Lift', 'Parking'],
  'Meena Bajpai', 'meena.property@example.com', '9826200002',
  'APPROVED', false, 39
);
