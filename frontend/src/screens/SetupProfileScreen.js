import React, { useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/darkMode';

const ages = Array.from({ length: 20 }, (_, i) => 13 + i); // 13-32

const AgeSelectionStep = ({ selectedAge, onSelect, colors, styles }) => (
  <View style={styles.stepContent}>
    <Text style={styles.stepTitle}>Koliko imaš godina?</Text>
    <Text style={styles.stepSubtitle}>Odaberi svoje godine kako bismo prilagodili iskustvo.</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.ageRow}
    >
      {ages.map((age) => {
        const active = age === selectedAge;
        return (
          <TouchableOpacity
            key={age}
            onPress={() => onSelect(age)}
            style={[styles.ageChip, active && { borderColor: colors.primary, backgroundColor: colors.surface }]}
            activeOpacity={0.9}
          >
            <Text style={[styles.ageText, active && { color: colors.primary }]}>{age}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const PlaceholderStep = ({ title, description, styles }) => (
  <View style={styles.stepContent}>
    <Text style={styles.stepTitle}>{title}</Text>
    <Text style={styles.stepSubtitle}>{description}</Text>
    <View style={styles.placeholderBox}>
      <Text style={styles.placeholderText}>Uskoro</Text>
    </View>
  </View>
);

export default function SetupProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedAge, setSelectedAge] = useState(null);

  const finish = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((idx) => idx + 1);
    } else {
      finish();
    }
  };

  const steps = useMemo(
    () => [
      {
        key: 'age',
        title: 'Godine',
        render: () => (
          <AgeSelectionStep
            selectedAge={selectedAge}
            onSelect={setSelectedAge}
            colors={colors}
            styles={styles}
          />
        ),
      },
      {
        key: 'contact',
        title: 'Kontakti',
        render: () => (
          <PlaceholderStep
            title="Kontakti"
            description="Dozvoli pristup da pronađemo prijatelje."
            styles={styles}
          />
        ),
      },
      {
        key: 'schoolQuestion',
        title: 'Pitanje o školi',
        render: () => (
          <PlaceholderStep
            title="Škola"
            description="Odgovori na pitanje o školi."
            styles={styles}
          />
        ),
      },
      {
        key: 'schoolSelection',
        title: 'Izbor škole',
        render: () => (
          <PlaceholderStep
            title="Odaberi školu"
            description="Odaberi školu iz liste."
            styles={styles}
          />
        ),
      },
      {
        key: 'workQuestion',
        title: 'Pitanje o poslu',
        render: () => (
          <PlaceholderStep
            title="Posao"
            description="Odgovori na pitanje o poslu."
            styles={styles}
          />
        ),
      },
      {
        key: 'workSelection',
        title: 'Izbor posla',
        render: () => (
          <PlaceholderStep
            title="Odaberi posao"
            description="Odaberi posao iz liste."
            styles={styles}
          />
        ),
      },
      {
        key: 'friendsGroup',
        title: 'Prijatelji',
        render: () => (
          <PlaceholderStep
            title="Prijatelji"
            description="Podijeli više o svojim prijateljima."
            styles={styles}
          />
        ),
      },
      {
        key: 'vibes',
        title: 'Vibes',
        render: () => (
          <PlaceholderStep
            title="Vibe"
            description="Odaberi vibe koji te opisuje."
            styles={styles}
          />
        ),
      },
    ],
    [colors, selectedAge, styles],
  );

  const currentStep = steps[stepIndex] || steps[0];
  const isLast = stepIndex === steps.length - 1;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerBackVisible: false,
      headerLeft: () => null,
      headerTitle: currentStep?.title || 'Setup',
      headerRight: () => (
        <TouchableOpacity onPress={nextStep} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.skipText}>Preskoči</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, currentStep, nextStep, styles.skipText]);

  return (
    <View style={styles.container}>
      <View style={styles.stepWrapper}>{currentStep?.render()}</View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={nextStep} activeOpacity={0.9}>
          <Text style={styles.nextButtonText}>{isLast ? 'Završi' : 'Dalje'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    stepWrapper: {
      flex: 1,
      justifyContent: 'center',
    },
    stepContent: {
      alignItems: 'center',
      gap: 12,
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text_primary,
      textAlign: 'center',
    },
    stepSubtitle: {
      fontSize: 14,
      color: colors.text_secondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 8,
    },
    ageRow: {
      gap: 10,
      paddingVertical: 12,
    },
    ageChip: {
      minWidth: 70,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ageText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text_primary,
    },
    placeholderBox: {
      width: '100%',
      padding: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
    },
    placeholderText: {
      color: colors.text_secondary,
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      paddingVertical: 12,
    },
    nextButton: {
      backgroundColor: colors.primary,
      borderRadius: 18,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextButtonText: {
      color: colors.textLight,
      fontWeight: '700',
      fontSize: 16,
    },
    skipText: {
      color: colors.secondary,
      fontWeight: '700',
      fontSize: 14,
    },
  });
