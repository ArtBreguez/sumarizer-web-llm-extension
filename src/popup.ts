"use strict";

import "./popup.css";
import {
  ChatCompletionMessageParam,
  CreateExtensionServiceWorkerMLCEngine,
  MLCEngineInterface,
  InitProgressReport,
} from "@mlc-ai/web-llm";
import { ProgressBar, Line } from "progressbar.js";

document.addEventListener("DOMContentLoaded", async function () {
  /***************** UI Elements *****************/
  const queryInput = document.getElementById("query-input") as HTMLTextAreaElement;
  const submitButton = document.getElementById("submit-button") as HTMLButtonElement;
  const summaryLength = document.getElementById("summary-length") as HTMLSelectElement;
  const answerWrapper = document.getElementById("answerWrapper") as HTMLElement;
  const answerElement = document.getElementById("answer") as HTMLElement;
  const loadingContainer = document.getElementById("loadingContainer") as HTMLElement;
  const copyButton = document.getElementById("copyAnswer") as HTMLButtonElement;

  let maxTokens = 500; // Valor inicial dos tokens
  let modelReady = false; // Variável para rastrear se o modelo está pronto

  // Inicialmente, o botão de envio está desativado
  submitButton.disabled = true;

  // Barra de progresso para carregar o modelo
  const progressBar: ProgressBar = new Line("#loadingContainer", {
    strokeWidth: 4,
    easing: "easeInOut",
    duration: 1400,
    color: "#ffd166",
    trailColor: "#eee",
    trailWidth: 1,
    svgStyle: { width: "100%", height: "100%" },
  });

  /***************** Web-LLM MLCEngine Configuration *****************/
  const initProgressCallback = (report: InitProgressReport) => {
    progressBar.animate(report.progress, {
      duration: 50,
    });
    if (report.progress === 1.0) {
      enableInputs(); // Ativar inputs quando o modelo estiver carregado
      modelReady = true; // Modelo está pronto
    }
  };

  const engine: MLCEngineInterface = await CreateExtensionServiceWorkerMLCEngine(
    "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    { initProgressCallback: initProgressCallback }
  );

  function enableInputs() {
    // Habilitar os inputs quando o modelo estiver carregado
    submitButton.disabled = false;
    submitButton.textContent = "Summarize";
    queryInput.disabled = false;
    progressBar.set(1); // Garantir que a barra de progresso esteja completa
    loadingContainer.style.display = "none"; // Esconder a barra de progresso
  }

  /***************** Event Listeners *****************/
  submitButton.addEventListener("click", async function () {
    const message = queryInput.value;
    const selectedLength = summaryLength.value;
    let summarizationLevel = selectedLength.toLowerCase();

    answerElement.innerHTML = "";
    answerWrapper.style.display = "none";

    // Alterar o texto do botão para os três pontinhos piscando
    submitButton.innerHTML = '<span class="loading-dots"></span>';
    submitButton.disabled = true; // Desativar o botão enquanto o modelo processa a resposta

    // Verificar se o modelo está carregado, caso contrário, aguardar o carregamento
    await waitForModelReady();

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a highly efficient text summarizer. Provide only the ${summarizationLevel} summary without any introductions or explanations. Just the summary content itself.`,
      },
      { role: "user", content: message },
    ];

    const completion = await engine.chat.completions.create({
      messages: messages,
      max_tokens: maxTokens,
    });

    updateAnswer(completion.choices[0].message.content);
  });

  function updateAnswer(answer: string | null) {
    answerWrapper.style.display = "block";
    answerElement.innerHTML = (answer || "").replace(/(?:\r\n|\r|\n)/g, "<br>");
    submitButton.innerHTML = "Summarize"; // Restaurar o texto do botão após a resposta ser processada
    submitButton.disabled = false; // Reativar o botão
  }

  // Função para aguardar o carregamento do modelo
  function waitForModelReady(): Promise<void> {
    return new Promise((resolve) => {
      if (modelReady) {
        resolve(); // Se o modelo já estiver pronto, resolver imediatamente
      } else {
        const interval = setInterval(() => {
          if (modelReady) {
            clearInterval(interval);
            resolve(); // Resolver a promessa quando o modelo estiver pronto
          }
        }, 100); // Verificar a cada 100ms
      }
    });
  }

  // Adicionar evento de cópia
  copyButton.onclick = () => {
    const summaryText = answerElement.innerText;
    navigator.clipboard.writeText(summaryText).then(
      () => {
        // Exibir notificação temporária de cópia
        const originalButtonContent = copyButton.innerHTML;
        copyButton.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => {
          copyButton.innerHTML = originalButtonContent; // Restaurar após 2 segundos
        }, 2000);
        console.log("Texto copiado para a área de transferência!");
      },
      (err) => {
        console.error("Erro ao copiar o texto: ", err);
      }
    );
  };
});
