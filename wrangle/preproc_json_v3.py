import sys
import json
import pandas as pd
import Levenshtein as lev

### Works for v2 and v3

### Get user input for which files to process
if(len(sys.argv) - 1 == 2):
  datePrefix = sys.argv[1]
  versionSampleSuffix = sys.argv[2]
else:
  print("This script takes two arguments, the date prefix and the version/sample suffix for the Firebase json and Prolific csv files.")


### READ ##########################################################################################
### Read Prolific data (toggle if no corresponding Prolific file)
df_prolific = pd.read_csv(
  '../data/raw/{datePrefix}_prolific_export_{versionSampleSuffix}.csv'.format(
    datePrefix=datePrefix,
    versionSampleSuffix=versionSampleSuffix)
)

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


### Read belief change variables
df_belief_change_vars = pd.read_csv(
  'variable_calcs_toImport.csv'
)

### WRANGLE #######################################################################################
### Drop items with NaN in itemIndex
df_items = df_items.dropna(subset=['itemIndex'])

### reindex dfs
df_prolific = df_prolific.set_index(['participant_id'])
df_prolific.index.names = ['prolificId']
df_users = df_users.set_index(['prolificId'])
df_items = df_items.set_index(['prolificId', 'itemIndex'])


### change types of columns that need calculation
df_items['assessmentStrategyRevealLatency'] = pd.to_numeric(df_items['assessmentStrategyRevealLatency'], errors='coerce')
df_items['assessmentStrategyMoveOnLatency'] = pd.to_numeric(df_items['assessmentStrategyMoveOnLatency'], errors='coerce')

df_users['interventionPredictRestudy'] = pd.to_numeric(df_users['interventionPredictRestudy'], errors='coerce')
df_users['interventionPredictGenerate'] = pd.to_numeric(df_users['interventionPredictGenerate'], errors='coerce')
df_users['interventionTestRestudyScore'] = pd.to_numeric(df_users['interventionTestRestudyScore'], errors='coerce')
df_users['interventionTestGenerateScore'] = pd.to_numeric(df_users['interventionTestGenerateScore'], errors='coerce')

### Do all of the preproc in python

### CREATE VARS TO DETERMINE EXCLUSION CRITERIA ###################################################
### Calculate exclusion criteria
"""
[1-9] restudy strategy
[4] generate strategy
[1-9] restudy test
generate test
[4] intervention test
[4] assessment test

[x] for each item, calculate Levenshtein distance from the correct answer
[x] for each item, create a boolean variable for different Levenshtein cutoff thresholds (1,2,3,4)
[x] for each user, calculate scores (0-10) using different Levenshtein cutoff thresholds
[x] in r, plot each criteria against testScore, look for a step fn between 9 and 10 that is inclusive
"""
### Calculate lev distances

### Calculate interventionStrategyLevDistance
df_items['interventionStrategyLevDistance'] = df_items.apply(lambda row: lev.distance(
  row['itemEnglish'], 
  row['interventionStrategyUserInputRound1']), axis=1)

for n in range(1,3):
  colname = "interventionStrategyLevDist" + str(n)
  df_items[colname] = df_items.apply(lambda row: 
      1 if row['interventionStrategyLevDistance']<=n else 0, axis=1
  )

### Calculate interventionTestLevDistance
df_items['interventionTestLevDistance'] = df_items.apply(lambda row: lev.distance(
  row['itemEnglish'], 
  row['interventionTestUserInput']), axis=1)

for n in range(1,3):
  colname = "interventionTestLevDist" + str(n)
  df_items[colname] = df_items.apply(lambda row: 
      1 if row['interventionTestLevDistance']<=n else 0, axis=1
  )

### Calculate assessmentTestLevDistance
df_items['assessmentTestLevDistance'] = df_items.apply(lambda row: lev.distance(
  row['itemEnglish'], 
  row['assessmentTestUserInput']), axis=1)

for n in range(1,3):
  colname = "assessmentTestLevDist" + str(n)
  df_items[colname] = df_items.apply(lambda row: 
      1 if row['assessmentTestLevDistance']<=n else 0, axis=1
  )

### Groupby to calculate scores
group_pid = df_items.groupby(["prolificId"])
group_pid_restudy = df_items[df_items['interventionStrategy']=="restudy"].groupby(["prolificId"])
group_pid_generate = df_items[df_items['interventionStrategy']=="generate"].groupby(["prolificId"])

### Calculate scores

