import { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { format, parse } from "date-fns";

type CycleData = {
  ultimaMenstruacao: string;
  fimMenstruacao: string;
  proximaMenstruacao: string;
  ovulacao: string;
  inicioFertilidade: string;
  fimFertilidade: string;
};

export function useMenstrualCycle() {
  const [cycleInfo, setCycleInfo] = useState<CycleData | null>(null);

  useEffect(() => {
    const fetchCycleData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, "usuarios", user.uid);
        const userDoc = await getDoc(docRef);

        if (userDoc.exists()) {
          const { menstruationStart, cycleLength, menstruationDuration } = userDoc.data();

          if (menstruationStart) {
            calcularCiclo(menstruationStart, cycleLength || 28, menstruationDuration || 5);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar ciclo menstrual:", error);
      }
    };

    function calcularCiclo(ultimoCiclo: string, duracaoCiclo = 28, duracaoMenstruacao = 5) {
      const [dia, mes, ano] = ultimoCiclo.split("/").map(Number);
      const dataUltimaMenstruacao = new Date(ano, mes - 1, dia);

      if (isNaN(dataUltimaMenstruacao.getTime())) {
        console.error("Erro: Data da última menstruação inválida.");
        return;
      }

      // Próxima menstruação = Última menstruação + duração do ciclo
      const dataProximaMenstruacao = new Date(dataUltimaMenstruacao);
      dataProximaMenstruacao.setDate(dataUltimaMenstruacao.getDate() + duracaoCiclo);

      // Fim da menstruação
      const dataFimMenstruacao = new Date(dataUltimaMenstruacao);
      dataFimMenstruacao.setDate(dataUltimaMenstruacao.getDate() + duracaoMenstruacao);

      // Ovulação = 14 dias antes da próxima menstruação
      const dataOvulacao = new Date(dataProximaMenstruacao);
      dataOvulacao.setDate(dataProximaMenstruacao.getDate() - 14);

      // Período fértil = 5 dias antes da ovulação até 1 dia depois
      const dataInicioFertilidade = new Date(dataOvulacao);
      dataInicioFertilidade.setDate(dataOvulacao.getDate() - 5);

      const dataFimFertilidade = new Date(dataOvulacao);
      dataFimFertilidade.setDate(dataOvulacao.getDate() + 1);

      setCycleInfo({
        ultimaMenstruacao: format(dataUltimaMenstruacao, "yyyy-MM-dd"),
        fimMenstruacao: format(dataFimMenstruacao, "yyyy-MM-dd"),
        proximaMenstruacao: format(dataProximaMenstruacao, "yyyy-MM-dd"),
        ovulacao: format(dataOvulacao, "yyyy-MM-dd"),
        inicioFertilidade: format(dataInicioFertilidade, "yyyy-MM-dd"),
        fimFertilidade: format(dataFimFertilidade, "yyyy-MM-dd"),
      });
    }

    fetchCycleData();
  }, [auth.currentUser]);

  return cycleInfo;
}
