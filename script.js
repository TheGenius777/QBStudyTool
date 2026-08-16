async function searchQB() {
    const answer = document.getElementById("answerInput").value;

    if (!answer) {
        alert("Please enter an answerline.");
        return;
    }

    // Get selected difficulties
    const checkboxes = document.querySelectorAll("#difficulty input");

    const difficulties = [];

    checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            difficulties.push(checkbox.value);
        }
    });

    // Get selected categories
    const categoryCheckboxes = document.querySelectorAll("#category input");

    const categories = [];

    categoryCheckboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            categories.push(checkbox.value);
        }
    });

    // Get question type
    const questionType = document.querySelector(
        "#questionType input:checked"
    ).value;

    // Build QBReader URL
    let url =
        "https://www.qbreader.org/api/query" +
        "?q=" + encodeURIComponent(answer) +
        "&searchType=answer" +
        "&questionType=" + questionType;

    // Difficulty filter
    if (difficulties.length > 0) {
        url += "&difficulties=" + difficulties.join(",");
    }

    // Category filter
    if (categories.length > 0) {
        url += "&categories=" + categories.join(",");
    }

    // Year filter
    const startYear = document.getElementById("startYear").value;
    const endYear = document.getElementById("endYear").value;

    if (startYear) {
        url += "&minYear=" + startYear;
    }

    if (endYear) {
        url += "&maxYear=" + endYear;
    }

    console.log("Searching:", url);

    // Get results from QBReader
    const response = await fetch(url);
    const data = await response.json();

    console.log(data);

    const resultsDiv = document.getElementById("results");

    resultsDiv.innerHTML = "";

    // Collect questions
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

    // No results
    if (questions.length === 0) {
        resultsDiv.innerHTML = "<p>No questions found.</p>";
        return;
    }

    // Display questions
    questions.forEach(function(question) {

        const questionDiv = document.createElement("div");

        // DEBUG: show packet information in console
        console.log("SET:", question.set);
        console.log("PACKET:", question.packet);

        // =========================
        // TOSSUP
        // =========================

        if (question.question) {

            const setName =
                question.set && question.set.name
                    ? question.set.name
                    : "Unknown";

            const packetNumber =
                question.packet && question.packet.number
                    ? question.packet.number
                    : "Unknown";

            questionDiv.innerHTML =
                "<hr>" +
                "<p>" + question.question + "</p>" +

                "<strong>Answer: " +
                (question.answer_sanitized ||
                 question.answer ||
                 "Unknown") +
                "</strong>" +

                "<p><small>" +
                "Source: " +
                setName +
                " — Packet " +
                packetNumber +
                "</small></p>";
        }

        // =========================
        // BONUS
        // =========================

        else if (question.leadin) {

            const setName =
                question.set && question.set.name
                    ? question.set.name
                    : "Unknown";

            const packetNumber =
                question.packet && question.packet.number
                    ? question.packet.number
                    : "Unknown";

            let bonusHTML =
                "<hr>" +
                "<p><strong>Bonus:</strong> " +
                question.leadin +
                "</p>";

            for (let i = 0; i < question.parts.length; i++) {

                bonusHTML +=
                    "<p><strong>" +
                    (i + 1) +
                    ".</strong> " +
                    question.parts[i] +
                    "</p>" +

                    "<strong>Answer: " +
                    question.answers_sanitized[i] +
                    "</strong>";
            }

            bonusHTML +=
                "<p><small>" +
                "Source: " +
                setName +
                " — Packet " +
                packetNumber +
                "</small></p>";

            questionDiv.innerHTML = bonusHTML;
        }

        resultsDiv.appendChild(questionDiv);
    });
}