### Calculate interventionStrategyRestudy score; sum the columns levDist 1-10
for n in range(1,3):
  colname_score = "interventionStrategyRestudyScoreLevDist" + str(n)
  colname_levDist = "interventionStrategyLevDist" + str(n)
  restudyScoreLevDist = pd.DataFrame(group_pid_restudy[colname_levDist].sum()).rename(columns={colname_levDist: colname_score})
  df_users = pd.merge(df_users, restudyScoreLevDist, how='left', on='prolificId')

### Calculate interventionStrategyGenerate score
for n in range(1,3):
  colname_score = "interventionStrategyGenerateScoreLevDist" + str(n)
  colname_levDist = "interventionStrategyLevDist" + str(n)
  generateScoreLevDist = pd.DataFrame(group_pid_generate[colname_levDist].sum()).rename(columns={colname_levDist: colname_score})
  df_users = pd.merge(df_users, generateScoreLevDist, how='left', on='prolificId')

### Calculate interventionTest restudy score
for n in range(1,3):
  colname_score = "interventionTestRestudyScoreLevDist" + str(n)
  colname_levDist = "interventionTestLevDist" + str(n)
  testRestudyScoreLevDist = pd.DataFrame(group_pid_restudy[colname_levDist].sum()).rename(columns={colname_levDist: colname_score})
  df_users = pd.merge(df_users, testRestudyScoreLevDist, how='left', on='prolificId')

### Calculate interventionTest generate score
for n in range(1,3):
  colname_score = "interventionTestGenerateScoreLevDist" + str(n)
  colname_levDist = "interventionTestLevDist" + str(n)
  testGenerateScoreLevDist = pd.DataFrame(group_pid_generate[colname_levDist].sum()).rename(columns={colname_levDist: colname_score})
  df_users = pd.merge(df_users, testGenerateScoreLevDist, how='left', on='prolificId')

### Calculate interventionTest 
for n in range(1,3):
  colname_score = "interventionTestScoreLevDist" + str(n)
  colname_levDist = "interventionTestLevDist" + str(n)
  interventionTestScoreLevDist = pd.DataFrame(group_pid[colname_levDist].sum()).rename(columns={colname_levDist: colname_score})
  df_users = pd.merge(df_users, interventionTestScoreLevDist, how='left', on='prolificId')

### Calculate assessmentTest
for n in range(1,3):
  colname_score = "assessmentTestScoreLevDist" + str(n)
  colname_levDist = "assessmentTestLevDist" + str(n)
  assessmentTestScoreLevDist = pd.DataFrame(group_pid[colname_levDist].sum()).rename(columns={colname_levDist: colname_score})
  df_users = pd.merge(df_users, assessmentTestScoreLevDist, how='left', on='prolificId')

### CREATE ITEM-LEVEL VARS FOR ANALYSES ###########################################################
### Calculate new item-level variables TODO
# difference between seeT-moveOn

# totalLatency
df_items['assessmentStrategyTotalLatency'] = df_items['assessmentStrategyRevealLatency'] + df_items['assessmentStrategyMoveOnLatency']

# proportion reveal 
df_items['assessmentStrategyProportionReveal'] = df_items['assessmentStrategyRevealLatency'] / df_items['assessmentStrategyTotalLatency']

# proportion moveOn
df_items['assessmentStrategyProportionMoveOn'] = df_items['assessmentStrategyMoveOnLatency'] / df_items['assessmentStrategyTotalLatency']

### Calculate summary stats in item-level data for user-level analyses TODO
# average reveal latency on correct trials, and on incorrect trials
# average moveOn latency on correct trials, and on incorrect trials
# average difference between seeT-moveOn on all trials, correct, and incorrect trials

# average reveal/moveOn latency on all trials
revealMean = pd.DataFrame(group_pid["assessmentStrategyRevealLatency"].mean()).rename(columns={"assessmentStrategyRevealLatency": "avgAssessmentStrategyRevealLatency"})
moveOnMean = pd.DataFrame(group_pid["assessmentStrategyMoveOnLatency"].mean()).rename(columns={"assessmentStrategyMoveOnLatency": "avgAssessmentStrategyMoveOnLatency"})
totalMean = pd.DataFrame(group_pid["assessmentStrategyTotalLatency"].mean()).rename(columns={"assessmentStrategyTotalLatency": "avgAssessmentStrategyTotalLatency"})
proportionRevealMean = pd.DataFrame(group_pid["assessmentStrategyProportionReveal"].mean()).rename(columns={"assessmentStrategyProportionReveal": "avgAssessmentStrategyProportionReveal"})
proportionMoveOnMean = pd.DataFrame(group_pid["assessmentStrategyProportionMoveOn"].mean()).rename(columns={"assessmentStrategyProportionMoveOn": "avgAssessmentStrategyProportionMoveOn"})
revealSD = pd.DataFrame(group_pid["assessmentStrategyRevealLatency"].std()).rename(columns={"assessmentStrategyRevealLatency": "sdAssessmentStrategyRevealLatency"})
moveOnSD = pd.DataFrame(group_pid["assessmentStrategyMoveOnLatency"].std()).rename(columns={"assessmentStrategyMoveOnLatency": "sdAssessmentStrategyMoveOnLatency"})

