# Update variable types # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

df_v2n48_users$condition <- factor(df_v2n48_users$condition,
                                   levels=c(0,1),
                                   labels=c("control", "expt"))

df_v2n48$condition <- factor(df_v2n48$condition,
                             levels=c(0,1),
                             labels=c("control", "expt"))

df_v3n36_users$condition <- factor(df_v3n36_users$condition,
                                   levels=c(0,1),
                                   labels=c("control", "expt"))

df_v3n36$condition <- factor(df_v3n36$condition,
                             levels=c(0,1),
                             labels=c("control", "expt"))

df_v4n48_users$condition <- factor(df_v4n48_users$condition,
                                   levels=c(0,1),
                                   labels=c("control", "expt"))

df_v4n48$condition <- factor(df_v4n48$condition,
                             levels=c(0,1),
                             labels=c("control", "expt"))

# Create new variables # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# feedback type (none, equal, restudy, generate)

df_v2n48_users$feedback <- factor(ifelse(
  df_v2n48_users$condition=="control", "none",
  ifelse(df_v2n48_users$interventionOutcome=="equal", "equal",
         ifelse(df_v2n48_users$interventionOutcome=="restudy", "restudy", "generate"))))

df_v2n48$feedback <- factor(ifelse(
  df_v2n48$condition=="control", "none",
  ifelse(df_v2n48$interventionOutcome=="equal", "equal",
         ifelse(df_v2n48$interventionOutcome=="restudy", "restudy", "generate"))))

df_v3n36_users$feedback <- factor(ifelse(
  df_v3n36_users$condition=="control", "none",
  ifelse(df_v3n36_users$interventionOutcome=="equal", "equal",
         ifelse(df_v3n36_users$interventionOutcome=="restudy", "restudy", "generate"))))

df_v3n36$feedback <- factor(ifelse(
  df_v3n36$condition=="control", "none",
  ifelse(df_v3n36$interventionOutcome=="equal", "equal",
         ifelse(df_v3n36$interventionOutcome=="restudy", "restudy", "generate"))))

## v4n48
df_v4n48_users$feedback <- factor(ifelse(
  df_v4n48_users$condition=="control", "none",
  ifelse(df_v4n48_users$interventionOutcome=="equal", "equal",
         ifelse(df_v4n48_users$interventionOutcome=="restudy", "restudy", "generate"))))

df_v4n48$feedback <- factor(ifelse(
  df_v4n48$condition=="control", "none",
  ifelse(df_v4n48$interventionOutcome=="equal", "equal",
         ifelse(df_v4n48$interventionOutcome=="restudy", "restudy", "generate"))))

# check above
# df_v2n48_v3n36_users[c("condition", "interventionOutcome", "feedback")]

#effort rating; Carey 2010 Verbal label tables
# effortRating <- c(
#   "greatdeal" = 77,
#   "alot" = 55,
#   "moderate" = 43,
#   "alittle" = 12,
#   "not" = 0
# )
# 
# df_v3n36_users$effort_num <- effortRating[as.character(df_v3n36_users$effort)]

# calculate effort diff
df_v4n48_users$diff_assessmentBeliefEffortRG_num <- df_v4n48_users$effortRestudy_num - df_v4n48_users$effortGenerate_num

# which exceeded expectations more?
df_v2n48_users$diff_interventionStrategyScoreExceedPrediction <- df_v2n48_users$diff_interventionRestudyScoreToPrediction - 
  df_v2n48_users$diff_interventionGenerateScoreToPrediction

df_v3n36_users$diff_interventionStrategyScoreExceedPrediction <- df_v3n36_users$diff_interventionRestudyScoreToPrediction - 
  df_v3n36_users$diff_interventionGenerateScoreToPrediction

## v4n48
df_v4n48_users$diff_interventionStrategyScoreExceedPrediction <- df_v4n48_users$diff_interventionRestudyScoreToPrediction - 
  df_v4n48_users$diff_interventionGenerateScoreToPrediction

df_v4n48_users$diff_howManyRG <- df_v4n48_users$howManyRestudy - df_v4n48_users$howManyGenerate

# scale predictions to be on the same scale as effectiveness ratings

