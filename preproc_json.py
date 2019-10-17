import sys
import json
import pandas as pd


### Get user input for which files to process
if(len(sys.argv) - 1 == 2):
  datePrefix = sys.argv[1]
  versionSampleSuffix = sys.argv[2]
else:
  print("This script takes two arguments, the date prefix and the version/sample suffix for the Firebase json and Prolific csv files.")

### Read Prolific data (toggle if no corresponding Prolific file)
# df_prolific = pd.read_csv(
#   '{datePrefix}_prolific_export_{versionSampleSuffix}.csv'.format(
#     datePrefix=datePrefix,
#     versionSampleSuffix=versionSampleSuffix)
# )
# print(df_prolific)

### Read Firebase data
with open(
  '{datePrefix}_diss-pilot-expt1-export_{versionSampleSuffix}.json'.format(
    datePrefix=datePrefix,
    versionSampleSuffix=versionSampleSuffix)) as f:
  data=json.load(f)

users_dict = data['users']
items_dict = data['items']

df_users = pd.DataFrame.from_dict(users_dict, orient='index')
df_items = pd.DataFrame.from_dict(items_dict, orient='index')

### Drop items with NaN in itemIndex
df_items = df_items.dropna(subset=['itemIndex'])

### reindex dfs
df_users = df_users.set_index(['prolificId'])
df_items = df_items.set_index(['prolificId', 'itemIndex'])

print(df_users)
### Calculate summary stats in item-level data TODO
# average reveal latency on all trials, on correct trials, and on incorrect trials
# average moveOn latency on all trials, on correct trials, and on incorrect trials
# binary code predict-restudy/generate, actual-restudy/generate, match-yes/no
# numeric, difference in actual-predict for restudy and generate

### Add prolific data! TODO


### Link item-level data to user-level data, for a user-level analysis file
### join on index, keeping hierarchy
df_users_items = df_users[sorted(df_users, reverse=True)].join(
  df_items[sorted(df_items, reverse=True)], 
  how='inner'
)

### sort on column values 
#(for expt v1)
df_users_items = df_users_items.sort_values([
  'prolificId',
  'assessmentStrategy',
  'interventionStrategy',
  'strategyOrder'
])

#(for expt v2 and beyond)
# df_users_items = df_users_items.sort_values([
#   'prolificId',
#   'assessmentStrategy',
#   'interventionStrategy',
#   'interventionStrategyOrder',
#   'assessmentStrategyOrder'
# ])



### Output to csv for R
df_users_items.to_csv(
  "{datePrefix}_diss-pilot-expt1_df-users-items_{versionSampleSuffix}.csv".format(
    datePrefix=datePrefix,
    versionSampleSuffix=versionSampleSuffix
  ), encoding='utf-8'
)


