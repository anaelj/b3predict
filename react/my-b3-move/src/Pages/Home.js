// src/App.js
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { db } from "./../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore"; // Importar do Firestore modular
import CryptoJS from "crypto-js";
import { sanitizeObjectKeys } from "../utils/objects";

function App() {
  const [file, setFile] = useState(null);
  const [cpf, setCpf] = useState();
  const [loading, setLoading] = useState(false); // Adiciona estado para carregamento
  const [progress, setProgress] = useState({ current: 0, total: 0 }); // Adiciona estado para progresso

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert("Por favor, selecione um arquivo.");
      return;
    }

    if (!cpf) {
      alert("Por favor, informe o CPF.");
      return;
    }

    setLoading(true); // Inicia o carregamento

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Supondo que você queira ler a primeira planilha
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Ignorar o cabeçalho e processar os dados
        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        // Verifica se a coluna "Data" existe nos cabeçalhos
        if (!headers.includes("Data")) {
          alert("Erro: A coluna 'Data' não foi encontrada na planilha.");
          setLoading(false); // Finaliza o carregamento
          return;
        }

        setProgress({ current: 0, total: rows.length }); // Define o total de linhas para o progresso

        // Referência da coleção no Firestore
        const collectionRef = collection(db, cpf);

        // Adiciona os dados ao Firestore
        for (const [index, row] of rows.entries()) {
          let dataObject = headers.reduce((obj, header, idx) => {
            obj[header] = row[idx];
            return obj;
          }, {});

          dataObject = sanitizeObjectKeys(dataObject);

          const ID = CryptoJS.SHA256(JSON.stringify(dataObject)).toString(
            CryptoJS.enc.Hex
          );
          dataObject = { ...dataObject, ID };

          const q = query(collectionRef, where("ID", "==", ID));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            await addDoc(collectionRef, dataObject);
          } else {
            console.log(
              `Documento com ID ${ID} já existe e não será adicionado.`
            );
          }

          setProgress((prev) => ({ current: index + 1, total: prev.total }));
        }

        console.log("Dados enviados com sucesso");
        localStorage.removeItem(`transaction-${cpf}`);
        alert("Dados enviados com sucesso");
      } catch (error) {
        console.error("Erro ao enviar dados: ", error);
        alert("Erro ao enviar dados");
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="App">
      <h1>Importar Planilha e Enviar para Firebase</h1>
      <label>CPF</label>
      <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} />
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <button onClick={handleFileUpload} disabled={loading}>
        {loading ? "Processando..." : "Enviar Dados"}
      </button>
      {loading && (
        <div>
          <p>Carregando, por favor aguarde...</p>
          <progress
            value={progress.current}
            max={progress.total}
          ></progress>{" "}
          {/* Barra de progresso */}
          <p>
            {progress.current} de {progress.total} linhas processadas
          </p>{" "}
          {/* Contador de progresso */}
        </div>
      )}
    </div>
  );
}

export default App;
