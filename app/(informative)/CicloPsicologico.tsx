import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import BackButton from "../../components/BackButton";

export default function CicloPsicologico() {
  const { theme } = useTheme();

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <BackButton />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.contentBox, { backgroundColor: "#fff" }]}>
          <Text style={[styles.title, { color: theme.primary }]}>
            Como o ciclo menstrual afeta psicologicamente
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            O ciclo menstrual provoca alterações fisiológicas significativas que impactam diretamente a saúde mental e emocional das mulheres. As variações hormonais regulam funções neuropsicológicas importantes, afetando humor, cognição, comportamento e até a estrutura cerebral.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>Flutuações hormonais e efeitos no humor</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Durante as quatro fases do ciclo — folicular, ovulatória, lútea e menstrual —, há alterações nos níveis de estrogênio e progesterona. O aumento de estrogênio na fase ovulatória costuma gerar mais energia e sociabilidade. Por outro lado, a queda hormonal na fase lútea é frequentemente associada a sintomas depressivos, irritabilidade e ansiedade.
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Condições como a Síndrome Pré-Menstrual (SPM) e o Transtorno Disfórico Pré-Menstrual (TDPM) exemplificam como essas oscilações podem afetar severamente a saúde emocional, provocando quadros de tristeza, alterações de humor e até depressão em cerca de 3% a 8% das mulheres.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>Alterações cerebrais e riscos psicológicos</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Estudos com neuroimagem revelam que regiões do cérebro como o hipocampo e a amígdala sofrem modificações em volume e atividade conforme os níveis hormonais, afetando memória, emoções e resposta ao estresse. Essas mudanças podem potencializar quadros psiquiátricos, como depressão, transtornos de ansiedade e bipolaridade, especialmente em mulheres com predisposição genética.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>Cuidado e estratégias de manejo</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            O autoconhecimento e a observação do próprio ciclo são fundamentais para reconhecer padrões emocionais e buscar estratégias adequadas de cuidado. A Terapia Cognitivo-Comportamental (TCC) pode ser eficaz na gestão dos sintomas, assim como práticas de relaxamento, atividades físicas e, em alguns casos, intervenções médicas.
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            A conscientização sobre o impacto do ciclo menstrual na saúde mental é essencial para que mulheres possam identificar sinais de alerta, buscar apoio e garantir bem-estar emocional em todas as fases do ciclo.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>Fontes</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Gonda et al., 2008. Progress in Neuro-Psychopharmacology and Biological Psychiatry.{"\n"}
            DSM-5, American Psychiatric Association, 2013.{"\n"}
            Lisofsky et al., 2015. Hormones and Behavior.{"\n"}
            Petersen et al., 2014. NeuroImage.{"\n"}
            Yonkers & Simoni, 2018. American Journal of Obstetrics and Gynecology.{"\n"}
            Schmalenberger et al., 2021. Psychological Bulletin.
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