df_users = pd.merge(df_users, revealMean, how='left', on='prolificId')
df_users = pd.merge(df_users, moveOnMean, how='left', on='prolificId')
df_users = pd.merge(df_users, totalMean, how='left', on='prolificId')
df_users = pd.merge(df_users, proportionRevealMean, how='left', on='prolificId')
df_users = pd.merge(df_users, proportionMoveOnMean, how='left', on='prolificId')
df_users = pd.merge(df_users, revealSD, how='left', on='prolificId')
df_users = pd.merge(df_users, moveOnSD, how='left', on='prolificId')


### CREATE USER-LEVEL VARS FOR ANALYSES ###########################################################
# numeric, difference from expecations: difference actual-predict for restudy and generate separately
# numeric, difference between strategies: difference restudy-generate
# categorical, predict-restudy/generate/equal, actual-restudy/generate/equal, preferred-actual strategy match-yes/no

### interventionTestScore
df_users['interventionTestScore'] = df_users['interventionTestRestudyScore'] + df_users['interventionTestGenerateScore']

### Calculate categories

# Prediction
df_users['diff_interventionPredictRG'] = df_users['interventionPredictRestudy'] - df_users['interventionPredictGenerate']
df_users['interventionPrediction'] = df_users.apply(
  lambda row: "restudy" if row['diff_interventionPredictRG'] >0 else (
    "generate" if row['diff_interventionPredictRG'] <0 else (
      "equal" if row['diff_interventionPredictRG'] ==0 else None)), 
  axis=1
)

# Outcome
df_users['diff_interventionTestOutcomeRG'] = df_users['interventionTestRestudyScore'] - df_users['interventionTestGenerateScore']
df_users['interventionOutcome'] = df_users.apply(
  lambda row: "restudy" if row['diff_interventionTestOutcomeRG'] >0 else (
    "generate" if row['diff_interventionTestOutcomeRG'] <0 else (
      "equal" if row['diff_interventionTestOutcomeRG'] ==0 else None)), 
  axis=1
)

# Belief (v3 only)

# Numeric values for effectiveness ratings; Krosnick tables
effectivenessRating = { 
  "extremely" : 1.69,
  "very" : 1.46,
  "moderately" : .66,
  "slightly" : .44,
  "not" : 0,
  "" : None
}

df_users['effectivenessRestudy_num'] = [effectivenessRating[rating] for rating in df_users['effectivenessRestudy'] ] 
df_users['effectivenessGenerate_num'] = [effectivenessRating[rating] for rating in df_users['effectivenessGenerate'] ] 
df_users['effectivenessChosenStrategy_num'] = [effectivenessRating[rating] for rating in df_users['effectivenessChosenStrategy'] ] 

# df_users['effectivenessRestudy_num'] = pd.to_numeric(df_users['effectivenessRestudy_num'], errors='coerce')
# df_users['effectivenessGenerate_num'] = pd.to_numeric(df_users['effectivenessGenerate_num'], errors='coerce')
# df_users['effectivenessChosenStrategy_num'] = pd.to_numeric(df_users['effectivenessChosenStrategy_num'], errors='coerce')


df_users['diff_assessmentBeliefRG_num'] = df_users['effectivenessRestudy_num'] - df_users['effectivenessGenerate_num']
df_users['assessmentBelief'] = df_users.apply(
  lambda row: "restudy" if row['diff_assessmentBeliefRG_num'] >0 else (
    "generate" if row['diff_assessmentBeliefRG_num'] <0 else (
      "equal" if row['diff_assessmentBeliefRG_num'] ==0 else None)), 
  axis=1
)

### Calculate shift in beliefs

# use manually calculated beliefs
# reset_index() and set_index() lets you keep the index after merge
df_users = df_users.reset_index().merge(df_belief_change_vars, how="left").set_index('prolificId')

