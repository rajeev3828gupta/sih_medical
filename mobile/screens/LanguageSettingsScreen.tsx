import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useLanguage } from '../contexts/LanguageContext';

type LanguageSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LanguageSettings'>;

interface LanguageSettingsScreenProps {
  navigation: LanguageSettingsScreenNavigationProp;
}

const LanguageSettingsScreen: React.FC<LanguageSettingsScreenProps> = ({ navigation }) => {
  const { currentLanguage, setLanguage, t } = useLanguage();

  const languages = [
    {
      code: 'en' as const,
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      description: 'Switch to English interface'
    },
    {
      code: 'hi' as const,
      name: 'Hindi',
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
      description: 'हिंदी इंटरफेस पर स्विच करें'
    },
    {
      code: 'pa' as const,
      name: 'Punjabi',
      nativeName: 'ਪੰਜਾਬੀ',
      flag: '🇮🇳',
      description: 'ਪੰਜਾਬੀ ਇੰਟਰਫੇਸ ਤੇ ਸਵਿਚ ਕਰੋ'
    }
  ];

  const handleLanguageChange = async (languageCode: 'en' | 'hi' | 'pa') => {
    try {
      await setLanguage(languageCode);
      
      // Show confirmation in the newly selected language
      const confirmationMessages = {
        en: {
          title: 'Language Changed',
          message: 'The app language has been changed to English. The interface will update immediately.'
        },
        hi: {
          title: 'भाषा बदली गई',
          message: 'ऐप की भाषा हिंदी में बदल दी गई है। इंटरफेस तुरंत अपडेट हो जाएगा।'
        },
        pa: {
          title: 'ਭਾਸ਼ਾ ਬਦਲੀ ਗਈ',
          message: 'ਐਪ ਦੀ ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲ ਦਿੱਤੀ ਗਈ ਹੈ। ਇੰਟਰਫੇਸ ਤੁਰੰਤ ਅਪਡੇਟ ਹੋ ਜਾਵੇਗਾ।'
        }
      };

      Alert.alert(
        confirmationMessages[languageCode].title,
        confirmationMessages[languageCode].message,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to change language. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('language.settings.title')}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>{t('language.settings.select_language')}</Text>
        <Text style={styles.description}>{t('language.settings.description')}</Text>

        <View style={styles.languagesList}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageOption,
                currentLanguage === language.code && styles.selectedLanguage
              ]}
              onPress={() => handleLanguageChange(language.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageFlag}>{language.flag}</Text>
                <View style={styles.languageText}>
                  <Text style={[
                    styles.languageName,
                    currentLanguage === language.code && styles.selectedLanguageText
                  ]}>
                    {language.nativeName}
                  </Text>
                  <Text style={styles.languageEnglishName}>({language.name})</Text>
                  <Text style={styles.languageDescription}>{language.description}</Text>
                </View>
              </View>
              {currentLanguage === language.code && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedIndicatorText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{t('language.settings.features_title')}</Text>
          <Text style={styles.infoText}>• {t('language.settings.feature_1')}</Text>
          <Text style={styles.infoText}>• {t('language.settings.feature_2')}</Text>
          <Text style={styles.infoText}>• {t('language.settings.feature_3')}</Text>
          <Text style={styles.infoText}>• {t('language.settings.feature_4')}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    lineHeight: 22,
  },
  languagesList: {
    marginBottom: 32,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  selectedLanguage: {
    backgroundColor: '#f0fdfa',
    borderColor: '#0f766e',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  selectedLanguageText: {
    color: '#0f766e',
  },
  languageEnglishName: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  languageDescription: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  selectedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default LanguageSettingsScreen;