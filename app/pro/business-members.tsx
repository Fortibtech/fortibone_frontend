// app/business-members/[id].tsx
import { AddMemberData, BusinessesService, BusinessMember } from '@/api';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface MemberWithLoading extends BusinessMember {
  isUpdating?: boolean;
}

const BusinessMembersScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [members, setMembers] = useState<MemberWithLoading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberWithLoading | null>(null);
  const [newMemberData, setNewMemberData] = useState<AddMemberData>({
    email: '',
    role: 'MEMBER'
  });

  useEffect(() => {
    if (id) {
      loadMembers();
    }
  }, [id]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const membersData = await BusinessesService.getMembers(id);
      setMembers(membersData);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      Alert.alert('Erreur', 'Impossible de charger les membres');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  };

  const handleAddMember = async () => {
    if (!newMemberData.email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un email');
      return;
    }

    try {
      await BusinessesService.addMember(id, newMemberData);
      setAddModalVisible(false);
      setNewMemberData({ email: '', role: 'MEMBER' });
      await loadMembers();
      Alert.alert('Succès', 'Membre ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le membre');
    }
  };

  const handleUpdateRole = async (newRole: string) => {
    if (!selectedMember) return;

    try {
      // Marquer le membre comme en cours de mise à jour
      setMembers(prev => prev.map(member => 
        member.id === selectedMember.id 
          ? { ...member, isUpdating: true }
          : member
      ));

      await BusinessesService.updateMemberRole(id, selectedMember.id, { 
        role: newRole as any 
      });
      
      setEditModalVisible(false);
      setSelectedMember(null);
      await loadMembers();
      Alert.alert('Succès', 'Rôle mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le rôle');
      // Retirer le statut de mise à jour en cas d'erreur
      setMembers(prev => prev.map(member => 
        member.id === selectedMember.id 
          ? { ...member, isUpdating: false }
          : member
      ));
    }
  };

  const handleRemoveMember = (member: MemberWithLoading) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer ${member.firstName} ${member.lastName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => confirmRemoveMember(member)
        }
      ]
    );
  };

  const confirmRemoveMember = async (member: MemberWithLoading) => {
    try {
      // Marquer le membre comme en cours de suppression
      setMembers(prev => prev.map(m => 
        m.id === member.id 
          ? { ...m, isUpdating: true }
          : m
      ));

      await BusinessesService.removeMember(id, member.id);
      await loadMembers();
      Alert.alert('Succès', 'Membre supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer le membre');
      // Retirer le statut de mise à jour en cas d'erreur
      setMembers(prev => prev.map(m => 
        m.id === member.id 
          ? { ...m, isUpdating: false }
          : m
      ));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return '#e53e3e';
      case 'ADMIN': return '#dd6b20';
      case 'MEMBER': return '#38a169';
      default: return '#718096';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER': return 'Propriétaire';
      case 'ADMIN': return 'Administrateur';
      case 'MEMBER': return 'Membre';
      default: return role;
    }
  };

  const renderMember = ({ item }: { item: MemberWithLoading }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.firstName[0]?.toUpperCase()}{item.lastName[0]?.toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.memberDetails}>
          <Text style={styles.memberName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.memberEmail}>{item.email}</Text>
          <View style={styles.roleContainer}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
              <Text style={styles.roleText}>{getRoleLabel(item.role)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.memberActions}>
        {item.isUpdating ? (
          <ActivityIndicator size="small" color="#059669" />
        ) : (
          <>
            {item.role !== 'OWNER' && (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setSelectedMember(item);
                    setEditModalVisible(true);
                  }}
                >
                  <Ionicons name="pencil" size={20} color="#059669" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleRemoveMember(item)}
                >
                  <Ionicons name="trash" size={20} color="#e53e3e" />
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#059669" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Chargement des membres...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#059669" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#059669" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membres de l'entreprise</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#059669" />
        </TouchableOpacity>
      </View>

      {/* Members List */}
      <FlatList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        style={styles.membersList}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aucun membre trouvé</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setAddModalVisible(true)}
            >
              <Text style={styles.emptyButtonText}>Ajouter un membre</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add Member Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter un membre</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={newMemberData.email}
                  onChangeText={(email) => setNewMemberData({ ...newMemberData, email })}
                  placeholder="exemple@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rôle</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newMemberData.role}
                    onValueChange={(role) => setNewMemberData({ ...newMemberData, role: role as any })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Membre" value="MEMBER" />
                    <Picker.Item label="Administrateur" value="ADMIN" />
                  </Picker>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setAddModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleAddMember}
                >
                  <Text style={styles.confirmButtonText}>Ajouter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le rôle</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {selectedMember && (
                <>
                  <Text style={styles.memberModalName}>
                    {selectedMember.firstName} {selectedMember.lastName}
                  </Text>
                  <Text style={styles.memberModalEmail}>{selectedMember.email}</Text>
                  
                  <View style={styles.roleOptions}>
                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        selectedMember.role === 'MEMBER' && styles.roleOptionSelected
                      ]}
                      onPress={() => handleUpdateRole('MEMBER')}
                    >
                      <Text style={[
                        styles.roleOptionText,
                        selectedMember.role === 'MEMBER' && styles.roleOptionTextSelected
                      ]}>
                        Membre
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        selectedMember.role === 'ADMIN' && styles.roleOptionSelected
                      ]}
                      onPress={() => handleUpdateRole('ADMIN')}
                    >
                      <Text style={[
                        styles.roleOptionText,
                        selectedMember.role === 'ADMIN' && styles.roleOptionTextSelected
                      ]}>
                        Administrateur
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 20,
  },
  membersList: {
    flex: 1,
    padding: 15,
  },
  memberCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  deleteButton: {
    backgroundColor: '#ffe5e5',
    borderRadius: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#ccc',
    marginTop: 20,
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#059669',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  memberModalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  memberModalEmail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  roleOptions: {
    gap: 10,
  },
  roleOption: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  roleOptionSelected: {
    borderColor: '#059669',
    backgroundColor: '#e8f5e8',
  },
  roleOptionText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  roleOptionTextSelected: {
    color: '#059669',
  },
});

export default BusinessMembersScreen;