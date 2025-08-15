document.addEventListener('DOMContentLoaded', function () {
    const questions = [
        { label: "1. Quelle est la capitale de la France ?", name: "question1" },
        { label: "2. 2 + 2 = ?", name: "question2" },
        { label: "3. Quelle est la couleur du ciel par temps clair ?", name: "question3" },
        { label: "4. Quelle est la capitale de l'Espagne ?", name: "question4" },
        { label: "5. 3 + 5 = ?", name: "question5" },
        { label: "6. Quelle est la couleur de l'herbe ?", name: "question6" }
    ];

    const timers = [30, 30, 30, 30, 30, 30]; // 30s par question
    let currentStep = 0;
    let timerInterval;
    let answers = {};

    // ✅ Récupération correcte des données utilisateur depuis localStorage
    const flgUser = JSON.parse(localStorage.getItem('flg_user') || '{}');
    const userName = flgUser.fullname || '';
    const userEmail = flgUser.email || '';
    const userEntreprise = flgUser.school || '';

    emailjs.init("28zek8TTk_3Xtue1u"); // Remplace par ton vrai User ID EmailJS si besoin

    const examForm = document.getElementById('exam-form');
    const sendExamBtn = document.getElementById('send-exam-btn');
    const finalStepDiv = document.getElementById('final-step');

    // Sécurité : vérifier les éléments du DOM
    if (!examForm || !sendExamBtn || !finalStepDiv) {
        console.error("Un ou plusieurs éléments du DOM sont manquants.");
        return;
    }

    // Injecte les questions dans le DOM
    questions.forEach((q, idx) => {
        const div = document.createElement('div');
        div.className = 'question-step';
        div.id = 'step-' + idx;
        div.style.display = 'none';
        div.innerHTML = `
            <div class="form-group">
                <label for="${q.name}">${q.label}</label>
                <input type="text" class="form-control" id="${q.name}">
            </div>
            <div class="mb-2">Temps restant : <span class="timer" id="timer-${idx}"></span></div>
            <button type="button" class="btn btn-primary" onclick="submitAnswer(${idx})">Valider</button>
            <button type="button" class="btn btn-secondary" onclick="skipStep(${idx})">Passer</button>
        `;
        examForm.appendChild(div);
    });

    // Valider une réponse
    window.submitAnswer = function (step) {
        const input = document.getElementById(questions[step].name);
        if (input) {
            answers[questions[step].name] = input.value.trim();
        }
        nextStep();
    };

    // Passer une question
    window.skipStep = function (step) {
        answers[questions[step].name] = "";
        nextStep();
    };

    // Affiche une étape donnée
    function showStep(step) {
        clearInterval(timerInterval);
        document.querySelectorAll('.question-step').forEach((el, idx) => {
            el.style.display = idx === step ? 'block' : 'none';
        });
        if (step < questions.length) {
            startTimer(step);
        }
    }

    // Lance le timer pour une question
    function startTimer(step) {
        let timeLeft = timers[step];
        const timerDisplay = document.getElementById('timer-' + step);
        timerDisplay.textContent = timeLeft + "s";
        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft + "s";
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                nextStep();
            }
        }, 1000);
    }

    // Passe à la question suivante
    function nextStep() {
        if (currentStep < questions.length - 1) {
            currentStep++;
            showStep(currentStep);
        } else {
            clearInterval(timerInterval);
            examForm.style.display = 'none';
            finalStepDiv.style.display = 'block';
        }
    }

    // Envoi via EmailJS
    sendExamBtn.onclick = function () {
        const templateParams = {
            user_name: userName,
            user_email: userEmail,
            user_entreprise: userEntreprise,
            question1: answers.question1 || "",
            question2: answers.question2 || "",
            question3: answers.question3 || "",
            question4: answers.question4 || "",
            question5: answers.question5 || "",
            question6: answers.question6 || ""
        };

        emailjs.send('service_hoahirm', 'template_1b4k9hq', templateParams)
            .then(() => {
                document.body.innerHTML = `
                    <div class="container mt-5 text-center">
                        <h2>Merci !</h2>
                        <p>Votre examen a bien été envoyé.<br>Vous pouvez fermer cette page.</p>
                    </div>
                `;
            })
            .catch(error => {
                alert('Erreur lors de l\'envoi : ' + JSON.stringify(error));
            });
    };

    // Démarrer avec la première question
    showStep(0);
});
