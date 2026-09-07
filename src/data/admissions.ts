import { AdmissionStep, FeeSchedule, Scholarship } from '../types';

export const ADMISSION_STEPS: AdmissionStep[] = [
  {
    stepNumber: 1,
    title: 'JAMB UTME & Choice of Institution',
    shortDesc: 'Register for JAMB UTME and select Afe Babalola University (ABUAD) as 1st Choice.',
    fullDesc: 'Candidates must score a minimum of 180 in the Unified Tertiary Matriculation Examination (UTME). If ABUAD was not initially selected, you can easily effect a Change of Institution to Afe Babalola University on the JAMB portal (jamb.gov.ng).',
    link: 'https://www.jamb.gov.ng',
    actionText: 'Visit JAMB Portal',
    tips: [
      'Score 200+ for Law & Engineering programs.',
      'Score 250+ for Medicine (MBBS) & Pharmacy.',
      'Direct Entry candidates must procure a JAMB DE form with JUPEB, A-Levels, or OND/HND.',
    ],
    timeline: 'January - August annually',
  },
  {
    stepNumber: 2,
    title: 'Complete ABUAD Online Application',
    shortDesc: 'Create an applicant profile and complete the form on admissions.abuad.edu.ng.',
    fullDesc: 'Navigate to the official portal, click "Apply Now", provide your personal information, upload your passport photograph (max 100KB), enter your O\'Level results (WAEC, NECO, NABTEB, IGCSE), and pay the application fee via the secure payment gateway.',
    link: 'https://admissions.abuad.edu.ng',
    actionText: 'Open Admissions Portal',
    tips: [
      'Ensure names on O\'Level, JAMB, and Birth Certificate match precisely.',
      'Awaiting Result (AR) candidates can apply and upload results as soon as released.',
      'Keep your Application Number and password secure.',
    ],
    timeline: 'March - September',
  },
  {
    stepNumber: 3,
    title: 'Post-UTME Screening & Virtual Interview',
    shortDesc: 'Attend the scheduled physical or online virtual screening session.',
    fullDesc: 'ABUAD conducts interactive Post-UTME screening and oral interviews to evaluate communication skills, academic preparedness, and moral aptitude. Screening can be taken online from any part of the world or at designated regional centres (Ado-Ekiti, Lagos, Abuja, Port Harcourt, Warri, Ibadan).',
    tips: [
      'Have original copies of O\'Level result, JAMB slip, and Birth Certificate ready.',
      'Dress formally for the interview.',
      'Virtual screening instructions are sent to your registered email.',
    ],
    timeline: 'Rolling batches starting from May',
  },
  {
    stepNumber: 4,
    title: 'Admission Offer & Acceptance Fee',
    shortDesc: 'Check your admission status and pay the provisional acceptance fee.',
    fullDesc: 'Successful candidates receive an SMS, email notification, and official Provisional Admission Letter on the portal. You are required to log into the portal and pay the acceptance fee within the designated deadline to secure your reserved seat.',
    link: 'https://portal.abuad.edu.ng',
    actionText: 'Check Admission Status',
    tips: [
      'Acceptance fee is non-refundable and counts towards securing your department slot.',
      'Accept your admission offer on JAMB CAPS to enable JAMB Admission Letter printing.',
    ],
    timeline: 'Within 2 weeks of offer notice',
  },
  {
    stepNumber: 5,
    title: 'Tuition Payment & Installment Options',
    shortDesc: 'Pay tuition in full or take advantage of the flexible 3-stage installment plan.',
    fullDesc: 'ABUAD provides a flexible structured installment option to assist parents and sponsors: 50% upon registration (Semester 1), 30% at the start of Semester 2, and 20% prior to final session examinations.',
    tips: [
      'Tuition includes hostel accommodation, health insurance, and vocational training.',
      'Payments must only be processed through the official portal or designated partner bank accounts.',
      'Print official payment receipts from the portal immediately after transaction.',
    ],
    timeline: 'Prior to matriculation & resumption',
  },
  {
    stepNumber: 6,
    title: 'Physical Clearance, Hostel Allocation & Resumption',
    shortDesc: 'Report to campus for document verification, room key collection, and orientation.',
    fullDesc: 'Upon arrival at the main campus in Ado-Ekiti, report to the Senate Building for clearance, undergo medical test at the ABUAD Health Centre, receive your smart identity card, and collect your room keys at your assigned Hall of Residence.',
    tips: [
      'Bring 8 recent passport photographs and physical copies of all credentials.',
      'Pack formal dress code attire (business suits, corporate shirts, ties, formal shoes).',
      'Attend the Freshers Orientation Week and Matriculation Ceremony.',
    ],
    timeline: 'September - October resumption',
  },
];

