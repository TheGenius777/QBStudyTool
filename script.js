async function searchQB() {
    const answer = document.getElementById("answerInput").value.trim();

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

    // Get results
    const response = await fetch(url);
    const data = await response.json();

    console.log(data);

    const resultsDiv = document.getElementById("results");

    resultsDiv.innerHTML = "";

    // Normalize searched answer
    const searchedAnswer = answer.toLowerCase().trim();

    // This contains the material that will eventually go to the AI
    let aiText = "";

    // Add some basic context
    aiText += "ANSWERLINE: " + answer + "\n\n";

    // This will contain:
    // - all tossups
    // - only relevant bonus parts
    let questions = [];

    // =========================
    // TOSSUPS
    // =========================

    if (questionType === "tossup" || questionType === "all") {

        const tossups = data.tossups?.questionArray || [];

        tossups.forEach(function(tossup, index) {

            questions.push({
                type: "tossup",
                question: tossup
            });

            // Add tossup to AI text
            aiText +=
                "TOSSUP " + (index + 1) + ":\n" +
                (tossup.question_sanitized ||
                 tossup.question ||
                 "") +
                "\n\n";
        });
    }

    // =========================
    // BONUSES
    // =========================

    if (questionType === "bonus" || questionType === "all") {

        const bonuses = data.bonuses?.questionArray || [];

        let relevantBonusNumber = 1;

        bonuses.forEach(function(bonus) {

            // Look through every answer in the bonus
            for (let i = 0; i < bonus.answers_sanitized.length; i++) {

                const bonusAnswer =
                    bonus.answers_sanitized[i].toLowerCase();

                // Only include the bonus part if its
                // individual answerline matches the search
                if (bonusAnswer.includes(searchedAnswer)) {

                    questions.push({
                        type: "bonus",
                        bonus: bonus,
                        partIndex: i
                    });

                    // Add ONLY the relevant bonus part to AI text
                    aiText +=
                        "RELEVANT BONUS " +
                        relevantBonusNumber +
                        ":\n" +
                        (bonus.parts_sanitized[i] ||
                         bonus.parts[i] ||
                         "") +
                        "\nANSWER: " +
                        (bonus.answers_sanitized[i] ||
                         bonus.answers[i] ||
                         "") +
                        "\n\n";

                    relevantBonusNumber++;
                }
            }
        });
    }

    // =========================
    // SHOW AI TEXT IN CONSOLE
    // =========================

    console.log("========== AI INPUT ==========");
    console.log(aiText);
    console.log("========== END AI INPUT ==========");

    // =========================
    // NO RESULTS
    // =========================

    if (questions.length === 0) {
        resultsDiv.innerHTML = "<p>No questions found.</p>";
        return;
    }

    // =========================
    // DISPLAY RESULTS
    // =========================

    questions.forEach(function(item) {

        const questionDiv = document.createElement("div");

        // =========================
        // TOSSUP
        // =========================

        if (item.type === "tossup") {

            const question = item.question;

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
        // RELEVANT BONUS PART
        // =========================

        else if (item.type === "bonus") {

            const bonus = item.bonus;
            const i = item.partIndex;

            const setName =
                bonus.set && bonus.set.name
                    ? bonus.set.name
                    : "Unknown";

            const packetNumber =
                bonus.packet && bonus.packet.number
                    ? bonus.packet.number
                    : "Unknown";

            questionDiv.innerHTML =
                "<hr>" +

                "<p><strong>Bonus:</strong> " +
                bonus.leadin_sanitized +
                "</p>" +

                "<p>" +
                bonus.parts_sanitized[i] +
                "</p>" +

                "<strong>Answer: " +
                bonus.answers_sanitized[i] +
                "</strong>" +

                "<p><small>" +
                "Source: " +
                setName +
                " — Packet " +
                packetNumber +
                "</small></p>";
        }

        resultsDiv.appendChild(questionDiv);
    });
}
