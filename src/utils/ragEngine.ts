import { RAGChunk, RAGDocument, RAGSourceCitation } from '../types';

// Built-in verified knowledge chunks sourced from official website https://www.abuad.edu.ng/
export const OFFICIAL_ABUAD_CHUNKS: RAGChunk[] = [
  {
    id: 'abuad-web-general-1',
    docId: 'official-abuad-web',
    docName: 'Official University Overview (https://www.abuad.edu.ng/)',
    sourceType: 'official_abuad_web',
    url: 'https://www.abuad.edu.ng/about-us/',
    keywords: ['afe babalola', 'founder', 'history', 'motto', 'vision', 'mission', 'ranking', 'nuc'],
    text: `Afe Babalola University, Ado-Ekiti (ABUAD), founded in 2009 by legendary Nigerian jurist, legal luminary, and education philanthropist Aare Afe Babalola, SAN, CFR, OFR, LL.D, is a benchmark private university in Nigeria. Located on a sprawling campus in Ado-Ekiti, Ekiti State, ABUAD is structured across 8 Colleges with 100% full accreditation by the National Universities Commission (NUC), COREN, MDCN, NBA/CLE, PCN, and NMCN. Recognized by Times Higher Education as one of Africa's most impactful universities.`,
  },
  {
    id: 'abuad-web-admissions-1',
    docId: 'official-abuad-web',
    docName: 'Undergraduate Admissions Guidelines (https://www.abuad.edu.ng/admissions/)',
    sourceType: 'official_abuad_web',
    url: 'https://admissions.abuad.edu.ng',
    keywords: ['admissions', 'utme', 'cut-off', 'jamb', 'requirements', 'o level', 'screening', 'direct entry'],
    text: `ABUAD Undergraduate Admissions Requirements:
1. UTME Cut-Off Marks: General University cut-off is 180+. Higher competitive benchmarks apply for Law (200+), Engineering (200+), Pharmacy (220+), Nursing (230+), and Medicine & Surgery - MBBS (250+).
2. O'Level Requirements: 5 credit passes at maximum two sittings in WAEC, NECO, NABTEB, or IGCSE, including English Language and Mathematics plus relevant faculty subjects.
3. Application: Prospective candidates purchase application forms and upload credentials online at admissions.abuad.edu.ng.
4. Direct Entry: JUPEB (min 6-12 points depending on course), Cambridge A-Levels, IJMB, or OND/HND/B.Sc.`,
  },
  {
    id: 'abuad-web-fees-1',
    docId: 'official-abuad-web',
    docName: 'Tuition & 50-30-20 Installment Payment Schedule (https://www.abuad.edu.ng/tuition-fees/)',
    sourceType: 'official_abuad_web',
    url: 'https://www.abuad.edu.ng/tuition-fees/',
    keywords: ['tuition', 'fees', 'installment', 'bursary', 'payments', 'cost', 'schedule', 'accommodation'],
    text: `ABUAD Tuition & Flexible Payment Structure:
ABUAD operates an all-inclusive tuition structure that covers modern en-suite on-campus accommodation, 24/7 power & water supply, clinic/medical coverage, ICT access, and entrepreneurship training.
Installment Payment Plan:
- First Installment (50%): Payable upon registration at session commencement.
- Second Installment (30%): Payable before the start of second semester examinations.
- Third Installment (20%): Final balance cleared prior to final session examination clearance.
Payments are processed via authorized bank drafts or secure online portal at portal.abuad.edu.ng.`,
  },
  {
    id: 'abuad-web-medicine-1',
    docId: 'official-abuad-web',
    docName: 'ABUAD Multi-System Hospital & Medical Sciences (https://www.abuad.edu.ng/hospital/)',
    sourceType: 'official_abuad_web',
    url: 'https://www.abuad.edu.ng/hospital/',
    keywords: ['hospital', 'medicine', 'mbbs', 'nursing', 'surgery', 'transplant', 'health', 'clinic', 'dentistry'],
    text: `The 400-Bed ABUAD Multi-System Hospital (AMSH):
Regarded as one of the most technologically advanced tertiary health complexes in West Africa. Features 14 modular surgical theatres, kidney transplant center, open heart cardiac catheterization lab, laser lithotripsy, 1.5 Tesla MRI, 128-slice CT scan, endoscopy units, and emergency triage.
Trains MBBS (Medicine & Surgery), B.N.Sc (Nursing Science), B.MLS (Medical Laboratory Science), Dentistry, Human Anatomy, and Public Health students with hands-on clinical exposure.`,
  },
  {
    id: 'abuad-web-law-1',
    docId: 'official-abuad-web',
    docName: 'College of Law & Aare Afe Babalola Law Complex (https://www.abuad.edu.ng/college-of-law/)',
    sourceType: 'official_abuad_web',
    url: 'https://www.abuad.edu.ng/college-of-law/',
    keywords: ['law', 'llb', 'moot court', 'legal', 'bar', 'aare afe babalola', 'jurisprudence', 'dress code'],
    text: `ABUAD College of Law:
Acknowledged by the Council of Legal Education and NBA as Nigeria's premier Law faculty. Features the iconic Aare Afe Babalola Law Complex, state-of-the-art electronic Moot Courts with real-time digital recording, specialized Law Library, and legal clinics. Offers 5-year LL.B, LL.M, and Ph.D in Law.
Law students adhere to strict professional Black & White dress codes with mandatory attendance at clinical trial simulations.`,
  },
  {
    id: 'abuad-web-engineering-1',
    docId: 'official-abuad-web',
    docName: 'College of Engineering & FESTO Mechatronics Center (https://www.abuad.edu.ng/college-of-engineering/)',
    sourceType: 'official_abuad_web',
    url: 'https://www.abuad.edu.ng/college-of-engineering/',
    keywords: ['engineering', 'mechatronics', 'festo', 'mechanical', 'electrical', 'biomedical', 'aeronautical', 'coren'],
    text: `ABUAD College of Engineering:
Fully accredited by COREN. Houses 38 ultra-modern workshops and laboratories, notably the FESTO Industrial Mechatronics Training Center, aeronautical simulation labs, robotics units, CNC machining centers, and civil/structural testing rigs. Programs include Mechatronics, Mechanical, Electrical/Electronics, Civil, Chemical, Petroleum, Computer, and Biomedical Engineering.`,
  },
  {
    id: 'abuad-web-rules-1',
    docId: 'official-abuad-web',
    docName: 'Campus Life, Dress Code & Residential Regulations (https://www.abuad.edu.ng/campus-life/)',
    sourceType: 'official_abuad_web',
    url: 'https://www.abuad.edu.ng/campus-life/',
    keywords: ['dress code', 'hostel', 'rules', 'regulations', 'discipline', 'curfew', 'hall of residence', 'corporate'],
    text: `ABUAD Student Code of Conduct & Campus Life:
1. 100% Residential Campus: All undergraduate students live on campus in supervised halls of residence (King Samson, King David, Queen Esther, Queen Amina, Moremi Hall) equipped with 24/7 security, power, and laundry.
2. Corporate Dress Code: Strict corporate formal wear from Monday through Thursday. College-specific color codes apply (Law: Black & White; Medicine/Nursing: White; Engineering: Navy/Burgundy).
3. Zero-Tolerance Policies: Absolute zero-tolerance for cultism, illegal substance abuse, examination malpractice, and unapproved off-campus loitering.`,
  },
  {
    id: 'abuad-web-scholarships-1',
    docId: 'official-abuad-web',
    docName: 'Founder\'s Merit Scholarships & Financial Aid (https://www.abuad.edu.ng/scholarships/)',
    sourceType: 'official_abuad_web',
    url: 'https://www.abuad.edu.ng/scholarships/',
    keywords: ['scholarship', 'founder award', 'merit', 'financial aid', 'bursary', 'deans list', 'talent'],
    text: `ABUAD Scholarships & Honors:
1. Founder's UTME Merit Awards: Cash grants of ₦100,000 to ₦500,000 awarded to candidates with outstanding JAMB UTME scores admitted into ABUAD.
2. Dean's Honors List: Annual tuition discounts and scholastic stipends for undergraduate students maintaining a Cumulative GPA of 4.50+ (First Class honors).
3. Talent & Sports Grants: Financial support for exceptional athletes, inventors, and innovators represented at national/international exhibitions through the Talent Discovery Centre (TDC).`,
  },
  {
    id: 'abuad-web-contacts-1',
    docId: 'official-abuad-web',
    docName: 'Official University Directory & Helpdesks (https://www.abuad.edu.ng/contact-us/)',
    sourceType: 'official_abuad_web',
    url: 'https://www.abuad.edu.ng/contact-us/',
    keywords: ['contact', 'email', 'phone', 'admissions desk', 'registrar', 'bursar', 'student affairs', 'ict support'],
    text: `Official ABUAD Contact Information:
- Admissions Desk: admissions@abuad.edu.ng | +234 812 777 2121 / +234 803 852 1193
- Registrar's Office: registrar@abuad.edu.ng | +234 803 440 2425
- Bursary / Fee Enquiries: fees@abuad.edu.ng / bursar@abuad.edu.ng
- Student Affairs: studentaffairs@abuad.edu.ng | +234 805 554 1120
- ICT Helpdesk: ictsupport@abuad.edu.ng / portal@abuad.edu.ng
- ABUAD Multi-System Hospital 24/7 Emergency: hospital@abuad.edu.ng | +234 813 416 0058
- Postal Address: Km 8.5, Afe Babalola Way, P.M.B 5454, Ado-Ekiti, Ekiti State, Nigeria.`,
  },
];

