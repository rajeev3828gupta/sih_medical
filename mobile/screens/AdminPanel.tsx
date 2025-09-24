import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  FlatList,
  RefreshControl,
  Switch,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

type AdminPanelProps = {
  navigation: StackNavigationProp<RootStackParamList, 'AdminPanel'>;
};

interface RegistrationRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'doctor' | 'patient' | 'pharmacy' | 'hospital';
  specialty?: string;
  license?: string;
  address: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: string[];
}

interface UserManagement {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'suspended' | 'inactive';
  lastLogin: string;
  totalSessions: number;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  pendingRequests: number;
  totalConsultations: number;
  todayConsultations: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'requests' | 'users' | 'system'>('dashboard');
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingRequests: 0,
    totalConsultations: 0,
    todayConsultations: 0,
    systemHealth: 'good'
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockRequests: RegistrationRequest[] = [
        {
          id: '1',
          name: 'Dr. Arun Kumar',
          phone: '+91 98765 43210',
          email: 'arun.kumar@email.com',
          role: 'doctor',
          specialty: 'Cardiology',
          license: 'MCI-12345',
          address: 'Patiala, Punjab',
          requestDate: '2025-09-20',
          status: 'pending',
          documents: ['medical_license.pdf', 'id_proof.pdf']
        },
        {
          id: '2',
          name: 'City Medical Store',
          phone: '+91 99887 76655',
          email: 'citymedical@email.com',
          role: 'pharmacy',
          license: 'PHARM-6789',
          address: 'Nabha, Punjab',
          requestDate: '2025-09-19',
          status: 'pending',
          documents: ['pharmacy_license.pdf', 'gst_certificate.pdf']
        },
        {
          id: '3',
          name: 'Rajesh Sharma',
          phone: '+91 88776 65544',
          email: 'rajesh.sharma@email.com',
          role: 'patient',
          address: 'Nabha, Punjab',
          requestDate: '2025-09-18',
          status: 'approved',
          documents: ['id_proof.pdf']
        }
      ];

      const mockUsers: UserManagement[] = [
        {
          id: '1',
          name: 'Dr. Sarah Johnson',
          role: 'Doctor',
          status: 'active',
          lastLogin: '2025-09-23 10:30 AM',
          totalSessions: 45
        },
        {
          id: '2',
          name: 'Priya Singh',
          role: 'Patient',
          status: 'active',
          lastLogin: '2025-09-23 09:15 AM',
          totalSessions: 12
        },
        {
          id: '3',
          name: 'MedPlus Pharmacy',
          role: 'Pharmacy',
          status: 'active',
          lastLogin: '2025-09-22 06:45 PM',
          totalSessions: 28
        }
      ];

      const mockStats: SystemStats = {
        totalUsers: 1247,
        activeUsers: 89,
        pendingRequests: 15,
        totalConsultations: 3456,
        todayConsultations: 23,
        systemHealth: 'good'
      };

