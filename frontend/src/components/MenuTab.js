import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';

/**
 * Generic tab switcher used across screens.
 * items: [{ key, label }]
 */
export default function MenuTab({
  items = [],
  activeKey,
  onChange,
  topPadding = 0,
  horizontalPadding = 0,
  style,
  scrollable = false,
  contentContainerStyle,
  buttonStyle,
  activeButtonStyle,
  textStyle,
  activeTextStyle,
  gap = 10,
  color = 'primary',
  variant = 'menu-tab-m',
  renderItem,
  snapToInterval,
  decelerationRate,
  snapToAlignment,
  onScrollBeginDrag,
  onMomentumScrollEnd,
  scrollRef,
  edgePadding = 0,
  dynamicSnap = false,
}) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const activeColor = colors[color] || colors.primary;
  const activeBg =
    colors[`${color}Soft`] || colors[`${color}Opacity`] || colors.secondarySoft || colors.secondaryOpacity || activeColor;
  const sizeStyles = {
    'menu-tab-xs': { paddingVertical: 6, paddingHorizontal: 8, fontSize: 12 },
    'menu-tab-s': { paddingVertical: 9, paddingHorizontal: 12, fontSize: 14 },
    // M sized to mirror avatar option cards
    'menu-tab-m': { paddingVertical: 14, paddingHorizontal: 12, fontSize: 15, minWidth: 140 },
    'menu-tab-l': { paddingVertical: 12, paddingHorizontal: 16, fontSize: 16 },
  };
  const size = sizeStyles[variant] || sizeStyles['menu-tab-m'];

  const itemLayouts = React.useRef({});
  const [snapOffsets, setSnapOffsets] = React.useState([]);

  React.useEffect(() => {
    itemLayouts.current = {};
    setSnapOffsets([]);
  }, [items.length]);

  const updateSnapOffsets = React.useCallback(() => {
    if (!dynamicSnap) return;
    if (!items.length) return;
    if (Object.keys(itemLayouts.current).length !== items.length) return;
    const orderedLayouts = items.map((item, index) => {
      const keyVal = item?.key ?? item?.value ?? item?.label ?? String(index);
      return itemLayouts.current[keyVal];
    });
    if (orderedLayouts.some((layout) => !layout)) return;
    const firstX = orderedLayouts[0].x;
    const offsets = orderedLayouts.map((layout) => Math.max(0, layout.x - firstX));
    setSnapOffsets(offsets);
  }, [dynamicSnap, items]);

  React.useEffect(() => {
    if (!scrollable || !scrollRef?.current) return;
    const idx = items.findIndex((item, i) => {
      const keyVal = item?.key ?? item?.value ?? item?.label ?? String(i);
      return keyVal === activeKey;
    });
    if (idx < 0) return;
    if (dynamicSnap && snapOffsets.length) {
      const offset = snapOffsets[idx] ?? 0;
      scrollRef.current?.scrollTo?.({ x: offset, animated: true });
      return;
    }
    const gapVal = gap || 0;
    const baseWidth = size?.minWidth || snapToInterval || 0;
    const interval = snapToInterval || (baseWidth ? baseWidth + gapVal : undefined);
    if (!interval) return;
    const offset = Math.max(0, idx * interval);
    scrollRef.current?.scrollTo?.({ x: offset, animated: true });
  }, [activeKey, dynamicSnap, gap, items, scrollRef, scrollable, size?.minWidth, snapOffsets, snapToInterval]);

  const renderButton = (item, index) => {
    const keyVal = item?.key ?? item?.value ?? item?.label ?? String(index);
    const active = keyVal === activeKey;
    return (
      <TouchableOpacity
        key={keyVal}
        style={[
          styles.tabButton,
          buttonStyle,
          size && { paddingVertical: size.paddingVertical, paddingHorizontal: size.paddingHorizontal },
          size?.minWidth ? { minWidth: size.minWidth } : null,
          active && styles.tabButtonActive,
          active && {
            borderColor: activeColor,
            backgroundColor: activeBg,
          },
          active && activeButtonStyle,
        ]}
        onPress={() => onChange?.(keyVal)}
        activeOpacity={0.85}
        onLayout={(e) => {
          const { x, width } = e.nativeEvent.layout || {};
          if (!dynamicSnap) return;
          if (typeof x !== 'number' || typeof width !== 'number') return;
          itemLayouts.current[keyVal] = { x, width };
          updateSnapOffsets();
        }}
      >
        {renderItem ? (
          renderItem({
            item,
            active,
            defaultStyles: {
              button: styles.tabButton,
              text: styles.tabText,
              activeText: styles.tabTextActive,
            },
          })
        ) : (
          <Text
            style={[
              styles.tabText,
              textStyle,
              size && { fontSize: size.fontSize },
              active && [styles.tabTextActive, { color: activeColor }],
              active && activeTextStyle,
            ]}
          >
            {item.label}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const containerStyle = [
    styles.container,
    {
      paddingTop: topPadding,
      paddingHorizontal: horizontalPadding,
      marginBottom: 12,
      flexDirection: 'row',
    },
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={containerStyle}
        contentContainerStyle={[
          styles.scrollContent,
          { gap, paddingHorizontal: edgePadding, paddingLeft: edgePadding, paddingRight: edgePadding },
          contentContainerStyle,
        ]}
        snapToInterval={snapToInterval}
        snapToOffsets={dynamicSnap && snapOffsets.length ? snapOffsets : undefined}
        decelerationRate={decelerationRate}
        snapToAlignment={snapToAlignment}
        ref={scrollRef}
        onScrollBeginDrag={onScrollBeginDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
      >
        {items.map(renderButton)}
      </ScrollView>
    );
  }

  return <View style={[...containerStyle, { gap }]}>{items.map(renderButton)}</View>;
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {},
    scrollContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
    },
    tabButton: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    tabButtonActive: {},
    tabText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text_secondary,
    },
    tabTextActive: {
      color: colors.secondary,
    },
  });
