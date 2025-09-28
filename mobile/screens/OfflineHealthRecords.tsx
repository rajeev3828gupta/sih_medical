import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HealthRecord {
  id: string;
  type: 'consultation' | 'prescription' | 'test_result' | 'vaccination' | 'surgery' | 'allergy' | 'chronic_condition';
  title: string;
  description: string;
  date: string;
  doctor?: string;
  hospital?: string;
  isImportant: boolean;
  createdAt: string;
}

const OfflineHealthRecords: React.FC = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<HealthRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);

  const [newRecord, setNewRecord] = useState<Partial<HealthRecord>>({
    type: 'consultation',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    hospital: '',
    isImportant: false,
  });

  const saveHealthRecords = async (records: HealthRecord[]) => {
    setRecords(records);
    setFilteredRecords(records);
    await AsyncStorage.setItem('healthRecords', JSON.stringify(records));
  };

  const loadHealthRecords = async () => {
    const stored = await AsyncStorage.getItem('healthRecords');
    if (stored) {
      setRecords(JSON.parse(stored));
    } else {
      const sampleRecords: HealthRecord[] = [
        {
          id: '1',
          type: 'consultation',
          title: 'General Checkup',
          description: 'Routine health checkup with Dr. Sharma',
          date: '2024-01-15',
          doctor: 'Dr. Sharma',
          hospital: 'City Hospital',
          isImportant: false,
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          type: 'prescription',
          title: 'Cold & Fever Treatment',
          description: 'Prescribed medication for viral infection',
          date: '2024-01-20',
          doctor: 'Dr. Priya Patel',
          hospital: 'Rural Health Center, Amloh',
          isImportant: false,
          createdAt: '2024-01-20T14:30:00Z',
        },
        {
          id: '3',
          type: 'test_result',
          title: 'Blood Test Results',
          description: 'Complete Blood Count and Lipid Profile.',
          date: '2024-01-25',
          doctor: 'Dr. Sukhdev Singh',
          hospital: 'Nabha Civil Hospital',
          isImportant: true,
          createdAt: '2024-01-25T09:15:00Z',
        },
      ];
      await saveHealthRecords(sampleRecords);
    }
  };

  useEffect(() => {
    loadHealthRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, selectedFilter, searchQuery]);

  const filterRecords = () => {
    let filtered = records;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(record => record.type === selectedFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.doctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.hospital?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredRecords(filtered);
  };

  const addNewRecord = async () => {
    if (!newRecord.title || !newRecord.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const record: HealthRecord = {
      id: Date.now().toString(),
      type: newRecord.type as HealthRecord['type'],
      title: newRecord.title,
      description: newRecord.description,
      date: newRecord.date || new Date().toISOString().split('T')[0],
      doctor: newRecord.doctor,
      hospital: newRecord.hospital,
      isImportant: newRecord.isImportant || false,
      createdAt: new Date().toISOString(),
    };

    const updatedRecords = [record, ...records];
    await saveHealthRecords(updatedRecords);

    setNewRecord({
      type: 'consultation',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      doctor: '',
      hospital: '',
      isImportant: false,
    });
    setShowAddModal(false);

    Alert.alert('Success', 'Health record added successfully');
  };

  const renderRecord = ({ item }: { item: HealthRecord }) => (
    <TouchableOpacity
      style={styles.recordCard}
      onPress={() => setSelectedRecord(item)}
    >
      <Text style={styles.recordTitle}>{item.title}</Text>
      <Text style={styles.recordType}>{item.type.replace('_', ' ')}</Text>
      <Text style={styles.recordDate}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.recordDescription} numberOfLines={2}>{item.description}</Text>
      {item.doctor && <Text style={styles.recordInfo}>Doctor: {item.doctor}</Text>}
      {item.hospital && <Text style={styles.recordInfo}>Hospital: {item.hospital}</Text>}
      {item.isImportant && <Text style={styles.importantText}>Important</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Health Records</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search records..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {[
          { label: 'All', value: 'all' },
          { label: 'Consultation', value: 'consultation' },
          { label: 'Prescription', value: 'prescription' },
          { label: 'Test Result', value: 'test_result' },
          { label: 'Vaccination', value: 'vaccination' },
          { label: 'Chronic Condition', value: 'chronic_condition' },
        ].map(filter => (
          <TouchableOpacity
            key={filter.value}
            style={[styles.filterBtn, selectedFilter === filter.value && styles.selectedFilterBtn]}
            onPress={() => setSelectedFilter(filter.value)}
          >
            <Text style={[styles.filterBtnText, selectedFilter === filter.value && styles.selectedFilterBtnText]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Text style={styles.addButtonText}>Add Record</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredRecords}
        renderItem={renderRecord}
        keyExtractor={item => item.id}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No health records found</Text>
            <TouchableOpacity onPress={() => setShowAddModal(true)}>
              <Text style={styles.addFirstText}>Add your first record</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={showAddModal} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add Health Record</Text>

          <View style={styles.typeRow}>
            {[
              { label: 'Consultation', value: 'consultation' },
              { label: 'Prescription', value: 'prescription' },
              { label: 'Test Result', value: 'test_result' },
              { label: 'Vaccination', value: 'vaccination' },
              { label: 'Surgery', value: 'surgery' },
              { label: 'Allergy', value: 'allergy' },
              { label: 'Chronic Condition', value: 'chronic_condition' },
            ].map(type => (
              <TouchableOpacity
                key={type.value}
                style={[styles.typeBtn, newRecord.type === type.value && styles.selectedTypeBtn]}
                onPress={() => setNewRecord(prev => ({ ...prev, type: type.value as HealthRecord['type'] }))}
              >
                <Text style={[styles.typeBtnText, newRecord.type === type.value && styles.selectedTypeBtnText]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Title"
            value={newRecord.title}
            onChangeText={text => setNewRecord(prev => ({ ...prev, title: text }))}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={newRecord.description}
            onChangeText={text => setNewRecord(prev => ({ ...prev, description: text }))}
            multiline
          />

          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            value={newRecord.date}
            onChangeText={text => setNewRecord(prev => ({ ...prev, date: text }))}
          />

          <TextInput
            style={styles.input}
            placeholder="Doctor"
            value={newRecord.doctor}
            onChangeText={text => setNewRecord(prev => ({ ...prev, doctor: text }))}
          />

          <TextInput
            style={styles.input}
            placeholder="Hospital"
            value={newRecord.hospital}
            onChangeText={text => setNewRecord(prev => ({ ...prev, hospital: text }))}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={addNewRecord}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={selectedRecord !== null} animationType="slide">
        <View style={styles.modal}>
          {selectedRecord && (
            <>
              <Text style={styles.modalTitle}>{selectedRecord.title}</Text>
              <Text>Type: {selectedRecord.type.replace('_', ' ')}</Text>
              <Text>Date: {new Date(selectedRecord.date).toLocaleDateString()}</Text>
              {selectedRecord.doctor && <Text>Doctor: {selectedRecord.doctor}</Text>}
              {selectedRecord.hospital && <Text>Hospital: {selectedRecord.hospital}</Text>}
              <Text style={styles.description}>{selectedRecord.description}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedRecord(null)}>
                <Text>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    maxHeight: 40,
  },
  filterBtn: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
  },
  selectedFilterBtn: {
    backgroundColor: '#007bff',
  },
  filterBtnText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedFilterBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeBtn: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedTypeBtn: {
    backgroundColor: '#28a745',
  },
  typeBtnText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedTypeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  recordCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recordType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recordDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  recordInfo: {
    fontSize: 12,
    color: '#666',
  },
  importantText: {
    fontSize: 12,
    color: '#f00',
    fontWeight: 'bold',
  },
  empty: {
    alignItems: 'center',
    padding: 32,
  },
  addFirstText: {
    color: '#007bff',
    marginTop: 8,
  },
  modal: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelBtn: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    marginVertical: 16,
  },
  closeBtn: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
});

export default OfflineHealthRecords;
