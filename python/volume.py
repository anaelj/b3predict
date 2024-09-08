from flask import Flask, render_template, request
import requests
from config import payload

app = Flask(__name__)

# Função para formatar números com separadores de milhar
def format_number(value):
    try:
        # Formata o número com separadores de milhar
        return f"{int(value):,}".replace(",", ".")
    except (ValueError, TypeError):
        return value

# Adiciona o filtro customizado ao ambiente Jinja2 do Flask
app.jinja_env.filters['format_number'] = format_number

# Função para chamar a API
def fetch_api_data(selected_type):
    url = "https://scanner.tradingview.com/brazil/scan"
    headers = {
        "Content-Type": "application/json"
    }
    
    # Atualizar o filtro de tipo no payload
    for filter_item in payload['filter']:
        if filter_item['left'] == 'type':
            filter_item['right'] = selected_type

    # # Adicionar lógica para atualizar o campo dividends_yield_current se selected_type for 'dr'
    # if selected_type == 'dr':
    #     # updated = False
    #     for filter_item in payload['filter']:
    #         if filter_item['left'] == 'dividends_yield_current':
    #             filter_item['right'] = 0
    #             # updated = True
    #             break
    #     # # Se o campo dividends_yield_current não existir no payload, adicione-o
    #     # if not updated:
    #     #     payload['filter'].append({
    #     #         "left": "dividends_yield_current",
    #     #         "operation": "equal",
    #     #         "right": 0
    #     #     })
    print(payload)
    response = requests.post(url, json=payload, headers=headers)

    # print("Response Text:", response.text)

    if response.status_code == 200:
        return response.json()
    else:
        return {}

@app.route('/')
def index():
    selected_type = request.args.get('type', 'stock')  # Default para 'stock'
    api_data = fetch_api_data(selected_type)
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
        fund_performance_yeld = item['d'][36]
        
       # Arredonda valores se possível, caso contrário, mantém o valor original
        def safe_round(value):
            try:
                return round(value) 
            except (ValueError, TypeError):
                return value
        
        volume_change = safe_round(volume_change)
        average_volume_10d_calc = safe_round(average_volume_10d_calc)
        average_volume_30d_calc = safe_round(average_volume_30d_calc)
        net_margin_fy = safe_round(net_margin_fy)
        dividends_yield_current = safe_round(dividends_yield_current)
        fund_performance_yeld = safe_round(fund_performance_yeld)

        # Verifica se os valores são números antes de comparar
        def is_number(value):
            try:
                float(value)
                return True
            except (ValueError, TypeError):
                return False

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
            "fund_performance_yeld": fund_performance_yeld,
        })
    
    return render_template('index.html', data=processed_data, total_count=total_count, selected_type=selected_type)

if __name__ == '__main__':
    app.run(debug=True)
