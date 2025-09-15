// api/permissions.ts - Module de gestion des permissions

import type { BusinessPermission, UserPermissions } from './types';

export class BusinessPermissions {
  
  // Définition des permissions par rôle
  private static readonly ROLE_PERMISSIONS: Record<string, BusinessPermission[]> = {
    OWNER: [
      'READ_BUSINESS',
      'UPDATE_BUSINESS',
      'DELETE_BUSINESS',
      'MANAGE_MEMBERS',
      'MANAGE_HOURS',
      'VIEW_ANALYTICS'
    ],
    ADMIN: [
      'READ_BUSINESS',
      'UPDATE_BUSINESS',
      'MANAGE_MEMBERS',
      'MANAGE_HOURS',
      'VIEW_ANALYTICS'
    ],
    MEMBER: [
      'READ_BUSINESS',
      'VIEW_ANALYTICS'
    ]
  };

  // Obtenir les permissions pour un rôle donné
  static getPermissionsForRole(role: string): BusinessPermission[] {
    return this.ROLE_PERMISSIONS[role] || [];
  }

  // Vérifier si un utilisateur a une permission spécifique
  static hasPermission(userRole: string, permission: BusinessPermission): boolean {
    const permissions = this.getPermissionsForRole(userRole);
    return permissions.includes(permission);
  }

  // Vérifier si un utilisateur a plusieurs permissions
  static hasPermissions(userRole: string, requiredPermissions: BusinessPermission[]): boolean {
    const userPermissions = this.getPermissionsForRole(userRole);
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  }

  // Vérifier si un utilisateur peut lire les informations d'une entreprise
  static canReadBusiness(userRole: string): boolean {
    return this.hasPermission(userRole, 'READ_BUSINESS');
  }

  // Vérifier si un utilisateur peut modifier une entreprise
  static canUpdateBusiness(userRole: string): boolean {
    return this.hasPermission(userRole, 'UPDATE_BUSINESS');
  }

  // Vérifier si un utilisateur peut supprimer une entreprise
  static canDeleteBusiness(userRole: string): boolean {
    return this.hasPermission(userRole, 'DELETE_BUSINESS');
  }

  // Vérifier si un utilisateur peut gérer les membres
  static canManageMembers(userRole: string): boolean {
    return this.hasPermission(userRole, 'MANAGE_MEMBERS');
  }

  // Vérifier si un utilisateur peut ajouter des membres
  static canAddMember(userRole: string): boolean {
    return this.canManageMembers(userRole);
  }

  // Vérifier si un utilisateur peut supprimer un membre spécifique
  static canRemoveMember(currentUserRole: string, targetMemberRole: string): boolean {
    // Les propriétaires peuvent supprimer tout le monde sauf d'autres propriétaires
    if (currentUserRole === 'OWNER') {
      return targetMemberRole !== 'OWNER';
    }
    
    // Les admins peuvent supprimer seulement les membres
    if (currentUserRole === 'ADMIN') {
      return targetMemberRole === 'MEMBER';
    }
    
    // Les membres ne peuvent supprimer personne
    return false;
  }

  // Vérifier si un utilisateur peut modifier le rôle d'un membre
  static canChangeRole(currentUserRole: string, targetMemberRole: string, newRole: string): boolean {
    // Les propriétaires peuvent tout faire sauf créer d'autres propriétaires
    if (currentUserRole === 'OWNER') {
      return newRole !== 'OWNER';
    }
    
    // Les admins peuvent seulement modifier les membres (pas les propriétaires ou autres admins)
    if (currentUserRole === 'ADMIN') {
      return targetMemberRole === 'MEMBER' && newRole !== 'OWNER';
    }
    
    // Les membres ne peuvent rien modifier
    return false;
  }

  // Vérifier si un utilisateur peut gérer les horaires
  static canManageHours(userRole: string): boolean {
    return this.hasPermission(userRole, 'MANAGE_HOURS');
  }

  // Vérifier si un utilisateur peut voir les analytics
  static canViewAnalytics(userRole: string): boolean {
    return this.hasPermission(userRole, 'VIEW_ANALYTICS');
  }

  // Vérifier si un utilisateur peut uploader un logo
  static canUploadLogo(userRole: string): boolean {
    return this.canUpdateBusiness(userRole);
  }

  // Vérifier si un utilisateur peut uploader une image de couverture
  static canUploadCover(userRole: string): boolean {
    return this.canUpdateBusiness(userRole);
  }

  // Obtenir les actions disponibles pour un rôle
  static getAvailableActions(userRole: string): string[] {
    const actions: string[] = [];
    
    if (this.canReadBusiness(userRole)) {
      actions.push('view_details');
    }
    
    if (this.canUpdateBusiness(userRole)) {
      actions.push('edit_business', 'upload_logo', 'upload_cover');
    }
    
    if (this.canDeleteBusiness(userRole)) {
      actions.push('delete_business');
    }
    
    if (this.canManageMembers(userRole)) {
      actions.push('manage_members', 'add_member');
    }
    
    if (this.canManageHours(userRole)) {
      actions.push('manage_hours');
    }
    
    if (this.canViewAnalytics(userRole)) {
      actions.push('view_analytics');
    }
    
    return actions;
  }

