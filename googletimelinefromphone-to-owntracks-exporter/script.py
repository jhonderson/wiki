#!/usr/bin/python

## Heavily based on https://www.technowizardry.net/2024/01/migrating-from-google-location-history-to-owntracks/

import pandas as pd
from datetime import datetime, timedelta
import pytz

def parse_geo(geo_str):
    lat, lon = geo_str.replace("geo:", "").split(",")
    return float(lat), float(lon)

def to_utc_iso(timestamp):
    dt = datetime.fromisoformat(timestamp)
    dt_utc = dt.astimezone(pytz.utc)
    return dt_utc.isoformat().replace("+00:00", "Z")

def offset_timestamp(start_time, offset_minutes):
    dt = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
    offset = timedelta(minutes=int(offset_minutes))
    new_time = dt + offset
    return new_time.isoformat().replace("+00:00", "Z")

def convert_activity(data):
    start_lat, start_lon = parse_geo(data["activity"]["start"])
    end_lat, end_lon = parse_geo(data["activity"]["end"])
    return [
        {
            "timestamp": to_utc_iso(data["startTime"]),
            "lat": start_lat,
            "lon": start_lon
        },
        {
            "timestamp": to_utc_iso(data["endTime"]),
            "lat": end_lat,
            "lon": end_lon
        }
    ]

def convert_visit(data):
    lat, lon = parse_geo(data["visit"]["topCandidate"]["placeLocation"])
    timestamp = to_utc_iso(data["startTime"])
    return {
        "timestamp": timestamp,
        "lat": lat,
        "lon": lon
    }

def convert_timeline_path(data):
    start_time = data["startTime"]
    output = []
    for entry in data["timelinePath"]:
        lat, lon = parse_geo(entry["point"])
        timestamp = offset_timestamp(start_time, entry["durationMinutesOffsetFromStartTime"])
        output.append({
            "timestamp": timestamp,
            "lat": lat,
            "lon": lon
        })
    return output

def extract_year_month(timestamp_str):
    # Convert "Z" to "+00:00" to make it ISO 8601 compatible
    dt = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
    return dt.year, dt.month

def to_unix_timestamp(iso_str):
    dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
    return int(dt.timestamp())

def remove_microseconds(timestamp_str):
    # Parse the datetime, stripping microseconds and formatting back
    dt = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
    return dt.replace(microsecond=0).isoformat().replace("+00:00", "Z")

df_gps = pd.read_json('location-history.json', typ='frame', orient='records')

import time
import json
import os

# https://owntracks.org/booklet/features/tid/
tracker_id = 'gm' # A two-character identifier

print('There are {:,} rows in the location history dataset'.format(len(df_gps)))

output_folder = "output"

files = {}
records = []

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

for index, row in df_gps.iterrows():
    if 'visit' in row and isinstance(row['visit'], dict) and 'topCandidate' in row['visit'] and isinstance(row['visit']['topCandidate'], dict) and 'placeLocation' in row['visit']['topCandidate']:
        records.append(convert_visit(row))
    elif 'activity' in row and isinstance(row['activity'], dict) and 'start' in row['activity'] and 'end' in row['activity']:
        records.extend(convert_activity(row))
    elif 'timelinePath' in row and hasattr(row['timelinePath'], "__len__"):
        records.extend(convert_timeline_path(row))

try:
    for record in records:
        year, month = extract_year_month(record['timestamp'])
        folder_name = f"{year}-{month:02d}"
        if folder_name not in files:
            files[folder_name] = open(f"./{output_folder}/{folder_name}.rec", 'w')
        new_record = {
            '_type': 'location',
            'tst': to_unix_timestamp(record['timestamp']),
            'lat': record["lat"],
            'lon': record["lon"],
            'tid': tracker_id,
            'tid': 'JC'
        }
        line = f"{remove_microseconds(record['timestamp'])}\t*                 \t{json.dumps(new_record, separators=(',', ':'))}\n"
        files[folder_name].write(line)
finally:
    for key, file in files.items():
        file.flush()
        file.close()
