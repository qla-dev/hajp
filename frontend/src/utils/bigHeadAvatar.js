/* Hermes in React Native doesn't ship MessageChannel; scheduler from react-dom/server expects it. */
const ensureMessageChannel = () => {
  if (typeof globalThis.MessageChannel !== 'undefined') return;
  class SimpleMessageChannel {
    constructor() {
      this.port1 = this.createPort();
      this.port2 = this.createPort();
      this.port1._peer = this.port2;
      this.port2._peer = this.port1;
    }
    createPort() {
      const port = {
        _peer: null,
        _onmessage: null,
        postMessage: (data) => {
          const peer = port._peer;
          if (!peer || typeof peer._onmessage !== 'function') return;
          setTimeout(() => peer._onmessage({ data }), 0);
        },
        set onmessage(fn) {
          port._onmessage = fn;
        },
        get onmessage() {
          return port._onmessage;
        },
      };
      return port;
    }
  }
  globalThis.MessageChannel = SimpleMessageChannel;
};

ensureMessageChannel();

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { BigHead } = require('../vendor/extended-bigheads/src');
const { bigHeadOptions } = require('../vendor/extended-bigheads/src/utils/bigHeadOptions');
const defaultConfig = require('../../assets/json/avatar/avatarDefaultConfig.json');

const allowedKeys = new Set(Object.keys(bigHeadOptions));

const sanitizeConfig = (config = {}) => {
  const cleaned = {};
  Object.entries(config || {}).forEach(([key, value]) => {
    if (allowedKeys.has(key)) {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

const pickRandom = (items = []) => {
  if (!items.length) return null;
  const idx = Math.floor(Math.random() * items.length);
  return items[idx];
};

export const generateRandomConfig = () => {
  const config = {};
  Object.entries(bigHeadOptions).forEach(([key, values]) => {
    const choice = pickRandom(values);
    config[key] = choice;
  });
  return config;
};

export const buildAvatarSvg = (config = {}) => {
  const cleaned = sanitizeConfig(config);
  const merged = { ...defaultConfig, ...cleaned };
  const svg = renderToStaticMarkup(<BigHead {...merged} />);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
