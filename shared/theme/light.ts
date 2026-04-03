import type { ThemeConfig } from 'antd';
import { colors } from './tokens/colors';
import { fontFamilies, fontSizes, borderRadius } from './tokens/typography';

export const lightTheme: ThemeConfig = {
  token: {
    // Brand
    colorPrimary:          colors.primary[500],
    colorPrimaryHover:     colors.primary[400],
    colorPrimaryActive:    colors.primary[600],
    colorPrimaryBorder:    colors.primary[300],
    colorPrimaryBg:        colors.primary[50],
    colorPrimaryBgHover:   colors.primary[100],
    colorPrimaryText:      colors.primary[600],
    colorPrimaryTextHover: colors.primary[500],

    // Semantic
    colorSuccess:  colors.success[500],
    colorWarning:  colors.warning[500],
    colorError:    colors.danger[500],
    colorInfo:     colors.primary[500],

    // Background
    colorBgBase:         '#ffffff',
    colorBgContainer:    '#ffffff',
    colorBgLayout:       colors.neutral[50],
    colorBgElevated:     '#ffffff',
    colorBgSpotlight:    colors.neutral[100],

    // Text
    colorText:            colors.neutral[900],
    colorTextSecondary:   colors.neutral[600],
    colorTextTertiary:    colors.neutral[400],
    colorTextDisabled:    colors.neutral[300],
    colorTextHeading:     colors.neutral[900],
    colorTextBase:        colors.neutral[800],

    // Border
    colorBorder:          colors.neutral[200],
    colorBorderSecondary: colors.neutral[100],
    colorSplit:           colors.neutral[100],

    // Fill
    colorFill:            colors.neutral[100],
    colorFillSecondary:   colors.neutral[50],
    colorFillTertiary:    colors.neutral[50],
    colorFillQuaternary:  '#f0f4ff',

    // Typography
    fontFamily:     fontFamilies.sans,
    fontFamilyCode: fontFamilies.mono,
    fontSize:       fontSizes.base,
    fontSizeSM:     fontSizes.sm,
    fontSizeLG:     fontSizes.lg,
    fontSizeXL:     fontSizes.xl,
    fontSizeHeading1: fontSizes['4xl'],
    fontSizeHeading2: fontSizes['3xl'],
    fontSizeHeading3: fontSizes['2xl'],
    fontSizeHeading4: fontSizes.xl,
    fontSizeHeading5: fontSizes.lg,

    // Spacing & shape
    borderRadius:   parseInt(borderRadius.md),
    borderRadiusLG: parseInt(borderRadius.lg),
    borderRadiusSM: parseInt(borderRadius.sm),
    borderRadiusXS: parseInt(borderRadius.sm),

    // Motion
    motionDurationFast:  '0.1s',
    motionDurationMid:   '0.2s',
    motionDurationSlow:  '0.3s',

    // Misc
    wireframe: false,
    colorLink:        colors.primary[600],
    colorLinkHover:   colors.primary[500],
    colorLinkActive:  colors.primary[700],
    boxShadow:        '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
  components: {
    Layout: {
      siderBg:     colors.neutral[900],
      headerBg:    '#ffffff',
      bodyBg:      colors.neutral[50],
      triggerBg:   colors.neutral[800],
      triggerColor: '#ffffff',
    },
    Menu: {
      darkItemBg:           colors.neutral[900],
      darkSubMenuItemBg:    colors.neutral[800],
      darkItemSelectedBg:   colors.primary[700],
      darkItemColor:        colors.neutral[300],
      darkItemHoverColor:   '#ffffff',
      darkItemSelectedColor: '#ffffff',
    },
    Card: {
      headerBg:  'transparent',
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
    Table: {
      headerBg:         colors.neutral[50],
      headerColor:      colors.neutral[600],
      rowHoverBg:       colors.neutral[50],
      borderColor:      colors.neutral[200],
    },
    Button: {
      primaryShadow: 'none',
    },
    Input: {
      activeBorderColor: colors.primary[500],
      hoverBorderColor:  colors.primary[400],
    },
  },
};