scaling_constant <- 10/1.69

df_v3n36_users$changeBeliefRG_num <- df_v3n36_users$diff_assessmentBeliefRG_num - (df_v3n36_users$diff_interventionPredictRG * scaling_constant)

## v4n48
df_v4n48_users$changeBeliefRG_num <- df_v4n48_users$diff_assessmentBeliefRG_num - (df_v4n48_users$diff_interventionPredictRG * scaling_constant)

df_v3n36_users$diff_assessmentBeliefRG_scale10 <- df_v3n36_users$diff_assessmentBeliefRG_num * scaling_constant

## v4n48
df_v4n48_users$diff_assessmentBeliefRG_scale10 <- df_v4n48_users$diff_assessmentBeliefRG_num * scaling_constant



# approximate behavioral buckets

df_v2n48$assessmentStrategyGenerated <- ifelse(df_v2n48$assessmentStrategyRevealLatency > 2000, "generated", "skipped")
df_v2n48$assessmentStrategyRestudied <- ifelse(df_v2n48$assessmentStrategyMoveOnLatency > 2000, "restudied", "skipped")
df_v2n48$assessmentStrategyGenerated_num <- ifelse(df_v2n48$assessmentStrategyRevealLatency > 2000, 1, 0)
df_v2n48$assessmentStrategyRestudied_num <- ifelse(df_v2n48$assessmentStrategyMoveOnLatency > 2000, 1, 0)
df_v2n48$assessmentStrategyNoneGenResBoth <- factor(with(df_v2n48, interaction(assessmentStrategyGenerated, assessmentStrategyRestudied)))
df_v2n48$assessmentStrategySkippedSkipped_num <- ifelse(df_v2n48$assessmentStrategyNoneGenResBoth == "skipped.skipped", 1, 0)
df_v2n48$assessmentStrategySkippedRestudied_num <- ifelse(df_v2n48$assessmentStrategyNoneGenResBoth == "skipped.restudied", 1, 0)
df_v2n48$assessmentStrategyGeneratedSkipped_num <- ifelse(df_v2n48$assessmentStrategyNoneGenResBoth == "generated.skipped", 1, 0)
df_v2n48$assessmentStrategyGeneratedRestudied_num <- ifelse(df_v2n48$assessmentStrategyNoneGenResBoth == "generated.restudied", 1, 0)

behavBins <- df_v2n48 %>%
  group_by(prolificId) %>%
  dplyr::summarise(n_restudied = sum(assessmentStrategyRestudied_num, na.rm = TRUE),
                   n_generated = sum(assessmentStrategyGenerated_num, na.rm = TRUE),
                   n_skipped.skipped = sum(assessmentStrategySkippedSkipped_num, na.rm = TRUE),
                   n_skipped.restudied = sum(assessmentStrategySkippedRestudied_num, na.rm = TRUE),
                   n_generated.skipped = sum(assessmentStrategyGeneratedSkipped_num, na.rm = TRUE),
                   n_generated.restudied = sum(assessmentStrategyGeneratedRestudied_num, na.rm = TRUE))

df_v2n48_users <- left_join(df_v2n48_users, behavBins, by="prolificId")



df_v3n36$assessmentStrategyGenerated <- ifelse(df_v3n36$assessmentStrategyRevealLatency > 2000, "generated", "skipped")
df_v3n36$assessmentStrategyRestudied <- ifelse(df_v3n36$assessmentStrategyMoveOnLatency > 2000, "restudied", "skipped")
df_v3n36$assessmentStrategyGenerated_num <- ifelse(df_v3n36$assessmentStrategyRevealLatency > 2000, 1, 0)
df_v3n36$assessmentStrategyRestudied_num <- ifelse(df_v3n36$assessmentStrategyMoveOnLatency > 2000, 1, 0)
df_v3n36$assessmentStrategyNoneGenResBoth <- factor(with(df_v3n36, interaction(assessmentStrategyGenerated, assessmentStrategyRestudied)))
df_v3n36$assessmentStrategySkippedSkipped_num <- ifelse(df_v3n36$assessmentStrategyNoneGenResBoth == "skipped.skipped", 1, 0)
df_v3n36$assessmentStrategySkippedRestudied_num <- ifelse(df_v3n36$assessmentStrategyNoneGenResBoth == "skipped.restudied", 1, 0)
df_v3n36$assessmentStrategyGeneratedSkipped_num <- ifelse(df_v3n36$assessmentStrategyNoneGenResBoth == "generated.skipped", 1, 0)
df_v3n36$assessmentStrategyGeneratedRestudied_num <- ifelse(df_v3n36$assessmentStrategyNoneGenResBoth == "generated.restudied", 1, 0)

