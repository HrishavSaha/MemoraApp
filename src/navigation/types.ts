export type RootStackParamList = {
  Splash: undefined;
  Localisation: { fromSettings?: boolean } | undefined;
  RoleSelection: undefined;
  PatientHome: undefined;
  TilePatternGame: undefined;
  CaretakerHome: undefined;
  CaretakerCallHistory: undefined;
  CaretakerPatientDetail: { patientId: string };
  DoctorHome: undefined;
  DoctorPastAppointments: undefined;
  DoctorPatientDetail: { patientId: string };
  Settings: undefined;
};
