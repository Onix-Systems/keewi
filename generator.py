#!/usr/bin/env python3
import urllib.request
from io import StringIO
from os import path
import json
from pandas import DataFrame
import settings

EXPORT_PATTERN = 'https://docs.google.com/feeds/download/spreadsheets/Export?key={}&exportFormat=csv&gid=0'
CURRENT_PATH = path.dirname(path.realpath(__file__))

if __name__ == '__main__':
    csv_url = EXPORT_PATTERN.format(settings.GOOGLE_SPREADSHEET_ID)
    result = []

    with urllib.request.urlopen(csv_url) as response:
        csv = response.read()
        csv = csv.decode('utf-8')

        # detect first row (it will be header)
        for i, line in enumerate(csv.split('\n')):
            if line.replace(',', '').strip():
                break
        else:
            i = 0

        csv_data = StringIO(csv)
        data = DataFrame.from_csv(csv_data, header=i)
        data.reset_index(drop=True, inplace=True)

        summary_index = 6
        for i, col in enumerate(data.columns):
            if 'Unnamed' in col:
                summary_index = i + 1
                break

        data_list = []

        devices = len(data.columns) // 6

        for x in range(devices):
            start_col_index = x * 6
            data_list.append(DataFrame(data[data.columns[start_col_index:start_col_index + 6]]))

        orig_header = data_list[0].columns
        for dataset in data_list[1:]:
            dataset.columns = orig_header

        for dataset in data_list:
            dev_id = dataset.iloc[0, 0]
            result.append({'type': 'device_data',
                           'device_id': str(dev_id),
                           'data': dataset.to_dict(orient='records')})

        result.append({'type': 'summary',
                       'data': data[data.columns[summary_index:]].to_dict(orient='records')})

    file_path = path.join(CURRENT_PATH, 'data.json')
    with open(file_path, 'w') as f:
        json.dump(result, f)
