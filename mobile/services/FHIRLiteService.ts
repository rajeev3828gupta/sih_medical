import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// FHIR R4 Resource Types for Rural Healthcare
export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  identifier: Array<{
    use?: 'usual' | 'official' | 'temp' | 'secondary';
    type?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    system: string;
    value: string;
  }>;
  active: boolean;
  name: Array<{
    use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
    family: string;
    given: string[];
  }>;
  telecom?: Array<{
    system: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
    value: string;
    use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  }>;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;
  address?: Array<{
    use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
    type?: 'postal' | 'physical' | 'both';
    text?: string;
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  extension?: Array<{
    url: string;
    valueString?: string;
    valueBoolean?: boolean;
    valueCode?: string;
  }>;
  meta?: {
    lastUpdated: string;
    source?: string;
    tag: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
}

export interface FHIREncounter {
  resourceType: 'Encounter';
  id: string;
  identifier?: Array<{
    system: string;
    value: string;
  }>;
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled';
  class: {
    system: string;
    code: string;
    display: string;
  };
  type?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  subject: {
    reference: string;
  };
  participant?: Array<{
    type?: Array<{
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    }>;
    individual?: {
      reference: string;
    };
  }>;
  period: {
    start: string;
    end?: string;
  };
  location?: Array<{
    location: {
      reference: string;
    };
  }>;
  extension?: Array<{
    url: string;
    valueString?: string;
    valueCode?: string;
  }>;
  meta?: {
    lastUpdated: string;
    source?: string;
    tag: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
}

export interface FHIRObservation {
  resourceType: 'Observation';
  id: string;
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
  };
  encounter?: {
    reference: string;
  };
  effectiveDateTime: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  valueString?: string;
  valueCodeableConcept?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  component?: Array<{
    code: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    valueQuantity?: {
      value: number;
      unit: string;
      system: string;
      code: string;
    };
  }>;
  extension?: Array<{
    url: string;
    valueString?: string;
    valueBoolean?: boolean;
  }>;
  meta?: {
    lastUpdated: string;
    source?: string;
    tag: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
}

export interface FHIRMedicationRequest {
  resourceType: 'MedicationRequest';
  id: string;
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  medicationCodeableConcept: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
  };
  encounter?: {
    reference: string;
  };
  authoredOn: string;
  requester?: {
    reference: string;
  };
  dosageInstruction?: Array<{
    text?: string;
    timing?: {
      repeat: {
        frequency?: number;
        period?: number;
        periodUnit?: 'a' | 'mo' | 'wk' | 'd' | 'h' | 'min' | 's';
      };
    };
    route?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    doseAndRate?: Array<{
      doseQuantity?: {
        value: number;
        unit: string;
        system: string;
        code: string;
      };
    }>;
  }>;
  extension?: Array<{
    url: string;
    valueString?: string;
    valueBoolean?: boolean;
  }>;
  meta?: {
    lastUpdated: string;
    source?: string;
    tag: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
}

export interface FHIRDiagnosticReport {
  resourceType: 'DiagnosticReport';
  id: string;
  status: 'registered' | 'partial' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'appended' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
  };
  encounter?: {
    reference: string;
  };
  effectiveDateTime: string;
  issued: string;
  performer?: Array<{
    reference: string;
  }>;
  result?: Array<{
    reference: string;
  }>;
  conclusion?: string;
  conclusionCode?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  extension?: Array<{
    url: string;
    valueString?: string;
    valueBoolean?: boolean;
  }>;
  meta?: {
    lastUpdated: string;
    source?: string;
    tag: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection';
  timestamp: string;
  total?: number;
  entry: Array<{
    resource: FHIRPatient | FHIREncounter | FHIRObservation | FHIRMedicationRequest | FHIRDiagnosticReport;
    fullUrl?: string;
  }>;
  meta?: {
    lastUpdated: string;
    source?: string;
    tag: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
}

// Government Health System Integration
export interface GovernmentHealthSystemConfig {
  apiEndpoint: string;
  apiKey: string;
  facilityId: string;
  stateCode: string;
  districtCode: string;
  blockCode: string;
  enableDataSync: boolean;
  syncInterval: number; // minutes
  lastSyncTimestamp?: string;
}

export interface DataSyncStatus {
  lastSyncTime: string;
  totalRecordsSynced: number;
  failedRecords: number;
  pendingRecords: number;
  syncErrors: string[];
}

class FHIRLiteService {
  private static instance: FHIRLiteService;
  private governmentConfig: GovernmentHealthSystemConfig | null = null;
  private pendingSyncData: FHIRBundle[] = [];

  public static getInstance(): FHIRLiteService {
    if (!FHIRLiteService.instance) {
      FHIRLiteService.instance = new FHIRLiteService();
    }
    return FHIRLiteService.instance;
  }

  private constructor() {
    this.initializeService();
  }

  private async initializeService() {
    try {
      const configData = await AsyncStorage.getItem('government_health_config');
      if (configData) {
        this.governmentConfig = JSON.parse(configData);
      }
      
      const pendingData = await AsyncStorage.getItem('pending_sync_data');
      if (pendingData) {
        this.pendingSyncData = JSON.parse(pendingData);
      }
    } catch (error) {
      console.error('Failed to initialize FHIR service:', error);
    }
  }

  // Configuration Management
  async setGovernmentHealthSystemConfig(config: GovernmentHealthSystemConfig): Promise<void> {
    try {
      this.governmentConfig = config;
      await AsyncStorage.setItem('government_health_config', JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save government health config:', error);
      throw new Error('Configuration save failed');
    }
  }

  async getGovernmentHealthSystemConfig(): Promise<GovernmentHealthSystemConfig | null> {
    return this.governmentConfig;
  }

  // FHIR Resource Creation
  async createPatientResource(patientData: any): Promise<FHIRPatient> {
    const patientId = await this.generateResourceId('Patient');
    
    const fhirPatient: FHIRPatient = {
      resourceType: 'Patient',
      id: patientId,
      identifier: [
        {
          use: 'official',
          type: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'MR',
              display: 'Medical Record Number'
            }]
          },
          system: 'https://health.gov.in/patient-id',
          value: patientData.patientId || patientId
        }
      ],
      active: true,
      name: [{
        use: 'official',
        family: patientData.familyName || patientData.name?.split(' ').pop() || '',
        given: patientData.givenName ? [patientData.givenName] : patientData.name?.split(' ').slice(0, -1) || [patientData.name || '']
      }],
      telecom: patientData.phoneNumber ? [{
        system: 'phone',
        value: patientData.phoneNumber,
        use: 'mobile'
      }] : undefined,
      gender: patientData.gender || 'unknown',
      birthDate: patientData.birthDate || this.calculateBirthDateFromAge(patientData.age),
      address: patientData.address || patientData.village ? [{
        use: 'home',
        type: 'physical',
        text: patientData.address,
        city: patientData.village,
        district: patientData.district,
        state: patientData.state || 'Unknown',
        country: 'IN'
      }] : undefined,
      extension: [
        {
          url: 'https://health.gov.in/fhir/StructureDefinition/rural-location',
          valueString: patientData.village || 'Unknown'
        },
        {
          url: 'https://health.gov.in/fhir/StructureDefinition/socioeconomic-status',
          valueCode: patientData.socioeconomicStatus || 'unknown'
        }
      ],
      meta: {
        lastUpdated: new Date().toISOString(),
        source: 'rural-health-app',
        tag: [
          {
            system: 'https://health.gov.in/fhir/CodeSystem/data-source',
            code: 'mobile-app',
            display: 'Mobile Health Application'
          },
          {
            system: 'https://health.gov.in/fhir/CodeSystem/location-type',
            code: 'rural',
            display: 'Rural Healthcare'
          }
        ]
      }
    };

    await this.storeResource(fhirPatient);
    return fhirPatient;
  }

  async createEncounterResource(encounterData: any): Promise<FHIREncounter> {
    const encounterId = await this.generateResourceId('Encounter');
    
    const fhirEncounter: FHIREncounter = {
      resourceType: 'Encounter',
      id: encounterId,
      identifier: [{
        system: 'https://health.gov.in/encounter-id',
        value: encounterData.sessionId || encounterId
      }],
      status: encounterData.status || 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: encounterData.encounterType === 'telemedicine' ? 'VR' : 'AMB',
        display: encounterData.encounterType === 'telemedicine' ? 'Virtual' : 'Ambulatory'
      },
      type: [{
        coding: [{
          system: 'http://snomed.info/sct',
          code: this.getEncounterTypeCode(encounterData.sessionType),
          display: encounterData.sessionType || 'General Consultation'
        }]
      }],
      subject: {
        reference: `Patient/${encounterData.patientId}`
      },
      participant: encounterData.chwId ? [{
        type: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
            code: 'PPRF',
            display: 'Primary Performer'
          }]
        }],
        individual: {
          reference: `Practitioner/${encounterData.chwId}`
        }
      }] : undefined,
      period: {
        start: encounterData.startTime,
        end: encounterData.endTime
      },
      location: [{
        location: {
          reference: `Location/${encounterData.facilityId || 'rural-health-center'}`
        }
      }],
      extension: [
        {
          url: 'https://health.gov.in/fhir/StructureDefinition/session-priority',
          valueCode: encounterData.priority || 'routine'
        },
        {
          url: 'https://health.gov.in/fhir/StructureDefinition/chief-complaint',
          valueString: encounterData.chiefComplaint
        }
      ],
      meta: {
        lastUpdated: new Date().toISOString(),
        source: 'rural-health-app',
        tag: [
          {
            system: 'https://health.gov.in/fhir/CodeSystem/encounter-setting',
            code: 'rural-chw',
            display: 'Rural Community Health Worker'
          }
        ]
      }
    };

    await this.storeResource(fhirEncounter);
    return fhirEncounter;
  }

  async createObservationResource(observationData: any): Promise<FHIRObservation> {
    const observationId = await this.generateResourceId('Observation');
    
    const fhirObservation: FHIRObservation = {
      resourceType: 'Observation',
      id: observationId,
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs',
          display: 'Vital Signs'
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: this.getLoincCode(observationData.type),
          display: observationData.type
        }]
      },
      subject: {
        reference: `Patient/${observationData.patientId}`
      },
      encounter: observationData.encounterId ? {
        reference: `Encounter/${observationData.encounterId}`
      } : undefined,
      effectiveDateTime: observationData.recordedTime || new Date().toISOString(),
      valueQuantity: observationData.value ? {
        value: observationData.value,
        unit: observationData.unit,
        system: 'http://unitsofmeasure.org',
        code: observationData.unitCode || observationData.unit
      } : undefined,
      valueString: observationData.stringValue,
      component: observationData.components?.map((comp: any) => ({
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: this.getLoincCode(comp.type),
            display: comp.type
          }]
        },
        valueQuantity: {
          value: comp.value,
          unit: comp.unit,
          system: 'http://unitsofmeasure.org',
          code: comp.unitCode || comp.unit
        }
      })),
      extension: [
        {
          url: 'https://health.gov.in/fhir/StructureDefinition/measurement-method',
          valueString: observationData.method || 'manual'
        }
      ],
      meta: {
        lastUpdated: new Date().toISOString(),
        source: 'rural-health-app',
        tag: [
          {
            system: 'https://health.gov.in/fhir/CodeSystem/data-quality',
            code: 'verified',
            display: 'Verified by CHW'
          }
        ]
      }
    };

    await this.storeResource(fhirObservation);
    return fhirObservation;
  }

  async createMedicationRequestResource(medicationData: any): Promise<FHIRMedicationRequest> {
    const medicationId = await this.generateResourceId('MedicationRequest');
    
    const fhirMedicationRequest: FHIRMedicationRequest = {
      resourceType: 'MedicationRequest',
      id: medicationId,
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: medicationData.medicationCode || '999999',
          display: medicationData.medicationName
        }],
        text: medicationData.medicationName
      },
      subject: {
        reference: `Patient/${medicationData.patientId}`
      },
      encounter: medicationData.encounterId ? {
        reference: `Encounter/${medicationData.encounterId}`
      } : undefined,
      authoredOn: new Date().toISOString(),
      requester: medicationData.chwId ? {
        reference: `Practitioner/${medicationData.chwId}`
      } : undefined,
      dosageInstruction: [{
        text: medicationData.instructions,
        timing: {
          repeat: {
            frequency: medicationData.frequency || 1,
            period: 1,
            periodUnit: 'd'
          }
        },
        doseAndRate: [{
          doseQuantity: {
            value: medicationData.dose || 1,
            unit: medicationData.doseUnit || 'tablet',
            system: 'http://unitsofmeasure.org',
            code: medicationData.doseUnitCode || '1'
          }
        }]
      }],
      extension: [
        {
          url: 'https://health.gov.in/fhir/StructureDefinition/duration',
          valueString: medicationData.duration
        },
        {
          url: 'https://health.gov.in/fhir/StructureDefinition/availability-status',
          valueString: medicationData.availabilityStatus || 'available'
        }
      ],
      meta: {
        lastUpdated: new Date().toISOString(),
        source: 'rural-health-app',
        tag: [
          {
            system: 'https://health.gov.in/fhir/CodeSystem/prescription-source',
            code: 'chw-prescribed',
            display: 'CHW Prescribed'
          }
        ]
      }
    };

    await this.storeResource(fhirMedicationRequest);
    return fhirMedicationRequest;
  }

  async createDiagnosticReportResource(reportData: any): Promise<FHIRDiagnosticReport> {
    const reportId = await this.generateResourceId('DiagnosticReport');
    
    const fhirDiagnosticReport: FHIRDiagnosticReport = {
      resourceType: 'DiagnosticReport',
      id: reportId,
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
          code: reportData.category || 'OTH',
          display: reportData.categoryDisplay || 'Other'
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: reportData.reportCode || '11502-2',
          display: reportData.reportType || 'Clinical Assessment'
        }]
      },
      subject: {
        reference: `Patient/${reportData.patientId}`
      },
      encounter: reportData.encounterId ? {
        reference: `Encounter/${reportData.encounterId}`
      } : undefined,
      effectiveDateTime: reportData.reportDate || new Date().toISOString(),
      issued: new Date().toISOString(),
      performer: reportData.chwId ? [{
        reference: `Practitioner/${reportData.chwId}`
      }] : undefined,
      result: reportData.observations?.map((obsId: string) => ({
        reference: `Observation/${obsId}`
      })),
      conclusion: reportData.conclusion || reportData.assessmentNotes,
      conclusionCode: reportData.diagnosisCodes?.map((code: any) => ({
        coding: [{
          system: 'http://hl7.org/fhir/sid/icd-10',
          code: code.code,
          display: code.display
        }]
      })),
      extension: [
        {
          url: 'https://health.gov.in/fhir/StructureDefinition/ai-analysis',
          valueString: reportData.aiAnalysis ? JSON.stringify(reportData.aiAnalysis) : undefined
        },
        {
          url: 'https://health.gov.in/fhir/StructureDefinition/referral-needed',
          valueBoolean: reportData.referralNeeded || false
        },
        {
          url: 'https://health.gov.in/fhir/StructureDefinition/followup-required',
          valueBoolean: reportData.followUpRequired || false
        }
      ],
      meta: {
        lastUpdated: new Date().toISOString(),
        source: 'rural-health-app',
        tag: [
          {
            system: 'https://health.gov.in/fhir/CodeSystem/report-type',
            code: 'chw-assessment',
            display: 'CHW Clinical Assessment'
          }
        ]
      }
    };

    await this.storeResource(fhirDiagnosticReport);
    return fhirDiagnosticReport;
  }

  // Bundle Creation for Complete Patient Session
  async createSessionBundle(sessionData: any): Promise<FHIRBundle> {
    const bundleId = await this.generateResourceId('Bundle');
    
    const resources: Array<FHIRPatient | FHIREncounter | FHIRObservation | FHIRMedicationRequest | FHIRDiagnosticReport> = [];
    
    // Create patient resource
    const patient = await this.createPatientResource(sessionData.patient);
    resources.push(patient);
    
    // Create encounter resource
    const encounter = await this.createEncounterResource({
      ...sessionData.encounter,
      patientId: patient.id
    });
    resources.push(encounter);
    
    // Create observation resources for vital signs
    if (sessionData.vitalSigns) {
      for (const [vitalType, value] of Object.entries(sessionData.vitalSigns)) {
        if (value) {
          const observation = await this.createObservationResource({
            type: vitalType,
            value: typeof value === 'object' ? undefined : value,
            stringValue: typeof value === 'string' ? value : undefined,
            components: typeof value === 'object' ? this.parseBloodPressure(value as unknown as string) : undefined,
            patientId: patient.id,
            encounterId: encounter.id,
            unit: this.getVitalSignUnit(vitalType),
            recordedTime: encounter.period.start
          });
          resources.push(observation);
        }
      }
    }
    
    // Create medication request resources
    if (sessionData.medications) {
      for (const medication of sessionData.medications) {
        const medicationRequest = await this.createMedicationRequestResource({
          ...medication,
          patientId: patient.id,
          encounterId: encounter.id
        });
        resources.push(medicationRequest);
      }
    }
    
    // Create diagnostic report
    const diagnosticReport = await this.createDiagnosticReportResource({
      ...sessionData.assessment,
      patientId: patient.id,
      encounterId: encounter.id,
      observations: resources
        .filter(r => r.resourceType === 'Observation')
        .map(r => r.id)
    });
    resources.push(diagnosticReport);
    
    const bundle: FHIRBundle = {
      resourceType: 'Bundle',
      id: bundleId,
      type: 'transaction',
      timestamp: new Date().toISOString(),
      total: resources.length,
      entry: resources.map(resource => ({
        resource,
        fullUrl: `${resource.resourceType}/${resource.id}`
      })),
      meta: {
        lastUpdated: new Date().toISOString(),
        source: 'rural-health-app',
        tag: [
          {
            system: 'https://health.gov.in/fhir/CodeSystem/bundle-type',
            code: 'patient-session',
            display: 'Complete Patient Session'
          }
        ]
      }
    };
    
    await this.storeBundle(bundle);
    await this.queueForSync(bundle);
    
    return bundle;
  }

  // Data Synchronization
  async syncWithGovernmentSystem(): Promise<DataSyncStatus> {
    if (!this.governmentConfig) {
      throw new Error('Government health system not configured');
    }

    const syncStatus: DataSyncStatus = {
      lastSyncTime: new Date().toISOString(),
      totalRecordsSynced: 0,
      failedRecords: 0,
      pendingRecords: this.pendingSyncData.length,
      syncErrors: []
    };

    try {
      for (const bundle of this.pendingSyncData) {
        try {
          await this.uploadBundle(bundle);
          syncStatus.totalRecordsSynced++;
        } catch (error) {
          syncStatus.failedRecords++;
          syncStatus.syncErrors.push(`Bundle ${bundle.id}: ${error}`);
        }
      }

      // Remove successfully synced bundles
      this.pendingSyncData = this.pendingSyncData.filter((_, index) => 
        index >= syncStatus.totalRecordsSynced
      );
      
      await this.savePendingSyncData();
      await this.saveSyncStatus(syncStatus);

      // Update last sync timestamp in config
      if (this.governmentConfig) {
        this.governmentConfig.lastSyncTimestamp = syncStatus.lastSyncTime;
        await this.setGovernmentHealthSystemConfig(this.governmentConfig);
      }

    } catch (error) {
      syncStatus.syncErrors.push(`Sync process failed: ${error}`);
    }

    return syncStatus;
  }

  async getDataSyncStatus(): Promise<DataSyncStatus | null> {
    try {
      const statusData = await AsyncStorage.getItem('data_sync_status');
      return statusData ? JSON.parse(statusData) : null;
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return null;
    }
  }

  async getPendingSyncData(): Promise<FHIRBundle[]> {
    return this.pendingSyncData;
  }

  // Utility Methods
  private async generateResourceId(resourceType: string): Promise<string> {
    const timestamp = Date.now();
    const randomBytes = await Crypto.getRandomBytesAsync(8);
    const randomHex = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${resourceType.toLowerCase()}-${timestamp}-${randomHex}`;
  }

  private calculateBirthDateFromAge(age: number): string {
    const currentDate = new Date();
    const birthYear = currentDate.getFullYear() - age;
    return `${birthYear}-01-01`;
  }

  private getEncounterTypeCode(sessionType: string): string {
    const typeMap: { [key: string]: string } = {
      'consultation': '11429006',
      'screening': '20135006',
      'follow-up': '185349003',
      'vaccination': '33879002',
      'emergency': '50849002'
    };
    return typeMap[sessionType] || '11429006';
  }

  private getLoincCode(vitalType: string): string {
    const loincMap: { [key: string]: string } = {
      'bloodPressure': '85354-9',
      'systolicBP': '8480-6',
      'diastolicBP': '8462-4',
      'temperature': '8310-5',
      'pulse': '8867-4',
      'respiratoryRate': '9279-1',
      'oxygenSaturation': '2708-6',
      'weight': '29463-7',
      'height': '8302-2'
    };
    return loincMap[vitalType] || '8310-5';
  }

  private getVitalSignUnit(vitalType: string): string {
    const unitMap: { [key: string]: string } = {
      'temperature': 'degF',
      'pulse': '/min',
      'respiratoryRate': '/min',
      'oxygenSaturation': '%',
      'weight': 'kg',
      'height': 'cm',
      'bloodPressure': 'mmHg'
    };
    return unitMap[vitalType] || '';
  }

  private parseBloodPressure(bpValue: string): Array<any> | undefined {
    if (typeof bpValue !== 'string' || !bpValue.includes('/')) return undefined;
    
    const [systolic, diastolic] = bpValue.split('/').map(v => parseInt(v.trim()));
    return [
      {
        type: 'systolicBP',
        value: systolic,
        unit: 'mmHg'
      },
      {
        type: 'diastolicBP',
        value: diastolic,
        unit: 'mmHg'
      }
    ];
  }

  private async storeResource(resource: any): Promise<void> {
    try {
      const key = `fhir_${resource.resourceType.toLowerCase()}_${resource.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(resource));
    } catch (error) {
      console.error('Failed to store FHIR resource:', error);
    }
  }

  private async storeBundle(bundle: FHIRBundle): Promise<void> {
    try {
      const key = `fhir_bundle_${bundle.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(bundle));
    } catch (error) {
      console.error('Failed to store FHIR bundle:', error);
    }
  }

  private async queueForSync(bundle: FHIRBundle): Promise<void> {
    this.pendingSyncData.push(bundle);
    await this.savePendingSyncData();
  }

  private async savePendingSyncData(): Promise<void> {
    try {
      await AsyncStorage.setItem('pending_sync_data', JSON.stringify(this.pendingSyncData));
    } catch (error) {
      console.error('Failed to save pending sync data:', error);
    }
  }

  private async saveSyncStatus(status: DataSyncStatus): Promise<void> {
    try {
      await AsyncStorage.setItem('data_sync_status', JSON.stringify(status));
    } catch (error) {
      console.error('Failed to save sync status:', error);
    }
  }

  private async uploadBundle(bundle: FHIRBundle): Promise<void> {
    if (!this.governmentConfig) {
      throw new Error('Government system not configured');
    }

    // Simulate API call to government health system
    // In real implementation, this would make HTTP requests to the actual API
    try {
      const response = await fetch(`${this.governmentConfig.apiEndpoint}/fhir/Bundle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json',
          'Authorization': `Bearer ${this.governmentConfig.apiKey}`,
          'X-Facility-ID': this.governmentConfig.facilityId,
          'X-State-Code': this.governmentConfig.stateCode
        },
        body: JSON.stringify(bundle)
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      console.log(`Bundle ${bundle.id} successfully uploaded to government system`);
    } catch (error) {
      // For offline mode, we'll just log the error and keep the bundle queued
      console.error('Upload to government system failed:', error);
      throw error;
    }
  }

  // Resource Retrieval
  async getPatientResources(patientId: string): Promise<FHIRPatient[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const patientKeys = keys.filter(key => key.startsWith('fhir_patient_'));
      const patients: FHIRPatient[] = [];
      
      for (const key of patientKeys) {
        const patientData = await AsyncStorage.getItem(key);
        if (patientData) {
          const patient = JSON.parse(patientData);
          if (!patientId || patient.id === patientId) {
            patients.push(patient);
          }
        }
      }
      
      return patients;
    } catch (error) {
      console.error('Failed to get patient resources:', error);
      return [];
    }
  }

  async getEncounterResources(patientId?: string): Promise<FHIREncounter[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const encounterKeys = keys.filter(key => key.startsWith('fhir_encounter_'));
      const encounters: FHIREncounter[] = [];
      
      for (const key of encounterKeys) {
        const encounterData = await AsyncStorage.getItem(key);
        if (encounterData) {
          const encounter = JSON.parse(encounterData);
          if (!patientId || encounter.subject.reference === `Patient/${patientId}`) {
            encounters.push(encounter);
          }
        }
      }
      
      return encounters.sort((a, b) => 
        new Date(b.period.start).getTime() - new Date(a.period.start).getTime()
      );
    } catch (error) {
      console.error('Failed to get encounter resources:', error);
      return [];
    }
  }

  async getAllBundles(): Promise<FHIRBundle[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const bundleKeys = keys.filter(key => key.startsWith('fhir_bundle_'));
      const bundles: FHIRBundle[] = [];
      
      for (const key of bundleKeys) {
        const bundleData = await AsyncStorage.getItem(key);
        if (bundleData) {
          bundles.push(JSON.parse(bundleData));
        }
      }
      
      return bundles.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to get bundles:', error);
      return [];
    }
  }

  // Data Export for Government Reporting
  async exportDataForReporting(dateRange: { start: string; end: string }): Promise<{
    patients: number;
    encounters: number;
    observations: number;
    medications: number;
    reports: number;
    bundle: FHIRBundle;
  }> {
    try {
      const bundles = await this.getAllBundles();
      const filteredBundles = bundles.filter(bundle => 
        bundle.timestamp >= dateRange.start && bundle.timestamp <= dateRange.end
      );

      let patientCount = 0;
      let encounterCount = 0;
      let observationCount = 0;
      let medicationCount = 0;
      let reportCount = 0;

      const allResources: Array<FHIRPatient | FHIREncounter | FHIRObservation | FHIRMedicationRequest | FHIRDiagnosticReport> = [];

      for (const bundle of filteredBundles) {
        for (const entry of bundle.entry) {
          allResources.push(entry.resource);
          
          switch (entry.resource.resourceType) {
            case 'Patient':
              patientCount++;
              break;
            case 'Encounter':
              encounterCount++;
              break;
            case 'Observation':
              observationCount++;
              break;
            case 'MedicationRequest':
              medicationCount++;
              break;
            case 'DiagnosticReport':
              reportCount++;
              break;
          }
        }
      }

      const reportBundle: FHIRBundle = {
        resourceType: 'Bundle',
        id: await this.generateResourceId('Bundle'),
        type: 'collection',
        timestamp: new Date().toISOString(),
        total: allResources.length,
        entry: allResources.map(resource => ({
          resource,
          fullUrl: `${resource.resourceType}/${resource.id}`
        })),
        meta: {
          lastUpdated: new Date().toISOString(),
          source: 'rural-health-app',
          tag: [
            {
              system: 'https://health.gov.in/fhir/CodeSystem/report-type',
              code: 'government-report',
              display: 'Government Health System Report'
            }
          ]
        }
      };

      return {
        patients: patientCount,
        encounters: encounterCount,
        observations: observationCount,
        medications: medicationCount,
        reports: reportCount,
        bundle: reportBundle
      };
    } catch (error) {
      console.error('Failed to export data for reporting:', error);
      throw error;
    }
  }
}

export default FHIRLiteService;