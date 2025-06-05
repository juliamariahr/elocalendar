import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Dimensions, View, Text, Modal, TouchableOpacity, } from 'react-native';
import { format } from 'date-fns/format';
import { parseISO } from 'date-fns/parseISO';
import { collection, getDocs } from 'firebase/firestore';
import { useTheme } from '@/context/ThemeContext';
import { useMenstrualCycle } from '@/hooks/useMenstrualCycle';
import { auth, db } from '@/config/firebase';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import BackButton from '@/components/BackButton';
import { LineChart, PieChart, BarChart, } from 'react-native-chart-kit';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const screenWidth = Dimensions.get('window').width;
const mesesFixos = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function AnalysisScreen() {
  const { theme } = useTheme();
  const cycle = useMenstrualCycle();

  const anoAtual = new Date().getFullYear();

  const diasMenstruadosPorMesReal: Record<string, number> = {};
  if (cycle?.menstruationDaysPassados) {
    cycle.menstruationDaysPassados.forEach((d) => {
      const data = parseISO(d);
      if (data.getFullYear() === anoAtual) {
        const mes = data.getMonth();
        const nomeMes = mesesFixos[mes];
        diasMenstruadosPorMesReal[nomeMes] = (diasMenstruadosPorMesReal[nomeMes] || 0) + 1;
      }
    });
  }
  const diasData = mesesFixos.map((mes) => diasMenstruadosPorMesReal[mes] || 0);

  const [humoresPorMes, setHumoresPorMes] = useState<Record<string, Record<string, number>>>({});
  const [humoresPorAno, setHumoresPorAno] = useState<Record<string, number>>({});

  const mesesComMenstruacao = mesesFixos.reduce((count, mes) => {
    return diasMenstruadosPorMesReal[mes] && diasMenstruadosPorMesReal[mes] > 0 ? count + 1 : count;
  }, 0);

  useEffect(() => {
    const carregarHumores = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = collection(db, 'usuarios', user.uid, 'cycle_logs');
      const snapshot = await getDocs(ref);

      const porMes: Record<string, Record<string, number>> = {};
      const total: Record<string, number> = {};

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;

        if (!data.humores || !id) return;

        const dataRegistro = parseISO(id);
        if (dataRegistro.getFullYear() !== anoAtual) return;

        const mes = dataRegistro.getMonth();
        const chaveMes = `${anoAtual}-${String(mes + 1).padStart(2, '0')}`;

        porMes[chaveMes] = porMes[chaveMes] || {};
        data.humores.forEach((h: string) => {
          porMes[chaveMes][h] = (porMes[chaveMes][h] || 0) + 1;
          total[h] = (total[h] || 0) + 1;
        });
      });

      setHumoresPorMes(porMes);
      setHumoresPorAno(total);
    };

    carregarHumores();
  }, [cycle]);

  const mesAtual = `${anoAtual}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const humoresMesAtual = humoresPorMes[mesAtual] ?? {};
  const humoresAno = humoresPorAno;

  const chartConfig = {
    backgroundGradientFrom: theme.background,
    backgroundGradientTo: theme.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `${theme.primary}${Math.floor(opacity * 255).toString(16)}`,
    labelColor: () => theme.text,
    propsForBackgroundLines: {
      stroke: '#e3e3e3',
    },
    barPercentage: 0.7,
  };

  const diasPorAno: Record<string, number> = {};
  if (cycle?.menstruationDaysPassados) {
    cycle.menstruationDaysPassados.forEach((d) => {
      const data = parseISO(d);
      const ano = data.getFullYear().toString();
      diasPorAno[ano] = (diasPorAno[ano] || 0) + 1;
    });
  }
  const anosLabels = Object.keys(diasPorAno).sort();
  const diasPorAnoData = anosLabels.map((ano) => diasPorAno[ano]);

  const [modalVisible, setModalVisible] = useState(false);

  const exportarCSV = async () => {
    setModalVisible(false);

    let csv = '';

    csv += 'Dias menstruados por mês\n';
    csv += 'Mês;Dias Menstruados;Humores do Mês\n';
    mesesFixos.forEach((mes, idx) => {
      const chaveMes = `${anoAtual}-${String(idx + 1).padStart(2, '0')}`;
      const humores = humoresPorMes[chaveMes]
        ? Object.entries(humoresPorMes[chaveMes])
            .map(([h, v]) => `${h} (${v})`)
            .join(', ')
        : '';
      csv += `${mes};${diasData[idx]};${humores}\n`;
    });

    csv += '\nDias menstruados por ano\n';
    csv += 'Ano;Dias Menstruados\n';
    anosLabels.forEach((ano, idx) => {
      csv += `${ano};${diasPorAnoData[idx]}\n`;
    });

    csv += '\nResumo Anual\n';
    csv += `Meses com menstruação;${mesesComMenstruacao}\n`;
    csv += `Total de dias menstruados no ano;${diasData.reduce((a, b) => a + b, 0)}\n`;

    csv += '\nHumores no Ano\n';
    csv += 'Humor;Quantidade\n';
    Object.entries(humoresAno).forEach(([h, v]) => {
      csv += `${h};${v}\n`;
    });

    const fileUri = FileSystem.cacheDirectory + 'analise_ciclo.csv';
    await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });

    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Compartilhar CSV',
      UTI: 'public.comma-separated-values-text',
    });
  };

  const exportarPDF = async () => {
    setModalVisible(false);

    const todosHumores = Array.from(
      new Set(
        Object.values(humoresPorMes)
          .flatMap(humoresObj => Object.keys(humoresObj))
      )
    );

    let texto = `====== ANÁLISE DO CICLO ======\n\n`;

    texto += `Dias menstruados por mês (${anoAtual})\n`;
    texto += `-------------------------------\n`;
    texto += `Mês        | Dias Menstruados\n`;
    texto += `-------------------------------\n`;
    mesesFixos.forEach((mes, idx) => {
      texto += `${mes.padEnd(10)}| ${String(diasData[idx]).padEnd(16)}\n`;
    });

    texto += `\nDias menstruados por ano\n`;
    texto += `------------------------\n`;
    texto += `Ano  | Dias Menstruados\n`;
    texto += `------------------------\n`;
    anosLabels.forEach((ano, idx) => {
      texto += `${ano.padEnd(5)}| ${diasPorAnoData[idx]}\n`;
    });

    texto += `\nResumo Anual\n`;
    texto += `------------------------\n`;
    texto += `Meses com menstruação: ${mesesComMenstruacao}\n`;
    texto += `Total de dias menstruados no ano: ${diasData.reduce((a, b) => a + b, 0)}\n`;

    texto += `\nHumores no Ano\n`;
    texto += `------------------------\n`;
    if (Object.keys(humoresAno).length === 0) {
      texto += `Nenhum humor registrado.\n`;
    } else {
      Object.entries(humoresAno).forEach(([h, v]) => {
        texto += `${h.padEnd(15)}: ${v}\n`;
      });
    }

    texto += `\n==============================\n`;

    const fileUri = FileSystem.cacheDirectory + 'analise_ciclo.txt';
    await FileSystem.writeAsStringAsync(fileUri, texto, { encoding: FileSystem.EncodingType.UTF8 });

    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/plain',
      dialogTitle: 'Compartilhar Análise',
      UTI: 'public.plain-text',
    });
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton />
      <ThemedText style={[styles.title, { color: theme.text }]}>Análise do Ciclo</ThemedText>

      <View style={styles.exportButtonsContainer}>
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: theme.button }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.exportButtonText, { color: theme.buttonText }]}>Exportar Dados</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Escolha o formato</Text>
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: theme.button }]}
              onPress={exportarCSV}
            >
              <Text style={[styles.modalOptionText, { color: theme.buttonText }]}>CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: theme.button }]}
              onPress={exportarPDF}
            >
              <Text style={[styles.modalOptionText, { color: theme.buttonText }]}>TXT</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.modalCancel, { color: '#d32f2f' }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {!cycle ? (
        <ThemedText style={{ color: theme.text }}>Carregando dados...</ThemedText>
      ) : (
        <>
          <ThemedView style={[styles.card, { backgroundColor: '#fff', marginBottom: 16 }]}>
            <ThemedText style={[styles.label, { color: theme.text }]}>
              Última Menstruação: {cycle.ultimaMenstruacao ? format(parseISO(cycle.ultimaMenstruacao), 'dd/MM/yyyy') : '-'}
            </ThemedText>
            <ThemedText style={[styles.label, { color: theme.text }]}>
              Próxima Menstruação: {cycle.proximaMenstruacao ? format(parseISO(cycle.proximaMenstruacao), 'dd/MM/yyyy') : '-'}
            </ThemedText>
            <ThemedText style={[styles.label, { color: theme.text }]}>
              Ovulação: {cycle.ovulacao ? format(parseISO(cycle.ovulacao), 'dd/MM/yyyy') : '-'}
            </ThemedText>
            <ThemedText style={[styles.label, { color: theme.text }]}>
              Período fértil: {cycle.inicioFertilidade ? format(parseISO(cycle.inicioFertilidade), 'dd/MM/yyyy') : '-'} até {cycle.fimFertilidade ? format(parseISO(cycle.fimFertilidade), 'dd/MM/yyyy') : '-'}
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.card, { backgroundColor: '#fff' }]}>
            <ThemedText style={[styles.chartTitle, { color: theme.text }]}>
              Ciclos Registrados no Ano
            </ThemedText>
            <PieChart
              data={[
                {
                  name: 'Com ciclo',
                  population: mesesComMenstruacao,
                  color: theme.primary,
                  legendFontColor: theme.text,
                  legendFontSize: 12,
                },
                {
                  name: 'Sem ciclo',
                  population: 12 - mesesComMenstruacao,
                  color: '#ccc',
                  legendFontColor: theme.text,
                  legendFontSize: 12,
                },
              ]}
              width={screenWidth * 0.9}
              height={160}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={{ borderRadius: 10 }}
            />
            <ThemedText style={styles.chartCaption}>
              Total de meses com menstruação registrada
            </ThemedText>

            <ThemedText style={[styles.chartTitle, { color: theme.text, marginTop: 24 }]}>
              Ciclo nos últimos meses
            </ThemedText>
            <View style={styles.graphBox}>
              <LineChart
                data={{
                  labels: mesesFixos,
                  datasets: [{ data: diasData }],
                }}
                width={screenWidth * 0.9}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{ borderRadius: 10 }}
              />
            </View>
            <ThemedText style={styles.chartCaption}>
              Total de dias menstruados em cada mês
            </ThemedText>

            {anosLabels.length > 0 && (
              <>
                <ThemedText style={[styles.chartTitle, { color: theme.text, marginTop: 24 }]}>
                  Dias Menstruados por Ano
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator style={{ marginBottom: 8 }}>
                  <BarChart
                    data={{
                      labels: anosLabels,
                      datasets: [{ data: diasPorAnoData }],
                    }}
                    width={Math.max(screenWidth * 0.9, anosLabels.length * 60)}
                    height={220}
                    chartConfig={chartConfig}
                    style={{ borderRadius: 10 }}
                    yAxisLabel=""
                    yAxisSuffix=""
                  />
                </ScrollView>
                <ThemedText style={styles.chartCaption}>
                  Total de dias menstruados em cada ano
                </ThemedText>
              </>
            )}

            {Object.keys(humoresMesAtual).length > 0 && (
              <>
                <ThemedText style={[styles.chartTitle, { color: theme.text, marginTop: 24 }]}>
                  Humores Registrados no Mês Atual
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator style={{ marginBottom: 8 }}>
                  <BarChart
                    data={{
                      labels: Object.keys(humoresMesAtual),
                      datasets: [{ data: Object.values(humoresMesAtual) }],
                    }}
                    width={Math.max(screenWidth * 0.9, Object.keys(humoresMesAtual).length * 60)}
                    height={220}
                    chartConfig={chartConfig}
                    style={{ borderRadius: 10 }}
                    yAxisLabel=""
                    yAxisSuffix=""
                  />
                </ScrollView>
                <ThemedText style={styles.chartCaption}>
                  Frequência de cada humor neste mês
                </ThemedText>
              </>
            )}

            {Object.keys(humoresAno).length > 0 && (
              <>
                <ThemedText style={[styles.chartTitle, { color: theme.text, marginTop: 24 }]}>
                  Humores Registrados no Ano Atual
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator style={{ marginBottom: 8 }}>
                  <BarChart
                    data={{
                      labels: Object.keys(humoresAno),
                      datasets: [{ data: Object.values(humoresAno) }],
                    }}
                    width={Math.max(screenWidth * 0.9, Object.keys(humoresAno).length * 60)}
                    height={220}
                    chartConfig={chartConfig}
                    style={{ borderRadius: 10 }}
                    yAxisLabel=""
                    yAxisSuffix=""
                  />
                </ScrollView>
                <ThemedText style={styles.chartCaption}>
                  Frequência de cada humor em todo o ano
                </ThemedText>
              </>
            )}
          </ThemedView>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 16,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  chartCaption: {
    marginTop: 10,
    fontSize: 13,
    textAlign: 'center',
    color: '#888',
  },
  graphBox: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  exportButtonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  exportButton: {
    backgroundColor: '#e3e3e3',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: 260,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#333',
  },
  modalOption: {
    backgroundColor: '#e3e3e3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  modalCancel: {
    marginTop: 8,
    color: '#d32f2f',
    fontSize: 15,
  },
});
