
/**
 * Converts height from Feet and Inches to Centimeters
 */
export const feetToCm = (feet: number, inches: number = 0): number => {
  const totalInches = (feet * 12) + inches;
  return Math.round(totalInches * 2.54);
};

/**
 * Converts height from Centimeters to Feet and Inches
 */
export const cmToFeetInches = (cm: number): { feet: number, inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  
  // Handle case where inches round up to 12
  if (inches === 12) {
    return { feet: feet + 1, inches: 0 };
  }
  
  return { feet, inches };
};

/**
 * Formats height from CM to a readable string (e.g. 5'7")
 */
export const formatHeight = (cm: number | null | undefined): string => {
  if (!cm) return 'N/A';
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet}'${inches}"`;
};

/**
 * Array of heights for dropdowns (from 4'0" to 7'0")
 */
export const HEIGHT_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const totalInches = 48 + i; // Start from 4 feet (48 inches)
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  const cm = Math.round(totalInches * 2.54);
  return {
    label: `${feet}'${inches}" (${cm} cm)`,
    value: cm.toString()
  };
});
