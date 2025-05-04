let answerKey = {};

fetch(chrome.runtime.getURL('answers.json'))
  .then(response => response.json())
  .then(data => {
    answerKey = data;
    waitUntilRendered();
  });
  
  function normalizeQuestion(text) {
    return text
      .replace(/\s*[-–—]\s*Please.*$/i, '')
      .replace(/\s*\([\s\S]*?\)$/i, '')
      .replace(/Please.*$/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }  
  
function autoAnswer() {
    const questions = document.querySelectorAll('div.que');
    if (!questions.length) return false;

    questions.forEach(question => {
        const qTextEl = question.querySelector('.qtext');
        if (!qTextEl) return;

        const rawText = qTextEl.innerText.trim();
        const qText = normalizeQuestion(rawText);
        const correctAnswers = answerKey[qText];
        if (!correctAnswers) return;

        question.querySelectorAll('div.answer input[type=checkbox], div.answer input[type=radio]').forEach(input => {
        const label = input.closest('label') || input.closest('div');
        if (!label) return;

        let labelText = label.innerText || '';
        labelText = labelText.replace(/^[a-z]\.\s*/i, '').trim();

        if (correctAnswers.includes(labelText)) {
            input.checked = true;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
        });
    });

    return true;
}

function waitUntilRendered(retries = 20) {
    const ok = autoAnswer();
    if (!ok && retries > 0) setTimeout(() => waitUntilRendered(retries - 1), 500);
}

window.addEventListener('load', () => waitUntilRendered());