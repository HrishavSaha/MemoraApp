export type MocaDomain =
  | 'visuospatial'
  | 'attention'
  | 'abstraction'
  | 'orientation'
  | 'recall';

export const MOCA_DOMAINS: MocaDomain[] = [
  'visuospatial',
  'attention',
  'abstraction',
  'orientation',
  'recall',
];

export const MOCA_DOMAIN_MAX: Record<MocaDomain, number> = {
  visuospatial: 5,
  attention: 6,
  abstraction: 2,
  orientation: 6,
  recall: 5,
};

export const MOCA_MAX_TOTAL = MOCA_DOMAINS.reduce(
  (sum, domain) => sum + MOCA_DOMAIN_MAX[domain],
  0,
);

export type MocaAssessment = {
  date: string;
  scores: Record<MocaDomain, number>;
  totalScore: number;
  responseTimeSec: number;
  accuracy: number;
  uploadedBy: string;
};

function assessment(
  date: string,
  scores: Record<MocaDomain, number>,
  responseTimeSec: number,
  accuracy: number,
  uploadedBy: string,
): MocaAssessment {
  const totalScore = MOCA_DOMAINS.reduce(
    (sum, domain) => sum + scores[domain],
    0,
  );
  return { date, scores, totalScore, responseTimeSec, accuracy, uploadedBy };
}

// Oldest first, latest last — the two most recent appointments' assessments.
const SEED_MOCA: Record<string, MocaAssessment[]> = {
  '1': [
    assessment(
      'Mon, 25 Aug',
      {
        visuospatial: 3,
        attention: 4,
        abstraction: 1,
        orientation: 4,
        recall: 2,
      },
      52,
      71,
      'Dr. Anjali Sharma',
    ),
    assessment(
      'Mon, 22 Sep',
      {
        visuospatial: 4,
        attention: 5,
        abstraction: 2,
        orientation: 5,
        recall: 3,
      },
      39,
      84,
      'Dr. Anjali Sharma',
    ),
  ],
  '2': [
    assessment(
      'Thu, 21 Aug',
      {
        visuospatial: 4,
        attention: 5,
        abstraction: 2,
        orientation: 5,
        recall: 3,
      },
      44,
      80,
      'Dr. Anjali Sharma',
    ),
    assessment(
      'Thu, 4 Sep',
      {
        visuospatial: 3,
        attention: 4,
        abstraction: 1,
        orientation: 5,
        recall: 2,
      },
      53,
      68,
      'Dr. Anjali Sharma',
    ),
  ],
  '3': [
    assessment(
      'Tue, 12 Aug',
      {
        visuospatial: 3,
        attention: 4,
        abstraction: 1,
        orientation: 4,
        recall: 2,
      },
      50,
      74,
      'Dr. Anjali Sharma',
    ),
    assessment(
      'Fri, 5 Sep',
      {
        visuospatial: 2,
        attention: 2,
        abstraction: 0,
        orientation: 3,
        recall: 1,
      },
      68,
      48,
      'Dr. Anjali Sharma',
    ),
  ],
};

export function getMocaAssessments(patientId: string): MocaAssessment[] {
  return SEED_MOCA[patientId] ?? [];
}
