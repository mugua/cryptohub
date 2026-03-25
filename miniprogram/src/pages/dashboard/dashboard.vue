<template>
  <view class="container">
    <!-- Portfolio card -->
    <view class="portfolio-card">
      <text class="label">总资产 (USDT)</text>
      <text class="value">$98,420.35</text>
      <view class="pnl-row">
        <text class="pnl-up">▲ +$1,248.60  (+1.28%)</text>
        <text class="pnl-label">今日盈亏</text>
      </view>
    </view>

    <!-- Section: Market -->
    <view class="section-header">
      <text class="section-title">市场行情</text>
    </view>
    <view class="ticker-list">
      <view v-for="ticker in tickers" :key="ticker.symbol" class="ticker-item">
        <view class="ticker-left">
          <text class="ticker-symbol">{{ ticker.symbol }}</text>
          <text class="ticker-price">{{ ticker.price }}</text>
        </view>
        <view :class="['ticker-change', ticker.up ? 'up' : 'down']">
          <text>{{ ticker.change }}</text>
        </view>
      </view>
    </view>

    <!-- Section: Strategies -->
    <view class="section-header">
      <text class="section-title">运行中的策略</text>
    </view>
    <view class="strategy-list">
      <view v-for="strategy in strategies" :key="strategy.name" class="strategy-item">
        <view class="strategy-icon">
          <text>🤖</text>
        </view>
        <view class="strategy-info">
          <text class="strategy-name">{{ strategy.name }}</text>
          <text class="strategy-status">● {{ strategy.status }}</text>
        </view>
        <text class="strategy-pnl">{{ strategy.pnl }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tickers = ref([
  { symbol: 'BTC/USDT', price: '$67,420', change: '+1.28%', up: true },
  { symbol: 'ETH/USDT', price: '$3,540', change: '+2.14%', up: true },
  { symbol: 'BNB/USDT', price: '$582', change: '-0.42%', up: false },
  { symbol: 'SOL/USDT', price: '$178', change: '+3.67%', up: true },
])

const strategies = ref([
  { name: 'BTC 网格策略', status: '运行中', pnl: '+$1,248.60' },
  { name: 'ETH DCA策略', status: '运行中', pnl: '+$420.80' },
  { name: 'SOL RSI反转', status: '运行中', pnl: '+$312.50' },
])
</script>

<style lang="scss">
.container {
  background: #0d1117;
  min-height: 100vh;
  padding: 16rpx;
}

.portfolio-card {
  background: #161b22;
  border: 1rpx solid #1f2937;
  border-radius: 12rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.label {
  color: #888;
  font-size: 24rpx;
  display: block;
  margin-bottom: 8rpx;
}

.value {
  color: #fff;
  font-size: 56rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 12rpx;
}

.pnl-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pnl-up {
  color: #52c41a;
  font-size: 26rpx;
}

.pnl-label {
  color: #888;
  font-size: 22rpx;
}

.section-header {
  padding: 16rpx 4rpx 8rpx;
}

.section-title {
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}

.ticker-list {
  background: #161b22;
  border: 1rpx solid #1f2937;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.ticker-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid #1f2937;
}

.ticker-item:last-child {
  border-bottom: none;
}

.ticker-symbol {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  display: block;
}

.ticker-price {
  color: #888;
  font-size: 24rpx;
  display: block;
  margin-top: 4rpx;
}

.ticker-change {
  padding: 8rpx 16rpx;
  border-radius: 6rpx;
  font-size: 26rpx;
  font-weight: 600;
}

.ticker-change.up {
  background: rgba(82, 196, 26, 0.15);
  color: #52c41a;
}

.ticker-change.down {
  background: rgba(245, 34, 45, 0.15);
  color: #f5222d;
}

.strategy-list {
  background: #161b22;
  border: 1rpx solid #1f2937;
  border-radius: 12rpx;
  overflow: hidden;
}

.strategy-item {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid #1f2937;
}

.strategy-item:last-child {
  border-bottom: none;
}

.strategy-icon {
  width: 64rpx;
  height: 64rpx;
  background: rgba(22, 119, 255, 0.2);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 20rpx;
}

.strategy-info {
  flex: 1;
}

.strategy-name {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  display: block;
}

.strategy-status {
  color: #52c41a;
  font-size: 22rpx;
  display: block;
  margin-top: 4rpx;
}

.strategy-pnl {
  color: #52c41a;
  font-size: 28rpx;
  font-weight: 600;
}
</style>
