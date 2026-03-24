export type DisabilityType = 'visual' | 'hearing' | 'motor' | 'cognitive' | 'senior' | 'prefer-not-to-say';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  disabilities: DisabilityType[];
  mobilityAids: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  preferences: {
    voiceAlerts: boolean;
    vibrationFeedback: boolean;
    highContrast: boolean;
    simplifiedMode: boolean;
    language: string;
  };
  isVolunteer: boolean;
  createdAt: string;
}

export type HazardType = 'construction' | 'flooding' | 'broken-path' | 'obstacle' | 'poor-lighting' | 'steep-incline' | 'slippery' | 'other';

export interface HazardReport {
  id: string;
  reporterUid: string;
  type: HazardType;
  description: string;
  severity: 'low' | 'medium' | 'high';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  impact: {
    affectsWheelchairs: boolean;
    visualImpairmentRisk: boolean;
    delayedRoutes: number; // in minutes
  };
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
}

export interface AssistanceRequest {
  id: string;
  userUid: string;
  type: 'navigation' | 'crossing' | 'physical' | 'other';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  volunteerUid?: string;
  createdAt: string;
}
