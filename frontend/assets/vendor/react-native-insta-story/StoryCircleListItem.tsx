import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { SvgUri, SvgXml } from 'react-native-svg';

import { usePrevious } from './helpers/StateHelpers';
import { IUserStory, StoryCircleListItemProps } from './interfaces';

const isSvgUri = (uri?: string) => {
  if (!uri) return false;
  const trimmed = uri.trim();
  if (!trimmed) return false;
  const lowered = trimmed.toLowerCase();
  if (lowered.startsWith('data:image/svg')) return true;
  if (lowered.includes('.svg')) return true;
  if (lowered.includes('avataaars.io')) return true;
  if (lowered.includes('bighead')) return true;
  if (lowered.includes('ui-avatars.com')) return true;
  return false;
};

const isDataSvgUri = (uri?: string) =>
  Boolean(uri && uri.trim().toLowerCase().startsWith('data:image/svg+xml'));

const extractSvgFromDataUri = (uri?: string) => {
  if (!uri) return null;
  const match = uri.match(/^data:image\/svg\+xml;utf8,(.*)$/i);
  if (!match || !match[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

const parseAvatarConfig = (value?: string) => {
  if (!value) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  const target =
    start >= 0 && end >= start && end > start ? trimmed.slice(start, end + 1) : trimmed;
  try {
    return JSON.parse(target);
  } catch {
    return null;
  }
};

const looksLikeConfig = (value?: string) => Boolean(parseAvatarConfig(value));

const computeInitials = (value?: string) => {
  if (!value) return '??';
  const parts = value.trim().split(/\s+/);
  const letters = parts.slice(0, 2).map((part) => part?.[0]?.toUpperCase() ?? '');
  return letters.join('') || '??';
};

const paletteColors = ['red', 'orange', 'yellow', 'green', 'turqoise', 'blue', 'pink', 'purple'];

const pickBackgroundColor = (name?: string) => {
  if (!name) return '#b794f4';
  let hash = 0;
  for (const ch of name) {
    hash = (hash * 31 + ch.charCodeAt(0)) % paletteColors.length;
  }
  return paletteColors[hash] || '#b794f4';
};

const truncateUri = (uri?: string, max = 50) => {
  if (!uri) return uri;
  return uri.length > max ? `${uri.slice(0, max)}…` : uri;
};

const buildInitialsPlaceholder = (name?: string) => {
  const initials = computeInitials(name);
  const backgroundColor = pickBackgroundColor(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><circle cx="60" cy="60" r="60" fill="${backgroundColor}" /><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="#fff" font-weight="700">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const selectAvatarUri = (item: IUserStory) => {
  const candidates = [
    item?.user_image,
    item?.avatar,
    item?.avatar_url,
    item?.avatarUrl,
    item?.profile_photo,
    item?.profilePhoto,
    item?.photo,
    item?.image,
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (looksLikeConfig(candidate as string)) continue;
    if (typeof candidate !== 'string') continue;
    const trimmed = candidate.trim();
    if (trimmed) return trimmed;
  }
  return null;
};

const StoryCircleListItem = ({
  item,
  unPressedBorderColor,
  pressedBorderColor,
  unPressedAvatarTextColor,
  pressedAvatarTextColor,
  avatarSize = 60,
  showText,
  avatarTextStyle,
  handleStoryItemPress,
  avatarImageStyle,
  avatarWrapperStyle,
}: StoryCircleListItemProps) => {
  const [isPressed, setIsPressed] = useState(item?.seen);

  const prevSeen = usePrevious(item?.seen);

  useEffect(() => {
    if (prevSeen != item?.seen) {
      setIsPressed(item?.seen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.seen]);

  const _handleItemPress = (item: IUserStory) => {
    if (handleStoryItemPress) handleStoryItemPress(item);

    setIsPressed(true);
  };

  const avatarWrapperSize = avatarSize + 4;
  const resolvedImage = selectAvatarUri(item) || buildInitialsPlaceholder(item?.user_name);
  const dataSvgMarkup = isDataSvgUri(resolvedImage) ? extractSvgFromDataUri(resolvedImage) : null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => _handleItemPress(item)}
        style={[
          styles.avatarWrapper,
          {
            height: avatarWrapperSize,
            width: avatarWrapperSize,
          },
          avatarWrapperStyle,
          !isPressed
            ? {
                borderColor: unPressedBorderColor ?? 'red',
              }
            : {
                borderColor: pressedBorderColor ?? 'grey',
              },
        ]}
      >
        {dataSvgMarkup ? (
          <SvgXml
            xml={dataSvgMarkup}
            width={avatarSize}
            height={avatarSize}
            style={[
              {
                borderRadius: avatarSize / 2,
              },
              avatarImageStyle,
            ]}
          />
        ) : isSvgUri(resolvedImage) ? (
          <SvgUri
            uri={resolvedImage}
            width={avatarSize}
            height={avatarSize}
            style={[
              {
                borderRadius: avatarSize / 2,
              },
              avatarImageStyle,
            ]}
          />
        ) : (
        <Image
          style={[
            {
              height: avatarSize,
              width: avatarSize,
              borderRadius: 100,
            },
            avatarImageStyle,
          ]}
          source={{ uri: resolvedImage }}
        />
        )}
      </TouchableOpacity>
      {showText && (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            {
              width: avatarWrapperSize,
              ...styles.text,
              ...avatarTextStyle,
            },
            isPressed
              ? { color: pressedAvatarTextColor || undefined }
              : { color: unPressedAvatarTextColor || undefined },
          ]}
        >
          {item.user_name}
        </Text>
      )}
    </View>
  );
};

export default StoryCircleListItem;

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginRight: 10,
  },
  avatarWrapper: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: 'red',
    borderRadius: 100,
    height: 64,
    width: 64,
  },
  text: {
    marginTop: 3,
    textAlign: 'center',
    alignItems: 'center',
    fontSize: 11,
  },
});
