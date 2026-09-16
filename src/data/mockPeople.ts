// Shared PoC identities so the Patient and Caretaker screens reference the
// same mock people consistently instead of drifting apart.

export const CARETAKER = {
  name: 'Priya Devi',
  phone: '+919876543210',
};

export type MockPatient = {
  id: string;
  name: string;
  avatarInitial: string;
  condition: string;
  streak: number;
  lastActive: string;
  weeklyActiveHours: number;
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
  },
  {
    id: '2',
    name: 'Ramesh Gogoi',
    avatarInitial: 'R',
    condition: 'Mild cognitive impairment',
    streak: 3,
    lastActive: 'Active yesterday',
    weeklyActiveHours: 4,
  },
  {
    id: '3',
    name: 'Sunita Baruah',
    avatarInitial: 'S',
    condition: 'Moderate-stage dementia',
    streak: 0,
    lastActive: 'Inactive for 2 days',
    weeklyActiveHours: 0.5,
  },
];
