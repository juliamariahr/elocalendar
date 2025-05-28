import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import BackButton from "../../components/BackButton";

export default function IrregularidadesCiclo() {
  const { theme } = useTheme();

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <BackButton />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.contentBox, { backgroundColor: "#fff" }]}>
          <Text style={[styles.title, { color: theme.primary }]}>
            Irregularidades do Ciclo Menstrual
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            Irregularidades menstruais compreendem alterações na frequência, duração, intensidade ou características do ciclo menstrual. São comuns em diversas fases da vida da mulher e podem refletir desde variações fisiológicas até sinais de patologias importantes que comprometem a saúde reprodutiva.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Principais causas e mecanismos envolvidos
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            As irregularidades podem ser decorrentes de disfunções hormonais, metabólicas ou anatômicas. Entre as causas mais prevalentes destaca-se a Síndrome dos Ovários Policísticos (SOP), caracterizada por anovulação crônica e excesso de andrógenos, impactando o padrão menstrual e a fertilidade.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            Distúrbios endócrinos como hipotireoidismo e hiperprolactinemia interferem no eixo hipotálamo-hipófise-ovariano, comprometendo a ovulação e levando a ciclos irregulares ou amenorreia. Além disso, o estresse psicológico, alterações de peso e exercício físico extremo também desregulam a função menstrual.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            Outro fator relevante é o Sangramento Uterino Disfuncional (SUD), definido como sangramento uterino anormal na ausência de causa orgânica identificável. Esse quadro é mais comum na adolescência e na transição para a menopausa, fases marcadas por instabilidade hormonal.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Consequências para a saúde e qualidade de vida
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            Irregularidades menstruais podem ter importantes repercussões clínicas. A anovulação crônica compromete a fertilidade e pode resultar em hiperplasia endometrial, aumentando o risco de câncer de endométrio. Sangramentos excessivos, como na menorragia, podem causar anemia ferropriva, com impacto negativo na qualidade de vida.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            Além dos aspectos físicos, alterações menstruais afetam significativamente a saúde mental, potencializando quadros de ansiedade e depressão, especialmente quando associadas a distúrbios hormonais.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Diagnóstico e abordagem terapêutica
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            A avaliação clínica inclui anamnese detalhada, exame físico, dosagens hormonais e, quando indicado, ultrassonografia pélvica. O diagnóstico diferencial deve excluir causas anatômicas, como miomas, pólipos ou malformações uterinas.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            O tratamento depende da etiologia. Na SOP, recomenda-se modificação do estilo de vida, com redução de peso e prática regular de atividade física, além do uso de contraceptivos hormonais para regular o ciclo. Em casos de disfunção tireoidiana ou hiperprolactinemia, o manejo específico dessas condições geralmente restaura a regularidade menstrual.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            Nos casos de sangramento excessivo sem causa orgânica, o tratamento pode incluir terapias hormonais, como progestagênios cíclicos ou contraceptivos combinados, visando controle do fluxo e prevenção de complicações.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Importância do acompanhamento médico
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            A identificação precoce das causas de irregularidades menstruais é essencial para prevenir complicações e preservar a saúde reprodutiva. O acompanhamento ginecológico regular possibilita diagnóstico preciso, tratamento adequado e orientação sobre saúde menstrual e planejamento familiar.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>Fontes</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Azevedo GD, et al. Arq Bras Endocrinol Metab, 2006;50(5):876-883.{"\n"}
            Melo NR, et al. Rev Psiquiatr Clin, 2002;29(4):164-171.{"\n"}
            Reis RM, et al. Rev Bras Ginecol Obstet, 2009;31(10):477-483.{"\n"}
            Melo NR. Arq Bras Endocrinol Metab, 2002;46(2):123-130.
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
});
