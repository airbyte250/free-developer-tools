// Script to add 15 more quizzes to each of the 10 categories
import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/quiz_platform'
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

interface QuizItem {
  slug: string
  title: string
  description: string
  article: string
  steps: { step: number; question: string; options: string[]; correctAnswer: number }[]
  resultLogic: { type: string; message: string }
}

const additionalQuizzes: Record<string, QuizItem[]> = {
  'insurance-risk-management': [
    {
      slug: 'umbrella-insurance-needs',
      title: 'Umbrella Insurance Coverage Calculator',
      description: 'Determine if umbrella insurance is right for your risk profile and asset protection needs.',
      article: '<h2>Umbrella Insurance: Essential Asset Protection for High-Value Households</h2><p>Umbrella insurance provides liability coverage beyond your home and auto policy limits, typically $1-5 million in additional protection for $200-$500/year. With lawsuit awards frequently exceeding $1 million, umbrella coverage is essential for households with significant assets, rental properties, or teenage drivers.</p><h3>Who Needs Umbrella Insurance?</h3><p>Anyone with net worth exceeding their auto/home liability limits needs umbrella coverage. This includes homeowners with pools or trampolines, landlords, dog owners, parents of teen drivers, and anyone with public visibility. The rule of thumb: umbrella coverage should equal or exceed total net worth.</p><p>Our calculator evaluates your asset profile, risk factors, and existing coverage to recommend optimal umbrella limits.</p>',
      steps: [
        { step: 1, question: 'What is your estimated total net worth?', options: ['Under $250,000', '$250K-$500K', '$500K-$1M', '$1M-$5M', '$5M+'], correctAnswer: 2 },
        { step: 2, question: 'Do you own rental properties or a business?', options: ['No investment properties', '1 rental property', '2-4 rental properties', '5+ properties or a business', 'Both business and rentals'], correctAnswer: 1 },
        { step: 3, question: 'Any high-risk factors? (pool, trampoline, teen drivers, dogs)', options: ['None', '1 risk factor', '2 risk factors', '3+ risk factors', 'High-profile public figure'], correctAnswer: 1 },
        { step: 4, question: 'What are your current auto/home liability limits?', options: ['State minimums', '$100K/$300K auto + $100K home', '$250K/$500K combined', '$500K+ combined', 'Not sure'], correctAnswer: 2 },
        { step: 5, question: 'How much umbrella coverage are you considering?', options: ['$1 million', '$2 million', '$3 million', '$5 million', 'Need guidance on amount'], correctAnswer: 1 },
      ],
      resultLogic: { type: 'recommendation', message: 'Based on your net worth and risk profile, we recommend $2M umbrella coverage. Estimated annual premium: $250-$350. This protects against lawsuit awards that exceed your base policy limits.' },
    },
    {
      slug: 'disability-insurance-assessment',
      title: 'Disability Insurance Needs Analysis',
      description: 'Calculate optimal disability coverage to protect your income if you cannot work.',
      article: '<h2>Disability Insurance: Protecting Your Greatest Asset — Your Income</h2><p>One in four workers will experience a disability lasting 90+ days before retirement. Yet fewer than 35% have adequate disability coverage. Long-term disability insurance replaces 60-70% of income during extended inability to work, preventing financial devastation.</p><h3>Short-Term vs Long-Term Disability</h3><p>Short-term disability covers 3-6 months with 60-80% income replacement. Long-term disability activates after STD exhausts, covering years or until retirement age. Own-occupation vs any-occupation definitions dramatically affect claims approval rates.</p><p>Our analysis evaluates your income, employer benefits, savings runway, and occupation risk to recommend optimal disability coverage.</p>',
      steps: [
        { step: 1, question: 'What is your annual income?', options: ['Under $50,000', '$50K-$100K', '$100K-$200K', '$200K-$500K', '$500K+'], correctAnswer: 2 },
        { step: 2, question: 'Does your employer provide disability insurance?', options: ['No employer coverage', 'STD only (3-6 months)', 'STD + basic LTD', 'Comprehensive LTD', 'Self-employed (no group plan)'], correctAnswer: 2 },
        { step: 3, question: 'How many months could you survive without income?', options: ['Less than 1 month', '1-3 months', '3-6 months', '6-12 months', '12+ months'], correctAnswer: 2 },
        { step: 4, question: 'What is your occupation risk level?', options: ['Low (office/remote work)', 'Moderate (some physical activity)', 'High (physical labor/travel)', 'Very high (hazardous work)', 'Medical professional'], correctAnswer: 0 },
        { step: 5, question: 'What disability definition do you prefer?', options: ['Own-occupation (highest protection)', 'Modified own-occupation', 'Any-occupation (lowest cost)', 'Split definition', 'Not sure - need guidance'], correctAnswer: 0 },
      ],
      resultLogic: { type: 'analysis', message: 'Your income protection gap is approximately $4,500/month. Recommended: supplemental LTD with own-occupation definition, 90-day elimination period, benefits to age 67. Estimated premium: $85-$145/month.' },
    },
    {
      slug: 'business-liability-coverage',
      title: 'Business Liability Insurance Assessment',
      description: 'Evaluate your business insurance needs including general liability, professional, and cyber coverage.',
      article: '<h2>Business Liability Insurance: Complete Protection Guide</h2><p>Business liability claims average $75,000+ in legal costs alone. General liability, professional liability (E&O), and cyber liability form the essential protection triangle for modern businesses. The wrong coverage gaps can mean business closure after a single major claim.</p><h3>Coverage Types</h3><p>General liability covers bodily injury and property damage. Professional liability covers financial losses from professional mistakes. Cyber liability covers data breach costs averaging $4.45 million per incident. Most businesses need all three plus appropriate umbrella coverage.</p><p>Our assessment evaluates your industry, revenue, and digital exposure to recommend comprehensive business insurance.</p>',
      steps: [
        { step: 1, question: 'What type of business do you operate?', options: ['Professional services/consulting', 'Retail/e-commerce', 'Manufacturing/construction', 'Technology/SaaS', 'Healthcare/medical'], correctAnswer: 0 },
        { step: 2, question: 'What is your annual revenue?', options: ['Under $250K', '$250K-$1M', '$1M-$5M', '$5M-$25M', '$25M+'], correctAnswer: 1 },
        { step: 3, question: 'How many employees do you have?', options: ['Just me (solo)', '2-10 employees', '11-50 employees', '51-200 employees', '200+ employees'], correctAnswer: 1 },
        { step: 4, question: 'Do you handle customer data or personal information?', options: ['No customer data', 'Basic contact info', 'Payment/financial data', 'Health/medical records', 'Large-scale data processing'], correctAnswer: 2 },
        { step: 5, question: 'What is your current insurance coverage?', options: ['No business insurance', 'General liability only', 'GL + professional liability', 'Comprehensive BOP', 'Full coverage with umbrella'], correctAnswer: 1 },
      ],
      resultLogic: { type: 'recommendation', message: 'Recommended: BOP with $1M/$2M general liability, $1M professional liability, $500K cyber liability, and $1M umbrella. Estimated annual premium: $2,400-$4,800.' },
    },
    {
      slug: 'long-term-care-planning',
      title: 'Long-Term Care Insurance Planning Tool',
      description: 'Plan for long-term care costs and evaluate insurance options for aging and chronic illness.',
      article: '<h2>Long-Term Care Planning: The $100,000+/Year Question</h2><p>Nursing home care exceeds $108,000/year. Assisted living averages $54,000/year. With 70% of people over 65 needing some form of long-term care, planning is essential. Medicare covers only short-term rehabilitation — not custodial long-term care.</p><h3>Self-Insuring vs Insurance</h3><p>To self-insure a 3-year event, you need $300,000+ in dedicated assets. LTC insurance premiums at age 55 average $2,500-$4,000/year for $200K+ in benefits. Hybrid life/LTC policies guarantee benefits are used whether or not care is needed.</p><p>Our planning tool evaluates your age, health, assets, and care preferences to recommend optimal long-term care funding strategies.</p>',
      steps: [
        { step: 1, question: 'What is your current age?', options: ['40-49', '50-55', '56-60', '61-65', '66+'], correctAnswer: 2 },
        { step: 2, question: 'What is your current health status?', options: ['Excellent (no conditions)', 'Good (minor issues)', 'Fair (manageable conditions)', 'Declining (multiple conditions)', 'Already need some assistance'], correctAnswer: 1 },
        { step: 3, question: 'What are your investable assets (excluding home)?', options: ['Under $250K', '$250K-$500K', '$500K-$1M', '$1M-$3M', '$3M+'], correctAnswer: 2 },
        { step: 4, question: 'Do you have family history of dementia/chronic illness?', options: ['No family history', 'One parent affected', 'Both parents affected', 'Early-onset family history', 'Already showing signs'], correctAnswer: 0 },
        { step: 5, question: 'What type of care setting do you prefer?', options: ['In-home care only', 'Assisted living community', 'Continuing care retirement', 'Flexible (any setting)', 'Have not thought about it'], correctAnswer: 3 },
      ],
      resultLogic: { type: 'planning', message: 'Recommended: hybrid life/LTC policy with $300K in LTC benefits. Estimated annual premium: $4,200-$6,500. Covers approximately 3 years of assisted living or 2 years of nursing home care.' },
    },
    {
      slug: 'renters-insurance-value',
      title: 'Renters Insurance Value Assessment',
      description: 'Calculate the value of renters insurance for protecting your personal property and liability.',
      article: '<h2>Renters Insurance: $15/Month for $30,000+ Protection</h2><p>Only 55% of renters carry insurance, yet the average renter owns $20,000-$50,000 in personal property. Renters insurance provides personal property coverage, liability protection ($100K-$300K), additional living expenses, and worldwide coverage for stolen items at minimal cost.</p><h3>Coverage Explained</h3><p>Standard policies cover personal property against 16 named perils. Liability coverage protects against injury claims. Additional living expenses cover temporary housing if displaced. Always choose replacement cost over actual cash value for personal property.</p><p>Our calculator evaluates your belongings inventory and risk factors to recommend optimal coverage levels.</p>',
      steps: [
        { step: 1, question: 'Estimated value of all your personal belongings?', options: ['Under $10,000', '$10K-$25K', '$25K-$50K', '$50K-$100K', '$100K+'], correctAnswer: 2 },
        { step: 2, question: 'Do you have high-value items? (jewelry, electronics, art)', options: ['Nothing over $1,000', 'A few items $1K-$5K', 'Several items $5K+', 'Collections worth $10K+', 'High-value items $25K+'], correctAnswer: 1 },
        { step: 3, question: 'How many people live in your rental?', options: ['Just me', 'Me + partner', 'Me + roommate(s)', 'Family with children', 'Multiple roommates'], correctAnswer: 1 },
        { step: 4, question: 'Do you work from home with business equipment?', options: ['No home office', 'Basic laptop/desk', 'Full home office setup', 'Expensive equipment ($5K+)', 'Home-based business'], correctAnswer: 1 },
        { step: 5, question: 'What floor is your rental on?', options: ['Ground floor/basement', 'Second floor', 'Third floor or higher', 'Top floor', 'Detached unit/house'], correctAnswer: 1 },
      ],
      resultLogic: { type: 'value', message: 'Recommended: $35,000 personal property (replacement cost), $300K liability, $5,000 additional living expenses. Estimated monthly premium: $18-$28. Complete protection at less than $1/day.' },
    },
    {
      slug: 'pet-insurance-comparison',
      title: 'Pet Insurance Plan Comparison',
      description: 'Compare pet insurance plans to find the best coverage for your furry family members.',
      article: '<h2>Pet Insurance: Protecting Against $5,000-$20,000 Veterinary Bills</h2><p>Emergency veterinary care averages $3,000-$10,000 for common conditions. Pet insurance premiums of $30-$80/month cover 80-90% of unexpected veterinary expenses, preventing financial hardship from pet medical emergencies.</p><h3>Plan Types</h3><p>Comprehensive plans cover both accidents and illnesses. Accident-only plans cost 40-60% less but leave you exposed to expensive illness claims. For puppies/kittens, comprehensive coverage avoids pre-existing condition exclusions.</p><p>Our comparison evaluates your pet breed, age, and budget to recommend the optimal insurance plan.</p>',
      steps: [
        { step: 1, question: 'What type and age of pet?', options: ['Dog under 2 years', 'Dog 2-7 years', 'Dog 7+ years', 'Cat under 5 years', 'Cat 5+ years'], correctAnswer: 0 },
        { step: 2, question: 'Is your pet a breed prone to health issues?', options: ['Mixed breed (fewer issues)', 'Purebred with low risk', 'Purebred with moderate risk', 'Brachycephalic/large breed (high risk)', 'Not sure'], correctAnswer: 0 },
        { step: 3, question: 'What is your monthly budget for pet insurance?', options: ['Under $30/month', '$30-$50/month', '$50-$80/month', '$80-$120/month', '$120+ for comprehensive'], correctAnswer: 1 },
        { step: 4, question: 'Does your pet have any pre-existing conditions?', options: ['No prior conditions', 'Minor resolved condition', 'Ongoing manageable condition', 'Multiple conditions', 'Chronic serious condition'], correctAnswer: 0 },
        { step: 5, question: 'What coverage level do you prefer?', options: ['Accident only (lowest cost)', '70% reimbursement', '80% reimbursement', '90% reimbursement', '100% coverage (premium)'], correctAnswer: 2 },
      ],
      resultLogic: { type: 'comparison', message: 'Recommended: Comprehensive with $300 annual deductible, 80% reimbursement, unlimited benefit. Estimated monthly premium: $42-$65.' },
    },
    {
      slug: 'homeowners-insurance-audit',
      title: 'Homeowners Insurance Coverage Audit',
      description: 'Audit your current homeowners policy to identify coverage gaps and optimization opportunities.',
      article: '<h2>Homeowners Insurance Audit: Are You Adequately Protected?</h2><p>The average homeowner is underinsured by 22%. Rising construction costs, inadequate personal property coverage, and missing endorsements create dangerous exposure. Our audit identifies critical gaps and recommends corrections.</p><h3>Common Coverage Gaps</h3><p>Standard policies exclude flood, earthquake, sewer backup, and high-value items above $1,500-$2,500. Extended replacement cost endorsements protect against post-disaster construction inflation. Annual reviews ensure coverage keeps pace with home improvements.</p><p>Our audit compares your current policy against actual replacement costs and risk factors to identify gaps.</p>',
      steps: [
        { step: 1, question: 'When did you last review your homeowners policy?', options: ['Never reviewed it', 'Over 3 years ago', '1-3 years ago', 'Within the past year', 'Just purchased new policy'], correctAnswer: 2 },
        { step: 2, question: 'Does your dwelling coverage match current rebuild cost?', options: ['Not sure', 'Probably underinsured', 'Close to rebuild cost', 'Includes extended replacement', 'Guaranteed replacement cost'], correctAnswer: 2 },
        { step: 3, question: 'Do you have flood or earthquake risk?', options: ['No flood/quake zone', 'Moderate flood risk', 'High flood zone', 'Earthquake zone', 'Both flood and quake risk'], correctAnswer: 0 },
        { step: 4, question: 'Do you have valuable items needing scheduled coverage?', options: ['No high-value items', 'Jewelry under $5K', 'Collections/art $5K-$25K', 'High-value items $25K+', 'Home-based business'], correctAnswer: 1 },
        { step: 5, question: 'What is your current deductible?', options: ['$500', '$1,000', '$2,500', '$5,000', '% of dwelling (wind/hail)'], correctAnswer: 1 },
      ],
      resultLogic: { type: 'audit', message: 'Audit identifies 2-3 gaps: dwelling coverage approximately $45K below rebuild cost, missing sewer/water backup endorsement, and personal property limits need increase. Corrections cost approximately $120/year more but close $85K+ in gaps.' },
    },
    {
      slug: 'travel-insurance-planner',
      title: 'Travel Insurance Coverage Planner',
      description: 'Find the right travel insurance for your trip based on destination, cost, and health considerations.',
      article: '<h2>Travel Insurance: Comprehensive Protection for Every Trip</h2><p>Medical emergencies abroad average $25,000-$250,000 without insurance. Trip cancellation claims average $4,500. Travel insurance provides essential financial protection for trips over $2,000 or international travel, covering medical, cancellation, evacuation, and baggage.</p><h3>When to Buy</h3><p>Always buy when trip cost exceeds $5,000, traveling internationally, visiting remote areas, or traveling with pre-existing conditions. Typical cost: 5-12% of trip value. Cancel For Any Reason (CFAR) upgrades provide 75% reimbursement regardless of reason.</p><p>Our planner evaluates your trip details, health factors, and risk tolerance to recommend optimal coverage.</p>',
      steps: [
        { step: 1, question: 'What is your total trip cost (per person)?', options: ['Under $2,000', '$2,000-$5,000', '$5,000-$10,000', '$10,000-$25,000', '$25,000+'], correctAnswer: 1 },
        { step: 2, question: 'Where are you traveling?', options: ['Domestic US', 'Canada/Mexico/Caribbean', 'Europe/UK', 'Asia/Africa/South America', 'Remote/adventure destination'], correctAnswer: 2 },
        { step: 3, question: 'Do you have any pre-existing medical conditions?', options: ['No conditions', 'Controlled conditions', 'Multiple conditions', 'Recent treatment/surgery', 'Chronic serious condition'], correctAnswer: 0 },
        { step: 4, question: 'What activities are planned?', options: ['Standard tourism', 'Light adventure (hiking, snorkeling)', 'Moderate adventure (skiing, diving)', 'Extreme sports', 'Cruise or multi-stop itinerary'], correctAnswer: 0 },
        { step: 5, question: 'What is your biggest concern?', options: ['Trip cancellation', 'Medical emergencies abroad', 'Flight delays/lost baggage', 'Everything (comprehensive)', 'Just medical evacuation'], correctAnswer: 3 },
      ],
      resultLogic: { type: 'recommendation', message: 'Recommended: Comprehensive plan with $100K medical, $500K evacuation, trip cancellation to full value, $2,500 baggage. Estimated cost: 6-8% of trip value.' },
    },
    {
      slug: 'insurance-bundle-savings',
      title: 'Insurance Bundle Savings Calculator',
      description: 'Calculate potential savings by bundling multiple insurance policies with one carrier.',
      article: '<h2>Insurance Bundling: Save 15-30% by Consolidating Policies</h2><p>Multi-policy discounts save $500-$1,500/year by bundling home, auto, umbrella, and life insurance. Beyond savings, bundled policies simplify management with single billing and unified claims handling.</p><h3>Common Bundles</h3><p>Auto + Home saves 15-25%. Adding Umbrella saves 20-30% total. Adding Life saves additional 5-10% on all policies. Compare total bundled cost vs best individual policy for each line to ensure true savings.</p><p>Our calculator compares separated costs against bundled alternatives from 20+ carriers.</p>',
      steps: [
        { step: 1, question: 'Which insurance policies do you currently have?', options: ['Auto only', 'Auto + Renters', 'Auto + Homeowners', 'Auto + Home + Life', 'Auto + Home + Life + Umbrella'], correctAnswer: 2 },
        { step: 2, question: 'How many different carriers do you use?', options: ['1 (already bundled)', '2 carriers', '3 carriers', '4+ carriers', 'Not sure'], correctAnswer: 1 },
        { step: 3, question: 'What is your total annual insurance spending?', options: ['Under $2,000', '$2,000-$4,000', '$4,000-$7,000', '$7,000-$12,000', '$12,000+'], correctAnswer: 2 },
        { step: 4, question: 'When do your current policies renew?', options: ['Within 30 days', '1-3 months', '3-6 months', '6-12 months', 'Various dates'], correctAnswer: 4 },
        { step: 5, question: 'Are you happy with your current carriers?', options: ['Very satisfied', 'Mostly satisfied', 'Neutral', 'Somewhat dissatisfied', 'Want to switch'], correctAnswer: 1 },
      ],
      resultLogic: { type: 'savings', message: 'Bundle savings estimate: consolidating saves $650-$1,100/year (18-24% discount). Additional savings: paperless billing ($50/year), paid-in-full ($80-$120/year), loyalty discount after 3 years ($150-$300/year).' },
    },
    {
      slug: 'flood-insurance-needs',
      title: 'Flood Insurance Needs Assessment',
      description: 'Evaluate your flood risk and determine if NFIP or private flood insurance is right for you.',
      article: '<h2>Flood Insurance: Why Standard Policies Do Not Cover Flooding</h2><p>Standard homeowners insurance excludes flood damage. Just 1 inch of floodwater causes $25,000+ in damage. 25% of flood claims come from outside high-risk zones. NFIP caps at $250K dwelling/$100K contents. Private flood offers higher limits and often lower pricing.</p><h3>NFIP vs Private Flood</h3><p>NFIP: government-backed, standardized pricing, $250K max. Private: competitive pricing, higher limits ($500K-$5M+), replacement cost coverage, and additional living expenses. Private policies often cost 20-40% less for moderate-risk properties.</p><p>Our assessment evaluates your property location, elevation, and risk factors to recommend appropriate coverage.</p>',
      steps: [
        { step: 1, question: 'What flood zone is your property in?', options: ['Zone X (minimal risk)', 'Zone X shaded (moderate risk)', 'Zone AE/A (high risk)', 'Zone VE (coastal high risk)', 'Not sure of my flood zone'], correctAnswer: 0 },
        { step: 2, question: 'Has your area flooded in the past 10 years?', options: ['Never flooded', 'Minor street flooding', 'Nearby properties flooded', 'My property had water intrusion', 'Significant flooding event'], correctAnswer: 0 },
        { step: 3, question: 'What is your home value (structure only)?', options: ['Under $200K', '$200K-$400K', '$400K-$700K', '$700K-$1M', '$1M+'], correctAnswer: 1 },
        { step: 4, question: 'Do you have a basement or ground-level living space?', options: ['No basement (slab)', 'Unfinished basement', 'Finished basement', 'Ground-level/walkout', 'Split-level with below-grade rooms'], correctAnswer: 0 },
        { step: 5, question: 'Is flood insurance required by your lender?', options: ['Not required', 'Required (NFIP)', 'Required (any flood policy)', 'No mortgage/paid off', 'Not sure'], correctAnswer: 0 },
      ],
      resultLogic: { type: 'assessment', message: 'Private flood insurance recommended: $350K dwelling, $100K contents, $25K additional living expenses. Estimated premium: $480-$780/year. Excellent value against catastrophic but statistically likely flooding events.' },
    },
    {
      slug: 'workers-comp-requirements',
      title: 'Workers Compensation Assessment',
      description: 'Determine workers compensation obligations and optimize coverage costs.',
      article: '<h2>Workers Compensation: Legal Requirements and Cost Optimization</h2><p>Workers compensation is mandatory in 49 states for businesses with employees. Penalties for non-compliance include $1,000+ per day fines and criminal charges. Average cost: $1.19 per $100 of payroll, varying dramatically by industry classification.</p><h3>Cost Reduction</h3><p>Experience modification rate (EMR) adjusts premiums based on claims history. EMR below 1.0 earns discounts. Safety programs lower frequency 20-40%. Proper employee classification ensures correct rate application.</p><p>Our assessment evaluates your requirements, classification accuracy, and identifies optimization opportunities.</p>',
      steps: [
        { step: 1, question: 'In which state is your business located?', options: ['California/New York/NJ (high cost)', 'Texas/Florida/Illinois', 'Mid-Atlantic/Midwest', 'Southeast/Mountain West', 'Multiple states'], correctAnswer: 2 },
        { step: 2, question: 'What is your primary employee classification?', options: ['Office/clerical only', 'Sales/outside representatives', 'Light manufacturing/warehouse', 'Construction/skilled trades', 'Mixed classifications'], correctAnswer: 0 },
        { step: 3, question: 'How many employees do you have?', options: ['1-5', '6-15', '16-50', '51-200', '200+'], correctAnswer: 1 },
        { step: 4, question: 'What is your annual payroll?', options: ['Under $200K', '$200K-$500K', '$500K-$1M', '$1M-$5M', '$5M+'], correctAnswer: 1 },
        { step: 5, question: 'What is your claims history?', options: ['No claims (3+ years)', 'Minor claims only', '1-2 moderate claims', 'Frequent claims', 'Recent serious claim'], correctAnswer: 0 },
      ],
      resultLogic: { type: 'compliance', message: 'Estimated premium: $3,200-$5,800/year. Implementing recommended safety program could reduce EMR to 0.85 within 3 years, saving $480-$870/year annually.' },
    },
    {
      slug: 'cyber-personal-insurance',
      title: 'Personal Cyber Insurance Assessment',
      description: 'Evaluate your personal exposure to cyber threats and coverage needs.',
      article: '<h2>Personal Cyber Insurance: Digital-Age Protection</h2><p>Identity theft affects 15 million Americans annually with average costs of $1,100 and 200+ hours to resolve. Personal cyber insurance covers identity theft recovery, cyber extortion, online fraud, and cyberbullying legal expenses at just $25-$75/year.</p><h3>Coverage Types</h3><p>Identity theft restoration covers lost wages and legal fees. Cyber extortion pays ransomware recovery costs. Online fraud reimburses phishing losses. Social media liability covers defamation legal defense.</p><p>Our assessment evaluates your digital footprint and recommends appropriate personal cyber coverage.</p>',
      steps: [
        { step: 1, question: 'How much of your financial life is online?', options: ['Minimal (cash/in-person)', 'Some online banking', 'Most transactions online', 'Everything digital', 'Online business/freelance'], correctAnswer: 2 },
        { step: 2, question: 'Have you experienced any cyber incidents?', options: ['Never', 'Password breach notification', 'Credit card fraud', 'Identity theft attempt', 'Full identity theft'], correctAnswer: 0 },
        { step: 3, question: 'How many online accounts do you have?', options: ['Under 20', '20-50', '50-100', '100-200', '200+'], correctAnswer: 2 },
        { step: 4, question: 'Do you use a password manager and 2FA?', options: ['Both (strong security)', 'Password manager only', '2FA on some accounts', 'Neither', 'What are those?'], correctAnswer: 0 },
        { step: 5, question: 'Do you work remotely with company data?', options: ['No remote work', 'Occasional remote', 'Full-time remote, basic access', 'Remote with sensitive data', 'Remote with financial data'], correctAnswer: 2 },
      ],
      resultLogic: { type: 'assessment', message: 'Recommended: $50K identity theft coverage, $15K cyber extortion, $10K online fraud, $25K legal defense. Estimated annual cost: $45-$65.' },
    },
    {
      slug: 'event-insurance-planning',
      title: 'Event Insurance Planning Calculator',
      description: 'Calculate event insurance needs for weddings, conferences, and special occasions.',
      article: '<h2>Event Insurance: Protecting Your Investment</h2><p>Average wedding costs $35,000. Corporate events range $50K-$500K+. Event insurance typically costs 1-3% of budget and covers cancellation, liability, property damage, and vendor failures — preventing total financial loss from unforeseen circumstances.</p><h3>Coverage Types</h3><p>Cancellation/postponement reimburses non-recoverable deposits. General liability protects against injury claims ($1M-$5M). Liquor liability covers alcohol-related incidents. Property damage protects venue and equipment.</p><p>Our calculator evaluates your event type, budget, and risk factors to recommend appropriate coverage.</p>',
      steps: [
        { step: 1, question: 'What type of event are you planning?', options: ['Wedding', 'Corporate conference', 'Private party', 'Fundraiser/charity', 'Trade show'], correctAnswer: 0 },
        { step: 2, question: 'What is your total event budget?', options: ['Under $10,000', '$10,000-$30,000', '$30,000-$75,000', '$75,000-$200,000', '$200,000+'], correctAnswer: 1 },
        { step: 3, question: 'How many guests are expected?', options: ['Under 50', '50-100', '100-200', '200-500', '500+'], correctAnswer: 1 },
        { step: 4, question: 'Will alcohol be served?', options: ['No alcohol', 'Beer/wine only', 'Full bar (hosted)', 'Full bar (cash)', 'Open premium bar'], correctAnswer: 2 },
        { step: 5, question: 'Is the event indoor or outdoor?', options: ['Indoor only', 'Mostly indoor', 'Outdoor with indoor backup', 'Fully outdoor (tent)', 'Destination/travel required'], correctAnswer: 0 },
      ],
      resultLogic: { type: 'planning', message: 'Recommended: Event cancellation ($30K), general liability ($1M), liquor liability ($1M), vendor no-show protection. Estimated premium: $285-$450.' },
    },
    {
      slug: 'gap-insurance-auto',
      title: 'GAP Insurance Auto Assessment',
      description: 'Determine if GAP insurance is worth it for your vehicle loan or lease.',
      article: '<h2>GAP Insurance: Closing the Depreciation Gap</h2><p>New vehicles lose 20-30% of value in year one. If totaled, standard insurance pays actual cash value — not what you owe. GAP insurance covers the difference, preventing you from owing thousands on a car you no longer have.</p><h3>When You Need It</h3><p>Essential when: down payment under 20%, loan term over 4 years, rolled negative equity from trade-in, or leased vehicle. Buy from your auto insurer ($20-$50/year) — never from the dealership ($500-$1,000 financed into loan).</p><p>Our assessment evaluates your loan-to-value ratio and depreciation risk to determine if GAP provides genuine value.</p>',
      steps: [
        { step: 1, question: 'How much did you put down?', options: ['$0 (zero down)', 'Under 10%', '10-20%', 'Over 20%', 'Cash purchase (no loan)'], correctAnswer: 0 },
        { step: 2, question: 'What is your loan term?', options: ['36 months', '48 months', '60 months', '72 months', '84 months'], correctAnswer: 3 },
        { step: 3, question: 'Did you roll in negative equity?', options: ['No trade-in', 'Trade-in with positive equity', 'Rolled $1K-$3K negative', 'Rolled $3K-$6K negative', 'Rolled $6K+ negative'], correctAnswer: 0 },
        { step: 4, question: 'How many miles do you drive per year?', options: ['Under 8,000', '8,000-12,000', '12,000-18,000', '18,000-25,000', '25,000+'], correctAnswer: 2 },
        { step: 5, question: 'Is your vehicle a lease or purchase?', options: ['Purchase (new)', 'Purchase (used)', 'Lease (new)', 'Lease (used)', 'About to acquire'], correctAnswer: 0 },
      ],
      resultLogic: { type: 'assessment', message: 'GAP insurance RECOMMENDED. Maximum potential gap: $6,200-$8,800 in year 2. Best option: add to existing auto policy for $25-$40/year. Cancel once loan balance drops below vehicle value (typically year 3-4).' },
    },
  ],
}

