import type { ThemeConfig } from 'antd';
import { theme as antdTheme } from 'antd';
import { colors } from './tokens/colors';
import { fontFamilies, fontSizes, borderRadius } from './tokens/typography';

export const darkTheme: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    // Brand
    colorPrimary:          colors.primary[500],
    colorPrimaryHover:     colors.primary[400],
    colorPrimaryActive:    colors.primary[600],
    colorPrimaryBorder:    colors.primary[700],
    colorPrimaryBg:        '#1a2744',
    colorPrimaryBgHover:   '#1e2f52',
    colorPrimaryText:      colors.primary[400],
    colorPrimaryTextHover: colors.primary[300],

    // Semantic
    colorSuccess:  colors.success[400],
    colorWarning:  colors.warning[400],
    colorError:    colors.danger[400],
    colorInfo:     colors.primary[400],

    // Background
    colorBgBase:         colors.neutral[950],
    colorBgContainer:    colors.neutral[900],
    colorBgLayout:       colors.neutral[950],
    colorBgElevated:     colors.neutral[800],
    colorBgSpotlight:    colors.neutral[800],

    // Text
    colorText:            colors.neutral[100],
    colorTextSecondary:   colors.neutral[300],
    colorTextTertiary:    colors.neutral[500],
    colorTextDisabled:    colors.neutral[600],
    colorTextHeading:     '#ffffff',
    colorTextBase:        colors.neutral[200],

    // Border
    colorBorder:          colors.neutral[700],
    colorBorderSecondary: colors.neutral[800],
    colorSplit:           colors.neutral[800],

    // Fill
    colorFill:            colors.neutral[800],
    colorFillSecondary:   colors.neutral[900],
    colorFillTertiary:    colors.neutral[900],
    colorFillQuaternary:  '#111827',

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
    colorLink:        colors.primary[400],
    colorLinkHover:   colors.primary[300],
    colorLinkActive:  colors.primary[500],
    boxShadow:        '0 1px 3px 0 rgb(0 0 0 / 0.4)',
    boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.4)',
  },
  components: {
    Layout: {
      siderBg:     colors.neutral[950],
      headerBg:    colors.neutral[900],
      bodyBg:      colors.neutral[950],
      triggerBg:   colors.neutral[800],
      triggerColor: colors.neutral[300],
    },
    Menu: {
      darkItemBg:           colors.neutral[950],
      darkSubMenuItemBg:    colors.neutral[900],
      darkItemSelectedBg:   colors.primary[800],
      darkItemColor:        colors.neutral[400],
      darkItemHoverColor:   '#ffffff',
      darkItemSelectedColor: '#ffffff',
    },
    Card: {
      headerBg:  'transparent',
      colorBgContainer: colors.neutral[900],
    },
    Table: {
      headerBg:         colors.neutral[800],
      headerColor:      colors.neutral[300],
      rowHoverBg:       colors.neutral[800],
      borderColor:      colors.neutral[700],
    },
    Button: {
      primaryShadow: 'none',
    },
    Input: {
      activeBorderColor: colors.primary[500],
      hoverBorderColor:  colors.primary[400],
      colorBgContainer:  colors.neutral[800],
    },
  },
};
