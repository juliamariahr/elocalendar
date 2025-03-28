## 📱 Elo Calendário Menstrual

Aplicativo mobile desenvolvido para auxiliar mulheres no acompanhamento do ciclo menstrual, oferecendo previsões de menstruação, ovulação, fertilidade e recursos para registrar sintomas, medicamentos, anotações e muito mais. O app também proporciona uma experiência personalizada com notificações, estatísticas e exportação de dados.

## 📋 Backlog do Projeto

### Sprint 1
**Entrega esperada:** App rodando com cadastro/login e previsão do ciclo funcional.

| Sprint | Prioridade | Tarefas |
|--------|------------|---------|
| 1 | Alta | Criar conta e autenticação segura (criptografia e armazenamento seguro). |
| 1 | Alta | Permitir registro de datas de início e fim do ciclo menstrual. |
| 1 | Alta | Criar calendário para visualização do ciclo menstrual, dias férteis e ovulação. |
| 1 | Alta | Implementar cálculo da previsão do próximo período menstrual. |
| 1 | Alta | Prever a data da ovulação com base na regularidade do ciclo. |
| 1 | Alta | Garantir segurança e privacidade dos dados do usuário. |

---

### Sprint 2
**Entrega esperada:** App com registros completos, notificações e visualização no calendário.

| Sprint | Prioridade | Tarefas |
|--------|------------|---------|
| 2 | Alta | Registrar sintomas como cólicas, alterações de humor, etc. |
| 2 | Alta | Adicionar intensidade dos sintomas ao histórico. |
| 2 | Alta | Enviar notificações sobre menstruação, ovulação e eventos importantes. |
| 2 | Média | Permitir registro de uso de medicamentos/anticoncepcionais e seus efeitos. |
| 2 | Média | Registrar e acompanhar o fluxo menstrual (leve, moderado, intenso). |
| 2 | Média | Adicionar notas sobre eventos que afetam o ciclo (ex: estresse, dieta). |
| 2 | Alta | Personalizar o ciclo menstrual para ciclos irregulares. |
| 2 | Média | Implementar autenticação biométrica para facilitar o login com impressão digital. |

---

### Sprint 3
**Entrega esperada:** App completo, com análise de dados, personalização e exportação de informações.

| Sprint | Prioridade | Tarefas |
|--------|------------|---------|
| 3 | Alta | Criar gráficos e estatísticas do ciclo menstrual ao longo do tempo. |
| 3 | Média | Criar seção de dicas de saúde e bem-estar relacionadas ao ciclo. |
| 3 | Alta | Permitir exportação dos dados do ciclo para PDF/CSV. |
| 3 | Média | Enviar alertas sobre a necessidade de acompanhamento médico em ciclos irregulares. |
| 3 | Média | Permitir personalização da interface (temas e cores). |

<br>

## ▶️ Como rodar

1. **Instalar o Expo CLI (caso ainda não tenha)**:
   ```bash
   npm install -g expo-cli
   ```

2. **Instalar as dependências do projeto**:
   ```bash
   npm install
   ```

3. **Configurar o Firebase**:
   - Criar um projeto no [console do Firebase](https://console.firebase.google.com)
   - Ativar **Authentication (email/senha)** e o **Cloud Firestore**
   - Configurar o arquivo `config/firebase.ts` com a seguinte estrutura:

     ```ts
      import { initializeApp, getApps, getApp } from "firebase/app";
      import { getAuth } from "firebase/auth";
      import { getFirestore } from "firebase/firestore";
      
      const firebaseConfig = {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      };
      
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      
      const auth = getAuth(app);
      const db = getFirestore(app);
      
      export { auth, db };
     ```

4. **Rodar o projeto no ambiente de desenvolvimento**:
   ```bash
   npx expo start
   ```

5. **Executar no dispositivo**:
   - Escaneie o QR Code com o aplicativo **Expo Go** ou
   - Use um emulador Android/iOS

