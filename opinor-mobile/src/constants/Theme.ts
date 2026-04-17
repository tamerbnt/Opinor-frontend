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
    pPurple: '#F3E8FF',
    pYellow: '#FEF3C7', // New pastel for reminders
    pOrange: '#FFEDD5', // New pastel for urgent alerts
    pageBg: '#F8FAFC',    // Light off-white for card contrast
    text: '#111827',
    textSecondary: '#6B7280',
    error: '#EF4444'
  },
  dark: {
    white: '#FFFFFF',
    dark: '#16191E', // In Dark Mode, 'dark' is the main charcoal background
    blue: '#42D599',
    brique: '#D9534F',
    sombreCards: '#2A2D31', // The explicitly named dark card background
    green: '#2ECC71',
    grisLight: '#1A1D21',
    darkishCard: '#1A2024',
    pGreen: '#065F46', 
    pRed: '#991B1B',
    pBlue: '#1E40AF',
    pPurple: '#6B21A8',
    pYellow: '#78350F',
    pOrange: '#7C2D12',
    pageBg: '#16191E',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    error: '#EF4444' // Using same vivid red for dark mode unless business demands deeper red
  }
};

export const Radii = {
  pill: 999,
  sheet: 30, // Extracted from Bottom Sheet modals
  button: 20, // Extracted from Primary actions
  input: 15, // Extracted from text inputs
  card: 11, // Extracted from metric tiles (10.99px)
};
