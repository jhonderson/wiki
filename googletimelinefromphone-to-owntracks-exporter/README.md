## How to run

Install dependencies:
```bash
pip install pandas pytz
```

Export your data from Google Timeline using your phone, and save it into this folder in a file called `location-history.json`.

Now run the script:
```bash
python script.py
```

Now your owntracks rec files will be in the sub-folder `output`, and you can export them into the owntracks folder `{owntracks-path}/store/rec/{username}/{devicename}/`

Heavily based on https://www.technowizardry.net/2024/01/migrating-from-google-location-history-to-owntracks/