behavBins <- df_v3n36 %>%
  group_by(prolificId) %>%
  dplyr::summarise(n_restudied = sum(assessmentStrategyRestudied_num, na.rm = TRUE),
                   n_generated = sum(assessmentStrategyGenerated_num, na.rm = TRUE),
                   n_skipped.skipped = sum(assessmentStrategySkippedSkipped_num, na.rm = TRUE),
                   n_skipped.restudied = sum(assessmentStrategySkippedRestudied_num, na.rm = TRUE),
                   n_generated.skipped = sum(assessmentStrategyGeneratedSkipped_num, na.rm = TRUE),
                   n_generated.restudied = sum(assessmentStrategyGeneratedRestudied_num, na.rm = TRUE))

df_v3n36_users <- left_join(df_v3n36_users, behavBins, by="prolificId")


df_v2n48$assessmentStrategyGenerated <- ifelse(df_v2n48$assessmentStrategyRevealLatency > 2000, "generated", "skipped")
df_v2n48$assessmentStrategyRestudied <- ifelse(df_v2n48$assessmentStrategyMoveOnLatency > 2000, "restudied", "skipped")
df_v2n48$assessmentStrategyGenerated_num <- ifelse(df_v2n48$assessmentStrategyRevealLatency > 2000, 1, 0)
df_v2n48$assessmentStrategyRestudied_num <- ifelse(df_v2n48$assessmentStrategyMoveOnLatency > 2000, 1, 0)
df_v2n48$assessmentStrategyNoneGenResBoth <- factor(with(df_v2n48, interaction(assessmentStrategyGenerated, assessmentStrategyRestudied)))
df_v2n48$assessmentStrategySkippedSkipped_num <- ifelse(df_v2n48$assessmentStrategyNoneGenResBoth == "skipped.skipped", 1, 0)
df_v2n48$assessmentStrategySkippedRestudied_num <- ifelse(df_v2n48$assessmentStrategyNoneGenResBoth == "skipped.restudied", 1, 0)
df_v2n48$assessmentStrategyGeneratedSkipped_num <- ifelse(df_v2n48$assessmentStrategyNoneGenResBoth == "generated.skipped", 1, 0)
df_v2n48$assessmentStrategyGeneratedRestudied_num <- ifelse(df_v2n48$assessmentStrategyNoneGenResBoth == "generated.restudied", 1, 0)

behavBins <- df_v2n48 %>%
  group_by(prolificId) %>%
  dplyr::summarise(n_restudied = sum(assessmentStrategyRestudied_num, na.rm = TRUE),
                   n_generated = sum(assessmentStrategyGenerated_num, na.rm = TRUE),
                   n_skipped.skipped = sum(assessmentStrategySkippedSkipped_num, na.rm = TRUE),
                   n_skipped.restudied = sum(assessmentStrategySkippedRestudied_num, na.rm = TRUE),
                   n_generated.skipped = sum(assessmentStrategyGeneratedSkipped_num, na.rm = TRUE),
                   n_generated.restudied = sum(assessmentStrategyGeneratedRestudied_num, na.rm = TRUE))

df_v2n48_users <- left_join(df_v2n48_users, behavBins, by="prolificId")

