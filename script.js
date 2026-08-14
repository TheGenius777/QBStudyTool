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

    let url =
        "https://www.qbreader.org/api/query" +
        "?q=" + encodeURIComponent(answer) +
        "&searchType=answer" +
        "&questionType=all";

    if (difficulties.length > 0) {
        url += "&difficulties=" + difficulties.join(",");
    }

    console.log("Searching:", url);

    const response = await fetch(url);
    const data = await response.json();

    console.log(data);

    const resultsDiv = document.getElementById("results");

    resultsDiv.innerHTML = "";

    const questions = [
        ...(data.tossups?.questionArray || [])
    ].filter(function(question) {
        return question && question.question;
    });

    if (questions.length === 0) {
        resultsDiv.innerHTML = "<p>No questions found.</p>";
        return;
    }

    questions.forEach(function(question) {
        const questionDiv = document.createElement("div");

        questionDiv.innerHTML =
            "<hr>" +
            "<p>" + question.question + "</p>" +
            "<strong>Answer: " +
            (question.answer_sanitized || question.answer || "Unknown") +
            "</strong>";

        resultsDiv.appendChild(questionDiv);
    });
}
