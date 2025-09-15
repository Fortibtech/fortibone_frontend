// api/validation.ts - Module de validation pour les entreprises

import type {
    AddMemberData,
    CreateBusinessData,
    OpeningHour,
    UpdateOpeningHoursData,
    ValidationError,
    ValidationResult
} from './types';
  
  export class BusinessValidation {
    
    // Validation pour la création/mise à jour d'une entreprise
    static validateBusinessData(data: Partial<CreateBusinessData>): ValidationResult {
      const errors: ValidationError[] = [];
  
      // Validation du nom
      if (data.name !== undefined) {
        if (!data.name || data.name.trim().length === 0) {
          errors.push({
            field: 'name',
            message: 'Le nom de l\'entreprise est requis',
            code: 'REQUIRED'
          });
        } else if (data.name.trim().length < 2) {
          errors.push({
            field: 'name',
            message: 'Le nom doit contenir au moins 2 caractères',
            code: 'MIN_LENGTH'
          });
        } else if (data.name.trim().length > 100) {
          errors.push({
            field: 'name',
            message: 'Le nom ne peut pas dépasser 100 caractères',
            code: 'MAX_LENGTH'
          });
        }
      }
  
      // Validation de la description
      if (data.description !== undefined && data.description !== null) {
        if (data.description.length > 500) {
          errors.push({
            field: 'description',
            message: 'La description ne peut pas dépasser 500 caractères',
            code: 'MAX_LENGTH'
          });
        }
      }
  
      // Validation du type
      if (data.type !== undefined) {
        if (!data.type || data.type.trim().length === 0) {
          errors.push({
            field: 'type',
            message: 'Le type d\'entreprise est requis',
            code: 'REQUIRED'
          });
        } else {
          const validTypes = ['COMMERCANT', 'RESTAURATEUR', 'FOURNISSEUR', 'SERVICE', 'AUTRE'];
          if (!validTypes.includes(data.type.toUpperCase())) {
            errors.push({
              field: 'type',
              message: 'Type d\'entreprise invalide',
              code: 'INVALID_VALUE'
            });
          }
        }
      }
  
      // Validation de l'adresse
      if (data.address !== undefined && data.address !== null) {
        if (data.address.length > 200) {
          errors.push({
            field: 'address',
            message: 'L\'adresse ne peut pas dépasser 200 caractères',
            code: 'MAX_LENGTH'
          });
        }
      }
  
      // Validation du numéro de téléphone
      if (data.phoneNumber !== undefined && data.phoneNumber !== null) {
        if (data.phoneNumber.length > 0) {
          const phoneRegex = /^[\+]?[0-9\s\-\(\)\.]{10,25}$/;
          if (!phoneRegex.test(data.phoneNumber)) {
            errors.push({
              field: 'phoneNumber',
              message: 'Format de numéro de téléphone invalide',
              code: 'INVALID_FORMAT'
            });
          }
        }
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    // Validation pour l'ajout d'un membre
    static validateMemberData(data: AddMemberData): ValidationResult {
      const errors: ValidationError[] = [];
  
      // Validation de l'email
      if (!data.email || data.email.trim().length === 0) {
        errors.push({
          field: 'email',
          message: 'L\'email est requis',
          code: 'REQUIRED'
        });
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          errors.push({
            field: 'email',
            message: 'Format d\'email invalide',
            code: 'INVALID_FORMAT'
          });
        } else if (data.email.length > 255) {
          errors.push({
            field: 'email',
            message: 'L\'email ne peut pas dépasser 255 caractères',
            code: 'MAX_LENGTH'
          });
        }
      }
  
      // Validation du rôle
      if (!data.role) {
        errors.push({
          field: 'role',
          message: 'Le rôle est requis',
          code: 'REQUIRED'
        });
      } else {
        const validRoles = ['MEMBER', 'ADMIN'];
        if (!validRoles.includes(data.role)) {
          errors.push({
            field: 'role',
            message: 'Rôle invalide',
            code: 'INVALID_VALUE'
          });
        }
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    // Validation pour les horaires d'ouverture
    static validateOpeningHours(data: UpdateOpeningHoursData): ValidationResult {
      const errors: ValidationError[] = [];
  
      if (!data.hours || !Array.isArray(data.hours)) {
        errors.push({
          field: 'hours',
          message: 'Les horaires sont requis',
          code: 'REQUIRED'
        });
        return { isValid: false, errors };
      }
  
      // Vérifier chaque horaire
      data.hours.forEach((hour, index) => {
        const hourErrors = this.validateSingleOpeningHour(hour, index);
        errors.push(...hourErrors);
      });
  
      // Vérifier qu'il n'y a pas de doublons de jours
      const daysSeen = new Set<string>();
      data.hours.forEach((hour, index) => {
        if (daysSeen.has(hour.dayOfWeek)) {
          errors.push({
            field: `hours[${index}].dayOfWeek`,
            message: `Le jour ${hour.dayOfWeek} est défini plusieurs fois`,
            code: 'DUPLICATE_DAY'
          });
        }
        daysSeen.add(hour.dayOfWeek);
      });
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    // Validation d'un horaire spécifique
    private static validateSingleOpeningHour(hour: OpeningHour, index: number): ValidationError[] {
      const errors: ValidationError[] = [];
  
      // Validation du jour de la semaine
      const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
      if (!validDays.includes(hour.dayOfWeek)) {
        errors.push({
          field: `hours[${index}].dayOfWeek`,
          message: 'Jour de la semaine invalide',
          code: 'INVALID_VALUE'
        });
      }
  
      // Validation du format des heures
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      if (!timeRegex.test(hour.openTime)) {
        errors.push({
          field: `hours[${index}].openTime`,
          message: 'Format d\'heure d\'ouverture invalide (HH:mm)',
          code: 'INVALID_FORMAT'
        });
      }
  
      if (!timeRegex.test(hour.closeTime)) {
        errors.push({
          field: `hours[${index}].closeTime`,
          message: 'Format d\'heure de fermeture invalide (HH:mm)',
          code: 'INVALID_FORMAT'
        });
      }
  
      // Validation de la logique des horaires
      if (timeRegex.test(hour.openTime) && timeRegex.test(hour.closeTime)) {
        const openTime = this.parseTime(hour.openTime);
        const closeTime = this.parseTime(hour.closeTime);
  
        if (closeTime <= openTime) {
          errors.push({
            field: `hours[${index}]`,
            message: 'L\'heure de fermeture doit être après l\'heure d\'ouverture',
            code: 'INVALID_TIME_RANGE'
          });
        }
  
        // Vérifier des horaires raisonnables (pas plus de 24h d'ouverture)
        const diffMinutes = (closeTime - openTime);
        if (diffMinutes > 24 * 60) { // Plus de 24 heures
          errors.push({
            field: `hours[${index}]`,
            message: 'Les horaires d\'ouverture ne peuvent pas dépasser 24 heures',
            code: 'INVALID_DURATION'
          });
        }
      }
  
      return errors;
    }
  
    // Utilitaire pour parser une heure au format HH:mm en minutes
    private static parseTime(timeString: string): number {
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours * 60 + minutes;
    }
  
    // Validation de fichier d'image
    static validateImageFile(file: any, type: 'logo' | 'cover'): ValidationResult {
      const errors: ValidationError[] = [];
  
      if (!file) {
        errors.push({
          field: 'file',
          message: 'Le fichier est requis',
          code: 'REQUIRED'
        });
        return { isValid: false, errors };
      }
  
      // Vérifier le type MIME
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
        errors.push({
          field: 'file',
          message: 'Type de fichier non supporté. Utilisez JPG, PNG ou WebP',
          code: 'INVALID_FILE_TYPE'
        });
      }
  
      // Vérifier la taille
      const maxSize = type === 'logo' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB pour logo, 10MB pour cover
      if (file.size && file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        errors.push({
          field: 'file',
          message: `La taille du fichier ne peut pas dépasser ${maxSizeMB}MB`,
          code: 'FILE_TOO_LARGE'
        });
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    // Utilitaire pour nettoyer les données avant envoi
    static sanitizeBusinessData(data: Partial<CreateBusinessData>): Partial<CreateBusinessData> {
      const sanitized: Partial<CreateBusinessData> = {};
  
      if (data.name !== undefined) {
        sanitized.name = data.name.trim();
      }
  
      if (data.description !== undefined) {
        sanitized.description = data.description?.trim() || undefined;
      }
  
      if (data.type !== undefined) {
        sanitized.type = data.type.trim().toUpperCase();
      }
  
      if (data.address !== undefined) {
        sanitized.address = data.address?.trim() || undefined;
      }
  
      if (data.phoneNumber !== undefined) {
        sanitized.phoneNumber = data.phoneNumber?.trim() || undefined;
      }
  
      return sanitized;
    }
  
    // Utilitaire pour nettoyer les données de membre
    static sanitizeMemberData(data: AddMemberData): AddMemberData {
      return {
        email: data.email.trim().toLowerCase(),
        role: data.role
      };
    }
  
    // Validation rapide pour vérifier si une entreprise peut être supprimée
    static canDeleteBusiness(business: any, currentUserRole: string): ValidationResult {
      const errors: ValidationError[] = [];
  
      if (currentUserRole !== 'OWNER') {
        errors.push({
          field: 'permission',
          message: 'Seul le propriétaire peut supprimer l\'entreprise',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }
  
      // Ajouter d'autres validations si nécessaire (ex: commandes en cours, etc.)
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    // Validation pour vérifier si un utilisateur peut modifier un membre
    static canModifyMember(currentUserRole: string, targetMemberRole: string): ValidationResult {
      const errors: ValidationError[] = [];
  
      // Les propriétaires peuvent tout faire
      if (currentUserRole === 'OWNER') {
        return { isValid: true, errors: [] };
      }
  
      // Les admins ne peuvent pas modifier les propriétaires
      if (currentUserRole === 'ADMIN' && targetMemberRole === 'OWNER') {
        errors.push({
          field: 'permission',
          message: 'Les administrateurs ne peuvent pas modifier les propriétaires',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }
  
      // Les membres ne peuvent rien modifier
      if (currentUserRole === 'MEMBER') {
        errors.push({
          field: 'permission',
          message: 'Les membres ne peuvent pas modifier d\'autres membres',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  }