## v4n48
df_v4n48$assessmentStrategyGenerated <- ifelse(df_v4n48$assessmentStrategyRevealLatency > 2000, "generated", "skipped")
df_v4n48$assessmentStrategyRestudied <- ifelse(df_v4n48$assessmentStrategyMoveOnLatency > 2000, "restudied", "skipped")
df_v4n48$assessmentStrategyGenerated_num <- ifelse(df_v4n48$assessmentStrategyRevealLatency > 2000, 1, 0)
df_v4n48$assessmentStrategyRestudied_num <- ifelse(df_v4n48$assessmentStrategyMoveOnLatency > 2000, 1, 0)
df_v4n48$assessmentStrategyNoneGenResBoth <- factor(with(df_v4n48, interaction(assessmentStrategyGenerated, assessmentStrategyRestudied)))
df_v4n48$assessmentStrategySkippedSkipped_num <- ifelse(df_v4n48$assessmentStrategyNoneGenResBoth == "skipped.skipped", 1, 0)
df_v4n48$assessmentStrategySkippedRestudied_num <- ifelse(df_v4n48$assessmentStrategyNoneGenResBoth == "skipped.restudied", 1, 0)
df_v4n48$assessmentStrategyGeneratedSkipped_num <- ifelse(df_v4n48$assessmentStrategyNoneGenResBoth == "generated.skipped", 1, 0)
df_v4n48$assessmentStrategyGeneratedRestudied_num <- ifelse(df_v4n48$assessmentStrategyNoneGenResBoth == "generated.restudied", 1, 0)

behavBins <- df_v4n48 %>%
  group_by(prolificId) %>%
  dplyr::summarise(n_restudied = sum(assessmentStrategyRestudied_num, na.rm = TRUE),
                   n_generated = sum(assessmentStrategyGenerated_num, na.rm = TRUE),
                   n_skipped.skipped = sum(assessmentStrategySkippedSkipped_num, na.rm = TRUE),
                   n_skipped.restudied = sum(assessmentStrategySkippedRestudied_num, na.rm = TRUE),
                   n_generated.skipped = sum(assessmentStrategyGeneratedSkipped_num, na.rm = TRUE),
                   n_generated.restudied = sum(assessmentStrategyGeneratedRestudied_num, na.rm = TRUE))

df_v4n48_users <- left_join(df_v4n48_users, behavBins, by="prolificId")


df_v4n48_users$howManyRestudy_bin <- ifelse(df_v4n48_users$howManyRestudy > 10, ">10 restudy", "<10 restudy")
df_v4n48_users$howManyGenerate_bin <- ifelse(df_v4n48_users$howManyGenerate > 10, ">10 generate", "<10 generate")
df_v4n48_users$howManyRestudy_bin_num <- ifelse(df_v4n48_users$howManyRestudy > 10, 1, 0)
df_v4n48_users$howManyGenerate_bin_num <- ifelse(df_v4n48_users$howManyGenerate > 10, 1, 0)
df_v4n48_users$howManyNoneGenResBoth <- factor(with(df_v4n48_users, interaction(howManyGenerate_bin, howManyRestudy_bin)))

# behav proportion bins
df_v2n48_users$avgMoreReveal <- factor(ifelse(df_v2n48_users$avgAssessmentStrategyProportionReveal>.5, 1, 0))
df_v3n36_users$avgMoreReveal <- factor(ifelse(df_v3n36_users$avgAssessmentStrategyProportionReveal>.5, 1, 0))
df_v4n48_users$avgMoreReveal <- factor(ifelse(df_v4n48_users$avgAssessmentStrategyProportionReveal>.5, 1, 0))

behavBins <- df_v4n48 %>%
  group_by(prolificId) %>%
  dplyr::summarise(n_restudied = sum(assessmentStrategyRestudied_num, na.rm = TRUE),
                   n_generated = sum(assessmentStrategyGenerated_num, na.rm = TRUE),
                   n_skipped.skipped = sum(assessmentStrategySkippedSkipped_num, na.rm = TRUE),
                   n_skipped.restudied = sum(assessmentStrategySkippedRestudied_num, na.rm = TRUE),
                   n_generated.skipped = sum(assessmentStrategyGeneratedSkipped_num, na.rm = TRUE),
                   n_generated.restudied = sum(assessmentStrategyGeneratedRestudied_num, na.rm = TRUE))

# reorder variable levels
df_v2n48_users$interventionPrediction <- factor(df_v2n48_users$interventionPrediction, levels = c("generate", "equal", "restudy"))
df_v2n48_users$interventionOutcome <- factor(df_v2n48_users$interventionOutcome, levels = c("generate", "equal", "restudy"))

