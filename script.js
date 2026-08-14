async function searchQB() {
    const answer = document.getElementById("answerInput").value;
    const difficultyOptions = document.getElementById("difficulty");
    const difficulties = Array.from(difficultyOptions.selectedOptions)
        .map(option => option.value);

    if (!answer) {
        alert("Please enter an answerline.");
        return;
    }

    let url =
    "https://www.qbreader.org/api/query" +
    "?q=" + encodeURIComponent(answer) +
    "&searchType=answer" +
    "&questionType=all";

    if (difficulties.length > 0) {
    url += "&difficulties=" + difficulties.join(",");
    }    

    const response = await fetch(url);
    const data = await response.json();

    const resultsDiv = document.getElementById("results");

    resultsDiv.innerHTML = "";

    const questions = [
        ...data.tossups.questionArray,
        ...data.bonuses.questionArray
    ];

    if (questions.length === 0) {
        resultsDiv.innerHTML = "<p>No questions found.</p>";
        return;
    }

    questions.forEach(question => {
    const questionDiv = document.createElement("div");

    questionDiv.innerHTML = `
        <hr>
        <p>${question.question || ""}</p>
        <strong>Answer: ${question.answer_sanitized || question.answer || "Unknown"}</strong>
    `;

    resultsDiv.appendChild(questionDiv);
    });
}
