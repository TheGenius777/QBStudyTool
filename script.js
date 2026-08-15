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

    const categoryCheckboxes = document.querySelectorAll("#category input");

const categories = [];

categoryCheckboxes.forEach(function(checkbox) {
    if (checkbox.checked) {
        categories.push(checkbox.value);
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

    if (categories.length > 0) {
    url += "&categories=" + categories.join(",");
}

const startYear = document.getElementById("startYear").value;
const endYear = document.getElementById("endYear").value;

if (startYear) {
    url += "&minYear=" + startYear;
}

if (endYear) {
    url += "&maxYear=" + endYear;
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
        let bonusHTML =
            "<hr>" +
            "<p><strong>Bonus:</strong> " + question.leadin + "</p>";

        for (let i = 0; i < question.parts.length; i++) {
            bonusHTML +=
                "<p><strong>" + (i + 1) + ".</strong> " +
                question.parts[i] + "</p>" +
                "<strong>Answer: " +
                question.answers_sanitized[i] +
                "</strong>";
        }

        questionDiv.innerHTML = bonusHTML;
    }

    resultsDiv.appendChild(questionDiv);
});
}
