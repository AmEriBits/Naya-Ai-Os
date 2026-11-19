export type SignupDraft =
  | {
      role: "household";
      email: string;
      password: string;
      householdName: string;
      serviceArea: string;
      familySize: string;
    }
  | {
      role: "vendor";
      email: string;
      password: string;
      contactName: string;
      phone: string;
      businessName: string;
      serviceArea: string;
      category: string;
    };
