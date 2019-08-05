
/*
TODO
Once I'm done testing
- Add feedback collection
- check for duplicate prolificIds, so it doesn't overwrite data in database
- add database rules! If I include a path in my prolific id, I can overwrite data
- add 5 little dots that countdown so people know it's working?
- check to see that the first item presented is really 5 seconds
- progress bar for each round of 20 words
- giving credit for plural
- clean up this file...
- collect start/end times for duration
- collect individual word accuracy data during study and test
- update conditions!
- change the trial order to be experiment specific?
- decide trial duration (study vs. strategy vs. test)
*/

// access and get a reference to the Firebase database service
var db = firebase.database();

// ## Helper functions

// Shows slides. 
function showSlide(id) {
    $(".slide").hide(); // Hide all slides
    $("#"+id).show();   // Show just the slide we want to show
}

// Get a random integer less than n.
function randomInteger(n) {
  return Math.floor(Math.random()*n);
}

// Fisher-Yates (aka Knuth) Shuffle (https://github.com/coolaj86/knuth-shuffle)
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (currentIndex > 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex --;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}


function validateProlificId() {
  var prolificId = $("#prolificId").val();
  if (prolificId == "") {
    alert("Prolific ID cannot be blank");
    return false;
  } else {
    return true;
  }
}

/*
TODO want to check for duplicate Prolific IDs to prevent overwrites
The fn as written doesn't work because async processing leads fn not to evaluate sequentially
Need to implement some kind of callback

// ref.child("users").orderByChild("ID").equalTo("U1EL5623").once("value",snapshot => {
//     if (snapshot.exists()){
//       const userData = snapshot.val();
//       console.log("exists!", userData);
//     }
// });

// //every user must have an email
// firebase.database().ref(`users/${userId}/email`).once("value", snapshot => {
//    if (snapshot.exists()){
//       console.log("exists!");
//       const email = snapshot.val();
//     }
// });

function validateProlificId() {
  var prolificId = $("#prolificId").val();
  // var ref = db.ref("users/");
  var ref = db.ref(`users/${prolificId}`);
  console.log("I'm before the snapshot")
  returnval = false;
  ref.once("value", snapshot => {
    if (prolificId == "") {
      console.log("I'm in the blank")
      alert("Prolific ID cannot be blank");
      returnval= false;
    } else if (snapshot.exists()){
      console.log("I'm in the duplicate")
      alert("Duplicate Prolific ID. If you have already participated in this experiment, you cannot participate again. If you think you are seeing this message in error, please contact the researcher.");
      returnval= false;
    } else {
      console.log("I'm in the else")
      returnval= true;
    }
  });
  console.log(returnval);
  // ref.once("value")
  //   .then(function(snapshot) { // get a snapshot of the value at "users/"
  //     var prolificIdExists = snapshot.child(prolificId).exists(); // boolean
  //     if (prolificId == "") {
  //       console.log("I'm in the blank")
  //       alert("Prolific ID cannot be blank");
  //       return false;
  //     } else if (prolificIdExists) {
  //       console.log("I'm in the duplicate")
  //       alert("Duplicate Prolific ID. If you have already participated in this experiment, you cannot participate again. If you think you are seeing this message in error, please contact the researcher.");
  //       return false;
  //     } else {
  //       console.log("I'm in the else")
  //       return true;
  //     }
  //   });
  console.log("I'm past the snapshot")
  return returnval;
}
*/

// ## Interact with database

// Create a new user, with all columns that will have to be populated
function createNewUser(prolificId, startDateTime) {
  db.ref('users/' + prolificId).set({
    prolificId: prolificId,
    startDateTime: startDateTime.toISOString(),
    endDateTime: "", 
    feedback : ""
  });
}

function updateUserFeedback(prolificId, feedback) {
  db.ref('users/' + prolificId).update({
    feedback : feedback
  });
}

function updateUserEndDateTime(prolificId, endDateTime) {
  db.ref('users/' + prolificId).update({
    endDateTime : endDateTime.toISOString()
  });
}

// When you start a new session, create all items, with all the columns that will have to be populated
function createNewItem(prolificId, itemIndex) {
  db.ref('items/' + prolificId + "_" + itemIndex).set({
    prolificId: prolificId,
    itemIndex: itemIndex,
    studyOrder: "",
    strategyOrder: "",
    strategy: "",
    revealLatency: "",
    moveOnLatency: "",
    testOrder: "",
    testAccuracy: "",
    userInput: ""
  });
}