"""
# Feedback consistent or inconsistent with expectations?
df_users['outcomeMatchPrediction'] = df_users.apply(
  lambda row: None if row['interventionPrediction'] == None else (
    'match' if row['interventionPrediction'] == row['interventionOutcome'] else 'mismatch'), axis=1
)

# Change toward, no change, or away from feedback, given expectations?
df_users['directionOfChange'] = df_users.apply(
  lambda row: None if row['interventionPrediction'] == None or row['assessmentBelief'] == None else (
    'noChange' if row['interventionPrediction'] == row['assessmentBelief'] else (
      'away' if row['interventionPrediction'] == row['interventionOutcome'] else 'toward')), axis=1
)

# Change consistent or inconsistent with expectations, given prediction and outcome
df_users['changeRelativeToOutcome'] = df_users.apply(
  lambda row: 'consistent' if row['outcomeMatchPrediction'] == 'match' and row['directionOfChange'] == 'noChange' else (
    'consistent' if row['directionOfChange'] == 'toward' else (
      'inconsistent' if row['outcomeMatchPrediction'] == 'mismatch' and row['directionOfChange'] == 'noChange' else (
        'inconsistent' if row['directionOfChange'] == 'away' else None))), axis=1
)

df_users['changeRelativeToOutcome_num'] = df_users.apply(
  lambda row: 1 if row['changeRelativeToOutcome'] == 'consistent' else 0, axis=1
)

# Change toward/away/noChange numerical
# Calculates the amount of change from prediction to outcome (0, 1, or 2), and the direction with respect to feedback (toward +, away -)
df_users['directionOfChange_num'] = df_users.apply(
  lambda row: None if row['interventionPrediction'] == None or row['assessmentBelief'] == None else (
    0 if row['interventionPrediction'] == row['assessmentBelief'] else (
      -2 if row['interventionPrediction'] == row['interventionOutcome'] and row['interventionPrediction'] != 'equal' and row['assessmentBelief'] != 'equal' else (
        -1 if row['interventionPrediction'] == row['interventionOutcome'] else (
          -1 if row['interventionPrediction'] == 'equal' and row['interventionPrediction'] != row['interventionOutcome'] != row['assessmentBelief'] else (
            2 if row['interventionPrediction'] != 'equal' and row['assessmentBelief'] != 'equal' else 1))))), axis=1
)


# test function to make sure it's categorizing correctly; check manually
# test = pd.DataFrame({
#   'interventionPrediction' : ['restudy']*9 + ['equal']*9 + ['generate']*9,
#   'interventionOutcome' : (['restudy']*3 + ['equal']*3 + ['generate']*3) * 3,
#   'assessmentBelief' : ['restudy', 'equal', 'generate']*9
# })

# test['outcomeMatchPrediction'] = test.apply(
#   lambda row: None if row['interventionPrediction'] == None else (
#     'match' if row['interventionPrediction'] == row['interventionOutcome'] else 'mismatch'), axis=1
# )

# test['directionOfChange'] = test.apply(
#   lambda row: None if row['interventionPrediction'] == None or row['assessmentBelief'] == None else (
#     'noChange' if row['interventionPrediction'] == row['assessmentBelief'] else (
#       'away' if row['interventionPrediction'] == row['interventionOutcome'] else 'toward')), axis=1
# )


# test['changeRelativeToOutcome'] = test.apply(
#   lambda row: 'consistent' if row['outcomeMatchPrediction'] == 'match' and row['directionOfChange'] == 'noChange' else (
#     'consistent' if row['directionOfChange'] == 'toward' else (
#       'inconsistent' if row['outcomeMatchPrediction'] == 'mismatch' and row['directionOfChange'] == 'noChange' else (
#         'inconsistent' if row['directionOfChange'] == 'away' else None))), axis=1
# )

# test['changeRelativeToOutcome_num'] = test.apply(
#   lambda row: 1 if row['changeRelativeToOutcome'] == 'consistent' else 0, axis=1
# )


# test['directionOfChange_num'] = test.apply(
#   lambda row: None if row['interventionPrediction'] == None or row['assessmentBelief'] == None else (
#     0 if row['interventionPrediction'] == row['assessmentBelief'] else (
#       -2 if row['interventionPrediction'] == row['interventionOutcome'] and row['interventionPrediction'] != 'equal' and row['assessmentBelief'] != 'equal' else (
#         -1 if row['interventionPrediction'] == row['interventionOutcome'] else (
#           -1 if row['interventionPrediction'] == 'equal' and row['interventionPrediction'] != row['interventionOutcome'] != row['assessmentBelief'] else (
#             2 if row['interventionPrediction'] != 'equal' and row['assessmentBelief'] != 'equal' else 1))))), axis=1
# )

# test.to_csv(
#   "../data/test_variable_calcs.csv", encoding='utf-8'
# )

"""

### Calculate dimensions of feedback

