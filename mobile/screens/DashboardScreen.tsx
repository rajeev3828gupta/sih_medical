import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { setDashboardModalFunctions } from '../App';
import { useAuth } from '../contexts/AuthContext';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import ChemistDashboard from './ChemistDashboard';
import AdminPanel from './AdminPanel';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user, isAdmin, logout } = useAuth();

  const [profileModalVisible, setProfileModalVisible] = React.useState(false);
  const [moreModalVisible, setMoreModalVisible] = React.useState(false);

  React.useEffect(() => {
    setDashboardModalFunctions({
      showProfileModal: () => setProfileModalVisible(true),
      showMoreModal: () => setMoreModalVisible(true),
    });

    return () => {
      setDashboardModalFunctions({
        showProfileModal: () => {},
        showMoreModal: () => {},
      });
    };
  }, []);

  const renderDashboard = () => {
    if (!user) {
      return <PatientDashboard navigation={navigation} />;
    }

    switch (user.role) {
      case 'admin':
        return <AdminPanel navigation={navigation as any} />;
      case 'doctor':
        return <DoctorDashboard navigation={navigation} />;
      case 'pharmacy':
        return <ChemistDashboard navigation={navigation} />;
      case 'patient':
      default:
        return <PatientDashboard navigation={navigation} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderDashboard()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});

export default DashboardScreen;