function updateItemStudyData(prolificId, itemIndex, studyOrder){
  db.ref('items/' + prolificId + "_" + itemIndex).update({
    studyOrder: studyOrder
  });
}

function updateItemStrategyData(prolificId, itemIndex, strategyOrder){
  db.ref('items/' + prolificId + "_" + itemIndex).update({
    strategyOrder: strategyOrder
  });
}

function updateItemStrategyTypeData(prolificId, itemIndex, strategy){
  db.ref('items/' + prolificId + "_" + itemIndex).update({
    strategy: strategy
  });
}

function updateItemStrategyRevealData(prolificId, itemIndex, revealLatency){
  db.ref('items/' + prolificId + "_" + itemIndex).update({
    revealLatency: revealLatency,
  });
}

function updateItemStrategyMoveOnData(prolificId, itemIndex, moveOnLatency){
  db.ref('items/' + prolificId + "_" + itemIndex).update({
    moveOnLatency: moveOnLatency
  });
}

function updateItemTestData(prolificId, itemIndex, testOrder){
  db.ref('items/' + prolificId + "_" + itemIndex).update({
    testOrder: testOrder
  });
}

function updateItemTestAccuracyData(prolificId, itemIndex, testAccuracy, userInput){
  db.ref('items/' + prolificId + "_" + itemIndex).update({
    testAccuracy: testAccuracy,
    userInput: userInput
  });
}

// ## Configuration settings
var numTrials = 4,
  /* test intervention with first numTrials items, in case need to re-test people */
  // numTrials = 20, // testing
  trialDuration = 5000,
  feedbackDuration = 2000, 
  bgcolor = "white",
  /* toggle test 1 or 2 strategy rounds */
  numStrategyRounds = 1;
  /* toggle number of conditions */
  // condition = randomInteger(4), // 2x2
  // condition = randomInteger(2), // expt vs. control
  condition = 2, // fixed to expt?
  myTrialOrder = shuffle([...Array(numTrials).keys()]),
  /* toggle intervention/assessment trials to test intervention */
  // interventionTrials = myTrialOrder.slice(0),
  // assessmentTrials = [],
  /* toggle intervention/assessment trials to test assessment */
  // interventionTrials = [],
  // assessmentTrials = myTrialOrder.slice(0),
  /* test intervention with last numTrials items */
  /* test intervention with the first (slice) items */
  // myTrialOrder = shuffle([...Array(40).keys()].slice(0,3)),
  /* full intervention with all 40 */
  interventionTrials = myTrialOrder.slice(0,(numTrials/2)),
  assessmentTrials = myTrialOrder.slice((numTrials/2), numTrials),
  swahili_english_pairs = [
    ["adhama", "honor"],
    ["adui", "enemy"],
    ["bustani", "garden"],
    ["buu", "maggot"],
    ["chakula", "food"],
    ["dafina", "treasure"],
    ["elimu", "science"],
    ["embe", "mango"],
    ["fagio", "broom"],
    ["farasi", "horse"],
    ["fununu", "rumour"],
    ["godoro", "mattress"],
    ["goti", "knee"],
    ["hariri", "silk"],
    ["kaa", "crab"],
    ["kaburi", "grave"],
    ["kaputula", "shorts"],
    ["leso", "scarf"],
    ["maiti", "corpse"],
    ["malkia", "queen"],
    ["mashua", "boat"],
    ["ndoo", "bucket"],
    ["nyanya", "tomato"],
    ["pazia", "curtain"],
    ["pipa", "barrel"],
    ["pombe", "beer"],
    ["punda", "donkey"],
    ["rembo", "ornament"],
    ["roho", "soul"],
    ["sala", "prayer"],
    ["sumu", "poison"],
    ["tabibu", "doctor"],
    ["theluji", "snow"],
    ["tumbili", "monkey"],
    ["usingizi", "sleep"],
    ["vuke", "steam"],
    ["yai", "egg"],
    ["zeituni", "olives"],
    ["ziwa", "lake"],
    ["zulia", "carpet"]
  ];

// Show the instructions slide -- this is what we want subjects to see first.
showSlide("getProlificId");

