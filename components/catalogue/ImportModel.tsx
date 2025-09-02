// screens/ImportModelScreen.tsx
import { CustomButton, Header } from '@/components/common/Header';
import { FilePlus, Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ImportModelProps {
  onContinue: () => void;
  onBack: () => void;
  uploadedFiles?: UploadedFile[];
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'document';
}

export const ImportModel: React.FC<ImportModelProps> = ({ 
  onContinue, 
  onBack,
  uploadedFiles = [{ id: '1', name: 'picture.png', size: '1kB', type: 'image' }]
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Ajouter un produit" 
        onBack={onBack}
      />

      <View style={styles.importContainer}>
        <Text style={styles.sectionTitle}>Importer votre modèle</Text>
        
        <UploadBox onPress={() => console.log('Upload pressed')} />
        
        {uploadedFiles.map((file) => (
          <FileItem 
            key={file.id}
            file={file}
            onDelete={(id) => console.log('Delete file:', id)}
          />
        ))}

        <CustomButton
          title="Continuer"
          onPress={onContinue}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
};

// Composant pour la zone d'upload
const UploadBox: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.importBox} onPress={onPress}>
      <View style={styles.uploadIcon}>
        <FilePlus size={30} color={'#667085'} />
      </View>
      <Text style={styles.importText}>Importer votre modèle</Text>
    </TouchableOpacity>
  );
};

// Composant pour afficher un fichier uploadé
const FileItem: React.FC<{ 
  file: UploadedFile; 
  onDelete: (id: string) => void 
}> = ({ file, onDelete }) => {
  const getFileIcon = (type: string) => {
    return type === 'image' ? '🖼️' : '📄';
  };

  return (
    <View style={styles.fileItem}>
      <View style={styles.fileIcon}>
        <Text style={styles.fileIconText}>{getFileIcon(file.type)}</Text>
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName}>{file.name}</Text>
        <Text style={styles.fileSize}>{file.size}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => onDelete(file.id)}
      >
        <Trash2 size={25} color={'#98A2B3'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  importContainer: {
    flex: 1,
    padding: 16,
    marginHorizontal: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  importBox: {
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FAFBFC',
  },
  uploadIcon: {
    marginBottom: 12,
  },
  importText: {
    fontSize: 14,
    color: '#667085',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  fileIcon: {
    marginRight: 12,
  },
  fileIconText: {
    fontSize: 20,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#6C757D',
  },
  deleteButton: {
    padding: 4,
  },
  continueButton: {
    marginTop: 'auto',
  },
});