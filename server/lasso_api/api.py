import numpy as np
from joblib import dump, load
from django.http import JsonResponse
import json
import requests
import environ
import os

DATA_URL = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol={}&apikey=8S4J0CN9W2WNIUNQ'

def init_clf(ticker):
    from os import listdir
    from sklearn import linear_model
    import pandas

    r = requests.get(DATA_URL.format(ticker))

    time_series = json.loads(r.text).get('Time Series (Daily)')

    clf = linear_model.Lasso(alpha=0.1)
    closes = []

    for i in time_series.keys():
        closes.append(time_series.get(i, None).get('4. close', None))
    
    clf.fit(np.asarray(closes).reshape(-1,1), closes)

    # dataframes = []
    # for filename in listdir('./data'):
    #     if '2016' in filename:
    #         df = pandas.read_csv('./data/' + filename,engine='c',na_values=0)
    #         dataframes.append(df[df['Date'].str.contains('2355')])
        
    # clf = linear_model.Lasso(alpha=0.1)
    
    # for dataframe in dataframes:
    #     values = dataframe['Close'].values
    #     values = values[~numpy.isnan(values)]
    #     X = values.reshape(-1,1)
    #     clf.fit(X,values.tolist())
    
    dump(clf, os.path.dirname(os.path.abspath(__file__)) + '/model/{}.joblib'.format(ticker))
    
    return clf

def predict(request):
    from datetime import datetime
    from dateutil.relativedelta import relativedelta
    from pathlib import Path

    if request.method == 'POST':
        clf = None

        body = json.loads(request.body.decode('utf-8'))

        ticker = body.get('ticker', None)

        if ticker != None:
            joblib = Path(os.path.dirname(os.path.abspath(__file__)) + '/model/{}.joblib'.format(ticker))

            if joblib.is_file():
                clf = load(os.path.dirname(os.path.abspath(__file__)) + '/model/{}.joblib'.format(ticker))
            else:
                clf = init_clf(ticker)
                
            r = requests.get(DATA_URL.format(ticker))
            j = json.loads(r.text).get('Time Series (Daily)')

            closes = []
            data = {}
            i = datetime.now().day

            # check if request from Alpha Vantage is empty
            if len(j.keys()):
                return JsonResponse({
                    'success': False,
                    'msg': 'Daily limit for stock ticker data has been reached'
                })

            for x in list(j.keys())[:7]:
                closes.append(float(j.get(x, None).get('4. close', None)))
            
            predictions = clf.predict(np.asarray(closes).reshape(-1,1))

            for prediction in predictions:
                data[(datetime.now() + relativedelta(day=i)).strftime('%B %d, %Y %H:%M:%S')] = prediction
                i += 1

            return JsonResponse({
                # 'data': clf.predict(np.asarray(closes).reshape(-1,1)),
                'data': data,
                'success': True,
                'msg': 'Successfully predicted for ticker {0}'.format(ticker)
            })
        else:
            return JsonResponse({
                'success': False,
                'msg': 'Must supply a ticker inside the request body, try again'
            })

    else:
        return JsonResponse({
            'success': False,
            'msg': 'Wrong HTTP method, try again'
        })
