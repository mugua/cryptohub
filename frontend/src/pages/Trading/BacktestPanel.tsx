import React, { useState } from 'react';
import {
  Drawer,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Divider,
  Statistic,
  Row,
  Col,
  Typography,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { STRATEGY_TYPES } from '../../utils/constants';

const { RangePicker } = DatePicker;

interface BacktestPanelProps {
  open: boolean;
  onClose: () => void;
}

const BacktestPanel: React.FC<BacktestPanelProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [hasResult, setHasResult] = useState(false);

  return (
    <Drawer
      title={t('trading.backtestTitle')}
      open={open}
      onClose={onClose}
      width={480}
    >
      <div style={{ marginBottom: 16 }}>
        <Typography.Text type="secondary">{t('trading.selectStrategy')}</Typography.Text>
        <Select
          style={{ width: '100%', marginTop: 4 }}
          options={STRATEGY_TYPES.map((s) => ({ value: s.value, label: s.label }))}
          placeholder={t('trading.selectStrategy')}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Text type="secondary">{t('trading.dateRange')}</Typography.Text>
        <RangePicker style={{ width: '100%', marginTop: 4 }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Text type="secondary">{t('trading.initialCapital')} (USDT)</Typography.Text>
        <InputNumber
          style={{ width: '100%', marginTop: 4 }}
          defaultValue={10000}
          min={100}
          step={100}
        />
      </div>
      <Button
        type="primary"
        block
        onClick={() => setHasResult(true)}
      >
        {t('trading.runBacktest')}
      </Button>

      {hasResult && (
        <>
          <Divider>{t('trading.backtestResult')}</Divider>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title={t('trading.totalReturn')}
                value={23.5}
                suffix="%"
                valueStyle={{ color: '#0ECB81' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={t('trading.maxDrawdown')}
                value={-8.2}
                suffix="%"
                valueStyle={{ color: '#F6465D' }}
              />
            </Col>
            <Col span={12}>
              <Statistic title={t('trading.sharpeRatio')} value={1.85} />
            </Col>
            <Col span={12}>
              <Statistic
                title={t('trading.winRate')}
                value={64.3}
                suffix="%"
              />
            </Col>
            <Col span={12}>
              <Statistic title={t('trading.totalTrades')} value={156} />
            </Col>
          </Row>
        </>
      )}
    </Drawer>
  );
};

export default BacktestPanel;
