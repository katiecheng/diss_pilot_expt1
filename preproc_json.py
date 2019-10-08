import sys
import pandas as pd


### Get user input for which files to process
if(len(sys.argv) - 1 == 2):
  datePrefix = sys.argv[1]
  versionSampleSuffix = sys.argv[2]
  # print('{filenameStem}.json'.format(filenameStem=filenameStem))
else:
  print("This script takes two arguments, the date prefix and the version/sample suffix for the Firebase json and Prolific csv files.")

### Read Prolific data
df_prolific = pd.read_csv(
  '{datePrefix}_prolific_export_{versionSampleSuffix}.csv'.format(
    datePrefix=datePrefix,
    versionSampleSuffix=versionSampleSuffix)
)
# print(df_prolific)

### Read Firebase data
with open(
  '{datePrefix}_diss-pilot-expt1-export_{versionSampleSuffix}.json'.format(
    datePrefix=datePrefix,
    versionSampleSuffix=versionSampleSuffix)) as f:
  data=json.load(f)

items_dict = data['items']
users_dict = data['users']

df_items = pd.DataFrame.from_dict(items_dict, orient='index')
df_users = pd.DataFrame.from_dict(users_dict, orient='index')
# print(df_items).head(3)
# print(df_users).head(3)

### Calculate summary stats in item-level data
# average reveal latency on all trials, on correct trials, and on incorrect trials
# average moveOn latency on all trials, on correct trials, and on incorrect trials
# binary code predict-restudy, predict-generate, actual-restudy, actual-generate, match

### Link item-level data to user-level data

### Merge Prolific and Firebase data, and output to csv for R





# for row in users_dict.keys():
#   users_df = users_df.append(pd.DataFrame(users_dict[row], index=[0]), ignore_index=True)

# for row in items_dict.keys():
#   items_df = items_df.append(pd.DataFrame(items_dict[row], index=[0]), ignore_index=True)

# users_df.to_csv("diss-pilot-latency2-export_users2.csv", index=False, columns=users_columns)
# items_df.to_csv("diss-pilot-latency2-export_items2.csv", index=False, columns=items_columns)