df_users['diff_interventionRestudyScoreToPrediction'] = df_users['interventionTestRestudyScore'] - df_users['interventionPredictRestudy']
df_users['diff_interventionGenerateScoreToPrediction'] = df_users['interventionTestGenerateScore'] - df_users['interventionPredictGenerate']


### sort on column names
df_users = df_users[[
  "startDateTime",
  "endDateTime",
  "condition",
  "interventionStrategyRestudyScoreRound1",
  "interventionStrategyRestudyScoreLevDist1",
  "interventionStrategyRestudyScoreLevDist2",
  "interventionStrategyGenerateScoreRound1",
  "interventionStrategyGenerateScoreLevDist1",
  "interventionStrategyGenerateScoreLevDist2",
  "interventionStrategyRestudyScoreRound2",
  "interventionStrategyGenerateScoreRound2",
  "interventionPredictRestudy",
  "interventionPredictRestudyReason",
  "interventionPredictGenerate",
  "interventionPredictGenerateReason",
  "interventionPrediction",
  "diff_interventionPredictRG",
  "interventionTestRestudyScore",
  "interventionTestRestudyScoreLevDist1",
  "interventionTestRestudyScoreLevDist2",
  "interventionTestGenerateScore",
  "interventionTestGenerateScoreLevDist1",
  "interventionTestGenerateScoreLevDist2",
  "interventionTestScore",
  "interventionTestScoreLevDist1",
  "interventionTestScoreLevDist2",
  "interventionOutcome",
  "diff_interventionTestOutcomeRG",
  "diff_interventionRestudyScoreToPrediction",
  "diff_interventionGenerateScoreToPrediction",
  "avgAssessmentStrategyRevealLatency",
  "sdAssessmentStrategyRevealLatency",
  "avgAssessmentStrategyMoveOnLatency",
  "sdAssessmentStrategyMoveOnLatency",
  "avgAssessmentStrategyTotalLatency",
  "avgAssessmentStrategyProportionReveal",
  "avgAssessmentStrategyProportionMoveOn",
  "assessmentTestScore",
  "assessmentTestScoreLevDist1",
  "assessmentTestScoreLevDist2",
  # "totalScore",
  # "bonusPayment",
  "effectivenessRestudy",
  "effectivenessRestudy_num",
  "effectivenessGenerate",
  "effectivenessGenerate_num",
  "chosenStrategy",
  "effectivenessChosenStrategy",
  "effectivenessChosenStrategy_num",
  "assessmentBelief",
  "diff_assessmentBeliefRG_num",
  "outcomeMatchPrediction",
  "directionOfChange",
  "directionOfChange_num",
  "changeRelativeToOutcome",
  "changeRelativeToOutcome_num",
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
  "interventionStrategyLevDistance",
  "interventionStrategyLevDist1",
  "interventionStrategyLevDist2",
  "interventionStrategyUserInputRound2",
  "interventionStrategyAccuracyRound2",
  "interventionTestUserInput",
  "interventionTestAccuracy",
  "interventionTestLevDist1",
  "interventionTestLevDist2",
  "assessmentStudyOrder",
  "assessmentStrategyOrder",
  "assessmentTestOrder",
  "assessmentStrategy",
  "assessmentStrategyRevealLatency",
  "assessmentStrategyMoveOnLatency",
  "assessmentStrategyTotalLatency",
  "assessmentStrategyProportionReveal",
  "assessmentStrategyProportionMoveOn",
  "assessmentTestUserInput",
  "assessmentTestAccuracy",
  "assessmentTestLevDist1",
  "assessmentTestLevDist2"
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
df_users = df_prolific.join(df_users, how='inner')

### Create df for bonuses
# df_bonus = df_users_items[[
#   'prolificId',
#   'bonusPayment'
# ]]

### Output to csv for R
df_users_items.to_csv(
  "../data/{datePrefix}_diss-pilot-expt1_df-users-items_{versionSampleSuffix}.csv".format(
    datePrefix=datePrefix,
    versionSampleSuffix=versionSampleSuffix
  ), encoding='utf-8'
)

### Output to csv for R, users df only
df_users.to_csv(
  "../data/{datePrefix}_diss-pilot-expt1_df-users-items_{versionSampleSuffix}_users.csv".format(
    datePrefix=datePrefix,
    versionSampleSuffix=versionSampleSuffix
  ), encoding='utf-8'
)

### Output to csv for bonus payment
# df_bonus.to_csv(
#   "../data/{datePrefix}_diss-pilot-expt1_df-users-items_{versionSampleSuffix}_bonusPayment.csv".format(
#   datePrefix=datePrefix,
#   versionSampleSuffix=versionSampleSuffix
#   ), encoding='utf-8'
# )
