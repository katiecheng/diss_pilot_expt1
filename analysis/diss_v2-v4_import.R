dir_proj <- here::here(); dir_proj
dir_data <- fs::path(dir_proj, "data")

df_v1n6 = read_csv(fs::path(dir_data, "2019-10-04_diss-pilot-expt1_df-users-items_v1n6.csv"), col_names=TRUE)
df_v2n48 = read_csv(fs::path(dir_data, "2019-10-31_diss-pilot-expt1_df-users-items_v2n48.csv"), col_names=TRUE)
df_v2n48_users = read_csv(fs::path(dir_data, "2019-10-31_diss-pilot-expt1_df-users-items_v2n48_users.csv"), col_names=TRUE)
df_v3n36 = read_csv(fs::path(dir_data, "2019-11-01_diss-pilot-expt1_df-users-items_v3n36.csv"), col_names=TRUE)
df_v3n36_users = read_csv(fs::path(dir_data, "2019-11-01_diss-pilot-expt1_df-users-items_v3n36_users_withQual.csv"), col_names=TRUE)

## v4n48
df_v4n48 = read_csv(fs::path(dir_data, "2020-02-07_diss-pilot-expt1_df-users-items_v4n48.csv"), col_names=TRUE)
df_v4n48_users = read_csv(fs::path(dir_data, "2020-02-07_diss-pilot-expt1_df-users-items_v4n48_users_withQual.csv"), col_names=TRUE)

# drop returned
df_v2n48_users <- filter(df_v2n48_users, status!="RETURNED"); nrow(df_v2n48_users) # 50
df_v3n36_users <- filter(df_v3n36_users, status!="RETURNED"); nrow(df_v3n36_users) # 37
df_v2n48 <- filter(df_v2n48, status!="RETURNED")
df_v3n36 <- filter(df_v3n36, status!="RETURNED")

## v4n48
df_v4n48_users <- filter(df_v4n48_users, status!="RETURNED" & status!="TIMED-OUT"); nrow(df_v4n48_users) # 48
df_v4n48 <- filter(df_v4n48, status!="RETURNED" & status!="TIMED-OUT")


# Create new dfs  # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

#TODO fix so no error; upon import, treating all text areas as factors instead of character vectors

v2FactCols <- c("prolificId",
                "effectivenessRestudy",
                "effectivenessGenerate", 
                "chosenStrategy", 
                "effectivenessChosenStrategy", 
                "effort", 
                "assessmentBelief")

v2NumCols <- c("age",
               "reviewed_at_datetime",
               "effectivenessRestudy_num", 
               "effectivenessGenerate_num", 
               "diff_assessmentBeliefRG_num", 
               "effectivenessChosenStrategy_num")

v3FactCols <- c("prolificId",
                "effectivenessRestudy",
                "effectivenessGenerate", 
                "chosenStrategy", 
                "effectivenessChosenStrategy", 
                "effort", 
                "assessmentBelief", 
                "directionOfChange", 
                "changeRelativeToOutcome")

v3NumCols <- c("age",
               "reviewed_at_datetime",
               "effectivenessRestudy_num", 
               "effectivenessGenerate_num", 
               "diff_assessmentBeliefRG_num", 
               "effectivenessChosenStrategy_num", 
               "directionOfChange_num", 
               "changeRelativeToOutcome_num")

v4FactCols_users <- c("prolificId",
                      "overallBetterWorseSame",
                      "noticedStrategy",
                      "effectivenessRestudy", 
                      "effortRestudy",
                      "effectivenessGenerate", 
                      "effortGenerate",
                      "chosenStrategy", 
                      "effectivenessChosenStrategy", 
                      "effortChosenStrategy",
                      "effort", 
                      "assessmentBelief", 
                      "directionOfChange", 
                      "changeRelativeToOutcome")

v4FactCols_items <- c("prolificId",
                      "effectivenessRestudy", 
                      "effortRestudy",
                      "effectivenessGenerate", 
                      "effortGenerate",
                      "chosenStrategy", 
                      "effectivenessChosenStrategy", 
                      "effortChosenStrategy",
                      "effort", 
                      "assessmentBelief", 
                      "directionOfChange", 
                      "changeRelativeToOutcome")

