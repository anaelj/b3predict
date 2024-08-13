import pandas as pd
import tkinter as tk
from tkinter import filedialog

def combinar_planilhas_e_salvar():
    # Abrir uma janela para selecionar os arquivos
    root = tk.Tk()
    root.withdraw()  # Esconde a janela principal

    # Selecionar múltiplos arquivos
    file_paths = filedialog.askopenfilenames(filetypes=[("Excel files", "*.xlsx")])

    if not file_paths:
        print("Nenhum arquivo selecionado.")
        return

    # Inicializar uma lista para armazenar os DataFrames
    dataframes = []

    # Iterar sobre os arquivos selecionados
    for file_path in file_paths:
        # Ler a planilha
        df = pd.read_excel(file_path)
        
        # Adicionar DataFrame à lista
        dataframes.append(df)

    # Concatenar todos os DataFrames
    df_combinado = pd.concat(dataframes, ignore_index=True)

    # Ordenar os dados pela coluna 'Data'
    if 'Data' in df_combinado.columns:
        # Converter a coluna 'Data' para datetime, especificando o formato
        df_combinado['Data'] = pd.to_datetime(df_combinado['Data'], format='%d/%m/%Y', errors='coerce')
        df_combinado = df_combinado.sort_values(by='Data')
    else:
        print("A coluna 'Data' não foi encontrada em uma ou mais planilhas.")
        return

    # Salvar o DataFrame combinado em uma nova planilha
    output_file = 'planilha_combinada.xlsx'
    df_combinado.to_excel(output_file, index=False)

    print(f"Planilha combinada salva como '{output_file}'.")

if __name__ == "__main__":
    combinar_planilhas_e_salvar()
