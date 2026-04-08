import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { login } from '../../store/auth';
import './index.scss';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isWeChat = Taro.getEnv() === Taro.ENV_TYPE.WEAPP;

  const handleLogin = () => {
    if (!email.trim()) {
      Taro.showToast({ title: '请输入邮箱', icon: 'none' });
      return;
    }
    if (!password.trim()) {
      Taro.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login('mock-token-xxx', {
        id: '1',
        username: 'CryptoUser',
        email: email,
      });
      setLoading(false);
      Taro.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/index/index' });
      }, 1000);
    }, 1500);
  };

  const handleRegister = () => {
    Taro.showToast({ title: '注册功能开发中', icon: 'none' });
  };

  const handleWeChatLogin = () => {
    Taro.showToast({ title: '微信登录开发中', icon: 'none' });
  };

  return (
    <View className='login-page'>
      <View className='login-page__container'>
        <View className='login-page__logo-section'>
          <Text className='login-page__logo'>CryptoHub</Text>
          <Text className='login-page__slogan'>智能加密货币交易平台</Text>
        </View>

        <View className='login-page__form'>
          <View className='login-page__field'>
            <Text className='login-page__label'>邮箱</Text>
            <Input
              className='login-page__input'
              type='text'
              placeholder='请输入邮箱地址'
              placeholderStyle='color: #474D57'
              value={email}
              onInput={(e) => setEmail(e.detail.value)}
            />
          </View>

          <View className='login-page__field'>
            <Text className='login-page__label'>密码</Text>
            <Input
              className='login-page__input'
              type='safe-password'
              password
              placeholder='请输入密码'
              placeholderStyle='color: #474D57'
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
            />
          </View>

          <View className='login-page__forgot'>
            <Text className='login-page__forgot-text'>忘记密码？</Text>
          </View>

          <View
            className='login-page__submit-btn'
            onClick={handleLogin}
          >
            <Text className='login-page__submit-text'>
              {loading ? '登录中...' : '登录'}
            </Text>
          </View>

          {isWeChat && (
            <View
              className='login-page__wechat-btn'
              onClick={handleWeChatLogin}
            >
              <Text className='login-page__wechat-text'>微信登录</Text>
            </View>
          )}

          <View className='login-page__register-row'>
            <Text className='login-page__register-hint'>还没有账号？</Text>
            <Text className='login-page__register-link' onClick={handleRegister}>
              注册账号
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
