export type RootStackParamList = {
  Splash: undefined;
  Localisation: { fromSettings?: boolean } | undefined;
  RoleSelection: undefined;
  PatientHome: undefined;
  CaretakerHome: undefined;
  CaretakerCallHistory: undefined;
  CaretakerPatientDetail: { patientId: string };
  Settings: undefined;
};