// ## The main event
/* I implement the sequence as an object with properties and methods. The benefit of encapsulating everything in an object is that it's conceptually coherent (i.e. the <code>data</code> variable belongs to this particular sequence and not any other) and allows you to **compose** sequences to build more complicated experiments. For instance, if you wanted an experiment with, say, a survey, a reaction time test, and a memory test presented in a number of different orders, you could easily do so by creating three separate sequences and dynamically setting the <code>end()</code> function for each sequence so that it points to the next. **More practically, you should stick everything in an object and submit that whole object so that you don't lose data (e.g. randomization parameters, what condition the subject is in, etc). Don't worry about the fact that some of the object properties are functions -- mmturkey (the Turk submission library) will strip these out.*/
var experiment = {
  prolificID: "",
  // Properties
  numTrials: numTrials,
  numStrategyRounds: numStrategyRounds,
  condition: condition,
  myTrialOrder: myTrialOrder, // already shuffled
  trialDuration: trialDuration,
  feedbackDuration: feedbackDuration,
  // interventionTrials is the first half of myTrialOrder
  interventionStudyTrials: shuffle(interventionTrials.slice(0)), // study order
  interventionStrategyTrials1: shuffle(interventionTrials.slice(0)), // strategy order 1
  interventionStrategyTrials2: shuffle(interventionTrials.slice(0)), // strategy order 2
  interventionRestudyTrials: interventionTrials.slice((interventionTrials.length/2), interventionTrials.length),
  interventionGenerateTrials: interventionTrials.slice(0,(interventionTrials.length/2)),
  interventionTestTrials: shuffle(interventionTrials.slice(0)), // test order
  // assessmentTrials is the second half of myTrialOrder
  assessmentStudyTrials: shuffle(assessmentTrials.slice(0)),
  // assessmentStrategyTrials: assessmentTrials.slice(0),
  // TOGGLE for pilot latency vs. assessment
  assessmentChoiceTrials: shuffle(assessmentTrials.slice(0)),
  assessmentChoiceTrialsSave: [],
  // assessmentChoiceTrials: assessmentTrials.slice(0,assessmentTrials.length/3),
  // assessmentRestudyTrials: assessmentTrials.slice(assessmentTrials.length/3,(assessmentTrials.length/3*2)),
  // assessmentGenerateTrials: assessmentTrials.slice((assessmentTrials.length/3*2), assessmentTrials.length),
  // assessmentChoiceTrialsSave: [],
  // assessmentRestudyTrialsSave: [],
  // assessmentGenerateTrialsSave: [],
  assessmentTestTrials: shuffle(assessmentTrials.slice(0)),
  // aggregate scores and outcomes
  interventionRestudyStrategyScore: Array(numStrategyRounds).fill(0),
  interventionGenerateStrategyScore: Array(numStrategyRounds).fill(0),
  predictionRestudy: -1,
  predictionGenerate: -1,
  interventionRestudyTestScore: 0,
  interventionGenerateTestScore: 0,
  assessmentStudyOrderCounter: 0,
  assessmentStrategyOrderCounter: 0,
  assessmentTestOrderCounter: 0,
  // An array to store the item-level data that we're collecting.
  interventionStrategyData: [],
  interventionTestData: [],
  assessmentStrategyData: [],
  assessmentTestData: [],

  // Instructions
  instructions: function() {
    if (validateProlificId()){
      experiment.prolificId = $("#prolificId").val();
      var startDateTime = new Date();
      createNewUser(experiment.prolificId, startDateTime);
      for (i=0; i<experiment.myTrialOrder.length; i++) {
        createNewItem(experiment.prolificId, experiment.myTrialOrder[i]);
      }
      /* toggle instructions slide */
      // showSlide("instructionsLatency");
      showSlide("instructionsExpt");
    }
  },

  //Intro to study
  interventionStudyFraming: function() { 
    var header = "Word Pairs";
    var text = "In a moment, you will be presented with 20 Swahili words paired with \
    their English translations. You will see each Swahili-English word pair \
    for 5 seconds, and then the screen will automatically advance to the \
    next pair. Please pay attention, and study each pair so you can type \
    the English translation given the Swahili word.\
    <br><br>Please make sure you understand these instructions before you begin.";
    showSlide("textNext");
    $("#instructionsHeader").text(header);
    $("#instructionsText").text(text);
    $("#nextButton").click(function(){$(this).blur(); experiment.interventionStudy();});
    console.log($("#instructionsText").text());
  },

  // 20 items, View each item for 5 sec
  interventionStudy: function() {
    var trials = experiment.interventionStudyTrials;
    if (trials.length == 0) {
      experiment.interventionStrategyFraming(1);
      return;
    }
    var currItem = parseInt(trials.shift()),
      swahili = swahili_english_pairs[currItem][0],
      english = swahili_english_pairs[currItem][1];

    showSlide("study");
    $("#wordpair").text(swahili + " : " + english);
    setTimeout(function(){experiment.interventionStudy()}, trialDuration);
  },

  //Intro to strategy
  interventionStrategyFraming: function(round) {
    if (round == 1) {
      /* Toggle for one or two strategy rounds */
      var header = "Study Strategies";
      // var header = "Study - Round 1";
      var text = "Now you will be asked to study each Swahili-English word pair either by (1) \
                reviewing the English translation by copying it into the textbox, or (2) trying to \
                recall the English translation from memory. After 5 seconds, \
                the screen will automatically advance and save your input. For the cases that you \
                try to recall the translation from memory, you will get to see the correct answer. If you were \
                correct, the answer will be green, if incorrect, the answer will be red.";
    } else if (round == 2) {
      var header = "Study Strategies - Round 2";
      var text = "Now, you will be asked to study each Swahili-English word pair again, \
                either by (1) \
                reviewing the English translation by copying it into the textbox, or (2) trying to \
                recall the English translation from memory. For each word pair, if you copied \
                in the first study round, you will be asked to copy again; if you tried to recall in the \
                first study round, you will be asked to recall again. After 5 seconds,\
                the screen will automatically advance and save your input. For the cases that you \
                try to recall the translation from memory, you will get to see the correct answer. If you were \
                correct, the answer will be green, if incorrect, the answer will be red.";
    }
    showSlide("textNext");
    $("#instructionsHeader").text(header);
    $("#instructionsText").text(text);
    $("#nextButton").click(function(){$(this).blur(); experiment.interventionStrategy(round);});
    console.log($("#instructionsText").text());
  },

  //Apply strategy to each item for 5 sec 1/2 copy 1/2 generate (randomize)
  interventionStrategy: function(round) {
    console.log("interventionStrategyTrials1: ", experiment.interventionStrategyTrials1);
    console.log("interventionStrategyTrials2: ", experiment.interventionStrategyTrials2);
    if (round == 1) {
      var trials = experiment.interventionStrategyTrials1;
      if (trials.length == 0) {
        if (numStrategyRounds == 1){experiment.interventionPredict();
        } else if (numStrategyRounds == 2) {experiment.interventionStrategyFraming(2);
        } return;
      } 
    } else if (round == 2) {
      var trials = experiment.interventionStrategyTrials2;
      if (trials.length == 0) {experiment.interventionPredict(); return;} 
    }
    var currItem = parseInt(trials.shift()),
      swahili = swahili_english_pairs[currItem][0],
      english = swahili_english_pairs[currItem][1],
      generateItem = ($.inArray(currItem, experiment.interventionGenerateTrials) != -1),
      restudyItem = ($.inArray(currItem, experiment.interventionRestudyTrials) != -1);

    if (generateItem) {
      showSlide("generate");
      $("#swahili").text(swahili + " : ");
      $("#generatedWord").val('');
      $("#generatedWord").focus();
      setTimeout(function(){
        $("#generatedForm").submit(experiment.captureWord("interventionStrategy", round, currItem, swahili, english));
      }, trialDuration-feedbackDuration); 
    } else if (restudyItem) {
      showSlide("restudy");
      $("#restudyWordpair").text(swahili + " : " + english);
      $("#restudySwahili").text(swahili + " : ");
      $("#restudiedWord").val('');
      $("#restudiedWord").focus();
      setTimeout(function(){
        //changed this to restudiedForm...I think the previous was a typo. check this.
        $("#restudiedForm").submit(experiment.captureWord("interventionStrategy", round, currItem, swahili, english));
      }, trialDuration); 
    }
  },

  //show feedback
  interventionGenerateFeedback: function(round, swahili, english, accuracy) {
    $("#feedback").show();
    $("#feedback").text(swahili + " : " + english);
    if (accuracy == 1){
      $("#feedback").css("color", "green");
    } else {
      $("#feedback").css("color", "red");
    }
    setTimeout(function(){
      $("#feedback").hide();
      experiment.interventionStrategy(round);}, feedbackDuration); 
  },

  // Capture and save trial
  captureWord: function(exptPhase, round, currItem, swahili, english) {
    var generatedWord = $("#generatedWord").val().toLowerCase(),
      restudiedWord = $("#restudiedWord").val().toLowerCase(),
      generateItem = ($.inArray(currItem, experiment.assessmentGenerateTrialsSave) != -1),
      restudyItem = ($.inArray(currItem, experiment.assessmentRestudyTrialsSave) != -1);
      choiceItem = ($.inArray(currItem, experiment.assessmentChoiceTrialsSave) != -1);

    if (generateItem){
      strategy = "generate";
    } else if (restudyItem){
      strategy = "restudy";
    } else if (choiceItem) {
      strategy = "free choice";
    }

    if (exptPhase == "interventionStrategy"){
      if (restudyItem){
        var userInput = restudiedWord;
      } else if (generateItem) {
        var userInput = generatedWord;
      }
    } else {
      var userInput = generatedWord;
    }

    var accuracy = english == userInput ? 1 : 0,
      data = {
        exptPhase: exptPhase,
        strategy: strategy,
        item: currItem,
        swahili: swahili,
        english: english,
        userInput: userInput,
        accuracy: accuracy
      };

    if (exptPhase == "interventionStrategy"){
      if (generateItem){
        experiment.interventionGenerateStrategyScore[round-1] += accuracy;
        experiment.interventionGenerateFeedback(round, swahili, english, accuracy);
      } else if (restudyItem){
        experiment.interventionRestudyStrategyScore[round-1] += accuracy;
        experiment.interventionStrategy(round);
      } 
      experiment.interventionStrategyData.push(data);
    } else if (exptPhase == "interventionTest"){
      if (generateItem){
        experiment.interventionGenerateTestScore += accuracy;
      } else if (restudyItem){
        experiment.interventionRestudyTestScore += accuracy;
      } 
      experiment.test(exptPhase);
      experiment.interventionTestData.push(data);
    } else if (exptPhase == "assessmentTest"){
      updateItemTestAccuracyData(experiment.prolificId, currItem, accuracy, userInput);
      experiment.test(exptPhase);
      experiment.assessmentTestData.push(data);
    }

    return false; // stop form from being submitted
  },

  // ask for prediction
  interventionPredict: function() {
    // if (randomInteger(2)){ } // randomize order (if so, match on feedback slide)
    var firstPredictionText = `For 10 of these Swahili-English word pairs, you studied using  
    the <b>review</b> strategy--you reviewed the English translation by copying it 
    into the textbox. Out of these 10, how many English translations do you 
    think you’ll remember on the quiz?`;
    
    var secondPredictionText = `For 10 of these Swahili-English word pairs, you studied using 
    the <b>recall</b> strategy--you tried to recall the English translation 
    from memory. Out of these 10, how many English translations do you 
    think you’ll remember on the quiz?`;
    
    showSlide("predictNext");
    $("#firstPredictionText").html(firstPredictionText);
    $("#secondPredictionText").html(secondPredictionText);
    $("#predictNextButton").click(function(){$(this).blur(); 
      $("#predictionForm").submit(experiment.validatePredictionForm());
    })
  },

  validatePredictionForm: function(){
    var firstPrediction = parseInt($("#firstPrediction").val()),
      secondPrediction = parseInt($("#secondPrediction").val());
    if (!(firstPrediction && secondPrediction)) { //empty
      alert("Please make a prediction from 0 to 10");
      return false;
    } else if ( firstPrediction < 0 || firstPrediction > 10 ||
                secondPrediction < 0 || secondPrediction > 10){
      alert("Please make a prediction from 0 to 10");
      return false; 
    } else {
      experiment.capturePrediction(firstPrediction, secondPrediction);
    }
  },

  capturePrediction: function(firstPrediction, secondPrediction) {
    experiment.predictionRestudy = firstPrediction;
    experiment.predictionGenerate = secondPrediction;
    experiment.interventionTestFraming();
    // experiment.end();
    return false;
  },

  /*
  “Now, you will be shown each Swahili word again. You’ll have 10 seconds to type the 
  correct English translation.”
  */
  interventionTestFraming: function() {
    var header = "Quiz"
    var text = "Let's see what you learned! Next, you will be shown each Swahili word again.\
      You’ll have 5 seconds to type the correct English translation. After 5 seconds,\
      the screen will automatically advance and save your input."
    showSlide("textNext");
    $("#instructionsHeader").text(header);
    $("#instructionsText").text(text);
    $("#nextButton").click(function(){$(this).blur(); experiment.test("interventionTest");});
    console.log($("#instructionsText").text());
  },


  // (All items rote for trialDuration sec, +/- feedback on each item)
  test: function(exptPhase) {
    if (exptPhase == "interventionTest") {
      var trials = experiment.interventionTestTrials;
      if (trials.length == 0) {experiment.interventionFeedback(); return;} 
    } else if (exptPhase == "assessmentTest") {
      var trials = experiment.assessmentTestTrials;
      if (trials.length == 0) {experiment.end(); return;} 
    }

    // Get the current trial - <code>shift()</code> removes the first element of the array and returns it.
    var currItem = parseInt(trials.shift()),
      swahili = swahili_english_pairs[currItem][0],
      english = swahili_english_pairs[currItem][1];

    if (exptPhase == "assessmentTest") {
      experiment.assessmentTestOrderCounter += 1;
      updateItemTestData(experiment.prolificId, currItem, experiment.assessmentTestOrderCounter);
    }

    showSlide("generate");
    $("#swahili").text(swahili + " : ");
    $("#generatedWord").val('');
    $("#generatedWord").focus();

    // Wait 5 seconds before starting the next trial.
    setTimeout(function(){$("#generatedForm").submit(
      experiment.captureWord(exptPhase, 0, currItem, swahili, english));
    }, trialDuration); 
  },

  /*
  No strategy feedback: summative performance outcome
  “You scored a __ / 20!”

  Strategy feedback: Proof of utility
  “You scored a __ / 20!
  When using the recall strategy, you scored __ /10
  When using the review strategy, you scored __ /10
  */
  interventionFeedback: function() {
    var text = `You scored ${experiment.interventionGenerateTestScore + experiment.interventionRestudyTestScore} / 20. 
    <br><br> On the items that you studied by <b>reviewing</b> the Swahili-English word pair, you scored 
    ${experiment.interventionRestudyTestScore} /10. 
    <br><br> On the items that you studied by tring to <b>recall</b> the 
    English translation from memory, you scored ${experiment.interventionGenerateTestScore} /10.`
    showSlide("feedbackNext");
    $("#feedbackText").html(text);
    // TOGGLE THIS TO GO TO ASSESSMENT/END
    $("#feedbackNextButton").click(function(){$(this).blur(); experiment.assessmentFraming()});
    // $("#feedbackNextButton").click(function(){$(this).blur(); experiment.end()});
  },

  assessmentFraming: function() {
    var header = "Second half";
    var text = "Congrats! You have completed the first half of the activity. \
    Now, you will learn the second set of 20 Swahili-English word pairs. \
    You will go through the same 3 stages of (1) seeing the word pairs, \
    (2) applying study strategies, and (3) taking a short quiz. <br><br>\
    This time, you will be free to apply whatever study strategies you choose.";
    showSlide("textNext");
    $("#instructionsHeader").text(header);
    $("#instructionsText").html(text);
    $("#nextButton").click(function(){$(this).blur(); experiment.assessmentStudyFraming();});
    console.log($("#instructionsText").text());
  }

  // intro to assessment study
  assessmentStudyFraming: function() {
    var header = "Word Pairs";
    var text = "In a moment, you will be presented with 20 Swahili words paired with \
    their English translations. You will see each Swahili-English word pair \
    for 5 seconds, and then the screen will automatically advance to the \
    next pair. Please pay attention, and study the pair so you can type \
    the English translation given the Swahili word.\
    <br><br>Please make sure you understand these instructions before you begin.";
    showSlide("textNext");
    $("#instructionsHeader").text(header);
    $("#instructionsText").html(text);
    $("#nextButton").click(function(){$(this).blur(); experiment.assessmentStudy();});
    console.log($("#instructionsText").text());
  },

  // 20 items, View each item for 5 sec
  assessmentStudy: function() {
    var trials = experiment.assessmentStudyTrials;
    if (trials.length == 0) {
      experiment.assessmentStrategyFraming();
      return;
    }

    var currItem = parseInt(trials.shift()),
      swahili = swahili_english_pairs[currItem][0],
      english = swahili_english_pairs[currItem][1];

    experiment.assessmentStudyOrderCounter += 1;
    updateItemStudyData(experiment.prolificId, currItem, experiment.assessmentStudyOrderCounter);

    showSlide("study");
    $("#wordpair").text(swahili + " : " + english);
    setTimeout(function(){experiment.assessmentStudy()}, trialDuration);
  },

  assessmentStrategyFraming: function() {
    var header = "Study Strategies";
    var text = "Next, you will study the 20 Swahili-English word pairs. \
    For each pair, you will be shown the Swahili word. You can click 'See Translation' \
    to see the English Translation. Then, you can click 'Move On' to move on to the \
    next word pair. If you don't click the buttons, the screens will automatically \
    advance after 5 seconds."
    /*var text = "Next, you will study the 20 Swahili-English word pairs. \
    For each pair, you will be shown the Swahili word. You can click 'See Translation' \
    to see the English Translation. Then, you can click 'Move On' to move on to the \
    next word pair. If you don't click the buttons, the screens will automatically \
    advance after 5 seconds. \
    <br><br> The 24 word pairs will be split into three sets of eight. You will be asked to use a \
    different study strategy for each set."*/
    showSlide("textNext");
    $("#instructionsHeader").html(header);
    $("#instructionsText").html(text);
    $("#nextButton").click(function(){$(this).blur(); 
      experiment.assessmentStrategyLatencyReveal("assessmentChoice");});
  },

  /* capture latency data */
  captureTime: function(exptPhase, strategy, currItem, swahili, english, startTime, endTime){
    var latency = endTime - startTime;
    if (strategy =="assessmentChoice") {
      var strategyAbbrev = "C";
    } else if (strategy == "assessmentRestudy") {
      var strategyAbbrev = "R";   
    } else if (strategy == "assessmentGenerate") {
      var strategyAbbrev = "G";
    }

    updateItemStrategyTypeData(experiment.prolificId, currItem, strategyAbbrev);

    if (exptPhase == "assessmentStrategyLatencyReveal"){
      updateItemStrategyRevealData(experiment.prolificId, currItem, latency);
    } else if (exptPhase == "assessmentStrategyLatencyMoveOn"){
      updateItemStrategyMoveOnData(experiment.prolificId, currItem, latency);
    }
  },

  /*Then, you will have 5 seconds to study each pair using whatever method you would like. */
  // assessmentChoiceFraming: function() {
  //   var header = "Set 1 of 3: Free Study";
  //   var text = "Please study these 8 Swahili-English word pairs <b>using whatever \
  //   study method you would like</b>.\
  //   <br><br>Please make sure you understand these instructions before you begin."
  //   showSlide("textNext");
  //   $("#instructionsHeader").html(header);
  //   $("#instructionsText").html(text);
  //   $("#nextButton").click(function(){$(this).blur(); 
  //     experiment.assessmentStrategyLatencyReveal("assessmentChoice");
  //   });
  // },

  // assessmentRestudyFraming: function() {
  //   var header = "Set 2 of 3: Study by Review";
  //   var text = "Please study these 8 Swahili-English word pairs by <b>quickly revealing the English Translation\
  //   and reviewing it</b>.\
  //   <br><br>Please make sure you understand these instructions before you begin."
  //   showSlide("textNext");
  //   $("#instructionsHeader").html(header);
  //   $("#instructionsText").html(text);
  //   $("#nextButton").click(function(){$(this).blur(); 
  //     experiment.assessmentStrategyLatencyReveal("assessmentRestudy");
  //   });
  // },

  // assessmentGenerateFraming: function() {
  //   var header = "Set 3 of 3: Study by Recall";
  //   var text = "Finally, please study these 8 Swahili-English word pairs by <b>trying to recall the \
  //   English translation from memory before revealing it</b>.\
  //   <br><br>Please make sure you understand these instructions before you begin."
  //   showSlide("textNext");
  //   $("#instructionsHeader").html(header);
  //   $("#instructionsText").html(text);
  //   $("#nextButton").click(function(){$(this).blur(); 
  //     experiment.assessmentStrategyLatencyReveal("assessmentGenerate");
  //   });
  // },

  assessmentStrategyLatencyReveal: function(stratType) {
    if (stratType == "assessmentChoice") {
      var trials = experiment.assessmentChoiceTrials;
      // toggle for latency pilot vs. assessment
      // if (trials.length == 0) {experiment.assessmentRestudyFraming(); return;} 
      if (trials.length == 0) {experiment.assessmentTestFraming(); return;} 
    } // should never be triggered in intervention expt
      else if (stratType == "assessmentRestudy") {
      var trials = experiment.assessmentRestudyTrials;
      if (trials.length == 0) {experiment.assessmentGenerateFraming(); return;} 
    } // should never be triggered in intervention expt
    else if (stratType == "assessmentGenerate") {
      var trials = experiment.assessmentGenerateTrials;
      if (trials.length == 0) {experiment.assessmentTestFraming(); return;} 
    }

    var currItem = parseInt(trials.shift()),
      swahili = swahili_english_pairs[currItem][0],
      english = swahili_english_pairs[currItem][1];

    experiment.assessmentStrategyOrderCounter += 1;
    //experiment.assessmentData.strategyOrder[currItem] = experiment.assessmentStrategyOrderCounter;
    updateItemStrategyData(experiment.prolificId, currItem, experiment.assessmentStrategyOrderCounter);

    if (stratType == "assessmentChoice") {
      experiment.assessmentChoiceTrialsSave.push(currItem);
    } else if (stratType == "assessmentRestudy") {
      experiment.assessmentRestudyTrialsSave.push(currItem);      
    } else if (stratType == "assessmentGenerate") {
      experiment.assessmentGenerateTrialsSave.push(currItem);
    }

    // start, and get startTime for RT
    showSlide("choiceSeeTranslation");
    $("#swahiliCue").text(swahili + " : ");
    $("#englishAnswer").css("color", bgcolor).text(Array(english.length+1).join("x"));
    var startTime = (new Date()).getTime(),
      endTime = startTime + trialDuration;

    //auto advance
    var myTimeout = setTimeout(function(){
      $("#seeTranslation").click();
    }, trialDuration); 

    //on button click, get endTime
    $("#seeTranslation").unbind();
    $("#seeTranslation").click( 
      function(){
        endTime = (new Date()).getTime();
        clearTimeout(myTimeout);
        $(this).blur();
        experiment.captureTime("assessmentStrategyLatencyReveal", stratType, currItem, swahili, english, startTime, endTime);
        experiment.assessmentStrategyLatencyMoveOn(stratType, currItem, swahili, english)});
  },

  assessmentStrategyLatencyMoveOn: function(stratType, currItem, swahili, english){

    //capture the timeout in the next slide
    showSlide("choiceNextWordPair");
    $("#swahiliCue2").text(swahili + " : ");
    $("#englishAnswer2").text(english);
    var startTime = (new Date()).getTime(),
      endTime = startTime + trialDuration;

    //auto advance
    var myTimeout = setTimeout(function(){
      $("#nextWordPair").click();
    }, trialDuration); 

    //on button click, get endTime
    $("#nextWordPair").unbind();
    $("#nextWordPair").click( 
      function(){
        endTime = (new Date()).getTime();
        clearTimeout(myTimeout);
        $(this).blur(); 
        experiment.captureTime("assessmentStrategyLatencyMoveOn", stratType, currItem, swahili, english, startTime, endTime);
        experiment.assessmentStrategyLatencyReveal(stratType)});
  },

  /*
  “Now, you will be shown each Swahili word again. You’ll have 10 seconds to type the 
  correct English translation.”
  */
  assessmentTestFraming: function() {
    var header = "Quiz"
    var text = "Let's see what you learned! Next, you will be shown each Swahili word again.\
      You’ll have 5 seconds to type the correct English translation. After 5 seconds,\
      the screen will automatically advance and save your input."
    showSlide("textNext");
    $("#instructionsHeader").text(header);
    $("#instructionsText").text(text);
    $("#nextButton").click(function(){$(this).blur(); experiment.test("assessmentTest");});
  },

  // The function that gets called when the sequence is finished.
  end: function() {
    var endDateTime = new Date();
    updateUserEndDateTime(experiment.prolificId, endDateTime);
    // Show the finish slide.
    showSlide("end");
    // Wait 1.5 seconds and then execute function
  }
}
