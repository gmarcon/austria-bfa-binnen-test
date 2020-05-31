const statuses = {
   QUIZ: 0,
   CHECKEDQUIZ: 1,
   ALLQUESTIONS: 2,
   ALLANSWERS: 3,
}
var status;

// Fisher–Yates shuffle algorithm for an array:
function shuffle(array) {
    var m = array.length, t, i;
    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

// When loading, generate the questionnaire:
$(document).ready(function() {
    createNewQuiz();
});

function createNewQuiz() {
    // Clone array of all answers:
    forty_questions = [...questions];
    // Shuffle:
    shuffle(forty_questions);
    // Select first forty questions:
    forty_questions = forty_questions.slice(0,40);
    // Create quiz HTML code::
    createForm();
    // set status:
    status = statuses.QUIZ;
}

// Create HTML code for selected questions:
function createForm() {
    // Hide list of questions with answers:
    form = $('form[name="allquestions"]');
    form.addClass('d-none');
    // Create list of questions:
    form = $('form[name="questions"]');
    form.removeClass('d-none');
    form.html('');
    $.each(forty_questions, function(question_idx, o){
        questionHtml = '';
        questionHtml += '<h4>' + o.question + '</h4>';
        if(o.image)
            questionHtml += `<img src="${o.image}" style="max-width: 400px; max-height: 200px;">`;
        $.each(o.answers, function(answer_idx, o) {
            questionHtml += `<div class="btn-group-toggle" data-toggle="buttons"><label class="btn btn-light" for="${question_idx}-${answer_idx}"><input type="checkbox" name="${question_idx}-${answer_idx}" value="${o.correct}">${o.answer.slice(0,2)}</label><span id="${question_idx}-${answer_idx}-text">${o.answer.slice(2)}</span></div>`;
        });
        form.append(questionHtml);
    })
}

// Check answers:
function checkAnswers() {
    button_html = $('button[name="checkButton"]');
    if(status == statuses.QUIZ) {
        correct_answers = 0;
        $.each(forty_questions, function(question_idx, o){
            correct = true;
            $.each(o.answers, function(answer_idx, o) {
                checkbox = $(`input[name=${question_idx}-${answer_idx}]`);
                label = $(`span[id=${question_idx}-${answer_idx}-text]`);
                if(checkbox[0].checked.toString() == checkbox[0].value) {
                    label.removeClass('bg-danger')
                } else {
                    correct = false;
                    label.addClass('bg-danger')
                }
            });
            if(correct)
                correct_answers++;
        })
        button_html.html('Prüfung ausblenden');
        if(correct_answers>=32) {
            $('span[name="results"]').html(`${correct_answers}/${forty_questions.length} correct answers!`);
            $('span[name="results"]').removeClass('text-danger');
            $('span[name="results"]').addClass('text-success');
        }
        else {
            $('span[name="results"]').html(`${correct_answers}/${forty_questions.length} correct answers!`);
            $('span[name="results"]').removeClass('text-success');
            $('span[name="results"]').addClass('text-danger');
        }
        button_html.html('Prüfung ausblenden');
        status = statuses.CHECKEDQUIZ;
    } else if(status == statuses.CHECKEDQUIZ) {
        // Remove all markers after a check:
        $.each(forty_questions, function(question_idx, o){
            $.each(o.answers, function(answer_idx, o) {
                label = $(`span[id=${question_idx}-${answer_idx}-text]`);
                label.removeClass('bg-danger')
            });
        });
        button_html.html('Prüfen');
        $('span[name="results"]').html('');
        status = statuses.QUIZ;
    }
}

// All questions with answers:
function allAnswers() {
    // Hide current quiz:
    form = $('form[name="questions"]');
    form.addClass('d-none');
    // Create list of questions with answers:
    form = $('form[name="allquestions"]');
    form.html('');
    form.removeClass('d-none');
    $.each(questions, function(question_idx, o){
        questionHtml = ''
        questionHtml += '<h2>' + o.question + '</h2>';
        $.each(o.answers, function(answer_idx, o) {
            questionHtml += `<div class="form-check"><input class="form-check-input" type="checkbox" name="all-${question_idx}-${answer_idx}" value="${o.correct}" ${o.correct ? 'checked' : ''}><label class="form-check-label" for="all-${question_idx}-${answer_idx}">${o.answer}</label></div>`;
        });
        if(o.image)
            questionHtml += `<img src="${o.image}" style="max-width: 400px; max-height: 200px;">`
            form.append(questionHtml);
    });
    status = statuses.ALLQUESTIONS;
}

// Generate answers matrix:
function answersMatrix() {
    // Hide current quiz:
    form = $('form[name="questions"]');
    form.addClass('d-none');
    // Create list of questions with answers:
    form = $('form[name="allquestions"]');
    form.html('');
    form.removeClass('d-none');
    // Loop through all questions and answers to build answer matrix:
    last_question_idx = 0;
    last_letter = '';
    answers_matrix = new Array(4);
    for(i=0; i<4; i++)
        answers_matrix[i] = new Array(questions.length);
    html_output = $('form[name="allquestions"]');
    html_output.html('');
    $.each(questions, function(question_idx, o){
        if(o.question[0] !== last_letter) {
            if(last_letter !== '') {
                html_table = `<h1>${last_letter}</h1>`;
                html_table += '<table border="1" bordercolor="black" cellspacing="0" cellpadding="1">';
                html_table += '<tr><td></td>';
                for(j=last_question_idx;j<question_idx;j++)
                    html_table += `<td>${j - last_question_idx + 1}</td>`;
                html_table += '</tr>';
                for(i=0;i<4;i++) {
                    html_table += '<tr>';
                    html_table += `<td>${String.fromCharCode(65+i)}</td>`;
                    for(j=last_question_idx;j<question_idx;j++)
                        if(answers_matrix[i][j])
                            html_table += '<td>X</td>';
                        else
                            html_table += '<td></td>';
                    html_table += '</tr>';
                }
                html_table += '</table>';
                html_output.append(html_table);
            }
            last_letter = o.question[0];
            last_question_idx = question_idx;
        }
        $.each(o.answers, function(answer_idx, o) {
            answers_matrix[answer_idx][question_idx] = o.correct;
        })
    });
    status = statuses.ALLANSWERS;
}


function backToQuiz() {
    // Create list of questions with answers:
    form = $('form[name="allquestions"]');
    form.addClass('d-none');
    // Show current quiz:
    form = $('form[name="questions"]');
    form.removeClass('d-none');
    status = statuses.QUIZ;
}