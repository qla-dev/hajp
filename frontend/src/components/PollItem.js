import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/darkMode';

export default function PollItem({
  roomName,
  question,
  emoji,
  answered = 0,
  total = 0,
  options = [],
  onSelect,
  loading,
  disabled,
  accentColor,
  onCardPress,
  style,
}) {
  const { colors } = useTheme();
  const completion = total ? Math.min(Math.max(answered / total, 0), 1) : 0;
  const accent = accentColor || colors.primary;
  const interactive = !!onCardPress;
  const Container = interactive ? TouchableOpacity : View;
  const containerProps = interactive ? { activeOpacity: 0.9, onPress: onCardPress } : {};
  const progressLabel = total ? `${answered}/${total}` : '0/0';

  return (
    <Container
      {...containerProps}
      style={[styles.card, { backgroundColor: colors.transparent, borderColor: accent }, style]}
    >
      <View style={styles.row}>
        <Text style={[styles.roomName, { color: colors.text_primary }]} numberOfLines={1}>
          {roomName || 'Neimenovana soba'}
        </Text>
        <View style={styles.badge}>
          <Text style={[styles.badgeValue, { color: accent }]}>{progressLabel}</Text>
          <Text style={[styles.badgeLabel, { color: colors.text_secondary }]}>
            {total && total === answered ? 'Završeno' : 'Odgovoreno'}
          </Text>
        </View>
      </View>

      <Text style={[styles.question, { color: colors.text_primary }]} numberOfLines={3}>
        {question || 'Nema novih anketa za sobu'}
      </Text>

      <View style={styles.detailRow}>
        <Text style={[styles.emoji, { color: accent }]}>{emoji || '❔'}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completion * 100}%`, backgroundColor: accent }]} />
        </View>
      </View>

      {options?.length ? (
        <View style={styles.buttonsRow}>
          {loading ? (
            <ActivityIndicator color={accent} />
          ) : (
            options.slice(0, 2).map((option, index) => (
              <TouchableOpacity
                key={`${option.value ?? option.label}-${index}`}
                onPress={() => onSelect?.(option.value)}
                disabled={disabled}
                style={[styles.optionButton, { borderColor: accent }]}
              >
                <Text style={[styles.optionText, { color: colors.text_primary }]} numberOfLines={1}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      ) : (
        <Text style={[styles.placeholder, { color: colors.text_secondary }]}>
          Nema novih anketa za sobu
        </Text>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
  },
  badge: {
    alignItems: 'flex-end',
  },
  badgeValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  badgeLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    minHeight: 60,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  placeholder: {
    fontSize: 14,
    marginTop: 8,
  },
});
