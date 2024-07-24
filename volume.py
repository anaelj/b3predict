from flask import Flask, jsonify, render_template
import requests
from config import payload
app = Flask(__name__)

# Função para chamar a API
def fetch_api_data():
    url = "https://scanner.tradingview.com/brazil/scan"
    headers = {
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    # print("payload:", payload)  # Adicionado para depuração
    # print("Status Code:", response.status_code)  # Adicionado para depuração
    # print("Response JSON:", response.json())  # Adicionado para depuração
    if response.status_code == 200:
        return response.json()
    else:
        return {}

@app.route('/')
def index():
    api_data = fetch_api_data()
    total_count = api_data.get("totalCount", 0)
    data = api_data.get("data", [])
    
    # Processa os dados para a tela
    processed_data = []
    for item in data:
        name = item['d'][0]
        description = item['d'][1]
        recommendation_mark = item['d'][23]
        dividends_yield_current = item['d'][19]
        volume_change = item['d'][24]
        volume = item['d'][25]
        average_volume_30d_calc = item['d'][26]
        average_volume_10d_calc = item['d'][27]
        net_margin_fy = item['d'][28]
        
        try:
          volume_change = round(volume_change)
          average_volume_10d_calc = round(average_volume_10d_calc)
          average_volume_30d_calc = round(average_volume_30d_calc)
          net_margin_fy = round(net_margin_fy)
          dividends_yield_current = round(dividends_yield_current)
        except (IndexError, ValueError, TypeError) as e:
          print(f"Error: {e} - item: {item}")
          continue
        processed_data.append({
            "name": name,
            "description": description,
            "recommendation_mark": recommendation_mark,
            "volume_change": volume_change,
            "volume": volume,
            "average_volume_30d_calc": average_volume_30d_calc,
            "average_volume_10d_calc": average_volume_10d_calc,
            "net_margin_fy": net_margin_fy,
            "dividends_yield_current": dividends_yield_current,
            "volume_signal": volume > average_volume_30d_calc and volume > average_volume_10d_calc
        })
    
    # Ordena os dados por 'volume_change'
    # processed_data = sorted(processed_data, key=lambda x: x["volume_change"], reverse=True)

    return render_template('index.html', data=processed_data, total_count=total_count)

if __name__ == '__main__':
    app.run(debug=True)