df_v3n36_users$interventionPrediction <- factor(df_v3n36_users$interventionPrediction, levels = c("generate", "equal", "restudy"))
df_v3n36_users$interventionOutcome <- factor(df_v3n36_users$interventionOutcome, levels = c("generate", "equal", "restudy"))
df_v3n36_users$assessmentBelief <- factor(df_v3n36_users$assessmentBelief, levels = c("generate", "equal", "restudy"))

df_v4n48_users$interventionPrediction <- factor(df_v4n48_users$interventionPrediction, levels = c("generate", "equal", "restudy"))
df_v4n48_users$interventionOutcome <- factor(df_v4n48_users$interventionOutcome, levels = c("generate", "equal", "restudy"))
df_v4n48_users$assessmentBelief <- factor(df_v4n48_users$assessmentBelief, levels = c("generate", "equal", "restudy"))


# REG to numeric
df_v2n48_users$interventionPrediction_num <- ifelse(df_v2n48_users$interventionPrediction =="generate", -1, 
                                                    ifelse(df_v2n48_users$interventionPrediction == "equal", 0, 
                                                           ifelse(df_v2n48_users$interventionPrediction == "restudy", 1, NA)))
df_v2n48_users$interventionOutcome_num <- ifelse(df_v2n48_users$interventionOutcome =="generate", -1, 
                                                 ifelse(df_v2n48_users$interventionOutcome == "equal", 0, 
                                                        ifelse(df_v2n48_users$interventionOutcome == "restudy", 1, NA)))
df_v2n48_users$assessmentBelief_num <- ifelse(df_v2n48_users$assessmentBelief =="generate", -1, 
                                              ifelse(df_v2n48_users$assessmentBelief == "equal", 0, 
                                                     ifelse(df_v2n48_users$assessmentBelief == "restudy", 1, NA)))
df_v3n36_users$interventionPrediction_num <- ifelse(df_v3n36_users$interventionPrediction =="generate", -1, 
                                                    ifelse(df_v3n36_users$interventionPrediction == "equal", 0, 
                                                           ifelse(df_v3n36_users$interventionPrediction == "restudy", 1, NA)))
df_v3n36_users$interventionOutcome_num <- ifelse(df_v3n36_users$interventionOutcome =="generate", -1, 
                                                 ifelse(df_v3n36_users$interventionOutcome == "equal", 0, 
                                                        ifelse(df_v3n36_users$interventionOutcome == "restudy", 1, NA)))
df_v3n36_users$assessmentBelief_num <- ifelse(df_v3n36_users$assessmentBelief =="generate", -1, 
                                              ifelse(df_v3n36_users$assessmentBelief == "equal", 0, 
                                                     ifelse(df_v3n36_users$assessmentBelief == "restudy", 1, NA)))
df_v4n48_users$interventionPrediction_num <- ifelse(df_v4n48_users$interventionPrediction =="generate", -1, 
                                                    ifelse(df_v4n48_users$interventionPrediction == "equal", 0, 
                                                           ifelse(df_v4n48_users$interventionPrediction == "restudy", 1, NA)))
df_v4n48_users$interventionOutcome_num <- ifelse(df_v4n48_users$interventionOutcome =="generate", -1, 
                                                 ifelse(df_v4n48_users$interventionOutcome == "equal", 0, 
                                                        ifelse(df_v4n48_users$interventionOutcome == "restudy", 1, NA)))
df_v4n48_users$assessmentBelief_num <- ifelse(df_v4n48_users$assessmentBelief =="generate", -1, 
                                              ifelse(df_v4n48_users$assessmentBelief == "equal", 0, 
                                                     ifelse(df_v4n48_users$assessmentBelief == "restudy", 1, NA)))


# change beliefs
df_v3n36_users$changeBeliefs <- df_v3n36_users$interventionPrediction != df_v3n36_users$assessmentBelief
df_v4n48_users$changeBeliefs <- df_v4n48_users$interventionPrediction != df_v4n48_users$assessmentBelief