v4NumCols <- c("age",
               "reviewed_at_datetime",
               "effectivenessRestudy_num", 
               "effortRestudy_num",
               "howManyRestudy",
               "effectivenessGenerate_num", 
               "effortGenerate_num",
               "howManyGenerate",
               "diff_assessmentBeliefRG_num", 
               "effectivenessChosenStrategy_num", 
               "effortChosenStrategy_num",
               "effort_num",
               "directionOfChange_num", 
               "changeRelativeToOutcome_num")


df_v2n48_users[v2FactCols] <- lapply(df_v2n48_users[v2FactCols], factor)
df_v2n48_users[v2NumCols] <- lapply(df_v2n48_users[v2NumCols], as.numeric)
#df_v2n48_users[,v2FactCols] <- as.factor(NA)
#df_v2n48_users[,v2NumCols] <- as.numeric(NA)
df_v2n48[v2FactCols] <- lapply(df_v2n48[v2FactCols], factor)
df_v2n48[v2NumCols] <- lapply(df_v2n48[v2NumCols], as.numeric)
#df_v2n48[,v2FactCols] <- as.factor(NA)
#df_v2n48[,v2NumCols] <- as.numeric(NA)

df_v3n36_users[v3FactCols] <- lapply(df_v3n36_users[v3FactCols], factor)
df_v3n36_users[v3NumCols] <- lapply(df_v3n36_users[v3NumCols], as.numeric)
df_v3n36[v3FactCols] <- lapply(df_v3n36[v3FactCols], factor)
df_v3n36[v3NumCols] <- lapply(df_v3n36[v3NumCols], as.numeric)

## v4n48
df_v4n48_users[v4FactCols_users] <- lapply(df_v4n48_users[v4FactCols_users], factor)
df_v4n48_users[v4NumCols] <- lapply(df_v4n48_users[v4NumCols], as.numeric)
df_v4n48[v4FactCols_items] <- lapply(df_v4n48[v4FactCols_items], factor)
df_v4n48[v4NumCols] <- lapply(df_v4n48[v4NumCols], as.numeric)
#df_v2n48_users[,v4FactCols] <- as.factor(NA)
#df_v2n48_users[,v4NumCols] <- as.numeric(NA)
#df_v2n48[,v4FactCols] <- as.factor(NA)
#df_v2n48[,v4NumCols] <- as.numeric(NA)

# drop excluded  # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# calculate summary stats across group for exclusion

## v2n48
m_restudyScore_v2n48 <- mean(df_v2n48_users$interventionStrategyRestudyScoreRound1, na.rm=T); m_restudyScore_v2n48 # 8.7
s_restudyScore_v2n48 <- sd(df_v2n48_users$interventionStrategyRestudyScoreRound1, na.rm=T); s_restudyScore_v2n48 # 2

## v3n36
m_restudyScore_v3n36 <- mean(df_v3n36_users$interventionStrategyRestudyScoreRound1, na.rm=T); m_restudyScore_v3n36 # 8.7
s_restudyScore_v3n36 <- sd(df_v3n36_users$interventionStrategyRestudyScoreRound1, na.rm=T); s_restudyScore_v3n36 # 2

## v4n48
m_restudyScore_v4n48 <- mean(df_v4n48_users$interventionStrategyRestudyScoreRound1, na.rm=T); m_restudyScore_v4n48 # 9.4
s_restudyScore_v4n48 <- sd(df_v4n48_users$interventionStrategyRestudyScoreRound1, na.rm=T); s_restudyScore_v4n48 # 1.05

# drop at user level (restudyScore 3 SD below mean)

df_v2n48_users <- filter(df_v2n48_users, interventionStrategyRestudyScoreRound1 >= m_restudyScore_v2n48 - 3*s_restudyScore_v2n48); nrow(df_v2n48_users) # 48

df_v3n36_users <- filter(df_v3n36_users, interventionStrategyRestudyScoreRound1 >= m_restudyScore_v3n36 - 3*s_restudyScore_v3n36); nrow(df_v3n36_users) # 34

## v4n48
df_v4n48_users <- filter(df_v4n48_users, interventionStrategyRestudyScoreRound1 >= m_restudyScore_v4n48 - 3*s_restudyScore_v4n48); nrow(df_v4n48_users) # 47


# drop at item level
df_v2n48 <- filter(df_v2n48, prolificId %in% df_v2n48_users$prolificId); nrow(df_v2n48)/40
df_v3n36 <- filter(df_v3n36, prolificId %in% df_v3n36_users$prolificId); nrow(df_v3n36)/40
df_v4n48 <- filter(df_v4n48, prolificId %in% df_v4n48_users$prolificId); nrow(df_v4n48)/40