export const FEE_SCHEDULES: FeeSchedule[] = [
  {
    collegeName: 'College of Medicine & Surgery (MBBS)',
    degree: 'MBBS (6 Years)',
    tuitionPerSession: 4200000,
    installment1: 2100000, // 50%
    installment2: 1260000, // 30%
    installment3: 840000,  // 20%
    includes: ['En-suite Hostel Accommodation', 'Teaching Hospital Clinical Fees', 'Medical Insurance', 'ICT & Wi-Fi', 'Anatomy Dissection Lab Fees', 'Entrepreneurship Certification'],
  },
  {
    collegeName: 'College of Law',
    degree: 'LL.B (5 Years)',
    tuitionPerSession: 2600000,
    installment1: 1300000,
    installment2: 780000,
    installment3: 520000,
    includes: ['Hostel Accommodation', 'Law Library & Electronic Databases', 'Moot Court Training', 'Medical Care', 'ICT Access', 'Bar Vocational Modules'],
  },
  {
    collegeName: 'College of Pharmacy',
    degree: 'Pharm.D (6 Years)',
    tuitionPerSession: 2800000,
    installment1: 1400000,
    installment2: 840000,
    installment3: 560000,
    includes: ['Hostel Accommodation', 'Pharmaceutical Lab Consumables', 'Clinical Hospital Rotations', 'Medical Care', 'ICT Access'],
  },
  {
    collegeName: 'College of Engineering',
    degree: 'B.Eng (5 Years) - Mechatronics, Mechanical, Aeronautical',
    tuitionPerSession: 1950000,
    installment1: 975000,
    installment2: 585000,
    installment3: 390000,
    includes: ['Hostel Accommodation', 'FESTO Mechatronics Industrial Training', 'Engineering Workshop Labs', 'Medical Insurance', 'ICT Access'],
  },
  {
    collegeName: 'College of Sciences (Computer Science, Cybersecurity)',
    degree: 'B.Sc (4 Years)',
    tuitionPerSession: 1650000,
    installment1: 825000,
    installment2: 495000,
    installment3: 330000,
    includes: ['Hostel Accommodation', 'High-Speed Computer Labs', 'Cloud Computing Subscriptions', 'Medical Insurance', 'ICT Access'],
  },
  {
    collegeName: 'College of Social & Management Sciences',
    degree: 'B.Sc (4 Years) - Accounting, Economics, Int\'l Relations',
    tuitionPerSession: 1350000,
    installment1: 675000,
    installment2: 405000,
    installment3: 270000,
    includes: ['Hostel Accommodation', 'Business Simulation Software', 'Professional Certification Classes (ICAN/ACCA)', 'Medical Care', 'ICT Access'],
  },
  {
    collegeName: 'College of Agriculture',
    degree: 'B.Agric (5 Years)',
    tuitionPerSession: 950000,
    installment1: 475000,
    installment2: 285000,
    installment3: 190000,
    includes: ['Hostel Accommodation', 'Hands-on Farm Practical Materials', 'Agribusiness Incubation', 'Medical Care', 'ICT Access'],
  },
];

export const SCHOLARSHIPS_DATA: Scholarship[] = [
  {
    id: 'founders-merit',
    title: 'Aare Afe Babalola Founder\'s Merit Award',
    amount: '₦100,000 to Full Tuition',
    category: 'merit',
    eligibility: 'Applicants with UTME scores of 280+ (Medicine/Law) or 260+ (Engineering/Sciences) who demonstrate exceptional academic records in O\'Levels.',
    deadline: 'August 31 annually',
    description: 'Prestigious scholarship awarded directly by the Founder to reward brilliant minds and encourage academic distinction across all colleges.',
  },
  {
    id: 'deans-honor-list',
    title: 'University Dean\'s Honor List & 1st Class Scholastic Grant',
    amount: '₦250,000 - ₦500,000 per academic year',
    category: 'deans_list',
    eligibility: 'Currently enrolled undergraduate students maintaining a Cumulative Grade Point Average (CGPA) of 4.50 and above (First Class Honors).',
    deadline: 'Disbursed automatically at session conclusion',
    description: 'Annual academic performance incentive credited directly towards the recipient\'s tuition account to foster sustained excellence.',
  },
  {
    id: 'sports-talent',
    title: 'ABUAD Sports & Creative Talent Scholarship',
    amount: '50% Tuition Waiver',
    category: 'sports',
    eligibility: 'Students representing the University at NUGA, West African University Games (WAUG), or possessing proven national athletic/artistic accolades.',
    deadline: 'October 15 annually',
    description: 'Designed to support outstanding athletes, musicians, and innovators balancing rigorous academic pursuits with national athletic representation.',
  },
  {
    id: 'indigent-grant',
    title: 'Aare Afe Babalola Indigent & Hardship Support Fund',
    amount: 'Variable need-based assistance',
    category: 'indigent',
    eligibility: 'Students facing unforeseen financial distress, loss of primary sponsor, or from verified disadvantaged socio-economic backgrounds.',
    deadline: 'Rolling application via Student Affairs',
    description: 'Compassionate financial assistance established to ensure that no qualified student drops out of ABUAD due to genuine financial hardship.',
  },
];

export const APPLICATION_CHECKLIST = [
  { id: 'c1', label: 'JAMB UTME Registration Slip with ABUAD selected', required: true },
  { id: 'c2', label: 'Original JAMB UTME Result Slip (Score 180+)', required: true },
  { id: 'c3', label: 'O\'Level Certificate or Statement of Result (WAEC/NECO/NABTEB/IGCSE)', required: true },
  { id: 'c4', label: 'Birth Certificate or Statutory Declaration of Age', required: true },
  { id: 'c5', label: 'Letter of Attestation / Reference from Secondary School Principal or Clergy', required: true },
  { id: 'c6', label: 'Certificate of State of Origin or Local Government Identification', required: false },
  { id: 'c7', label: '8 Passport Photographs on Red Background (Standard 2x2 inch)', required: true },
  { id: 'c8', label: 'ABUAD Online Application Confirmation Slip & Screening Summary', required: true },
  { id: 'c9', label: 'Medical Fitness Certificate (Completed at ABUAD Health Centre)', required: true },
];
