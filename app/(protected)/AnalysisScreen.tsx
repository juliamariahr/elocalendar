import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Dimensions, View } from 'react-native';
import format from 'date-fns/format';
import { parseISO } from 'date-fns/parseISO';
import { collection, getDocs } from 'firebase/firestore';
import { startOfYear, endOfYear } from 'date-fns';

import { useTheme } from '@/context/ThemeContext';
import { useMenstrualCycle } from '@/hooks/useMenstrualCycle';
import { auth, db } from '@/config/firebase';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import BackButton from '@/components/BackButton';

import {
  LineChart,
  PieChart,
  BarChart,
} from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;
const mesesFixos = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function AnalysisScreen() {
  const { theme } = useTheme();
  const cycle = useMenstrualCycle();

  // Ano atual
  const anoAtual = new Date().getFullYear();

  // 1. Dias menstruados por mês (dados reais)
  const diasMenstruadosPorMesReal: Record<string, number> = {};
  if (cycle?.menstruationDaysPassados) {
    cycle.menstruationDaysPassados.forEach((d) => {
      const data = parseISO(d);
      if (data.getFullYear() === anoAtual) {
        const mes = data.getMonth(); // 0-11
        const nomeMes = mesesFixos[mes];
        diasMenstruadosPorMesReal[nomeMes] = (diasMenstruadosPorMesReal[nomeMes] || 0) + 1;
      }
    });
  }
  const diasData = mesesFixos.map((mes) => diasMenstruadosPorMesReal[mes] || 0);

  // 2. Humores por mês e ano (dados reais)
  const [humoresPorMes, setHumoresPorMes] = useState<Record<string, Record<string, number>>>({});
  const [humoresPorAno, setHumoresPorAno] = useState<Record<string, number>>({});

  // Número de meses com menstruação registrada no ano atual
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
        const id = docSnap.id; // formato esperado: yyyy-MM-dd

        if (!data.humores || !id) return;

        const dataRegistro = parseISO(id);
        if (dataRegistro.getFullYear() !== anoAtual) return;

        const mes = dataRegistro.getMonth(); // 0-11
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

  // Mes atual para humores
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

  // Agrupa os dias menstruados por ano
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

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton />
      <ThemedText style={[styles.title, { color: theme.text }]}>Análise do Ciclo</ThemedText>

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
              width={screenWidth - 60}
              height={160}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
            <ThemedText style={styles.chartCaption}>
              Total de meses com menstruação registrada
            </ThemedText>

            <ThemedText style={[styles.chartTitle, { color: theme.text, marginTop: 24 }]}>
              Dias Menstruados por Mês
            </ThemedText>
            <BarChart
              data={{
                labels: mesesFixos,
                datasets: [{ data: diasData }],
              }}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
            />
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
                    width={Math.max(screenWidth - 60, anosLabels.length * 60)}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chart}
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
                    width={Math.max(screenWidth - 60, Object.keys(humoresMesAtual).length * 60)}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chart}
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
                    width={Math.max(screenWidth - 60, Object.keys(humoresAno).length * 60)}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chart}
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
});
