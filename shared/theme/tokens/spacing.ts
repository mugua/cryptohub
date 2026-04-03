/** Base unit: 4px */
export const spacing = {
  0:    0,
  0.5:  2,
  1:    4,
  1.5:  6,
  2:    8,
  2.5:  10,
  3:    12,
  3.5:  14,
  4:    16,
  5:    20,
  6:    24,
  7:    28,
  8:    32,
  9:    36,
  10:   40,
  11:   44,
  12:   48,
  14:   56,
  16:   64,
  20:   80,
  24:   96,
  28:   112,
  32:   128,
  36:   144,
  40:   160,
  48:   192,
  56:   224,
  64:   256,
} as const;

export const borderRadius = {
  none: '0px',
  sm:   '2px',
  base: '4px',
  md:   '6px',
  lg:   '8px',
  xl:   '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const;

export const shadows = {
  none:  'none',
  sm:    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base:  '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md:    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg:    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl:    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

/** Tailwind-compatible breakpoints in px */
export const breakpoints = {
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
  '2xl': 1536,
} as const;

export const zIndex = {
  hide:    -1,
  auto:    'auto',
  base:    0,
  raised:  1,
  dropdown: 1000,
  sticky:  1100,
  overlay: 1200,
  modal:   1300,
  popover: 1400,
  toast:   1500,
  tooltip: 1600,
} as const;
