import pandas as pd
import tkinter as tk
from tkinter import filedialog

def importar_planilha_e_gerar_html():
    # Abrir uma janela para selecionar o arquivo
    root = tk.Tk()
    root.withdraw()  # Esconde a janela principal
    file_path = filedialog.askopenfilename(filetypes=[("Excel files", "*.xlsx")])

    if not file_path:
        print("Nenhum arquivo selecionado.")
        return

    # Ler a planilha
    df = pd.read_excel(file_path)

    # Filtrar os dados por 'Movimentação'
    filtro_transferencia = (df['Movimentação'].str.strip() == 'Transferência - Liquidação')
    filtro_dividendo = (df['Movimentação'].str.strip() == 'Dividendo')

    df_transferencia = df[filtro_transferencia]
    df_dividendo = df[filtro_dividendo]

    # Agrupar os dados pelo valor da coluna 'Produto' e somar 'Valor da Operação'
    soma_por_produto_transferencia = df_transferencia.groupby('Produto')['Valor da Operação'].sum().reset_index()
    soma_por_produto_dividendo = df_dividendo.groupby('Produto')['Valor da Operação'].sum().reset_index()

    # Calcular o total geral para cada agrupamento
    total_transferencia = soma_por_produto_transferencia['Valor da Operação'].sum()
    total_dividendo = soma_por_produto_dividendo['Valor da Operação'].sum()

    # Gerar o conteúdo HTML
    html_content = """
    <html>
    <head>
        <title>Soma do Valor da Operação por Produto</title>
    </head>
    <body>
        <h1>Soma do Valor da Operação por Produto</h1>
        <h2>Transferência - Liquidação</h2>
        <table border="1">
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Soma do Valor da Operação</th>
                </tr>
            </thead>
            <tbody>
    """

    # Adicionar as linhas da tabela para Transferência - Liquidação
    for _, row in soma_por_produto_transferencia.iterrows():
        produto = row['Produto']
        soma_valor_operacao = row['Valor da Operação']
        html_content += f"""
                <tr>
                    <td>{produto}</td>
                    <td>R$ {soma_valor_operacao:.2f}</td>
                </tr>
        """

    # Adicionar o total geral
    html_content += f"""
                <tr>
                    <td><strong>Total Geral</strong></td>
                    <td><strong>R$ {total_transferencia:.2f}</strong></td>
                </tr>
            </tbody>
        </table>
        <h2>Dividendo</h2>
        <table border="1">
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Soma do Valor da Operação</th>
                </tr>
            </thead>
            <tbody>
    """

    # Adicionar as linhas da tabela para Dividendo
    for _, row in soma_por_produto_dividendo.iterrows():
        produto = row['Produto']
        soma_valor_operacao = row['Valor da Operação']
        html_content += f"""
                <tr>
                    <td>{produto}</td>
                    <td>R$ {soma_valor_operacao:.2f}</td>
                </tr>
        """

    # Adicionar o total geral
    html_content += f"""
                <tr>
                    <td><strong>Total Geral</strong></td>
                    <td><strong>R$ {total_dividendo:.2f}</strong></td>
                </tr>
            </tbody>
        </table>
    </body>
    </html>
    """

    # Escrever o conteúdo HTML em um arquivo
    with open('resultado.html', 'w', encoding='utf-8') as file:
        file.write(html_content)

    print(f"Arquivo 'resultado.html' gerado com sucesso.")

if __name__ == "__main__":
    importar_planilha_e_gerar_html()
