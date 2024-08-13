#esta funcionando porem mostra somente os 3 futuros

import requests
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import tkinter as tk
from tkinter import ttk
from datetime import datetime
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Input, Dense, LSTM
from sklearn.preprocessing import MinMaxScaler

def fetch_data(ticker):
    try:
        startDate = "2024-01-01"
        endDate = "2024-06-30"
        url = f"https://valor.api.globo.com/graphql?q=%7B%22query%22:%22%7B%5Cn%20%20%20%20%20%20series(symbol:%20%5C%22{ticker}%5C%22,%5Cn%20%20%20%20%20%20interval:%201,%5Cn%20%20%20%20%20%20period:%201,%5Cn%20%20%20%20%20%20startDate:%20%5C%22{startDate}T11:00:00.000Z%5C%22,%5Cn%20%20%20%20%20%20endDate:%20%5C%22{endDate}T01:30:00.000Z%5C%22)%20%7B%5Cn%20%20%20%20%20%20%20%20close%5Cn%20%20%20%20%20%20%20%20time%5Cn%20%20%20%20%20%20%20%20open%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%22%7D"
        response = requests.get(url)
        data = response.json()
        
        series = data['data']['series']
        df = pd.DataFrame(series)
        
        df['time'] = pd.to_datetime(df['time'], unit='s')
        
        return df
    
    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        return None

def create_dataset(data, time_steps=1):
    X, y = [], []
    for i in range(len(data) - time_steps):
        X.append(data[i:(i + time_steps), 0])
        y.append(data[i + time_steps, 0])
    return np.array(X), np.array(y)

def train_neural_network(df, prediction_interval=10, time_steps=10, epochs=50):
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

def plot_data(ticker, prediction_interval):
    try:
        df = fetch_data(ticker)
        
        if df is None:
            return
        
        def logistic_map(x, r):
            return r * x * (1 - x)

        r = 3.7
        x0 = 0.5

        logistic_predictions = [x0]
        for _ in range((len(df) + prediction_interval - 1) // prediction_interval):
            x0 = logistic_map(x0, r)
            logistic_predictions.extend([x0] * prediction_interval)

        logistic_predictions = np.array(logistic_predictions[:len(df)]) * (df['close'].max() - df['close'].min()) + df['close'].min()

        plt.figure(figsize=(14, 7))
        plt.plot(df['time'], df['close'], label='Closing', marker='o')
        plt.plot(df['time'], logistic_predictions, label=f'Logistic Predictions ({prediction_interval} points)', linestyle='--', marker='x')

        plt.title(f'Stock Prices and Predictions for {ticker}')
        plt.xlabel('Time')
        plt.ylabel('Value')
        plt.legend()
        plt.grid(True)
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.show()
    
    except Exception as e:
        print(f"Error plotting data: {e}")

def plot_data_nn(ticker, prediction_interval):
    try:
        df = fetch_data(ticker)
        
        if df is None:
            return
        
        nn_predictions = train_neural_network(df, prediction_interval)

        future_dates = pd.date_range(start=df['time'].iloc[-1], periods=prediction_interval + 1)[1:]

        plt.figure(figsize=(14, 7))
        plt.plot(df['time'], df['close'], label='Actual Prices', linestyle='-', marker='o')
        plt.plot(future_dates, nn_predictions, label='Neural Network Predictions', linestyle='-', marker='s')

        plt.title(f'Neural Network Predictions for {ticker}')
        plt.xlabel('Time')
        plt.ylabel('Value')
        plt.legend()
        plt.grid(True)
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.show()

    except Exception as e:
        print(f"Error plotting data: {e}")

def on_button_click():
    ticker = ticker_combo.get()
    prediction_interval = int(prediction_interval_spinbox.get())
    plot_data(ticker, prediction_interval)

def on_button_nn_click():
    ticker = ticker_combo.get()
    prediction_interval = int(prediction_interval_spinbox.get())
    plot_data_nn(ticker, prediction_interval)

root = tk.Tk()
root.title("Stock Ticker Selection")

label_ticker = tk.Label(root, text="Select Ticker:")
label_ticker.pack(pady=10)
ticker_combo = ttk.Combobox(root, values=["VALE3", "PETR4", "ITSA4", "KLBN3", "RANI3", "ITLC34", "LEVE3"])
ticker_combo.pack(pady=10)
ticker_combo.current(0)

label_interval = tk.Label(root, text="Select Prediction Interval (points):")
label_interval.pack(pady=10)
prediction_interval_spinbox = tk.Spinbox(root, from_=3, to=10)
prediction_interval_spinbox.pack(pady=10)
prediction_interval_spinbox.delete(0, "end")
prediction_interval_spinbox.insert(0, "3")

button = tk.Button(root, text="Generate Plot", command=on_button_click)
button.pack(pady=20)

button_nn = tk.Button(root, text="Generate Neural Network Plot", command=on_button_nn_click)
button_nn.pack(pady=20)

root.mainloop()
