interface Project {
  id: string;
  title: string;
  status: string;
  classification: string;
  objective: string;
  statusDescription: string;
  techStack: string[];
  demoUrl?: string;
  codeUrl?: string;
  docsUrl?: string;
  statusUrl?: string;
  isRedacted: boolean;
  caseStudy?: {
    title: string;
    sections: CaseStudySection[];
  };
}

interface CaseStudySection {
  title: string;
  content: string;
}

export { type Project, type CaseStudySection };