  // Filtrer les entreprises selon les permissions de l'utilisateur
  static filterBusinessesByPermissions(businesses: any[], userRole: string): any[] {
    if (!this.canReadBusiness(userRole)) {
      return [];
    }
    
    // Pour l'instant, retourner toutes les entreprises si l'utilisateur peut les lire
    // Dans le futur, on pourrait filtrer selon d'autres critères
    return businesses;
  }

  // Vérifier si une action est autorisée
  static isActionAllowed(userRole: string, action: string, context?: any): boolean {
    switch (action) {
      case 'view_details':
        return this.canReadBusiness(userRole);
        
      case 'edit_business':
      case 'upload_logo':
      case 'upload_cover':
        return this.canUpdateBusiness(userRole);
        
      case 'delete_business':
        return this.canDeleteBusiness(userRole);
        
      case 'manage_members':
      case 'add_member':
        return this.canManageMembers(userRole);
        
      case 'remove_member':
        if (!context || !context.targetMemberRole) return false;
        return this.canRemoveMember(userRole, context.targetMemberRole);
        
      case 'change_role':
        if (!context || !context.targetMemberRole || !context.newRole) return false;
        return this.canChangeRole(userRole, context.targetMemberRole, context.newRole);
        
      case 'manage_hours':
        return this.canManageHours(userRole);
        
      case 'view_analytics':
        return this.canViewAnalytics(userRole);
        
      default:
        return false;
    }
  }

  // Obtenir un message d'erreur pour une permission refusée
  static getPermissionDeniedMessage(action: string): string {
    const messages: Record<string, string> = {
      'view_details': 'Vous n\'avez pas la permission de voir les détails de cette entreprise',
      'edit_business': 'Vous n\'avez pas la permission de modifier cette entreprise',
      'delete_business': 'Seul le propriétaire peut supprimer l\'entreprise',
      'manage_members': 'Vous n\'avez pas la permission de gérer les membres',
      'add_member': 'Vous n\'avez pas la permission d\'ajouter des membres',
      'remove_member': 'Vous n\'avez pas la permission de supprimer ce membre',
      'change_role': 'Vous n\'avez pas la permission de modifier ce rôle',
      'manage_hours': 'Vous n\'avez pas la permission de gérer les horaires',
      'view_analytics': 'Vous n\'avez pas la permission de voir les statistiques',
      'upload_logo': 'Vous n\'avez pas la permission de modifier le logo',
      'upload_cover': 'Vous n\'avez pas la permission de modifier l\'image de couverture'
    };
    
    return messages[action] || 'Permission refusée';
  }

  // Créer un objet UserPermissions
  static createUserPermissions(businessId: string, role: string): UserPermissions {
    return {
      businessId,
      role: role as any,
      permissions: this.getPermissionsForRole(role)
    };
  }

  // Vérifier si un rôle est valide
  static isValidRole(role: string): boolean {
    return Object.keys(this.ROLE_PERMISSIONS).includes(role);
  }

  // Obtenir la hiérarchie des rôles (du plus élevé au plus bas)
  static getRoleHierarchy(): string[] {
    return ['OWNER', 'ADMIN', 'MEMBER'];
  }

  // Comparer deux rôles (retourne true si role1 est supérieur ou égal à role2)
  static isRoleHigherOrEqual(role1: string, role2: string): boolean {
    const hierarchy = this.getRoleHierarchy();
    const index1 = hierarchy.indexOf(role1);
    const index2 = hierarchy.indexOf(role2);
    
    if (index1 === -1 || index2 === -1) {
      return false;
    }
    
    return index1 <= index2;
  }

  // Obtenir le rôle le plus élevé qu'un utilisateur peut attribuer
  static getMaxAssignableRole(currentUserRole: string): string {
    switch (currentUserRole) {
      case 'OWNER':
        return 'ADMIN'; // Les propriétaires peuvent créer des admins
      case 'ADMIN':
        return 'MEMBER'; // Les admins peuvent créer des membres
      default:
        return 'MEMBER'; // Par défaut, membre
    }
  }

  // Middleware pour vérifier les permissions dans les API calls
  static checkPermission(userRole: string, requiredPermission: BusinessPermission) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value;
      
      descriptor.value = function (...args: any[]) {
        if (!BusinessPermissions.hasPermission(userRole, requiredPermission)) {
          throw new Error(BusinessPermissions.getPermissionDeniedMessage(requiredPermission));
        }
        
        return method.apply(this, args);
      };
    };
  }
}