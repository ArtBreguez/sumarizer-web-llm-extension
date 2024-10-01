"use strict";

// Importa o arquivo CSS para estilização da interface da extensão
import "./popup.css";

// Importa os módulos necessários do pacote @mlc-ai/web-llm para utilizar a engine LLM
import {
  ChatCompletionMessageParam, // Tipo para mensagens de chat com papéis (user, assistant, etc.)
  CreateExtensionServiceWorkerMLCEngine, // Função para criar a engine do modelo no Service Worker da extensão
  MLCEngineInterface, // Interface da engine que será usada
  InitProgressReport, // Tipo para o relatório de progresso de inicialização
} from "@mlc-ai/web-llm";
import { ProgressBar, Line } from "progressbar.js"; // Importa biblioteca para criar barras de progresso

/***************** UI Elements (Elementos da Interface) *****************/

// Controla se o conteúdo da aba ativa será usado como contexto. Por padrão, está definido como "false"
const useContext = false;

// Função utilitária para adicionar atrasos (usada na função sleep para esperar alguns milissegundos)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Referências aos elementos de entrada e botão da interface
const queryInput = document.getElementById("query-input")!;
const submitButton = document.getElementById("submit-button")!;

// Flag que indica se os parâmetros do modelo ainda estão sendo carregados
let isLoadingParams = false;

// Inicialmente, o botão de enviar está desabilitado até que o modelo seja carregado completamente
(<HTMLButtonElement>submitButton).disabled = true;

// Criação de uma barra de progresso que será mostrada enquanto o modelo está sendo carregado
const progressBar: ProgressBar = new Line("#loadingContainer", {
  strokeWidth: 4, // Largura da linha
  easing: "easeInOut", // Animação de suavização
  duration: 1400, // Duração da animação em milissegundos
  color: "#ffd166", // Cor da barra
  trailColor: "#eee", // Cor da trilha (fundo)
  trailWidth: 1, // Largura da trilha
  svgStyle: { width: "100%", height: "100%" }, // Estilização SVG
});

/***************** Web-LLM MLCEngine Configuration (Configuração da engine do modelo) *****************/

// Função de callback chamada durante a inicialização da engine para atualizar o progresso
const initProgressCallback = (report: InitProgressReport) => {
  progressBar.animate(report.progress, {
    duration: 50, // Atualiza a barra de progresso rapidamente a cada relatório
  });
  // Se o progresso chegar a 100% (1.0), habilita os inputs
  if (report.progress == 1.0) {
    enableInputs();
  }
};

// Inicializa a engine com o modelo SmolLM-360M-Instruct
const engine: MLCEngineInterface = await CreateExtensionServiceWorkerMLCEngine(
  "SmolLM-360M-Instruct-q4f16_1-MLC", // Modelo utilizado
  { initProgressCallback: initProgressCallback } // Callback para exibir o progresso da inicialização
);

const chatHistory: ChatCompletionMessageParam[] = []; // História do chat (não utilizada neste exemplo)

isLoadingParams = true; // Marca que os parâmetros ainda estão carregando

// Função para habilitar os inputs da interface quando o modelo estiver totalmente carregado
function enableInputs() {
  if (isLoadingParams) {
    sleep(500); // Espera 500ms antes de habilitar os inputs (só para garantir)
    (<HTMLButtonElement>submitButton).disabled = false; // Habilita o botão de envio
    const loadingBarContainer = document.getElementById("loadingContainer")!;
    loadingBarContainer.remove(); // Remove o container da barra de progresso após o carregamento
    queryInput.focus(); // Foca no campo de entrada de texto
    isLoadingParams = false; // Define que os parâmetros foram totalmente carregados
  }
}

/***************** Event Listeners (Ouvintes de Eventos) *****************/

// Desabilita o botão de enviar se o campo de entrada estiver vazio
queryInput.addEventListener("keyup", () => {
  if ((<HTMLInputElement>queryInput).value === "") {
    (<HTMLButtonElement>submitButton).disabled = true;
  } else {
    (<HTMLButtonElement>submitButton).disabled = false;
  }
});

// Quando o usuário pressionar "Enter", simula o clique no botão de envio
queryInput.addEventListener("keyup", (event) => {
  if (event.code === "Enter") {
    event.preventDefault(); // Impede o comportamento padrão do Enter (que recarregaria a página)
    submitButton.click(); // Simula o clique no botão de enviar
  }
});

// Função que será chamada quando o botão de enviar for clicado
async function handleClick() {
  // Captura a mensagem digitada pelo usuário
  const message = (<HTMLInputElement>queryInput).value;
  console.log("message", message); // Exibe a mensagem no console para debug

  // Limpa a resposta anterior
  document.getElementById("answer")!.innerHTML = "";
  // Esconde o wrapper da resposta
  document.getElementById("answerWrapper")!.style.display = "none";
  // Mostra o indicador de carregamento enquanto a resposta está sendo gerada
  document.getElementById("loading-indicator")!.style.display = "block";

  // Define as mensagens do chat, incluindo o papel do sistema e do usuário
  const messagess: ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a helpful AI assistant that summarizes text." },
    { role: "user", content: message }, // Mensagem do usuário capturada da interface
  ];

  // Envia as mensagens para o modelo LLM e aguarda a resposta
  const completion = await engine.chat.completions.create({
    messages: messagess, // Mensagens enviadas para o modelo
    max_tokens: 100, // Limita a resposta a 100 tokens
    stop: ["\n"], // Define o caractere de parada como uma nova linha
  });

  // Atualiza a resposta gerada na interface
  updateAnswer(completion.choices[0].message.content);

  console.log("completion", completion); // Exibe o objeto de conclusão no console para debug
}

// Adiciona o ouvinte de evento de clique no botão de enviar
submitButton.addEventListener("click", handleClick);

// Função para atualizar a resposta na interface
function updateAnswer(answer: string | null) {
  // Mostra o wrapper da resposta
  document.getElementById("answerWrapper")!.style.display = "block";
  // Substitui as quebras de linha por tags <br> para exibir corretamente no HTML
  const answerWithBreaks = (answer || "").replace(/\n/g, "<br>");
  document.getElementById("answer")!.innerHTML = answerWithBreaks;
  
  // Adiciona um ouvinte de evento ao botão de copiar a resposta
  document.getElementById("copyAnswer")!.addEventListener("click", () => {
    const answerText = answer || ""; // Pega o texto da resposta
    navigator.clipboard
      .writeText(answerText) // Copia a resposta para a área de transferência
      .then(() => console.log("Answer text copied to clipboard"))
      .catch((err) => console.error("Could not copy text: ", err));
  });

  // Atualiza o timestamp com a data e hora atuais
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  const time = new Date().toLocaleString("en-US", options);
  document.getElementById("timestamp")!.innerText = time; // Exibe o timestamp na interface

  // Esconde o indicador de carregamento quando a resposta for gerada
  document.getElementById("loading-indicator")!.style.display = "none";
}

// Função para buscar o conteúdo da página ativa
function fetchPageContents() {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    if (tabs[0]?.id) {
      const port = chrome.tabs.connect(tabs[0].id, { name: "channelName" });
      port.postMessage({});
      port.onMessage.addListener(function (msg) {
        console.log("Page contents:", msg.contents); // Exibe o conteúdo da página no console
        chrome.runtime.sendMessage({ context: msg.contents }); // Envia o conteúdo para o background
      });
    }
  });
}

// Quando o popup é carregado, busca o conteúdo da aba ativa se "useContext" estiver definido como true
window.onload = function () {
  if (useContext) {
    fetchPageContents();
  }
};
