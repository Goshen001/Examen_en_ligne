document.addEventListener('DOMContentLoaded', function() {
    // Questions de l'examen
    const questions = [
        { label: "1. Quelle est la capitale de la France ?", name: "question1" },
        { label: "2. 2 + 2 = ?", name: "question2" },
        { label: "3. Quelle est la couleur du ciel par temps clair ?", name: "question3" }
    ];
    const timers = [30, 30, 30]; // secondes par question
    let currentStep = 0;
    let timerInterval;
    let answers = {};
    let userName = localStorage.getItem('user_name') || '';
    let userEmail = localStorage.getItem('user_email') || '';

    // Initialisation EmailJS
    emailjs.init("28zek8TTk_3Xtue1u");

    // Générer le formulaire des questions
    const examForm = document.getElementById('exam-form');
    questions.forEach((q, idx) => {
        const div = document.createElement('div');
        div.className = 'question-step';
        div.id = 'step-' + idx;
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

    // Exposer les fonctions pour les boutons
    window.submitAnswer = function(step) {
        let input = document.getElementById(questions[step].name);
        answers[questions[step].name] = input.value;
        nextStep();
    }
    window.skipStep = function(step) {
        answers[questions[step].name] = "";
        nextStep();
    }

    function showStep(step) {
        clearInterval(timerInterval);
        document.querySelectorAll('.question-step').forEach((el, idx) => {
            el.classList.toggle('active', idx === step);
        });
        if (step < questions.length) {
            startTimer(step);
        }
    }

    function startTimer(step) {
        let timeLeft = timers[step];
        let timerDisplay = document.getElementById('timer-' + step);
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

    function nextStep() {
        if (currentStep < questions.length - 1) {
            currentStep++;
            showStep(currentStep);
        } else {
            examForm.style.display = 'none';
            document.getElementById('final-step').style.display = 'block';
        }
    }

    // Envoi EmailJS
    document.getElementById('send-exam-btn').onclick = function() {
        // Préparer les données à envoyer
        const templateParams = {
            user_name: userName,
            user_email: userEmail,
            question1: answers.question1 || "",
            question2: answers.question2 || "",
            question3: answers.question3 || ""
        };
        emailjs.send('service_hoahirm', 'template_1b4k9hq', templateParams)
            .then(function() {
                alert('Examen envoyé avec succès !');
                document.body.innerHTML = `
    <div class="container mt-5 text-center">
        <h2>Merci !</h2>
        <p>Votre examen a bien été envoyé.<br>Vous pouvez fermer cette page.</p>
    </div>
`;
            }, function(error) {
                alert('Erreur lors de l\'envoi : ' + JSON.stringify(error));
            });
    };

    // Démarrer à la première question
    showStep(0);
});