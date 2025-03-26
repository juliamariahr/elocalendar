import { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { format } from "date-fns";

type CycleData = {
  ultimaMenstruacao: string;
  fimMenstruacao: string;
  proximaMenstruacao: string;
  proximaFimMenstruacao: string;
  ovulacao: string;
  inicioFertilidade: string;
  fimFertilidade: string;
  menstruationDuration: number;
};

export function useMenstrualCycle() {
  const [cycleInfo, setCycleInfo] = useState<CycleData | null>(null);
  const { refetch } = useLocalSearchParams();

  async function fetchCycleData() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, "usuarios", user.uid);
      const userDoc = await getDoc(docRef);

      if (userDoc.exists()) {
        const { menstruationStart, menstruationDays, cycleLength, menstruationDuration } = userDoc.data();

        if (menstruationStart && menstruationDays?.length > 0 && menstruationDuration) {
          calcularCiclo(menstruationStart, menstruationDays, cycleLength || 28, menstruationDuration);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar ciclo menstrual:", error);
    }
  }

  function calcularCiclo(
    menstruationStartISO: string,
    menstruationDays: string[],
    duracaoCiclo: number,
    menstruationDuration: number
  ) {
    const dataUltimaMenstruacao = new Date(`${menstruationStartISO}T12:00:00`);
    const dataFimMenstruacao = new Date(`${menstruationDays[menstruationDays.length - 1]}T12:00:00`);

    if (isNaN(dataUltimaMenstruacao.getTime()) || isNaN(dataFimMenstruacao.getTime())) {
      console.error("Erro: Datas inválidas.");
      return;
    }

    // Próxima menstruação
    const dataProximaMenstruacao = new Date(dataUltimaMenstruacao);
    dataProximaMenstruacao.setDate(dataUltimaMenstruacao.getDate() + duracaoCiclo);

    const dataProximaFimMenstruacao = new Date(dataProximaMenstruacao);
    dataProximaFimMenstruacao.setDate(dataProximaMenstruacao.getDate() + menstruationDuration - 1);

    // Ovulação e fertilidade
    const dataOvulacao = new Date(dataUltimaMenstruacao);
    dataOvulacao.setDate(dataUltimaMenstruacao.getDate() + (duracaoCiclo - 14));

    const dataInicioFertilidade = new Date(dataOvulacao);
    dataInicioFertilidade.setDate(dataOvulacao.getDate() - 5);

    const dataFimFertilidade = new Date(dataOvulacao);
    dataFimFertilidade.setDate(dataOvulacao.getDate() + 1);

    setCycleInfo({
      ultimaMenstruacao: format(dataUltimaMenstruacao, "yyyy-MM-dd"),
      fimMenstruacao: format(dataFimMenstruacao, "yyyy-MM-dd"),
      proximaMenstruacao: format(dataProximaMenstruacao, "yyyy-MM-dd"),
      proximaFimMenstruacao: format(dataProximaFimMenstruacao, "yyyy-MM-dd"),
      ovulacao: format(dataOvulacao, "yyyy-MM-dd"),
      inicioFertilidade: format(dataInicioFertilidade, "yyyy-MM-dd"),
      fimFertilidade: format(dataFimFertilidade, "yyyy-MM-dd"),
      menstruationDuration,
    });
  }

  useEffect(() => {
    fetchCycleData();
  }, [auth.currentUser, refetch]);

  return cycleInfo;
}