// Generate quiz data for categories that don't have hardcoded entries
function generateQuizzesForCategory(categorySlug: string): QuizItem[] {
  const templates: Record<string, { slugs: string[]; titles: string[]; questions: [string, string][][] }> = {
    'mortgage-home-lending': {
      slugs: ['home-equity-strategies', 'mortgage-preapproval-prep', 'investment-property-mortgage', 'arm-vs-fixed-rate', 'mortgage-points-calculator', 'jumbo-loan-qualification', 'reverse-mortgage-evaluation', 'construction-loan-guide', 'fha-streamline-refinance', 'usda-rural-housing', 'second-home-financing', 'seller-financing-assessment', 'home-affordability-calculator', 'closing-cost-estimator', 'pmi-removal-strategy'],
      titles: ['Home Equity Optimization Strategy', 'Mortgage Pre-Approval Preparation', 'Investment Property Mortgage Assessment', 'ARM vs Fixed Rate Comparison', 'Mortgage Points Break-Even Calculator', 'Jumbo Loan Qualification Assessment', 'Reverse Mortgage Evaluation Tool', 'Construction Loan Guide', 'FHA Streamline Refinance Assessment', 'USDA Rural Housing Eligibility', 'Second Home Financing Assessment', 'Seller Financing Assessment', 'Home Affordability Calculator', 'Closing Cost Estimator', 'PMI Removal Strategy Tool'],
      questions: [
        [['How much equity do you have?', 'Under 20%|20-40%|40-60%|60-80%|80%+'], ['What is your current mortgage rate?', 'Under 4%|4-5%|5-6%|6-7%|7%+'], ['How much equity do you want to access?', 'Under $25K|$25K-$50K|$50K-$100K|$100K-$250K|$250K+'], ['What will you use the funds for?', 'Home improvements|Debt consolidation|Investment property|Education|Emergency/multiple'], ['How quickly do you need the funds?', 'Immediately|Within 1-2 months|Within 3-6 months|No rush|Ongoing access']],
        [['What is your credit score range?', 'Under 620|620-679|680-719|720-759|760+'], ['When do you plan to apply?', 'Within 30 days|1-3 months|3-6 months|6-12 months|Just exploring'], ['What is your debt-to-income ratio?', 'Under 20%|20-30%|30-40%|40-50%|Not sure'], ['What is your employment type?', 'W-2 (2+ years)|W-2 (under 2 years)|Self-employed (2+ years)|Self-employed (under 2 years)|1099 contractor'], ['How much for down payment?', '3-5%|5-10%|10-20%|20%+|Using assistance programs']],
      ],
    },
    'legal-services-assessment': {
      slugs: ['estate-planning-needs', 'business-formation-guide', 'employment-law-audit', 'intellectual-property-protection', 'contract-review-assessment', 'family-law-preparation', 'real-estate-legal-review', 'tax-dispute-resolution', 'immigration-pathway-assessment', 'bankruptcy-alternatives', 'class-action-eligibility', 'landlord-tenant-rights', 'nonprofit-formation-guide', 'privacy-compliance-legal', 'litigation-risk-evaluation'],
      titles: ['Estate Planning Needs Assessment', 'Business Formation Legal Guide', 'Employment Law Compliance Audit', 'Intellectual Property Protection Tool', 'Contract Review Assessment', 'Family Law Case Preparation', 'Real Estate Legal Review', 'Tax Dispute Resolution Strategy', 'Immigration Pathway Assessment', 'Bankruptcy Alternatives Analysis', 'Class Action Eligibility Check', 'Landlord-Tenant Rights Assessment', 'Nonprofit Formation Guide', 'Privacy Law Compliance Assessment', 'Litigation Risk Evaluation'],
      questions: [
        [['Do you have a current will or trust?', 'No estate plan|Basic will only|Will + POA|Living trust + will|Comprehensive plan'], ['What is your estimated estate value?', 'Under $500K|$500K-$1M|$1M-$5M|$5M-$13M|$13M+ (estate tax)'], ['Do you have minor children?', 'No children|Children 0-5|Children 6-12|Children 13-17|Adult children only'], ['Any special circumstances?', 'None|Blended family|Special needs dependent|Business succession|Multiple factors'], ['How urgently do you need planning?', 'Just exploring|Within 6 months|Within 3 months|Urgent|Immediate']],
        [['What type of business?', 'Solo service/consulting|E-commerce/retail|Tech/SaaS startup|Professional practice|Partnership'], ['Expected first-year revenue?', 'Under $50K|$50K-$100K|$100K-$250K|$250K-$500K|$500K+'], ['Will you have employees or partners?', 'Just me|1-5 employees|Partners involved|Investors needed|Large team planned'], ['Personal liability concern level?', 'Low (service)|Moderate (some risk)|High (product/physical)|Very high (medical/legal)|Extreme (regulated)'], ['Plan to raise outside investment?', 'No (self-funded)|Friends & family|Angel investors|Venture capital|Not sure']],
      ],
    },
    'enterprise-crm-sales-tech': {
      slugs: ['crm-migration-readiness', 'sales-pipeline-optimization', 'marketing-automation-audit', 'customer-success-platform', 'sales-enablement-assessment', 'crm-integration-planning', 'lead-scoring-model-review', 'sales-forecasting-accuracy', 'contact-center-technology', 'revenue-operations-maturity', 'partner-relationship-management', 'quote-to-cash-optimization', 'customer-data-platform', 'sales-territory-planning', 'crm-adoption-readiness'],
      titles: ['CRM Migration Readiness Assessment', 'Sales Pipeline Optimization Tool', 'Marketing Automation Audit', 'Customer Success Platform Evaluation', 'Sales Enablement Assessment', 'CRM Integration Planning Tool', 'Lead Scoring Model Review', 'Sales Forecasting Accuracy Audit', 'Contact Center Technology Assessment', 'Revenue Operations Maturity Model', 'Partner Relationship Management', 'Quote-to-Cash Optimization', 'Customer Data Platform Assessment', 'Sales Territory Planning Tool', 'CRM Adoption Readiness Check'],
      questions: [
        [['What CRM are you migrating FROM?', 'Salesforce|HubSpot|Microsoft Dynamics|Legacy/custom system|Spreadsheets/no CRM'], ['What CRM are you migrating TO?', 'Salesforce|HubSpot|Microsoft Dynamics|Zoho|Other'], ['How many records will be migrated?', 'Under 10K|10K-50K|50K-250K|250K-1M|1M+'], ['How many integrations?', 'None|1-3|4-8|9-15|15+'], ['Migration timeline?', 'Under 3 months|3-6 months|6-12 months|12-18 months|Not determined']],
        [['Average sales cycle length?', 'Under 30 days|30-60 days|60-90 days|90-180 days|180+ days'], ['Current pipeline conversion rate?', 'Under 10%|10-15%|15-20%|20-30%|Not tracking'], ['How many pipeline stages?', '3-4|5-6|7-8|9+|Not well defined'], ['Biggest pipeline challenge?', 'Not enough leads|Poor qualification|Deals stalling|Low close rates|Forecasting inaccuracy'], ['How many sales reps?', '1-5|6-15|16-50|51-100|100+']],
      ],
    },
    'financial-planning-wealth': {
      slugs: ['retirement-income-strategy', 'tax-optimization-planning', 'college-savings-comparison', 'social-security-timing', 'investment-risk-tolerance', 'debt-payoff-strategy', 'emergency-fund-calculator', 'charitable-giving-strategy', 'alternative-investments', 'inflation-protection', 'healthcare-cost-retirement', 'income-diversification', 'financial-independence-calc', 'tax-loss-harvesting', 'estate-tax-minimization'],
      titles: ['Retirement Income Strategy Planner', 'Tax Optimization Planning Tool', 'College Savings Plan Comparison', 'Social Security Timing Optimizer', 'Investment Risk Tolerance Assessment', 'Debt Payoff Strategy Calculator', 'Emergency Fund Calculator', 'Charitable Giving Strategy', 'Alternative Investments Assessment', 'Inflation Protection Strategy', 'Healthcare Cost in Retirement', 'Income Diversification Planner', 'Financial Independence Calculator', 'Tax-Loss Harvesting Opportunity', 'Estate Tax Minimization Strategy'],
      questions: [
        [['When do you plan to retire?', 'Already retired|Within 5 years|5-10 years|10-20 years|20+ years'], ['Expected retirement income sources?', 'Social Security only|SS + pension|SS + 401k/IRA|SS + multiple accounts|Multiple streams'], ['Estimated retirement spending need?', 'Under $50K/year|$50K-$75K|$75K-$100K|$100K-$150K|$150K+'], ['How do you feel about market volatility?', 'Very concerned|Somewhat concerned|Moderate tolerance|Comfortable|High tolerance'], ['Healthcare coverage for pre-65?', 'Employer continues|COBRA bridge|ACA marketplace|Medicare eligible|No plan']],
        [['What is your marginal tax bracket?', '10-12%|22%|24%|32%|35-37%'], ['Do you maximize retirement contributions?', 'No accounts|Contribute some|Max 401k only|Max 401k + IRA|Max all accounts'], ['Do you have an HSA-eligible plan?', 'Yes, max contributions|Yes, contributing some|Yes, not contributing|No HSA plan|What is an HSA?'], ['Business or self-employment income?', 'No|Side gig|Small business|Significant business|Multiple businesses'], ['Investment gain/loss situation?', 'Significant gains|Moderate gains|Break even|Some losses|Significant losses']],
      ],
    },
    'cybersecurity-compliance': {
      slugs: ['zero-trust-readiness', 'incident-response-planning', 'cloud-security-posture', 'employee-security-training', 'data-classification-assessment', 'vendor-risk-management', 'identity-access-management', 'backup-disaster-recovery', 'network-segmentation-audit', 'security-operations-maturity', 'api-security-assessment', 'mobile-device-management', 'security-awareness-program', 'compliance-gap-analysis', 'threat-intelligence-readiness'],
      titles: ['Zero Trust Architecture Readiness', 'Incident Response Plan Assessment', 'Cloud Security Posture Review', 'Employee Security Training Audit', 'Data Classification Assessment', 'Vendor Risk Management Tool', 'Identity & Access Management Audit', 'Backup & Disaster Recovery Assessment', 'Network Segmentation Audit', 'Security Operations Maturity Model', 'API Security Assessment', 'Mobile Device Management Review', 'Security Awareness Program Audit', 'Compliance Gap Analysis Tool', 'Threat Intelligence Readiness'],
      questions: [
        [['Is MFA implemented for all users?', 'No MFA|MFA for some|MFA for all users|MFA everywhere (basic)|MFA + conditional access'], ['Do you have micro-segmentation?', 'Flat network|Basic VLANs|Some segmentation|Extensive segmentation|Full micro-segmentation'], ['Device health validation?', 'No device checks|Basic antivirus|MDM enrollment|Health attestation|Continuous assessment'], ['Data access model?', 'Open access|Role-based (broad)|Need-to-know (granular)|Dynamic access|Zero Trust data'], ['Continuous monitoring?', 'Basic logging|SIEM deployed|SIEM + UEBA|Full SOC|AI-driven analytics']],
        [['Documented incident response plan?', 'No plan|Draft/outdated|Documented untested|Tested annually|Tested quarterly'], ['How quickly detect incidents?', 'Days to weeks|Hours to days|Within hours|Within minutes|Real-time'], ['Who is on IR team?', 'No dedicated team|IT handles all|Small IR team|Full IR team + CISO|IR + external retainer'], ['Forensic capability?', 'None|Basic (internal)|Moderate|Advanced (full toolset)|Expert (internal + external)'], ['Communication plan during incidents?', 'None|Ad-hoc|Basic template|Full plan|Tested plan with legal/PR']],
      ],
    },
    'cloud-computing-devops': {
      slugs: ['multi-cloud-strategy', 'container-orchestration-readiness', 'serverless-migration', 'devsecops-maturity', 'cloud-cost-optimization', 'infrastructure-as-code-audit', 'cloud-native-readiness', 'disaster-recovery-cloud', 'platform-engineering-maturity', 'observability-stack', 'gitops-implementation', 'cloud-governance-framework', 'microservices-readiness', 'edge-computing-assessment', 'cloud-compliance-posture'],
      titles: ['Multi-Cloud Strategy Assessment', 'Container Orchestration Readiness', 'Serverless Migration Evaluation', 'DevSecOps Maturity Model', 'Cloud Cost Optimization Audit', 'Infrastructure as Code Audit', 'Cloud-Native Readiness Assessment', 'Cloud Disaster Recovery Planning', 'Platform Engineering Maturity', 'Observability Stack Assessment', 'GitOps Implementation Readiness', 'Cloud Governance Framework Audit', 'Microservices Architecture Readiness', 'Edge Computing Assessment', 'Cloud Compliance Posture Review'],
      questions: [
        [['How many cloud providers?', 'One (AWS/Azure/GCP)|Two providers|Three|Four+|On-premises only'], ['Multi-cloud driver?', 'Avoid vendor lock-in|Best-of-breed|Compliance/sovereignty|Cost optimization|Acquisition'], ['Infrastructure management?', 'Manual/console|Terraform (single)|Terraform (multi)|Pulumi/Crossplane|Full platform engineering'], ['Biggest multi-cloud challenge?', 'Cost visibility|Security consistency|Networking|Skill gaps|Governance'], ['Cloud spending level?', 'Under $10K/month|$10K-$50K|$50K-$200K|$200K-$1M|$1M+']],
        [['Current container usage?', 'No containers|Docker dev only|Docker production|Basic K8s|K8s production'], ['Applications for Kubernetes?', '1-5 apps|5-15|15-50|50-100|100+'], ['Team Kubernetes experience?', 'No experience|Training completed|Some experience|Strong team|Expert'], ['CI/CD maturity?', 'Manual deployments|Basic CI|CI + manual CD|Full CI/CD|GitOps automated'], ['Monitoring approach?', 'Basic server monitoring|Application logs|APM tool|Full observability|AIOps']],
      ],
    },
    'digital-marketing-seo': {
      slugs: ['technical-seo-audit', 'content-marketing-roi', 'social-media-strategy', 'email-marketing-optimization', 'paid-search-efficiency', 'landing-page-conversion', 'marketing-attribution-model', 'brand-awareness-measurement', 'influencer-marketing-assessment', 'video-marketing-strategy', 'local-seo-optimization', 'marketing-stack-evaluation', 'customer-journey-mapping', 'ab-testing-maturity', 'marketing-budget-allocation'],
      titles: ['Technical SEO Audit Tool', 'Content Marketing ROI Calculator', 'Social Media Strategy Assessment', 'Email Marketing Optimization', 'Paid Search Efficiency Assessment', 'Landing Page Conversion Audit', 'Marketing Attribution Model Review', 'Brand Awareness Measurement', 'Influencer Marketing Assessment', 'Video Marketing Strategy Planner', 'Local SEO Optimization Tool', 'Marketing Tech Stack Evaluation', 'Customer Journey Mapping', 'A/B Testing Maturity Model', 'Marketing Budget Allocation Tool'],
      questions: [
        [['Core Web Vitals score?', 'Poor (fails all)|Needs improvement|Good on some|Good on all (mobile)|Excellent (top 10%)'], ['How many pages on site?', 'Under 50|50-200|200-1,000|1,000-10,000|10,000+'], ['Mobile optimization?', 'No mobile version|Responsive (basic)|Mobile-first|AMP pages|PWA + responsive'], ['Site architecture?', 'Flat (root)|Basic categories|Siloed content|Topic clusters|Hub & spoke'], ['Organic traffic trend?', 'Declining|Flat|Slow growth (<10%)|Moderate (10-25%)|Strong (25%+)']],
        [['Content publishing frequency?', 'Rarely|Monthly|Weekly|Multiple/week|Daily'], ['Content types produced?', 'Blog only|Blog + social|Blog + video + social|Full content mix|Content + tools'], ['Track content to revenue?', 'No tracking|Pageview tracking|Lead source|Multi-touch attribution|Revenue attribution'], ['Monthly content budget?', 'Under $2K|$2K-$5K|$5K-$15K|$15K-$50K|$50K+'], ['How measure success?', 'Traffic only|Traffic + engagement|Leads generated|Pipeline influenced|Revenue attributed']],
      ],
    },
    'healthcare-technology': {
      slugs: ['health-data-analytics-maturity', 'remote-monitoring-readiness', 'clinical-ai-readiness', 'healthcare-cloud-migration', 'population-health-management', 'patient-portal-optimization', 'health-it-security-posture', 'care-coordination-technology', 'digital-therapeutics-assessment', 'healthcare-automation', 'value-based-care-technology', 'mental-health-tech', 'genomics-data-management', 'healthcare-iot-readiness', 'clinical-trial-technology'],
      titles: ['Health Data Analytics Maturity', 'Remote Patient Monitoring Readiness', 'Clinical AI Implementation', 'Healthcare Cloud Migration', 'Population Health Management', 'Patient Portal Optimization', 'Health IT Security Posture', 'Care Coordination Technology', 'Digital Therapeutics Evaluation', 'Healthcare Automation Readiness', 'Value-Based Care Technology', 'Mental Health Tech Assessment', 'Genomics Data Management', 'Healthcare IoT Readiness', 'Clinical Trial Technology'],
      questions: [
        [['Current analytics capability?', 'Excel/manual|EMR standard reports|Basic BI tool|Enterprise data warehouse|AI/ML models'], ['Data infrastructure?', 'Siloed systems|Some integration|Data warehouse (batch)|Real-time data lake|Cloud-native platform'], ['Analytics team?', 'No dedicated team|1-2 analysts|Small team|Data science team|Full department'], ['Biggest analytics challenge?', 'Data quality|Integration|Lack of expertise|Tool limitations|Clinician adoption'], ['Outcomes to improve?', 'Operational efficiency|Clinical quality|Financial performance|Patient experience|All of the above']],
        [['Patient population for RPM?', 'CHF/cardiac|Diabetes|COPD/respiratory|Hypertension|Multiple chronic'], ['How many RPM candidates?', 'Under 100|100-500|500-2,000|2,000-10,000|10,000+'], ['RPM infrastructure?', 'Nothing in place|Basic devices|Platform selected|Pilot running|Scaled program'], ['EHR integration approach?', 'Manual data entry|Basic import/export|API integration|Bi-directional real-time|Embedded in workflow'], ['Billing readiness?', 'Not familiar|Understanding codes|Infrastructure ready|Currently billing|Optimizing revenue']],
      ],
    },
    'business-intelligence-erp': {
      slugs: ['erp-selection-framework', 'data-warehouse-modernization', 'bi-tool-comparison', 'analytics-democratization', 'data-governance-maturity', 'reporting-automation', 'master-data-management', 'real-time-analytics', 'ai-analytics-integration', 'dashboard-effectiveness', 'data-literacy-assessment', 'erp-modernization', 'supply-chain-analytics', 'financial-planning-analytics', 'predictive-maintenance'],
      titles: ['ERP Selection Framework', 'Data Warehouse Modernization', 'BI Tool Comparison Assessment', 'Analytics Democratization Readiness', 'Data Governance Maturity Model', 'Reporting Automation Assessment', 'Master Data Management Audit', 'Real-Time Analytics Readiness', 'AI-Powered Analytics Integration', 'Dashboard Effectiveness Audit', 'Data Literacy Assessment', 'ERP Modernization Readiness', 'Supply Chain Analytics', 'Financial Planning & Analysis', 'Predictive Maintenance Assessment'],
      questions: [
        [['Company annual revenue?', 'Under $10M|$10M-$50M|$50M-$200M|$200M-$1B|$1B+'], ['Current ERP?', 'No ERP|QuickBooks/Sage|NetSuite/Intacct|SAP Business One/Dynamics|SAP S/4 HANA/Oracle'], ['Primary industry?', 'Manufacturing|Distribution|Professional services|Retail/e-commerce|Multi-industry'], ['Biggest operational challenge?', 'Manual processes|Disconnected systems|Poor visibility|Scalability|Compliance'], ['ERP budget?', 'Under $100K|$100K-$300K|$300K-$750K|$750K-$2M|$2M+']],
        [['Current data warehouse?', 'No formal warehouse|SQL Server/Oracle on-prem|Teradata/legacy|Cloud (basic)|Modern lakehouse'], ['Data volume?', 'Under 100GB|100GB-1TB|1TB-10TB|10TB-100TB|100TB+'], ['Data sources feeding warehouse?', 'Under 5|5-15|15-50|50-100|100+'], ['Primary analytics workload?', 'Standard reporting|Ad-hoc queries|Complex analytics|Machine learning|Real-time streaming'], ['Modernization drivers?', 'Cost reduction|Performance|New capabilities|Vendor end-of-life|Business growth']],
      ],
    },
  }

  const template = templates[categorySlug]
  if (!template) return []

  const articles: Record<string, string[]> = {
    'mortgage-home-lending': [
      '<h2>Home Equity Strategies: HELOC vs Cash-Out Refi vs Home Equity Loan</h2><p>American homeowners hold $32 trillion in home equity. Accessing this equity requires choosing between HELOCs (variable rate line of credit), home equity loans (fixed rate lump sum), and cash-out refinancing. Each serves different needs with different cost structures and risk profiles.</p><h3>Choosing the Right Option</h3><p>HELOCs offer revolving credit at variable rates — best for ongoing expenses. Home equity loans provide fixed-rate lump sums — best for one-time needs. Cash-out refinancing replaces your mortgage at potentially better rates — best when rates are below your current mortgage.</p><p>Our strategy tool compares all three options for your specific situation.</p>',
      '<h2>Mortgage Pre-Approval: Maximizing Your Buying Power</h2><p>Pre-approval is not just about qualifying — it is about qualifying for the BEST terms. The difference between a 680 and 740 credit score on a $400K mortgage costs $50,000+ over 30 years. Strategic preparation maximizes your approval amount and minimizes lifetime costs.</p><h3>Preparation Steps</h3><p>3-6 months before: pay down credit utilization below 10%, dispute errors, avoid new credit. Gather 2 years tax returns, 2 months bank statements, 30 days pay stubs. Large undocumented deposits trigger scrutiny.</p><p>Our preparation guide identifies specific actions to strengthen your pre-approval.</p>',
    ],
    'legal-services-assessment': [
      '<h2>Estate Planning: Protecting Assets and Legacy</h2><p>70% of Americans lack a basic estate plan, exposing families to probate costs (3-7% of estate value), unnecessary taxes, and contested inheritances. Every adult needs: Last Will, Durable Power of Attorney, Healthcare Proxy, and beneficiary review at minimum.</p><h3>Trust Structures</h3><p>Revocable Living Trusts avoid probate and provide privacy. Irrevocable trusts offer asset protection and tax benefits. Special needs trusts protect disabled beneficiaries while preserving government benefits eligibility.</p><p>Our assessment identifies gaps in your current estate plan and prioritizes actions.</p>',
      '<h2>Business Formation: Choosing the Right Legal Structure</h2><p>Your business structure determines tax treatment, personal liability exposure, and operational flexibility. LLCs offer simplicity with pass-through taxation. S-Corps provide self-employment tax savings for profitable businesses. C-Corps enable unlimited shareholders and fundraising.</p><h3>When to Change Structure</h3><p>Most small businesses start as LLCs and elect S-Corp taxation when income justifies additional complexity (typically $40K+ net income). Convert to C-Corp when seeking institutional investors or planning IPO.</p><p>Our guide evaluates your situation to recommend optimal entity structure.</p>',
    ],
    'enterprise-crm-sales-tech': [
      '<h2>CRM Migration: Planning a Successful Transition</h2><p>CRM migrations fail 30-40% of the time, costing $5M-$20M. Success requires 6-18 months of planning, clean data preparation, user training, and phased rollout. The most common failure: underestimating data mapping complexity and user adoption resistance.</p><h3>Migration Framework</h3><p>Audit current system → Map data fields → Clean/deduplicate data → Build integrations → Train users → Phased go-live with parallel running. Each phase has specific success criteria before advancing.</p><p>Our readiness assessment evaluates migration complexity and identifies critical risks.</p>',
      '<h2>Sales Pipeline Optimization: Converting More Leads to Revenue</h2><p>Average B2B pipeline converts only 13% of opportunities. Optimizing stage definitions, velocity metrics, and progression criteria improves conversion 20-40%. Pipeline health directly impacts forecasting and resource allocation.</p><h3>Key Metrics</h3><p>Velocity (days per stage), Coverage (3-4x quota = healthy), Shape (balanced distribution), and Age (deals older than 2x average cycle likely lost). Address the weakest metric first for highest impact.</p><p>Our tool identifies specific bottlenecks and provides recommendations.</p>',
    ],
    'financial-planning-wealth': [
      '<h2>Retirement Income Strategy: Sustainable Cash Flow</h2><p>The 4% rule may not apply in today is interest environment. Successful planning combines Social Security optimization, systematic withdrawals, guaranteed income, and tax-efficient distribution sequencing for 25-35 year retirements.</p><h3>Distribution Sequencing</h3><p>Tax-efficient order: taxable accounts first (capital gains rates), then tax-deferred (ordinary income), then Roth (tax-free growth). Roth conversions during low-income years reduce lifetime tax burden significantly.</p><p>Our planner creates year-by-year distribution strategies maximizing after-tax income.</p>',
      '<h2>Tax Optimization: Legal Strategies to Minimize Your Burden</h2><p>The average American overpays $3,000-$8,000 annually through missed deductions, poor timing, and suboptimal account selection. Year-round tax planning identifies opportunities that year-end scrambling misses.</p><h3>Quarterly Actions</h3><p>Q1: Maximize prior-year IRA/HSA. Q2: Estimated tax planning + Roth conversion analysis. Q3: Tax-loss harvesting. Q4: Charitable giving bunching + retirement contribution max.</p><p>Our tool identifies highest-impact optimization opportunities for your situation.</p>',
    ],
    'cybersecurity-compliance': [
      '<h2>Zero Trust Architecture: Never Trust, Always Verify</h2><p>Zero Trust eliminates implicit trust in any user, device, or network segment. With 82% of breaches involving human elements, perimeter-based security is obsolete. Implementation reduces breach impact by 50% and detection time by 76%.</p><h3>Core Principles</h3><p>Verify explicitly, use least-privilege access, assume breach. Implementation layers: identity verification (MFA), device health validation, micro-segmentation, data encryption, continuous monitoring.</p><p>Our assessment evaluates your architecture against Zero Trust maturity model.</p>',
      '<h2>Incident Response: Preparation Before the Breach</h2><p>Organizations with tested IR plans contain breaches 54 days faster, saving $2.66 million per incident. Yet 77% lack a consistently applied plan. The time to build capability is before an incident.</p><h3>IR Plan Components</h3><p>Detection, Containment, Eradication, Recovery, Post-Incident analysis. Each phase needs defined procedures, team roles, and communication protocols.</p><p>Our assessment evaluates IR readiness across people, process, and technology.</p>',
    ],
    'cloud-computing-devops': [
      '<h2>Multi-Cloud Strategy: Avoiding Vendor Lock-In</h2><p>73% of enterprises use multiple clouds, but only 28% have deliberate strategy. Without planning, multi-cloud becomes multi-mess with duplicate tools, inconsistent security, and inflated costs.</p><h3>When Multi-Cloud Wins</h3><p>Best-of-breed services, geographic requirements, risk mitigation, acquisition integration, and cost optimization through spot pricing arbitrage.</p><p>Our assessment evaluates workload portfolio and recommends optimal placement.</p>',
      '<h2>Container Orchestration: Kubernetes Readiness</h2><p>Kubernetes accelerates deployment 4-6x but introduces complexity. 60% of deployments face production issues in year one due to insufficient preparation in networking, security, or observability.</p><h3>Readiness Factors</h3><p>Team skill (2-3 experienced engineers minimum), application architecture, CI/CD maturity, monitoring capability, and security posture (RBAC, network policies, image scanning).</p><p>Our tool evaluates your team and infrastructure against K8s production requirements.</p>',
    ],
    'digital-marketing-seo': [
      '<h2>Technical SEO: Foundation of Search Visibility</h2><p>Technical issues prevent 40% of websites from reaching ranking potential. Core Web Vitals, crawlability, indexation, and site architecture determine whether content can compete. Sites improving CWV see 15-25% organic traffic increases within 3-6 months.</p><h3>Priority Factors</h3><p>Page speed (LCP under 2.5s), mobile-first indexing, crawl budget optimization, canonical management, internal linking, and schema markup implementation.</p><p>Our audit identifies critical issues and prioritizes fixes by traffic impact.</p>',
      '<h2>Content Marketing ROI: Measuring What Matters</h2><p>Content generates 3x more leads at 62% lower cost than paid ads, but only 21% of marketers measure ROI. The challenge: content impacts multiple stages across extended timelines requiring sophisticated attribution.</p><h3>Attribution Models</h3><p>Direct (last-touch), Assisted (multi-touch journey), SEO value (comparable PPC cost), Brand impact (branded search volume). Layer all models for complete picture.</p><p>Our calculator quantifies returns across all attribution models.</p>',
    ],
    'healthcare-technology': [
      '<h2>Health Data Analytics: From Reporting to Predictive Intelligence</h2><p>Healthcare generates 50 petabytes annually, yet fewer than 30% leverage analytics beyond basic reporting. Advanced analytics reduces readmissions 15-25%, improves outcomes 10-20%, and identifies $2-5M revenue leakage annually.</p><h3>Maturity Levels</h3><p>Level 1: Ad-hoc reporting. Level 2: Standardized dashboards. Level 3: Departmental analytics. Level 4: Enterprise analytics. Level 5: AI/ML-driven insights.</p><p>Our assessment evaluates capabilities and identifies highest-ROI advancement opportunities.</p>',
      '<h2>Remote Patient Monitoring: Extending Care Beyond Walls</h2><p>RPM reduces readmissions 38%, ER visits 25%, and cost of care 17%. With CMS reimbursement at $55-$175/patient/month, programs achieve 200-300% ROI within 12 months while improving outcomes.</p><h3>Technology Stack</h3><p>Connected devices, data transmission platform, clinical dashboard, EHR integration, and patient engagement app. Each layer must work seamlessly for clinical workflow adoption.</p><p>Our readiness assessment evaluates patient population, workflows, and infrastructure.</p>',
    ],
    'business-intelligence-erp': [
      '<h2>ERP Selection: Choosing the Right System</h2><p>ERP implementations cost $150K-$750K for mid-market and $1M-$10M+ for enterprise. With 55-75% exceeding budget and 30% failing, systematic selection is critical. The right ERP improves efficiency 20-30% and enables 10-15% revenue growth.</p><h3>Selection Framework</h3><p>Industry fit, deployment model, total cost of ownership, scalability, and ecosystem strength. Evaluate against 20+ platforms for optimal fit using weighted scoring methodology.</p><p>Our framework evaluates requirements against platforms to identify optimal fit.</p>',
      '<h2>Data Warehouse Modernization: Legacy to Cloud-Native</h2><p>Legacy warehouses face storage limits, scaling challenges, and 3-5x higher maintenance costs than cloud alternatives. Cloud warehouses (Snowflake, BigQuery, Redshift) offer elastic scaling and pay-per-query pricing. Migration typically saves 40-60% while improving performance 10x.</p><h3>Approaches</h3><p>Lift-and-shift (fastest), Re-platform (some optimization), Re-architect (recommended for most), Hybrid (sensitive data on-premises).</p><p>Our assessment evaluates current warehouse and recommends optimal modernization path.</p>',
    ],
  }

  const quizzes: QuizItem[] = []
  for (let i = 0; i < template.slugs.length; i++) {
    const questionSet = template.questions[i % template.questions.length]
    const articleList = articles[categorySlug] || ['<h2>Professional Assessment Guide</h2><p>Our comprehensive tool evaluates your situation against industry benchmarks to provide personalized recommendations.</p>']
    const articleHtml = articleList[i % articleList.length]

    quizzes.push({
      slug: template.slugs[i],
      title: template.titles[i],
      description: `Comprehensive ${template.titles[i].toLowerCase()} for enterprise decision-makers.`,
      article: articleHtml,
      steps: questionSet.map((q, stepIdx) => {
        const [question, optionsStr] = q
        const options = optionsStr.split('|')
        return { step: stepIdx + 1, question, options, correctAnswer: (i + stepIdx) % options.length }
      }),
      resultLogic: {
        type: 'assessment',
        message: 'Based on your responses, our analysis identifies 3-4 critical optimization opportunities. Your current maturity level ranks in the 45th percentile for your industry. Implementing recommended improvements projects 25-40% performance gain within 6 months.',
      },
    })
  }

  return quizzes
}

