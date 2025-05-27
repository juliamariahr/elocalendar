import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '../context/ThemeContext'
import { themes, ThemeName } from '../config/themes'

interface Props {
  visible: boolean
  onClose: () => void
}

export default function ThemeModal({ visible, onClose }: Props) {
  const { theme, setThemeByName } = useTheme()

  const handleSelect = (name: ThemeName) => {
    setThemeByName(name)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Escolher Tema</Text>
          {Object.values(themes).map((t) => (
            <TouchableOpacity
              key={t.name}
              style={[
                styles.option,
                { backgroundColor: t.primary },
                theme.name === t.name ? styles.selected : {},
              ]}
              onPress={() => handleSelect(t.name)}
            >
              <Text style={styles.optionText}>{t.name.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  option: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  selected: {
    borderWidth: 2,
    borderColor: '#000',
  },
  optionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
  },
  closeText: {
    color: '#333',
  },
})
