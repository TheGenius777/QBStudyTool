async function searchQB() {
    const answer = document.getElementById("answerInput").value;

    if (!answer) {
        alert("Please enter an answerline.");
        return;
    }

    const checkboxes = document.querySelectorAll("#difficulty input");

    const difficulties = [];

    checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            difficulties.push(checkbox.value);
        }
    });

    const questionType = document.querySelector(
    "#questionType input:checked"
    ).value;

    let url =
    "https://www.qbreader.org/api/query" +
    "?q=" + encodeURIComponent(answer) +
    "&searchType=answer" +
    "&questionType=" + questionType;

    if (difficulties.length > 0) {
        url += "&difficulties=" + difficulties.join(",");
    }

    console.log("Searching:", url);

    const response = await fetch(url);
    const data = await response.json();

    console.log(data);

    const resultsDiv = document.getElementById("results");

    resultsDiv.innerHTML = "";

    let questions = [];

    if (questionType === "tossup") {
        questions = [
            ...(data.tossups?.questionArray || [])
        ];
    }

    else if (questionType === "bonus") {
        questions = [
            ...(data.bonuses?.questionArray || [])
        ];
    }

    else {
        questions = [
        ...(data.tossups?.questionArray || []),
        ...(data.bonuses?.questionArray || [])
        ];
    }

    if (questions.length === 0) {
        resultsDiv.innerHTML = "<p>No questions found.</p>";
        return;
    }

    questions.forEach(function(question) {
    const questionDiv = document.createElement("div");

    if (question.question) {
        // Tossup
        questionDiv.innerHTML =
            "<hr>" +
            "<p>" + question.question + "</p>" +
            "<strong>Answer: " +
            (question.answer_sanitized || question.answer || "Unknown") +
            "</strong>";
    }

    else if (question.leadin) {
        // Bonus
        questionDiv.innerHTML =
            "<hr>" +
            "<p>" + question.leadin + "</p>" +
            "<strong>Bonus Answers: " +
            (question.answers_sanitized || question.answers || "Unknown") +
            "</strong>";
    }

    resultsDiv.appendChild(questionDiv);
});
}
