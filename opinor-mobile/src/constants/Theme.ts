/**
 * The 100% Figma-compliant Color Dictionary.
 * We strictly use the variable names provided in the Figma style sheet.
 */
export const Colors = {
  light: {
    white: '#FFFFFF',
    dark: '#111827', // Corrected: Dark text color for light mode
    blue: '#038788',
    brique: '#D9534F',
    sombreCards: '#FFFFFF', // Cards in lightmode are white with elevation
    green: '#2ECC71',
    grisLight: '#F0F0F0', // Input borders/bgs
    darkishCard: '#F4F5F7',
    pGreen: '#DCFCE7', // Pastoral / Metrics colors
    pRed: '#FEE2E2',
    pBlue: '#DBEAFE',
    pPurple: '#F3E8FF'
  },
  dark: {
    white: '#FFFFFF',
    dark: '#16191E', // In Dark Mode, 'dark' is the main charcoal background
    blue: '#038788',
    brique: '#D9534F',
    sombreCards: '#2A2D31', // The explicitly named dark card background
    green: '#2ECC71',
    grisLight: '#1A1D21',
    darkishCard: '#1A2024',
    pGreen: '#065F46', 
    pRed: '#991B1B',
    pBlue: '#1E40AF',
    pPurple: '#6B21A8'
  }
};

export const Radii = {
  pill: 999,
  sheet: 30, // Extracted from Bottom Sheet modals
  button: 20, // Extracted from Primary actions
  input: 15, // Extracted from text inputs
  card: 11, // Extracted from metric tiles (10.99px)
};
