// api/hooks.ts - Hooks personnalisés pour les entreprises

import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { BusinessesService } from './';
import { SelectedBusinessManager } from './selectedBusinessManager';
import type {
    AddMemberData,
    Business,
    BusinessFilters,
    BusinessMember,
    CreateBusinessData,
    UpdateMemberRoleData,
    UpdateOpeningHoursData
} from './types';

// Hook pour gérer une entreprise spécifique
export const useBusiness = (businessId?: string) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBusiness = useCallback(async () => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      setError(null);
      const businessData = await BusinessesService.getBusinessById(businessId);
      setBusiness(businessData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
      console.error('Erreur lors du chargement de l\'entreprise:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const updateBusiness = useCallback(async (data: Partial<CreateBusinessData>) => {
    if (!businessId) return null;
    
    try {
      setLoading(true);
      setError(null);
      const updatedBusiness = await BusinessesService.updateBusiness(businessId, data);
      setBusiness(updatedBusiness);
      return updatedBusiness;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const deleteBusiness = useCallback(async () => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      setError(null);
      await BusinessesService.deleteBusiness(businessId);
      setBusiness(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const uploadLogo = useCallback(async (file: any) => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      await BusinessesService.uploadLogo(businessId, file);
      await loadBusiness(); // Recharger pour voir la nouvelle image
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [businessId, loadBusiness]);

  const uploadCover = useCallback(async (file: any) => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      await BusinessesService.uploadCover(businessId, file);
      await loadBusiness(); // Recharger pour voir la nouvelle image
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [businessId, loadBusiness]);

  useEffect(() => {
    loadBusiness();
  }, [loadBusiness]);

  return {
    business,
    loading,
    error,
    refetch: loadBusiness,
    updateBusiness,
    deleteBusiness,
    uploadLogo,
    uploadCover
  };
};

// Hook pour gérer les membres d'une entreprise
export const useBusinessMembers = (businessId?: string) => {
  const [members, setMembers] = useState<BusinessMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      setError(null);
      const membersData = await BusinessesService.getMembers(businessId);
      setMembers(membersData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
      console.error('Erreur lors du chargement des membres:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const addMember = useCallback(async (data: AddMemberData) => {
    if (!businessId) return null;
    
    try {
      setLoading(true);
      setError(null);
      const newMember = await BusinessesService.addMember(businessId, data);
      await loadMembers(); // Recharger la liste
      return newMember;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [businessId, loadMembers]);

  const updateMemberRole = useCallback(async (memberId: string, data: UpdateMemberRoleData) => {
    if (!businessId) return null;
    
    try {
      setLoading(true);
      setError(null);
      const updatedMember = await BusinessesService.updateMemberRole(businessId, memberId, data);
      await loadMembers(); // Recharger la liste
      return updatedMember;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [businessId, loadMembers]);

  const removeMember = useCallback(async (memberId: string) => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      setError(null);
      await BusinessesService.removeMember(businessId, memberId);
      await loadMembers(); // Recharger la liste
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [businessId, loadMembers]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  return {
    members,
    loading,
    error,
    refetch: loadMembers,
    addMember,
    updateMemberRole,
    removeMember
  };
};

// Hook pour gérer les statistiques d'une entreprise
export const useBusinessStats = (businessId?: string) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      setError(null);
      // TODO: Implémenter l'endpoint pour les statistiques
      // const statsData = await BusinessesService.getBusinessStats(businessId);
      // setStats(statsData);
      
      // Simulation temporaire
      const mockStats = {
        totalMembers: 5,
        totalOrders: 142,
        totalRevenue: 25430,
        averageRating: 4.6,
        reviewCount: 23,
        isActive: true,
        lastActivity: new Date().toISOString()
      };
      setStats(mockStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
      console.error('Erreur lors du chargement des statistiques:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refetch: loadStats
  };
};

// Hook pour gérer la liste des entreprises
export const useBusinesses = (filters?: BusinessFilters) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const businessesData = await BusinessesService.getBusinesses(filters);
      setBusinesses(businessesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
      console.error('Erreur lors du chargement des entreprises:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createBusiness = useCallback(async (data: CreateBusinessData) => {
    try {
      setLoading(true);
      setError(null);
      const newBusiness = await BusinessesService.createBusiness(data);
      await loadBusinesses(); // Recharger la liste
      return newBusiness;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadBusinesses]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  return {
    businesses,
    loading,
    error,
    refetch: loadBusinesses,
    createBusiness
  };
};

// Hook pour gérer l'entreprise sélectionnée
export const useSelectedBusiness = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSelectedBusiness = useCallback(async () => {
    try {
      setLoading(true);
      const business = await SelectedBusinessManager.getSelectedBusiness();
      setSelectedBusiness(business);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'entreprise sélectionnée:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectBusiness = useCallback(async (business: Business) => {
    try {
      setLoading(true);
      await BusinessesService.selectBusiness(business);
      setSelectedBusiness(business);
    } catch (err) {
      console.error('Erreur lors de la sélection:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSelectedBusiness = useCallback(async () => {
    try {
      setLoading(true);
      await BusinessesService.clearSelectedBusiness();
      setSelectedBusiness(null);
    } catch (err) {
      console.error('Erreur lors de la désélection:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSelectedBusiness();
  }, [loadSelectedBusiness]);

  return {
    selectedBusiness,
    loading,
    selectBusiness,
    clearSelectedBusiness,
    refetch: loadSelectedBusiness
  };
};

// Hook pour les actions communes sur les entreprises
export const useBusinessActions = () => {
  const [loading, setLoading] = useState(false);

  const updateOpeningHours = useCallback(async (businessId: string, data: UpdateOpeningHoursData) => {
    try {
      setLoading(true);
      await BusinessesService.updateOpeningHours(businessId, data);
      Alert.alert('Succès', 'Horaires d\'ouverture mis à jour');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      Alert.alert('Erreur', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmDeleteBusiness = useCallback(async (business: Business, onConfirm: () => void) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer "${business.name}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: onConfirm
        }
      ]
    );
  }, []);

  const confirmRemoveMember = useCallback((member: BusinessMember, onConfirm: () => void) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer ${member.firstName} ${member.lastName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: onConfirm
        }
      ]
    );
  }, []);

  return {
    loading,
    updateOpeningHours,
    confirmDeleteBusiness,
    confirmRemoveMember
  };
};