# outcome measures
df_v3n36_users$finalMatchOutcome <- df_v3n36_users$interventionOutcome == df_v3n36_users$assessmentBelief
df_v4n48_users$finalMatchOutcome <- df_v4n48_users$interventionOutcome == df_v4n48_users$assessmentBelief
df_v4n48_users$finalMatchOutcome_num <- ifelse(df_v4n48_users$finalMatchOutcome, 1, 0)

# diff test 2 to test 1
df_v2n48_users$changeTestScore <- df_v2n48_users$assessmentTestScore - df_v2n48_users$interventionTestScore
df_v3n36_users$changeTestScore <- df_v3n36_users$assessmentTestScore - df_v3n36_users$interventionTestScore
df_v4n48_users$changeTestScore <- df_v4n48_users$assessmentTestScore - df_v4n48_users$interventionTestScore

# drop unused factor levels
df_v4n48 <- droplevels(df_v4n48)
df_v4n48_users <- droplevels(df_v4n48_users)


# combine v3v4 to look at aspects of feedback

colnames = names(df_v3n36_users)[names(df_v3n36_users) %in% c("started_datetime", "completed_date_time", "reviewed_at_datetime", "startDateTime", "endDateTime") ==F]

df_v3n36_v4n48_users = union(df_v3n36_users[colnames], df_v4n48_users[colnames])

v3v4factcols <- c("prolificId",
                  "effectivenessRestudy",
                  "chosenStrategy",
                  "directionOfChange",
                  "changeRelativeToOutcome",
                  "feedback")

df_v3n36_v4n48_users[v3v4factcols] <- lapply(df_v3n36_v4n48_users[v3v4factcols], factor)


# subset dfs
df_v4n48_users_control <- filter(df_v4n48_users, condition=="control"); nrow(df_v4n48_users_control)
df_v4n48_users_expt <- filter(df_v4n48_users, condition=="expt"); nrow(df_v4n48_users_expt)
df_v4n48_users_predRoutG <- filter(df_v4n48_users, interventionPrediction=="restudy" & interventionOutcome=="generate"); nrow(df_v4n48_users_predRoutG)

# create dataset for CPA in SPSS
df_v4n48_users_subCPA <- df_v4n48_users[c(
  "condition",                                     # experimental condition (categ: control, expt1, expt2)
  "age",
  "diff_interventionPredictRG",                    # predicted difference restudy-generate (cont: -10 to 10)
  "interventionPrediction",                        # prediction for best strategy (categ: restudy, equal, generate)\
  "diff_interventionTestOutcomeRG",                # actual difference restudy-generate (cont: -10 to 10)
  "interventionOutcome",                           # actual best strategy (categ: restudy, equal, generate)
  "interventionTestScore",                         # total score on intervention test
  "howManyGenerate",                               # DV: number of generate choices (cont: 0-20)
  "assessmentTestScore",                           # DV: final test score (cont: 0-20)
  "diff_assessmentBeliefRG_num",                   # DV: final belief for difference restudy-generate (cont: -1.69 to 1.69)
  "assessmentBelief"                               # DV: final belief for best strategy (categ: restudy, equal, generate)
)]
levels(df_v4n48_users_subCPA$condition) <- c(0,1)
levels(df_v4n48_users_subCPA$interventionPrediction) <- c(0,1,2)
levels(df_v4n48_users_subCPA$interventionOutcome) <- c(0,1,2)
levels(df_v4n48_users_subCPA$assessmentBelief) <- c(0,1,2)
df_v4n48_users_subCPA$diff_interventionPredictRG <- -1 * df_v4n48_users_subCPA$diff_interventionPredictRG
df_v4n48_users_subCPA$diff_interventionTestOutcomeRG <- -1 * df_v4n48_users_subCPA$diff_interventionTestOutcomeRG
df_v4n48_users_subCPA$diff_assessmentBeliefRG_num <- -1 * df_v4n48_users_subCPA$diff_assessmentBeliefRG_num
names(df_v4n48_users_subCPA) <- c("group01", "age", "predictN", "predictC", "outcomeN", "outcomeC", "quiz1", "numGenSR", "quiz2", "beliefN", "beliefC")
write.csv(df_v4n48_users_subCPA,fs::path(dir_data, "Katie_v4n48_CPA.csv"), row.names = FALSE)

