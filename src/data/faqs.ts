export interface FAQItem {
  id: string;
  category: 'admissions' | 'fees' | 'hostels' | 'rules' | 'academics' | 'facilities';
  question: string;
  answer: string;
  tags: string[];
}

export const FAQS_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'admissions',
    question: 'Can I apply to ABUAD if I did not choose Afe Babalola University during JAMB UTME?',
    answer: 'Yes, absolutely! You can apply directly on admissions.abuad.edu.ng. However, to formalize your admission on JAMB CAPS, you will simply log into the JAMB portal (jamb.gov.ng) or visit any accredited CBT Centre to effect a "Change of Institution" making Afe Babalola University your first choice.',
    tags: ['jamb', 'change of institution', 'first choice'],
  },
  {
    id: 'faq-2',
    category: 'admissions',
    question: 'Does ABUAD accept Awaiting Results (AR) for O\'Level candidates?',
    answer: 'Yes. Candidates awaiting WAEC, NECO, NABTEB, or Cambridge results are eligible to apply and attend the Post-UTME screening. You must indicate "Awaiting Result" in the online form and upload the official grades as soon as the examination body releases them.',
    tags: ['awaiting result', 'waec', 'neco'],
  },
  {
    id: 'faq-3',
    category: 'fees',
    question: 'Can tuition fees at ABUAD be paid in installments?',
    answer: 'Yes! ABUAD provides a convenient three-tier installment schedule: 50% upon first semester registration, 30% at the start of the second semester, and the final 20% prior to final examination clearance. This covers accommodation, medical care, and ICT infrastructure.',
    tags: ['installments', 'tuition', 'payment plan'],
  },
  {
    id: 'faq-4',
    category: 'hostels',
    question: 'Is accommodation compulsory on campus for all undergraduate students?',
    answer: 'Yes. Afe Babalola University is a 100% fully residential campus. All undergraduate students are allocated comfortable, en-suite rooms (2-bed and 4-bed configurations) inside gated, secure halls of residence with 24/7 power, water, Wi-Fi, and resident hall wardens.',
    tags: ['hostels', 'accommodation', 'residential'],
  },
  {
    id: 'faq-5',
    category: 'rules',
    question: 'What is the official dress code policy at Afe Babalola University?',
    answer: 'ABUAD enforces a strict corporate and professional dress code Monday through Thursday from 8:00 AM to 5:00 PM. Male students wear corporate shirts with ties and trousers; female students wear corporate dresses or skirts below knee-length with formal blouses. Friday permits neat traditional or smart casual attire. Additionally, each college maintains specific color themes (e.g., Black & White for Law, All-White for Medicine & Nursing, Burgundy/Navy for Engineering).',
    tags: ['dress code', 'rules', 'attire', 'corporate'],
  },
  {
    id: 'faq-6',
    category: 'academics',
    question: 'What is the minimum class attendance required to write semester exams?',
    answer: 'In line with university academic regulations, students must achieve a minimum of 75% lecture and laboratory attendance in each registered course to be eligible to sit for semester examinations.',
    tags: ['attendance', 'exams', 'regulations'],
  },
  {
    id: 'faq-7',
    category: 'facilities',
    question: 'What recreational and sports facilities are available to students?',
    answer: 'ABUAD offers exceptional recreation, including the Talent Discovery Centre (with a 6-lane bowling alley, cinema, and music recording studio), an Olympic swimming pool, synthetic athletic tracks, FIFA-grade football pitch, tennis, basketball, and volleyball courts, as well as a fully equipped gymnasium.',
    tags: ['sports', 'recreation', 'bowling', 'gym', 'pool'],
  },
  {
    id: 'faq-8',
    category: 'facilities',
    question: 'What healthcare services are accessible to students?',
    answer: 'All enrolled students are covered under the university medical insurance scheme. They have round-the-clock access to the Student Health Centre for outpatient care and the ultra-modern 400-bed ABUAD Multi-System Hospital for specialized diagnostic and surgical services.',
    tags: ['hospital', 'health centre', 'insurance', 'medical'],
  },
];