      setRegistrationRequests(mockRequests);
      setUsers(mockUsers);
      setSystemStats(mockStats);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRequestAction = (requestId: string, action: 'approve' | 'reject') => {
    setRegistrationRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' }
          : req
      )
    );
    
    const actionText = action === 'approve' ? 'approved' : 'rejected';
    Alert.alert('Success', `Registration request ${actionText} successfully`);
    setRequestModalVisible(false);
    setActionModalVisible(false);
    setRejectionReason('');
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId
          ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' }
          : user
      )
    );
  };

  const renderDashboard = () => (
    <ScrollView style={styles.simpleDashboard} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#dc2626" />
    }>
      {/* Admin Alerts */}
      <View style={styles.adminAlertCard}>
        <Text style={styles.adminAlertTitle}>� Administrative Overview</Text>
        <Text style={styles.adminAlertText}>• {systemStats.pendingRequests} registration requests pending review</Text>
        <Text style={styles.adminAlertText}>• System performance: Normal</Text>
        <Text style={styles.adminAlertText}>• Last backup: Today, 3:00 AM</Text>
      </View>
      
      {/* Minimal KPIs */}
      <View style={styles.simpleStatsRow}>
        <View style={styles.simpleStatCard}>
          <Text style={styles.simpleStatNumber}>{systemStats.totalUsers}</Text>
          <Text style={styles.simpleStatLabel}>Total Users</Text>
        </View>
        <View style={styles.simpleStatCard}>
          <Text style={styles.simpleStatNumber}>{systemStats.activeUsers}</Text>
          <Text style={styles.simpleStatLabel}>Active Users</Text>
        </View>
        <View style={styles.simpleStatCard}>
          <Text style={styles.simpleStatNumber}>{systemStats.pendingRequests}</Text>
          <Text style={styles.simpleStatLabel}>Pending Requests</Text>
        </View>
      </View>
      
      {/* Additional Admin Stats */}
      <View style={styles.simpleStatsRow}>
        <View style={styles.simpleStatCard}>
          <Text style={styles.simpleStatNumber}>{systemStats.todayConsultations}</Text>
          <Text style={styles.simpleStatLabel}>Today's Consultations</Text>
        </View>
        <View style={styles.simpleStatCard}>
          <Text style={styles.simpleStatNumber}>24/7</Text>
          <Text style={styles.simpleStatLabel}>Uptime</Text>
        </View>
        <View style={styles.simpleStatCard}>
          <Text style={styles.simpleStatNumber}>173</Text>
          <Text style={styles.simpleStatLabel}>Villages Covered</Text>
        </View>
      </View>
      
      {/* Minimal Actions */}
      <View style={styles.simpleActionsSection}>
        <TouchableOpacity style={styles.simpleActionButton} onPress={() => setSelectedTab('requests')}>
          <Text style={styles.simpleActionButtonText}>Review Registration Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.simpleActionButton} onPress={() => setSelectedTab('users')}>
          <Text style={styles.simpleActionButtonText}>User Management</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.simpleActionButton} onPress={() => setSelectedTab('system')}>
          <Text style={styles.simpleActionButtonText}>System Health</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.simpleActionButton} onPress={() => {
          Alert.alert('Reports & Analytics', 'Generate comprehensive reports on:\n• User activity\n• Consultation statistics\n• System performance\n• Medical outcomes');
        }}>
          <Text style={styles.simpleActionButtonText}>Reports & Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.simpleActionButton} onPress={() => {
          Alert.alert('Emergency Controls', 'Emergency administrative functions:\n• System-wide alerts\n• Service suspension\n• Emergency notifications\n• Crisis management');
        }}>
          <Text style={styles.simpleActionButtonText}>Emergency Controls</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.simpleActionButton} onPress={() => {
          Alert.alert('Settings & Configuration', 'Administrative settings:\n• System configuration\n• Security settings\n• Backup management\n• Audit logs');
        }}>
          <Text style={styles.simpleActionButtonText}>Settings & Configuration</Text>
        </TouchableOpacity>
      </View>
      
      {/* Minimal Status */}
      <View style={styles.simpleStatusSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.simpleStatusIndicator} />
          <Text style={styles.simpleStatusLabel}>System Operational</Text>
        </View>
        <Text style={styles.simpleLastUpdated}>Last Updated: {new Date().toLocaleString()}</Text>
      </View>
    </ScrollView>
  );

  const renderRegistrationRequests = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#dc2626" />
    }>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Registration Requests</Text>
        {registrationRequests.map((request) => (
          <TouchableOpacity
            key={request.id}
            style={styles.requestCard}
            onPress={() => {
              setSelectedRequest(request);
              setRequestModalVisible(true);
            }}
          >
            <View style={styles.requestHeader}>
              <View style={styles.requestInfo}>
                <Text style={styles.requestName}>{request.name}</Text>
                <Text style={styles.requestRole}>{request.role.toUpperCase()}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: 
                  request.status === 'pending' ? '#fef3c7' :
                  request.status === 'approved' ? '#d1fae5' : '#fee2e2'
                }
              ]}>
                <Text style={[
                  styles.requestStatusText,
                  { color:
                    request.status === 'pending' ? '#f59e0b' :
                    request.status === 'approved' ? '#10b981' : '#dc2626'
                  }
                ]}>
                  {request.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.requestDetails}>📞 {request.phone}</Text>
            <Text style={styles.requestDetails}>📧 {request.email}</Text>
            <Text style={styles.requestDetails}>📍 {request.address}</Text>
            <Text style={styles.requestDate}>Request Date: {request.requestDate}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderUserManagement = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#dc2626" />
    }>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 User Management</Text>
        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userRole}>{user.role}</Text>
              <Text style={styles.userDetails}>Last Login: {user.lastLogin}</Text>
              <Text style={styles.userDetails}>Total Sessions: {user.totalSessions}</Text>
            </View>
            <View style={styles.userActions}>
              <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Active</Text>
                <Switch
                  value={user.status === 'active'}
                  onValueChange={() => toggleUserStatus(user.id)}
                  trackColor={{ false: '#f3f4f6', true: '#dc2626' }}
                  thumbColor={user.status === 'active' ? '#fff' : '#9ca3af'}
                />
              </View>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderSystemManagement = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#dc2626" />
    }>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ System Management</Text>
        
        <View style={styles.systemCard}>
          <Text style={styles.systemCardTitle}>🖥️ Server Status</Text>
          <View style={styles.serverStatus}>
            <View style={styles.serverItem}>
              <Text style={styles.serverLabel}>API Server</Text>
              <View style={[styles.statusIndicator, { backgroundColor: '#10b981' }]} />
              <Text style={styles.serverStatusText}>Online</Text>
            </View>
            <View style={styles.serverItem}>
              <Text style={styles.serverLabel}>Database</Text>
              <View style={[styles.statusIndicator, { backgroundColor: '#10b981' }]} />
              <Text style={styles.serverStatusText}>Connected</Text>
            </View>
            <View style={styles.serverItem}>
              <Text style={styles.serverLabel}>WebSocket</Text>
              <View style={[styles.statusIndicator, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.serverStatusText}>Warning</Text>
            </View>
          </View>
        </View>

        <View style={styles.systemCard}>
          <Text style={styles.systemCardTitle}>📊 Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>CPU Usage</Text>
              <Text style={styles.metricValue}>45%</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Memory</Text>
              <Text style={styles.metricValue}>67%</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Storage</Text>
              <Text style={styles.metricValue}>82%</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Network</Text>
              <Text style={styles.metricValue}>23MB/s</Text>
            </View>
          </View>
        </View>

        <View style={styles.systemCard}>
          <Text style={styles.systemCardTitle}>🔧 System Actions</Text>
          <TouchableOpacity style={styles.systemActionButton}>
            <Text style={styles.systemActionText}>🔄 Restart Services</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.systemActionButton}>
            <Text style={styles.systemActionText}>🗄️ Backup Database</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.systemActionButton}>
            <Text style={styles.systemActionText}>📋 Export Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.systemActionButton}>
            <Text style={styles.systemActionText}>🧹 Clear Cache</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
      
      {/* Simple Formal Header */}
      <View style={styles.simpleHeader}>
        <View>
          <Text style={styles.simpleHeaderTitle}>Admin Panel</Text>
          <Text style={styles.simpleHeaderSubtitle}>Medical Administration</Text>
        </View>
        <TouchableOpacity 
          onPress={() => {
            Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', onPress: () => {
                logout();
                navigation.navigate('Welcome');
              }}
            ]);
          }}
          style={styles.simpleLogoutButton}
        >
          <Text style={styles.simpleLogoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'dashboard' && styles.activeTab]}
          onPress={() => setSelectedTab('dashboard')}
        >
          <Text style={[styles.tabText, selectedTab === 'dashboard' && styles.activeTabText]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'requests' && styles.activeTab]}
          onPress={() => setSelectedTab('requests')}
        >
          <Text style={[styles.tabText, selectedTab === 'requests' && styles.activeTabText]}>
            Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'users' && styles.activeTab]}
          onPress={() => setSelectedTab('users')}
        >
          <Text style={[styles.tabText, selectedTab === 'users' && styles.activeTabText]}>
            Users
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'system' && styles.activeTab]}
          onPress={() => setSelectedTab('system')}
        >
          <Text style={[styles.tabText, selectedTab === 'system' && styles.activeTabText]}>
            System
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {selectedTab === 'dashboard' && renderDashboard()}
      {selectedTab === 'requests' && renderRegistrationRequests()}
      {selectedTab === 'users' && renderUserManagement()}
      {selectedTab === 'system' && renderSystemManagement()}

      {/* Request Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={requestModalVisible}
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRequest && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Registration Request</Text>
                  <TouchableOpacity onPress={() => setRequestModalVisible(false)}>
                    <Text style={styles.closeButton}>×</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalBody}>
                  <Text style={styles.modalLabel}>Name:</Text>
                  <Text style={styles.modalValue}>{selectedRequest.name}</Text>
                  
                  <Text style={styles.modalLabel}>Role:</Text>
                  <Text style={styles.modalValue}>{selectedRequest.role.toUpperCase()}</Text>
                  
                  <Text style={styles.modalLabel}>Phone:</Text>
                  <Text style={styles.modalValue}>{selectedRequest.phone}</Text>
                  
                  <Text style={styles.modalLabel}>Email:</Text>
                  <Text style={styles.modalValue}>{selectedRequest.email}</Text>
                  
                  <Text style={styles.modalLabel}>Address:</Text>
                  <Text style={styles.modalValue}>{selectedRequest.address}</Text>
                  
                  {selectedRequest.specialty && (
                    <>
                      <Text style={styles.modalLabel}>Specialty:</Text>
                      <Text style={styles.modalValue}>{selectedRequest.specialty}</Text>
                    </>
                  )}
                  
                  {selectedRequest.license && (
                    <>
                      <Text style={styles.modalLabel}>License:</Text>
                      <Text style={styles.modalValue}>{selectedRequest.license}</Text>
                    </>
                  )}
                  
                  <Text style={styles.modalLabel}>Documents:</Text>
                  {selectedRequest.documents.map((doc, index) => (
                    <Text key={index} style={styles.documentItem}>📎 {doc}</Text>
                  ))}
                </ScrollView>
                
                {selectedRequest.status === 'pending' && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleRequestAction(selectedRequest.id, 'approve')}
                    >
                      <Text style={styles.actionButtonText}>✅ Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => setActionModalVisible(true)}
                    >
                      <Text style={styles.actionButtonText}>❌ Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={actionModalVisible}
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModalContent}>
            <Text style={styles.modalTitle}>Rejection Reason</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Please provide a reason for rejection..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setActionModalVisible(false)}
              >
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => selectedRequest && handleRequestAction(selectedRequest.id, 'reject')}
              >
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  backButton: {
    marginRight: 15,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#374151',
  },
  backButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#d1d5db',
    fontWeight: '500',
  },
  adminName: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 8,
    textAlign: 'right',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dc2626',
    borderRadius: 6,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  refreshButton: {
    fontSize: 20,
    color: '#ffffff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 3,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeTab: {
    backgroundColor: '#1f2937',
    borderColor: '#1f2937',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: '#ffffff',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    width: (width - 48) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    width: (width - 48) / 2,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  requestCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  requestRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requestStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  requestDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  requestDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    fontStyle: 'italic',
  },
  userCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 1,
  },
  userActions: {
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8,
  },
  actionButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  systemCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  systemCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  serverStatus: {
    gap: 12,
  },
  serverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serverLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  serverStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  systemActionButton: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  systemActionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 0,
    width: width - 40,
    maxHeight: '80%',
  },
  smallModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: width - 80,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 8,
  },
  documentItem: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#dc2626',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  // Enhanced Dashboard Styles
  welcomeSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  healthText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  statCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  statCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  statCardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 20,
  },
  statContent: {
    flex: 1,
  },
  statTrend: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 4,
  },
  quickActionPrimary: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  quickActionSecondary: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  quickActionSuccess: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  quickActionInfo: {
    backgroundColor: '#e0e7ff',
    borderColor: '#6366f1',
  },
  quickActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  quickActionBadge: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  quickActionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  activityContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },

  // Formal Executive Dashboard Styles
  executiveSummary: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  summaryHeader: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  summarySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  summaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTime: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  operationalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },

  // Formal Section Headers
  sectionHeaderFormal: {
    marginBottom: 20,
  },
  sectionTitleFormal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },

  // KPI Grid Styles
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  kpiPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  kpiSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  kpiWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  kpiInfo: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kpiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiIcon: {
    fontSize: 20,
  },
  kpiCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 1,
  },
  kpiValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  kpiTrendContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  kpiTrend: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },

  // Administrative Actions Grid
  adminActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  adminActionCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  actionCritical: {
    borderWidth: 2,
    borderColor: '#fbbf24',
    backgroundColor: '#fffbeb',
  },
  actionPrimary: {
    borderWidth: 2,
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  actionSecondary: {
    borderWidth: 2,
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  actionInfo: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionBadge: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  actionBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  actionFooter: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },

  // Timeline Styles
  timelineContainer: {
    paddingHorizontal: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineIconText: {
    fontSize: 16,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e5e7eb',
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  timelineDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  timelineLocation: {
    fontWeight: '600',
    color: '#dc2626',
  },
  timelineTime: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  // Simple Clean Admin Panel Styles
  simpleHeader: {
    backgroundColor: '#1f2937',
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  simpleHeaderTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  simpleHeaderSubtitle: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },
  simpleLogoutButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  simpleLogoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  simpleDashboard: {
    padding: 20,
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  simpleStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  simpleStatCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  simpleStatNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  simpleStatLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  simpleActionsSection: {
    marginTop: 10,
    marginBottom: 24,
  },
  simpleActionButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  simpleActionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  simpleStatusSection: {
    marginTop: 10,
    alignItems: 'center',
  },
  simpleStatusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  simpleStatusLabel: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  simpleLastUpdated: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
  },
  adminAlertCard: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 4,
    borderLeftColor: '#64748b',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  adminAlertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  adminAlertText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
});

export default AdminPanel;