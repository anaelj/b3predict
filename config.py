payload = {
	"columns": [
		"name",
		"description",
		"logoid",
		"update_mode",
		"type",
		"typespecs",
		"close",
		"pricescale",
		"minmov",
		"fractional",
		"minmove2",
		"currency",
		"change",	
		"relative_volume_10d_calc",
		"market_cap_basic",
		"fundamental_currency_code",
		"price_earnings_ttm",
		"earnings_per_share_diluted_ttm",
		"earnings_per_share_diluted_yoy_growth_ttm",
		"dividends_yield_current",
		"sector.tr",
		"market",
		"sector",
		"recommendation_mark",
		"volume_change",
		"volume",
		"average_volume_30d_calc",
		"average_volume_10d_calc",
    "net_margin_fy",
		"exchange",
    "earnings_release_next_trading_date_fq",
    "High.1M",
    "Low.1M", 
    "High.3M",
    "Low.3M", 
    "current_ratio_fq", #liquidez corrente
    "exchange"    
	],
	"filter": [
		# {
		# 	"left": "volume",
		# 	"operation": "greater",
		# 	"right": "average_volume_10d_calc"
		# },
		{
			"left": "average_volume_10d_calc",
			"operation": "greater",
			"right": "average_volume_30d_calc"
		},
		{
			"left": "volume_change",
			"operation": "greater",
			"right": 0
		},
		{
			"left": "volume",
			"operation": "greater",
			"right": 1000
		},
		{
			"left": "net_margin_fy",
			"operation": "in_range",
			"right": [10,80]
		},
    {
    "left": "dividends_yield_current",
    "operation": "greater",
    "right": 5
		},
		{
			"left": "type",
			"operation": "equal",
			"right": "stock"
		}
	],

	"options": {
		"lang": "pt"
	},
	"range": [
		0,
		200
	],
	"sort": {
		"sortBy": "volume_change",
		"sortOrder": "desc"
	},
	"symbols": {},
	"markets": [
		"brazil"
	],
	"filter2": {
		"operator": "and",
		"operands": [
			{
				"operation": {
					"operator": "or",
					"operands": [
						{
							"operation": {
								"operator": "and",
								"operands": [
									{
										"expression": {
											"left": "type",
											"operation": "equal",
											"right": "stock"
										}
									},
									{
										"expression": {
											"left": "typespecs",
											"operation": "has",
											"right": [
												"common"
											]
										}
									}
								]
							}
						},
						{
							"operation": {
								"operator": "and",
								"operands": [
									{
										"expression": {
											"left": "type",
											"operation": "equal",
											"right": "stock"
										}
									},
									{
										"expression": {
											"left": "typespecs",
											"operation": "has",
											"right": [
												"preferred"
											]
										}
									}
								]
							}
						},
						{
							"operation": {
								"operator": "and",
								"operands": [
									{
										"expression": {
											"left": "type",
											"operation": "equal",
											"right": "dr"
										}
									}
								]
							}
						},
						{
							"operation": {
								"operator": "and",
								"operands": [
									{
										"expression": {
											"left": "type",
											"operation": "equal",
											"right": "fund"
										}
									},
									{
										"expression": {
											"left": "typespecs",
											"operation": "has_none_of",
											"right": [
												"etf"
											]
										}
									}
								]
							}
						}
					]
				}
			}
		]
	}
}
