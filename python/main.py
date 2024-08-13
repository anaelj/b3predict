
import requests
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime
import numpy as np

# URL da API
url = "https://valor.api.globo.com/graphql?q=%7B%22query%22:%22%7B%5Cn%20%20%20%20%20%20series(symbol:%20%5C%22VALE3%5C%22,%5Cn%20%20%20%20%20%20interval:%201,%5Cn%20%20%20%20%20%20period:%201,%5Cn%20%20%20%20%20%20startDate:%20%5C%222024-06-24T11:00:00.000Z%5C%22,%5Cn%20%20%20%20%20%20endDate:%20%5C%222024-06-25T01:30:00.000Z%5C%22)%20%7B%5Cn%20%20%20%20%20%20%20%20close%5Cn%20%20%20%20%20%20%20%20time%5Cn%20%20%20%20%20%20%20%20open%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%22%7D"

# Requisição à API
response = requests.get(url)
data = response.json()

# Extração dos dados
series = data['data']['series']
df = pd.DataFrame(series)

# Convertendo o tempo de unix timestamp para datetime
df['time'] = pd.to_datetime(df['time'], unit='s')

# Função para modelo logístico
def logistic_map(x, r):
    return r * x * (1 - x)

# Parâmetros do modelo
r = 3.7  # Parâmetro de crescimento
x0 = 0.5  # Condição inicial

# Previsões utilizando o modelo logístico
predictions = [x0]
for _ in range(len(df) - 1):
    x0 = logistic_map(x0, r)
    predictions.append(x0)

# Ajustando as previsões ao intervalo dos preços
predictions = np.array(predictions) * (df['close'].max() - df['close'].min()) + df['close'].min()

# Plotando os dados e as previsões
plt.figure(figsize=(14, 7))
plt.plot(df['time'], df['close'], label='Fechamento', marker='o')
plt.plot(df['time'], predictions, label='Previsões (Modelo Logístico)', linestyle='--', marker='x')

# Customizações do gráfico
plt.title('Cotações VALE3 e Previsões')
plt.xlabel('Tempo')
plt.ylabel('Valor')
plt.legend()
plt.grid(True)
plt.show()
