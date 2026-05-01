export interface ValidationErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

export const validateProfile = (data: unknown): ValidationResult => {
  const errors: ValidationErrors = {};

  // Mandatory fields
  if (!data.firstName?.trim()) errors.firstName = 'First name is required';
  if (!data.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
  if (!data.gender) errors.gender = 'Gender is required';
  if (!data.religion) errors.religion = 'Community/Religion is required';
  if (!data.city?.trim()) errors.city = 'City is required';
  if (!data.state?.trim()) errors.state = 'State is required';

  // Format validations
  if (data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.dateOfBirth = 'Invalid date of birth';
    } else {
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 18) {
        errors.dateOfBirth = 'User must be at least 18 years old';
      }
    }
  }

  if (data.height) {
    const height = parseFloat(data.height);
    if (isNaN(height) || height < 100 || height > 250) {
      errors.height = 'Height must be a valid number between 100 and 250 cm';
    }
  }

  if (data.annualIncome) {
    // Relaxed validation to allow ranges like "5L - 8L"
    if (typeof data.annualIncome === 'string' && !data.annualIncome.trim()) {
      errors.annualIncome = 'Annual income cannot be empty';
    }
  }

  // Weight (if provided)
  if (data.weight) {
    const weight = parseFloat(data.weight);
    if (isNaN(weight) || weight < 30 || weight > 200) {
      errors.weight = 'Weight must be a valid number between 30 and 200 kg';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export interface SectionStatus {
  title: string;
  percent: number;
  weight: number;
  isComplete: boolean;
}

export interface CompletenessResult {
  total: number;
  sections: {
    basic: SectionStatus;
    personal: SectionStatus;
    education: SectionStatus;
    photos: SectionStatus;
    preferences: SectionStatus;
  };
}

export const calculateCompleteness = (data: unknown): CompletenessResult => {
  const check = (fields: string[]) => {
    const filled = fields.filter(f => {
      const v = data[f];
      return v !== undefined && v !== null && (typeof v === 'string' ? v.trim().length > 0 : true);
    });
    return Math.round((filled.length / fields.length) * 100);
  };

  const sections = {
    basic: {
      title: 'Basic Info',
      weight: 30,
      percent: check(['firstName', 'lastName', 'dateOfBirth', 'gender']),
      isComplete: false,
    },
    personal: {
      title: 'Personal',
      weight: 20,
      percent: check(['religion', 'caste', 'motherTongue', 'maritalStatus', 'bio']),
      isComplete: false,
    },
    education: {
      title: 'Education',
      weight: 15,
      percent: check(['education', 'occupation']),
      isComplete: false,
    },
    photos: {
      title: 'Photos',
      weight: 20,
      percent: data.hasPhotos || (data.photos && data.photos.length > 0) ? 100 : 0,
      isComplete: false,
    },
    preferences: {
      title: 'Location & Prefs',
      weight: 15,
      percent: check(['city', 'state', 'country']),
      isComplete: false,
    },
  };

  sections.basic.isComplete = sections.basic.percent === 100;
  sections.personal.isComplete = sections.personal.percent === 100;
  sections.education.isComplete = sections.education.percent === 100;
  sections.photos.isComplete = sections.photos.percent === 100;
  sections.preferences.isComplete = sections.preferences.percent === 100;

  const total = Math.round(
    (sections.basic.percent * sections.basic.weight +
     sections.personal.percent * sections.personal.weight +
     sections.education.percent * sections.education.weight +
     sections.photos.percent * sections.photos.weight +
     sections.preferences.percent * sections.preferences.weight) / 100
  );

  return { total, sections };
};
