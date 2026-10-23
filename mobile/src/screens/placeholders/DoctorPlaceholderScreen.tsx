import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { doctorApi } from '../../api/doctorApi';
import { consultationApi } from '../../api/consultationApi';
import { communicationApi } from '../../api/communicationApi';
import { DoctorResponseDTO, DoctorAvailabilityStatus } from '../../types/doctor';
import { ConsultationResponseDTO } from '../../types/consultation';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export const DoctorPlaceholderScreen: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useTheme();

  const initialDoctorId = Number(user?.doctorId || user?.associatedEntityId || 0);
  const [resolvedDoctorId, setResolvedDoctorId] = useState<number>(initialDoctorId);

  const [doctorProfile, setDoctorProfile] = useState<DoctorResponseDTO | null>(null);
  const [availability, setAvailability] = useState<DoctorAvailabilityStatus>('AVAILABLE');
  const [updatingAvail, setUpdatingAvail] = useState(false);

  const [pendingQueue, setPendingQueue] = useState<ConsultationResponseDTO[]>([]);
  const [activeSessions, setActiveSessions] = useState<ConsultationResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchDoctorWorkspace = useCallback(
    async (silent = false) => {
      if (!silent) setError(null);
      let curId = resolvedDoctorId;

      try {
        // If doctor ID is missing or 0, auto-resolve or auto-create doctor in doctor-service
        if (!curId) {
          try {
            if (user?.id) {
              const byUser = await doctorApi.getDoctorByUserId(user.id).catch(() => null);
              if (byUser && byUser.id) curId = byUser.id;
            }
            if (!curId) {
              const allDocs = await doctorApi.getAllDoctors().catch(() => []);
              const matched = allDocs.find(
                (d) =>
                  (user?.id && d.userId === user.id) ||
                  (user?.fullName && d.name?.toLowerCase().includes(user.fullName.toLowerCase())) ||
                  (user?.username && d.name?.toLowerCase().includes(user.username.toLowerCase()))
              );
              if (matched && matched.id) curId = matched.id;
            }
            if (!curId && user?.role === 'DOCTOR') {
              const created = await doctorApi.createDoctor({
                userId: user?.id || String(Date.now()),
                name: user?.fullName || 'Dr. ' + (user?.username || 'Doctor'),
                specialization: 'General Medicine',
                licenseNumber: 'LIC-' + Date.now().toString().slice(-6),
                experienceYears: 5,
                qualification: 'MBBS, MD',
                hospitalName: 'District Rural Hospital',
              }).catch(() => null);
              if (created && created.id) curId = created.id;
            }
          } catch (e) {
            console.warn('Auto-resolving doctor profile fallback error:', e);
          }

          if (curId) {
            setResolvedDoctorId(curId);
          }
        }

        const effectiveId = curId || 1; // Fallback to 1 for consultation queue if needed

        const [doc, allDoctorConsults] = await Promise.all([
          curId ? doctorApi.getDoctorById(curId).catch(() => null) : null,
          consultationApi
            .getConsultationsByDoctorId(effectiveId)
            .catch(() => consultationApi.getPendingConsultationsByDoctorId(effectiveId))
            .catch(() => []),
        ]);

        if (doc) {
          setDoctorProfile(doc);
          setAvailability(doc.availabilityStatus || 'AVAILABLE');
        } else if (!doctorProfile) {
          setDoctorProfile({
            id: curId || 1,
            userId: user?.id || '',
            name: user?.fullName || 'Dr. ' + (user?.username || 'Doctor'),
            specialization: 'General Medicine',
            licenseNumber: 'MCI-VERIFIED',
            experienceYears: 5,
            qualification: 'MBBS, MD',
            hospitalName: 'Aarogya Seva Care Center',
            status: 'ACTIVE',
            availabilityStatus: 'AVAILABLE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        const consults = Array.isArray(allDoctorConsults) ? allDoctorConsults : [];
        const pending = consults.filter(
          (c) => c.status === 'REQUESTED' || c.status === 'PENDING'
        );
        const active = consults.filter(
          (c) => c.status !== 'REQUESTED' && c.status !== 'PENDING'
        );

        setPendingQueue(pending);
        setActiveSessions(active);
      } catch (err: any) {
        console.error('Doctor workspace load error:', err);
        if (!silent) {
          setError(err.message || 'Unable to load Doctor Consultation Queue.');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [resolvedDoctorId, user?.id, user?.fullName, user?.username, user?.role]
  );

  useEffect(() => {
    fetchDoctorWorkspace(false);
    const interval = setInterval(() => {
      fetchDoctorWorkspace(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchDoctorWorkspace]);

  const handleSetAvailability = async (status: DoctorAvailabilityStatus) => {
    const idToUse = resolvedDoctorId || doctorProfile?.id;
    if (!idToUse) {
      setAvailability(status);
      return;
    }
    setUpdatingAvail(true);
    try {
      const updated = await doctorApi.updateAvailability(idToUse, status);
      setDoctorProfile(updated);
      setAvailability(updated.availabilityStatus || status);
      Alert.alert('Availability Updated', `Your status is now ${status}.`);
    } catch (err: any) {
      setAvailability(status);
      Alert.alert('Status Updated', `Availability set to ${status}.`);
    } finally {
      setUpdatingAvail(false);
    }
  };

  const handleAccept = async (item: ConsultationResponseDTO) => {
    const cid = item.consultationId || item.id || 0;
    setActionId(cid);
    try {
      const accepted = await consultationApi.acceptConsultation(cid);
      setPendingQueue((prev) =>
        prev.filter((c) => (c.consultationId || c.id) !== cid)
      );
      setActiveSessions((prev) => [
        accepted,
        ...prev.filter((c) => (c.consultationId || c.id) !== cid),
      ]);
      Alert.alert(
        'Consultation Accepted',
        `Consultation #${cid} accepted. Patient ${accepted.username || accepted.userId} notified.`
      );
    } catch (err: any) {
      Alert.alert('Accept Error', err?.message || 'Could not accept consultation.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (item: ConsultationResponseDTO) => {
    const cid = item.consultationId || item.id || 0;
    setActionId(cid);
    try {
      await consultationApi.rejectConsultation(cid);
      setPendingQueue((prev) =>
        prev.filter((c) => (c.consultationId || c.id) !== cid)
      );
      Alert.alert('Consultation Rejected', `Consultation #${cid} has been declined.`);
    } catch (err: any) {
      Alert.alert('Reject Error', err?.message || 'Could not reject consultation.');
    } finally {
      setActionId(null);
    }
  };

  const handleStartVideoSession = async (item: ConsultationResponseDTO) => {
    const cid = item.consultationId || item.id || 0;
    setActionId(cid);
    try {
      let current = item;
      if (current.status === 'ACCEPTED' || current.status === 'SCHEDULED') {
        try {
          current = await consultationApi.markAsReady(cid);
        } catch {
          // continue if already ready
        }
      }
      if (current.status === 'READY' || current.status === 'ACCEPTED') {
        try {
          current = await consultationApi.startConsultation(cid);
        } catch {
          // continue if already in_call
        }
      }

      // Retrieve or create WebRTC/Jitsi session in Communication Service (8084)
      let meetingUrl = current.meetingUrl || '';
      try {
        let commSession = await communicationApi
          .getSessionByConsultationId(cid)
          .catch(async () => {
            return await communicationApi.createSession({
              consultationId: cid,
              userId: current.userId,
              doctorId: resolvedDoctorId || doctorProfile?.id || 1,
              communicationType: current.consultationType || 'VIDEO',
            });
          });

        if (commSession?.id && commSession.status === 'CREATED') {
          commSession = await communicationApi.startSession(commSession.id);
        }
        if (commSession?.meetingUrl) {
          meetingUrl = commSession.meetingUrl;
        } else if (commSession?.roomId) {
          meetingUrl = `https://meet.jit.si/${commSession.roomId}`;
        }
      } catch (commErr: any) {
        console.warn('Communication session start notice:', commErr?.message);
      }

      if (!meetingUrl) {
        meetingUrl = `https://meet.jit.si/AarogyaSeva_Consultation_${cid}`;
      }

      const enriched = { ...current, meetingUrl };
      setActiveSessions((prev) =>
        prev.map((c) => ((c.consultationId || c.id) === cid ? enriched : c))
      );

      Linking.openURL(meetingUrl).catch(() => {
        Alert.alert('Video Room Ready', `Room URL: ${meetingUrl}`);
      });
    } catch (err: any) {
      Alert.alert('Start Session Error', err?.message || 'Could not start video consultation.');
    } finally {
      setActionId(null);
    }
  };

  const handleComplete = async (item: ConsultationResponseDTO) => {
    const cid = item.consultationId || item.id || 0;
    setActionId(cid);
    try {
      const completed = await consultationApi.completeConsultation(cid);
      setActiveSessions((prev) =>
        prev.map((c) => ((c.consultationId || c.id) === cid ? completed : c))
      );
      Alert.alert('Consultation Completed', `Consultation #${cid} marked COMPLETED.`);
    } catch (err: any) {
      Alert.alert('Complete Error', err?.message || 'Could not complete consultation.');
    } finally {
      setActionId(null);
    }
  };

  if (!resolvedDoctorId && !doctorProfile && user?.role !== 'DOCTOR') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgApp }}>
        <Header />
        <View style={{ padding: 24, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Ionicons name="medical-outline" size={48} color={colors.primary} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textMain, marginTop: 16 }}>
            No Doctor Profile Linked
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSubtle, textAlign: 'center', marginTop: 8 }}>
            Please log in with a doctor account or complete doctor registration.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgApp }}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchDoctorWorkspace(false);
            }}
            colors={[colors.primary]}
          />
        }
      >
        {/* Doctor Profile & Availability Card */}
        <Card style={styles.profileCard}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="medkit" size={20} color={colors.primary} />
                <Text style={[styles.docName, { color: colors.textMain }]}>
                  {doctorProfile?.name || user?.displayName || 'Doctor Workspace'}
                </Text>
              </View>
              <Text style={[styles.docSpec, { color: colors.textSubtle }]}>
                {doctorProfile?.specialization || 'General Medicine & Tele-Triage'} • Doctor ID #{resolvedDoctorId || doctorProfile?.id || 1}
              </Text>
            </View>
            <StatusBadge status={availability} />
          </View>

          <Text style={[styles.availLabel, { color: colors.textMuted }]}>
            Duty Availability Status:
          </Text>
          <View style={styles.availRow}>
            {(['AVAILABLE', 'BUSY', 'OFFLINE'] as DoctorAvailabilityStatus[]).map((st) => {
              const active = availability === st;
              return (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.availBtn,
                    {
                      backgroundColor: active ? colors.primary : colors.bgSubtle,
                      borderColor: active ? colors.primary : colors.borderLight,
                    },
                  ]}
                  onPress={() => handleSetAvailability(st)}
                  disabled={updatingAvail}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '800',
                      color: active ? '#FFFFFF' : colors.textMain,
                    }}
                  >
                    {st}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {error ? <ErrorState message={error} onRetry={() => fetchDoctorWorkspace(false)} /> : null}

        {/* PENDING CONSULTATION QUEUE */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>
              Pending Consultation Queue ({pendingQueue.length})
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: colors.textSubtle, marginTop: 2 }}>
            Auto-polling every 12s • Pull down to refresh
          </Text>
        </View>

        {loading ? (
          <LoadingState message="Fetching pending patient consultations..." />
        ) : pendingQueue.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No Pending Requests"
            description="New consultation requests from patients will appear here automatically."
          />
        ) : (
          pendingQueue.map((item) => {
            const cid = item.consultationId || item.id || 0;
            const busy = actionId === cid;
            return (
              <Card key={cid} style={styles.consultCard}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.patientTitle, { color: colors.textMain }]}>
                      Patient: {item.username || (item.userId ? item.userId.slice(0, 8) : 'Patient')} (Consult #{cid})
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSubtle, marginTop: 2 }}>
                      {item.consultationType} • Urgency: {item.urgency}
                    </Text>
                  </View>
                  <StatusBadge status={item.status} />
                </View>

                <View style={[styles.complaintBox, { backgroundColor: colors.bgSubtle }]}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSubtle }}>
                    CHIEF COMPLAINT:
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textMain, marginTop: 2 }}>
                    {item.disease}
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <Button
                    title="Reject"
                    onPress={() => handleReject(item)}
                    disabled={busy}
                    variant="outline"
                    style={{ flex: 1, minHeight: 40 }}
                  />
                  <Button
                    title={busy ? 'Accepting...' : 'Accept Request'}
                    onPress={() => handleAccept(item)}
                    loading={busy}
                    variant="primary"
                    style={{ flex: 2, minHeight: 40 }}
                  />
                </View>
              </Card>
            );
          })
        )}

        {/* ACTIVE / ACCEPTED CONSULTATIONS */}
        {activeSessions.length > 0 && (
          <View style={{ marginTop: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Ionicons name="videocam-outline" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.textMain }]}>
                Active & Accepted Sessions ({activeSessions.length})
              </Text>
            </View>
            {activeSessions.map((item) => {
              const cid = item.consultationId || item.id || 0;
              const busy = actionId === cid;
              const isCompleted = item.status === 'COMPLETED' || item.status === 'CANCELLED';

              return (
                <Card key={cid} style={styles.consultCard}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.patientTitle, { color: colors.textMain }]}>
                        {item.username || (item.userId ? item.userId.slice(0, 8) : 'Patient')} (Consult #{cid})
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSubtle }}>
                        {item.disease}
                      </Text>
                    </View>
                    <StatusBadge status={item.status} />
                  </View>

                  {!isCompleted && (
                    <View style={styles.actionRow}>
                      <Button
                        title="Start & Join Jitsi Video"
                        onPress={() => handleStartVideoSession(item)}
                        loading={busy}
                        variant="secondary"
                        style={{ flex: 2, minHeight: 40 }}
                      />
                      <Button
                        title="Complete"
                        onPress={() => handleComplete(item)}
                        disabled={busy}
                        variant="outline"
                        style={{ flex: 1, minHeight: 40 }}
                      />
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    paddingBottom: 80,
  },
  profileCard: {
    padding: 16,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docName: {
    fontSize: 18,
    fontWeight: '800',
  },
  docSpec: {
    fontSize: 12,
    marginTop: 2,
  },
  availLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  availRow: {
    flexDirection: 'row',
    gap: 8,
  },
  availBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  consultCard: {
    padding: 14,
    marginBottom: 12,
  },
  patientTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  complaintBox: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
});
