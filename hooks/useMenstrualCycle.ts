import { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { format } from "date-fns";

interface CycleData {
  ultimaMenstruacao: string;
  fimMenstruacao: string;
  proximaMenstruacao: string;
  proximaFimMenstruacao: string;
  ovulacao: string;
  inicioFertilidade: string;
  fimFertilidade: string;
  menstruationDuration: number;
  cycleLength: number;
  futurasMenstruacoes: { inicio: string; fim: string }[];
  menstruationDaysPassados: string[];
}

function formatarDataISO(date: string): Date | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date(`${date}T12:00:00`);
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [day, month, year] = date.split("/");
    return new Date(`${year}-${month}-${day}T12:00:00`);
  }
  return null;
}

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
        const {
          menstruationStart,
          menstruationDuration,
          cycleLength,
          menstruationDays,
        } = userDoc.data();

        if (menstruationStart && menstruationDuration && cycleLength) {
          calcularCiclo(
            menstruationStart,
            menstruationDuration,
            cycleLength,
            menstruationDays || []
          );
        }
      }
    } catch (error) {
      console.error("Erro ao buscar ciclo menstrual:", error);
    }
  }

  function calcularCiclo(
    menstruationStartISO: string,
    menstruationDuration: number,
    cycleLength: number,
    menstruationDaysPassados: string[]
  ) {
    const dataUltimaMenstruacao = formatarDataISO(menstruationStartISO);
    if (!dataUltimaMenstruacao || isNaN(dataUltimaMenstruacao.getTime())) {
      console.error("Erro: Data inválida.");
      return;
    }

    const dataFimMenstruacao = new Date(dataUltimaMenstruacao);
    dataFimMenstruacao.setDate(dataFimMenstruacao.getDate() + menstruationDuration - 1);

    const dataProximaMenstruacao = new Date(dataUltimaMenstruacao);
    dataProximaMenstruacao.setDate(dataUltimaMenstruacao.getDate() + cycleLength);

    const dataProximaFimMenstruacao = new Date(dataProximaMenstruacao);
    dataProximaFimMenstruacao.setDate(dataProximaFimMenstruacao.getDate() + menstruationDuration - 1);

    const dataOvulacao = new Date(dataUltimaMenstruacao);
    dataOvulacao.setDate(dataUltimaMenstruacao.getDate() + (cycleLength - 14));

    const dataInicioFertilidade = new Date(dataOvulacao);
    dataInicioFertilidade.setDate(dataOvulacao.getDate() - 5);

    const dataFimFertilidade = new Date(dataOvulacao);
    dataFimFertilidade.setDate(dataOvulacao.getDate() + 1);

    const futurasMenstruacoes = [];
    let proximaInicio = new Date(dataUltimaMenstruacao);
    for (let i = 0; i < 12; i++) {
      proximaInicio.setDate(proximaInicio.getDate() + cycleLength);
      const proximaFim = new Date(proximaInicio);
      proximaFim.setDate(proximaFim.getDate() + menstruationDuration - 1);
      futurasMenstruacoes.push({
        inicio: format(proximaInicio, "yyyy-MM-dd"),
        fim: format(proximaFim, "yyyy-MM-dd"),
      });
    }

    setCycleInfo({
      ultimaMenstruacao: format(dataUltimaMenstruacao, "yyyy-MM-dd"),
      fimMenstruacao: format(dataFimMenstruacao, "yyyy-MM-dd"),
      proximaMenstruacao: format(dataProximaMenstruacao, "yyyy-MM-dd"),
      proximaFimMenstruacao: format(dataProximaFimMenstruacao, "yyyy-MM-dd"),
      ovulacao: format(dataOvulacao, "yyyy-MM-dd"),
      inicioFertilidade: format(dataInicioFertilidade, "yyyy-MM-dd"),
      fimFertilidade: format(dataFimFertilidade, "yyyy-MM-dd"),
      menstruationDuration,
      cycleLength,
      futurasMenstruacoes,
      menstruationDaysPassados: menstruationDaysPassados.map((d: string) => {
        const date = formatarDataISO(d);
        return date ? format(date, "yyyy-MM-dd") : "";
      }).filter(Boolean),
    });
  }

  useEffect(() => {
    fetchCycleData();
  }, [auth.currentUser, refetch]);

  return cycleInfo;
}