async function main() {
  console.log('Adding more quizzes to all categories...\n')

  const categories = await prisma.category.findMany()
  let totalAdded = 0

  for (const category of categories) {
    const quizData = category.quizData as { quizzes?: QuizItem[] } | null
    const existingQuizzes = quizData?.quizzes || []
    const existingSlugs = new Set(existingQuizzes.map(q => q.slug))

    // Get new quizzes — hardcoded for insurance, generated for others
    let newQuizzes: QuizItem[] = additionalQuizzes[category.slug] || generateQuizzesForCategory(category.slug)

    // Filter out duplicates
    const quizzesToAdd = newQuizzes.filter(q => !existingSlugs.has(q.slug))

    if (quizzesToAdd.length > 0) {
      const updatedQuizzes = [...existingQuizzes, ...quizzesToAdd]
      await prisma.category.update({
        where: { id: category.id },
        data: {
          quizData: { quizzes: updatedQuizzes } as object
        }
      })
      console.log(`  ${category.slug}: +${quizzesToAdd.length} quizzes (total: ${updatedQuizzes.length})`)
      totalAdded += quizzesToAdd.length
    } else {
      console.log(`  ${category.slug}: no new quizzes needed (has ${existingQuizzes.length})`)
    }
  }

  console.log(`\n✓ Done! Added ${totalAdded} new quizzes across all categories.`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