// Helper: Tokenize text into keywords
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

// Local storage keys
const STORAGE_KEY_USER_DOCS = 'abuad_rag_user_docs';

export class RAGEngine {
  // Load uploaded documents from storage
  static getUserDocuments(): RAGDocument[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USER_DOCS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load user RAG docs from storage:', e);
    }
    return [];
  }

  // Save documents to storage
  static saveUserDocuments(docs: RAGDocument[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_USER_DOCS, JSON.stringify(docs));
    } catch (e) {
      console.error('Failed to save user RAG docs:', e);
    }
  }

  // Split text into chunks (~350 to 500 characters)
  static chunkText(docId: string, docName: string, text: string): RAGChunk[] {
    const cleanText = text.trim();
    if (!cleanText) return [];

    // Split by double line breaks or paragraphs
    const paragraphs = cleanText.split(/\n\s*\n/);
    const chunks: RAGChunk[] = [];
    let currentChunk = '';
    let chunkIndex = 1;

    for (const paragraph of paragraphs) {
      if ((currentChunk + '\n' + paragraph).length < 500) {
        currentChunk = currentChunk ? currentChunk + '\n\n' + paragraph : paragraph;
      } else {
        if (currentChunk.trim()) {
          chunks.push({
            id: `${docId}-chunk-${chunkIndex++}`,
            docId,
            docName,
            sourceType: 'uploaded_doc',
            text: currentChunk.trim(),
            keywords: tokenize(currentChunk),
          });
        }
        currentChunk = paragraph;
      }
    }

    if (currentChunk.trim()) {
      chunks.push({
        id: `${docId}-chunk-${chunkIndex++}`,
        docId,
        docName,
        sourceType: 'uploaded_doc',
        text: currentChunk.trim(),
        keywords: tokenize(currentChunk),
      });
    }

    return chunks;
  }

  // Add a new document to the user RAG knowledge base
  static addDocument(
    name: string,
    rawText: string,
    category: RAGDocument['category'] = 'general'
  ): RAGDocument {
    const docId = 'doc-' + Date.now();
    const chunks = this.chunkText(docId, name, rawText);

    const newDoc: RAGDocument = {
      id: docId,
      name,
      sizeBytes: new Blob([rawText]).size,
      uploadedAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      chunksCount: chunks.length,
      rawText,
      category,
      active: true,
    };

    const currentDocs = this.getUserDocuments();
    const updatedDocs = [newDoc, ...currentDocs];
    this.saveUserDocuments(updatedDocs);
    return newDoc;
  }

  // Delete a document
  static deleteDocument(docId: string): void {
    const currentDocs = this.getUserDocuments();
    const updated = currentDocs.filter((d) => d.id !== docId);
    this.saveUserDocuments(updated);
  }

  // Toggle active status
  static toggleDocumentActive(docId: string): void {
    const currentDocs = this.getUserDocuments();
    const updated = currentDocs.map((d) => (d.id === docId ? { ...d, active: !d.active } : d));
    this.saveUserDocuments(updated);
  }

  // Retrieve top-k relevant knowledge chunks for a query
  static queryKnowledge(query: string, topK: number = 4): {
    chunks: RAGChunk[];
    citations: RAGSourceCitation[];
    formattedContext: string;
  } {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) {
      return { chunks: [], citations: [], formattedContext: '' };
    }

    // Collect all searchable chunks: official ABUAD web chunks + active user uploaded chunks
    const allChunks: RAGChunk[] = [...OFFICIAL_ABUAD_CHUNKS];

    const userDocs = this.getUserDocuments().filter((d) => d.active);
    for (const doc of userDocs) {
      const docChunks = this.chunkText(doc.id, doc.name, doc.rawText);
      allChunks.push(...docChunks);
    }

    // Score chunks using TF-IDF / keyword overlap and term density
    const scoredChunks = allChunks.map((chunk) => {
      let score = 0;
      const chunkTextLower = chunk.text.toLowerCase();

      for (const token of queryTokens) {
        if (chunk.keywords.includes(token)) {
          score += 3;
        }
        if (chunkTextLower.includes(token)) {
          score += 1.5;
        }
      }

      // Bonus for exact multi-word match
      if (chunkTextLower.includes(query.toLowerCase().trim())) {
        score += 8;
      }

      // Small bonus for official source credibility
      if (chunk.sourceType === 'official_abuad_web') {
        score += 0.5;
      }

      return { chunk, score };
    });

    // Filter and sort
    const matched = scoredChunks
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((item) => item.chunk);

    // Build citations
    const citations: RAGSourceCitation[] = matched.map((c) => ({
      title: c.docName,
      snippet: c.text.length > 180 ? c.text.slice(0, 180) + '...' : c.text,
      sourceType: c.sourceType,
      docName: c.docName,
      url: c.url,
    }));

    // Build context string for prompt
    let formattedContext = '';
    if (matched.length > 0) {
      formattedContext = matched
        .map(
          (c, idx) =>
            `[Knowledge Snippet ${idx + 1} | Source: ${c.docName} | Type: ${c.sourceType}]\n${c.text}`
        )
        .join('\n\n');
    }

    return {
      chunks: matched,
      citations,
      formattedContext,
    };
  }
}
