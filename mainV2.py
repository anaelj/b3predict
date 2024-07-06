import requests
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import tkinter as tk
from tkinter import ttk
from datetime import datetime

def fetch_data(ticker):
    try:
        # Constructing the API URL correctly
        startDate = "2024-01-01"
        endDate ="2024-06-30"
        url = f"https://valor.api.globo.com/graphql?q=%7B%22query%22:%22%7B%5Cn%20%20%20%20%20%20series(symbol:%20%5C%22{ticker}%5C%22,%5Cn%20%20%20%20%20%20interval:%201,%5Cn%20%20%20%20%20%20period:%201,%5Cn%20%20%20%20%20%20startDate:%20%5C%22{startDate}T11:00:00.000Z%5C%22,%5Cn%20%20%20%20%20%20endDate:%20%5C%22{endDate}T01:30:00.000Z%5C%22)%20%7B%5Cn%20%20%20%20%20%20%20%20close%5Cn%20%20%20%20%20%20%20%20time%5Cn%20%20%20%20%20%20%20%20open%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%22%7D"
        response = requests.get(url)
        data = response.json()
        
        # Parsing the JSON data
        series = data['data']['series']
        df = pd.DataFrame(series)
        
        # Converting 'time' column to datetime
        df['time'] = pd.to_datetime(df['time'], unit='s')
        
        return df
    
    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        return None

def plot_data(ticker, prediction_interval):
    try:
        df = fetch_data(ticker)
        
        if df is None:
            return
        
        # Logistic model function
        def logistic_map(x, r):
            return r * x * (1 - x)

        # Parameters for the logistic model
        r = 3.7
        x0 = 0.5

        # Making predictions using the logistic model
        predictions = [x0]
        for _ in range((len(df) + prediction_interval - 1) // prediction_interval):
            x0 = logistic_map(x0, r)
            predictions.extend([x0] * prediction_interval)

        # Adjusting predictions to the price range
        predictions = np.array(predictions[:len(df)]) * (df['close'].max() - df['close'].min()) + df['close'].min()

        # Ensuring predictions and df['time'] have the same length
        if len(predictions) < len(df):
            predictions = np.append(predictions, [predictions[-1]] * (len(df) - len(predictions)))
        elif len(predictions) > len(df):
            predictions = predictions[:len(df)]

        # Plotting data and predictions
        plt.figure(figsize=(14, 7))
        plt.plot(df['time'], df['close'], label='Closing', marker='o')
        plt.plot(df['time'], predictions, label=f'Predictions ({prediction_interval} points)', linestyle='--', marker='x')

        # Customizing the plot
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

# Function for button click
def on_button_click():
    ticker = ticker_combo.get()
    prediction_interval = int(prediction_interval_spinbox.get())
    plot_data(ticker, prediction_interval)

# GUI setup
root = tk.Tk()
root.title("Stock Ticker Selection")

# Label and ComboBox for selecting ticker
label_ticker = tk.Label(root, text="Select Ticker:")
label_ticker.pack(pady=10)
ticker_combo = ttk.Combobox(root, values=["VALE3", "PETR4", "ITSA4", "KLBN3", "RANI3", "ITLC34"])
ticker_combo.pack(pady=10)
ticker_combo.current(0)

# Label and Spinbox for selecting prediction interval
label_interval = tk.Label(root, text="Select Prediction Interval (points):")
label_interval.pack(pady=10)
prediction_interval_spinbox = tk.Spinbox(root, from_=3, to=10)
prediction_interval_spinbox.pack(pady=10)
prediction_interval_spinbox.delete(0,"end")
prediction_interval_spinbox.insert(3,"3")

# Button to generate the plot
button = tk.Button(root, text="Generate Plot", command=on_button_click)
button.pack(pady=20)

root.mainloop()
