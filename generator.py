#!/usr/bin/env python3
import urllib.request
from io import StringIO
from os import path
from pandas import DataFrame
import settings

EXPORT_PATTERN = 'https://docs.google.com/feeds/download/spreadsheets/Export?key={}&exportFormat=csv&gid=0'
CURRENT_PATH = path.dirname(path.realpath(__file__))

if __name__ == '__main__':
    csv_url = EXPORT_PATTERN.format(settings.GOOGLE_SPREADSHEET_ID)

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
            data_list.append(DataFrame(data[data.columns[start_col_index:start_col_index+6]]))

        orig_header = data_list[0].columns
        for dataset in data_list[1:]:
            dataset.columns = orig_header

        for dataset in data_list:
            dev_id = dataset.iloc[0, 0]
            dataset.to_json(path.join(CURRENT_PATH, 'data', 'data_{}.json'.format(dev_id)), orient='records')

        summary = data[data.columns[summary_index:]]
        summary.to_json(path.join(CURRENT_PATH, 'data', 'summary.json'), orient='records')

