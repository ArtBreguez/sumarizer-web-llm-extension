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
  const queryInput = document.getElementById("query-input") as HTMLInputElement;
  const submitButton = document.getElementById("submit-button") as HTMLButtonElement;
  const tokenRangeContainer = document.getElementById("tokenRangeContainer") as HTMLElement;
  const tokenRange = document.createElement("input") as HTMLInputElement; // Criar o input range dinâmicamente
  const tokenLabel = document.getElementById("tokenLabel") as HTMLSpanElement;
  const answerWrapper = document.getElementById("answerWrapper") as HTMLElement;
  const answerElement = document.getElementById("answer") as HTMLElement;
  const loadingIndicator = document.getElementById("loading-indicator") as HTMLElement;

  let maxTokens = 50; // Valor inicial dos tokens

  // Inicialmente, o botão de envio está desativado e o controle de tokens está mostrando "Loading model..."
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
      enableInputs();
    }
  };

  const engine: MLCEngineInterface = await CreateExtensionServiceWorkerMLCEngine(
    "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    { initProgressCallback: initProgressCallback }
  );

  function enableInputs() {
    // Habilitar os inputs quando o modelo estiver carregado
    submitButton.disabled = false;
    tokenRangeContainer.style.display = "block"; // Mostrar a barra de seleção de tokens

    // Agora atualiza o label e insere a barra de seleção de tokens
    tokenLabel.textContent = "Brief"; // Define o valor inicial como "Brief"
    tokenRange.type = "range";
    tokenRange.min = "1";
    tokenRange.max = "3";
    tokenRange.value = "1";
    tokenRangeContainer.appendChild(tokenRange);

    // Atualizar o rótulo e o valor da barra dinamicamente
    tokenRange.addEventListener("input", () => {
      switch (tokenRange.value) {
        case "1":
          tokenLabel.textContent = "Brief";
          maxTokens = 100;
          tokenLabel.style.color = "green";
          break;
        case "2":
          tokenLabel.textContent = "Medium";
          maxTokens = 250;
          tokenLabel.style.color = "orange";
          break;
        case "3":
          tokenLabel.textContent = "Long";
          maxTokens = 500;
          tokenLabel.style.color = "red";
          break;
      }
    });
  }

  /***************** Event Listeners *****************/
  queryInput.addEventListener("keyup", () => {
    submitButton.disabled = queryInput.value === "";
  });

  queryInput.addEventListener("keyup", (event) => {
    if (event.code === "Enter" && queryInput.value !== "") {
      submitButton.click();
    }
  });

  submitButton.addEventListener("click", async function () {
    const message = queryInput.value;
    console.log("message", message);

    answerElement.innerHTML = "";
    answerWrapper.style.display = "none";
    loadingIndicator.style.display = "block";

    const messagess: ChatCompletionMessageParam[] = [
      { role: "system", content: "You are a highly efficient text summarizer. Do not include any introductions, explanations, or other text. Only return the concise summary of the input." },
      { role: "user", content: message },
    ];

    const completion = await engine.chat.completions.create({
      messages: messagess,
      max_tokens: maxTokens, // Utiliza o valor atualizado dos tokens
    });

    updateAnswer(completion.choices[0].message.content);
  });

  function updateAnswer(answer: string | null) {
    answerWrapper.style.display = "block";
    answerElement.innerHTML = (answer || "").replace(/\n/g, "<br>");
    loadingIndicator.style.display = "none";
  }
});
