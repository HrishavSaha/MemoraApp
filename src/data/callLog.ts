export type CallDirection = 'outgoing' | 'incoming' | 'missed';

export type CallLogEntry = {
  id: string;
  patientId: string;
  patientName: string;
  direction: CallDirection;
  dateTime: string;
  duration: string;
};

export const CALL_LOG: CallLogEntry[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Anita Devi',
    direction: 'outgoing',
    dateTime: 'Today · 8:42 AM',
    duration: '3m 12s',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Ramesh Gogoi',
    direction: 'missed',
    dateTime: 'Yesterday · 6:05 PM',
    duration: '',
  },
  {
    id: '3',
    patientId: '1',
    patientName: 'Anita Devi',
    direction: 'incoming',
    dateTime: 'Yesterday · 9:14 AM',
    duration: '1m 47s',
  },
  {
    id: '4',
    patientId: '3',
    patientName: 'Sunita Baruah',
    direction: 'outgoing',
    dateTime: 'Mon, 15 Sep · 4:20 PM',
    duration: '5m 03s',
  },
];
