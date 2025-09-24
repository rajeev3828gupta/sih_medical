import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageSelectorProps {
  showLabels?: boolean;
  style?: any;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ showLabels = true, style }) => {
  const { currentLanguage, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'en' as const, flag: '🇺🇸', label: 'EN' },
    { code: 'hi' as const, flag: '🇮🇳', label: 'हि' },
    { code: 'pa' as const, flag: '🇮🇳', label: 'ਪੰ' },
  ];

  return (
    <View style={[styles.container, style]}>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.languageButton,
            currentLanguage === lang.code && styles.activeLanguageButton
          ]}
          onPress={() => setLanguage(lang.code)}
        >
          <Text style={styles.flag}>{lang.flag}</Text>
          {showLabels && (
            <Text style={[
              styles.label,
              currentLanguage === lang.code && styles.activeLabel
            ]}>
              {lang.label}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeLanguageButton: {
    backgroundColor: 'rgba(15, 118, 110, 0.2)',
  },
  flag: {
    fontSize: 16,
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  activeLabel: {
    color: '#0f766e',
    fontWeight: 'bold',
  },
});

export default LanguageSelector;