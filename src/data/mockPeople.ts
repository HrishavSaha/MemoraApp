// Shared PoC identities so the Patient and Caretaker screens reference the
// same mock people consistently instead of drifting apart.

export const CARETAKER = {
  name: 'Priya Devi',
  phone: '+919876543210',
};

// Matches the doctor name already used in the seed appointment data below,
// so the same person shows up consistently whether viewed from the patient,
// caretaker, or doctor's own login.
export const DOCTOR = {
  name: 'Dr. Anjali Sharma',
  specialty: 'Neurologist',
};

export type MockPatient = {
  id: string;
  name: string;
  avatarInitial: string;
  condition: string;
  streak: number;
  lastActive: string;
  weeklyActiveHours: number;
  /** Days since the patient last opened the app — drives priority sorting. */
  daysSinceActive: number;
  /** 1 = mild/early stage, 2 = moderate, 3 = severe — drives priority sorting. */
  severity: 1 | 2 | 3;
};

export const PATIENTS: MockPatient[] = [
  {
    id: '1',
    name: 'Anita Devi',
    avatarInitial: 'A',
    condition: 'Early-stage Alzheimer’s',
    streak: 7,
    lastActive: 'Active today',
    weeklyActiveHours: 9.5,
    daysSinceActive: 0,
    severity: 1,
  },
  {
    id: '2',
    name: 'Ramesh Gogoi',
    avatarInitial: 'R',
    condition: 'Mild cognitive impairment',
    streak: 3,
    lastActive: 'Active yesterday',
    weeklyActiveHours: 4,
    daysSinceActive: 1,
    severity: 1,
  },
  {
    id: '3',
    name: 'Sunita Baruah',
    avatarInitial: 'S',
    condition: 'Moderate-stage dementia',
    streak: 0,
    lastActive: 'Inactive for 2 days',
    weeklyActiveHours: 0.5,
    daysSinceActive: 2,
    severity: 2,
  },
];

export type PatientPriority = 'high' | 'medium' | 'low';

const PRIORITY_RANK: Record<PatientPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/**
 * A patient needs urgent attention if they've gone quiet for 2+ days or have
 * broken their streak entirely; a single missed day or a more advanced
 * condition stage warrants a check-in; otherwise things look fine.
 */
export function getPatientPriority(patient: MockPatient): PatientPriority {
  if (patient.daysSinceActive >= 2 || patient.streak === 0) {
    return 'high';
  }
  if (patient.daysSinceActive >= 1 || patient.severity >= 2) {
    return 'medium';
  }
  return 'low';
}

export function sortPatientsByPriority(patients: MockPatient[]): MockPatient[] {
  return [...patients].sort((a, b) => {
    const rankDiff =
      PRIORITY_RANK[getPatientPriority(a)] -
      PRIORITY_RANK[getPatientPriority(b)];
    if (rankDiff !== 0) {
      return rankDiff;
    }
    return b.daysSinceActive - a.daysSinceActive;
  });
}
