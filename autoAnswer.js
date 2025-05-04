let answerKey = {};

fetch(chrome.runtime.getURL('answers.json'))
  .then(response => response.json())
  .then(data => {
    answerKey = Object.fromEntries(
      Object.entries(data).map(([question, answers]) => [
        normalizeQuestion(question),
        answers.map(a => normalizeWhitespace(a))
      ])
    );
    waitUntilRendered();
  });

function normalizeWhitespace(text) {
  return text
    .replace(/\u00A0/g, ' ')
    .replace(/\u202F/g, ' ') 
    .replace(/\u200B/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeQuestion(text) {
  return normalizeWhitespace(
    text
      .replace(/[\s\u00A0\u202F\u200B]*[-–—]?\s*please.*$/i, '')
      .replace(/\s*\([\s\S]*?\)$/i, '')
  );
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
      labelText = labelText.trim();
      labelText = normalizeWhitespace(labelText.replace(/^[a-z]\.\s*/i, ''));

      if (correctAnswers.some(ans => normalizeWhitespace(ans) === labelText)) {
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
