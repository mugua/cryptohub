import type { ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#F0B90B',
    colorBgBase: '#0B0E11',
    colorBgContainer: '#1E2329',
    colorBgElevated: '#2B3139',
    colorBgLayout: '#0B0E11',
    colorText: '#EAECEF',
    colorTextSecondary: '#848E9C',
    colorBorder: '#2B3139',
    colorBorderSecondary: '#2B3139',
    colorSuccess: '#0ECB81',
    colorError: '#F6465D',
    colorWarning: '#F0B90B',
    borderRadius: 8,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Layout: {
      siderBg: '#1E2329',
      headerBg: '#1E2329',
      bodyBg: '#0B0E11',
      triggerBg: '#2B3139',
    },
    Menu: {
      darkItemBg: '#1E2329',
      darkItemSelectedBg: '#2B3139',
      darkItemHoverBg: '#2B3139',
      darkItemSelectedColor: '#F0B90B',
      darkItemColor: '#848E9C',
    },
    Card: {
      colorBgContainer: '#1E2329',
      colorBorderSecondary: '#2B3139',
    },
    Table: {
      colorBgContainer: '#1E2329',
      headerBg: '#2B3139',
      rowHoverBg: '#2B3139',
      borderColor: '#2B3139',
    },
    Modal: {
      contentBg: '#1E2329',
      headerBg: '#1E2329',
    },
    Drawer: {
      colorBgElevated: '#1E2329',
    },
    Input: {
      colorBgContainer: '#2B3139',
      colorBorder: '#2B3139',
    },
    Select: {
      colorBgContainer: '#2B3139',
      colorBorder: '#2B3139',
    },
    InputNumber: {
      colorBgContainer: '#2B3139',
      colorBorder: '#2B3139',
    },
    Button: {
      colorBgContainer: '#2B3139',
    },
    Segmented: {
      itemSelectedBg: '#F0B90B',
      itemSelectedColor: '#0B0E11',
    },
  },
};

export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#F0B90B',
    colorSuccess: '#0ECB81',
    colorError: '#F6465D',
    colorWarning: '#F0B90B',
    borderRadius: 8,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
};
