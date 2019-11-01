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
df_prolific = pd.read_csv(
  '../data/raw/{datePrefix}_prolific_export_{versionSampleSuffix}.csv'.format(
    datePrefix=datePrefix,
    versionSampleSuffix=versionSampleSuffix)
)
# print(df_prolific)

### Read Firebase data
with open(
  '../data/raw/{datePrefix}_diss-pilot-expt1-export_{versionSampleSuffix}.json'.format(
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
df_prolific = df_prolific.set_index(['participant_id'])
df_prolific.index.names = ['prolificId']
df_users = df_users.set_index(['prolificId'])
df_items = df_items.set_index(['prolificId', 'itemIndex'])


### Calculate summary stats in item-level data TODO
# numeric, difference in actual-predict for restudy and generate
# binary code predict-restudy/generate, actual-restudy/generate, match-yes/no
# average reveal latency on all trials, on correct trials, and on incorrect trials
# average moveOn latency on all trials, on correct trials, and on incorrect trials

### sort on column names
df_users = df_users[[
  "startDateTime",
  "endDateTime",
  "condition",
  "interventionStrategyRestudyScoreRound1",
  "interventionStrategyGenerateScoreRound1",
  "interventionStrategyRestudyScoreRound2",
  "interventionStrategyGenerateScoreRound2",
  "interventionPredictRestudy",
  "interventionPredictRestudyReason",
  "interventionPredictGenerate",
  "interventionPredictGenerateReason",
  "interventionTestRestudyScore",
  "interventionTestGenerateScore",
  "assessmentTestScore",
  "effectivenessRestudy",
  "effectivenessGenerate",
  "chosenStrategy",
  "effectivenessChosenStrategy",
  "effort",
  "comments"
]]

df_items = df_items[[
  "itemSwahili",
  "itemEnglish",
  "interventionStudyOrder",
  "interventionStrategyOrder",
  "interventionTestOrder",
  "interventionStrategy",
  "interventionStrategyUserInputRound1",
  "interventionStrategyAccuracyRound1",
  "interventionStrategyUserInputRound2",
  "interventionStrategyAccuracyRound2",
  "interventionTestUserInput",
  "interventionTestAccuracy",
  "assessmentStudyOrder",
  "assessmentStrategyOrder",
  "assessmentTestOrder",
  "assessmentStrategy",
  "assessmentStrategyRevealLatency",
  "assessmentStrategyMoveOnLatency",
  "assessmentTestUserInput",
  "assessmentTestAccuracy"
]]


### Link item-level data to user-level data, for a user-level analysis file
### sorted on column names, reverse alpha 
### join on index, keeping hierarchy
df_users_items = df_users.join(df_items, how='inner')


### sort on column values 
#(for expt v2 and beyond)
df_users_items = df_users_items.sort_values([
  'prolificId',
  'assessmentStrategy',
  'interventionStrategy',
  'interventionStrategyOrder',
  'assessmentStrategyOrder'
])


### Add prolific data! 
#(removes the rows that don't have corresponding ids in the prolific file)
df_users_items = df_prolific.join(df_users_items, how='inner')


### Output to csv for R
df_users_items.to_csv(
  "../data/{datePrefix}_diss-pilot-expt1_df-users-items_{versionSampleSuffix}.csv".format(
    datePrefix=datePrefix,
    versionSampleSuffix=versionSampleSuffix
  ), encoding='utf-8'
)


