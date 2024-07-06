import requests
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import tkinter as tk
from tkinter import ttk
from datetime import datetime
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Input, Dense, LSTM
from sklearn.preprocessing import MinMaxScaler

# Função para buscar dados da API
def fetch_data(ticker, start_date, end_date):
    try:
        url = f"https://valor.api.globo.com/graphql?q=%7B%22query%22:%22%7B%5Cn%20%20%20%20%20%20series(symbol:%20%5C%22{ticker}%5C%22,%5Cn%20%20%20%20%20%20interval:%201,%5Cn%20%20%20%20%20%20period:%201,%5Cn%20%20%20%20%20%20startDate:%20%5C%22{start_date}T11:00:00.000Z%5C%22,%5Cn%20%20%20%20%20%20endDate:%20%5C%22{end_date}T01:30:00.000Z%5C%22)%20%7B%5Cn%20%20%20%20%20%20%20%20close%5Cn%20%20%20%20%20%20%20%20time%5Cn%20%20%20%20%20%20%20%20open%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%22%7D"
        response = requests.get(url)
        data = response.json()
        
        series = data['data']['series']
        df = pd.DataFrame(series)
        
        df['time'] = pd.to_datetime(df['time'], unit='s')
        
        return df
    
    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        return None

# Função para criar dataset para modelo LSTM
def create_dataset(data, time_steps=1):
    X, y = [], []
    for i in range(len(data) - time_steps):
        X.append(data[i:(i + time_steps), 0])
        y.append(data[i + time_steps, 0])
    return np.array(X), np.array(y)

# Função para treinar modelo LSTM e fazer previsões
def train_lstm(df, prediction_interval=10, time_steps=10, epochs=50):
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(df['close'].values.reshape(-1, 1))

    X, y = create_dataset(scaled_data, time_steps)

    X = X.reshape(X.shape[0], X.shape[1], 1)

    model = Sequential([
        Input(shape=(time_steps, 1)),
        LSTM(50, return_sequences=True),
        LSTM(50, return_sequences=False),
        Dense(25),
        Dense(1)
    ])

    model.compile(optimizer='adam', loss='mean_squared_error')

    model.fit(X, y, epochs=epochs, batch_size=1, verbose=0)

    future_predictions = []
    last_sequence = X[-1]
    for _ in range(prediction_interval):
        next_pred = model.predict(last_sequence.reshape(1, time_steps, 1))
        future_predictions.append(next_pred[0, 0])
        last_sequence = np.append(last_sequence[1:], next_pred, axis=0)

    future_predictions = scaler.inverse_transform(np.array(future_predictions).reshape(-1, 1))

    return future_predictions.flatten()

# Função para plotar gráfico da Média Móvel Simples (SMA)
def plot_sma(df):
    window = 30  # Janela de média móvel
    sma = df['close'].rolling(window=window).mean()

    plt.figure(figsize=(14, 7))
    plt.plot(df['time'], df['close'], label='Actual Prices', linestyle='-', marker='o')
    plt.plot(df['time'], sma, label=f'Simple Moving Average ({window} days)', linestyle='-', marker='s')

    plt.title('Simple Moving Average (SMA)')
    plt.xlabel('Time')
    plt.ylabel('Price')
    plt.legend()
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

# Função para plotar gráfico da Regressão Linear
def plot_linear_regression(df):
    x = np.arange(len(df))
    y = df['close'].values

    coeficients = np.polyfit(x, y, 1)
    polynomial = np.poly1d(coeficients)

    plt.figure(figsize=(14, 7))
    plt.plot(df['time'], df['close'], label='Actual Prices', linestyle='-', marker='o')
    plt.plot(df['time'], polynomial(x), label='Linear Regression', linestyle='-', marker='s')

    plt.title('Linear Regression')
    plt.xlabel('Time')
    plt.ylabel('Price')
    plt.legend()
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

# Função para plotar gráfico do Modelo LSTM
def plot_lstm(df):
    prediction_interval = 10
    time_steps = 10
    epochs = 50

    nn_predictions = train_lstm(df, prediction_interval, time_steps, epochs)

    future_dates = pd.date_range(start=df['time'].iloc[-1], periods=prediction_interval + 1)[1:]

    plt.figure(figsize=(14, 7))
    plt.plot(df['time'], df['close'], label='Actual Prices', linestyle='-', marker='o')
    plt.plot(future_dates, nn_predictions, label='LSTM Predictions', linestyle='-', marker='s')

    plt.title('LSTM Predictions')
    plt.xlabel('Time')
    plt.ylabel('Price')
    plt.legend()
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

# Função para criar a interface gráfica
def create_gui():
    root = tk.Tk()
    root.title("Financial Market Predictions")

    label_ticker = tk.Label(root, text="Select Ticker:")
    label_ticker.pack(pady=10)
    ticker_combo = ttk.Combobox(root, values=["VALE3", "PETR4", "ITSA4", "KLBN3", "RANI3", "ITLC34"])
    ticker_combo.pack(pady=10)
    ticker_combo.current(0)

    label_start_date = tk.Label(root, text="Start Date (YYYY-MM-DD):")
    label_start_date.pack(pady=10)
    start_date_entry = tk.Entry(root)
    start_date_entry.pack(pady=10)
    start_date_entry.insert(0, "2024-01-01")

    label_end_date = tk.Label(root, text="End Date (YYYY-MM-DD):")
    label_end_date.pack(pady=10)
    end_date_entry = tk.Entry(root)
    end_date_entry.pack(pady=10)
    end_date_entry.insert(0, "2024-06-30")

    def on_button_sma_click():
        ticker = ticker_combo.get()
        start_date = start_date_entry.get()
        end_date = end_date_entry.get()
        df = fetch_data(ticker, start_date, end_date)
        if df is not None:
            plot_sma(df)

    def on_button_linear_regression_click():
        ticker = ticker_combo.get()
        start_date = start_date_entry.get()
        end_date = end_date_entry.get()
        df = fetch_data(ticker, start_date, end_date)
        if df is not None:
            plot_linear_regression(df)

    def on_button_lstm_click():
        ticker = ticker_combo.get()
        start_date = start_date_entry.get()
        end_date = end_date_entry.get()
        df = fetch_data(ticker, start_date, end_date)
        if df is not None:
            plot_lstm(df)

    button_sma = tk.Button(root, text="Simple Moving Average (SMA)", command=on_button_sma_click)
    button_sma.pack(pady=20)

    button_linear_regression = tk.Button(root, text="Linear Regression", command=on_button_linear_regression_click)
    button_linear_regression.pack(pady=20)

    button_lstm = tk.Button(root, text="LSTM Predictions", command=on_button_lstm_click)
    button_lstm.pack(pady=20)

    root.mainloop()

# Execução do programa
if __name__ == "__main__":
    create_gui()
