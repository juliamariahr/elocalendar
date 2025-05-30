import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import BackButton from "../../components/BackButton";

export default function ColetorMenstrual() {
  const { theme } = useTheme();

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <BackButton />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.contentBox, { backgroundColor: "#fff" }]}>
          <Text style={[styles.title, { color: theme.primary }]}>
            Coletor Menstrual: Benefícios e Importância
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            O <Text style={styles.bold}>coletor menstrual</Text> é um dispositivo de barreira em formato de copo, geralmente feito de silicone médico hipoalergênico, que é inserido na vagina para coletar o fluxo menstrual. Tem ganhado popularidade nas últimas décadas por seus benefícios relacionados à saúde, economia e sustentabilidade.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Vantagens para a saúde
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            O coletor menstrual não altera o pH vaginal nem interfere na microbiota, ao contrário de alguns absorventes internos que podem causar ressecamento e irritações. Estudos mostram que o risco de infecções vaginais, incluindo a síndrome do choque tóxico, é <Text style={styles.bold}>extremamente baixo</Text> quando o coletor é utilizado adequadamente.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            Pesquisa publicada no <Text style={styles.bold}>Lancet Public Health (2019)</Text> analisou 43 estudos e concluiu que o coletor é <Text style={styles.bold}>seguro e aceitável</Text>, com taxas de infecção semelhantes ou menores quando comparado aos absorventes tradicionais.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Sustentabilidade e impacto ambiental
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            Cada mulher usa, em média, <Text style={styles.bold}>11 mil absorventes</Text> descartáveis ao longo da vida, gerando impacto significativo no meio ambiente. O coletor menstrual, por outro lado, pode durar até <Text style={styles.bold}>10 anos</Text> com os devidos cuidados, reduzindo drasticamente o volume de resíduos sólidos.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            A <Text style={styles.bold}>Agência de Proteção Ambiental dos EUA (EPA)</Text> alerta que absorventes e tampões descartáveis contribuem para a poluição plástica e podem liberar substâncias químicas no meio ambiente. O coletor menstrual surge, portanto, como uma alternativa ecológica e sustentável.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Aspectos econômicos
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            Embora o custo inicial do coletor menstrual seja mais elevado, ele representa uma <Text style={styles.bold}>economia substancial</Text> a longo prazo. Segundo estimativas da <Text style={styles.bold}>UNICEF</Text>, mulheres gastam anualmente entre <Text style={styles.bold}>US$ 60 e US$ 120</Text> com produtos menstruais descartáveis, enquanto um coletor custa, em média, <Text style={styles.bold}>US$ 30 a US$ 50</Text> e pode ser utilizado por vários anos.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Desafios e limitações
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            A adaptação ao uso do coletor menstrual pode exigir um <Text style={styles.bold}>período de aprendizagem</Text>. Algumas mulheres relatam dificuldades na inserção e remoção, além de desconforto inicial. No entanto, estudos indicam que, após o período de adaptação, a maioria das usuárias considera o coletor confortável e prático.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            A falta de informação adequada e o acesso limitado ainda são barreiras para a adoção ampla do coletor, especialmente em países de baixa renda, onde a educação sobre saúde menstrual é insuficiente.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Considerações finais
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            O coletor menstrual representa uma inovação importante para a <Text style={styles.bold}>saúde menstrual</Text>, aliando segurança, conforto, sustentabilidade e economia. Sua adoção depende de informação de qualidade, acesso e apoio para que mais mulheres possam se beneficiar dessa alternativa.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Fontes
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            van Eijk AM, et al. Menstrual cup use, leakage, acceptability, safety, and availability: a systematic review and meta-analysis. Lancet Public Health. 2019;4(8):e376-e393.{"\n"}
            Agência de Proteção Ambiental dos EUA (EPA). Plastic Pollution Data. 2022.{"\n"}
            UNICEF. Guidance on Menstrual Health and Hygiene. 2019.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  container: { paddingHorizontal: 10, paddingBottom: 60, paddingTop: 20 },
  contentBox: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
    marginTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
  },
});
