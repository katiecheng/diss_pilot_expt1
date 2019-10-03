import json
import pandas as pd

with open('diss-pilot-latency2-export_test2.json') as f:
  data=json.load(f)

items_dict = data['items']
users_dict = data['users']

users_columns = [
  "prolificId",
  "startDateTime",
  "endDateTime",
  "otherdemog",
  "feedback"
]

items_columns = [
  "prolificId",
  "itemIndex",
  "studyOrder",
  "strategyOrder",
  "strategy",
  "revealLatency",
  "moveOnLatency",
  "testOrder",
  "testAccuracy"
]

users_df = pd.DataFrame(columns=users_columns)
items_df = pd.DataFrame(columns=items_columns)

for row in users_dict.keys():
  users_df = users_df.append(pd.DataFrame(users_dict[row], index=[0]), ignore_index=True)

for row in items_dict.keys():
  items_df = items_df.append(pd.DataFrame(items_dict[row], index=[0]), ignore_index=True)

users_df.to_csv("diss-pilot-latency2-export_users2.csv", index=False, columns=users_columns)
items_df.to_csv("diss-pilot-latency2-export_items2.csv", index=False, columns=items_columns)

