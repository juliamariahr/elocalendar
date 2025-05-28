import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import BackButton from "../../components/BackButton";

export default function MetodosContraceptivos() {
  const { theme } = useTheme();

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <BackButton />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.contentBox, { backgroundColor: "#fff" }]}>
          <Text style={[styles.title, { color: theme.primary }]}>
            Métodos Contraceptivos
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            Métodos contraceptivos são intervenções médicas ou comportamentais que visam prevenir a gravidez. Sua escolha deve ser baseada em fatores como eficácia, segurança, efeitos colaterais, preferências pessoais e condições clínicas. Além disso, alguns métodos oferecem proteção contra infecções sexualmente transmissíveis (ISTs), enquanto outros são exclusivamente contraceptivos.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Métodos hormonais
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            Esses métodos utilizam hormônios sintéticos para inibir a ovulação, espessar o muco cervical e tornar o endométrio inadequado para implantação. Destacam-se:
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            <Text style={styles.bold}>Pílulas combinadas</Text>: associam estrogênio e progestagênio. Quando usadas corretamente, têm eficácia superior a 99%. Além da contracepção, regulam o ciclo, reduzem a dismenorreia e podem melhorar a acne. Porém, aumentam o risco de trombose venosa profunda, especialmente em fumantes ou mulheres com predisposição genética.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            <Text style={styles.bold}>Minipílula</Text>: contém apenas progestagênio, indicada para lactantes ou mulheres com contraindicação ao estrogênio. Exige uso rigoroso no mesmo horário diariamente.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            <Text style={styles.bold}>Implantes subdérmicos</Text>: bastonetes inseridos sob a pele que liberam progestagênio continuamente por até 3 anos. Altamente eficazes, com taxa de falha inferior a 1%.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            <Text style={styles.bold}>Injeções hormonais</Text>: aplicadas mensalmente ou a cada 3 meses. São práticas, mas podem causar alterações menstruais, como amenorreia ou sangramento irregular.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            <Text style={styles.bold}>Adesivos e anéis vaginais</Text>: liberam hormônios transdérmica ou localmente. Têm eficácia e perfil de segurança semelhantes às pílulas combinadas.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Dispositivos intrauterinos (DIU)
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            Os DIUs são métodos de longa duração, reversíveis, altamente eficazes (falha {"<"}1% ao ano).
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            <Text style={styles.bold}>DIU de cobre</Text>: não hormonal, provoca uma reação inflamatória no endométrio que impede a fertilização. Dura até 10 anos, mas pode aumentar o fluxo e as cólicas menstruais.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            <Text style={styles.bold}>DIU hormonal (levonorgestrel)</Text>: libera progestagênio localmente, reduzindo o espessamento endometrial e o fluxo menstrual, além de diminuir dismenorreia. Tem duração de 3 a 7 anos.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Métodos de barreira
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            Criam uma barreira física que impede o encontro entre espermatozoide e óvulo. São os únicos que também previnem ISTs.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            <Text style={styles.bold}>Preservativo masculino</Text>: feito de látex ou poliuretano, deve ser usado em todas as relações. Quando utilizado corretamente, sua eficácia contraceptiva é de cerca de 98%.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            <Text style={styles.bold}>Preservativo feminino</Text>: menos popular, mas igualmente protetor contra ISTs.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            <Text style={styles.bold}>Diafragma e capuz cervical</Text>: barreiras inseridas no fundo da vagina antes da relação. Sua eficácia depende do uso concomitante de espermicidas.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Métodos comportamentais
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            Baseiam-se na evitação de relações sexuais durante o período fértil ou na interrupção do coito.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            <Text style={styles.bold}>Tabelinha (método do calendário)</Text>: exige conhecimento rigoroso do ciclo menstrual. Tem eficácia variável e menor segurança, especialmente em mulheres com ciclos irregulares.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            <Text style={styles.bold}>Coito interrompido</Text>: embora amplamente utilizado, é pouco confiável devido à possibilidade de liberação de espermatozoides antes da ejaculação.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Métodos definitivos
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            São cirúrgicos e irreversíveis na maioria dos casos, indicados para quem tem certeza de que não deseja mais filhos.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            <Text style={styles.bold}>Laqueadura tubária</Text>: bloqueio ou corte das trompas de falópio, impedindo o encontro do óvulo com o espermatozoide.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            <Text style={styles.bold}>Vasectomia</Text>: procedimento simples e seguro realizado no homem, bloqueando a passagem dos espermatozoides.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Considerações importantes
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            A escolha do método contraceptivo deve ser individualizada, com base em orientação médica e no perfil de saúde da pessoa. É fundamental considerar aspectos como desejo reprodutivo, comodidade, efeitos colaterais e proteção contra ISTs.
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            O acesso à informação clara e de qualidade é essencial para a tomada de decisões conscientes e seguras em saúde reprodutiva.
          </Text>

          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Fontes
          </Text>

          <Text style={[styles.paragraph, { color: theme.text }]}>
            Organização Mundial da Saúde (OMS). Family Planning/Contraception, 2022.{"\n"}
            Ministério da Saúde - Cadernos de Atenção Básica: Saúde Sexual e Reprodutiva, 2021.{"\n"}
            American College of Obstetricians and Gynecologists (ACOG), Practice Bulletin No. 206: Long-Acting Reversible Contraception, 2017.{"\n"}
            Blumenthal PD, et al. Contraception. 2011;84(5):495-503.
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
